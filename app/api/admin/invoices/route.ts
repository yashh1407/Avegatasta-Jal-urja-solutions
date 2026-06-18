import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const clientIdRaw = searchParams.get('client_id');

  try {
    await initDB();

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (clientIdRaw) {
      const clientId = parseInt(clientIdRaw, 10);
      if (Number.isFinite(clientId) && clientId > 0) {
        conditions.push('client_id = ?');
        params.push(clientId);
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT id, invoice_number, client_id, client_name, created_at, updated_at
       FROM canvas_invoices ${where} ORDER BY updated_at DESC`,
      params
    );
    return NextResponse.json({ invoices: rows });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  try {
    const body = await request.json();
    const { invoice_number, client_name, client_id, invoice_data } = body;

    if (!invoice_number || !invoice_data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await initDB();

    const invoiceDataStr = JSON.stringify(invoice_data);
    const parsedClientId = Number.parseInt(client_id, 10);
    const clientIdValue = Number.isFinite(parsedClientId) && parsedClientId > 0 ? parsedClientId : null;

    await pool.query(
      `INSERT INTO canvas_invoices (invoice_number, client_name, client_id, invoice_data)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       client_name = VALUES(client_name),
       client_id = VALUES(client_id),
       invoice_data = VALUES(invoice_data)`,
      [invoice_number, client_name || null, clientIdValue, invoiceDataStr]
    );

    return NextResponse.json({ success: true, message: 'Invoice saved successfully' });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to save invoice' }, { status: 500 });
  }
}
