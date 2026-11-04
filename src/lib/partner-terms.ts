// Rental partner (vendor) terms in one place. The partner pages, the one-page terms at /partners/terms,
// the how-we-work table and the admin commission statements all read these, so changing a number here
// changes every one of them. Pricing options and the reasoning: /mnt/project-files/plans/pricing-research-2026-11-04.md.
export const PARTNER_TERMS = {
  /** Referral fee on the rental subtotal of orders we send that book. */
  rate: 0.05,
  /** Orders from enquiries sent in a partner's first N days are free. */
  freeDays: 90,
  /** Statements are due this many days after we send them. */
  netDays: 15,
  /** A customer we introduce counts as ours for this long, including repeat events. */
  attributionMonths: 24,
  /** How fast we ask partners to answer an availability request. */
  replyHours: 4,
  /** How long a quote from the partner's price list stays valid. */
  quoteValidDays: 14,
  /** Notice either side gives to leave, and notice of price changes. */
  noticeDays: 30,
  /** How fast we remove a company's prices or photos on request. */
  removalDays: 2,
  /** Fallback for a company that won't do a percentage: a flat amount per order it accepts. */
  perOrderFallback: 35,
} as const;

export const partnerRatePct = `${Math.round(PARTNER_TERMS.rate * 1000) / 10}%`;

/** "free for your first 90 days, then 5% of the rental subtotal, only on orders we send that book" */
export const partnerFeeLine = `free for your first ${PARTNER_TERMS.freeDays} days, then ${partnerRatePct} of the rental subtotal, only on orders we send that book`;

/** What a partner pays on a booked order of this rental subtotal, after the free period. */
export const partnerFeeOn = (rentals: number) => Math.round(rentals * PARTNER_TERMS.rate);
