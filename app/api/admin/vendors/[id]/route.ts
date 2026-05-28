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

  const { name, contact_person, phone, email, address, brand, notes } = body as Record<string, string>;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (contact_person !== undefined) { fields.push('contact_person = ?'); values.push(contact_person); }
  if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
  if (email !== undefined) { fields.push('email = ?'); values.push(email); }
  if (address !== undefined) { fields.push('address = ?'); values.push(address); }
  if (brand !== undefined) { fields.push('brand = ?'); values.push(brand); }
  if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 422 });
  }

  values.push(id);

  try {
    await initDB();
    await pool.query(`UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    const vendor = (rows as unknown[])[0];
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json(vendor);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  try {
    await initDB();
    const [result] = await pool.query('DELETE FROM vendors WHERE id = ?', [id]);
    const affected = (result as { affectedRows: number }).affectedRows;
    if (affected === 0) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
