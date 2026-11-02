import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChair } from "@/data/chairs";
import { vendors } from "@/data/catalog";
import { usd, type QuoteLine } from "@/lib/catalog-types";
import { getLead, leadStatuses, statusLabel, trackingFields, type Lead } from "@/lib/store";
import { saveLead } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lead", robots: { index: false } };

const day = (d?: string) =>
  d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) : "—";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 py-1.5">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

function byVendor(lines: QuoteLine[]) {
  const groups = new Map<string, QuoteLine[]>();
  for (const l of lines) groups.set(l.vendor_id, [...(groups.get(l.vendor_id) ?? []), l]);
  return [...groups].map(([id, ls]) => ({
    vendor: vendors.find((v) => v.id === id) ?? { id, name: id },
    lines: ls,
    cost: ls.reduce((s, l) => s + l.vendor_price * l.qty, 0),
  }));
}

// A plain-text order the owner can paste into an email to the rental partner.
function vendorOrder(lead: Lead, lines: QuoteLine[]) {
  return [
    `Event: ${lead.event_type ?? "Event"} on ${day(lead.event_date)}`,
    `Location: ${[lead.venue, lead.city].filter(Boolean).join(", ") || "TBD"}`,
    `Guests: ${lead.guest_count ?? "TBD"}`,
    "",
    ...lines.map((l) => `${l.qty} × ${l.name} (${l.unit})`),
    "",
    "Please confirm availability, delivery and setup fees.",
  ].join("\n");
}

