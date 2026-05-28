import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { amcPlanSchema } from '@/lib/validation';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query(
      'SELECT * FROM amc_plans ORDER BY created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch AMC plans' }, { status: 500 });
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

  const parsed = amcPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, duration_months, coverage_description, price, service_interval_days } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO amc_plans (name, duration_months, coverage_description, price, service_interval_days)
       VALUES (?, ?, ?, ?, ?)`,
      [name, duration_months, coverage_description || null, price, service_interval_days]
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM amc_plans WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create AMC plan' }, { status: 500 });
  }
}
