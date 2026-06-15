import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  try {
    await initDB();
    const [pricingRows] = await pool.query('SELECT * FROM product_pricing');
    const pricingMap = new Map(
      (pricingRows as Array<{ product_id: string; dp_price: number | null; mrp_price: number | null; notes: string | null }>)
        .map((p) => [p.product_id, p])
    );

    const [productRows] = await pool.query('SELECT id, name, brand, category, image, hsn_code, sac_code FROM products ORDER BY name ASC');
    const merged = (productRows as any[]).map((p) => {
      const pricing = pricingMap.get(p.id);
      return {
        product_id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        image: p.image,
        dp_price: pricing?.dp_price ?? null,
        mrp_price: pricing?.mrp_price ?? null,
        description: (pricing as any)?.description ?? null,
        hsn_code: p.hsn_code ?? null,
        sac_code: p.sac_code ?? null,
      };
    });

    return NextResponse.json(merged);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { product_id, dp_price, mrp_price, notes, description, hsn_code, sac_code } = body as Record<string, unknown>;

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 422 });
  }

  try {
    await initDB();
    await pool.query(
      `INSERT INTO product_pricing (product_id, dp_price, mrp_price, notes, description)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE dp_price = VALUES(dp_price), mrp_price = VALUES(mrp_price), notes = VALUES(notes), description = VALUES(description)`,
      [product_id, dp_price ?? null, mrp_price ?? null, notes ?? null, description ?? null]
    );

    const productUpdates: string[] = [];
    const productValues: any[] = [];
    if (hsn_code !== undefined) {
      productUpdates.push('hsn_code = ?');
      productValues.push(hsn_code || null);
    }
    if (sac_code !== undefined) {
      productUpdates.push('sac_code = ?');
      productValues.push(sac_code || null);
    }
    if (productUpdates.length > 0) {
      productValues.push(product_id);
      await pool.query(
        `UPDATE products SET ${productUpdates.join(', ')} WHERE id = ?`,
        productValues
      );
    }

    const [rows] = await pool.query('SELECT * FROM product_pricing WHERE product_id = ?', [product_id]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to upsert pricing' }, { status: 500 });
  }
}
