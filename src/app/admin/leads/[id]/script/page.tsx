import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminUi";
import { CallScript } from "@/components/admin/CallScript";
import { LeadFlow } from "@/components/admin/LeadFlow";
import { OutreachPanel } from "@/components/admin/OutreachPanel";
import { detailsLink } from "@/lib/details-link";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { ago, eventLine, prettyDay } from "@/lib/admin-view";
import { usd } from "@/lib/catalog-types";
import { buildOutreach, prefillIntake } from "@/lib/intake";
import { getLead, statusLabel } from "@/lib/store";
import { saveCallScript, sendDetailsEmail } from "../../../calls/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Call script", robots: { index: false } };

export default async function CallScriptPage(props: PageProps<"/admin/leads/[id]/script">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const lead = await getLead(id);
  if (!lead || lead.kind === "partner") notFound();
  const lines = lead.items ?? [];
  const who = lead.name || lead.email || lead.phone || "this customer";
  const link = detailsLink(lead.id);
  const outreach = buildOutreach(lead, { link, from: process.env.OWNER_NAME || "Angad", phone: site.phone || undefined });
  const canSend = Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_FROM);
  const saved = sp.sent === "1" ? "Email sent and logged on the timeline. Follow-up set for 2 days from now if there wasn't one." : sp.sent === "no" ? "" : sp.saved === "1" ? "Saved. The answers are on the lead and in its timeline." : sp.saved === "new" ? "Call saved as a new lead. Finish anything you missed below." : "";

  return (
    <div className="container-x py-10">
      <Link href={`/admin/leads/${lead.id}`} className="text-sm text-accent">← Back to {who}</Link>
      <div className="mt-3">
        <AdminHeader
          group="Customers"
          title={`Call script: ${who}`}
          intro={
            <>
              Go top to bottom so every customer gets the same questions. Green answers they already gave us, so just confirm them. Amber
              ones are still needed before we can price the event with rental companies.
              {lead.intake?.saved_at && ` Last saved ${ago(lead.intake.saved_at)}.`}
            </>
          }
          actions={
            <>
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="btn-primary btn-sm">
                  <Icon name="phone" size={16} /> {lead.phone}
                </a>
              )}
              <Link href={`/admin/leads/${lead.id}`} className="btn-ghost btn-sm">Open lead</Link>
            </>
          }
        />
      </div>

      <LeadFlow lead={lead} current="script" />

      {sp.sent === "no" && (
        <p role="alert" className="mt-6 rounded-xl bg-rose-soft px-4 py-3 text-sm text-rose">
          The email didn&apos;t send. Check RESEND_API_KEY and NOTIFY_FROM in Vercel, or use Open in my email app.
        </p>
      )}
      {saved && (
        <p role="status" className="mt-6 rounded-xl bg-green-soft px-4 py-3 text-sm text-green">
          {saved}
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="office-card p-5">
          <h2 className="text-sm font-semibold">What they sent us</h2>
          <p className="mt-1 text-xs text-muted">
            {statusLabel(lead.status)} · {lead.kind} · {lead.source ?? "website"} · {prettyDay(lead.created_at.slice(0, 10))}
          </p>
          <p className="mt-2 text-sm">{[eventLine(lead), lead.event_date && prettyDay(lead.event_date)].filter(Boolean).join(" · ") || "No event details yet."}</p>
          {lead.message && lead.source !== "phone:inbound" ? <p className="mt-3 border-l border-gold pl-3 text-sm leading-6 whitespace-pre-line">{lead.message}</p> : null}
        </section>
        <section className="office-card p-5">
          <h2 className="text-sm font-semibold">{lines.length ? `Their list (${lines.length} items, ${usd(lead.quote_subtotal ?? 0)})` : "Their list"}</h2>
          {lines.length ? (
            <ul className="mt-2 max-h-48 overflow-y-auto text-sm">
              {lines.map((l) => (
                <li key={l.id + (l.variant ?? "")} className="flex justify-between gap-3 border-b border-line py-1 last:border-0">
                  <span className="min-w-0">{l.qty.toLocaleString()} × {l.name}</span>
                  <span className="shrink-0 text-muted">{l.category}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No items picked yet. Use the Items question to note what they need, then build the quote.</p>
          )}
          <Link href={`/admin/leads/${lead.id}/quote`} className="mt-3 inline-block text-sm text-accent">Edit quote →</Link>
        </section>
      </div>

      <OutreachPanel
        leadId={lead.id}
        opener={outreach.opener}
        subject={outreach.subject}
        email={outreach.email}
        text={outreach.text}
        to={lead.email || undefined}
        phone={lead.phone}
        smsOk={!!lead.sms_consent}
        link={link}
        canSend={canSend}
        asks={outreach.asks.map((f) => f.label.toLowerCase())}
        action={sendDetailsEmail}
      />

      <CallScript action={saveCallScript} prefilled={prefillIntake(lead)} leadId={lead.id} />
    </div>
  );
}
