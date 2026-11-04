import { afterEach, describe, expect, it, vi } from "vitest";
import { unsubscribeUrl, verifyUnsubscribe } from "@/lib/unsubscribe";

const tokenFrom = (url: string) => new URL(url).searchParams.get("t") ?? "";

describe("unsubscribe links", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("signs a link that verifies, case and whitespace insensitive", () => {
    vi.stubEnv("UNSUBSCRIBE_SECRET", "test-secret");
    const url = unsubscribeUrl(" Priya@Example.com ");
    const u = new URL(url);
    expect(u.pathname).toBe("/api/unsubscribe");
    expect(u.searchParams.get("e")).toBe("priya@example.com");
    const t = tokenFrom(url);
    expect(t).toHaveLength(32);
    expect(verifyUnsubscribe("priya@example.com", t)).toBe(true);
    expect(verifyUnsubscribe("PRIYA@example.com", t)).toBe(true);
  });

  it("rejects tampered tokens and other addresses", () => {
    vi.stubEnv("UNSUBSCRIBE_SECRET", "test-secret");
    const t = tokenFrom(unsubscribeUrl("priya@example.com"));
    const flipped = (t[0] === "A" ? "B" : "A") + t.slice(1);
    expect(verifyUnsubscribe("priya@example.com", flipped)).toBe(false);
    expect(verifyUnsubscribe("priya@example.com", t.slice(0, 31))).toBe(false);
    expect(verifyUnsubscribe("priya@example.com", t + "x")).toBe(false);
    expect(verifyUnsubscribe("someone@example.com", t)).toBe(false);
    expect(verifyUnsubscribe("priya@example.com", "")).toBe(false);
    expect(verifyUnsubscribe("", t)).toBe(false);
  });

  it("stops verifying when the secret changes", () => {
    vi.stubEnv("UNSUBSCRIBE_SECRET", "one");
    const t = tokenFrom(unsubscribeUrl("priya@example.com"));
    vi.stubEnv("UNSUBSCRIBE_SECRET", "two");
    expect(verifyUnsubscribe("priya@example.com", t)).toBe(false);
  });

  it("falls back to ADMIN_PASSWORD, then to a mailto link with no secret at all", () => {
    vi.stubEnv("UNSUBSCRIBE_SECRET", "");
    vi.stubEnv("ADMIN_PASSWORD", "pw");
    const t = tokenFrom(unsubscribeUrl("priya@example.com"));
    expect(verifyUnsubscribe("priya@example.com", t)).toBe(true);

    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(unsubscribeUrl("priya@example.com")).toMatch(/^mailto:/);
    expect(verifyUnsubscribe("priya@example.com", t)).toBe(false);
  });
});
