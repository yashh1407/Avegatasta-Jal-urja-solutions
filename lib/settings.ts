/**
 * Server-side site-settings reader.
 *
 * Reads the key/value `site_settings` table with the same 5-minute in-memory
 * cache (and cache key) used by the public /api/site-settings route, so admin
 * edits — which clear the `site-settings:` cache prefix — are reflected within
 * the TTL without a rebuild. Use this for server-only consumers (e.g. the
 * Google Maps key in reverse geocoding) that must NOT be exposed to the client.
 */
import pool, { initDB } from '@/lib/db';
import { getCached } from '@/lib/cache';

const SITE_SETTINGS_TTL_MS = 5 * 60 * 1000;

export async function getAllSettings(): Promise<Record<string, string | null>> {
  return getCached('site-settings:all', SITE_SETTINGS_TTL_MS, async () => {
    await initDB();
    const [rows] = await pool.query('SELECT `key`, value FROM site_settings');
    const result: Record<string, string | null> = {};
    for (const row of rows as Array<{ key: string; value: string | null }>) {
      result[row.key] = row.value;
    }
    return result;
  });
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const all = await getAllSettings();
    return all[key] ?? null;
  } catch {
    return null;
  }
}
