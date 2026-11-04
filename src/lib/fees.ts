// What a Chicago rental order really costs on top of the per-item rates.
//
// Vendors publish rental-only, one-day, will-call prices. A delivered event adds
// delivery and pickup, setup and teardown, a damage waiver and sales tax. These rules
// turn a rental subtotal into a realistic all-in estimate. Sources (checked 2026-11-02):
// - Hall's Rental 2026 guide: delivery + pickup $130 weekdays, $155 Saturdays, $125+ minimum order;
//   setup and takedown quoted separately.
// - Arlington Rental: "complete quotes add delivery, tax and fees"; its packages add a 10% damage waiver
//   and 10% tax.
// - Chicago combined sales tax is 10.25% (suburbs run lower, about 7-10%).
// Item prices carry no markup; our flat coordination fee (COORDINATION_FEE in catalog-types) is separate.

export const DAMAGE_WAIVER = 0.1;
export const SALES_TAX = 0.1025;
export const SETUP_SHARE = 0.15;
export const SETUP_MIN = 75;
export const DELIVERY_MINIMUM_ORDER = 150;

/** Categories that need a bigger truck and crew (installed structures, heavy flooring, trailers). */
const HEAVY = new Set(["tents", "dance-floors-staging", "restrooms-power"]);

/** Round-trip delivery and pickup for one order, by order size. */
export function deliveryEstimate(subtotal: number, categoryIds: string[] = []) {
  const base = subtotal < 1000 ? 150 : subtotal < 3000 ? 250 : subtotal < 7500 ? 400 : Math.round(subtotal * 0.06);
  return base + (categoryIds.some((c) => HEAVY.has(c)) ? 150 : 0);
}

export type FeeLine = { label: string; amount: number; note?: string };
export type AllIn = { rentals: number; lines: FeeLine[]; total: number };

const cents = (n: number) => Math.round(n * 100) / 100;

export function allInEstimate(rentals: number, opts: { categoryIds?: string[]; setup?: boolean } = {}): AllIn {
  if (rentals <= 0) return { rentals: 0, lines: [], total: 0 };
  const delivery = deliveryEstimate(rentals, opts.categoryIds);
  const setup = opts.setup === false ? 0 : Math.max(SETUP_MIN, cents(rentals * SETUP_SHARE));
  const waiver = cents(rentals * DAMAGE_WAIVER);
  const tax = cents((rentals + waiver) * SALES_TAX);
  const lines: FeeLine[] = [
    { label: "Delivery & pickup", amount: delivery, note: "est., depends on distance and stairs" },
    ...(setup ? [{ label: "Setup & teardown", amount: setup, note: "est." }] : []),
    { label: "Damage waiver (10%)", amount: waiver },
    { label: "Sales tax", amount: tax, note: "Chicago rate, suburbs lower" },
  ];
  return { rentals, lines, total: cents(rentals + lines.reduce((s, l) => s + l.amount, 0)) };
}

/** Rough all-in multiplier for a typical delivered order, for copy such as "about 1.5x". */
export const TYPICAL_ALL_IN_NOTE =
  "Rental rates exclude delivery and pickup (about $150-$400 per order), setup, a 10% damage waiver and sales tax, which together add roughly 35-60% to a typical order.";
