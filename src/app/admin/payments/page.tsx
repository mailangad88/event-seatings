import type { Metadata } from "next";
import Link from "@/components/Link";
import { vendors } from "@/data/vendors";
import { AdminHeader, Empty, FeePill, Panel, Table, Tile } from "@/components/admin/AdminUi";
import { CopyButton } from "@/components/admin/CopyButton";
import { Icon } from "@/components/ui/Icon";
import { ago, chicagoDay, money0, money2, prettyDay } from "@/lib/admin-view";
import { PAYMENT_SCHEDULE } from "@/lib/catalog-types";
import { kindLabel, ledgerKinds, ledgerMethods, ledgerTotals, listLedger, mergeLedger, methodLabel, periods, type LedgerRow, type LedgerTotals } from "@/lib/ledger";
import { chargeLabel, chargeMode, stripeEnabled } from "@/lib/payments";
import { site } from "@/lib/site";
import { listLeads, type Lead } from "@/lib/store";
import { filterLedger, ledgerFilters, type LedgerFilters } from "./filters";
import { recordPayment, refundFee, removeEntry } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payments", robots: { index: false } };

const vendorName = (id?: string) => (id ? vendors.find((v) => v.id === id)?.name ?? id : "");
const monthName = (m: string) => new Date(`${m}-15T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const doneText: Record<string, string> = {
  recorded: "Payment recorded.",
  refunded: "Refund done. The proposal now shows the fee as refunded.",
  removed: "Row removed from the ledger.",
};
const errorText: Record<string, string> = {
  form: "Something in the form was missing or not valid. Check the amount and try again.",
  lead: "That proposal could not be found.",
  commission: "For a commission payment, pick the rental partner and the statement month.",
  table: "The payments table isn't set up in the database yet. Re-run supabase/schema.sql in Supabase, then try again.",
  refund: "That fee isn't marked paid, so there is nothing to refund.",
  nostripe: "This fee wasn't paid through Stripe, so it can only be marked refunded.",
  stripe: "Stripe did not accept the refund. Nothing was changed. The reason is on the lead's timeline.",
};

function paymentEmail(l: Lead) {
  const url = `${site.url}/proposal/${l.proposal_token}`;
  const first = l.name?.split(" ")[0];
  const event = [l.event_type?.toLowerCase(), l.event_date && `on ${prettyDay(l.event_date, { weekday: "long", month: "long", day: "numeric" })}`].filter(Boolean).join(" ");
  const body = [
    `Hi${first ? ` ${first}` : ""},`,
    "",
    `Here is the link to your proposal${event ? ` for your ${event}` : ""}:`,
    url,
    "",
    `You can look over the items and prices there. Your date is held once the ${chargeLabel().toLowerCase()} (${money2(l.fee_amount)}) is paid. If anything needs to change, just reply to this email.`,
    "",
    "Thanks,",
    site.name,
  ].join("\n");
  return { url, mailto: `mailto:${l.email}?subject=${encodeURIComponent(`Your ${site.name} proposal`)}&body=${encodeURIComponent(body)}` };
}

function TotalsNote({ t }: { t: LedgerTotals }) {
  const parts = [t.fees && `${money0(t.fees)} fees`, t.commission && `${money0(t.commission)} commission`, t.other && `${money0(t.other)} other`, t.refunds && `${money0(t.refunds)} refunded`].filter(Boolean);
  return <>{parts.length ? parts.join(" · ") : "Nothing yet"}</>;
}

export default async function PaymentsPage(props: PageProps<"/admin/payments">) {
  const sp = await props.searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const filters: LedgerFilters = ledgerFilters(sp);
  const [recorded, leads] = await Promise.all([listLedger(), listLeads()]);
  const rows = mergeLedger(recorded, leads);
  const leadById = new Map(leads.map((l) => [l.id, l]));
  const p = periods();
  const totals = { thisMonth: ledgerTotals(rows, p.thisMonth.from, p.thisMonth.to), lastMonth: ledgerTotals(rows, p.lastMonth.from, p.lastMonth.to), allTime: ledgerTotals(rows) };
  const shown = filterLedger(rows, filters, leads);
  const shownTotal = ledgerTotals(shown);

  const proposals = leads.filter((l) => l.proposal_token && l.kind !== "partner");
  const waiting = proposals.filter((l) => (l.fee_status ?? "unpaid") === "unpaid").sort((a, b) => (b.proposal_created_at ?? "").localeCompare(a.proposal_created_at ?? ""));
  const waitingTotal = waiting.reduce((s, l) => s + (l.fee_amount ?? 0), 0);
  const refundLead = one("refund") ? leadById.get(one("refund")) : undefined;
  const removeRow = one("remove") ? recorded.find((r) => r.id === one("remove")) : undefined;
  const months = [...new Set(rows.map((r) => chicagoDay(r.created_at).slice(0, 7)))].sort().reverse();
  const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
  const href = (patch: Partial<LedgerFilters>) => {
    const u = new URLSearchParams(Object.entries({ ...filters, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/payments${u.size ? `?${u}` : ""}`;
  };
  const who = (r: LedgerRow) => {
    const l = r.lead_id ? leadById.get(r.lead_id) : undefined;
    if (l) return <Link href={`/admin/leads/${l.id}`} className="text-accent">{l.name || l.email}</Link>;
    if (r.vendor_id) return <>{vendorName(r.vendor_id)}{r.month && <div className="text-xs text-muted">{monthName(r.month)} statement</div>}</>;
    return <span className="text-muted">–</span>;
  };
  const today = chicagoDay();

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Money"
        title="Payments"
        intro={`Every payment in and out: ${chargeLabel().toLowerCase()}s from customers, commission from rental partners, and refunds. The rental company bills the rentals directly, so those aren't here.`}
        actions={
          <>
            <a href={`/admin/payments/export${query.size ? `?${query}` : ""}`} className="btn-ghost btn-sm"><Icon name="download" size={16} /> Download CSV</a>
            <a href="#record" className="btn-primary btn-sm"><Icon name="plus" size={16} /> Record a payment</a>
          </>
        }
      />

      {doneText[one("done")] && <p role="status" className="badge-green mt-6">{doneText[one("done")]}</p>}
      {errorText[one("error")] && <p role="alert" className="badge-rose mt-6">{errorText[one("error")]}</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="green" label="This month" value={money0(totals.thisMonth.net)} note={<TotalsNote t={totals.thisMonth} />} href={href({ period: "this" })} />
        <Tile tone="green" label="Last month" value={money0(totals.lastMonth.net)} note={<TotalsNote t={totals.lastMonth} />} href={href({ period: "last" })} />
        <Tile tone="green" label="All time" value={money0(totals.allTime.net)} note={<TotalsNote t={totals.allTime} />} href={href({ period: "" })} />
        <Tile tone="amber" label="Waiting on payment" value={money0(waitingTotal)} note={`${waiting.length} proposals not paid`} href="#waiting" />
      </div>

      {refundLead && (
        <Panel title="Refund this deposit?" className="mt-8">
          {refundLead.fee_status !== "paid" ? (
            <Empty>This fee isn&apos;t marked paid, so there is nothing to refund. <Link href="/admin/payments" className="text-accent">Back to payments</Link></Empty>
          ) : (
            <div className="space-y-4 text-sm">
              <p>
                <strong>{refundLead.name || refundLead.email}</strong> paid {money2(refundLead.fee_amount)}
                {refundLead.fee_paid_at && <> on {prettyDay(chicagoDay(refundLead.fee_paid_at))} ({ago(refundLead.fee_paid_at)})</>}
                {refundLead.stripe_session_id ? " by card through Stripe." : " outside Stripe."} The proposal will show the fee as refunded. This can&apos;t be undone from here.
              </p>
              <div className="flex flex-wrap items-end gap-3">
                {stripeEnabled() && refundLead.stripe_session_id && (
                  <form action={refundFee}>
                    <input type="hidden" name="id" value={refundLead.id} />
                    <input type="hidden" name="how" value="stripe" />
                    <input type="hidden" name="confirm" value="yes" />
                    <button type="submit" className="btn-primary btn-sm">Yes, refund {money2(refundLead.fee_amount)} to their card</button>
                  </form>
                )}
                <form action={refundFee} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={refundLead.id} />
                  <input type="hidden" name="confirm" value="yes" />
                  <div>
                    <label htmlFor="refund-how" className="label">Paid back by</label>
                    <select id="refund-how" name="how" defaultValue="zelle" className="field min-h-10 py-2">
                      {ledgerMethods.filter((m) => m.id !== "stripe").map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-ghost btn-sm">{stripeEnabled() && refundLead.stripe_session_id ? "Mark refunded only (I paid it back another way)" : "Mark refunded"}</button>
                </form>
                <Link href="/admin/payments" className="btn-ghost btn-sm">Cancel</Link>
              </div>
              {!stripeEnabled() && <p className="text-xs text-muted">Stripe isn&apos;t set up, so this only records the refund. Send the money back yourself.</p>}
            </div>
          )}
        </Panel>
      )}

      {removeRow && (
        <Panel title="Remove this row?" className="mt-8">
          <p className="text-sm">
            {kindLabel(removeRow.kind)} of {money2(removeRow.amount)} by {methodLabel(removeRow.method)} on {prettyDay(chicagoDay(removeRow.created_at))}. This only removes the
            ledger row. It doesn&apos;t change the proposal or the commission statement.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <form action={removeEntry}>
              <input type="hidden" name="id" value={removeRow.id} />
              <input type="hidden" name="confirm" value="yes" />
              <button type="submit" className="btn-primary btn-sm">Yes, remove it</button>
            </form>
            <Link href="/admin/payments" className="btn-ghost btn-sm">Cancel</Link>
          </div>
        </Panel>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Panel title="Ledger">
          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label="Payment type" className="flex flex-wrap gap-2">
              <Link href={href({ kind: "" })} className={!filters.kind ? "chip-active" : "chip"}>Everything</Link>
              {ledgerKinds.map((k) => (
                <Link key={k.id} href={href({ kind: k.id })} className={filters.kind === k.id ? "chip-active" : "chip"}>{k.label}</Link>
              ))}
            </nav>
            <form action="/admin/payments" className="flex flex-wrap gap-2 lg:ml-auto">
              {filters.kind && <input type="hidden" name="kind" value={filters.kind} />}
              <label htmlFor="period" className="sr-only">Period</label>
              <select id="period" name="period" defaultValue={filters.period} className="field min-h-10 py-2">
                <option value="">All time</option>
                <option value="this">This month</option>
                <option value="last">Last month</option>
                {months.map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
              </select>
              <label htmlFor="method" className="sr-only">Paid by</label>
              <select id="method" name="method" defaultValue={filters.method} className="field min-h-10 py-2">
                <option value="">Any way of paying</option>
                {ledgerMethods.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <label htmlFor="q" className="sr-only">Search</label>
              <input id="q" name="q" defaultValue={filters.q} placeholder="Name, partner, note" className="field min-h-10 py-2" />
              <button type="submit" className="btn-ghost btn-sm">Show</button>
            </form>
          </div>

          <p className="mt-4 text-sm text-muted">
            {shown.length} {shown.length === 1 ? "row" : "rows"} · {money2(shownTotal.received)} in{shownTotal.refunds ? ` · ${money2(shownTotal.refunds)} refunded` : ""} · {money2(shownTotal.net)} net
            {shown.length > 200 ? " · showing the newest 200" : ""}
          </p>
          <div className="mt-2">
            {shown.length === 0 ? (
              <Empty>No payments match. Deposits show here once a customer pays, and anything you record by hand shows here too.</Empty>
            ) : (
              <Table head={["Date", "What", "From / to", "Paid by", "Note", "Amount", ""]} right={[5]} min={900}>
                {shown.slice(0, 200).map((r) => {
                  const lead = r.lead_id ? leadById.get(r.lead_id) : undefined;
                  const canRefund = r.kind === "fee" && lead?.fee_status === "paid";
                  return (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap">{prettyDay(chicagoDay(r.created_at))}<div className="text-xs text-muted">{chicagoDay(r.created_at).slice(0, 4)}</div></td>
                      <td className="whitespace-nowrap">{kindLabel(r.kind)}{lead && r.kind === "fee" && <div className="mt-1"><FeePill status={lead.fee_status} /></div>}</td>
                      <td>{who(r)}</td>
                      <td className="whitespace-nowrap text-muted">{methodLabel(r.method)}</td>
                      <td className="text-xs text-muted">{r.note}</td>
                      <td className={`text-right whitespace-nowrap tabular-nums ${r.signed < 0 ? "text-rose" : ""}`}>{r.signed < 0 ? `−${money2(r.amount)}` : money2(r.amount)}</td>
                      <td>
                        <div className="flex flex-wrap justify-end gap-2">
                          {canRefund && <Link href={`/admin/payments?refund=${lead!.id}`} className="btn-ghost btn-sm">Refund</Link>}
                          {r.source === "recorded" && <Link href={`/admin/payments?remove=${r.id}`} className="btn-ghost btn-sm">Remove</Link>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <section id="record" className="card min-w-0 scroll-mt-24 p-6">
            <h2 className="display-3">Record a payment</h2>
            <p className="mt-2 text-sm text-muted">For money that came in outside Stripe: Zelle, check or cash. Don&apos;t write card or bank numbers here.</p>
            <form action={recordPayment} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="rec-kind" className="label">What for</label>
                  <select id="rec-kind" name="kind" defaultValue="fee" className="field">
                    {ledgerKinds.filter((k) => k.id !== "refund").map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="rec-amount" className="label">Amount ($)</label>
                  <input id="rec-amount" name="amount" inputMode="decimal" required placeholder="250.00" className="field" />
                </div>
                <div>
                  <label htmlFor="rec-method" className="label">Paid by</label>
                  <select id="rec-method" name="method" defaultValue="zelle" className="field">
                    {ledgerMethods.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="rec-date" className="label">Date received</label>
                  <input id="rec-date" name="date" type="date" defaultValue={today} max={today} className="field" />
                </div>
              </div>
              <fieldset className="well space-y-3 p-4">
                <legend className="text-xs font-medium text-muted">For a deposit</legend>
                <div>
                  <label htmlFor="rec-lead" className="label">Proposal</label>
                  <select id="rec-lead" name="lead_id" defaultValue="" className="field">
                    <option value="">None</option>
                    {proposals.map((l) => (
                      <option key={l.id} value={l.id}>{l.name || l.email} · {money0(l.fee_amount)} · {l.fee_status === "paid" ? "paid" : l.fee_status === "refunded" ? "refunded" : "not paid"}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name="mark_paid" defaultChecked className="mt-1" />
                  <span>Also mark the fee paid. This shows the rental company&apos;s name on the customer&apos;s proposal.</span>
                </label>
              </fieldset>
              <fieldset className="well space-y-3 p-4">
                <legend className="text-xs font-medium text-muted">For commission</legend>
                <div>
                  <label htmlFor="rec-vendor" className="label">Rental partner</label>
                  <select id="rec-vendor" name="vendor_id" defaultValue="" className="field">
                    <option value="">None</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="rec-month" className="label">Statement month</label>
                  <input id="rec-month" name="month" type="month" className="field" />
                  <p className="hint">The statement is marked paid on the Invoices page too.</p>
                </div>
              </fieldset>
              <div>
                <label htmlFor="rec-note" className="label">Note (optional)</label>
                <input id="rec-note" name="note" maxLength={300} placeholder="Check #1042, Zelle from Maria" className="field" />
              </div>
              <button type="submit" className="btn-primary w-full">Save payment</button>
            </form>
          </section>

          <section id="waiting" className="card min-w-0 scroll-mt-24 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="display-3">Waiting on payment</h2>
              <Link href="/admin/proposals" className="text-sm text-accent">All proposals →</Link>
            </div>
            <div className="mt-4">
              {waiting.length === 0 ? (
                <Empty>Every proposal is paid.</Empty>
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {waiting.slice(0, 12).map((l) => {
                    const { url, mailto } = paymentEmail(l);
                    return (
                      <li key={l.id} className="py-3">
                        <div className="flex justify-between gap-3">
                          <Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link>
                          <span className="tabular-nums">{money2(l.fee_amount)}</span>
                        </div>
                        <p className="text-xs text-muted">
                          {l.event_date ? `Event ${prettyDay(l.event_date)}` : "No date yet"}
                          {l.proposal_created_at && ` · sent ${ago(l.proposal_created_at)}`}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <CopyButton text={url} label="Copy link" />
                          <a href={mailto} className="btn-ghost btn-sm"><Icon name="mail" size={16} /> Email draft</a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {waiting.length > 12 && <p className="mt-2 text-xs text-muted">And {waiting.length - 12} more on the Proposals page.</p>}
            </div>
          </section>

          <Panel title="Card payments">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Stripe</dt><dd>{stripeEnabled() ? "On" : "Off"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Payment alerts from Stripe</dt><dd>{process.env.STRIPE_WEBHOOK_SECRET ? "On" : "Off"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">What we charge</dt><dd className="text-right">{chargeMode() === "hold"
                ? "Fixed refundable hold"
                : `${Math.round(PAYMENT_SCHEDULE.firstShare * 100)}% deposit on rentals (min $${PAYMENT_SCHEDULE.min}), then stages (${PAYMENT_SCHEDULE.lateFirstShare * 100}% if booked within ${PAYMENT_SCHEDULE.secondDueDaysBefore} days)`}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-muted">
              {stripeEnabled()
                ? "Refund sends a card payment back through Stripe. You confirm it first."
                : "Without Stripe, customers see \"we'll send you a payment link\". Record the payment here when they pay, and refunds are marked by hand."}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
