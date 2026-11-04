import { describe, expect, it } from "vitest";
import { activityMaxEvents, mergeActivity, parseActivity, type ActivityEvent } from "@/lib/activity";

const now = Date.parse("2026-11-10T16:00:00Z");
const at = (minAgo: number) => new Date(now - minAgo * 60_000).toISOString();

describe("parseActivity", () => {
  it("keeps good events and drops bad ones", () => {
    const out = parseActivity(
      [
        { t: "page", at: at(5), path: "/rentals/chairs", title: "Chairs" },
        { t: "click", at: at(4), path: "/quote", label: "Add to list" },
        { t: "quote_list", at: at(3), path: "/quote", items: ["round-60", "BAD ID", 7] },
        { t: "planner", at: at(2), path: "/quote", step: 3 },
        { t: "page", at: at(1), path: "/admin/leads" },
        { t: "page", at: at(1), path: "https://evil.example" },
        { t: "page", at: new Date(now + 3_600_000).toISOString(), path: "/" },
        { t: "page", at: at(3000), path: "/" },
        { t: "other", at: at(1), path: "/" },
      ],
      now,
    );
    expect(out.map((e) => e.t)).toEqual(["page", "click", "quote_list", "planner"]);
    expect(out[2]).toMatchObject({ items: ["round-60"] });
  });

  it("accepts only arrays", () => {
    expect(parseActivity({ t: "page" }, now)).toEqual([]);
  });
});

describe("mergeActivity", () => {
  it("drops repeats and keeps the newest events", () => {
    const e = (i: number): ActivityEvent => ({ t: "page", at: new Date(now - (1000 - i) * 1000).toISOString(), path: `/p${i}` });
    const first = Array.from({ length: 150 }, (_, i) => e(i));
    const merged = mergeActivity(first, [...first.slice(-10), ...Array.from({ length: 100 }, (_, i) => e(150 + i))]);
    expect(merged).toHaveLength(activityMaxEvents);
    expect(merged.at(-1)?.path).toBe("/p249");
  });
});
