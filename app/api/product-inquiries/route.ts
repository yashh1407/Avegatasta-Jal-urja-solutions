import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';
import { productInquirySchema } from '@/lib/validation';
import { sendOwnerNotification, productInquiryNotificationHtml } from '@/lib/mailer';
import { requireAdminSession } from '@/lib/admin-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

  const session = await getServerSession(authOptions);

  if (!session) {
    // Decrypt and verify CAPTCHA
    const { captchaToken, captchaInput } = (body || {}) as { captchaToken?: string; captchaInput?: string };
    if (!captchaToken || !captchaInput) {
      return NextResponse.json({ error: 'Security verification code is required.' }, { status: 400 });
    }

    const expectedCode = decryptCaptcha(captchaToken);
    if (!expectedCode || expectedCode.toLowerCase() !== captchaInput.toLowerCase()) {
      return NextResponse.json({ error: 'Incorrect security verification code. Please try again.' }, { status: 400 });
    }
  }

  const parsed = productInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, phone, email, message, productName, productId, gstin, latitude, longitude, location_accuracy } = parsed.data;

  const loggedByName = session ? (session.user as any).name : 'Public Website';
  const loggedByEmail = session ? (session.user as any).email : 'public@website.com';

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO product_inquiries (
        product_id, product_name, name, phone, email, message, gstin,
        latitude, longitude, location_accuracy, logged_by_name, logged_by_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId ?? null, 
        productName, 
        name, 
        phone, 
        email || null, 
        message, 
        gstin ?? null,
        latitude ?? null,
        longitude ?? null,
        location_accuracy ?? null,
        loggedByName,
        loggedByEmail
      ]
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
      status, meeting_date, meeting_time, meeting_type, meeting_location, agreed_price, quote_number 
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
      quote_number: string | null;
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
           meeting_date = ?, meeting_time = ?, meeting_type = ?, meeting_location = ?, agreed_price = ?, quote_number = ?,
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
        has(body, 'quote_number') ? optionalString(quote_number) : current.quote_number,
        nextStatus,
        nextAgreedPrice,
        id
      ]
    );

    if (nextStatus === 'delivered' || nextStatus === 'order_confirmed') {
      const [updatedRows] = await pool.query('SELECT * FROM product_inquiries WHERE id = ? LIMIT 1', [id]);
      const inquiry = (updatedRows as any[])[0];
      if (inquiry) {
        let clientId = inquiry.client_id;
        if (!clientId) {
          // 1. Create client record
          const [clientResult] = await pool.query(
            `INSERT INTO clients (name, email, phone, notes, gstin) VALUES (?, ?, ?, ?, ?)`,
            [
              inquiry.name,
              inquiry.email || null,
              inquiry.phone || null,
              `Auto-converted from Product Inquiry for ${inquiry.product_name} (Status: ${nextStatus}).\nMessage: ${inquiry.message}`,
              inquiry.gstin || null
            ]
          );
          clientId = (clientResult as any).insertId;
          
          // 2. Update inquiry's client_id
          await pool.query('UPDATE product_inquiries SET client_id = ? WHERE id = ?', [clientId, id]);
        }

        // 3. Save products to client_products
        if (clientId) {
          if (inquiry.quote_number) {
            // A quote is linked: extract quote items
            const [quoteRows] = await pool.query(
              'SELECT canvas_data FROM canvas_quotations WHERE quote_number = ? LIMIT 1',
              [inquiry.quote_number]
            );
            const quote = (quoteRows as any[])[0];
            if (quote && quote.canvas_data) {
              let items: any[] = [];
              try {
                const parsed = JSON.parse(quote.canvas_data);
                if (Array.isArray(parsed)) {
                  if (parsed.length > 0 && parsed[0].type === '_v2_structured_data') {
                    items = parsed[0].content?.items || [];
                  } else {
                    parsed.forEach((el: any) => {
                      if (el.type === 'pricing_table' && el.content && Array.isArray(el.content.items)) {
                        items = el.content.items;
                      }
                    });
                  }
                }
              } catch (err) {
                console.error('Error parsing quote canvas_data in product inquiry:', err);
              }

              for (const item of items) {
                // Avoid duplicate product insertions
                const [existing] = await pool.query(
                  'SELECT id FROM client_products WHERE client_id = ? AND quote_number = ? AND product_name = ?',
                  [clientId, inquiry.quote_number, item.name]
                );
                if ((existing as any[]).length === 0) {
                  await pool.query(
                    `INSERT INTO client_products (client_id, product_name, price, qty, hsn_code, sac_code, quote_number, purchase_date)
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
                    [
                      clientId,
                      item.name,
                      item.price !== undefined ? item.price : null,
                      item.qty || 1,
                      item.hsn_code || null,
                      item.sac_code || null,
                      inquiry.quote_number
                    ]
                  );
                }
              }
            }
          } else if (inquiry.product_name) {
            // No quote linked: insert inquiry product with agreed price
            const [existing] = await pool.query(
              'SELECT id FROM client_products WHERE client_id = ? AND product_name = ? AND purchase_date = CURDATE()',
              [clientId, inquiry.product_name]
            );
            if ((existing as any[]).length === 0) {
              await pool.query(
                `INSERT INTO client_products (client_id, product_id, product_name, price, qty, purchase_date)
                 VALUES (?, ?, ?, ?, 1, CURDATE())`,
                [
                  clientId,
                  inquiry.product_id || null,
                  inquiry.product_name,
                  inquiry.agreed_price || null
                ]
              );
            }
          }
        }
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update product inquiry' }, { status: 500 });
  }
}
