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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id, productId } = await params;
  const clientId = parseId(id);
  const clientProductId = parseId(productId);

  if (!clientId || !clientProductId) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

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

    const [existing] = await pool.query(
      'SELECT id FROM client_products WHERE id = ? AND client_id = ?',
      [clientProductId, clientId]
    );

    if (!(existing as unknown[]).length) {
      return NextResponse.json({ error: 'Purchased product not found' }, { status: 404 });
    }

    await pool.query(
      `UPDATE client_products
       SET product_id = ?,
           product_name = ?,
           serial_number = ?,
           batch_number = ?,
           purchase_date = ?,
           install_date = ?,
           warranty_end_date = ?,
           next_service_date = ?,
           notes = ?
       WHERE id = ? AND client_id = ?`,
      [
        nullIfEmpty(product_id),
        product_name,
        nullIfEmpty(serial_number),
        nullIfEmpty(batch_number),
        nullIfEmpty(purchase_date),
        nullIfEmpty(install_date),
        nullIfEmpty(warranty_end_date),
        nullIfEmpty(next_service_date),
        nullIfEmpty(notes),
        clientProductId,
        clientId,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM client_products WHERE id = ? AND client_id = ?', [clientProductId, clientId]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update purchased product' }, { status: 500 });
  }
}
