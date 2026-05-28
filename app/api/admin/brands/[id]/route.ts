import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { brandSchema } from '@/lib/validation';

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM brands WHERE id = ?', [id]);
    const brand = (rows as unknown[])[0];
    if (!brand) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(brand);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, logo_url, description, website, status } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      `UPDATE brands SET name=?, logo_url=?, description=?, website=?, status=? WHERE id=?`,
      [name, logo_url || null, description || null, website || null, status, id]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const [rows] = await pool.query('SELECT * FROM brands WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    await initDB();
    const [result] = await pool.query('DELETE FROM brands WHERE id = ?', [id]);
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
