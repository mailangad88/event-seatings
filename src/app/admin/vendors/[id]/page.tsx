import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { catalogItems } from "@/data/catalog";
import { getVendor } from "@/data/vendors";
import { AdminHeader, Empty, Panel, StagePill, Table, Tile } from "@/components/admin/AdminUi";
import { PartnerBadge, VendorContact } from "@/components/admin/VendorContact";
import { OfficeTabs, pickTab } from "@/components/office/OfficeTabs";
import { chicagoDay, money0, prettyDay } from "@/lib/admin-view";
import { usd } from "@/lib/catalog-types";
import { COMMISSION_RATE, FREE_ORDERS } from "@/lib/commissions";
import { isPartConfirmed, partStateBadge, partStateLabel, vendorParts } from "@/lib/orders";
import { listLeads, listPartners, partnerStatuses } from "@/lib/store";
import { saveVendorPartner } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vendor", robots: { index: false } };

// One rental partner, split into tabs: who they are, their part of each order, what we list from them, and notes.
// The same layout is meant for a future vendor portal (their own orders and items).
const tabs = ["overview", "orders", "items", "notes"] as const;

export default async function VendorPage(props: PageProps<"/admin/vendors/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const tab = pickTab(sp.tab, tabs);
  const v = getVendor(id);
  if (!v) notFound();
  const [leads, partners] = await Promise.all([listLeads(), listPartners()]);
  const p = partners.find((x) => x.vendor_id === id);
  const today = chicagoDay();

  // Their part of every order (an order can be split across several rental partners).
  const parts = leads
    .filter((l) => l.kind !== "partner" && l.status !== "lost")
    .flatMap((l) => vendorParts(l).filter((x) => x.vendorId === id).map((part) => ({ l, part })))
    .sort((a, b) => (a.l.event_date ?? "9999").localeCompare(b.l.event_date ?? "9999"));
  const upcoming = parts.filter((x) => (x.l.event_date ?? "9999") >= today);
  const past = parts.filter((x) => x.l.event_date && x.l.event_date < today).reverse();
  const waiting = upcoming.filter((x) => (x.l.fee_status === "paid" || ["booked", "vendor_confirmed"].includes(x.l.status ?? "")) && !isPartConfirmed(x.part.state));
  const items = catalogItems.filter((i) => i.vendorId === id);
  const byCat = new Map<string, number>();
  for (const i of items) byCat.set(i.category, (byCat.get(i.category) ?? 0) + 1);
  const value = parts.reduce((s, x) => s + x.part.subtotal, 0);

  const orderRows = (rows: typeof parts) =>
    rows.map(({ l, part }) => (
      <tr key={`${l.id}-${part.vendorId}`}>
        <td className="whitespace-nowrap">{l.event_date ? prettyDay(l.event_date) : <span className="text-muted">No date</span>}</td>
        <td>
          <Link href={`/admin/orders/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link>
          <div className="text-xs text-muted">{[l.event_type, l.city].filter(Boolean).join(" · ")}</div>
        </td>
        <td>{part.lines.length} item{part.lines.length === 1 ? "" : "s"}</td>
        <td className="text-right tabular-nums">{money0(part.cost)}</td>
        <td><StagePill status={l.status} /></td>
        <td><span className={partStateBadge[part.state]}>{partStateLabel[part.state]}</span></td>
      </tr>
    ));

  return (
    <div className="container-x space-y-6 py-8">
      <div className="text-sm"><Link href="/admin/vendors" className="text-accent">← All vendors</Link></div>
      <AdminHeader group="Rental partner" title={v.name} intro={[v.city, v.website?.replace(/^https?:\/\/(www\.)?/, "")].filter(Boolean).join(" · ")} actions={<PartnerBadge status={p?.status} />} />

      <OfficeTabs
        base={`/admin/vendors/${id}`}
        current={tab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "orders", label: "Orders", count: waiting.length || upcoming.length, tone: waiting.length ? "rose" : undefined },
          { id: "items", label: "Items", count: items.length },
          { id: "notes", label: "Notes and status", count: p?.activity?.length },
        ]}
      />

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tile tone="blue" label="Upcoming orders" value={upcoming.length} href={`/admin/vendors/${id}?tab=orders`} />
            <Tile tone="rose" label="Not confirmed yet" value={waiting.length} alert={waiting.length > 0} href={`/admin/vendors/${id}?tab=orders`} />
            <Tile tone="wine" label="Quote value sent" value={money0(value)} note={`${parts.length} orders all time`} />
            <Tile tone="gold" label="Items we list" value={items.length.toLocaleString()} href={`/admin/vendors/${id}?tab=items`} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="How to reach them">
              <VendorContact vendor={v} partner={p} />
            </Panel>
            <Panel title="Deal">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-muted">Status</dt><dd><PartnerBadge status={p?.status} /></dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Terms</dt><dd className="text-right">{p?.referral_terms || `First ${FREE_ORDERS} booked orders free, then ${Math.round(COMMISSION_RATE * 1000) / 10}% of booked rentals`}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Last contacted</dt><dd>{p?.last_contacted_at ? prettyDay(p.last_contacted_at) : "Never"}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Carries</dt><dd className="text-right">{v.categories.map((c) => c.replace(/-/g, " ")).join(", ") || "–"}</dd></div>
              </dl>
              <p className="mt-4 text-sm"><Link href="/admin/invoices" className="text-accent">Commission statements →</Link></p>
            </Panel>
          </div>
        </>
      )}

      {tab === "orders" && (
        <>
          <Panel title="Coming up">
            {upcoming.length === 0 ? <Empty>No upcoming orders with this rental partner.</Empty> : <Table head={["Event", "Customer", "Their part", "Their price", "Stage", "Confirmation"]} right={[3]}>{orderRows(upcoming)}</Table>}
          </Panel>
          <Panel title="Past orders">
            {past.length === 0 ? <Empty>No past orders yet.</Empty> : <Table head={["Event", "Customer", "Their part", "Their price", "Stage", "Confirmation"]} right={[3]}>{orderRows(past.slice(0, 50))}</Table>}
          </Panel>
        </>
      )}

      {tab === "items" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="By category">
            <ul className="space-y-1.5 text-sm">
              {[...byCat].sort((a, b) => b[1] - a[1]).map(([c, n]) => (
                <li key={c} className="flex justify-between"><span>{c.replace(/-/g, " ")}</span><span className="tabular-nums text-muted">{n}</span></li>
              ))}
            </ul>
          </Panel>
          <Panel title="Items and prices" className="lg:col-span-2" more={{ href: `/admin/pricing?vendor=${id}`, label: "Pricing" }}>
            {items.length === 0 ? (
              <Empty>No catalog items priced from this rental partner yet.</Empty>
            ) : (
              <Table head={["Item", "Their price", "Checked"]} right={[1]} min={420}>
                {items.slice(0, 60).map((i) => (
                  <tr key={i.id}>
                    <td>{i.name}</td>
                    <td className="text-right tabular-nums">{usd(i.vendorPrice)}</td>
                    <td className="text-muted">{i.priceCheckedAt ? prettyDay(i.priceCheckedAt) : i.priceSource}</td>
                  </tr>
                ))}
              </Table>
            )}
            {items.length > 60 && <p className="mt-3 text-xs text-muted">Showing 60 of {items.length}. See all on Pricing.</p>}
          </Panel>
        </div>
      )}

      {tab === "notes" && (
        <div className="grid gap-6 lg:grid-cols-5">
          <Panel title="Update status, contact and notes" className="lg:col-span-3">
            <form action={saveVendorPartner} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="vendor_id" value={v.id} />
              <div>
                <label className="label" htmlFor="status">Deal status</label>
                <select id="status" name="status" defaultValue={p?.status ?? "not_contacted"} className="field">
                  {partnerStatuses.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="last">Last contacted</label>
                <input id="last" type="date" name="last_contacted_at" defaultValue={p?.last_contacted_at ?? ""} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="cname">Contact name</label>
                <input id="cname" name="contact_name" defaultValue={p?.contact_name ?? ""} className="field" placeholder="Who to ask for" />
              </div>
              <div>
                <label className="label" htmlFor="role">Role</label>
                <input id="role" name="contact_role" defaultValue={p?.contact_role ?? ""} className="field" placeholder="Sales manager, owner…" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Direct phone</label>
                <input id="phone" name="contact_phone" type="tel" defaultValue={p?.contact_phone ?? ""} className="field" placeholder={v.phone} />
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="contact_email" type="email" defaultValue={p?.contact_email ?? ""} className="field" placeholder={v.email ?? "orders@…"} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="terms">Deal terms</label>
                <input id="terms" name="referral_terms" defaultValue={p?.referral_terms ?? ""} className="field" placeholder="e.g. free 90 days, then 5% of booked rentals" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes" rows={3} defaultValue={p?.notes ?? ""} className="field resize-y" />
              </div>
              <div className="grid gap-3 sm:col-span-2 sm:grid-cols-4">
                <select name="note_type" aria-label="Log type" className="field" defaultValue="call">
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="note">Note</option>
                </select>
                <input name="note" aria-label="Log entry" className="field sm:col-span-3" placeholder="Spoke to Maria, sending the partner agreement…" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary btn-sm">Save</button>
              </div>
            </form>
          </Panel>
          <Panel title="History" className="lg:col-span-2">
            {p?.activity?.length ? (
              <ol className="space-y-2 text-sm">
                {[...p.activity].reverse().slice(0, 30).map((a, i) => (
                  <li key={i} className="border-b border-line pb-2 last:border-0">
                    <span className="text-xs text-muted">{new Date(a.at).toLocaleDateString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric" })} · {a.type}</span>
                    <p>{a.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty>No calls or notes logged yet.</Empty>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
