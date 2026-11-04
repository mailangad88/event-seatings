import { catalogItems } from "@/data/catalog";
import { addDays, chicagoDay, isConfirmed } from "@/lib/admin-view";
import { customerPrice } from "@/lib/catalog-types";
import type { Lead } from "@/lib/store";

// Pricing rows shared by /admin/pricing and its "items to recheck" download.

export type PriceRow = {
  i: (typeof catalogItems)[number];
  ours: number; // customer price
  cut: number; // our part of the customer price, per unit
  cheapest?: { vendorId: string; vendorPrice: number; sourceUrl?: string };
  stale: boolean;
  estimated: boolean;
};

const cents = (n: number) => Math.round(n * 100) / 100;

export function priceRows(today = chicagoDay()): PriceRow[] {
  const staleBefore = addDays(today, -90);
  return catalogItems.map((i) => {
    const cheapest = (i.altOffers ?? []).filter((o) => o.vendorPrice > 0 && o.vendorPrice < i.vendorPrice).sort((a, b) => a.vendorPrice - b.vendorPrice)[0];
    const ours = customerPrice(i);
    return { i, ours, cut: cents(ours - i.vendorPrice), cheapest, stale: !i.priceCheckedAt || i.priceCheckedAt < staleBefore, estimated: i.priceSource === "estimated" };
  });
}

// Why an item's price should be checked again, in plain words (empty = fine).
export function recheckReasons(r: PriceRow): string[] {
  return [
    r.estimated && "estimated price, no public price list",
    r.stale && (r.i.priceCheckedAt ? `last checked ${r.i.priceCheckedAt}` : "never checked"),
    r.cheapest && "another rental company lists it for less",
  ].filter((x): x is string => !!x);
}

// How often each item shows up on quotes, and what we earned on it from confirmed orders.
export type ItemUse = { quotes: number; qty: number; bookedQty: number; bookedCut: number };
export function itemUse(leads: Lead[]): Map<string, ItemUse> {
  const out = new Map<string, ItemUse>();
  for (const l of leads) {
    if (!l.items?.length) continue;
    const booked = isConfirmed(l);
    for (const line of l.items) {
      const u = out.get(line.id) ?? { quotes: 0, qty: 0, bookedQty: 0, bookedCut: 0 };
      u.quotes += 1;
      u.qty += line.qty;
      if (booked) {
        u.bookedQty += line.qty;
        u.bookedCut = cents(u.bookedCut + (line.unit_price - line.vendor_price) * line.qty);
      }
      out.set(line.id, u);
    }
  }
  return out;
}
