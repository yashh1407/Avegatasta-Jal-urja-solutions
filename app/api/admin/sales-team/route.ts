import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM sales_team ORDER BY name');
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch sales team' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, phone, email, role } = body as Record<string, string>;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 422 });
  }

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO sales_team (name, phone, email, role) VALUES (?, ?, ?, ?)`,
      [name.trim(), phone || null, email || null, role || 'sales_person']
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM sales_team WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create sales team member' }, { status: 500 });
  }
}
