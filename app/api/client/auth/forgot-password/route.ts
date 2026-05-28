import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import pool, { initDB } from '@/lib/db';
import { sendOwnerNotification } from '@/lib/mailer';
import { clientForgotPasswordSchema } from '@/lib/validation';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = clientForgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { email } = parsed.data;

  try {
    await initDB();

    const [rows] = await pool.query(
      'SELECT id FROM client_users WHERE email = ? AND status = ? LIMIT 1',
      [email, 'active']
    );
    const user = (rows as Array<{ id: number }>)[0];

    // Always return 200 to prevent email enumeration
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const plainToken = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(plainToken, 10);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE client_users SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?',
      [tokenHash, expires, user.id]
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/client/reset-password?token=${plainToken}&email=${encodeURIComponent(email)}`;

    await sendOwnerNotification(
      'Client Portal: Password Reset Request',
      `<p>A password reset was requested for <strong>${email}</strong>.</p>
       <p><a href="${resetUrl}">Reset Password</a></p>
       <p>This link expires in 1 hour.</p>`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
