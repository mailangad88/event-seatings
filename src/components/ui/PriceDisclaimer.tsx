// One honest line under every price we show: it's an estimate until we confirm availability for
// your date and venue. Never names a rental company, its price, or its share of our price.
export const PRICE_DISCLAIMER =
  "This is an estimate. We confirm the final price for your date and venue before anything is charged.";

export function PriceDisclaimer({ className = "" }: { className?: string }) {
  return <p className={`text-xs leading-5 text-muted ${className}`}>{PRICE_DISCLAIMER}</p>;
}
