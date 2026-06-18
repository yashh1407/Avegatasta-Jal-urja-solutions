import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

// Best-effort total extraction from a canvas invoice's JSON blob. The builder
// stores items[] (qty * price) plus a tax rate; mirror its calculation loosely
// so the listing can show an amount where one is derivable, else null.
function deriveCanvasAmount(invoiceDataRaw: unknown): number | null {
  if (typeof invoiceDataRaw !== 'string' || !invoiceDataRaw) return null;
  try {
    const parsed = JSON.parse(invoiceDataRaw);
    // The builder may persist either the raw object or a legacy wrapped array.
    let data: any = parsed;
    if (Array.isArray(parsed)) {
      const wrapped = parsed.find(
        (el: any) => el?.type === '_v2_structured_data' || el?.content
      );
      data = wrapped?.content ?? null;
    }
    if (!data || !Array.isArray(data.items)) return null;

    const subtotal = data.items.reduce(
      (sum: number, item: any) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0),
      0
    );
    if (!subtotal) return null;

    const rate = Number(data.taxRate);
    const taxRate = Number.isFinite(rate) ? rate : 18;
    const rawTotal = subtotal + (subtotal * taxRate) / 100;
    return data.roundOff === false ? rawTotal : Math.round(rawTotal);
  } catch {
    return null;
  }
}

interface CombinedInvoice {
  source: 'gst' | 'order';
  invoice_number: string;
  amount: number | null;
  status?: string;
  invoice_date?: string | null;
  created_at?: string;
  order_id?: number;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const clientId = parseId(id);
  if (!clientId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    await initDB();

    const [clients] = await pool.query('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (!(clients as unknown[]).length) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // 1. Canvas (GST) invoices directly linked to this client.
    const [canvasRows] = await pool.query(
      'SELECT invoice_number, invoice_data, created_at FROM canvas_invoices WHERE client_id = ?',
      [clientId]
    );

    const gstInvoices: CombinedInvoice[] = (canvasRows as Array<Record<string, unknown>>).map(
      (row) => ({
        source: 'gst',
        invoice_number: String(row.invoice_number),
        amount: deriveCanvasAmount(row.invoice_data),
        created_at: row.created_at ? new Date(row.created_at as string).toISOString() : undefined,
      })
    );

    // 2. Order-based invoices, reached via this client's admin_orders.
    const [orderRows] = await pool.query(
      `SELECT i.invoice_number, i.amount, i.status, i.invoice_date, i.order_id, i.created_at
       FROM admin_invoices i
       JOIN admin_orders o ON o.id = i.order_id
       WHERE o.client_id = ?`,
      [clientId]
    );

    const orderInvoices: CombinedInvoice[] = (orderRows as Array<Record<string, unknown>>).map(
      (row) => ({
        source: 'order',
        invoice_number: String(row.invoice_number),
        amount: row.amount != null ? Number(row.amount) : null,
        status: row.status as string | undefined,
        invoice_date: (row.invoice_date as string | null) ?? null,
        order_id: Number(row.order_id),
        created_at: row.created_at ? new Date(row.created_at as string).toISOString() : undefined,
      })
    );

    // Sort newest first. Prefer invoice_date for order invoices, created_at otherwise.
    const sortKey = (inv: CombinedInvoice) =>
      new Date(inv.invoice_date || inv.created_at || 0).getTime();

    const invoices = [...gstInvoices, ...orderInvoices].sort((a, b) => sortKey(b) - sortKey(a));

    return NextResponse.json(invoices);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch client invoices' }, { status: 500 });
  }
}
