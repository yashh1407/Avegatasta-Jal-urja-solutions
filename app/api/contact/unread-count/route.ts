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
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
  }
}
