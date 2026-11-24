/**
 * Fallback strip image storage for environments where @vercel/blob token is not configured.
 * Keeps recently generated compressed strips in memory so local testing and mobile previews work seamlessly.
 */

// Global cache across hot reloads in dev
const globalForStrips = globalThis as unknown as {
  stripImageCache?: Map<string, { buffer: Buffer; contentType: string; createdAt: number }>;
};

const stripCache =
  globalForStrips.stripImageCache ||
  new Map<string, { buffer: Buffer; contentType: string; createdAt: number }>();

if (process.env.NODE_ENV !== "production") {
  globalForStrips.stripImageCache = stripCache;
}

const MAX_CACHE_SIZE = 100;

export function storeStripImage(stripId: string, buffer: Buffer, contentType = "image/jpeg") {
  // Prune oldest if exceeds capacity
  if (stripCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = stripCache.keys().next().value;
    if (oldestKey) {
      stripCache.delete(oldestKey);
    }
  }

  stripCache.set(stripId, {
    buffer,
    contentType,
    createdAt: Date.now(),
  });
}

export function getStripImage(stripId: string) {
  return stripCache.get(stripId);
}
