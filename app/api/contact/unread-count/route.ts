import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0'
    );
    const count = (rows as Array<{ count: number }>)[0].count;
    return NextResponse.json({ count });
  } catch (error) {
    const dbError = error as { code?: string; message?: string };
    console.warn('Unread count unavailable:', dbError.code ?? dbError.message ?? error);
    return NextResponse.json({ count: 0, dbConnected: false });
  }
}
