import { describe, expect, it } from "vitest";
import {
  barPlan,
  budgetPresets,
  clamp,
  clothFor,
  danceFloor,
  guestEstimate,
  parkingPlan,
  rebalance,
  spaceFor,
  tablesAndChairs,
  tentOptions,
  up,
  venueCapacity,
} from "@/lib/tools/calc";

describe("helpers", () => {
  it("up rounds up, ignores float noise and floors at zero", () => {
    expect(up(2.0000000001)).toBe(2);
    expect(up(2.1)).toBe(3);
    expect(up(-5) === 0).toBe(true); // -0, which prints as "0"
  });
  it("clamp handles NaN and Infinity", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(Number.NaN, 2, 3)).toBe(2);
    expect(clamp(Number.POSITIVE_INFINITY, 2, 3)).toBe(2);
  });
});

describe("guestEstimate", () => {
  it("adds expected guests and a padded chair count", () => {
    const r = guestEstimate(
      [
        { id: "a", label: "Family", invited: 100, rate: 90 },
        { id: "b", label: "Friends", invited: 50, rate: 60 },
      ],
      { vendors: 5, bufferPct: 5 },
    );
    expect(r.invited).toBe(150);
    expect(r.expected).toBe(120);
    expect(r.low).toBe(105);
    expect(r.high).toBe(135);
    expect(r.chairs).toBe(Math.ceil((135 + 5) * 1.05));
    expect(r.rate).toBe(80);
  });
  it("clamps rates and handles no groups", () => {
    const r = guestEstimate([{ id: "a", label: "x", invited: 10, rate: 150 }], { vendors: 0, bufferPct: 0 });
    expect(r.expected).toBe(10);
    expect(r.high).toBe(10);
    expect(guestEstimate([], { vendors: 0, bufferPct: 0 }).rate).toBe(0);
  });
});

describe("tablesAndChairs", () => {
  const base = { guests: 100, table: "round-60" as const, perTable: 8, ceremony: false, cocktail: false, guestsPerHighboy: 8, extras: [] as string[], sparePct: 0 };

  it("seats every guest", () => {
    const r = tablesAndChairs(base);
    expect(r.guestTables).toBe(13);
    expect(r.emptySeats).toBe(4);
    expect(r.receptionChairs).toBe(100);
    expect(r.ceremonyChairs).toBe(0);
  });

  it("caps seats per table at the table's maximum and adds spares and ceremony chairs", () => {
    const r = tablesAndChairs({ ...base, perTable: 20, ceremony: true, sparePct: 10 });
    expect(r.perTable).toBe(10);
    expect(r.guestTables).toBe(10);
    expect(r.receptionChairs).toBe(110);
    expect(r.ceremonyChairs).toBe(110);
  });

  it("adds extra tables and highboys to the counts", () => {
    const r = tablesAndChairs({ ...base, guests: 150, extras: ["buffet", "head"], cocktail: true });
    expect(r.tableCounts.get("banquet-8ft")).toBe(4 + 1);
    expect(r.highboys).toBe(19);
    expect(r.tableCounts.get("cocktail-highboy")).toBe(19);
  });
});

describe("space, tents and venues", () => {
  it("adds seating space and extras", () => {
    const r = spaceFor(100, "rounds", ["band", "head"]);
    expect(r.seating).toBe(1200);
    expect(r.total).toBe(1200 + 150 + 80);
  });

  it("picks a snug tent and a roomier one", () => {
    const t = tentOptions(1100);
    expect(t.snug).toEqual([30, 45]);
    expect(t.roomy![0] * t.roomy![1]).toBeGreaterThanOrEqual(1100 * 1.15);
    expect(t.tooBig).toBe(false);
    expect(tentOptions(1_000_000).tooBig).toBe(true);
  });

  it("works out venue capacity from usable space", () => {
    const v = venueCapacity({ length: 50, width: 40, reserved: 200, usablePct: 80 });
    expect(v.gross).toBe(2000);
    expect(v.usable).toBe(1400);
    expect(v.rows.find((r) => r.id === "rounds")?.guests).toBe(116);
    expect(venueCapacity({ length: -1, width: 40, reserved: 0, usablePct: 80 }).usable).toBe(0);
  });

  it("sizes a near-square dance floor in 3 ft panels with a 9-panel minimum", () => {
    const d = danceFloor(150, 33);
    expect(d.dancers).toBe(50);
    expect(d.panels).toBeGreaterThanOrEqual(50);
    expect(d.sqft).toBe(d.panels * 9);
    expect(d.widthFt % 3).toBe(0);
    expect(danceFloor(0, 33).panels).toBe(9);
  });
});

