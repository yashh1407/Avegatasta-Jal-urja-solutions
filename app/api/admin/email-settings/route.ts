import { NextResponse, NextRequest } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Simple encryption/decryption helper (TODO: move to proper vault)
const ENCRYPTION_KEY = 'smtp-settings-key-please-use-env'; // Should be in env var in production
const ALGORITHM = 'aes-256-cbc';

function encryptPassword(password: string): string {
  const iv = randomBytes(16);
  const salt = randomBytes(32);
  const key = scryptSync(ENCRYPTION_KEY, salt, 32);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(password);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // Return base64 encoded: salt + iv + encrypted
  return Buffer.concat([salt, iv, encrypted]).toString('base64');
}

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

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM smtp_settings LIMIT 1');

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(null);
    }

    const settings = (rows as any)[0];
    // Don't send encrypted password to frontend
    const { password_encrypted, ...safeSettings } = settings;
    return NextResponse.json(safeSettings);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch SMTP settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const body = await request.json();

    const { host, port, username, password, from_email, from_name, enabled } = body;

    // Check if settings exist first
    const [existing] = await pool.query('SELECT id, password_encrypted FROM smtp_settings');
    const existingSettings = existing as Array<{ id: number; password_encrypted: string }>;
    const isUpdate = existingSettings.length > 0;

    // Password is required only when creating new settings
    if (!host || !port || !username || !from_email) {
      return NextResponse.json(
        { error: 'Missing required fields: host, port, username, from_email' },
        { status: 400 }
      );
    }
    if (!isUpdate && !password) {
      return NextResponse.json(
        { error: 'Password is required when configuring SMTP for the first time' },
        { status: 400 }
      );
    }

    if (isUpdate) {
      // Update existing — only update password_encrypted if a new password was provided
      if (password) {
        const encryptedPassword = encryptPassword(password);
        await pool.query(
          `UPDATE smtp_settings SET host = ?, port = ?, username = ?, password_encrypted = ?, from_email = ?, from_name = ?, enabled = ? WHERE id = ?`,
          [host, port, username, encryptedPassword, from_email, from_name || '', enabled ? 1 : 0, existingSettings[0].id]
        );
      } else {
        // Keep existing password
        await pool.query(
          `UPDATE smtp_settings SET host = ?, port = ?, username = ?, from_email = ?, from_name = ?, enabled = ? WHERE id = ?`,
          [host, port, username, from_email, from_name || '', enabled ? 1 : 0, existingSettings[0].id]
        );
      }
    } else {
      // Create new
      const encryptedPassword = encryptPassword(password);
      await pool.query(
        `INSERT INTO smtp_settings (host, port, username, password_encrypted, from_email, from_name, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [host, port, username, encryptedPassword, from_email, from_name || '', enabled ? 1 : 0]
      );
    }

    const [updated] = await pool.query('SELECT id, host, port, username, from_email, from_name, enabled FROM smtp_settings LIMIT 1');

    if (!Array.isArray(updated) || updated.length === 0) {
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to save SMTP settings' }, { status: 500 });
  }
}

