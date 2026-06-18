import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { clientId } = await params;
  const id = Number(clientId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const daysRaw = Number(searchParams.get('days') ?? 30);
  const limitRaw = Number(searchParams.get('limit') ?? 50);
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(Math.trunc(daysRaw), 1), 365) : 30;
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 500) : 50;

  try {
    await initDB();

    const [events] = await pool.query(
      `SELECT id, event_type, entity_id, query, created_at
       FROM client_events
       WHERE client_id = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY created_at DESC
       LIMIT ?`,
      [id, days, limit]
    );

    const [summary] = await pool.query(
      `SELECT
         COUNT(*) AS total_events,
         SUM(event_type = 'view') AS total_views,
         SUM(event_type = 'search') AS total_searches,
         MIN(created_at) AS first_event,
         MAX(created_at) AS last_event
       FROM client_events
       WHERE client_id = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [id, days]
    );

    return NextResponse.json({
      summary: (summary as unknown[])[0],
      events,
    });
  } catch (err) {
    console.error('GET /api/admin/analytics/client-behavior error:', err);
    return NextResponse.json({ error: 'Failed to fetch client behavior' }, { status: 500 });
  }
}
