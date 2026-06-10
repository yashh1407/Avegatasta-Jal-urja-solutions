import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const pages = await query(`SELECT * FROM pages WHERE id = ?`, [params.id]) as any[];
    if (pages.length === 0) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    
    const page = pages[0];
    page.show_in_menu = !!page.show_in_menu;
    
    return NextResponse.json(page);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const data = await req.json();
    const { 
      title, slug, meta_title, meta_description, meta_keywords, canonical_url,
      og_title, og_description, og_image, status, show_in_menu, menu_label, menu_order, parent_id 
    } = data;

    await query(
      `UPDATE pages 
       SET title=?, slug=?, meta_title=?, meta_description=?, meta_keywords=?, canonical_url=?,
           og_title=?, og_description=?, og_image=?, status=?, show_in_menu=?, menu_label=?, menu_order=?, parent_id=?
       WHERE id=?`,
      [
        title, slug, meta_title, meta_description, meta_keywords, canonical_url,
        og_title, og_description, og_image, status, show_in_menu ? 1 : 0, menu_label, menu_order || 0, parent_id || null,
        params.id
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message.includes('Duplicate entry')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await query(`DELETE FROM pages WHERE id = ?`, [params.id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
