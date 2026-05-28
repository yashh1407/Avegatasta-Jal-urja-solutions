import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const salesUnion = `
      SELECT
        DATE(sr.sale_date) AS sale_date,
        sr.sales_team_id AS sales_team_id,
        st.name AS member_name,
        (sr.unit_price_sold * sr.quantity) AS revenue,
        (COALESCE(sr.dp_price_at_sale, 0) * sr.quantity) AS cost
      FROM sales_records sr
      LEFT JOIN sales_team st ON st.id = sr.sales_team_id

      UNION ALL

      SELECT
        DATE(COALESCE(i.delivered_at, i.created_at)) AS sale_date,
        NULL AS sales_team_id,
        'CRM Delivered Orders' AS member_name,
        i.agreed_price AS revenue,
        0 AS cost
      FROM inquiries i
      WHERE i.status = 'delivered'
        AND i.agreed_price IS NOT NULL

      UNION ALL

      SELECT
        DATE(COALESCE(pi.delivered_at, pi.created_at)) AS sale_date,
        NULL AS sales_team_id,
        'CRM Delivered Orders' AS member_name,
        pi.agreed_price AS revenue,
        COALESCE(pp.dp_price, 0) AS cost
      FROM product_inquiries pi
      LEFT JOIN product_pricing pp ON pp.product_id = pi.product_id
      WHERE pi.status = 'delivered'
        AND pi.agreed_price IS NOT NULL
    `;

    // Today stats
    const [todayRows] = await pool.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(revenue), 0) AS revenue
       FROM (${salesUnion}) all_sales
       WHERE sale_date = ?`,
      [todayStr]
    ) as [Array<{ count: number; revenue: number }>, unknown];

    // This month stats
    const [monthRows] = await pool.query(
      `SELECT
         COUNT(*) AS count,
         COALESCE(SUM(revenue), 0) AS revenue,
         COALESCE(SUM(cost), 0) AS cost
       FROM (${salesUnion}) all_sales
       WHERE sale_date >= ?`,
      [monthStart]
    ) as [Array<{ count: number; revenue: number; cost: number }>, unknown];

    const monthData = monthRows[0];
    const margin = monthData.revenue - monthData.cost;

    // Top performer this month
    const [topRows] = await pool.query(
      `SELECT member_name AS name, COUNT(*) AS count, COALESCE(SUM(revenue), 0) AS revenue
       FROM (${salesUnion}) all_sales
       WHERE sale_date >= ?
       GROUP BY member_name
       ORDER BY revenue DESC
       LIMIT 1`,
      [monthStart]
    ) as [Array<{ name: string; count: number; revenue: number }>, unknown];

    const topPerformer = topRows[0] ?? { name: '', count: 0, revenue: 0 };

    // By member this month
    const [byMemberRows] = await pool.query(
      `SELECT COALESCE(sales_team_id, 0) AS id, member_name AS name, COUNT(*) AS count, COALESCE(SUM(revenue), 0) AS revenue
       FROM (${salesUnion}) all_sales
       WHERE sale_date >= ?
       GROUP BY COALESCE(sales_team_id, 0), member_name
       ORDER BY revenue DESC`,
      [monthStart]
    ) as [Array<{ id: number; name: string; count: number; revenue: number }>, unknown];

    return NextResponse.json({
      today: {
        count: todayRows[0].count,
        revenue: todayRows[0].revenue,
      },
      this_month: {
        count: monthData.count,
        revenue: monthData.revenue,
        cost: monthData.cost,
        margin,
      },
      top_performer: {
        name: topPerformer.name,
        count: topPerformer.count,
        revenue: topPerformer.revenue,
      },
      by_member: byMemberRows,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch sales dashboard' }, { status: 500 });
  }
}
