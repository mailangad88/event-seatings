// One honest line under every price we show: these are our prices for a one-day rental, and the
// quote for your date and venue is what makes a price final.
export const PRICE_DISCLAIMER =
  "Prices are our one-day rental prices. Delivery, setup, damage waiver and tax are added on your quote, and your final price is confirmed in writing for your date and venue.";

// `vendorLink` is kept so older call sites still compile; it no longer shows anything.
export function PriceDisclaimer({ className = "" }: { className?: string; vendorLink?: boolean }) {
  return <p className={`text-xs leading-5 text-muted ${className}`}>{PRICE_DISCLAIMER}</p>;
}
