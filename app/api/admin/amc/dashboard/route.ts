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

    const [[counts]] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN ca.status = 'active' AND ca.end_date >= CURDATE() THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN ca.status = 'expired' OR ca.end_date < CURDATE() THEN 1 ELSE 0 END) AS expired,
        SUM(CASE WHEN ca.status = 'renewed' THEN 1 ELSE 0 END) AS renewed,
        SUM(CASE WHEN ca.status = 'active' AND ca.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS expiring_soon
      FROM client_amc ca
      INNER JOIN client_products cp ON cp.id = ca.client_product_id
      INNER JOIN clients c ON c.id = cp.client_id
      INNER JOIN amc_plans ap ON ap.id = ca.amc_plan_id
    `) as unknown as [Record<string, number>[]];

    const [[revenue]] = await pool.query(`
      SELECT
        SUM(ap.price) AS total_revenue,
        SUM(CASE WHEN ca.status = 'active' AND ca.end_date >= CURDATE() THEN ap.price ELSE 0 END) AS active_revenue
      FROM client_amc ca
      INNER JOIN client_products cp ON cp.id = ca.client_product_id
      INNER JOIN clients c ON c.id = cp.client_id
      INNER JOIN amc_plans ap ON ap.id = ca.amc_plan_id
    `) as unknown as [Record<string, number>[]];

    return NextResponse.json({
      counts: {
        total: Number(counts.total) || 0,
        active: Number(counts.active) || 0,
        expired: Number(counts.expired) || 0,
        renewed: Number(counts.renewed) || 0,
        expiring_soon: Number(counts.expiring_soon) || 0,
      },
      revenue: {
        total: Number(revenue.total_revenue) || 0,
        active: Number(revenue.active_revenue) || 0,
      },
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch AMC dashboard' }, { status: 500 });
  }
}
