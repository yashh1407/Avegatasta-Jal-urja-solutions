import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM case_studies ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    title,
    slug,
    summary,
    description,
    category,
    client_name,
    location_name,
    latitude,
    longitude,
    cover_image,
    images,
    status,
  } = body as Record<string, unknown>;

  if (!title || !(title as string).trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 422 });
  }
  if (!slug || !(slug as string).trim()) {
    return NextResponse.json({ error: 'slug is required' }, { status: 422 });
  }

  const resolvedStatus = (status as string) || 'draft';

  try {
    await initDB();
    const [result] = await pool.query(
      `INSERT INTO case_studies
        (title, slug, summary, description, category, client_name, location_name, latitude, longitude, cover_image, images, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        (title as string).trim(),
        (slug as string).trim(),
        summary || null,
        description || null,
        category || null,
        client_name || null,
        location_name || null,
        latitude ?? null,
        longitude ?? null,
        cover_image || null,
        images ? JSON.stringify(images) : null,
        resolvedStatus,
      ]
    );
    const id = (result as { insertId: number }).insertId;
    const [rows] = await pool.query('SELECT * FROM case_studies WHERE id = ?', [id]);
    return NextResponse.json((rows as unknown[])[0], { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to create case study' }, { status: 500 });
  }
}
