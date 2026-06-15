import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool, { initDB } from '@/lib/db';
import { signClientToken, buildClientCookie } from '@/lib/client-auth';
import { clientLoginSchema } from '@/lib/validation';
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

  const parsed = clientLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { email, password } = parsed.data;

  try {
    await initDB();

    const [rows] = await pool.query(
      `SELECT cu.id, cu.client_id, cu.email, cu.password_hash, cu.status
       FROM client_users cu
       WHERE cu.email = ? LIMIT 1`,
      [email]
    );

    const user = (rows as Array<{
      id: number; client_id: number; email: string;
      password_hash: string; status: string;
    }>)[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await pool.query('UPDATE client_users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = await signClientToken({
      sub: String(user.id),
      clientId: user.client_id,
      email: user.email,
    });

    return NextResponse.json(
      { ok: true },
      { headers: { 'Set-Cookie': buildClientCookie(token) } }
    );
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
