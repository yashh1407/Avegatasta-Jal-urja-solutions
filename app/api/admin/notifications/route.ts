import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { getCached } from '@/lib/cache';

const NOTIFICATIONS_TTL_MS = 30 * 1000;

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const rows = await getCached('admin-notifications', NOTIFICATIONS_TTL_MS, async () => {
      await initDB();

      const query = `
        SELECT id, name, subject as topic, meeting_date, meeting_time, meeting_type, meeting_location, 'general' as type
        FROM inquiries
        WHERE status = 'wants_to_meet'
          AND meeting_date IS NOT NULL
          AND meeting_date >= CURDATE()
          AND meeting_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)

        UNION ALL

        SELECT id, name, product_name as topic, meeting_date, meeting_time, meeting_type, meeting_location, 'product' as type
        FROM product_inquiries
        WHERE status = 'wants_to_meet'
          AND meeting_date IS NOT NULL
          AND meeting_date >= CURDATE()
          AND meeting_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)

        ORDER BY meeting_date ASC, meeting_time ASC
        LIMIT 10
      `;

      const [result] = await pool.query(query);
      return result;
    });

    return NextResponse.json(rows);
  } catch (error) {
    const dbError = error as { code?: string; message?: string };
    console.warn('Failed to fetch notifications:', dbError.code ?? dbError.message ?? error);
    return NextResponse.json([]);
  }
}
