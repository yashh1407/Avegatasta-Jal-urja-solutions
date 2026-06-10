import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, { params }: { params: { id: string, sectionId: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const data = await req.json();
    const { section_type, section_key, category, title, subtitle, content, data_json, is_active } = data;
    
    await query(
      `UPDATE page_sections 
       SET section_type=?, section_key=?, category=?, title=?, subtitle=?, content=?, data_json=?, is_active=?
       WHERE id=? AND page_id=?`,
      [
        section_type, section_key, category || '', title || '', subtitle || '', content || '',
        JSON.stringify(data_json || {}), is_active === false ? 0 : 1,
        params.sectionId, params.id
      ]
    );

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string, sectionId: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await query(`DELETE FROM page_sections WHERE id = ? AND page_id = ?`, [params.sectionId, params.id]);
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
