import { describe, expect, it } from "vitest";
import { scoreLead, suggestedReply, visitorLocalTime } from "@/lib/lead-score";
import { makeLead } from "../helpers";

const now = new Date("2026-11-04T12:00:00");

describe("scoreLead", () => {
  it("gives A to a soon, big, reachable quote", () => {
    const s = scoreLead(makeLead({ event_date: "2027-01-15", guest_count: 150, phone: "312-555-0100", kind: "quote" }), now);
    expect(s.grade).toBe("A");
    expect(s.reasons).toContain("left a phone number");
    expect(s.reasons).toContain("asked for a quote");
    expect(s.reasons.some((r) => /^event in \d+ days$/.test(r))).toBe(true);
  });

  it("gives B to a dated lead with only some signals", () => {
    const s = scoreLead(makeLead({ kind: "waitlist", event_date: "2027-01-15", guest_count: 50 }), now);
    expect(s.grade).toBe("B");
  });

  it("gives C without a date, however big the order", () => {
    const s = scoreLead(makeLead({ guest_count: 300, quote_subtotal: 9000, phone: "1", kind: "quote" }), now);
    expect(s.grade).toBe("C");
    expect(s.reasons).toContain("no event date");
  });

  it("gives C to a past date", () => {
    const s = scoreLead(makeLead({ event_date: "2026-01-01", guest_count: 300, quote_subtotal: 9000, phone: "1" }), now);
    expect(s.grade).toBe("C");
    expect(s.reasons).toContain("event date is in the past");
  });

  it("counts months for dates 4 to 12 months out and notes dates beyond a year", () => {
    expect(scoreLead(makeLead({ event_date: "2027-06-01" }), now).reasons[0]).toMatch(/^event in \d+ months$/);
    expect(scoreLead(makeLead({ event_date: "2028-06-01" }), now).reasons[0]).toBe("event more than a year out");
  });

  it("uses quote value tiers", () => {
    const base = { event_date: "2027-01-15", kind: "waitlist" as const };
    expect(scoreLead(makeLead({ ...base, quote_subtotal: 400 }), now).grade).toBe("C");
    expect(scoreLead(makeLead({ ...base, quote_subtotal: 500 }), now).grade).toBe("B");
    expect(scoreLead(makeLead({ ...base, quote_subtotal: 1500, phone: "x" }), now).grade).toBe("A");
  });
});

describe("suggestedReply", () => {
  it("greets by first name and mentions the date for a quote", () => {
    const r = suggestedReply(makeLead({ name: "  Priya   Shah ", kind: "quote", event_type: "Wedding", event_date: "2027-06-12" }));
    expect(r.startsWith("Hi Priya,")).toBe(true);
    expect(r).toContain("wedding on June 12");
  });

  it("falls back to a plain greeting and covers every kind", () => {
    for (const kind of ["quote", "call", "chat", "partner", "waitlist", "quiz"] as const) {
      const r = suggestedReply(makeLead({ kind }));
      expect(r.startsWith("Hi,")).toBe(true);
      expect(r.length).toBeGreaterThan(40);
    }
    expect(suggestedReply(makeLead({ kind: "waitlist", source: "planner:wedding" }))).toContain("planner");
    expect(suggestedReply(makeLead({ kind: "waitlist", source: "download:kit" }))).toContain("planning kit");
  });
});

describe("visitorLocalTime", () => {
  it("formats in the visitor's zone and ignores bad zones", () => {
    const at = new Date("2026-11-04T23:42:00Z");
    expect(visitorLocalTime("America/Chicago", at)).toMatch(/5:42\s?PM CST/);
    expect(visitorLocalTime(undefined, at)).toBeUndefined();
    expect(visitorLocalTime("Not/AZone", at)).toBeUndefined();
  });
});
