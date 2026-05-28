import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM about_content ORDER BY section');
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}
