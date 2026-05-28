import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function GET() {
  try {
    await initDB();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message, stack: err.stack, code: err.code });
  }
}
