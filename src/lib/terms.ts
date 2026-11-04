// Customer terms: the version a customer agrees to and the default policy numbers the /terms page uses.
// Change a number here and the terms page updates. When you change the wording of /terms in a way that
// matters, bump TERMS_VERSION so each lead shows which version the customer agreed to.
//
// These are starting defaults written on Nov 4, 2026. They have NOT been reviewed by an attorney yet.

export const TERMS_VERSION = "2026-11-04";
export const TERMS_UPDATED = "November 4, 2026";

export const termsPolicy = {
  // How long a written quote's prices hold.
  quoteValidDays: 7,
  // Deposit to confirm a booking: a share of the rental subtotal, at least depositMin dollars (never more than the
  // subtotal). Keep in step with DEPOSIT in src/lib/catalog-types.ts.
  depositPercent: 50,
  depositMin: 100,
  // The balance is due this many days before the event. Inside this window, pay in full to book.
  balanceDueDays: 7,
  // Cancel within this many hours of booking (and at least `fullWindowDays` before delivery) for a full refund.
  coolingOffHours: 72,
  fullWindowDays: 30,
  // Cancellation charges, as a share of the order total, by days before delivery.
  // More than 30 days: the deposit is kept but can move to a new date within `creditMonths`.
  // 8 to 30 days: 50%. 7 days or less: 100%.
  midWindowDays: 8,
  midCharge: 50,
  creditMonths: 12,
  // Free changes: quantity cuts and date moves up to this many days before delivery.
  changeCutoffDays: 7,
  // Damage, loss and cleaning charges are sent within this many days after pickup, with photos.
  damageNoticeDays: 7,
  // Talk to us for this long before going to court.
  disputeTalkDays: 30,
  // County where the business is based (St. Charles, IL).
  county: "Kane County, Illinois",
} as const;

export const termsAgreementLabel = "I agree to the Terms and Conditions and the Privacy Policy.";
