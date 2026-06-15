import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const { id } = await params;
    const data = await req.json();
    const { order } = data; // Array of FAQ IDs in new order

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'order must be an array of ids' }, { status: 400 });
    }

    for (let i = 0; i < order.length; i++) {
      await query(
        `UPDATE page_faqs SET sort_order = ? WHERE id = ? AND page_id = ?`,
        [i, order[i], id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
