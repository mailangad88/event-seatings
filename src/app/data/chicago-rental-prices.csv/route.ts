import { priceIndexCsv } from "@/data/price-index";
import { priceComparisonPagesEnabled } from "@/lib/price-pages";

// CSV download of the Chicago Event Rental Price Index (anonymized: no vendor names).
// Hidden behind the same flag as the page it's linked from — see src/lib/price-pages.ts.
export const dynamic = "force-static";

export function GET() {
  if (!priceComparisonPagesEnabled()) return new Response("Not found", { status: 404 });
  return new Response(priceIndexCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="chicago-event-rental-price-index.csv"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
