/**
 * Cloudflare Cache API wrapper for server-side function caching.
 * Uses the Cloudflare Workers Cache API to cache responses at the edge.
 */

interface CacheOptions {
  /** Time-to-live in seconds (default: 60) */
  ttl?: number;
  /** Cache key namespace to avoid collisions */
  namespace?: string;
}

function makeCacheKey(namespace: string, key: string): string {
  return `preloved:${namespace}:${key}`;
}

/**
 * Get a cached value from the Cloudflare Cache API.
 * Returns null if not found or if not in a Cloudflare environment.
 */
export async function cacheGet<T>(namespace: string, key: string): Promise<T | null> {
  try {
    const cacheKey = makeCacheKey(namespace, key);
    const cache = await getCache();
    if (!cache) return null;

    const request = new Request(`https://cache.internal/${cacheKey}`);
    const response = await cache.match(request);
    if (!response) return null;

    const data = (await response.json()) as T;
    return data;
  } catch {
    return null;
  }
}

/**
 * Set a value in the Cloudflare Cache API.
 */
export async function cacheSet<T>(
  namespace: string,
  key: string,
  value: T,
  options: CacheOptions = {},
): Promise<void> {
  try {
    const { ttl = 60 } = options;
    const cacheKey = makeCacheKey(namespace, key);
    const cache = await getCache();
    if (!cache) return;

    const request = new Request(`https://cache.internal/${cacheKey}`);
    const response = new Response(JSON.stringify(value), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${ttl}, s-maxage=${ttl}`,
      },
    });
    await cache.put(request, response);
  } catch {
    // Silently fail — cache is a best-effort optimization
  }
}

/**
 * Invalidate a cached value by key pattern.
 * Note: Cloudflare Cache API doesn't support wildcard deletion,
 * so we tag-based invalidation isn't possible. Use namespace + key specificity.
 */
export async function cacheInvalidate(namespace: string, key: string): Promise<void> {
  try {
    const cacheKey = makeCacheKey(namespace, key);
    const cache = await getCache();
    if (!cache) return;

    const request = new Request(`https://cache.internal/${cacheKey}`);
    await cache.delete(request);
  } catch {
    // Silently fail
  }
}

/**
 * Higher-order function that wraps an async function with caching.
 * This provides a simple way to add caching to any server function.
 */
export function withCache<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  namespace: string,
  keyFn: (...args: Args) => string,
  options: CacheOptions = {},
): (...args: Args) => Promise<T> {
  const { ttl = 60 } = options;

  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);

    // Try cache first
    const cached = await cacheGet<T>(namespace, key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn(...args);

    // Cache result (don't await — fire and forget)
    cacheSet(namespace, key, result, { ttl });

    return result;
  };
}

/**
 * Request deduplication — prevents multiple concurrent calls to the same
 * async function with the same arguments from executing simultaneously.
 */
const inflightRequests = new Map<string, Promise<unknown>>();

export function deduplicate<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string,
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);

    // If there's already an in-flight request for this key, return it
    const existing = inflightRequests.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    // Create new request and track it
    const promise = fn(...args).finally(() => {
      inflightRequests.delete(key);
    });

    inflightRequests.set(key, promise);
    return promise;
  };
}

/**
 * Get the Cloudflare Cache instance.
 * Returns null outside of a Cloudflare Workers environment.
 */
async function getCache(): Promise<Cache | null> {
  try {
    // Check if we're in a Cloudflare Workers environment
    if (typeof caches !== "undefined") {
      return await caches.open("prelovedfinds");
    }
    return null;
  } catch {
    return null;
  }
}