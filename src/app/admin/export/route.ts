import { listLeads, statusLabel, trackingFields, type Lead } from "@/lib/store";

export const dynamic = "force-dynamic";

const cols = [
  "created_at", "kind", "status", "name", "email", "phone", "event_date", "event_type",
  "guest_count", "city", "venue", "chairs", "quiz_styles", "message", "source", "sms_consent",
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

export async function GET() {
  const leads = await listLeads();
  const csv = [cols.join(","), ...leads.map((l) => row(l)).map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
