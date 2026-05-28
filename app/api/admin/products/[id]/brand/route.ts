import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { z } from 'zod';

const assignBrandSchema = z.object({
  brand_id: z.number().int().positive().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: productId } = await params;
  if (!productId || productId.length > 255) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = assignBrandSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { brand_id } = parsed.data;

  try {
    await initDB();

    if (brand_id === null) {
      // Remove brand assignment
      await pool.query('DELETE FROM product_brand_assignments WHERE product_id = ?', [productId]);
      return NextResponse.json({ product_id: productId, brand_id: null });
    }

    // Verify brand exists
    const [brands] = await pool.query('SELECT id FROM brands WHERE id = ?', [brand_id]);
    if (!(brands as unknown[]).length) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Upsert brand assignment
    await pool.query(
      `INSERT INTO product_brand_assignments (product_id, brand_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE brand_id = VALUES(brand_id), updated_at = CURRENT_TIMESTAMP`,
      [productId, brand_id]
    );

    return NextResponse.json({ product_id: productId, brand_id });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to assign brand' }, { status: 500 });
  }
}
