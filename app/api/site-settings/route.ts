import { NextRequest, NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { getCached } from '@/lib/cache';

const SITE_SETTINGS_TTL_MS = 5 * 60 * 1000;

// Keys that live in site_settings but must never be exposed to the public/client
// (they are consumed server-side only — e.g. the Google Maps server API key).
const SENSITIVE_KEYS = new Set(['google_maps_api_key']);

export async function GET(request: NextRequest) {
  const group = request.nextUrl.searchParams.get('group');

  try {
    const map = await getCached(
      `site-settings:${group ?? 'all'}`,
      SITE_SETTINGS_TTL_MS,
      async () => {
        await initDB();
        const [rows] = group
          ? await pool.query('SELECT `key`, value FROM site_settings WHERE `group` = ? ORDER BY `key`', [group])
          : await pool.query('SELECT `key`, value FROM site_settings ORDER BY `group`, `key`');

        const result: Record<string, string | null> = {};
        for (const row of rows as Array<{ key: string; value: string | null }>) {
          result[row.key] = row.value;
        }
        return result;
      }
    );

    // Strip server-only keys before returning to the client.
    const publicMap: Record<string, string | null> = {};
    for (const key in map) {
      if (!SENSITIVE_KEYS.has(key)) publicMap[key] = map[key];
    }

    return NextResponse.json(publicMap, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
  }
}
