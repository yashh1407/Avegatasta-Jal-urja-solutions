import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

type OrderItemRow = {
  id: number;
  order_id: number;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: string | number;
  serial_number?: string | null;
  install_date?: string | null;
  warranty_end?: string | null;
  addons?: unknown[];
};

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanOptionalString(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned || null;
}

function cleanOptionalDate(value: unknown) {
  const cleaned = cleanString(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(cleaned) ? cleaned : null;
}

function cleanQuantity(value: unknown) {
  const quantity = Number.parseInt(String(value ?? '1'), 10);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function cleanUnitPrice(value: unknown) {
  const price = Number.parseFloat(String(value ?? '0'));
  return Number.isFinite(price) && price >= 0 ? price : 0;
}

async function ensureOrderItemColumns() {
  const [columns] = await pool.query('SHOW COLUMNS FROM admin_order_items');
  const existing = new Set((columns as Array<{ Field: string }>).map((col) => col.Field));

  const ddl: Array<[string, string]> = [
    ['product_id', 'ALTER TABLE admin_order_items ADD COLUMN product_id VARCHAR(255) NULL AFTER order_id'],
    ['product_name', "ALTER TABLE admin_order_items ADD COLUMN product_name VARCHAR(255) NOT NULL DEFAULT '' AFTER product_id"],
    ['quantity', 'ALTER TABLE admin_order_items ADD COLUMN quantity INT NOT NULL DEFAULT 1 AFTER product_name'],
    ['unit_price', 'ALTER TABLE admin_order_items ADD COLUMN unit_price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER quantity'],
    ['serial_number', 'ALTER TABLE admin_order_items ADD COLUMN serial_number VARCHAR(255) NULL AFTER unit_price'],
    ['install_date', 'ALTER TABLE admin_order_items ADD COLUMN install_date DATE NULL AFTER serial_number'],
    ['warranty_end', 'ALTER TABLE admin_order_items ADD COLUMN warranty_end DATE NULL AFTER install_date'],
  ];

  for (const [column, statement] of ddl) {
    if (existing.has(column)) continue;
    try {
      await pool.query(statement);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== 'ER_DUP_FIELDNAME') throw err;
    }
  }
}

async function recalculateOrderTotal(orderId: number) {
  await pool.query(
    `UPDATE admin_orders o
     SET o.total_amount = COALESCE((
       SELECT SUM(quantity * unit_price)
       FROM admin_order_items
       WHERE order_id = ?
     ), 0)
     WHERE o.id = ?`,
    [orderId, orderId]
  );
}

async function getOrderItems(orderId: number) {
  const [rows] = await pool.query(
    `SELECT id, order_id, product_id, product_name, quantity, unit_price, serial_number, install_date, warranty_end
     FROM admin_order_items
     WHERE order_id = ?
     ORDER BY id ASC`,
    [orderId]
  );

  return (rows as OrderItemRow[]).map((item) => ({ ...item, addons: [] }));
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
    await ensureOrderItemColumns();
    const items = await getOrderItems(id);
    return NextResponse.json(items);
  } catch (err) {
    console.error('Database error while fetching order items:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch order items';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const productName = cleanString(body.product_name);
  const quantity = cleanQuantity(body.quantity);
  const unitPrice = cleanUnitPrice(body.unit_price);
  const productId = cleanOptionalString(body.product_id);
  const serialNumber = cleanOptionalString(body.serial_number);
  const installDate = cleanOptionalDate(body.install_date);
  const warrantyEnd = cleanOptionalDate(body.warranty_end);

  if (!productName) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 422 });
  }

  try {
    await initDB();
    await ensureOrderItemColumns();

    const [orders] = await pool.query('SELECT id FROM admin_orders WHERE id = ?', [id]);
    if (!(orders as unknown[]).length) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const [result] = await pool.query(
      `INSERT INTO admin_order_items
       (order_id, product_id, product_name, quantity, unit_price, serial_number, install_date, warranty_end)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, productId, productName, quantity, unitPrice, serialNumber, installDate, warrantyEnd]
    );

    const itemId = (result as { insertId: number }).insertId;
    await recalculateOrderTotal(id);

    const [rows] = await pool.query(
      `SELECT id, order_id, product_id, product_name, quantity, unit_price, serial_number, install_date, warranty_end
       FROM admin_order_items
       WHERE id = ?`,
      [itemId]
    );

    const created = (rows as OrderItemRow[])[0] || {
      id: itemId,
      order_id: id,
      product_id: productId,
      product_name: productName,
      quantity,
      unit_price: unitPrice,
      serial_number: serialNumber,
      install_date: installDate,
      warranty_end: warrantyEnd,
    };

    return NextResponse.json({ ...created, addons: [] }, { status: 201 });
  } catch (err) {
    console.error('Database error while creating order item:', err);
    const message = err instanceof Error ? err.message : 'Failed to create order item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
