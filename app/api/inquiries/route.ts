import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';
import { inquirySchema } from '@/lib/validation';
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

export async function POST(request: Request) {
  const { ok } = rateLimit(`inquiries:${getClientIp(request)}`);
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, phone, subject, message } = parsed.data;

  try {
    await initDB();
    const [result] = await pool.query(
      'INSERT INTO inquiries (name, phone, subject, message) VALUES (?, ?, ?, ?)',
      [name, phone ?? null, subject ?? null, message]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 });
  }
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
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
    await pool.query('DELETE FROM inquiries WHERE id = ?', [id]);
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
      id, name, phone, subject, message, 
      status, meeting_date, meeting_time, meeting_type, meeting_location, agreed_price 
    } = body;
    
    if (!id || !/^\d+$/.test(String(id))) {
      return NextResponse.json({ error: 'Valid numeric ID required' }, { status: 400 });
    }

    if (status && !ALLOWED_STATUSES.includes(String(status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await initDB();

    const [currentRows] = await pool.query('SELECT * FROM inquiries WHERE id = ? LIMIT 1', [id]);
    const current = (currentRows as Array<{
      name: string;
      phone: string | null;
      subject: string | null;
      message: string;
      status: string;
      agreed_price: number | string | null;
      meeting_date: string | null;
      meeting_time: string | null;
      meeting_type: string | null;
      meeting_location: string | null;
    }>)[0];

    if (!current) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    const nextStatus = has(body, 'status') ? String(status) : current.status;
    const nextAgreedPrice = has(body, 'agreed_price') ? optionalPrice(agreed_price) : current.agreed_price;

    if (nextStatus === 'delivered' && !hasValidAgreedPrice(nextAgreedPrice)) {
      return NextResponse.json(
        { error: 'Agreed price is required before marking inquiry as delivered' },
        { status: 422 }
      );
    }
    
    await pool.query(
      `UPDATE inquiries 
       SET name = ?, phone = ?, subject = ?, message = ?, status = ?, 
           meeting_date = ?, meeting_time = ?, meeting_type = ?, meeting_location = ?, agreed_price = ?,
           delivered_at = CASE
             WHEN ? = 'delivered' AND delivered_at IS NULL AND ? IS NOT NULL THEN NOW()
             ELSE delivered_at
           END
       WHERE id = ?`,
      [
        has(body, 'name') ? String(name ?? current.name) : current.name,
        has(body, 'phone') ? optionalString(phone) : current.phone,
        has(body, 'subject') ? optionalString(subject) : current.subject,
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
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}
