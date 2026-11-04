import { afterEach, describe, expect, it } from "vitest";
import { holdingPageResponse, hostShowsFullSite, pathStaysOpen, sitePaused } from "@/lib/holding-page";

describe("holding page switch", () => {
  afterEach(() => {
    delete process.env.SITE_PAUSED;
  });

  it("is off unless SITE_PAUSED is set", () => {
    expect(sitePaused()).toBe(false);
    process.env.SITE_PAUSED = "1";
    expect(sitePaused()).toBe(true);
    process.env.SITE_PAUSED = "0";
    expect(sitePaused()).toBe(false);
  });

  it("keeps the full site on vercel.app and localhost", () => {
    expect(hostShowsFullSite("beyondchiavari.vercel.app")).toBe(true);
    expect(hostShowsFullSite("localhost:3000")).toBe(true);
    expect(hostShowsFullSite("beyondchiavari.com")).toBe(false);
    expect(hostShowsFullSite("www.beyondchiavari.com")).toBe(false);
  });

  it("keeps admin, accounts, proposals, search files and static files open", () => {
    for (const p of ["/admin", "/admin/leads", "/account", "/proposal/abc", "/robots.txt", "/sitemap.xml", "/llms.txt", "/BingSiteAuth.xml", "/828031dd25f8c09a964b03bc54b05dcc.txt", "/brand/logo.svg", "/favicon.ico"]) {
      expect(pathStaysOpen(p), p).toBe(true);
    }
    for (const p of ["/", "/rentals/chairs", "/pricing", "/quote", "/accounting-tips"]) {
      expect(pathStaysOpen(p), p).toBe(false);
    }
  });

  it("answers 503 with Retry-After so search engines keep the pages", async () => {
    const res = holdingPageResponse();
    expect(res.status).toBe(503);
    expect(res.headers.get("Retry-After")).toBe("3600");
    const html = await res.text();
    expect(html).toContain("We'll be back soon");
    expect(html).toContain("(630) 360-1795");
    expect(html).toContain('source:"holding-page"');
  });
});
