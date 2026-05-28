import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

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

  const { name, phone, email, role, status } = body as Record<string, string>;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
  if (email !== undefined) { fields.push('email = ?'); values.push(email); }
  if (role !== undefined) { fields.push('role = ?'); values.push(role); }
  if (status !== undefined) { fields.push('status = ?'); values.push(status); }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 422 });
  }

  values.push(id);

  try {
    await initDB();
    await pool.query(`UPDATE sales_team SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM sales_team WHERE id = ?', [id]);
    const member = (rows as unknown[])[0];
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    return NextResponse.json(member);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update sales team member' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  try {
    await initDB();
    const [result] = await pool.query(
      `UPDATE sales_team SET status = 'inactive' WHERE id = ?`,
      [id]
    );
    const affected = (result as { affectedRows: number }).affectedRows;
    if (affected === 0) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to deactivate sales team member' }, { status: 500 });
  }
}
