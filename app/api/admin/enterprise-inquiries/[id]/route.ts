import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
type Status = typeof VALID_STATUSES[number];

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function PATCH(
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

  const { status } = body as { status?: string };
  if (!status || !VALID_STATUSES.includes(status as Status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 422 });
  }

  try {
    await initDB();
    const [result] = await pool.query(
      'UPDATE enterprise_inquiries SET status = ? WHERE id = ?',
      [status, id]
    ) as [{ affectedRows: number }, unknown];

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
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
    const [result] = await pool.query(
      'DELETE FROM enterprise_inquiries WHERE id = ?',
      [id]
    ) as [{ affectedRows: number }, unknown];

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
