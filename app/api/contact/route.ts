import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';
import { contactSchema } from '@/lib/validation';
import { sendOwnerNotification, contactNotificationHtml } from '@/lib/mailer';
import { sendEmail, getSiteSettings } from '@/lib/email';
import { requireAdminSession } from '@/lib/admin-auth';

export async function POST(req: Request) {
  const { ok } = rateLimit(`contact:${getClientIp(req)}`);
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, email, phone, subject, message } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone ?? null, subject ?? null, message]
    );
    const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Send auto-reply email to submitter
    sendEmail({
      to: email,
      templateSlug: 'contact-auto-reply',
      variables: {
        name,
        email,
        phone: phone || '',
        subject: subject || '',
        message,
      },
    }).catch((err) => console.error('[email] auto-reply failed:', err));

    // Send internal notification to company email and via legacy notification
    const siteSettings = await getSiteSettings();
    if (siteSettings.company_email) {
      sendEmail({
        to: siteSettings.company_email,
        templateSlug: 'team-notification',
        variables: {
          name,
          email,
          phone: phone || '',
          subject: subject || '',
          message,
        },
      }).catch((err) => console.error('[email] team notification failed:', err));
    }

    sendOwnerNotification(
      `New Contact Form Submission from ${name}`,
      contactNotificationHtml({ name, email, phone, subject, message, submittedAt })
    ).catch((err) => console.error('[mailer] contact notification failed:', err));

    return NextResponse.json({ success: true, id: (result as { insertId: number }).insertId });
  } catch (error) {
    console.error('Error saving message to MySQL:', error);
    return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 });
  }
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching messages from MySQL:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'Valid numeric ID required' }, { status: 400 });
    }

    await initDB();
    await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
