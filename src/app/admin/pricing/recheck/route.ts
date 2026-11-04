import { vendors } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { chicagoDay } from "@/lib/admin-view";
import { csvCell } from "@/lib/ledger";
import { priceRows, recheckReasons } from "../rows";

export const dynamic = "force-dynamic";

const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? id;
const cols = ["item_id", "item", "category", "unit", "rental_company", "their_price", "our_price", "why", "last_checked", "price_source", "source_url", "cheaper_company", "cheaper_price", "cheaper_url", "new_price", "checked_on"] as const;

// Catalog items whose prices need checking again (estimated, not checked in 90 days, or cheaper elsewhere), as a
// spreadsheet. Fill in new_price and checked_on, then send it back so the catalog data can be updated.
export async function GET(request: Request) {
  if (checkAdmin(request.headers.get("authorization")) !== "ok") {
    return new Response("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Beyond Chiavari admin"' } });
  }
  const vendor = new URL(request.url).searchParams.get("vendor") ?? "";
  const rows = priceRows()
    .filter((r) => (!vendor || r.i.vendorId === vendor) && recheckReasons(r).length > 0)
    .sort((a, b) => a.i.vendorId.localeCompare(b.i.vendorId) || (a.i.priceCheckedAt ?? "").localeCompare(b.i.priceCheckedAt ?? "") || a.i.name.localeCompare(b.i.name));
  const lines = rows.map((r) => {
    const out: Record<(typeof cols)[number], unknown> = {
      item_id: r.i.id,
      item: r.i.name,
      category: r.i.category,
      unit: r.i.unit,
      rental_company: vendorName(r.i.vendorId),
      their_price: r.i.vendorPrice,
      our_price: r.ours,
      why: recheckReasons(r).join("; "),
      last_checked: r.i.priceCheckedAt ?? "",
      price_source: r.estimated ? "estimate" : "their price list",
      source_url: r.i.sourceUrl ?? "",
      cheaper_company: r.cheapest ? vendorName(r.cheapest.vendorId) : "",
      cheaper_price: r.cheapest?.vendorPrice ?? "",
      cheaper_url: r.cheapest?.sourceUrl ?? "",
      new_price: "",
      checked_on: "",
    };
    return cols.map((c) => csvCell(out[c])).join(",");
  });
  return new Response([cols.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prices-to-recheck-${chicagoDay()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
