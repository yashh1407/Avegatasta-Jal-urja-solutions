import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { clearCache } from '@/lib/cache';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { section } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { content } = body as Record<string, unknown>;

  if (content === undefined || !(content as string).trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 422 });
  }

  try {
    await initDB();
    const [result] = await pool.query(
      'UPDATE about_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE section = ?',
      [(content as string).trim(), section]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    const [rows] = await pool.query('SELECT * FROM about_content WHERE section = ?', [section]);
    clearCache('public-about-content');
    return NextResponse.json((rows as unknown[])[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update about content' }, { status: 500 });
  }
}
