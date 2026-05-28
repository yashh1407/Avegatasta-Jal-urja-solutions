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

  const { slug, title, subtitle, icon_name, intro, why_choose, cta_title, cta_desc, display_order, is_active } =
    body as Record<string, unknown>;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (subtitle !== undefined) { fields.push('subtitle = ?'); values.push(subtitle); }
  if (icon_name !== undefined) { fields.push('icon_name = ?'); values.push(icon_name); }
  if (intro !== undefined) { fields.push('intro = ?'); values.push(intro); }
  if (why_choose !== undefined) { fields.push('why_choose = ?'); values.push(JSON.stringify(why_choose)); }
  if (cta_title !== undefined) { fields.push('cta_title = ?'); values.push(cta_title); }
  if (cta_desc !== undefined) { fields.push('cta_desc = ?'); values.push(cta_desc); }
  if (display_order !== undefined) { fields.push('display_order = ?'); values.push(display_order); }
  if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active ? 1 : 0); }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 422 });
  }

  try {
    await initDB();
    const [result] = await pool.query(
      `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id]) as [Array<Record<string, unknown>>, unknown];
    const svc = rows[0];
    clearCache('public-services');
    return NextResponse.json({
      ...svc,
      why_choose: typeof svc.why_choose === 'string' ? JSON.parse(svc.why_choose) : svc.why_choose,
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  try {
    await initDB();
    const [result] = await pool.query('DELETE FROM services WHERE id = ?', [id]);
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    clearCache('public-services');
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
