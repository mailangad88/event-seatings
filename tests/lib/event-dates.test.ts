import { describe, expect, it } from "vitest";
import { addDays, daysBetween, holidays, holidaysNear, icsFile, season, weekday } from "@/lib/event-dates";

const find = (y: number, name: string) => holidays(y).find((h) => h.name.startsWith(name))?.date;

describe("holidays", () => {
  it("knows the moving holidays", () => {
    expect(find(2026, "Easter")).toBe("2026-04-05");
    expect(find(2027, "Easter")).toBe("2027-03-28");
    expect(find(2026, "Thanksgiving")).toBe("2026-11-26");
    expect(find(2026, "Memorial Day")).toBe("2026-05-25");
    expect(find(2026, "Labor Day")).toBe("2026-09-07");
    expect(find(2026, "Mother's Day")).toBe("2026-05-10");
    expect(find(2027, "Martin Luther King")).toBe("2027-01-18");
  });

  it("finds holidays near a date across a year boundary, nearest first", () => {
    const near = holidaysNear("2026-12-30", 2);
    expect(near.map((h) => h.name)).toEqual(["New Year's Eve", "New Year's Day"].slice(0, near.length));
    expect(near[0].offset).toBe(1);
    expect(holidaysNear("2026-12-30", 2).some((h) => h.date === "2027-01-01")).toBe(true);
  });
});

describe("date maths", () => {
  it("counts days and adds days across DST and leap years", () => {
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
    expect(addDays("2026-10-31", 2)).toBe("2026-11-02");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("names weekdays and seasons", () => {
    expect(weekday("2026-11-04")).toBe("Wednesday");
    expect(season("2026-12-01")).toBe("winter");
    expect(season("2026-02-28")).toBe("winter");
    expect(season("2026-03-01")).toBe("spring");
    expect(season("2026-08-31")).toBe("summer");
    expect(season("2026-09-01")).toBe("fall");
  });

  it("builds a valid all-day .ics", () => {
    const ics = icsFile({ date: "2026-12-31", title: "Party; drinks, food", location: "Chicago, IL" });
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231");
    expect(ics).toContain("DTEND;VALUE=DATE:20270101");
    expect(ics).toContain("SUMMARY:Party\\; drinks\\, food");
    expect(ics).toContain("LOCATION:Chicago\\, IL");
    expect(ics).not.toContain("DESCRIPTION:");
  });
});
