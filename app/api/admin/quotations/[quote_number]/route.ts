import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(request: Request, { params }: { params: Promise<{ quote_number: string }> }) {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  try {
    await initDB();
    const { quote_number } = await params;
    const [rows] = await pool.query('SELECT * FROM canvas_quotations WHERE quote_number = ?', [quote_number]);
    
    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json({ quotation: (rows as any[])[0] });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 });
  }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ quote_number: string }> }) {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  try {
    await initDB();
    const { quote_number } = await params;
    await pool.query('DELETE FROM canvas_quotations WHERE quote_number = ?', [quote_number]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 });
  }
}
