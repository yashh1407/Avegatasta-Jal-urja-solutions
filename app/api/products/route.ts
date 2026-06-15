import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM products ORDER BY name ASC');
    const products = (rows as any[]).map((row) => ({
      ...row,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []),
      specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || {}),
      inStock: Boolean(row.inStock),
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products from DB:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
