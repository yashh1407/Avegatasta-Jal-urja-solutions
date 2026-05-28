import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { adminOrderSchema } from '@/lib/validation';

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id') || '';
  const status = searchParams.get('status') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';

  try {
    await initDB();

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (clientId) {
      conditions.push('o.client_id = ?');
      params.push(parseInt(clientId, 10));
    }
    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }
    if (dateFrom) {
      conditions.push('o.order_date >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('o.order_date <= ?');
      params.push(dateTo);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT o.*, c.name AS client_name, c.company_name,
              COUNT(DISTINCT oi.id) AS item_count,
              i.invoice_number, i.status AS invoice_status
       FROM admin_orders o
       LEFT JOIN clients c ON c.id = o.client_id
       LEFT JOIN admin_order_items oi ON oi.order_id = o.id
       LEFT JOIN admin_invoices i ON i.order_id = o.id
       ${where}
       GROUP BY o.id
       ORDER BY o.order_date DESC, o.created_at DESC`,
      params
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

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

    // Verify client exists
    const [clients] = await pool.query('SELECT id FROM clients WHERE id = ?', [client_id]);
    if (!(clients as unknown[]).length) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const [result] = await pool.query(
      `INSERT INTO admin_orders (client_id, order_date, status, total_amount, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [client_id, order_date, status, total_amount, notes || null]
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query(
      `SELECT o.*, c.name AS client_name, c.company_name
       FROM admin_orders o LEFT JOIN clients c ON c.id = o.client_id WHERE o.id = ?`,
      [id]
    );
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
