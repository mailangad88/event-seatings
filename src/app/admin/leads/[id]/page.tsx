import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { getChair } from "@/data/chairs";
import { getCatalogItem, vendors } from "@/data/catalog";
import { getVendor, type Vendor } from "@/data/vendors";
import { VendorContact } from "@/components/admin/VendorContact";
import { usd, type QuoteLine } from "@/lib/catalog-types";
import { LeadJourney, LeadOutreach, LeadSource } from "@/components/admin/LeadJourney";
import { AfterEnquiry } from "@/components/admin/AfterEnquiry";
import { buildLeadAlert } from "@/lib/lead-alert";
import { intakeFields, intakeProgress, intakeText, proposalEmail, showValue, vendorDetails } from "@/lib/intake";
import { LeadFlow } from "@/components/admin/LeadFlow";
import { getLead, getVisitorActivity, leadStatuses, listLeadsByEmail, listPartners, statusLabel, trackingFields, type Lead } from "@/lib/store";
import { amountDue, chargeLabel, stripeEnabled } from "@/lib/payments";
import { site } from "@/lib/site";
import { createProposal, saveLead, setFeeStatus } from "../actions";

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

// Groups a quote by the vendor each line is priced from, with backup vendors that carry the same items.
function byVendor(lines: QuoteLine[]) {
  const groups = new Map<string, QuoteLine[]>();
  for (const l of lines) groups.set(l.vendor_id, [...(groups.get(l.vendor_id) ?? []), l]);
  return [...groups].map(([id, ls]) => {
    const backupIds = new Set<string>();
    for (const l of ls) {
      const item = getCatalogItem(l.id);
      for (const o of item?.altOffers ?? []) backupIds.add(o.vendorId);
      for (const b of item?.backupVendorIds ?? []) backupIds.add(b);
    }
    backupIds.delete(id);
    return {
      vendor: getVendor(id) ?? { id, name: id },
      lines: ls,
      cost: ls.reduce((s, l) => s + l.vendor_price * l.qty, 0),
      value: ls.reduce((s, l) => s + l.line_total, 0),
      backups: [...backupIds].map(getVendor).filter((v): v is Vendor => !!v).slice(0, 4),
    };
  });
}

// A plain-text order the owner can paste into an email to the rental partner.
function vendorOrder(lead: Lead, lines: QuoteLine[]) {
  return [
    `Event: ${lead.event_type ?? "Event"} on ${day(lead.event_date)}`,
    `Location: ${[lead.venue, lead.city].filter(Boolean).join(", ") || "TBD"}`,
    `Guests: ${lead.guest_count ?? "TBD"}`,
    ...vendorDetails(lead),
    "",
    ...lines.map((l) => `${l.qty} × ${l.name} (${l.unit})`),
    "",
    "Please confirm availability, delivery and setup fees. We'll send the street address and the on-site contact once it's booked.",
  ].join("\n");
}

