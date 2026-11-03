import { getVendorApplication } from "@/lib/vendor-applications";

export const dynamic = "force-dynamic";

// The vendor's uploaded price list as a CSV, in our template's columns, ready to add to the catalog extracts.
// Lives under /admin, so the admin password check in src/proxy.ts covers it.
const cols = ["category", "item_name", "size_or_specs", "colors_or_finishes", "unit", "price_usd", "minimum_qty", "setup_included", "notes"];

function cell(v: unknown) {
  let s = v == null ? "" : typeof v === "boolean" ? (v ? "yes" : "no") : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, ctx: RouteContext<"/admin/applications/[id]/prices">) {
  const { id } = await ctx.params;
  const app = await getVendorApplication(id);
  if (!app) return new Response("Not found", { status: 404 });
  const rows = (app.price_items ?? []).map((r) =>
    [r.category, r.name, r.specs, r.colors, r.unit, r.price, r.min_qty, r.setup_included, r.notes].map(cell).join(","),
  );
  const slug = app.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "vendor";
  return new Response([cols.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-price-list.csv"`,
    },
  });
}
