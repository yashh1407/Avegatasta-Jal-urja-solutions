import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';

  try {
    await initDB();

    // Verify client exists
    const [clients] = await pool.query('SELECT id FROM clients WHERE id = ?', [id]);
    if (!(clients as unknown[]).length) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const conditions: string[] = ['o.client_id = ?'];
    const params: unknown[] = [id];

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

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [rows] = await pool.query(
      `SELECT o.*,
              COUNT(DISTINCT oi.id) AS item_count,
              i.invoice_number, i.status AS invoice_status, i.amount AS invoice_amount
       FROM admin_orders o
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
    return NextResponse.json({ error: 'Failed to fetch client orders' }, { status: 500 });
  }
}
