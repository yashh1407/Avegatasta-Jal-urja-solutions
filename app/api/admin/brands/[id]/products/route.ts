import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

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
    const [brand] = await pool.query('SELECT id FROM brands WHERE id = ?', [id]);
    if (!(brand as unknown[]).length) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });

    const [rows] = await pool.query(
      `SELECT pba.id, pba.product_id, pba.created_at, pp.dp_price, pp.mrp_price, pp.notes as pricing_notes
       FROM product_brand_assignments pba
       LEFT JOIN product_pricing pp ON pp.product_id = pba.product_id
       WHERE pba.brand_id = ?
       ORDER BY pba.product_id ASC`,
      [id]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch brand products' }, { status: 500 });
  }
}
