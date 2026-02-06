// ============================================================
// Rate Limiter — in-memory for MVP, swap to Redis later
// ============================================================

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_PER_MINUTE = parseInt(process.env.RATE_LIMIT_AI_PER_MINUTE || "10");

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(identifier: string, endpoint: string): RateLimitResult {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { success: true, remaining: MAX_PER_MINUTE - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_PER_MINUTE) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.windowStart + WINDOW_MS,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: MAX_PER_MINUTE - entry.count,
    resetAt: entry.windowStart + WINDOW_MS,
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": MAX_PER_MINUTE.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
  };
}
