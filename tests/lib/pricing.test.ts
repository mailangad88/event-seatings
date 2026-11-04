import { describe, expect, it } from "vitest";
import {
  BOOKING_FEE_LABEL,
  MARKUP,
  customerPrice,
  priceQuote,
  sortCategories,
  suggestedQty,
  toPublicItem,
  type CatalogItem,
} from "@/lib/catalog-types";
import { allInEstimate, deliveryEstimate, SETUP_MIN } from "@/lib/fees";

const item = (over: Partial<CatalogItem> = {}): CatalogItem => ({
  id: "chiavari-gold",
  name: "Gold Chiavari chair",
  category: "Chairs",
  unit: "each",
  vendorPrice: 10,
  vendorId: "secret-vendor",
  sourceUrl: "https://vendor.example/item",
  priceCheckedAt: "2026-11-02",
  priceSource: "published",
  altOffers: [{ vendorId: "other-vendor", vendorPrice: 9 }],
  ...over,
});

describe("customer pricing", () => {
  it("adds the 10% markup and rounds to cents", () => {
    expect(MARKUP).toBe(0.1);
    expect(BOOKING_FEE_LABEL).toBe("10%");
    expect(customerPrice({ vendorPrice: 10 })).toBe(11);
    expect(customerPrice({ vendorPrice: 4.5 })).toBe(4.95);
    expect(customerPrice({ vendorPrice: 3.33 })).toBe(3.66);
    expect(customerPrice({ vendorPrice: 0 })).toBe(0);
  });
});

describe("toPublicItem", () => {
  it("never leaks vendor, cost or source fields", () => {
    const pub = toPublicItem(item()) as Record<string, unknown>;
    for (const k of ["vendorId", "vendorPrice", "sourceUrl", "priceCheckedAt", "priceSource", "altOffers"]) {
      expect(pub).not.toHaveProperty(k);
    }
    const json = JSON.stringify(pub);
    expect(json).not.toContain("secret-vendor");
    expect(json).not.toContain("other-vendor");
    expect(json).not.toContain("vendor.example");
    expect(pub.price).toBe(11);
    expect(pub.estimated).toBe(false);
  });

  it("flags estimated prices", () => {
    expect(toPublicItem(item({ priceSource: "estimated" })).estimated).toBe(true);
    expect(toPublicItem(item({ priceSource: undefined })).estimated).toBe(true);
  });

  it("hides every real vendor name from every real catalog item", async () => {
    const { catalogItems, vendors } = await import("@/data/catalog");
    expect(catalogItems.length).toBeGreaterThan(0);
    const names = vendors.map((v) => v.name).filter((n) => n.length > 3);
    for (const i of catalogItems) {
      const pub = toPublicItem(i);
      const json = JSON.stringify(pub);
      for (const n of names) expect(json, `${i.id} leaks ${n}`).not.toContain(`"${n}"`);
      expect(pub).not.toHaveProperty("vendorId");
      expect(pub.price).toBe(customerPrice(i));
    }
  });
});

describe("priceQuote", () => {
  const items = [item(), item({ id: "table-60", name: "60in round", category: "Tables", vendorPrice: 12.5, vendorId: "v2" })];

  it("prices from the catalog and ignores anything the browser says about prices", () => {
    const q = priceQuote([{ id: "chiavari-gold", qty: 100, price: 0.01 } as { id: string; qty: number }], items);
    expect(q.lines).toHaveLength(1);
    expect(q.lines[0].unit_price).toBe(11);
    expect(q.subtotal).toBe(1100);
    expect(q.cost).toBe(1000);
    expect(q.margin).toBe(100);
  });

  it("drops unknown ids and bad quantities, floors fractions and merges duplicates", () => {
    const q = priceQuote(
      [
        { id: "nope", qty: 5 },
        { id: "chiavari-gold", qty: -3 },
        { id: "chiavari-gold", qty: Number.NaN },
        { id: "chiavari-gold", qty: 0.9 },
        { id: "table-60", qty: 2.7 },
        { id: "table-60", qty: 3 },
      ],
      items,
    );
    expect(q.lines.map((l) => [l.id, l.qty])).toEqual([["table-60", 5]]);
    expect(q.subtotal).toBe(68.75);
    expect(q.cost).toBe(62.5);
  });

  it("caps a line at 10,000 units", () => {
    const q = priceQuote([{ id: "chiavari-gold", qty: 9_000 }, { id: "chiavari-gold", qty: 9_000 }], items);
    expect(q.lines[0].qty).toBe(10_000);
  });

  it("returns zeros for an empty list", () => {
    expect(priceQuote([], items)).toEqual({ lines: [], subtotal: 0, cost: 0, margin: 0 });
  });
});

describe("suggestedQty and sortCategories", () => {
  it("scales per guest with a minimum", () => {
    expect(suggestedQty({ perGuest: 1 }, 120)).toBe(120);
    expect(suggestedQty({ perGuest: 0.125 }, 100)).toBe(13);
    expect(suggestedQty({ perGuest: 0.125, minQty: 20 }, 100)).toBe(20);
    expect(suggestedQty({ perGuest: 0 }, 100)).toBe(0);
    expect(suggestedQty({ perGuest: 1 }, 0)).toBe(0);
  });

  it("orders known categories first and the rest alphabetically, without duplicates", () => {
    expect(sortCategories(["Zebra", "Tables", "Apples", "Chairs", "Tables"])).toEqual(["Chairs", "Tables", "Apples", "Zebra"]);
  });
});

describe("fees", () => {
  it("steps delivery by order size and adds a heavy-item surcharge", () => {
    expect(deliveryEstimate(500)).toBe(150);
    expect(deliveryEstimate(1000)).toBe(250);
    expect(deliveryEstimate(2999)).toBe(250);
    expect(deliveryEstimate(3000)).toBe(400);
    expect(deliveryEstimate(10_000)).toBe(600);
    expect(deliveryEstimate(500, ["tents"])).toBe(300);
    expect(deliveryEstimate(500, ["chairs"])).toBe(150);
  });

  it("returns nothing for an empty order", () => {
    expect(allInEstimate(0)).toEqual({ rentals: 0, lines: [], total: 0 });
    expect(allInEstimate(-5).total).toBe(0);
  });

  it("adds delivery, setup, waiver and tax that sum to the total", () => {
    const est = allInEstimate(1000);
    const byLabel = Object.fromEntries(est.lines.map((l) => [l.label, l.amount]));
    expect(byLabel["Delivery & pickup"]).toBe(250);
    expect(byLabel["Setup & teardown"]).toBe(150);
    expect(byLabel["Damage waiver (10%)"]).toBe(100);
    expect(byLabel["Sales tax"]).toBe(112.75);
    expect(est.total).toBe(1612.75);
    const sum = est.rentals + est.lines.reduce((s, l) => s + l.amount, 0);
    expect(est.total).toBeCloseTo(sum, 2);
  });

  it("applies the setup minimum, and can leave setup out", () => {
    const small = allInEstimate(100);
    expect(small.lines.find((l) => l.label.startsWith("Setup"))?.amount).toBe(SETUP_MIN);
    const noSetup = allInEstimate(100, { setup: false });
    expect(noSetup.lines.some((l) => l.label.startsWith("Setup"))).toBe(false);
  });
});
