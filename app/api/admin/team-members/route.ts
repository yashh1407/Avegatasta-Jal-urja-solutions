import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { teamMemberSchema } from '@/lib/validation';

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const role = searchParams.get('role') || '';
  const status = searchParams.get('status') || '';

  try {
    await initDB();

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (q) {
      conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT * FROM team_members ${where} ORDER BY name ASC`,
      params
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, role, email, phone, avatar_url, status, joined_date } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO team_members (name, role, email, phone, avatar_url, status, joined_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, role, email || null, phone || null, avatar_url || null, status, joined_date || null]
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM team_members WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}
