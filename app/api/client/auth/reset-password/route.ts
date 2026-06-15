import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool, { initDB } from '@/lib/db';
import { clientResetPasswordSchema } from '@/lib/validation';
import { decryptCaptcha } from '@/lib/captcha';

export async function POST(request: Request) {
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

  const parsed = clientResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { token, password } = parsed.data;

  try {
    await initDB();

    // Fetch all non-expired users with a reset token set
    const [rows] = await pool.query(
      `SELECT id, reset_token_hash FROM client_users
       WHERE reset_token_hash IS NOT NULL
         AND reset_token_expires > NOW()
       LIMIT 100`
    );

    const candidates = rows as Array<{ id: number; reset_token_hash: string }>;

    let matchedId: number | null = null;
    for (const row of candidates) {
      const match = await bcrypt.compare(token, row.reset_token_hash);
      if (match) {
        matchedId = row.id;
        break;
      }
    }

    if (!matchedId) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(password, 12);
    await pool.query(
      `UPDATE client_users
       SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL
       WHERE id = ?`,
      [newHash, matchedId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
