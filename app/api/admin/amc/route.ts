import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

async function cleanupOrphanAmcRecords() {
  await pool.query(`
    DELETE ca FROM client_amc ca
    LEFT JOIN client_products cp ON cp.id = ca.client_product_id
    LEFT JOIN clients c ON c.id = cp.client_id
    LEFT JOIN amc_plans ap ON ap.id = ca.amc_plan_id
    WHERE cp.id IS NULL OR c.id IS NULL OR ap.id IS NULL
  `);
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    await cleanupOrphanAmcRecords();
    const [rows] = await pool.query(
      `SELECT ca.id, ca.client_product_id, ca.amc_plan_id, ca.start_date, ca.end_date,
              ca.status, ca.notes, ca.created_at,
              cp.product_name, cp.serial_number,
              c.id AS client_id, c.name AS client_name, c.phone AS client_phone,
              ap.name AS plan_name, ap.price, ap.duration_months
       FROM client_amc ca
       JOIN client_products cp ON cp.id = ca.client_product_id
       JOIN clients c ON c.id = cp.client_id
       JOIN amc_plans ap ON ap.id = ca.amc_plan_id
       ORDER BY ca.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch client AMCs' }, { status: 500 });
  }
}
