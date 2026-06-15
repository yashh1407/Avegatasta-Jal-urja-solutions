import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { productMatchesHierarchy } from '@/lib/productHierarchy';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toLowerCase() || '';
  const category = searchParams.get('category')?.trim() || '';
  const brand = searchParams.get('brand')?.trim() || '';

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM products');
    const products = (rows as any[]).map((row) => ({
      ...row,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []),
      specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || {}),
      inStock: Boolean(row.inStock),
    }));

    let result = products;

    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (category) {
      result = result.filter((p) => productMatchesHierarchy(p, category));
    }
    if (brand) {
      result = result.filter((p) => p.brand === brand);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to search products in DB:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
