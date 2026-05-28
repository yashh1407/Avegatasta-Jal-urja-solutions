import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import { clearCache } from '@/lib/cache';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM site_settings ORDER BY `group`, `key`');
    // Return as key-value map for convenience, also include full rows
    const map: Record<string, string | null> = {};
    for (const row of rows as Array<{ key: string; value: string | null }>) {
      map[row.key] = row.value;
    }
    return NextResponse.json({ settings: rows, map });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates = body as Array<{ key: string; value: string | null }>;

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'Body must be a non-empty array of {key, value}' }, { status: 422 });
  }

  try {
    await initDB();
    for (const { key, value } of updates) {
      if (!key) continue;
      await pool.query(
        'UPDATE site_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE `key` = ?',
        [value ?? null, key]
      );
    }
    clearCache('site-settings:');
    const [rows] = await pool.query('SELECT * FROM site_settings ORDER BY `group`, `key`');
    const map: Record<string, string | null> = {};
    for (const row of rows as Array<{ key: string; value: string | null }>) {
      map[row.key] = row.value;
    }
    return NextResponse.json({ settings: rows, map });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
}
