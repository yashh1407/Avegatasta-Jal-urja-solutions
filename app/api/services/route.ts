import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { getCached } from '@/lib/cache';

const SERVICES_TTL_MS = 10 * 60 * 1000;

export async function GET() {
  try {
    const result = await getCached('public-services', SERVICES_TTL_MS, async () => {
      await initDB();
      const [services] = await pool.query(
        'SELECT * FROM services WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
      ) as [Array<Record<string, unknown>>, unknown];
      const [categories] = await pool.query('SELECT * FROM service_categories ORDER BY display_order ASC') as [Array<Record<string, unknown>>, unknown];
      const [lists] = await pool.query('SELECT * FROM service_category_lists ORDER BY display_order ASC') as [Array<Record<string, unknown>>, unknown];

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

      return services.map(s => ({
        ...s,
        why_choose: typeof s.why_choose === 'string' ? JSON.parse(s.why_choose) : s.why_choose,
        categories: categoriesByService.get(s.id as number) ?? [],
      }));
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
