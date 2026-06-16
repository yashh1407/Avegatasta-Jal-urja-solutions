import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { clientSchema } from '@/lib/validation';

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';
  const productId = searchParams.get('product_id') || '';

  try {
    await initDB();

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (q) {
      conditions.push('(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.company_name LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    if (dateFrom) {
      conditions.push('c.created_at >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('c.created_at <= ?');
      params.push(dateTo + ' 23:59:59');
    }
    if (productId) {
      conditions.push('EXISTS (SELECT 1 FROM client_products cp WHERE cp.client_id = c.id AND cp.product_id = ?)');
      params.push(productId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(cp.id) AS product_count
       FROM clients c
       LEFT JOIN client_products cp ON cp.client_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      params
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
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

  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, email, phone, address, city, state, pincode, company_name, notes, gstin } = parsed.data;
  const { product_id, product_name, source_inquiry_id, source_inquiry_type } = body as { product_id?: string; product_name?: string; source_inquiry_id?: number; source_inquiry_type?: 'general' | 'product' };

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO clients (name, email, phone, address, city, state, pincode, company_name, notes, gstin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        company_name || null,
        notes || null,
        gstin || null,
      ]
    );
    const id = (result as { insertId: number }).insertId;

    if (product_name) {
      await pool.query(
        `INSERT INTO client_products (client_id, product_id, product_name, purchase_date) VALUES (?, ?, ?, CURDATE())`,
        [id, product_id || null, product_name]
      );
    }

    if (source_inquiry_id && source_inquiry_type) {
      if (source_inquiry_type === 'general') {
        await pool.query('UPDATE inquiries SET client_id = ? WHERE id = ?', [id, source_inquiry_id]);
      } else if (source_inquiry_type === 'product') {
        await pool.query('UPDATE product_inquiries SET client_id = ? WHERE id = ?', [id, source_inquiry_id]);
      }
    }

    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
