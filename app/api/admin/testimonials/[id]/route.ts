import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { clearCache } from '@/lib/cache';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, role, location, rating, text, image_url, is_active, display_order } =
    body as Record<string, unknown>;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (role !== undefined) { fields.push('role = ?'); values.push(role); }
  if (location !== undefined) { fields.push('location = ?'); values.push(location); }
  if (rating !== undefined) { fields.push('rating = ?'); values.push(rating); }
  if (text !== undefined) { fields.push('text = ?'); values.push(text); }
  if (image_url !== undefined) { fields.push('image_url = ?'); values.push(image_url); }
  if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active ? 1 : 0); }
  if (display_order !== undefined) { fields.push('display_order = ?'); values.push(display_order); }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 422 });
  }

  try {
    await initDB();
    const [result] = await pool.query(
      `UPDATE testimonials SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    const [rows] = await pool.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    clearCache('public-testimonials');
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  try {
    await initDB();
    const [result] = await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    clearCache('public-testimonials');
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
