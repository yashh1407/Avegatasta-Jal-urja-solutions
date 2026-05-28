import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';
import { orderSchema } from '@/lib/validation';
import { requireAdminSession } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const { ok } = rateLimit(`orders:${getClientIp(request)}`);
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { firstName, lastName, phone, products, total } = parsed.data;

  try {
    await initDB();
    await pool.query(
      'INSERT INTO orders (firstName, lastName, phone, products, total) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, phone ?? null, JSON.stringify(products), total]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'Valid numeric ID required' }, { status: 400 });
    }

    await initDB();
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
