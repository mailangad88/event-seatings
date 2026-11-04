import { describe, expect, it } from "vitest";
import { deviceFromUserAgent, locationFromHeaders, parseJourney } from "@/lib/journey";
import { cleanCode } from "@/lib/referrals";

describe("referral codes", () => {
  it("accepts tidy codes and normalises case", () => {
    expect(cleanCode("priya-7k2m")).toBe("priya-7k2m");
    expect(cleanCode("  PRIYA-7K2M ")).toBe("priya-7k2m");
  });
  it("rejects anything else", () => {
    for (const v of ["ab", "-abc", "a".repeat(33), "pri ya", "priya_1", "<script>", "../etc", 42, null, undefined, {}]) {
      expect(cleanCode(v), String(v)).toBeUndefined();
    }
  });
});

describe("parseJourney", () => {
  const page = { path: "/rentals", title: "Rentals", at: "2026-11-01T10:00:00Z", visit: 1 };

  it("accepts a JSON string or an object and keeps only clean pages and clicks", () => {
    const raw = {
      visits: 3,
      page_views: 1,
      pages: [page, { path: "https://evil.test", at: page.at }, { path: "/x", at: "not a date" }, null],
      clicks: [{ label: "Get a quote", href: "/quote", path: "/rentals", at: page.at }, { label: "", path: "/", at: page.at }],
    };
    for (const input of [raw, JSON.stringify(raw)]) {
      const j = parseJourney(input)!;
      expect(j.pages).toHaveLength(1);
      expect(j.pages[0].at).toBe("2026-11-01T10:00:00.000Z");
      expect(j.clicks).toHaveLength(1);
      expect(j.visits).toBe(3);
      expect(j.first_seen).toBe(j.pages[0].at);
    }
  });

  it("drops malformed, empty or oversized input", () => {
    expect(parseJourney("{not json")).toBeUndefined();
    expect(parseJourney(null)).toBeUndefined();
    expect(parseJourney({ pages: [] })).toBeUndefined();
    expect(parseJourney("x".repeat(20_001))).toBeUndefined();
  });

  it("keeps only the last 30 pages and trims long text", () => {
    const pages = Array.from({ length: 50 }, (_, i) => ({ ...page, path: `/p${i}`, title: "t".repeat(500) }));
    const j = parseJourney({ pages })!;
    expect(j.pages).toHaveLength(30);
    expect(j.pages[0].path).toBe("/p20");
    expect(j.pages[0].title).toHaveLength(140);
    expect(j.page_views).toBe(30);
  });

  it("never takes device or location from the browser", () => {
    const j = parseJourney({ pages: [page], device: "spoofed", location: "spoofed" })!;
    expect(j).not.toHaveProperty("device");
    expect(j).not.toHaveProperty("location");
  });
});

describe("request helpers", () => {
  it("reads Vercel location headers, decoding safely", () => {
    const h = new Headers({ "x-vercel-ip-city": "San%20Jos%C3%A9", "x-vercel-ip-country-region": "CA", "x-vercel-ip-country": "US" });
    expect(locationFromHeaders(h)).toBe("San José, CA, US");
    expect(locationFromHeaders(new Headers({ "x-vercel-ip-city": "%E0%A4%A" }))).toBe("%E0%A4%A");
    expect(locationFromHeaders(new Headers())).toBeUndefined();
  });

  it("names the device from the user agent", () => {
    expect(deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile")).toBe("Phone (iOS)");
    expect(deviceFromUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("Tablet (iOS)");
    expect(deviceFromUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("Computer (Windows)");
    expect(deviceFromUserAgent("Mozilla/5.0 (Linux; Android 14) Mobile")).toBe("Phone (Android)");
    expect(deviceFromUserAgent(null)).toBeUndefined();
  });
});
