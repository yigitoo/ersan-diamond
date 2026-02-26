/**
 * Simple in-memory rate limiter using sliding window.
 * Suitable for serverless/edge: resets on cold start, which is acceptable.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    const validTimestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (validTimestamps.length === 0) {
      store.delete(key);
    } else {
      entry.timestamps = validTimestamps;
    }
  }
}

/**
 * Check if a request from the given IP is within rate limits.
 *
 * @param ip - The client IP address
 * @param maxRequests - Maximum number of requests allowed in the window
 * @param windowMs - Sliding window duration in milliseconds
 * @returns { success: boolean, remaining: number }
 */
export function rateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();

  cleanup(windowMs);

  const entry = store.get(ip) ?? { timestamps: [] };

  // Filter to only timestamps within the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    store.set(ip, entry);
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  store.set(ip, entry);

  return { success: true, remaining: maxRequests - entry.timestamps.length };
}
