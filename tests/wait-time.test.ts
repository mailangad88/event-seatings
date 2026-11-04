import { describe, expect, it } from "vitest";
import { waitClass, waitMinutes } from "@/lib/admin-view";

describe("new lead wait time", () => {
  const now = Date.parse("2026-11-04T20:00:00Z");
  it("counts minutes since the lead came in", () => {
    expect(waitMinutes("2026-11-04T19:30:00Z", now)).toBe(30);
    expect(waitMinutes(undefined, now)).toBe(0);
  });
  it("turns amber after 15 minutes and red after an hour", () => {
    expect(waitClass(5)).toBe("text-muted");
    expect(waitClass(20)).toContain("text-amber");
    expect(waitClass(90)).toContain("text-rose");
  });
});
