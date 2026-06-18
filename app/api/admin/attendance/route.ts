import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import pool, { initDB } from '@/lib/db';

export async function GET(req: Request) {
  // Guard this under 'employees' module permission
  const { session, error } = await requireAdminSession('employees');
  if (error) return error;

  try {
    const url = new URL(req.url);
    const filterUserId = url.searchParams.get('userId');
    const filterStartDate = url.searchParams.get('startDate');
    const filterEndDate = url.searchParams.get('endDate');
    const filterStatus = url.searchParams.get('status');

    await initDB();

    // 1. Build Query for Attendance Records
    let query = `
      SELECT sa.*, au.name as agent_name, au.email as agent_email
      FROM sales_attendance sa
      JOIN admin_users au ON sa.user_id = au.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filterUserId) {
      query += ' AND sa.user_id = ?';
      params.push(Number(filterUserId));
    }
    if (filterStartDate) {
      query += ' AND sa.check_in_time >= ?';
      params.push(`${filterStartDate} 00:00:00`);
    }
    if (filterEndDate) {
      query += ' AND sa.check_in_time <= ?';
      params.push(`${filterEndDate} 23:59:59`);
    }
    if (filterStatus) {
      query += ' AND sa.status = ?';
      params.push(filterStatus);
    }

    query += ' ORDER BY sa.check_in_time DESC';

    const [attendanceRows] = await pool.query(query, params);
    const attendanceRecords = attendanceRows as any[];

    // 2. Fetch associated marketing visits for these attendance records (avoiding N+1 queries)
    if (attendanceRecords.length > 0) {
      const attendanceIds = attendanceRecords.map(r => r.id);
      
      // SQL placeholder builder
      const placeholders = attendanceIds.map(() => '?').join(',');
      const [visitRows] = await pool.query(
        `SELECT mv.*, au.name as agent_name
         FROM marketing_visits mv
         JOIN admin_users au ON mv.user_id = au.id
         WHERE mv.attendance_id IN (${placeholders})
         ORDER BY mv.created_at ASC`,
        attendanceIds
      );
      
      const visits = visitRows as any[];

      // Map visits back to their shift record
      attendanceRecords.forEach(record => {
        record.visits = visits.filter(v => v.attendance_id === record.id);
      });
    } else {
      attendanceRecords.forEach(record => {
        record.visits = [];
      });
    }

    // 3. Fetch list of all users/agents for filters dropdown
    const [userRows] = await pool.query(
      'SELECT id, name, email, role FROM admin_users ORDER BY name ASC'
    );
    const usersList = userRows as any[];

    return NextResponse.json({
      success: true,
      records: attendanceRecords,
      users: usersList
    });

  } catch (err: any) {
    console.error('[Admin Attendance API] Error:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}
