import { priceIndexCsv } from "@/data/price-index";

// CSV download of the Chicago Event Rental Price Index (anonymized: no vendor names).
export const dynamic = "force-static";

export function GET() {
  return new Response(priceIndexCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="chicago-event-rental-price-index.csv"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
