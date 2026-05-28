import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { products } from '@/lib/data';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [pricingRows] = await pool.query('SELECT * FROM product_pricing');
    const pricingMap = new Map(
      (pricingRows as Array<{ product_id: string; dp_price: number | null; mrp_price: number | null; notes: string | null }>)
        .map((p) => [p.product_id, p])
    );

    const merged = products.map((p) => {
      const pricing = pricingMap.get(p.id);
      return {
        product_id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        image: p.image,
        dp_price: pricing?.dp_price ?? null,
        mrp_price: pricing?.mrp_price ?? null,
      };
    });

    return NextResponse.json(merged);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
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

  const { product_id, dp_price, mrp_price, notes } = body as Record<string, unknown>;

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 422 });
  }

  try {
    await initDB();
    await pool.query(
      `INSERT INTO product_pricing (product_id, dp_price, mrp_price, notes)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE dp_price = VALUES(dp_price), mrp_price = VALUES(mrp_price), notes = VALUES(notes)`,
      [product_id, dp_price ?? null, mrp_price ?? null, notes ?? null]
    );
    const [rows] = await pool.query('SELECT * FROM product_pricing WHERE product_id = ?', [product_id]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to upsert pricing' }, { status: 500 });
  }
}
