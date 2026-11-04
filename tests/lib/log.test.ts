import { afterEach, describe, expect, it, vi } from "vitest";
import { buildEntry, isSecretKey, log, redact, redactEmail, redactPhone, redactText, requestIdFrom, serializeError, stripQuery } from "@/lib/log";

describe("redaction helpers", () => {
  it("masks emails but keeps the domain", () => {
    expect(redactEmail("alice@example.com")).toBe("a***@example.com");
    expect(redactEmail("write to bob.smith+x@mail.co.uk today")).toBe("write to b***@mail.co.uk today");
    expect(redactEmail("no email here")).toBe("no email here");
  });

  it("masks all but the last two phone digits", () => {
    expect(redactPhone("(312) 555-1234")).toBe("(***) ***-**34");
    expect(redactPhone("+1 312.555.1234")).toBe("+* ***.***.**34");
  });

  it("scrubs emails and US phone numbers inside free text", () => {
    const out = redactText("Lead priya@example.com called from 312-555-1234 and (773) 555 0000");
    expect(out).not.toContain("priya@");
    expect(out).not.toContain("555-1234");
    expect(out).not.toContain("555 0000");
    expect(out).toContain("p***@example.com");
  });

  it("caps very long strings", () => {
    expect(redactText("x".repeat(5000)).length).toBeLessThanOrEqual(1001);
  });

  it("knows secret-looking keys", () => {
    for (const k of ["authorization", "Cookie", "x-api-key", "client_secret", "password", "passwd", "stripe-signature", "STRIPE_SECRET_KEY", "token", "privateKey".replace("K", "_k")]) {
      expect(isSecretKey(k), k).toBe(true);
    }
    for (const k of ["email", "name", "guest_count", "path"]) expect(isSecretKey(k), k).toBe(false);
  });
});

describe("redact", () => {
  it("drops secrets, masks contact fields and leaves the rest", () => {
    const out = redact({
      email: "priya@example.com",
      phone: "312-555-1234",
      headers: { authorization: "Basic abc", cookie: "a=b", "user-agent": "Mozilla" },
      env: { STRIPE_SECRET_KEY: "sk_live_123", RESEND_API_KEY: "re_123" },
      guest_count: 120,
      ok: true,
      note: "call me at 3125551234",
      leadId: "a1b2c3",
      empty: "",
    }) as Record<string, unknown>;
    expect(out.email).toBe("p***@example.com");
    expect(out.phone).toBe("***-***-**34");
    expect(out.headers).toEqual({ authorization: "[redacted]", cookie: "[redacted]", "user-agent": "Mozilla" });
    expect(out.env).toEqual({ STRIPE_SECRET_KEY: "[redacted]", RESEND_API_KEY: "[redacted]" });
    expect(out.guest_count).toBe(120);
    expect(out.ok).toBe(true);
    expect(out.note).not.toContain("3125551234");
    expect(out.leadId).toBe("a1b2c3");
    const json = JSON.stringify(out);
    expect(json).not.toContain("sk_live_123");
    expect(json).not.toContain("Basic abc");
  });

  it("does not mask ids that look like phone numbers", () => {
    expect(redact({ requestId: "3125551234" })).toEqual({ requestId: "3125551234" });
  });

  it("redacts Headers objects", () => {
    const out = redact({ h: new Headers({ authorization: "Bearer x", "x-forwarded-for": "1.2.3.4" }) }) as { h: Record<string, string> };
    expect(out.h.authorization).toBe("[redacted]");
    expect(out.h["x-forwarded-for"]).toBe("1.2.3.4");
  });

  it("caps depth, array length and drops functions", () => {
    const deep = { a: { b: { c: { d: { e: { f: "deep" } } } } } };
    expect(JSON.stringify(redact(deep))).toContain("[truncated]");
    const arr = redact(Array.from({ length: 60 }, (_, i) => i)) as unknown[];
    expect(arr).toHaveLength(51);
    expect(arr[50]).toBe("[+10 more]");
    expect(redact({ fn: () => 1, x: 1 })).toEqual({ x: 1 });
  });

  it("serializes errors and dates", () => {
    const e = Object.assign(new Error("failed for priya@example.com"), { digest: "123", code: "E1" });
    const s = serializeError(e);
    expect(s.message).toBe("failed for p***@example.com");
    expect(s.digest).toBe("123");
    expect(s.code).toBe("E1");
    expect(serializeError("plain")).toEqual({ message: "plain" });
    expect(redact(new Date("2026-11-04T00:00:00Z"))).toBe("2026-11-04T00:00:00.000Z");
  });

  it("survives circular objects", () => {
    const a: Record<string, unknown> = { name: "x" };
    a.self = a;
    expect(() => JSON.stringify(redact(a))).not.toThrow();
  });
});

describe("log entries", () => {
  afterEach(() => vi.restoreAllMocks());

  it("builds one flat, redacted entry with a request id and no raw request", () => {
    const req = new Request("https://x.test/api/leads?email=a@b.co", { headers: { "x-vercel-id": "iad1::abc", authorization: "Basic x" } });
    const e = buildEntry("error", "lead_save_failed", { req, err: new Error("db down"), email: "priya@example.com", msg: "for 312-555-1234" }, new Date("2026-11-04T00:00:00Z"));
    expect(e).toMatchObject({ level: "error", event: "lead_save_failed", time: "2026-11-04T00:00:00.000Z", reqId: "iad1::abc", email: "p***@example.com" });
    expect((e.err as { message: string }).message).toBe("db down");
    expect(e).not.toHaveProperty("req");
    expect(String(e.msg)).not.toContain("555-1234");
    expect(JSON.stringify(e)).not.toContain("Basic x");
  });

  it("reads request ids from headers or plain maps and strips query strings", () => {
    expect(requestIdFrom({ "x-request-id": ["r1", "r2"] })).toBe("r1");
    expect(requestIdFrom(null)).toBeUndefined();
    expect(stripQuery("/quote?email=a@b.co#x")).toBe("/quote");
  });

  it("writes one JSON line to the matching console method", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const info = vi.spyOn(console, "log").mockImplementation(() => {});
    log.error("boom", { email: "priya@example.com" });
    log.info("hello");
    expect(err).toHaveBeenCalledTimes(1);
    const line = JSON.parse(err.mock.calls[0][0] as string);
    expect(line).toMatchObject({ level: "error", event: "boom", email: "p***@example.com" });
    expect(JSON.parse(info.mock.calls[0][0] as string).level).toBe("info");
  });
});
