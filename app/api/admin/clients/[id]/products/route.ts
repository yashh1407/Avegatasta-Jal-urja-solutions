import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { clientProductSchema } from '@/lib/validation';

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function nullIfEmpty(v: string | undefined): string | null {
  return v && v.trim() ? v.trim() : null;
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
    const [rows] = await pool.query(
      'SELECT * FROM client_products WHERE client_id = ? ORDER BY created_at DESC',
      [clientId]
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const clientId = parseId(id);
  if (!clientId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = clientProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const {
    product_id,
    product_name,
    serial_number,
    batch_number,
    purchase_date,
    install_date,
    warranty_end_date,
    next_service_date,
    notes,
  } = parsed.data;

  try {
    await initDB();
    const [clients] = await pool.query('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (!(clients as unknown[]).length) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const [result] = await pool.query(
      `INSERT INTO client_products
        (client_id, product_id, product_name, serial_number, batch_number,
         purchase_date, install_date, warranty_end_date, next_service_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        nullIfEmpty(product_id),
        product_name,
        nullIfEmpty(serial_number),
        nullIfEmpty(batch_number),
        nullIfEmpty(purchase_date),
        nullIfEmpty(install_date),
        nullIfEmpty(warranty_end_date),
        nullIfEmpty(next_service_date),
        nullIfEmpty(notes),
      ]
    );
    const insertId = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM client_products WHERE id = ?', [insertId]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
