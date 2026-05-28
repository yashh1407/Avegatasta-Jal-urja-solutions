import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM case_studies WHERE id = ?', [id]);
    const caseStudy = (rows as unknown[])[0];
    if (!caseStudy) return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    return NextResponse.json(caseStudy);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch case study' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    title,
    slug,
    summary,
    description,
    category,
    client_name,
    location_name,
    latitude,
    longitude,
    cover_image,
    images,
    status,
  } = body as Record<string, unknown>;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
  if (summary !== undefined) { fields.push('summary = ?'); values.push(summary); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  if (category !== undefined) { fields.push('category = ?'); values.push(category); }
  if (client_name !== undefined) { fields.push('client_name = ?'); values.push(client_name); }
  if (location_name !== undefined) { fields.push('location_name = ?'); values.push(location_name); }
  if (latitude !== undefined) { fields.push('latitude = ?'); values.push(latitude); }
  if (longitude !== undefined) { fields.push('longitude = ?'); values.push(longitude); }
  if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
  if (images !== undefined) { fields.push('images = ?'); values.push(images ? JSON.stringify(images) : null); }
  if (status !== undefined) { fields.push('status = ?'); values.push(status); }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 422 });
  }

  values.push(id);

  try {
    await initDB();
    const [result] = await pool.query(
      `UPDATE case_studies SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }
    const [rows] = await pool.query('SELECT * FROM case_studies WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update case study' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  try {
    await initDB();
    const [result] = await pool.query('DELETE FROM case_studies WHERE id = ?', [id]);
    const affected = (result as { affectedRows: number }).affectedRows;
    if (affected === 0) return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
  }
}
