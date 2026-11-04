import { describe, expect, it } from "vitest";
import { allowedHost, originFrom } from "@/lib/request-origin";

const SITE = "https://beyondchiavari.com";
const hdr = (o: Record<string, string>) => new Headers(o);

describe("request origin for outgoing links", () => {
  it("trusts our own domains and deployments", () => {
    for (const h of ["beyondchiavari.com", "www.beyondchiavari.com", "beyondchivari.com", "beyondchiavari.vercel.app", "beyondchiavari-git-main-angad11.vercel.app"]) {
      expect(allowedHost(h, SITE, false), h).toBe(true);
    }
  });

  it("refuses other hosts, lookalikes and localhost outside development", () => {
    for (const h of ["evil.example", "beyondchiavari.com.evil.example", "evilbeyondchiavari.vercel.app", "beyondchiavari.vercel.app.evil.example", "localhost:3000"]) {
      expect(allowedHost(h, SITE, false), h).toBe(false);
    }
    expect(allowedHost("localhost:3000", SITE, true)).toBe(true);
  });

  it("falls back to the site address when the forwarded host is forged", () => {
    expect(originFrom(hdr({ host: "beyondchiavari.vercel.app", "x-forwarded-host": "evil.example" }), SITE, false)).toBe(SITE);
    expect(originFrom(hdr({}), SITE + "/", false)).toBe(SITE);
  });

  it("keeps preview hosts and always uses https for them", () => {
    expect(originFrom(hdr({ "x-forwarded-host": "beyondchiavari-git-x-angad11.vercel.app", "x-forwarded-proto": "http" }), SITE, false)).toBe(
      "https://beyondchiavari-git-x-angad11.vercel.app",
    );
    expect(originFrom(hdr({ host: "localhost:3000" }), SITE, true)).toBe("http://localhost:3000");
  });
});
