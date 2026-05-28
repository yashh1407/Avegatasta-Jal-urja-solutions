import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100);
  const days = Number(searchParams.get('days') ?? 30);

  try {
    await initDB();

    const [rows] = await pool.query(
      `SELECT entity_id AS product_id, COUNT(*) AS view_count
       FROM client_events
       WHERE event_type = 'view'
         AND entity_id IS NOT NULL
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY entity_id
       ORDER BY view_count DESC
       LIMIT ?`,
      [days, limit]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/admin/analytics/top-viewed error:', err);
    return NextResponse.json({ error: 'Failed to fetch top viewed' }, { status: 500 });
  }
}
