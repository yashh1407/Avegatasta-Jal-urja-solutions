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
      `SELECT query, COUNT(*) AS count
       FROM client_events
       WHERE event_type = 'search'
         AND query IS NOT NULL
         AND query != ''
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY query
       ORDER BY count DESC
       LIMIT ?`,
      [days, limit]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/admin/analytics/top-searches error:', err);
    return NextResponse.json({ error: 'Failed to fetch top searches' }, { status: 500 });
  }
}
