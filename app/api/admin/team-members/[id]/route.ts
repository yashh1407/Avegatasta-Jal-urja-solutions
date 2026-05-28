import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { teamMemberSchema } from '@/lib/validation';

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
    const [rows] = await pool.query('SELECT * FROM team_members WHERE id = ?', [id]);
    const member = (rows as unknown[])[0];
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(member);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch team member' }, { status: 500 });
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

  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, role, email, phone, avatar_url, status, joined_date } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      `UPDATE team_members SET name=?, role=?, email=?, phone=?, avatar_url=?, status=?, joined_date=?
       WHERE id=?`,
      [name, role, email || null, phone || null, avatar_url || null, status, joined_date || null, id]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const [rows] = await pool.query('SELECT * FROM team_members WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
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
    // Soft delete: set status to inactive
    const [result] = await pool.query(
      `UPDATE team_members SET status='inactive' WHERE id=?`,
      [id]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}
