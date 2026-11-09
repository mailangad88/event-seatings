// The rental-cost calculator (/rental-cost, /rental-cost/[category]) and the Chicago price index
// (/data/chicago-rental-prices) show real dollar figures, which Angad asked to pull down on
// 2026-11-09 along with every other public price. Taken out of nav/sitemap and 302'd to /quote
// instead of deleted, so they can come back with one env var flip — unlike NEXT_PUBLIC_FIRST_BOOKING_OFFER
// in offers.ts, this is a NEXT_PUBLIC_ var read at build time, so re-enabling still needs a redeploy.
export function priceComparisonPagesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PRICE_COMPARISON_PAGES === "on";
}
