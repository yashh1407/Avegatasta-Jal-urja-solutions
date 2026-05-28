import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireClientSession } from '@/lib/client-auth-guard';

export async function GET() {
  const { session, error } = await requireClientSession();
  if (error) return error;

  try {
    await initDB();

    const [rows] = await pool.query(
      `SELECT
         cp.id,
         cp.product_id,
         cp.product_name,
         cp.serial_number,
         cp.purchase_date,
         cp.install_date,
         cp.warranty_end_date,
         cp.next_service_date,
         ca.id          AS amc_id,
         ca.start_date  AS amc_start,
         ca.end_date    AS amc_end,
         ca.status      AS amc_status,
         ap.name        AS amc_plan_name,
         ap.coverage_description AS amc_coverage
       FROM client_products cp
       LEFT JOIN client_amc ca ON ca.client_product_id = cp.id AND ca.status = 'active'
       LEFT JOIN amc_plans ap  ON ap.id = ca.amc_plan_id
       WHERE cp.client_id = ?
       ORDER BY cp.purchase_date DESC`,
      [session.clientId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/client/me/products error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
