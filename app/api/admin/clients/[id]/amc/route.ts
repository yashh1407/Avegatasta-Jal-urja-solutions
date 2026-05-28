import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { clientAmcSchema } from '@/lib/validation';

function parseId(value: string) {
  const id = parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawClientId } = await params;
  const clientId = parseId(rawClientId);
  if (!clientId) return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });

  try {
    await initDB();
    const [rows] = await pool.query(
      `SELECT ca.*, cp.product_name, cp.serial_number, ap.name AS plan_name, ap.duration_months, ap.price
       FROM client_amc ca
       JOIN client_products cp ON cp.id = ca.client_product_id
       JOIN amc_plans ap ON ap.id = ca.amc_plan_id
       WHERE cp.client_id = ?
       ORDER BY ca.created_at DESC`,
      [clientId]
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch client AMCs' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawClientId } = await params;
  const clientId = parseId(rawClientId);
  if (!clientId) return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = clientAmcSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { amc_plan_id, client_product_id, start_date, end_date, status, notes } = parsed.data;

  try {
    await initDB();

    // Ensure the client_product belongs to this client
    const [cpRows] = await pool.query(
      'SELECT id FROM client_products WHERE id = ? AND client_id = ?',
      [client_product_id, clientId]
    );
    if ((cpRows as unknown[]).length === 0) {
      return NextResponse.json({ error: 'Product not found for this client' }, { status: 404 });
    }

    const [result] = await pool.query(
      `INSERT INTO client_amc (client_product_id, amc_plan_id, start_date, end_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [client_product_id, amc_plan_id, start_date, end_date, status, notes || null]
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query(
      `SELECT ca.*, cp.product_name, cp.serial_number, ap.name AS plan_name, ap.duration_months, ap.price
       FROM client_amc ca
       JOIN client_products cp ON cp.id = ca.client_product_id
       JOIN amc_plans ap ON ap.id = ca.amc_plan_id
       WHERE ca.id = ?`,
      [id]
    );
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create client AMC' }, { status: 500 });
  }
}
