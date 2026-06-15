import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ invoice_number: string }> }
) {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  try {
    await initDB();
    const { invoice_number } = await params;
    const [rows] = await pool.query('SELECT * FROM canvas_invoices WHERE invoice_number = ?', [
      invoice_number,
    ]);

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice: (rows as any[])[0] });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ invoice_number: string }> }
) {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  try {
    await initDB();
    const { invoice_number } = await params;
    await pool.query('DELETE FROM canvas_invoices WHERE invoice_number = ?', [invoice_number]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
