type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

declare global {
  var _appCache: Map<string, CacheEntry<unknown>> | undefined;
}

const cache = globalThis._appCache ?? new Map<string, CacheEntry<unknown>>();

if (process.env.NODE_ENV !== 'production') {
  globalThis._appCache = cache;
}

export async function getCached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const value = await loader();
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function clearCache(prefix?: string) {
  if (!prefix) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
