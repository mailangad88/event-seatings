import { describe, expect, it } from "vitest";
import { readyPackages } from "@/lib/packages";
import { clampGuests, packageHref, quotePackage } from "@/lib/package-price";

// Package cards reprice in the browser when the guest count changes; they must agree with the server build.
describe("ready-made package pricing", () => {
  it("prices each package at its usual size the same way the page does", () => {
    for (const p of readyPackages) {
      const q = quotePackage(p, p.guests, p.items);
      expect(q.allIn).toBe(p.allIn);
      expect(q.rentals).toBe(p.rentals);
      expect(q.itemCount).toBe(p.itemCount);
    }
  });

  it("scales with the guest count", () => {
    for (const p of readyPackages) {
      const small = quotePackage(p, 20, p.items);
      const big = quotePackage(p, 300, p.items);
      expect(big.rentals).toBeGreaterThan(small.rentals);
      expect(big.guests).toBe(300);
    }
  });

  it("keeps guest counts in range and puts them in the planner link", () => {
    expect(clampGuests(0)).toBe(1);
    expect(clampGuests(99999)).toBe(2000);
    const p = readyPackages[0];
    expect(packageHref(p, 72)).toContain("guests=72");
  });
});
