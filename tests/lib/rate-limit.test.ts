import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SlidingWindowLimiter,
  bodyTooLarge,
  clientIp,
  limitRequest,
  rateLimit,
  readJson,
  tooManyResponse,
  upstashWindow,
} from "@/lib/rate-limit";

const clock = (start = 1_000_000) => {
  let t = start;
  const now = () => t;
  return { now, tick: (ms: number) => (t += ms) };
};

describe("SlidingWindowLimiter", () => {
  it("allows up to the limit in a window, then blocks with a retry time", () => {
    const c = clock();
    const l = new SlidingWindowLimiter({ limit: 3, windowMs: 60_000, now: c.now });
    expect(l.hit("ip").allowed).toBe(true);
    c.tick(10_000);
    expect(l.hit("ip")).toMatchObject({ allowed: true, count: 2, remaining: 1 });
    c.tick(10_000);
    expect(l.hit("ip")).toMatchObject({ allowed: true, count: 3, remaining: 0, retryAfterMs: 0 });
    const blocked = l.hit("ip");
    expect(blocked.allowed).toBe(false);
    // The first hit (t=0) leaves the window at 60s; we are at 20s.
    expect(blocked.retryAfterMs).toBe(40_000);
  });

  it("frees a slot exactly when the oldest hit leaves the window", () => {
    const c = clock();
    const l = new SlidingWindowLimiter({ limit: 2, windowMs: 1000, now: c.now });
    l.hit("k");
    c.tick(500);
    l.hit("k");
    c.tick(499);
    expect(l.hit("k").allowed).toBe(false);
    c.tick(1);
    expect(l.hit("k").allowed).toBe(true);
    expect(l.peek("k").count).toBe(2);
  });

  it("does not count blocked hits, so a blocked caller is not locked out longer", () => {
    const c = clock();
    const l = new SlidingWindowLimiter({ limit: 1, windowMs: 1000, now: c.now });
    l.hit("k");
    for (let i = 0; i < 10; i++) {
      c.tick(50);
      expect(l.hit("k").allowed).toBe(false);
    }
    c.tick(500);
    expect(l.hit("k").allowed).toBe(true);
  });

  it("keeps keys separate, peeks without counting and resets", () => {
    const c = clock();
    const l = new SlidingWindowLimiter({ limit: 1, windowMs: 1000, now: c.now });
    l.hit("a");
    expect(l.hit("b").allowed).toBe(true);
    expect(l.peek("c")).toMatchObject({ allowed: true, count: 0 });
    expect(l.peek("c").count).toBe(0);
    l.reset("a");
    expect(l.hit("a").allowed).toBe(true);
    l.reset();
    expect(l.size).toBe(0);
  });

  it("drops the least recently used keys past maxKeys", () => {
    const c = clock();
    const l = new SlidingWindowLimiter({ limit: 1, windowMs: 1000, maxKeys: 2, now: c.now });
    l.hit("a");
    l.hit("b");
    l.hit("a"); // touches a, b is now oldest
    l.hit("c");
    expect(l.size).toBe(2);
    expect(l.peek("b").count).toBe(0);
    expect(l.peek("a").count).toBe(1);
  });

  it("sanitises bad options", () => {
    const l = new SlidingWindowLimiter({ limit: 0, windowMs: -5 });
    expect(l.limit).toBe(1);
    expect(l.windowMs).toBe(1);
  });
});

