import { NextResponse } from 'next/server';
import { encryptCaptcha, generateCaptchaSvg } from '@/lib/captcha';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';

export async function GET(request: Request) {
  const { ok } = rateLimit(`captcha-gen:${getClientIp(request)}`, 60, 60_000); // Max 60 requests per minute
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  // Generate random 6 characters (avoiding ambiguous characters like O, 0, I, 1, l)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let text = '';
  for (let i = 0; i < 6; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Encrypt the text into a token (expires in 5 minutes)
  const token = encryptCaptcha(text);

  // Generate SVG representation of text
  const svg = generateCaptchaSvg(text);

  return NextResponse.json({
    token,
    svg,
  });
}
