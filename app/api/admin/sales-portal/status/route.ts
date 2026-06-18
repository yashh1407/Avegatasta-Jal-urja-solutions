import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import pool, { initDB } from '@/lib/db';

export async function GET() {
  const { session, error } = await requireAdminSession();
  if (error) return error;

  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'User session invalid' }, { status: 400 });
  }

  try {
    await initDB();

    // 1. Fetch any active checked_in attendance record
    const [attendanceRows] = await pool.query(
      'SELECT * FROM sales_attendance WHERE user_id = ? AND status = "checked_in" LIMIT 1',
      [userId]
    );
    const activeShift = (attendanceRows as any[])[0] || null;

    let visits: any[] = [];
    if (activeShift) {
      // 2. Fetch marketing visits logged during this active shift
      const [visitRows] = await pool.query(
        'SELECT * FROM marketing_visits WHERE attendance_id = ? ORDER BY created_at DESC',
        [activeShift.id]
      );
      visits = visitRows as any[];
    }

    // 3. Fetch recent shifts logged today (completed or checked_in)
    const [recentShiftsRows] = await pool.query(
      'SELECT * FROM sales_attendance WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE() ORDER BY created_at DESC',
      [userId]
    );
    const todayShifts = recentShiftsRows as any[];

    return NextResponse.json({
      success: true,
      activeShift,
      visits,
      todayShifts
    });
  } catch (err: any) {
    console.error('[Sales Portal Status API] Error:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}
