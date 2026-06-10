import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const faqs = await query(`
      SELECT * FROM page_faqs 
      WHERE page_id = ? 
      ORDER BY sort_order ASC, id ASC
    `, [params.id]) as any[];
    
    const parsed = faqs.map(f => {
      f.is_active = !!f.is_active;
      return f;
    });

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const data = await req.json();
    const { question, answer, is_active } = data;
    
    // Get max sort_order
    const [{ max_sort }] = await query(`SELECT MAX(sort_order) as max_sort FROM page_faqs WHERE page_id = ?`, [params.id]) as any[];
    const nextSort = (max_sort || 0) + 1;

    const result = await query(
      `INSERT INTO page_faqs (page_id, question, answer, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [params.id, question || '', answer || '', nextSort, is_active === false ? 0 : 1]
    ) as any;

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
