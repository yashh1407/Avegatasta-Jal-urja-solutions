import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

type CategoryList = { list_title: string; items: string[]; display_order?: number };
type CategoryInput = { name: string; description?: string; display_order?: number; lists?: CategoryList[] };

/**
 * PATCH /api/admin/services/[id]/categories
 * Full replace of all categories + their lists for a service.
 * Body: array of { name, description?, display_order?, lists?: [{list_title, items, display_order?}] }
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const categories = body as CategoryInput[];
  if (!Array.isArray(categories)) {
    return NextResponse.json({ error: 'Body must be an array of categories' }, { status: 422 });
  }

  const conn = await (pool as import('mysql2/promise').Pool).getConnection();
  try {
    await initDB();

    // Verify service exists
    const [svcRows] = await conn.query('SELECT id FROM services WHERE id = ?', [id]) as [Array<{ id: number }>, unknown];
    if (svcRows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    await conn.beginTransaction();

    // Delete existing categories (cascades to lists via FK)
    await conn.query('DELETE FROM service_categories WHERE service_id = ?', [id]);

    // Re-insert
    for (let ci = 0; ci < categories.length; ci++) {
      const cat = categories[ci];
      const [catResult] = await conn.query(
        `INSERT INTO service_categories (service_id, name, description, display_order) VALUES (?, ?, ?, ?)`,
        [id, cat.name, cat.description || null, cat.display_order ?? ci + 1]
      ) as [{ insertId: number }, unknown];
      const categoryId = catResult.insertId;

      for (let li = 0; li < (cat.lists ?? []).length; li++) {
        const lst = cat.lists![li];
        await conn.query(
          `INSERT INTO service_category_lists (category_id, list_title, items, display_order) VALUES (?, ?, ?, ?)`,
          [categoryId, lst.list_title, JSON.stringify(lst.items), lst.display_order ?? li + 1]
        );
      }
    }

    await conn.commit();

    // Return updated categories
    const [updatedCats] = await conn.query(
      'SELECT * FROM service_categories WHERE service_id = ? ORDER BY display_order',
      [id]
    ) as [Array<Record<string, unknown>>, unknown];
    const [updatedLists] = await conn.query(
      `SELECT scl.* FROM service_category_lists scl
       JOIN service_categories sc ON scl.category_id = sc.id
       WHERE sc.service_id = ? ORDER BY scl.display_order`,
      [id]
    ) as [Array<Record<string, unknown>>, unknown];

    const listsByCat = new Map<number, unknown[]>();
    for (const l of updatedLists) {
      const cid = l.category_id as number;
      if (!listsByCat.has(cid)) listsByCat.set(cid, []);
      listsByCat.get(cid)!.push({ ...l, items: typeof l.items === 'string' ? JSON.parse(l.items) : l.items });
    }

    const result = updatedCats.map(c => ({
      ...c,
      lists: listsByCat.get(c.id as number) ?? [],
    }));

    return NextResponse.json(result);
  } catch (err) {
    await conn.rollback();
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update categories' }, { status: 500 });
  } finally {
    conn.release();
  }
}
