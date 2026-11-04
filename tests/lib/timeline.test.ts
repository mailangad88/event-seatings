import { describe, expect, it } from "vitest";
import { buildTimeline, parseISO, toICS, toISO } from "@/lib/tools/timeline";

describe("parseISO / toISO", () => {
  it("round-trips valid dates and rejects junk", () => {
    expect(toISO(parseISO("2027-06-12")!)).toBe("2027-06-12");
    expect(parseISO("2027-6-12")).toBeUndefined();
    expect(parseISO("")).toBeUndefined();
  });
});

describe("buildTimeline", () => {
  it("lays out a full wedding runway with no past dates", () => {
    const r = buildTimeline({ event: "wedding", date: "2027-11-04", today: "2026-11-04", outdoor: false });
    expect(r.past).toBe(false);
    expect(r.until).toBe(365);
    expect(r.compressed).toBe(false);
    expect(r.tasks.length).toBeGreaterThan(10);
    expect(r.tasks.every((t) => t.date >= "2026-11-04")).toBe(true);
    // Sorted from furthest out to after the event.
    const days = r.tasks.map((t) => t.daysBefore);
    expect([...days].sort((a, b) => b - a)).toEqual(days);
    expect(r.tasks.find((t) => t.id === "event")?.date).toBe("2027-11-04");
    expect(r.tasks.find((t) => t.id === "return")?.date).toBe("2027-11-05");
  });

  it("leaves outdoor tasks out of an indoor event and adds them outdoors", () => {
    const indoor = buildTimeline({ event: "wedding", date: "2027-11-04", today: "2026-11-04", outdoor: false });
    const outdoor = buildTimeline({ event: "wedding", date: "2027-11-04", today: "2026-11-04", outdoor: true });
    expect(indoor.tasks.some((t) => t.id === "tent")).toBe(false);
    expect(outdoor.tasks.some((t) => t.id === "tent")).toBe(true);
  });

  it("compresses a short runway, marks overdue work and drops save-the-dates", () => {
    const r = buildTimeline({ event: "wedding", date: "2026-11-24", today: "2026-11-04", outdoor: true });
    expect(r.until).toBe(20);
    expect(r.compressed).toBe(true);
    expect(r.tasks.some((t) => t.id === "save")).toBe(false);
    expect(r.tasks.every((t) => t.date >= "2026-11-04")).toBe(true);
    const rentals = r.tasks.find((t) => t.id === "rentals")!;
    expect(rentals.overdue).toBe(true);
    expect(rentals.date).toBe("2026-11-04");
    expect(rentals.title).toMatch(/today/i);
    // Non-urgent overdue work lands tomorrow.
    const decor = r.tasks.find((t) => t.id === "decor")!;
    expect(decor.date).toBe("2026-11-05");
  });

  it("returns nothing for a past or invalid date", () => {
    expect(buildTimeline({ event: "wedding", date: "2026-01-01", today: "2026-11-04", outdoor: false })).toMatchObject({ past: true, tasks: [] });
    expect(buildTimeline({ event: "wedding", date: "bad", today: "2026-11-04", outdoor: false }).tasks).toEqual([]);
  });

  it("drops links to tools that are not available, keeping the task", () => {
    const r = buildTimeline({ event: "wedding", date: "2027-11-04", today: "2026-11-04", outdoor: false, available: new Set(["/quote"]) });
    expect(r.tasks.find((t) => t.id === "rentals")?.href).toBe("/quote");
    const budget = r.tasks.find((t) => t.id === "budget");
    expect(budget).toBeTruthy();
    expect(budget?.href).toBeUndefined();
  });

  it("falls back to the first event type for an unknown id", () => {
    const a = buildTimeline({ event: "nope", date: "2027-11-04", today: "2026-11-04", outdoor: false });
    const b = buildTimeline({ event: "wedding", date: "2027-11-04", today: "2026-11-04", outdoor: false });
    expect(a.tasks.map((t) => t.id)).toEqual(b.tasks.map((t) => t.id));
  });
});

describe("toICS", () => {
  it("writes one escaped all-day entry per task with CRLF line endings", () => {
    const ics = toICS("Priya's wedding", [{ title: "Book venue, caterer; DJ", date: "2027-12-31", why: "Line one\nline two" }], "https://x.test");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("DTSTART;VALUE=DATE:20271231");
    expect(ics).toContain("DTEND;VALUE=DATE:20280101");
    expect(ics).toContain("SUMMARY:Priya's wedding: Book venue\\, caterer\\; DJ");
    expect(ics).toContain("DESCRIPTION:Line one\\nline two\\nhttps://x.test");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });
});
