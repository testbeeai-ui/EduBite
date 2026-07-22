/**
 * Best-effort in-memory rate limit (per server instance).
 * Cuts abusive / buggy write storms; multi-instance deploys each keep their own map.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 20_000;

function pruneIfNeeded(now: number): void {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size < MAX_KEYS) return;
  // Drop oldest half if still over cap (extreme traffic).
  let dropped = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    dropped += 1;
    if (dropped >= MAX_KEYS / 2) break;
  }
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; remaining: 0; retryAfterSec: number };

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  pruneIfNeeded(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: Math.max(0, limit - 1) };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { ok: true, remaining: Math.max(0, limit - existing.count) };
}

/** Progress writes: ~1–2/sec sustained is plenty after ephemeral ticks are stripped. */
export function allowProgressWrite(userId: string): RateLimitResult {
  return checkRateLimit(`progress-put:${userId}`, 40, 60_000);
}
