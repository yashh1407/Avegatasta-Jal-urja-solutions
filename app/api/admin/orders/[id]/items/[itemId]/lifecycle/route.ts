import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { productLifecycleEventSchema } from '@/lib/validation';

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { itemId: rawItemId } = await params;
  const itemId = parseId(rawItemId);
  if (!itemId) return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });

  try {
    await initDB();
    const [rows] = await pool.query(
      'SELECT * FROM product_lifecycle_events WHERE order_item_id = ? ORDER BY event_date DESC, id DESC',
      [itemId]
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch lifecycle events' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { itemId: rawItemId } = await params;
  const itemId = parseId(rawItemId);
  if (!itemId) return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = productLifecycleEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { event_type, event_date, notes, performed_by } = parsed.data;

  try {
    await initDB();

    // Verify item exists
    const [items] = await pool.query('SELECT id FROM admin_order_items WHERE id = ?', [itemId]);
    if (!(items as unknown[]).length) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    const [result] = await pool.query(
      `INSERT INTO product_lifecycle_events (order_item_id, event_type, event_date, notes, performed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [itemId, event_type, event_date, notes || null, performed_by || null]
    );
    const eventId = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM product_lifecycle_events WHERE id = ?', [eventId]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create lifecycle event' }, { status: 500 });
  }
}
