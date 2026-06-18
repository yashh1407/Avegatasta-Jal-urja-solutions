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
    const { action, latitude, longitude, accuracy, ip, method } = await req.json();

    if (action !== 'checkin' && action !== 'checkout') {
      return NextResponse.json({ error: 'Invalid action. Must be checkin or checkout' }, { status: 400 });
    }

    await initDB();

    if (action === 'checkin') {
      // 1. Verify if user is already checked in
      const [existing] = await pool.query(
        'SELECT id FROM sales_attendance WHERE user_id = ? AND status = "checked_in" LIMIT 1',
        [userId]
      );
      if ((existing as any[]).length > 0) {
        return NextResponse.json({ error: 'You are already checked in.' }, { status: 400 });
      }

      // Resolve human-readable check-in address
      let checkInAddress = null;
      if (latitude !== undefined && longitude !== undefined) {
        checkInAddress = await resolveAddress(latitude, longitude);
      }

      // 2. Perform Check-In
      const [result] = await pool.query(
        `INSERT INTO sales_attendance 
         (user_id, check_in_time, check_in_latitude, check_in_longitude, check_in_accuracy, check_in_ip, check_in_method, check_in_address, status) 
         VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, 'checked_in')`,
        [
          userId,
          latitude !== undefined ? latitude : null,
          longitude !== undefined ? longitude : null,
          accuracy !== undefined ? accuracy : null,
          ip || null,
          method || null,
          checkInAddress
        ]
      );

      const insertId = (result as any).insertId;
      const [newRow] = await pool.query('SELECT * FROM sales_attendance WHERE id = ?', [insertId]);

      return NextResponse.json({
        success: true,
        message: 'Successfully checked in',
        attendance: (newRow as any[])[0]
      });

    } else {
      // 3. Find the active check-in record
      const [existing] = await pool.query(
        'SELECT * FROM sales_attendance WHERE user_id = ? AND status = "checked_in" LIMIT 1',
        [userId]
      );
      const activeRecord = (existing as any[])[0];
      if (!activeRecord) {
        return NextResponse.json({ error: 'No active check-in found to check out from.' }, { status: 400 });
      }

      // Resolve human-readable check-out address
      let checkOutAddress = null;
      if (latitude !== undefined && longitude !== undefined) {
        checkOutAddress = await resolveAddress(latitude, longitude);
      }

      // 4. Perform Check-Out (calculate elapsed duration in minutes)
      await pool.query(
        `UPDATE sales_attendance 
         SET check_out_time = NOW(), 
             check_out_latitude = ?, 
             check_out_longitude = ?, 
             check_out_accuracy = ?, 
             check_out_ip = ?, 
             check_out_method = ?, 
             check_out_address = ?,
             work_duration_minutes = TIMESTAMPDIFF(MINUTE, check_in_time, NOW()), 
             status = 'completed' 
         WHERE id = ?`,
        [
          latitude !== undefined ? latitude : null,
          longitude !== undefined ? longitude : null,
          accuracy !== undefined ? accuracy : null,
          ip || null,
          method || null,
          checkOutAddress,
          activeRecord.id
        ]
      );

      const [updatedRow] = await pool.query('SELECT * FROM sales_attendance WHERE id = ?', [activeRecord.id]);

      return NextResponse.json({
        success: true,
        message: 'Successfully checked out',
        attendance: (updatedRow as any[])[0]
      });
    }

  } catch (err: any) {
    console.error('[Sales Portal Attendance API] Error:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}
