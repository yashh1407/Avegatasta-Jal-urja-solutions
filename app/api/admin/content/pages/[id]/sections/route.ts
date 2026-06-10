import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const sections = await query(`
      SELECT * FROM page_sections 
      WHERE page_id = ? 
      ORDER BY sort_order ASC, id ASC
    `, [params.id]) as any[];
    
    // Parse data_json safely
    const parsed = sections.map(s => {
      s.is_active = !!s.is_active;
      try {
        s.data_json = typeof s.data_json === 'string' ? JSON.parse(s.data_json) : (s.data_json || {});
      } catch (e) {
        s.data_json = {};
      }
      return s;
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
    const { section_type, section_key, category, title, subtitle, content, data_json, is_active } = data;
    
    // Get max sort_order
    const [{ max_sort }] = await query(`SELECT MAX(sort_order) as max_sort FROM page_sections WHERE page_id = ?`, [params.id]) as any[];
    const nextSort = (max_sort || 0) + 1;

    const result = await query(
      `INSERT INTO page_sections (page_id, section_type, section_key, category, title, subtitle, content, data_json, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        params.id, section_type, section_key, category || '', title || '', subtitle || '', content || '',
        JSON.stringify(data_json || {}), nextSort, is_active === false ? 0 : 1
      ]
    ) as any;

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
