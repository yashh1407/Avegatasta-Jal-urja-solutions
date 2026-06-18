import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { adminInvoiceSchema } from '@/lib/validation';

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `INV-${year}-${random}`;
}

function buildInvoiceHtml(order: Record<string, unknown>, invoice: Record<string, unknown>, items: unknown[]): string {
  const itemRows = (items as Array<Record<string, unknown>>)
    .map(
      (item) => `
      <tr>
        <td>${item.product_name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${Number(item.unit_price).toFixed(2)}</td>
        <td style="text-align:right">₹${(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #333; margin: 40px; }
    h1 { color: #1a56db; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #f3f4f6; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    .total-row td { font-weight: bold; border-top: 2px solid #333; }
    .status { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px;
              background: ${invoice.status === 'paid' ? '#d1fae5' : invoice.status === 'sent' ? '#dbeafe' : '#f3f4f6'};
              color: ${invoice.status === 'paid' ? '#065f46' : invoice.status === 'sent' ? '#1e40af' : '#374151'}; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>Avegatasta Solution</h1>
  <div class="meta">
    <div>
      <strong>Invoice #</strong> ${invoice.invoice_number}<br/>
      <strong>Date:</strong> ${invoice.invoice_date}<br/>
      ${invoice.due_date ? `<strong>Due:</strong> ${invoice.due_date}<br/>` : ''}
      <strong>Status:</strong> <span class="status">${String(invoice.status).toUpperCase()}</span>
    </div>
    <div>
      <strong>Bill To:</strong><br/>
      ${order.client_name || ''}<br/>
      ${order.company_name ? `${order.company_name}<br/>` : ''}
      ${order.client_email ? `${order.client_email}<br/>` : ''}
      ${order.client_phone ? `${order.client_phone}` : ''}
    </div>
  </div>
  <strong>Order #${order.id}</strong> &nbsp;|&nbsp; Order Date: ${order.order_date}<br/>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr class="total-row">
        <td colspan="3">Total</td>
        <td style="text-align:right">₹${Number(invoice.amount).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
  ${order.notes ? `<p style="margin-top:24px"><strong>Notes:</strong> ${order.notes}</p>` : ''}
  <p style="margin-top:40px;font-size:12px;color:#6b7280">Thank you for your business — Avegatasta Solution</p>
</body>
</html>`;
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
  const format = searchParams.get('format') || 'json';

  try {
    await initDB();

    const [invoices] = await pool.query('SELECT * FROM admin_invoices WHERE order_id = ?', [id]);
    const invoice = (invoices as unknown[])[0] as Record<string, unknown> | undefined;
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    if (format === 'html') {
      const [orders] = await pool.query(
        `SELECT o.*, c.name AS client_name, c.company_name, c.email AS client_email, c.phone AS client_phone
         FROM admin_orders o LEFT JOIN clients c ON c.id = o.client_id WHERE o.id = ?`,
        [id]
      );
      const order = (orders as unknown[])[0] as Record<string, unknown>;
      const [items] = await pool.query(
        'SELECT * FROM admin_order_items WHERE order_id = ? ORDER BY id ASC',
        [id]
      );

      const html = buildInvoiceHtml(order, invoice, items as unknown[]);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return NextResponse.json(invoice);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = adminInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { invoice_date, due_date, amount, status, pdf_url } = parsed.data;

  try {
    await initDB();

    // Verify order exists
    const [orders] = await pool.query('SELECT id FROM admin_orders WHERE id = ?', [id]);
    if (!(orders as unknown[]).length) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if invoice already exists for this order
    const [existing] = await pool.query('SELECT id, invoice_number FROM admin_invoices WHERE order_id = ?', [id]);
    if ((existing as unknown[]).length) {
      // Update existing invoice
      const existingInvoice = (existing as Array<{ id: number; invoice_number: string }>)[0];
      await pool.query(
        `UPDATE admin_invoices SET invoice_date=?, due_date=?, amount=?, status=?, pdf_url=? WHERE order_id=?`,
        [invoice_date, due_date || null, amount, status, pdf_url || null, id]
      );
      const [rows] = await pool.query('SELECT * FROM admin_invoices WHERE id = ?', [existingInvoice.id]);
      return NextResponse.json((rows as unknown[])[0]);
    }

    // Generate new invoice number
    let invoice_number = generateInvoiceNumber();
    // Ensure uniqueness (retry once on collision)
    const [dup] = await pool.query('SELECT id FROM admin_invoices WHERE invoice_number = ?', [invoice_number]);
    if ((dup as unknown[]).length) {
      invoice_number = generateInvoiceNumber();
    }

    const [result] = await pool.query(
      `INSERT INTO admin_invoices (order_id, invoice_number, invoice_date, due_date, amount, status, pdf_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, invoice_number, invoice_date, due_date || null, amount, status, pdf_url || null]
    );
    const invoiceId = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM admin_invoices WHERE id = ?', [invoiceId]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

const INVOICE_STATUSES = ['draft', 'sent', 'paid'] as const;

// PATCH updates an existing invoice's status (e.g. "Mark Paid" from the order panel).
export async function PATCH(
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

  const status = (body as { status?: string }).status;
  if (!status || !INVOICE_STATUSES.includes(status as (typeof INVOICE_STATUSES)[number])) {
    return NextResponse.json({ error: 'Invalid or missing status' }, { status: 422 });
  }

  try {
    await initDB();
    const [res] = await pool.query('UPDATE admin_invoices SET status = ? WHERE order_id = ?', [status, id]);
    if ((res as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    const [rows] = await pool.query('SELECT * FROM admin_invoices WHERE order_id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
