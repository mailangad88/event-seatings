// Launch offer: $50 off the deposit for a customer's first booking with us, decided by Angad on
// 2026-11-06 after the competitor review found most Chicago-area rental companies run no offer at
// all. Applies to the amount charged now (the deposit or hold), never to the item prices or the
// vendor-facing commission math, so it never needs to touch catalog pricing or invoices.ts.
// Turn it off instantly (no redeploy) by setting NEXT_PUBLIC_FIRST_BOOKING_OFFER=off in Vercel.
export const FIRST_BOOKING_DISCOUNT = 50;

export const FIRST_BOOKING_OFFER_LABEL = `$${FIRST_BOOKING_DISCOUNT} off your first booking`;

export function firstBookingOfferEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FIRST_BOOKING_OFFER !== "off";
}

const cents = (n: number) => Math.round(n * 100) / 100;

/** Knocks the offer off an amount due now, never below $0. A no-op while the offer is off. */
export function withFirstBookingDiscount(amount: number): number {
  if (!firstBookingOfferEnabled() || amount <= 0) return amount;
  return Math.max(0, cents(amount - FIRST_BOOKING_DISCOUNT));
}

/** How much of the discount actually applied to this amount (0 to FIRST_BOOKING_DISCOUNT). */
export function firstBookingDiscountApplied(amountBeforeDiscount: number): number {
  if (!firstBookingOfferEnabled() || amountBeforeDiscount <= 0) return 0;
  return cents(amountBeforeDiscount - withFirstBookingDiscount(amountBeforeDiscount));
}
