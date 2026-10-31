import { listLeads } from "@/lib/store";

export const dynamic = "force-dynamic";

const cols = [
  "created_at", "kind", "name", "email", "phone", "event_date", "event_type",
  "guest_count", "city", "venue", "chairs", "quiz_styles", "message", "source",
] as const;

function cell(v: unknown) {
  let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
  // Stop spreadsheet apps from treating user input as a formula.
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const leads = await listLeads();
  const csv = [cols.join(","), ...leads.map((l) => cols.map((c) => cell(l[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="event-seatings-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
