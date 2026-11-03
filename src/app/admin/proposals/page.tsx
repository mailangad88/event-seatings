import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Empty, FeePill, StagePill, Table, Tile } from "@/components/admin/AdminUi";
import { ago, eventLine, isClosed, money0, money2, prettyDay } from "@/lib/admin-view";
import { amountDue, chargeLabel, stripeEnabled } from "@/lib/payments";
import { listLeads, type Lead } from "@/lib/store";
import { createProposal, setFeeStatus } from "../leads/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Proposals", robots: { index: false } };

const tabs = [
  { id: "waiting", label: "Waiting on payment" },
  { id: "ready", label: "Ready for a proposal" },
  { id: "paid", label: "Paid" },
  { id: "refunded", label: "Refunded" },
] as const;

export default async function ProposalsPage(props: PageProps<"/admin/proposals">) {
  const sp = await props.searchParams;
  const tab = tabs.find((t) => t.id === sp.tab)?.id ?? "waiting";
  const leads = (await listLeads()).filter((l) => l.kind !== "partner");

  const withProposal = leads.filter((l) => l.proposal_token);
  const groups: Record<(typeof tabs)[number]["id"], Lead[]> = {
    waiting: withProposal.filter((l) => (l.fee_status ?? "unpaid") === "unpaid"),
    paid: withProposal.filter((l) => l.fee_status === "paid").sort((a, b) => (b.fee_paid_at ?? "").localeCompare(a.fee_paid_at ?? "")),
    refunded: withProposal.filter((l) => l.fee_status === "refunded"),
    // Priced quotes that are still open and have no proposal link yet.
    ready: leads.filter((l) => !l.proposal_token && (l.quote_subtotal ?? 0) > 0 && !isClosed(l)).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  };
  const rows = groups[tab];
  const sum = (ls: Lead[]) => ls.reduce((s, l) => s + (l.fee_amount ?? 0), 0);

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Sell"
        title="Proposals"
        intro={
          <>
            A proposal is the customer&apos;s quote page. It hides the rental partner&apos;s name until the {chargeLabel().toLowerCase()} is
            paid. {stripeEnabled() ? "Customers pay by card through Stripe." : "Card payments are off until Stripe is set up, so mark fees paid here when they pay another way."}
          </>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="amber" label="Waiting on payment" value={money0(sum(groups.waiting))} note={`${groups.waiting.length} proposals`} href="/admin/proposals" />
        <Tile tone="gold" label="Ready for a proposal" value={groups.ready.length} note="Priced quotes with no proposal yet" href="/admin/proposals?tab=ready" />
        <Tile tone="green" label="Fees paid" value={money0(sum(groups.paid))} note={`${groups.paid.length} paid`} href="/admin/proposals?tab=paid" />
        <Tile tone="rose" label="Refunded" value={money0(sum(groups.refunded))} note={`${groups.refunded.length} refunded`} href="/admin/proposals?tab=refunded" />
      </div>

      <nav aria-label="Proposal status" className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link key={t.id} href={t.id === "waiting" ? "/admin/proposals" : `/admin/proposals?tab=${t.id}`} className={t.id === tab ? "chip-active" : "chip"} aria-current={t.id === tab ? "page" : undefined}>
            {t.label} ({groups[t.id].length})
          </Link>
        ))}
      </nav>

      <section className="card mt-4 p-6">
        {rows.length === 0 ? (
          <Empty>Nothing here right now.</Empty>
        ) : tab === "ready" ? (
          <Table head={["Customer", "Event", "Quote", "Fee to charge", "Stage", ""]} right={[2, 3]} min={820}>
            {rows.map((l) => (
              <tr key={l.id}>
                <td><Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link><div className="text-xs text-muted">asked {ago(l.created_at)}</div></td>
                <td>{prettyDay(l.event_date) || "No date yet"}<div className="text-xs text-muted">{eventLine(l)}</div></td>
                <td className="text-right tabular-nums">{money0(l.quote_subtotal)}</td>
                <td className="text-right tabular-nums">{money2(amountDue(l))}</td>
                <td><StagePill status={l.status} /></td>
                <td className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link href={`/admin/leads/${l.id}/quote`} className="btn-ghost btn-sm">Edit quote</Link>
                    <form action={createProposal}>
                      <input type="hidden" name="id" value={l.id} />
                      <button type="submit" className="btn-ghost btn-sm">Create proposal</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <Table head={["Customer", "Event", "Quote", "Fee", "Status", tab === "paid" ? "Paid" : "Sent", ""]} right={[2, 3]} min={900}>
            {rows.map((l) => (
              <tr key={l.id}>
                <td><Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link><div className="text-xs text-muted">{l.email}</div></td>
                <td>{prettyDay(l.event_date) || "No date yet"}<div className="text-xs text-muted">{eventLine(l)}</div></td>
                <td className="text-right tabular-nums">{money0(l.quote_subtotal)}</td>
                <td className="text-right tabular-nums">{money2(l.fee_amount)}</td>
                <td><FeePill status={l.fee_status} /><div className="mt-1 text-xs text-muted">{l.stripe_session_id ? "Card (Stripe)" : l.fee_status === "paid" ? "Marked by hand" : ""}</div></td>
                <td className="whitespace-nowrap text-muted">{tab === "paid" ? prettyDay(l.fee_paid_at) : ago(l.proposal_created_at)}</td>
                <td>
                  <div className="flex flex-wrap justify-end gap-2">
                    <a href={`/proposal/${l.proposal_token}`} target="_blank" rel="noopener" className="btn-ghost btn-sm">View</a>
                    {tab === "waiting" && <Link href={`/admin/leads/${l.id}/quote`} className="btn-ghost btn-sm">Edit quote</Link>}
                    {tab === "paid" && <Link href={`/admin/invoices/receipt/${l.id}`} className="btn-ghost btn-sm">Receipt</Link>}
                    {tab === "waiting" && (
                      <form action={setFeeStatus}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="fee_status" value="paid" />
                        <button type="submit" className="btn-ghost btn-sm" title="Use when they paid by check, Zelle or bank transfer">Mark paid</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </section>
      <p className="mt-3 text-xs text-muted">Refunds: open the lead and change the fee status there, after you refund in Stripe.</p>
    </div>
  );
}
