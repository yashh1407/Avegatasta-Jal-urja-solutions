import { NextResponse, NextRequest } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { createDecipheriv, scryptSync } from 'crypto';

const ENCRYPTION_KEY = 'smtp-settings-key-please-use-env';
const ALGORITHM = 'aes-256-cbc';

function decryptPassword(encrypted: string): string {
  const buffer = Buffer.from(encrypted, 'base64');
  const salt = buffer.slice(0, 32);
  const iv = buffer.slice(32, 48);
  const encryptedText = buffer.slice(48);
  const key = scryptSync(ENCRYPTION_KEY, salt, 32);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM smtp_settings LIMIT 1');

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No SMTP settings configured' }, { status: 400 });
    }

    const settings = (rows as any)[0];

    if (!settings.enabled) {
      return NextResponse.json({ error: 'SMTP settings are disabled' }, { status: 400 });
    }

    // Decrypt password
    const decryptedPassword = decryptPassword(settings.password_encrypted);

    // Import nodemailer dynamically to test
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.default.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.port === 465,
      auth: {
        user: settings.username,
        pass: decryptedPassword,
      },
    });

    // Test connection by verifying
    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: 'SMTP connection test successful',
    });
  } catch (err: any) {
    console.error('SMTP test error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to test SMTP connection' },
      { status: 500 }
    );
  }
}
