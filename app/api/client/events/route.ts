import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireClientSession } from '@/lib/client-auth-guard';
import { clientEventSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const { session, error } = await requireClientSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = clientEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { event_type, entity_id, query } = parsed.data;

  try {
    await initDB();

    await pool.query(
      `INSERT INTO client_events (client_id, event_type, entity_id, query)
       VALUES (?, ?, ?, ?)`,
      [session.clientId, event_type, entity_id ?? null, query ?? null]
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('POST /api/client/events error:', err);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}