describe("clothFor", () => {
  it("picks the standard cloth that covers the table and drop", () => {
    expect(clothFor("round-60", "floor")).toMatchObject({ need: '120"', size: '120" round', actualDrop: 30 });
    expect(clothFor("round-60", "lap")).toMatchObject({ size: '84" round', actualDrop: 12 });
    expect(clothFor("banquet-8ft", "floor")).toMatchObject({ size: '90" x 156"', actualDrop: 30 });
    expect(clothFor("banquet-6ft", "lap").size).toBe('60" x 102"');
  });

  it("uses a floor-length spandex cover on a highboy", () => {
    const r = clothFor("highboy-30", "floor");
    expect(r.spandex).toBe(true);
    expect(r.size).toBe('120" round');
  });
});

describe("rebalance", () => {
  const lines = budgetPresets.wedding.lines;
  const total = (ls: { pct: number }[]) => ls.reduce((a, l) => a + l.pct, 0);

  it("keeps the total at 100 after any change", () => {
    for (const target of [0, 1, 17, 50, 99, 100, 140, -10]) {
      const next = rebalance(lines, "venue", target);
      expect(total(next), `venue=${target}`).toBe(100);
      expect(next.every((l) => l.pct >= 0)).toBe(true);
    }
  });

  it("never moves locked lines and caps the change at what is left", () => {
    const next = rebalance(lines, "venue", 90, ["catering"]);
    expect(next.find((l) => l.id === "catering")?.pct).toBe(30);
    expect(next.find((l) => l.id === "venue")?.pct).toBe(70);
    expect(total(next)).toBe(100);
  });
});

describe("barPlan", () => {
  it("splits drinks by mix and turns them into bottles", () => {
    const r = barPlan({
      guests: 100,
      hours: 4,
      firstHour: 2,
      laterHours: 1,
      mix: { wine: 50, beer: 30, cocktails: 20, soft: 0 },
      glassesPerGuest: 1.5,
      toast: true,
      water: false,
      icePerGuest: 1,
      guestsPerBartender: 50,
    });
    expect(r.perGuest).toBe(5);
    expect(r.drinks).toBe(500);
    expect(r.wineBottles).toBe(50);
    expect(r.beer).toBe(150);
    expect(r.spiritBottles).toBe(Math.ceil(100 / 16));
    expect(r.glassware["champagne-flute"]).toBe(100);
    expect(r.glassware["water-goblet"]).toBe(0);
    expect(r.bartenders).toBe(2);
  });

  it("handles zero guests and an all-zero mix without NaN", () => {
    const r = barPlan({ guests: 0, hours: 0, firstHour: 2, laterHours: 1, mix: { wine: 0, beer: 0, cocktails: 0, soft: 0 }, glassesPerGuest: 1, toast: false, water: false, icePerGuest: 1, guestsPerBartender: 50 });
    expect(r.drinks).toBe(0);
    expect(r.bartenders).toBe(0);
    expect(Object.values(r).every((v) => typeof v !== "number" || Number.isFinite(v))).toBe(true);
  });
});

describe("parkingPlan", () => {
  it("counts cars, overflow and shuttles", () => {
    const r = parkingPlan({ guests: 200, perCar: 2.5, rideSharePct: 10, shuttlePct: 20, onSite: 40, sqftPerSpace: 300, shuttleSeats: 20, roundTripMin: 30, windowMin: 60 });
    expect(r.shuttleRiders).toBe(40);
    expect(r.rideShare).toBe(20);
    expect(r.drivers).toBe(140);
    expect(r.cars).toBe(56);
    expect(r.overflow).toBe(16);
    expect(r.lotSqft).toBe(4800);
    expect(r.tripsPerVehicle).toBe(2);
    expect(r.shuttles).toBe(1);
  });

  it("never lets ride share plus shuttle exceed the guest count", () => {
    const r = parkingPlan({ guests: 100, perCar: 2, rideSharePct: 80, shuttlePct: 80, onSite: 0, sqftPerSpace: 300, shuttleSeats: 20, roundTripMin: 30, windowMin: 60 });
    expect(r.drivers).toBe(0);
    expect(r.shuttleRiders + r.rideShare).toBeLessThanOrEqual(100);
  });
});