export default async function LeadPage(props: PageProps<"/admin/leads/[id]">) {
  const { id } = await props.params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const lines = lead.items ?? [];
  const subtotal = lead.quote_subtotal ?? 0;
  const cost = lead.quote_cost ?? 0;
  const card = "card p-6";
  const first = lead.name?.split(" ")[0] ?? "there";
  const mail = `mailto:${lead.email}?subject=${encodeURIComponent(`Your ${lead.event_type ?? "event"} rental quote`)}&body=${encodeURIComponent(`Hi ${first},\n\nThanks for sending your list. `)}`;

  return (
    <div className="container-x py-12">
      <Link href="/admin/leads" className="text-sm text-accent">← All leads</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{statusLabel(lead.status)} · {lead.kind}</p>
          <h1 className="mt-1 font-serif text-5xl">{lead.name ?? lead.email}</h1>
          <p className="mt-2 text-muted">
            Received {new Date(lead.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" })} Chicago time
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={mail} className="btn-primary">Email</a>
          {lead.phone && <a href={`tel:${lead.phone}`} className="btn-ghost">Call</a>}
          {lead.phone && lead.sms_consent && <a href={`sms:${lead.phone}`} className="btn-ghost">Text</a>}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="font-serif text-2xl">Contact and event</h2>
            <dl className="mt-3 grid gap-x-10 text-sm md:grid-cols-2">
              <div>
                <Row label="Email"><a href={`mailto:${lead.email}`} className="text-accent">{lead.email}</a></Row>
                <Row label="Phone">{lead.phone}</Row>
                <Row label="Texting OK">{lead.phone ? (lead.sms_consent ? "Yes" : "No consent") : undefined}</Row>
              </div>
              <div>
                <Row label="Event date">{day(lead.event_date)}</Row>
                <Row label="Occasion">{lead.event_type}</Row>
                <Row label="Guests">{lead.guest_count}</Row>
                <Row label="City">{lead.city}</Row>
                <Row label="Venue">{lead.venue}</Row>
              </div>
            </dl>
            {lead.message && <p className="mt-4 border-l border-gold pl-4 text-sm leading-6 whitespace-pre-line">{lead.message}</p>}
            {!lines.length && lead.chairs?.length ? (
              <p className="mt-4 text-sm">Chairs: {lead.chairs.map((s) => getChair(s)?.name ?? s).join(", ")}</p>
            ) : null}
            {lead.quiz_styles?.length ? <p className="mt-2 text-sm">Style quiz: {lead.quiz_styles.join(", ")}</p> : null}
          </section>

          {lines.length > 0 && (
            <section className={`${card} overflow-x-auto`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-serif text-2xl">Quote</h2>
                <p className="text-sm text-muted">
                  Customer saw <strong className="text-ink">{usd(subtotal)}</strong> · vendor cost {usd(cost)} · margin{" "}
                  <strong className="text-ink">{usd(subtotal - cost)}</strong>
                </p>
              </div>
              <table className="mt-4 w-full min-w-[620px] text-sm">
                <thead className="text-left text-muted">
                  <tr className="border-b border-line">
                    <th className="py-2 font-medium">Item</th>
                    <th className="py-2 text-right font-medium">Qty</th>
                    <th className="py-2 text-right font-medium">Our price</th>
                    <th className="py-2 text-right font-medium">Line total</th>
                    <th className="py-2 text-right font-medium">Vendor cost</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className="border-b border-line last:border-0">
                      <td className="py-2">{l.name} <span className="text-muted">/ {l.unit}</span></td>
                      <td className="py-2 text-right tabular-nums">{l.qty.toLocaleString()}</td>
                      <td className="py-2 text-right tabular-nums">{usd(l.unit_price)}</td>
                      <td className="py-2 text-right tabular-nums">{usd(l.line_total)}</td>
                      <td className="py-2 text-right text-muted tabular-nums">{usd(l.vendor_price * l.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {lines.length > 0 && (
            <section className={card}>
              <h2 className="font-serif text-2xl">Order by vendor</h2>
              <p className="mt-1 text-sm text-muted">Copy each block into an email to check availability with the rental partner.</p>
              <div className="mt-4 space-y-5">
                {byVendor(lines).map((g) => (
                  <div key={g.vendor.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-medium">{g.vendor.name}</h3>
                      <span className="text-sm text-muted">
                        cost {usd(g.cost)}
                        {"phone" in g.vendor && g.vendor.phone && <> · <a href={`tel:${g.vendor.phone}`} className="text-accent">{g.vendor.phone}</a></>}
                        {"email" in g.vendor && g.vendor.email && <> · <a href={`mailto:${g.vendor.email}?subject=${encodeURIComponent(`Availability: ${day(lead.event_date)}`)}&body=${encodeURIComponent(vendorOrder(lead, g.lines))}`} className="text-accent">email order</a></>}
                        {"website" in g.vendor && g.vendor.website && <> · <a href={g.vendor.website} target="_blank" rel="noopener" className="text-accent">site</a></>}
                      </span>
                    </div>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-2 p-3 text-xs leading-5 whitespace-pre-wrap">{vendorOrder(lead, g.lines)}</pre>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={card}>
            <h2 className="font-serif text-2xl">Timeline</h2>
            <ol className="mt-4 space-y-3 text-sm">
              {[...(lead.activity ?? [])].reverse().map((a, i) => (
                <li key={i} className="grid grid-cols-[8.5rem_1fr] gap-3">
                  <span className="text-muted">
                    {new Date(a.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" })}
                  </span>
                  <span>
                    <span className="chip mr-2">{a.type.replace("_", "-")}</span>
                    <span className="whitespace-pre-line">{a.text}</span>
                  </span>
                </li>
              ))}
              {!lead.activity?.length && <li className="text-muted">No activity yet.</li>}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <form action={saveLead} className={`${card} space-y-4 lg:sticky lg:top-24`}>
            <h2 className="font-serif text-2xl">Update lead</h2>
            <input type="hidden" name="id" value={lead.id} />
            <div>
              <label className="label" htmlFor="status">Stage</label>
              <select id="status" name="status" defaultValue={lead.status ?? "new"} className="field">
                {leadStatuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="assigned_vendor">Rental partner</label>
              <select id="assigned_vendor" name="assigned_vendor" defaultValue={lead.assigned_vendor ?? ""} className="field">
                <option value="">Not assigned</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="follow_up_at">Next follow-up</label>
              <input id="follow_up_at" name="follow_up_at" type="date" defaultValue={lead.follow_up_at ?? ""} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="lost_reason">If lost, why</label>
              <input id="lost_reason" name="lost_reason" defaultValue={lead.lost_reason ?? ""} className="field" placeholder="Price, date taken, went with venue's chairs…" />
            </div>
            <div>
              <label className="label" htmlFor="note">Log activity</label>
              <select name="note_type" defaultValue="note" className="field mb-2" aria-label="Activity type">
                <option value="note">Note</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="text">Text</option>
                <option value="vendor">Vendor update</option>
              </select>
              <textarea id="note" name="note" rows={4} className="field resize-none" placeholder="Left voicemail, sent proposal, vendor confirmed 150 chairs…" />
            </div>
            <button className="btn-primary w-full">Save</button>
          </form>

          <section className={card}>
            <h2 className="font-serif text-2xl">Where they came from</h2>
            <dl className="mt-3 text-sm">
              <Row label="Form">{lead.source}</Row>
              {trackingFields.map((f) => (
                <Row key={f} label={f.replace(/_/g, " ")}>{lead[f]}</Row>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
