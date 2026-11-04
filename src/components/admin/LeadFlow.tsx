import Link from "@/components/Link";
import { intakeProgress } from "@/lib/intake";
import type { Lead } from "@/lib/store";

// The steps every lead goes through, linked in order, so each page points to the next one:
// call script -> ask what's missing -> quote -> customer proposal -> order to the rental company.
export function LeadFlow({ lead, current }: { lead: Lead; current: "script" | "lead" | "quote" }) {
  const p = intakeProgress(lead);
  const asked = (lead.activity ?? []).some((a) => a.type === "email" && a.text.startsWith("Sent ")) || (lead.activity ?? []).some((a) => a.text.startsWith("They filled in their event details"));
  const orders = Object.values(lead.vendor_orders ?? {}).filter((o) => o && o.status !== "cancelled");
  const ok = (o?: { status: string }) => !!o && ["confirmed", "scheduled", "delivered", "picked_up"].includes(o.status);
  const base = `/admin/leads/${lead.id}`;
  const steps = [
    { label: "Call script", note: `${p.answered}/${p.total} answers`, done: p.missing.length === 0, href: `${base}/script`, on: current === "script" },
    { label: "Ask what's missing", note: p.missing.length === 0 ? "Nothing missing" : asked ? "Asked" : `${p.missing.length} to ask`, done: p.missing.length === 0 || asked, href: `${base}/script#ask`, on: false },
    { label: "Quote", note: lead.items?.length ? `${lead.items.length} items` : "No items yet", done: (lead.items?.length ?? 0) > 0, href: `${base}/quote`, on: current === "quote" },
    { label: "Proposal", note: lead.fee_status === "paid" ? "Fee paid" : lead.proposal_token ? "Link made" : "Not made", done: lead.fee_status === "paid", href: `${base}#proposal`, on: false },
    {
      label: "Rental company order",
      note: orders.length ? `${orders.filter(ok).length}/${orders.length} confirmed` : lead.assigned_vendor ? "Assigned" : "Not sent",
      done: orders.length > 0 && orders.every(ok),
      href: `${base}#who-to-contact`,
      on: false,
    },
  ];
  return (
    <nav aria-label="Steps for this customer" className="mt-6 min-w-0">
      <ol className="flex flex-wrap gap-2 text-sm">
        {steps.map((s, i) => (
          <li key={s.label}>
            <Link
              href={s.href}
              aria-current={s.on ? "step" : undefined}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors hover:border-accent ${s.on ? "border-ink bg-ink text-surface" : "border-line bg-surface"}`}
            >
              <span className={`grid size-5 place-items-center rounded-full text-xs font-semibold ${s.done ? "bg-green text-surface" : s.on ? "bg-surface text-ink" : "bg-surface-2 text-muted"}`}>
                {s.done ? "✓" : i + 1}
              </span>
              <span className="font-medium">{s.label}</span>
              <span className={`text-xs ${s.on ? "text-surface/70" : "text-muted"}`}>{s.note}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
