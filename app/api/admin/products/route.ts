import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { z } from 'zod';

const productSchema = z.object({
  id: z.string().min(2).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'ID must contain only letters, numbers, hyphens, and underscores'),
  name: z.string().min(1).max(255),
  brand: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  subCategory: z.string().max(100).optional().nullable(),
  description: z.string().min(1),
  image: z.string().min(1).max(500),
  features: z.array(z.string()),
  specs: z.record(z.string(), z.string()),
  inStock: z.boolean(),
  hsn_code: z.string().max(50).optional().nullable(),
  sac_code: z.string().max(50).optional().nullable(),
});

export async function GET() {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const safeParse = (v: unknown, fallback: unknown) => {
      if (typeof v !== 'string') return v ?? fallback;
      try { return JSON.parse(v); } catch { return fallback; }
    };
    const products = (rows as any[]).map((row) => ({
      ...row,
      features: safeParse(row.features, []),
      specs: safeParse(row.specs, {}),
      inStock: Boolean(row.inStock),
    }));
    return NextResponse.json(products);
  } catch (err) {
    console.error('Failed to fetch admin products:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { id, name, brand, category, subCategory, description, image, features, specs, inStock, hsn_code, sac_code } = parsed.data;

  try {
    await initDB();

    // Check if product with this ID already exists
    const [exists] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if ((exists as any[]).length > 0) {
      return NextResponse.json({ error: { id: ['A product with this ID already exists.'] } }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO products (id, name, brand, category, subCategory, description, image, features, specs, inStock, hsn_code, sac_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        brand,
        category,
        subCategory || null,
        description,
        image,
        JSON.stringify(features),
        JSON.stringify(specs),
        inStock ? 1 : 0,
        hsn_code || null,
        sac_code || null
      ]
    );

    return NextResponse.json({ success: true, product_id: id });
  } catch (err) {
    console.error('Failed to create product:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updateSchema = productSchema.partial().extend({ id: z.string().min(1) });
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { id, name, brand, category, subCategory, description, image, features, specs, inStock, hsn_code, sac_code } = parsed.data;

  try {
    await initDB();

    // Verify product exists
    const [exists] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if ((exists as any[]).length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (brand !== undefined) { updates.push('brand = ?'); values.push(brand); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (subCategory !== undefined) { updates.push('subCategory = ?'); values.push(subCategory || null); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (image !== undefined) { updates.push('image = ?'); values.push(image); }
    if (features !== undefined) { updates.push('features = ?'); values.push(JSON.stringify(features)); }
    if (specs !== undefined) { updates.push('specs = ?'); values.push(JSON.stringify(specs)); }
    if (inStock !== undefined) { updates.push('inStock = ?'); values.push(inStock ? 1 : 0); }
    if (hsn_code !== undefined) { updates.push('hsn_code = ?'); values.push(hsn_code || null); }
    if (sac_code !== undefined) { updates.push('sac_code = ?'); values.push(sac_code || null); }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return NextResponse.json({ success: true, product_id: id });
  } catch (err) {
    console.error('Failed to update product:', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAdminSession('products');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await initDB();

    // Check if it exists
    const [exists] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if ((exists as any[]).length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete product:', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
