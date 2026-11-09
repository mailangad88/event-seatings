import { vendors } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { chicagoDay } from "@/lib/admin-view";
import { csvCell } from "@/lib/ledger";
import { priceRows } from "../rows";

export const dynamic = "force-dynamic";

const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? id;
const cols = [
  "item_id",
  "item",
  "category",
  "unit",
  "rental_company",
  "their_price",
  "our_price",
  "margin_amount",
  "margin_percent",
  "price_source",
  "last_checked",
  "source_url",
] as const;

// The whole catalog, with vendor price, our price and margin, as a spreadsheet — same filters as
// the /admin/pricing page (q, f, vendor, category) so the download matches what's on screen.
export async function GET(request: Request) {
  if (checkAdmin(request.headers.get("authorization")) !== "ok") {
    return new Response("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Beyond Chiavari admin"' } });
  }
  const sp = new URL(request.url).searchParams;
  const q = (sp.get("q") ?? "").trim().toLowerCase();
  const f = sp.get("f") ?? "";
  const vendor = sp.get("vendor") ?? "";
  const category = sp.get("category") ?? "";

  const rows = priceRows()
    .filter(
      (r) =>
        (!q || `${r.i.name} ${r.i.category} ${r.i.id}`.toLowerCase().includes(q)) &&
        (!vendor || r.i.vendorId === vendor) &&
        (!category || r.i.category === category) &&
        (f !== "estimated" || r.estimated) &&
        (f !== "stale" || r.stale) &&
        (f !== "cheaper" || !!r.cheapest),
    )
    .sort((a, b) => a.i.category.localeCompare(b.i.category) || a.i.name.localeCompare(b.i.name));

  const lines = rows.map((r) => {
    const out: Record<(typeof cols)[number], unknown> = {
      item_id: r.i.id,
      item: r.i.name,
      category: r.i.category,
      unit: r.i.unit,
      rental_company: vendorName(r.i.vendorId),
      their_price: r.i.vendorPrice,
      our_price: r.ours,
      margin_amount: r.cut,
      margin_percent: r.cutPercent,
      price_source: r.estimated ? "estimate" : "their price list",
      last_checked: r.i.priceCheckedAt ?? "",
      source_url: r.i.sourceUrl ?? "",
    };
    return cols.map((c) => csvCell(out[c])).join(",");
  });

  return new Response([cols.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="price-catalog-${chicagoDay()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
