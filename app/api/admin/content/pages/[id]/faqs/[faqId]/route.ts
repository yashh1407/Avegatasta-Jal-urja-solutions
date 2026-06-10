import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function PUT(req: Request, { params }: { params: { id: string, faqId: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const data = await req.json();
    const { question, answer, is_active } = data;
    
    await query(
      `UPDATE page_faqs 
       SET question=?, answer=?, is_active=?
       WHERE id=? AND page_id=?`,
      [question || '', answer || '', is_active === false ? 0 : 1, params.faqId, params.id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string, faqId: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await query(`DELETE FROM page_faqs WHERE id = ? AND page_id = ?`, [params.faqId, params.id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
