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
// - A gold Chiavari chair vendor Angad called directly (2026-11-09) bills $1.80 per chair to
//   set up and $0.90 per chair to tear down, flat, not a share of the rental. For a chair-heavy
//   order that is more (and more accurate) than the 15%-of-rental estimate below, so we price
//   chair setup/teardown per chair and fall back to the 15% share for everything else in the order.
//   That same vendor quotes same-day delivery-and-pickup as rare, so we no longer imply it's standard.
// Customer item prices are ours (supplier rate + MARKUP in catalog-types). These lines are charged at cost.

export const DAMAGE_WAIVER = 0.1;
export const SALES_TAX = 0.1025;
export const SETUP_SHARE = 0.15;
export const SETUP_MIN = 75;
export const DELIVERY_MINIMUM_ORDER = 150;
export const CHAIR_SETUP_PER_CHAIR = 1.8;
export const CHAIR_TEARDOWN_PER_CHAIR = 0.9;

/** Categories that need a bigger truck and crew (installed structures, heavy flooring, trailers). */
const HEAVY = new Set(["tents", "dance-floors-staging", "restrooms-power"]);

/** Round-trip delivery and pickup for one order, by order size. */
export function deliveryEstimate(subtotal: number, categoryIds: string[] = []) {
  const base = subtotal < 1000 ? 150 : subtotal < 3000 ? 250 : subtotal < 7500 ? 400 : Math.round(subtotal * 0.06);
  return base + (categoryIds.some((c) => HEAVY.has(c)) ? 150 : 0);
}

// `id` is only used so the admin quote editor (and the form it posts) can key a row; the public
// estimate functions below don't need it and tests that compare lines by label/amount still pass.
export type FeeLine = { id?: string; label: string; amount: number; note?: string };
export type AllIn = { rentals: number; lines: FeeLine[]; total: number };

const cents = (n: number) => Math.round(n * 100) / 100;

export const sumFeeLines = (lines: FeeLine[]) => cents(lines.reduce((s, l) => s + l.amount, 0));

/**
 * The fee lines (delivery, setup, teardown, damage waiver, tax) to show and charge for this order:
 * whatever the admin saved on the lead (`fee_lines`, edited in /admin/leads/<id>/quote), or the
 * computed estimate below when nothing has been overridden yet.
 */
export function feeLinesFor(lead: { fee_lines?: FeeLine[] }, rentals: number, opts?: Parameters<typeof allInEstimate>[1]): FeeLine[] {
  return lead.fee_lines ?? allInEstimate(rentals, opts).lines;
}

export function allInEstimate(
  rentals: number,
  opts: { categoryIds?: string[]; setup?: boolean; chairQty?: number; chairRentals?: number } = {}
): AllIn {
  if (rentals <= 0) return { rentals: 0, lines: [], total: 0 };
  const delivery = deliveryEstimate(rentals, opts.categoryIds);
  const chairQty = Math.max(0, opts.chairQty ?? 0);
  const chairRentals = Math.min(rentals, Math.max(0, opts.chairRentals ?? 0));
  const chairSetupFee = chairQty > 0 ? cents(chairQty * CHAIR_SETUP_PER_CHAIR) : 0;
  const chairTeardownFee = chairQty > 0 ? cents(chairQty * CHAIR_TEARDOWN_PER_CHAIR) : 0;
  const otherShare = cents((rentals - chairRentals) * SETUP_SHARE);
  const setupHalf = cents(otherShare / 2);
  const setup = opts.setup === false ? 0 : Math.max(SETUP_MIN / 2, cents(chairSetupFee + setupHalf));
  const teardown = opts.setup === false ? 0 : Math.max(SETUP_MIN / 2, cents(chairTeardownFee + (otherShare - setupHalf)));
  const waiver = cents(rentals * DAMAGE_WAIVER);
  // Tax applies to the rental items themselves, not to delivery/setup/teardown/the waiver (Angad, 2026-11-09).
  const tax = cents(rentals * SALES_TAX);
  const lines: FeeLine[] = [
    {
      id: "delivery",
      label: "Delivery fee",
      amount: delivery,
      note: "est., depends on distance and stairs; same-day delivery and pickup is rare and usually quoted separately",
    },
    ...(setup ? [{ id: "setup", label: "Setup fee", amount: setup, note: "est." }] : []),
    ...(teardown ? [{ id: "teardown", label: "Teardown fee", amount: teardown, note: "est." }] : []),
    { id: "waiver", label: "Damage waiver (10%)", amount: waiver },
    { id: "tax", label: "Illinois sales tax", amount: tax, note: "Chicago rate, suburbs lower" },
  ];
  return { rentals, lines, total: cents(rentals + lines.reduce((s, l) => s + l.amount, 0)) };
}

/** Rough all-in multiplier for a typical delivered order, for copy such as "about 1.5x". */
export const TYPICAL_ALL_IN_NOTE =
  "Rental rates exclude delivery and pickup (about $150-$400 per order), setup, a 10% damage waiver and sales tax, which together add roughly 35-60% to a typical order. Same-day delivery and pickup is rare; plan on delivery the day before and pickup the day after unless we confirm otherwise.";