describe("upstashWindow", () => {
  const cfg = { url: "https://redis.test", token: "tok" };
  const fakeFetch = (results: unknown[], ok = true) =>
    vi.fn(async () => new Response(JSON.stringify(results.map((result) => ({ result }))), { status: ok ? 200 : 500 })) as unknown as typeof fetch;

  it("weights the previous window by how much of it still overlaps", async () => {
    // Halfway through the current window: 10 previous * 0.5 + 3 current = 8.
    const f = fakeFetch([3, 1, 10]);
    const r = await upstashWindow(cfg, "leads:1.2.3.4", { limit: 8, windowMs: 1000 }, true, 10_500, f);
    expect(r).toMatchObject({ allowed: true, count: 8, remaining: 0 });
    const blocked = await upstashWindow(cfg, "k", { limit: 7, windowMs: 1000 }, true, 10_500, fakeFetch([3, 1, 10]));
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(500);
  });

  it("sends INCR, PEXPIRE and GET with the bearer token", async () => {
    const f = fakeFetch([1, 1, null]);
    await upstashWindow(cfg, "k", { limit: 5, windowMs: 1000 }, true, 10_500, f);
    const [url, init] = (f as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toBe("https://redis.test/pipeline");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect(JSON.parse(init.body as string)).toEqual([["INCR", "rl:k:10"], ["PEXPIRE", "rl:k:10", "2000"], ["GET", "rl:k:9"]]);
  });

  it("throws on HTTP or pipeline errors so the caller can fall back", async () => {
    await expect(upstashWindow(cfg, "k", { limit: 5, windowMs: 1000 }, true, 0, fakeFetch([], false))).rejects.toThrow();
    const errFetch = vi.fn(async () => new Response(JSON.stringify([{ error: "boom" }]))) as unknown as typeof fetch;
    await expect(upstashWindow(cfg, "k", { limit: 5, windowMs: 1000 }, false, 0, errFetch)).rejects.toThrow();
  });
});

describe("rateLimit", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses memory when Upstash is not configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    const opts = { limit: 2, windowMs: 60_000 };
    const key = `mem-${Math.random()}`;
    expect((await rateLimit("t1", key, opts)).allowed).toBe(true);
    expect((await rateLimit("t1", key, opts)).allowed).toBe(true);
    expect((await rateLimit("t1", key, opts, false)).allowed).toBe(false);
    expect((await rateLimit("t1", key, opts)).allowed).toBe(false);
  });

  it("falls back to memory when Upstash fails", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("down"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await rateLimit("t2", `fb-${Math.random()}`, { limit: 1, windowMs: 60_000 });
    expect(r.allowed).toBe(true);
  });
});

describe("request helpers", () => {
  it("reads the client IP from the first forwarded hop", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": " 1.2.3.4 , 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(clientIp(new Request("https://x.test"))).toBe("unknown");
    expect(clientIp(new Headers({ "x-forwarded-for": "a".repeat(200) }))).toHaveLength(64);
  });

  it("builds a 429 with Retry-After in whole seconds", async () => {
    const r = tooManyResponse(1500);
    expect(r.status).toBe(429);
    expect(r.headers.get("Retry-After")).toBe("2");
    expect(tooManyResponse(0).headers.get("Retry-After")).toBe("1");
    expect((await r.json()).error).toMatch(/too many/i);
  });

  it("limitRequest returns null until the limit, then a 429", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    const req = () => new Request("https://x.test", { headers: { "x-forwarded-for": `9.9.9.${Math.floor(Math.random() * 1e6)}` } });
    const one = req();
    const opts = { limit: 1, windowMs: 60_000, message: "Slow down" };
    expect(await limitRequest(one, "t3", opts)).toBeNull();
    const blocked = await limitRequest(one, "t3", opts);
    expect(blocked?.status).toBe(429);
    expect((await blocked!.json()).error).toBe("Slow down");
  });

  it("rejects bodies that declare a large size", () => {
    expect(bodyTooLarge(new Request("https://x.test", { method: "POST", headers: { "content-length": "2000" }, body: "x" }), 1000)?.status).toBe(413);
    expect(bodyTooLarge(new Request("https://x.test", { method: "POST", body: "x" }), 1000)).toBeNull();
  });

  it("reads JSON up to a byte cap", async () => {
    const post = (body: string) => new Request("https://x.test", { method: "POST", body });
    expect(await readJson(post('{"a":1}'), 100)).toEqual({ a: 1 });
    expect(await readJson(post(JSON.stringify({ a: "x".repeat(200) })), 100)).toBeNull();
    expect(await readJson(post("{nope"), 100)).toBeNull();
    expect(await readJson(new Request("https://x.test"), 100)).toBeNull();
  });
});
