import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

interface ExportRow {
  client_id: number;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_company: string | null;
  client_city: string | null;
  client_state: string | null;
  client_pincode: string | null;
  client_address: string | null;
  client_created_at: string;
  product_id: string | null;
  product_name: string | null;
  serial_number: string | null;
  batch_number: string | null;
  purchase_date: string | null;
  install_date: string | null;
  warranty_end_date: string | null;
  next_service_date: string | null;
}

function escapeCSV(value: string | number | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();

    const [rows] = await pool.query<never[]>(`
      SELECT
        c.id          AS client_id,
        c.name        AS client_name,
        c.email       AS client_email,
        c.phone       AS client_phone,
        c.company_name AS client_company,
        c.city        AS client_city,
        c.state       AS client_state,
        c.pincode     AS client_pincode,
        c.address     AS client_address,
        c.created_at  AS client_created_at,
        cp.product_id,
        cp.product_name,
        cp.serial_number,
        cp.batch_number,
        cp.purchase_date,
        cp.install_date,
        cp.warranty_end_date,
        cp.next_service_date
      FROM clients c
      LEFT JOIN client_products cp ON cp.client_id = c.id
      ORDER BY c.id ASC, cp.id ASC
    `);

    const headers = [
      'Client ID', 'Name', 'Email', 'Phone', 'Company',
      'City', 'State', 'Pincode', 'Address', 'Client Since',
      'Product ID', 'Product Name', 'Serial No', 'Batch No',
      'Purchase Date', 'Install Date', 'Warranty End', 'Next Service',
    ];

    const lines: string[] = [headers.map(escapeCSV).join(',')];

    for (const row of rows as ExportRow[]) {
      lines.push([
        row.client_id,
        row.client_name,
        row.client_email,
        row.client_phone,
        row.client_company,
        row.client_city,
        row.client_state,
        row.client_pincode,
        row.client_address,
        row.client_created_at,
        row.product_id,
        row.product_name,
        row.serial_number,
        row.batch_number,
        row.purchase_date,
        row.install_date,
        row.warranty_end_date,
        row.next_service_date,
      ].map(escapeCSV).join(','));
    }

    const csv = lines.join('\r\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="clients-export.csv"',
      },
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to export clients' }, { status: 500 });
  }
}
