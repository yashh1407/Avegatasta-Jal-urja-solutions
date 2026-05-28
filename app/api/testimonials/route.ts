import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { getCached } from '@/lib/cache';

const TESTIMONIALS_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    const rows = await getCached(
      'public-testimonials',
      TESTIMONIALS_TTL_MS,
      async () => {
        await initDB();
        const [result] = await pool.query(
          'SELECT id, name, role, location, rating, text, image_url, display_order FROM testimonials WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
        );
        return result;
      }
    );

    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}
