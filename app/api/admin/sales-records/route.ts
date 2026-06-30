import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('memberId') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  try {
    await initDB();

    const manualConditions: string[] = [];
    const manualParams: unknown[] = [];
    const crmConditions: string[] = [];
    const crmParams: unknown[] = [];

    if (memberId) {
      manualConditions.push('sr.sales_team_id = ?');
      manualParams.push(memberId);
      crmConditions.push('1 = 0');
    }
    if (startDate) {
      manualConditions.push('sr.sale_date >= ?');
      manualParams.push(startDate);
      crmConditions.push('DATE(delivered_sale_date) >= ?');
      crmParams.push(startDate);
    }
    if (endDate) {
      manualConditions.push('sr.sale_date <= ?');
      manualParams.push(endDate);
      crmConditions.push('DATE(delivered_sale_date) <= ?');
      crmParams.push(endDate);
    }

    const manualWhere = manualConditions.length ? `WHERE ${manualConditions.join(' AND ')}` : '';
    const inquiryWhere = crmConditions.length
      ? `AND ${crmConditions.map((condition) => condition.replace('delivered_sale_date', 'COALESCE(i.delivered_at, i.created_at)')).join(' AND ')}`
      : '';
    const productInquiryWhere = crmConditions.length
      ? `AND ${crmConditions.map((condition) => condition.replace('delivered_sale_date', 'COALESCE(pi.delivered_at, pi.created_at)')).join(' AND ')}`
      : '';
    const params = [...manualParams, ...crmParams, ...crmParams, limit];

    const [rows] = await pool.query(
      `SELECT
         *
       FROM (
         SELECT
           CONCAT('manual-', sr.id) AS id,
           sr.sale_date,
           COALESCE(st.name, 'Unassigned') AS member_name,
           sr.product_name,
           c.name AS client_name,
           sr.quantity,
           sr.unit_price_sold,
           sr.dp_price_at_sale,
           sr.mrp_price_at_sale,
           (sr.unit_price_sold - COALESCE(sr.dp_price_at_sale, 0)) AS margin
         FROM sales_records sr
         LEFT JOIN admin_users st ON st.id = sr.sales_team_id
         LEFT JOIN clients c ON c.id = sr.client_id
         ${manualWhere}

         UNION ALL

         SELECT
           CONCAT('inquiry-', i.id) AS id,
           DATE(COALESCE(i.delivered_at, i.created_at)) AS sale_date,
           'CRM Delivered Orders' AS member_name,
           COALESCE(i.subject, 'General Inquiry') AS product_name,
           i.name AS client_name,
           1 AS quantity,
           i.agreed_price AS unit_price_sold,
           NULL AS dp_price_at_sale,
           NULL AS mrp_price_at_sale,
           i.agreed_price AS margin
         FROM inquiries i
         WHERE i.status = 'delivered'
           AND i.agreed_price IS NOT NULL
           ${inquiryWhere}

         UNION ALL

         SELECT
           CONCAT('product-inquiry-', pi.id) AS id,
           DATE(COALESCE(pi.delivered_at, pi.created_at)) AS sale_date,
           'CRM Delivered Orders' AS member_name,
           pi.product_name,
           pi.name AS client_name,
           1 AS quantity,
           pi.agreed_price AS unit_price_sold,
           pp.dp_price AS dp_price_at_sale,
           pp.mrp_price AS mrp_price_at_sale,
           (pi.agreed_price - COALESCE(pp.dp_price, 0)) AS margin
         FROM product_inquiries pi
         LEFT JOIN product_pricing pp ON pp.product_id = pi.product_id COLLATE utf8mb4_general_ci
         WHERE pi.status = 'delivered'
           AND pi.agreed_price IS NOT NULL
           ${productInquiryWhere}
       ) all_records
       ORDER BY sale_date DESC, id DESC
       LIMIT ?`,
      params
    );

    return NextResponse.json(rows, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch sales records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    sales_team_id,
    client_id,
    product_id,
    product_name,
    quantity,
    unit_price_sold,
    dp_price_at_sale,
    mrp_price_at_sale,
    notes,
    sale_date,
  } = body as Record<string, unknown>;

  if (!sales_team_id || !product_id || !product_name || !unit_price_sold || !sale_date) {
    return NextResponse.json(
      { error: 'sales_team_id, product_id, product_name, unit_price_sold, and sale_date are required' },
      { status: 422 }
    );
  }

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO sales_records
         (sales_team_id, client_id, product_id, product_name, quantity, unit_price_sold, dp_price_at_sale, mrp_price_at_sale, notes, sale_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sales_team_id,
        client_id || null,
        product_id,
        product_name,
        quantity || 1,
        unit_price_sold,
        dp_price_at_sale || null,
        mrp_price_at_sale || null,
        notes || null,
        sale_date,
      ]
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM sales_records WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create sales record' }, { status: 500 });
  }
}
