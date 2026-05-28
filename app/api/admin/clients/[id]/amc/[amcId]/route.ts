import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

function parseId(value: string) {
  const id = parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; amcId: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawClientId, amcId: rawAmcId } = await params;
  const clientId = parseId(rawClientId);
  const amcId = parseId(rawAmcId);
  if (!clientId || !amcId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { status } = body as { status?: string };
  const allowed = ['active', 'expired', 'renewed'];
  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ error: 'status must be one of: active, expired, renewed' }, { status: 422 });
  }

  try {
    await initDB();
    // Verify the AMC record belongs to this client
    const [rows] = await pool.query(
      `SELECT ca.id FROM client_amc ca
       JOIN client_products cp ON cp.id = ca.client_product_id
       WHERE ca.id = ? AND cp.client_id = ?`,
      [amcId, clientId]
    );
    if ((rows as unknown[]).length === 0) {
      return NextResponse.json({ error: 'AMC record not found' }, { status: 404 });
    }

    await pool.query('UPDATE client_amc SET status = ? WHERE id = ?', [status, amcId]);

    const [updated] = await pool.query(
      `SELECT ca.*, cp.product_name, cp.serial_number, ap.name AS plan_name, ap.duration_months, ap.price
       FROM client_amc ca
       JOIN client_products cp ON cp.id = ca.client_product_id
       JOIN amc_plans ap ON ap.id = ca.amc_plan_id
       WHERE ca.id = ?`,
      [amcId]
    );
    return NextResponse.json((updated as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update AMC record' }, { status: 500 });
  }
}
