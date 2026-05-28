import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM vendors ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
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

  const { name, contact_person, phone, email, address, brand, notes } = body as Record<string, string>;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 422 });
  }

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO vendors (name, contact_person, phone, email, address, brand, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        contact_person || null,
        phone || null,
        email || null,
        address || null,
        brand || null,
        notes || null,
      ]
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
