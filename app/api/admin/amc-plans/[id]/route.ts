import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { amcPlanSchema } from '@/lib/validation';

function parseId(raw: string) {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM amc_plans WHERE id = ?', [id]);
    const plan = (rows as unknown[])[0];
    if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(plan);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch AMC plan' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

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
      `UPDATE amc_plans SET name=?, duration_months=?, coverage_description=?, price=?, service_interval_days=?
       WHERE id=?`,
      [name, duration_months, coverage_description || null, price, service_interval_days, id]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const [rows] = await pool.query('SELECT * FROM amc_plans WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update AMC plan' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  let connection;
  try {
    await initDB();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [planRows] = await connection.query('SELECT id FROM amc_plans WHERE id = ?', [id]);
    if ((planRows as unknown[]).length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Remove assigned AMCs for this plan first so deleted plans are not counted as active.
    await connection.query('DELETE FROM client_amc WHERE amc_plan_id = ?', [id]);
    await connection.query('DELETE FROM amc_plans WHERE id = ?', [id]);
    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete AMC plan' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
