import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { clearCache } from '@/lib/cache';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [services] = await pool.query('SELECT * FROM services ORDER BY display_order ASC, id ASC') as [Array<Record<string, unknown>>, unknown];
    const [categories] = await pool.query('SELECT * FROM service_categories ORDER BY display_order ASC') as [Array<Record<string, unknown>>, unknown];
    const [lists] = await pool.query('SELECT * FROM service_category_lists ORDER BY display_order ASC') as [Array<Record<string, unknown>>, unknown];

    // Nest categories and lists
    const listsByCategory = new Map<number, unknown[]>();
    for (const l of lists) {
      const cid = l.category_id as number;
      if (!listsByCategory.has(cid)) listsByCategory.set(cid, []);
      listsByCategory.get(cid)!.push({ ...l, items: typeof l.items === 'string' ? JSON.parse(l.items) : l.items });
    }

    const categoriesByService = new Map<number, unknown[]>();
    for (const c of categories) {
      const sid = c.service_id as number;
      if (!categoriesByService.has(sid)) categoriesByService.set(sid, []);
      categoriesByService.get(sid)!.push({ ...c, lists: listsByCategory.get(c.id as number) ?? [] });
    }

    const result = services.map(s => ({
      ...s,
      why_choose: typeof s.why_choose === 'string' ? JSON.parse(s.why_choose) : s.why_choose,
      categories: categoriesByService.get(s.id as number) ?? [],
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
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

  const { slug, title, subtitle, icon_name, intro, why_choose, cta_title, cta_desc, display_order, is_active } =
    body as Record<string, unknown>;

  if (!slug || !(slug as string).trim()) {
    return NextResponse.json({ error: 'slug is required' }, { status: 422 });
  }
  if (!title || !(title as string).trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 422 });
  }

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO services (slug, title, subtitle, icon_name, intro, why_choose, cta_title, cta_desc, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        (slug as string).trim(),
        (title as string).trim(),
        subtitle || null,
        icon_name || null,
        intro || null,
        why_choose ? JSON.stringify(why_choose) : null,
        cta_title || null,
        cta_desc || null,
        display_order ?? 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ]
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id]) as [Array<Record<string, unknown>>, unknown];
    const svc = rows[0];
    clearCache('public-services');
    return NextResponse.json({
      ...svc,
      why_choose: typeof svc.why_choose === 'string' ? JSON.parse(svc.why_choose) : svc.why_choose,
      categories: [],
    }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
