// A sliding-window limiter kept in memory. It stops casual abuse and mistakes (a script, a stuck
// button) but each server instance keeps its own counts, so it is not a hard guarantee on a
// serverless host. For that, back it with Redis (for example Upstash) using the same function
// signatures. See docs/AUDIT.md, finding 1.
const hits = new Map<string, number[]>();

// True if this call is allowed; false if `key` has already made `limit` calls in the last `windowMs`.
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip")) || "unknown";
}
