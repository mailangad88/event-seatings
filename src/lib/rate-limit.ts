// Request rate limits and body size caps for the public API routes and the admin login.
//
// Best effort: without Upstash, counts live in this server instance's memory, so each serverless instance
// keeps its own count and a cold start resets it. That still stops a single script hammering one instance.
// When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, counts are shared across instances
// through the Upstash REST API (plain fetch, no extra package). If Upstash fails or is slow, we fall back to
// memory rather than blocking real visitors. A Vercel Firewall rate-limit rule is the durable layer on top.

export type Clock = () => number;

export type LimitResult = {
  allowed: boolean;
  /** Hits counted in the current window, including this one when it was recorded. */
  count: number;
  remaining: number;
  /** How long until the next hit would be allowed (0 when allowed). */
  retryAfterMs: number;
};

export type LimitOptions = { limit: number; windowMs: number };

/**
 * Sliding-window log limiter kept in memory. Each key holds the timestamps of its recent hits.
 * The map is bounded: when it holds more than maxKeys keys, the least recently used ones are dropped.
 */
export class SlidingWindowLimiter {
  readonly limit: number;
  readonly windowMs: number;
  readonly maxKeys: number;
  private readonly now: Clock;
  private readonly hits = new Map<string, number[]>();

  constructor(opts: LimitOptions & { maxKeys?: number; now?: Clock }) {
    this.limit = Math.max(1, Math.floor(opts.limit));
    this.windowMs = Math.max(1, opts.windowMs);
    this.maxKeys = Math.max(1, opts.maxKeys ?? 10_000);
    this.now = opts.now ?? Date.now;
  }

  /** Number of keys currently tracked (for tests and monitoring). */
  get size() {
    return this.hits.size;
  }

  private recent(key: string, now: number) {
    const list = this.hits.get(key);
    if (!list) return [];
    const cutoff = now - this.windowMs;
    let i = 0;
    while (i < list.length && list[i] <= cutoff) i++;
    return i ? list.slice(i) : list;
  }

  private result(list: number[], now: number): LimitResult {
    const allowed = list.length < this.limit;
    // When full, a slot frees once the hit `limit` places from the end of the log leaves the window.
    const retryAfterMs = allowed ? 0 : Math.max(0, list[list.length - this.limit] + this.windowMs - now);
    return { allowed, count: list.length, remaining: Math.max(0, this.limit - list.length), retryAfterMs };
  }

  /** Records one hit for key and says whether it is within the limit. Blocked hits are not stored. */
  hit(key: string): LimitResult {
    const now = this.now();
    const list = this.recent(key, now);
    if (list.length >= this.limit) {
      this.touch(key, list);
      return this.result(list, now);
    }
    const next = [...list, now];
    this.touch(key, next);
    return { ...this.result(next, now), allowed: true, retryAfterMs: 0 };
  }

  /** Looks at the count for key without recording a hit. */
  peek(key: string): LimitResult {
    const now = this.now();
    return this.result(this.recent(key, now), now);
  }

  reset(key?: string) {
    if (key === undefined) this.hits.clear();
    else this.hits.delete(key);
  }

  private touch(key: string, list: number[]) {
    // Re-insert so Map order is least recently used first.
    this.hits.delete(key);
    if (list.length) this.hits.set(key, list);
    while (this.hits.size > this.maxKeys) {
      const oldest = this.hits.keys().next().value;
      if (oldest === undefined) break;
      this.hits.delete(oldest);
    }
  }
}

// ---------- Shared counts through Upstash Redis (optional) ----------

type UpstashConfig = { url: string; token: string };

function upstashConfig(): UpstashConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

/**
 * Sliding-window estimate over two fixed windows (the usual Redis approach):
 * count = previous window * (share of it still inside the sliding window) + current window.
 * With record=false it only reads.
 */
