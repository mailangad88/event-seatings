import type { Metadata } from "next";
import Link from "@/components/Link";
import { catalogItems } from "@/data/catalog";
import { vendors } from "@/data/vendors";
import { AdminHeader, Tile } from "@/components/admin/AdminUi";
import { PartnerBadge } from "@/components/admin/VendorContact";
import { usd } from "@/lib/catalog-types";
import { listLeads, listPartners, partnerStatuses, type PartnerStatus } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vendors", robots: { index: false } };

const card = "office-card min-w-0 p-6";

export default async function VendorsPage(props: PageProps<"/admin/vendors">) {
  const sp = await props.searchParams;
  const filter = typeof sp.status === "string" ? sp.status : "";
  const [partnerRows, leads] = await Promise.all([listPartners(), listLeads()]);
  const partners = new Map(partnerRows.map((p) => [p.vendor_id, p]));
  const statusOf = (id: string): PartnerStatus => partners.get(id)?.status ?? "not_contacted";

  // How much each vendor matters to us: catalog items priced from them, and quotes that include them.
  const stats = new Map<string, { items: number; quotes: number; value: number; cost: number; assigned: number }>();
  const stat = (id: string) => {
    const s = stats.get(id) ?? { items: 0, quotes: 0, value: 0, cost: 0, assigned: 0 };
    stats.set(id, s);
    return s;
  };
  for (const i of catalogItems) stat(i.vendorId).items += 1;
  for (const l of leads) {
    if (l.assigned_vendor) stat(l.assigned_vendor).assigned += 1;
    const seen = new Set<string>();
    for (const line of l.items ?? []) {
      const s = stat(line.vendor_id);
      if (!seen.has(line.vendor_id)) s.quotes += 1;
      seen.add(line.vendor_id);
      s.value += line.line_total;
      s.cost += line.vendor_price * line.qty;
    }
  }

  const rows = vendors
    .map((v) => ({ v, p: partners.get(v.id), s: stat(v.id) }))
    .filter((r) => !filter || statusOf(r.v.id) === filter)
    .sort((a, b) => b.s.value - a.s.value || b.s.items - a.s.items || a.v.name.localeCompare(b.v.name));

  return (
    <div className="container-x py-8">
      <AdminHeader
        group="Rental partners"
        title="Vendors"
        intro="Every Chicago-area rental company in the catalog, who to call, and where each deal stands. Sorted by the quote value our leads have sent their way. Open a vendor for their orders, items and notes."
        actions={<Link href="/admin/orders" className="btn-ghost btn-sm">Orders by vendor</Link>}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="green" label="Deal signed" value={vendors.filter((v) => statusOf(v.id) === "signed").length} href="/admin/vendors?status=signed" />
        <Tile tone="blue" label="In talks" value={vendors.filter((v) => ["talking", "contacted"].includes(statusOf(v.id))).length} href="/admin/vendors?status=talking" />
        <Tile tone="gold" label="Not contacted" value={vendors.filter((v) => statusOf(v.id) === "not_contacted").length} href="/admin/vendors?status=not_contacted" />
        <Tile tone="wine" label="Quote value sent their way" value={usd([...stats.values()].reduce((t, x) => t + x.value, 0), 0)} />
      </div>

      <nav aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/vendors" className={!filter ? "chip-active" : "chip"}>All {vendors.length}</Link>
        {partnerStatuses.map((s) => {
          const n = vendors.filter((v) => statusOf(v.id) === s.id).length;
          return (
            <Link key={s.id} href={`/admin/vendors?status=${s.id}`} className={filter === s.id ? "chip-active" : "chip"}>
              {s.label} {n}
            </Link>
          );
        })}
      </nav>

      <section className={`${card} mt-6 overflow-x-auto`}>
        <h2 className="text-lg font-semibold">All vendors</h2>
        <table className="mt-4 w-full min-w-[820px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-line">
              <th className="py-2 pr-4 font-medium">Vendor</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Ask for</th>
              <th className="py-2 pr-4 font-medium">Phone</th>
              <th className="py-2 pr-4 text-right font-medium">Items</th>
              <th className="py-2 pr-4 text-right font-medium">Quotes</th>
              <th className="py-2 pr-4 text-right font-medium">Quote value</th>
              <th className="py-2 text-right font-medium">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ v, p, s }) => (
              <tr key={v.id} className="border-b border-line last:border-0">
                <td className="py-2 pr-4"><Link href={`/admin/vendors/${v.id}`} className="font-medium text-accent">{v.name}</Link><div className="text-xs text-muted">{v.city}</div></td>
                <td className="py-2 pr-4"><PartnerBadge status={p?.status} /></td>
                <td className="py-2 pr-4">{p?.contact_name ?? <span className="text-muted">–</span>}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{v.phone ? <a href={`tel:${v.phone.replace(/[^\d+]/g, "")}`} className="text-accent">{v.phone}</a> : "–"}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{s.items.toLocaleString()}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{s.quotes}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{s.value ? usd(s.value, 0) : "–"}</td>
                <td className="py-2 text-right tabular-nums">{s.assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
}
