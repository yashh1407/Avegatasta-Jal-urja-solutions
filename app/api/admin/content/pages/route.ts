import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const pages = await query(`
      SELECT p.id, p.title, p.slug, p.status, p.show_in_menu as in_menu,
             (SELECT COUNT(*) FROM page_sections s WHERE s.page_id = p.id) as section_count
      FROM pages p
      ORDER BY p.updated_at DESC
    `);
    
    // Map in_menu to match old code compatibility or new standard
    const mapped = (pages as any[]).map(p => ({
      ...p,
      in_menu: !!p.in_menu
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error("GET pages error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const data = await req.json();
    const { title, slug } = data;
    
    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO pages (title, slug, status) VALUES (?, ?, 'draft')`,
      [title, slug]
    ) as any;

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (err: any) {
    if (err.message.includes('Duplicate entry')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
