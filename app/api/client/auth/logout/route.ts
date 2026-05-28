import { NextResponse } from 'next/server';
import { clearClientCookie } from '@/lib/client-auth';

export async function POST() {
  return NextResponse.json(
    { ok: true },
    { headers: { 'Set-Cookie': clearClientCookie() } }
  );
}
