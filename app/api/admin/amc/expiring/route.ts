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

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30', 10);
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return NextResponse.json({ error: 'days must be between 1 and 365' }, { status: 400 });
  }

  try {
    await initDB();
    await cleanupOrphanAmcRecords();
    const [rows] = await pool.query(
      `SELECT ca.id, ca.client_product_id, ca.start_date, ca.end_date, ca.status,
              cp.product_name, cp.serial_number,
              c.id AS client_id, c.name AS client_name, c.phone AS client_phone,
              ap.name AS plan_name, ap.price
       FROM client_amc ca
       JOIN client_products cp ON cp.id = ca.client_product_id
       JOIN clients c ON c.id = cp.client_id
       JOIN amc_plans ap ON ap.id = ca.amc_plan_id
       WHERE ca.status = 'active'
         AND ca.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY ca.end_date ASC`,
      [days]
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch expiring AMCs' }, { status: 500 });
  }
}
