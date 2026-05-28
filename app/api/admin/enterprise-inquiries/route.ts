import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const status = searchParams.get('status') || '';

  try {
    await initDB();

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (q) {
      conditions.push('(company LIKE ? OR name LIKE ? OR phone LIKE ? OR email LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT id, company, name, designation, phone, email, project_type, scale, message, status, created_at
       FROM enterprise_inquiries
       ${where}
       ORDER BY created_at DESC`,
      params
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch enterprise inquiries' }, { status: 500 });
  }
}
