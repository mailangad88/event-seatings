// Launch offer: $50 off the deposit for a customer's first booking with us, decided by Angad on
// 2026-11-06 after the competitor review found most Chicago-area rental companies run no offer at
// all. Applies to the amount charged now (the deposit or hold), never to the item prices or the
// vendor-facing commission math, so it never needs to touch catalog pricing or invoices.ts.
// Narrowed on 2026-11-09 to orders over $1,000 in rentals (quote subtotal), so the discount can't
// eat into small bookings.
// Turn it off instantly (no redeploy) by setting NEXT_PUBLIC_FIRST_BOOKING_OFFER=off in Vercel.
export const FIRST_BOOKING_DISCOUNT = 50;
export const FIRST_BOOKING_MINIMUM_ORDER = 1000;

export const FIRST_BOOKING_OFFER_LABEL = `$${FIRST_BOOKING_DISCOUNT} off orders over $${FIRST_BOOKING_MINIMUM_ORDER.toLocaleString()}`;

export function firstBookingOfferEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FIRST_BOOKING_OFFER !== "off";
}

/** Whether this order's rental subtotal qualifies for the offer. */
export function firstBookingOfferEligible(orderSubtotal: number): boolean {
  return firstBookingOfferEnabled() && orderSubtotal > FIRST_BOOKING_MINIMUM_ORDER;
}

const cents = (n: number) => Math.round(n * 100) / 100;

/** Knocks the offer off an amount due now, never below $0. A no-op unless orderSubtotal qualifies. */
export function withFirstBookingDiscount(amount: number, orderSubtotal: number): number {
  if (!firstBookingOfferEligible(orderSubtotal) || amount <= 0) return amount;
  return Math.max(0, cents(amount - FIRST_BOOKING_DISCOUNT));
}

/** How much of the discount actually applied to this amount (0 to FIRST_BOOKING_DISCOUNT). */
export function firstBookingDiscountApplied(amountBeforeDiscount: number, orderSubtotal: number): number {
  if (!firstBookingOfferEligible(orderSubtotal) || amountBeforeDiscount <= 0) return 0;
  return cents(amountBeforeDiscount - withFirstBookingDiscount(amountBeforeDiscount, orderSubtotal));
}

/**
 * The discount to apply to one lead's deposit: whatever the admin set on the lead (`discount_amount`,
 * edited in /admin/leads/<id>/quote — 0 removes the offer entirely), or the automatic first-booking
 * offer when nothing has been overridden yet. Never more than the amount it's discounting.
 */
export function discountFor(lead: { discount_amount?: number }, amountBeforeDiscount: number, orderSubtotal: number): number {
  if (lead.discount_amount !== undefined) return cents(Math.max(0, Math.min(lead.discount_amount, amountBeforeDiscount)));
  return firstBookingDiscountApplied(amountBeforeDiscount, orderSubtotal);
}
