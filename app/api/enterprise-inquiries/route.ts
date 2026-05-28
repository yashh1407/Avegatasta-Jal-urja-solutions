import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';
import { enterpriseInquirySchema } from '@/lib/validation';
import { sendOwnerNotification, enterpriseInquiryNotificationHtml } from '@/lib/mailer';

export async function POST(request: Request) {
  const { ok } = rateLimit(`enterprise-inquiries:${getClientIp(request)}`);
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = enterpriseInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, company, designation, phone, email, project_type, scale, message } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      'INSERT INTO enterprise_inquiries (name, company, designation, phone, email, project_type, scale, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, company, designation ?? null, phone, email, project_type ?? null, scale ?? null, message]
    );

    const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    sendOwnerNotification(
      `New Enterprise Inquiry: ${company}`,
      enterpriseInquiryNotificationHtml({ name, company, designation, phone, email, project_type, scale, message, submittedAt })
    ).catch((err) => console.error('[mailer] enterprise-inquiry notification failed:', err));

    return NextResponse.json({ success: true, id: (result as { insertId: number }).insertId });
  } catch (error) {
    console.error('Error saving enterprise inquiry:', error);
    return NextResponse.json({ success: false, error: 'Failed to save inquiry' }, { status: 500 });
  }
}
