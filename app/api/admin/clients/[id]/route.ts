import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { clientSchema } from '@/lib/validation';

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    await initDB();
    const [clients] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    const client = (clients as unknown[])[0];
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [products] = await pool.query(
      'SELECT * FROM client_products WHERE client_id = ? ORDER BY created_at DESC',
      [id]
    );

    return NextResponse.json({ ...client as object, products });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT(
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

  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, email, phone, address, city, state, pincode, company_name, notes, gstin } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      `UPDATE clients SET name=?, email=?, phone=?, address=?, city=?, state=?, pincode=?, company_name=?, notes=?, gstin=?
       WHERE id=?`,
      [
        name,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        company_name || null,
        notes || null,
        gstin || null,
        id,
      ]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  let connection;
  try {
    await initDB();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [clientRows] = await connection.query('SELECT id FROM clients WHERE id = ?', [id]);
    if ((clientRows as unknown[]).length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Remove dependent records first because the database does not enforce foreign keys.
    await connection.query(
      `DELETE ca FROM client_amc ca
       INNER JOIN client_products cp ON cp.id = ca.client_product_id
       WHERE cp.client_id = ?`,
      [id]
    );
    await connection.query('DELETE FROM client_products WHERE client_id = ?', [id]);
    await connection.query('DELETE FROM client_users WHERE client_id = ?', [id]);
    await connection.query('DELETE FROM client_events WHERE client_id = ?', [id]);
    await connection.query('UPDATE sales_records SET client_id = NULL WHERE client_id = ?', [id]);

    await connection.query('DELETE FROM clients WHERE id = ?', [id]);
    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