export async function upstashWindow(
  cfg: UpstashConfig,
  key: string,
  opts: LimitOptions,
  record: boolean,
  now: number = Date.now(),
  fetchImpl: typeof fetch = fetch,
): Promise<LimitResult> {
  const index = Math.floor(now / opts.windowMs);
  const cur = `rl:${key}:${index}`;
  const prev = `rl:${key}:${index - 1}`;
  const commands = record
    ? [["INCR", cur], ["PEXPIRE", cur, String(opts.windowMs * 2)], ["GET", prev]]
    : [["GET", cur], ["GET", prev]];
  const res = await fetchImpl(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(800),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash responded ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  if (!Array.isArray(out) || out.some((r) => r?.error)) throw new Error("Upstash pipeline error");
  const current = Number(out[0]?.result ?? 0) || 0;
  const previous = Number(out[record ? 2 : 1]?.result ?? 0) || 0;
  const elapsed = (now % opts.windowMs) / opts.windowMs;
  const count = Math.floor(previous * (1 - elapsed)) + current;
  const allowed = record ? count <= opts.limit : count < opts.limit;
  return {
    allowed,
    count,
    remaining: Math.max(0, opts.limit - count),
    retryAfterMs: allowed ? 0 : opts.windowMs - (now % opts.windowMs),
  };
}

// ---------- Request helpers ----------

/** Client IP: first hop of x-forwarded-for (set by Vercel), then x-real-ip, else "unknown". */
export function clientIp(source: Request | Headers): string {
  const h = source instanceof Headers ? source : source.headers;
  const first = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = first || h.get("x-real-ip")?.trim() || "unknown";
  return ip.slice(0, 64);
}

const limiters = new Map<string, SlidingWindowLimiter>();

function memoryLimiter(name: string, opts: LimitOptions) {
  const id = `${name}:${opts.limit}:${opts.windowMs}`;
  let l = limiters.get(id);
  if (!l) {
    l = new SlidingWindowLimiter({ ...opts, maxKeys: 5_000 });
    limiters.set(id, l);
  }
  return l;
}

/**
 * Counts (record=true) or reads (record=false) the hits for one key under a named limit.
 * Uses Upstash when configured, memory otherwise or when Upstash fails.
 */
export async function rateLimit(name: string, key: string, opts: LimitOptions, record = true): Promise<LimitResult> {
  const memory = memoryLimiter(name, opts);
  const cfg = upstashConfig();
  if (cfg) {
    try {
      return await upstashWindow(cfg, `${name}:${key}`, opts, record);
    } catch (error) {
      console.warn("rate limit: Upstash unavailable, using memory", error instanceof Error ? error.message : error);
    }
  }
  return record ? memory.hit(key) : memory.peek(key);
}

export function tooManyResponse(retryAfterMs: number, message = "Too many requests. Please wait a few minutes and try again.") {
  return Response.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil(retryAfterMs / 1000))), "Cache-Control": "no-store" } },
  );
}

/**
 * One call at the top of a route handler: counts this request against `name` for the caller's IP and returns
 * a 429 Response (with Retry-After) when over the limit, or null to carry on.
 */
export async function limitRequest(
  request: Request,
  name: string,
  opts: LimitOptions & { message?: string },
): Promise<Response | null> {
  const r = await rateLimit(name, clientIp(request), opts);
  return r.allowed ? null : tooManyResponse(r.retryAfterMs, opts.message);
}

/** 413 when the declared body is larger than maxBytes, else null. Pair with readJson for bodies sent without a length. */
export function bodyTooLarge(request: Request, maxBytes: number): Response | null {
  const len = Number(request.headers.get("content-length"));
  if (Number.isFinite(len) && len > maxBytes) {
    return Response.json({ error: "That request is too large." }, { status: 413 });
  }
  return null;
}

/** Reads a JSON body but stops after maxBytes. Returns null when it is too large, empty or not valid JSON. */
export async function readJson<T = unknown>(request: Request, maxBytes: number): Promise<T | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}
