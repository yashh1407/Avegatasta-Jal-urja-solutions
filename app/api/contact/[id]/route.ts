import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

type Params = { params: Promise<{ id: string }> };

const ALLOWED_PATCH_FIELDS = [
  'status',
  'lead_status',
  'priority',
  'is_read',
  'notes',
  'assigned_to',
  'follow_up_date',
  'tags',
] as const;

type PatchField = (typeof ALLOWED_PATCH_FIELDS)[number];

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Valid numeric ID required' }, { status: 400 });
  }

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM contact_messages WHERE id = ?', [id]);
    const messages = rows as unknown[];
    if (messages.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json(messages[0]);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Valid numeric ID required' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 });
  }

  const updates: Partial<Record<PatchField, unknown>> = {};
  for (const field of ALLOWED_PATCH_FIELDS) {
    if (field in (body as Record<string, unknown>)) {
      updates[field] = (body as Record<string, unknown>)[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  try {
    await initDB();

    // Verify message exists
    const [existing] = await pool.query('SELECT id FROM contact_messages WHERE id = ?', [id]);
    if ((existing as unknown[]).length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const setClauses = Object.keys(updates)
      .map((f) => `\`${f}\` = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    await pool.query(`UPDATE contact_messages SET ${setClauses} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM contact_messages WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
