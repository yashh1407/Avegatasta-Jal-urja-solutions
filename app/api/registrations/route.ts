import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';
import { registrationSchema } from '@/lib/validation';
import { sendOwnerNotification, registrationNotificationHtml } from '@/lib/mailer';
import { requireAdminSession } from '@/lib/admin-auth';
import { decryptCaptcha } from '@/lib/captcha';

export async function POST(request: Request) {
  const { ok } = rateLimit(`registrations:${getClientIp(request)}`);
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Decrypt and verify CAPTCHA
  const { captchaToken, captchaInput } = (body || {}) as { captchaToken?: string; captchaInput?: string };
  if (!captchaToken || !captchaInput) {
    return NextResponse.json({ error: 'Security verification code is required.' }, { status: 400 });
  }

  const expectedCode = decryptCaptcha(captchaToken);
  if (!expectedCode || expectedCode.toLowerCase() !== captchaInput.toLowerCase()) {
    return NextResponse.json({ error: 'Incorrect security verification code. Please try again.' }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { firstName, lastName, phone, gstin } = parsed.data;

  try {
    await initDB();
    await pool.query(
      'INSERT INTO registrations (firstName, lastName, phone, gstin) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE firstName = VALUES(firstName), lastName = VALUES(lastName), gstin = VALUES(gstin)',
      [firstName, lastName, phone, gstin ?? null]
    );
    const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    sendOwnerNotification(
      `New Customer Registration: ${firstName} ${lastName}`,
      registrationNotificationHtml({ firstName, lastName, phone, gstin, submittedAt })
    ).catch((err) => console.error('[mailer] registration notification failed:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save registration' }, { status: 500 });
  }
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM registrations ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'Valid numeric ID required' }, { status: 400 });
    }

    await initDB();
    await pool.query('DELETE FROM registrations WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
  }
}
