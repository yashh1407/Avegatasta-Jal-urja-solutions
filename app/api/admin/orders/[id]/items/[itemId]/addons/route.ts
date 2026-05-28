import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { adminOrderAddonSchema } from '@/lib/validation';

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
      'SELECT * FROM admin_order_addons WHERE order_item_id = ? ORDER BY id ASC',
      [itemId]
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch addons' }, { status: 500 });
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

  const parsed = adminOrderAddonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { addon_name, addon_description, price, active } = parsed.data;

  try {
    await initDB();

    // Verify item exists
    const [items] = await pool.query('SELECT id FROM admin_order_items WHERE id = ?', [itemId]);
    if (!(items as unknown[]).length) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    const [result] = await pool.query(
      `INSERT INTO admin_order_addons (order_item_id, addon_name, addon_description, price, active)
       VALUES (?, ?, ?, ?, ?)`,
      [itemId, addon_name, addon_description || null, price, active ? 1 : 0]
    );
    const addonId = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM admin_order_addons WHERE id = ?', [addonId]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create addon' }, { status: 500 });
  }
}
