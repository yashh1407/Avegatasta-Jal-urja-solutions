import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const checks: Record<string, string> = { app: 'ok' };
  let httpStatus = 200;

  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    checks.db = 'ok';
  } catch {
    checks.db = 'error';
    httpStatus = 503;
  }

  return NextResponse.json(
    { status: httpStatus === 200 ? 'healthy' : 'degraded', checks },
    { status: httpStatus }
  );
}
