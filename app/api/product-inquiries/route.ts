import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';
import { productInquirySchema } from '@/lib/validation';
import { sendOwnerNotification, productInquiryNotificationHtml } from '@/lib/mailer';
import { requireAdminSession } from '@/lib/admin-auth';

const ALLOWED_STATUSES = [
  'new',
  'in_progress',
  'resolved',
  'closed',
  'spam',
  'enquiry_generation',
  'follow_up',
  'wants_to_meet',
  'meeting_done',
  'quotation_sent',
  'quotation_followup',
  'order_confirmed',
  'delivery_in_progress',
  'delivered',
];

const has = (body: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(body, key);

const optionalString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : null;

const optionalPrice = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const hasValidAgreedPrice = (value: number | string | null) =>
  value !== null && Number.isFinite(Number(value)) && Number(value) > 0;

import { decryptCaptcha } from '@/lib/captcha';

export async function POST(request: Request) {
  const { ok } = rateLimit(`product-inquiries:${getClientIp(request)}`);
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Decrypt and verify CAPTCHA
  const { captchaToken, captchaInput } = (body || {}) as { captchaToken?: string; captchaInput?: string };
  if (!captchaToken || !captchaInput) {
    return NextResponse.json({ error: 'Security verification code is required.' }, { status: 400 });
  }

  const expectedCode = decryptCaptcha(captchaToken);
  if (!expectedCode || expectedCode.toLowerCase() !== captchaInput.toLowerCase()) {
    return NextResponse.json({ error: 'Incorrect security verification code. Please try again.' }, { status: 400 });
  }

  const parsed = productInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, phone, email, message, productName, productId, gstin } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      'INSERT INTO product_inquiries (product_id, product_name, name, phone, email, message, gstin) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [productId ?? null, productName, name, phone, email || null, message, gstin ?? null]
    );

    const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    sendOwnerNotification(
      `New Inquiry: ${productName}`,
      productInquiryNotificationHtml({ name, phone, email: email || undefined, message, productName, gstin, submittedAt })
    ).catch((err) => console.error('[mailer] product-inquiry notification failed:', err));

    return NextResponse.json({ success: true, id: (result as { insertId: number }).insertId });
  } catch (error) {
    console.error('Error saving product inquiry:', error);
    return NextResponse.json({ success: false, error: 'Failed to save inquiry' }, { status: 500 });
  }
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM product_inquiries ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching product inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
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
    await pool.query('DELETE FROM product_inquiries WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const body = await request.json() as Record<string, unknown>;
    const { 
      id, name, phone, email, message, 
      status, meeting_date, meeting_time, meeting_type, meeting_location, agreed_price 
    } = body;
    
    if (!id || !/^\d+$/.test(String(id))) {
      return NextResponse.json({ error: 'Valid numeric ID required' }, { status: 400 });
    }

    if (status && !ALLOWED_STATUSES.includes(String(status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await initDB();

    const [currentRows] = await pool.query('SELECT * FROM product_inquiries WHERE id = ? LIMIT 1', [id]);
    const current = (currentRows as Array<{
      name: string;
      phone: string;
      email: string | null;
      message: string;
      status: string;
      agreed_price: number | string | null;
      meeting_date: string | null;
      meeting_time: string | null;
      meeting_type: string | null;
      meeting_location: string | null;
    }>)[0];

    if (!current) {
      return NextResponse.json({ error: 'Product inquiry not found' }, { status: 404 });
    }

    const nextStatus = has(body, 'status') ? String(status) : current.status;
    const nextAgreedPrice = has(body, 'agreed_price') ? optionalPrice(agreed_price) : current.agreed_price;

    if (nextStatus === 'delivered' && !hasValidAgreedPrice(nextAgreedPrice)) {
      return NextResponse.json(
        { error: 'Agreed price is required before marking product inquiry as delivered' },
        { status: 422 }
      );
    }
    
    await pool.query(
      `UPDATE product_inquiries 
       SET name = ?, phone = ?, email = ?, message = ?, status = ?, 
           meeting_date = ?, meeting_time = ?, meeting_type = ?, meeting_location = ?, agreed_price = ?,
           delivered_at = CASE
             WHEN ? = 'delivered' AND delivered_at IS NULL AND ? IS NOT NULL THEN NOW()
             ELSE delivered_at
           END
       WHERE id = ?`,
      [
        has(body, 'name') ? String(name ?? current.name) : current.name,
        has(body, 'phone') ? String(phone ?? current.phone) : current.phone,
        has(body, 'email') ? optionalString(email) : current.email,
        has(body, 'message') ? String(message ?? current.message) : current.message,
        nextStatus,
        has(body, 'meeting_date') ? optionalString(meeting_date) : current.meeting_date,
        has(body, 'meeting_time') ? optionalString(meeting_time) : current.meeting_time,
        has(body, 'meeting_type') ? optionalString(meeting_type) : current.meeting_type,
        has(body, 'meeting_location') ? optionalString(meeting_location) : current.meeting_location,
        nextAgreedPrice,
        nextStatus,
        nextAgreedPrice,
        id
      ]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update product inquiry' }, { status: 500 });
  }
}
