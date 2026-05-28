import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireClientSession } from '@/lib/client-auth-guard';

export async function GET() {
  const { session, error } = await requireClientSession();
  if (error) return error;

  try {
    await initDB();

    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.email, c.phone, c.address, c.city, c.state,
              c.pincode, c.company_name, c.created_at,
              cu.email AS portal_email, cu.last_login
       FROM clients c
       JOIN client_users cu ON cu.client_id = c.id
       WHERE c.id = ? LIMIT 1`,
      [session.clientId]
    );

    const client = (rows as unknown[])[0];
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (err) {
    console.error('GET /api/client/me error:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
