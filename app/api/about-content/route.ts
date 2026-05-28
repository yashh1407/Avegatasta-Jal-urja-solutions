import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { getCached } from '@/lib/cache';

const ABOUT_CONTENT_TTL_MS = 10 * 60 * 1000;

export async function GET() {
  try {
    const rows = await getCached('public-about-content', ABOUT_CONTENT_TTL_MS, async () => {
      await initDB();
      const [result] = await pool.query('SELECT * FROM about_content ORDER BY section');
      return result;
    });

    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}
