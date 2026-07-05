// Best-effort in-memory rate limiter (per serverless instance / dev server).
// Good enough to stop accidental client-side loops and casual abuse;
// swap for a Redis/Upstash-backed limiter if hard guarantees are ever needed.

const buckets = new Map();
const MAX_BUCKETS = 5000;

/**
 * @param {string} key - unique key, e.g. `${routeName}:${ip}`
 * @param {{ windowMs: number, max: number }} options
 * @returns {boolean} true when the caller exceeded the limit
 */
export function isRateLimited(key, { windowMs, max }) {
  const now = Date.now();

  // Prevent unbounded memory growth on long-lived instances
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (now - v.start > windowMs) buckets.delete(k);
    }
    if (buckets.size > MAX_BUCKETS) buckets.clear();
  }

  const entry = buckets.get(key);
  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

/** Extracts the client IP from a Request in a proxy-aware way */
export function getClientIp(req) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
