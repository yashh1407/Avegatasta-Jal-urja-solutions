import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT id, quote_number, client_name, created_at, updated_at FROM canvas_quotations ORDER BY updated_at DESC');
    return NextResponse.json({ quotations: rows });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const body = await request.json();
    const { quote_number, client_name, canvas_data } = body;

    if (!quote_number || !canvas_data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await initDB();

    const canvasDataStr = JSON.stringify(canvas_data);

    await pool.query(
      `INSERT INTO canvas_quotations (quote_number, client_name, canvas_data) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       client_name = VALUES(client_name), 
       canvas_data = VALUES(canvas_data)`,
      [quote_number, client_name || null, canvasDataStr]
    );

    return NextResponse.json({ success: true, message: 'Quotation saved successfully' });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to save quotation' }, { status: 500 });
  }
}