export default async function LeadPage(props: PageProps<"/admin/leads/[id]">) {
  const { id } = await props.params;
  const [lead, partnerRows] = await Promise.all([getLead(id), listPartners()]);
  if (!lead) notFound();
  const partners = new Map(partnerRows.map((p) => [p.vendor_id, p]));
  const [earlier, afterEvents] = await Promise.all([
    lead.email ? listLeadsByEmail(lead.email).catch(() => [] as Lead[]) : Promise.resolve([] as Lead[]),
    lead.visitor_id ? getVisitorActivity(lead.visitor_id).catch(() => []) : Promise.resolve([]),
  ]);
  const alert = buildLeadAlert(lead, { earlier, partners, siteUrl: site.url });

  const lines = lead.items ?? [];
  const subtotal = lead.quote_subtotal ?? 0;
  const cost = lead.quote_cost ?? 0;
  const card = "card p-6";
  const assigned = lead.assigned_vendor ? getVendor(lead.assigned_vendor) : undefined;
  const groups = byVendor(lines);
  if (assigned && !groups.some((g) => g.vendor.id === assigned.id)) {
    groups.push({ vendor: assigned, lines: [], cost: 0, value: 0, backups: [] });
  }
  const first = lead.name?.split(" ")[0] ?? "there";
  const script = intakeProgress(lead);
  const callAnswers = intakeFields.filter((f) => !f.core && lead.intake?.answers[f.id] !== undefined && showValue(f, lead.intake.answers[f.id]));
  const mail = `mailto:${lead.email}?subject=${encodeURIComponent(`Your ${lead.event_type ?? "event"} rental quote`)}&body=${encodeURIComponent(`Hi ${first},\n\nThanks for sending your list. `)}`;

  return (
    <div className="container-x py-12">
      <Link href="/admin/leads" className="text-sm text-accent">← All leads</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {lead.lead_score && <span title={lead.lead_score_reasons}>{lead.lead_score} lead · </span>}
            {statusLabel(lead.status)} · {lead.kind}
          </p>
          <h1 className="display-2 mt-1">{lead.name ?? lead.email}</h1>
          <p className="mt-2 text-muted">
            Received {new Date(lead.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" })} Chicago time
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/leads/${lead.id}/script`} className="btn-primary">
            Call script{script.missing.length ? ` (${script.missing.length} to ask)` : ""}
          </Link>
          {lead.email && <a href={mail} className="btn-ghost">Email</a>}
          {lead.phone && <a href={`tel:${lead.phone}`} className="btn-ghost">Call</a>}
          {lead.phone && lead.sms_consent && <a href={`sms:${lead.phone}`} className="btn-ghost">Text</a>}
        </div>
      </div>

      <LeadFlow lead={lead} current="lead" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="display-3">Contact and event</h2>
            <dl className="mt-3 grid gap-x-10 text-sm md:grid-cols-2">
              <div>
                <Row label="Email">{lead.email ? <a href={`mailto:${lead.email}`} className="text-accent">{lead.email}</a> : "Not given yet"}</Row>
                <Row label="Phone">{lead.phone}</Row>
                <Row label="Texting OK">{lead.phone ? (lead.sms_consent ? "Yes" : "No consent") : undefined}</Row>
                <Row label="Calling OK">{lead.phone ? (lead.call_consent ? "Yes" : "Not asked") : undefined}</Row>
                <Row label="Tips by email">{lead.opted_out_at ? `Unsubscribed ${day(lead.opted_out_at.slice(0, 10))}` : lead.email_consent ? "Yes" : "No"}</Row>
                <Row label="Follow-ups sent">{lead.followup_step ? `${lead.followup_step} (stop by moving out of New lead)` : undefined}</Row>
                <Row label="Score">{lead.lead_score ? `${lead.lead_score}: ${lead.lead_score_reasons}` : undefined}</Row>
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

          <section className={card} aria-labelledby="from-the-call">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="from-the-call" className="display-3">From the call</h2>
              <span className="flex flex-wrap gap-4 text-sm">
                {script.missing.length > 0 && <Link href={`/admin/leads/${lead.id}/script#ask`} className="text-accent">Ask what&apos;s missing by email or text →</Link>}
                <Link href={`/admin/leads/${lead.id}/script`} className="text-accent">
                  {lead.intake ? "Open call script" : "Start call script"} →
                </Link>
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {script.answered} of {script.total} must-have answers.
              {script.missing.length > 0 && ` Still to ask: ${script.missing.map((f) => f.label.toLowerCase()).join(", ")}.`}
            </p>
            {callAnswers.length > 0 && (
              <dl className="mt-3 grid gap-x-10 text-sm md:grid-cols-2">
                {callAnswers.map((f) => (
                  <Row key={f.id} label={f.label}>{showValue(f, lead.intake!.answers[f.id])}</Row>
                ))}
              </dl>
            )}
            {callAnswers.length > 0 && (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-muted">Copy as text</summary>
                <pre className="mt-2 rounded-lg bg-surface-2 p-3 text-xs whitespace-pre-wrap">{intakeText(lead.intake!.answers)}</pre>
              </details>
            )}
          </section>

          <LeadOutreach alert={alert} />
          <LeadJourney alert={alert} />
          {lead.visitor_id ? <AfterEnquiry events={afterEvents} since={lead.created_at} /> : null}

          {(lines.length > 0 || assigned) && (
            <section className={card} aria-labelledby="who-to-contact">
              <h2 id="who-to-contact" className="font-heading font-semibold text-2xl">Who to contact</h2>
              <p className="mt-1 text-sm text-muted">
                {lines.length > 0
                  ? "Each rental company that supplies items on this list, with its order. Call, email the order, or copy it into their website form."
                  : "The rental partner this lead is assigned to."}
              </p>
              <div className="mt-5 space-y-6">
                {groups.map((g) => (
                  <div key={g.vendor.id} className="rounded-xl border border-line p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-heading font-semibold text-xl">
                        {g.vendor.name}
                        {lead.assigned_vendor === g.vendor.id && <span className="ml-2 align-middle text-xs font-sans text-accent">Assigned</span>}
                      </h3>
                      {g.lines.length > 0 && <span className="text-sm text-muted tabular-nums">our cost {usd(g.cost)} · customer {usd(g.value)}</span>}
                    </div>
                    {g.lines.length > 0 && (
                      <ul className="mt-2 text-sm">
                        {g.lines.map((l) => (
                          <li key={l.id + (l.variant ?? "")} className="flex justify-between gap-3 border-b border-line py-1 last:border-0">
                            <span>{l.qty.toLocaleString()} × {l.name}</span>
                            <span className="text-muted tabular-nums">{usd(l.vendor_price)} ea</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3">
                      <VendorContact
                        vendor={g.vendor}
                        partner={partners.get(g.vendor.id)}
                        order={vendorOrder(lead, g.lines)}
                        subject={`Availability for ${day(lead.event_date)}${lead.city ? ` in ${lead.city}` : ""}`}
                        compact
                      />
                    </div>
                    {g.backups.length > 0 && (
                      <p className="mt-3 text-xs text-muted">
                        Backup if they&apos;re booked:{" "}
                        {g.backups.map((b, i) => (
                          <span key={b.id}>
                            {i > 0 && ", "}
                            <Link href={`/admin/vendors#${b.id}`} className="text-accent">{b.name}</Link>
                            {b.phone && <> (<a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="text-accent">{b.phone}</a>)</>}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}


          {lines.length > 0 && (
            <section className={`${card} overflow-x-auto`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="display-3">Quote</h2>
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

          <section className={card}>
            <h2 className="display-3">Timeline</h2>
            <p className="mt-1 text-sm text-muted">Status changes, emails sent, calls and notes, newest first.</p>
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
          <section className={card} aria-labelledby="proposal">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="proposal" className="font-heading font-semibold text-2xl">Customer proposal</h2>
              <Link href={`/admin/leads/${lead.id}/quote`} className="text-sm text-accent">Edit quote</Link>
            </div>
            <p className="mt-1 text-sm text-muted">
              The customer link names the rental partner and shares its contact once the {chargeLabel().toLowerCase()} is paid.
              {stripeEnabled() ? " Stripe Checkout is on." : " Stripe is off (no STRIPE_SECRET_KEY), so send a payment link yourself and mark it paid here."}
            </p>
            {lead.proposal_token ? (
              <div className="mt-4 space-y-3 text-sm">
                <p className="break-all rounded-lg bg-gold-soft/40 p-3 font-mono text-xs">{`${site.url}/proposal/${lead.proposal_token}`}</p>
                {lead.email && lead.fee_status !== "paid" && (() => {
                  const m = proposalEmail(lead, `${site.url}/proposal/${lead.proposal_token}`, process.env.OWNER_NAME || "Angad");
                  return (
                    <a href={`mailto:${lead.email}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`} className="btn-primary btn-sm">
                      Email the quote to {first === "there" ? "them" : first}
                    </a>
                  );
                })()}
                <p>
                  Fee: <strong>{lead.fee_status === "paid" ? "Paid" : lead.fee_status === "refunded" ? "Refunded" : "Not paid"}</strong>
                  {" · "}{usd(lead.fee_amount ?? amountDue(lead))}
                  {lead.fee_paid_at ? ` · ${new Date(lead.fee_paid_at).toLocaleDateString("en-US", { timeZone: "America/Chicago" })}` : ""}
                </p>
                {!lead.assigned_vendor && <p className="text-muted">Assign a rental partner below so the customer sees it after paying.</p>}
                <div className="flex flex-wrap gap-2">
                  <a href={`/proposal/${lead.proposal_token}`} target="_blank" rel="noopener" className="btn-ghost">Preview</a>
                  {lead.fee_status === "paid" ? (
                    <form action={setFeeStatus}>
                      <input type="hidden" name="id" value={lead.id} />
                      <input type="hidden" name="fee_status" value="refunded" />
                      <button className="btn-ghost">Mark refunded</button>
                    </form>
                  ) : (
                    <form action={setFeeStatus}>
                      <input type="hidden" name="id" value={lead.id} />
                      <input type="hidden" name="fee_status" value="paid" />
                      <button className="btn-ghost">Mark paid</button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <form action={createProposal} className="mt-4">
                <input type="hidden" name="id" value={lead.id} />
                <button className="btn-primary w-full">Create proposal link</button>
              </form>
            )}
          </section>

          <form action={saveLead} className={`${card} space-y-4`}>
            <h2 className="display-3">Update lead</h2>
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
            <h2 className="display-3">Where they came from</h2>
            <div className="mt-3"><LeadSource alert={alert} /></div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-muted">All tracking fields</summary>
              <dl className="mt-2">
                <Row label="Form">{lead.source}</Row>
                <Row label="Email set">{lead.sequence}</Row>
                {trackingFields.map((f) => (
                  <Row key={f} label={f.replace(/_/g, " ")}>{lead[f]}</Row>
                ))}
              </dl>
            </details>
          </section>
        </aside>
      </div>
    </div>
  );
}
