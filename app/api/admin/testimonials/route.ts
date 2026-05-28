import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { clearCache } from '@/lib/cache';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY display_order ASC, id ASC');
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
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

  const { name, role, location, rating, text, image_url, is_active, display_order } =
    body as Record<string, unknown>;

  if (!name || !(name as string).trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 422 });
  }
  if (!text || !(text as string).trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 422 });
  }

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO testimonials (name, role, location, rating, text, image_url, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        (name as string).trim(),
        role || null,
        location || null,
        rating ?? 5,
        (text as string).trim(),
        image_url || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        display_order ?? 0,
      ]
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    clearCache('public-testimonials');
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
