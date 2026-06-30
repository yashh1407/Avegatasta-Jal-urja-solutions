import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query(
      "SELECT id, name, email, mobile_number AS phone, 'sales_person' AS role, 'active' AS status FROM admin_users WHERE role = 'sales' ORDER BY name"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch sales team' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Sales team members must be managed from the Employees section' },
    { status: 405 }
  );
}
