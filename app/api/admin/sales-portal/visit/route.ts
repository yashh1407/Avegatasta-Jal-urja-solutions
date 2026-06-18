import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import pool, { initDB } from '@/lib/db';
import { resolveAddress } from '@/lib/geocoding';

export async function POST(req: Request) {
  const { session, error } = await requireAdminSession();
  if (error) return error;

  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'User session invalid' }, { status: 400 });
  }

  try {
    const { visitTitle, notes, imageUrl, latitude, longitude, accuracy, method } = await req.json();

    if (!visitTitle) {
      return NextResponse.json({ error: 'Visit title (e.g. Shop Name) is required.' }, { status: 400 });
    }
    if (!imageUrl) {
      return NextResponse.json({ error: 'Visit photo proof is required.' }, { status: 400 });
    }
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Location coordinates are required.' }, { status: 400 });
    }

    await initDB();

    // 1. Verify user has an active checked_in shift
    const [attendance] = await pool.query(
      'SELECT id FROM sales_attendance WHERE user_id = ? AND status = "checked_in" LIMIT 1',
      [userId]
    );
    const activeShift = (attendance as any[])[0];
    if (!activeShift) {
      return NextResponse.json({ error: 'You must be Checked In to log a marketing visit.' }, { status: 400 });
    }

    // Resolve human-readable visit address
    const visitAddress = await resolveAddress(latitude, longitude);

    // 2. Insert marketing visit log
    const [result] = await pool.query(
      `INSERT INTO marketing_visits 
       (user_id, attendance_id, latitude, longitude, location_accuracy, location_method, visit_title, notes, image_url, visit_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        activeShift.id,
        latitude,
        longitude,
        accuracy !== undefined ? accuracy : null,
        method || 'gps',
        visitTitle,
        notes || null,
        imageUrl,
        visitAddress
      ]
    );

    const insertId = (result as any).insertId;
    const [newRow] = await pool.query('SELECT * FROM marketing_visits WHERE id = ?', [insertId]);

    return NextResponse.json({
      success: true,
      message: 'Marketing visit logged successfully',
      visit: (newRow as any[])[0]
    });

  } catch (err: any) {
    console.error('[Sales Portal Visit API] Error:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}
