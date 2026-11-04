import { checkAdmin } from "@/lib/admin-auth";
import { listLeads, statusLabel, trackingFields, type Lead } from "@/lib/store";

export const dynamic = "force-dynamic";

const cols = [
  "created_at", "kind", "status", "name", "email", "phone", "event_date", "event_type",
  "guest_count", "city", "venue", "chairs", "quiz_styles", "message", "source", "sms_consent", "email_consent", "call_consent", "opted_out_at", "lead_score", "lead_score_reasons", "pages_viewed", "interests", "sequence", "ip_location",
  "items", "quote_subtotal", "quote_cost", "assigned_vendor", "follow_up_at", "lost_reason", "notes", ...trackingFields,
] as const;

function cell(v: unknown) {
  let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
  // Stop spreadsheet apps from treating user input as a formula.
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

// Flattens the CRM's structured fields into readable spreadsheet text.
function row(l: Lead): Record<string, unknown> {
  return {
    ...l,
    status: statusLabel(l.status),
    items: l.items?.map((i) => `${i.qty} x ${i.name}`),
    notes: l.activity?.map((a) => `${a.at.slice(0, 10)} ${a.type}: ${a.text}`),
  };
}

export async function GET(request: Request) {
  // Checks the password itself as well as src/proxy.ts, so a matcher change can never expose the lead list.
  if (checkAdmin(request.headers.get("authorization")) !== "ok") {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Beyond Chiavari admin"', "Cache-Control": "no-store" },
    });
  }
  const leads = await listLeads();
  const csv = [cols.join(","), ...leads.map((l) => row(l)).map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
