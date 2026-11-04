import { vendors } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { chicagoDay } from "@/lib/admin-view";
import { csvCell, kindLabel, listLedger, mergeLedger, methodLabel } from "@/lib/ledger";
import { listLeads } from "@/lib/store";
import { filterLedger, ledgerFilters } from "../filters";

export const dynamic = "force-dynamic";

const cols = ["date", "type", "amount", "paid_by", "customer", "customer_email", "lead_id", "rental_partner", "statement_month", "note", "source", "id"] as const;

// The payments ledger as a spreadsheet, with the same filters as /admin/payments (?kind=&method=&period=&q=).
// /admin/* is already behind the password in src/proxy.ts; the check here keeps it closed if that matcher ever changes.
export async function GET(request: Request) {
  if (checkAdmin(request.headers.get("authorization")) !== "ok") {
    return new Response("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Beyond Chiavari admin"' } });
  }
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const [recorded, leads] = await Promise.all([listLedger(), listLeads()]);
  const byId = new Map(leads.map((l) => [l.id, l]));
  const rows = filterLedger(mergeLedger(recorded, leads), ledgerFilters(sp), leads);
  const lines = rows.map((r) => {
    const lead = r.lead_id ? byId.get(r.lead_id) : undefined;
    const out: Record<(typeof cols)[number], unknown> = {
      date: chicagoDay(r.created_at),
      type: kindLabel(r.kind),
      amount: r.signed,
      paid_by: methodLabel(r.method),
      customer: lead?.name ?? "",
      customer_email: lead?.email ?? "",
      lead_id: r.lead_id ?? "",
      rental_partner: r.vendor_id ? vendors.find((v) => v.id === r.vendor_id)?.name ?? r.vendor_id : "",
      statement_month: r.month ?? "",
      note: r.note ?? "",
      source: r.source === "lead" ? "from the proposal" : "recorded",
      id: r.id,
    };
    return cols.map((c) => csvCell(out[c])).join(",");
  });
  return new Response([cols.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payments-${chicagoDay()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
