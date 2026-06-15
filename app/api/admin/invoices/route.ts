import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query(
      'SELECT id, invoice_number, client_name, created_at, updated_at FROM canvas_invoices ORDER BY updated_at DESC'
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
    const { invoice_number, client_name, invoice_data } = body;

    if (!invoice_number || !invoice_data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await initDB();

    const invoiceDataStr = JSON.stringify(invoice_data);

    await pool.query(
      `INSERT INTO canvas_invoices (invoice_number, client_name, invoice_data) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       client_name = VALUES(client_name), 
       invoice_data = VALUES(invoice_data)`,
      [invoice_number, client_name || null, invoiceDataStr]
    );

    return NextResponse.json({ success: true, message: 'Invoice saved successfully' });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to save invoice' }, { status: 500 });
  }
}
