import { catalogItems } from "@/data/catalog";
import { rentalImage } from "@/data/rental-images";
import { addDays, chicagoDay, isConfirmed } from "@/lib/admin-view";
import { customerPrice } from "@/lib/catalog-types";
import type { Lead } from "@/lib/store";

// Pricing rows shared by /admin/pricing and its "items to recheck" and full-catalog downloads.

export type PriceRow = {
  i: (typeof catalogItems)[number];
  ours: number; // customer price
  cut: number; // our part of the customer price, per unit
  cutPercent: number; // our part, as a % of the customer price
  image?: string;
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
    const cut = cents(ours - i.vendorPrice);
    return {
      i,
      ours,
      cut,
      cutPercent: ours > 0 ? Math.round((cut / ours) * 1000) / 10 : 0,
      image: i.image ?? rentalImage(i.id)?.src,
      cheapest,
      stale: !i.priceCheckedAt || i.priceCheckedAt < staleBefore,
      estimated: i.priceSource === "estimated",
    };
  });
}

/** Every category name in the catalog, in catalog order, for the category filter. */
export function priceCategories(): string[] {
  return [...new Set(catalogItems.map((i) => i.category))];
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
