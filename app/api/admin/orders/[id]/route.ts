import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { adminOrderSchema } from '@/lib/validation';

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

    const [orders] = await pool.query(
      `SELECT o.*, c.name AS client_name, c.company_name, c.email AS client_email, c.phone AS client_phone
       FROM admin_orders o LEFT JOIN clients c ON c.id = o.client_id WHERE o.id = ?`,
      [id]
    );
    const order = (orders as unknown[])[0] as Record<string, unknown> | undefined;
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [items] = await pool.query(
      `SELECT id, order_id, product_id, product_name, quantity, unit_price, serial_number, install_date, warranty_end
       FROM admin_order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [id]
    );

    const itemRows = items as Array<{ id: number; [key: string]: unknown }>;
    const itemIds = itemRows.map((item) => item.id);
    let addonsByItemId: Record<number, unknown[]> = {};

    if (itemIds.length > 0) {
      const placeholders = itemIds.map(() => '?').join(',');
      const [addons] = await pool.query(
        `SELECT id, order_item_id, addon_name, price, active
         FROM admin_order_addons
         WHERE order_item_id IN (${placeholders})
         ORDER BY id ASC`,
        itemIds
      );

      addonsByItemId = (addons as Array<{ order_item_id: number; [key: string]: unknown }>).reduce(
        (acc, addon) => {
          const key = Number(addon.order_item_id);
          if (!acc[key]) acc[key] = [];
          acc[key].push(addon);
          return acc;
        },
        {} as Record<number, unknown[]>
      );
    }

    const itemsWithAddons = itemRows.map((item) => ({
      ...item,
      addons: addonsByItemId[item.id] || [],
    }));

    const [invoices] = await pool.query(
      'SELECT * FROM admin_invoices WHERE order_id = ?',
      [id]
    );

    return NextResponse.json({
      ...order,
      items: itemsWithAddons,
      invoice: (invoices as unknown[])[0] || null,
    });
  } catch (err) {
    console.error('Database error while fetching order:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch order';
    return NextResponse.json({ error: message }, { status: 500 });
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

  const parsed = adminOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { client_id, order_date, status, total_amount, notes } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      `UPDATE admin_orders SET client_id=?, order_date=?, status=?, total_amount=?, notes=? WHERE id=?`,
      [client_id, order_date, status, total_amount, notes || null, id]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Auto-generate a draft invoice when the order is confirmed ('active') or
    // 'completed', if one doesn't already exist — keeps the
    // order -> invoice -> client chain automatic. Non-fatal: a failure here must
    // not fail the order update itself.
    if (status === 'active' || status === 'completed') {
      try {
        const [existing] = await pool.query('SELECT id FROM admin_invoices WHERE order_id = ?', [id]);
        if (!(existing as unknown[]).length) {
          const [itemRows] = await pool.query(
            'SELECT quantity, unit_price FROM admin_order_items WHERE order_id = ?',
            [id]
          );
          const amount = (itemRows as Array<{ quantity: number; unit_price: string | number }>).reduce(
            (sum, it) => sum + Number(it.quantity) * Number(it.unit_price),
            0
          );
          const gen = () => `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          let invoiceNumber = gen();
          const [dup] = await pool.query('SELECT id FROM admin_invoices WHERE invoice_number = ?', [invoiceNumber]);
          if ((dup as unknown[]).length) invoiceNumber = gen();
          const invoiceDate = new Date().toISOString().slice(0, 10);
          await pool.query(
            `INSERT INTO admin_invoices (order_id, invoice_number, invoice_date, amount, status)
             VALUES (?, ?, ?, ?, 'draft')`,
            [id, invoiceNumber, invoiceDate, amount]
          );
        }
      } catch (e) {
        console.error('Auto-invoice generation failed for order', id, e);
      }
    }

    const [rows] = await pool.query(
      `SELECT o.*, c.name AS client_name, c.company_name
       FROM admin_orders o LEFT JOIN clients c ON c.id = o.client_id WHERE o.id = ?`,
      [id]
    );
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
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
    const [result] = await pool.query('DELETE FROM admin_orders WHERE id = ?', [id]);
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
