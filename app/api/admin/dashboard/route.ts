import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();

    const [
      [messageCountRows],
      [messages],
      [testimonialCountRows],
      [testimonials],
      [settingsRows],
      [notifications],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM contact_messages'),
      pool.query(
        `SELECT id, name, email, phone, subject, message, created_at
         FROM contact_messages
         ORDER BY created_at DESC
         LIMIT 25`
      ),
      pool.query('SELECT COUNT(*) AS count FROM testimonials WHERE is_active = 1'),
      pool.query(
        `SELECT id, name, role, location, rating, text
         FROM testimonials
         WHERE is_active = 1
         ORDER BY display_order ASC, id ASC
         LIMIT 3`
      ),
      pool.query('SELECT `key`, value FROM site_settings ORDER BY `group`, `key`'),
      pool.query(
        `SELECT id, name, subject as topic, meeting_date, meeting_time, meeting_type, meeting_location, 'general' as type
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
         LIMIT 10`
      ),
    ]);

    const siteSettings: Record<string, string | null> = {};
    for (const row of settingsRows as Array<{ key: string; value: string | null }>) {
      siteSettings[row.key] = row.value;
    }

    return NextResponse.json({
      messages,
      testimonials,
      siteSettings,
      notifications,
      stats: {
        messages: (messageCountRows as Array<{ count: number }>)[0]?.count ?? 0,
        testimonials: (testimonialCountRows as Array<{ count: number }>)[0]?.count ?? 0,
        settings: Object.keys(siteSettings).length,
        dbConnected: true,
      },
    });
  } catch (err) {
    const dbError = err as { code?: string; message?: string };
    console.warn('GET /api/admin/dashboard unavailable:', dbError.code ?? dbError.message ?? err);
    return NextResponse.json({
      messages: [],
      testimonials: [],
      siteSettings: {},
      notifications: [],
      error: 'Database unavailable',
      stats: {
        messages: 0,
        testimonials: 0,
        settings: 0,
        dbConnected: false,
      },
    });
  }
}
