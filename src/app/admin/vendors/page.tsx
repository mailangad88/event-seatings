import type { Metadata } from "next";
import Link from "next/link";
import { catalogItems } from "@/data/catalog";
import { vendors } from "@/data/vendors";
import { PartnerBadge, VendorContact } from "@/components/admin/VendorContact";
import { usd } from "@/lib/catalog-types";
import { listLeads, listPartners, partnerStatuses, type PartnerStatus } from "@/lib/store";
import { saveVendorPartner } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vendors", robots: { index: false } };

const card = "card min-w-0 p-6";

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
    <div className="container-x py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 font-serif text-5xl">Rental partners</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Every Chicago-area rental company in the catalog, who to call, and where each referral deal stands. Sorted by
            the quote value our leads have sent their way.
          </p>
        </div>
      </div>

      <nav aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/vendors" className={!filter ? "chip chip-active" : "chip"}>All {vendors.length}</Link>
        {partnerStatuses.map((s) => {
          const n = vendors.filter((v) => statusOf(v.id) === s.id).length;
          return (
            <Link key={s.id} href={`/admin/vendors?status=${s.id}`} className={filter === s.id ? "chip chip-active" : "chip"}>
              {s.label} {n}
            </Link>
          );
        })}
      </nav>

      <section className={`${card} mt-6 overflow-x-auto`}>
        <h2 className="font-serif text-2xl">At a glance</h2>
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
                <td className="py-2 pr-4"><a href={`#${v.id}`} className="font-medium text-accent">{v.name}</a><div className="text-xs text-muted">{v.city}</div></td>
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {rows.map(({ v, p, s }) => (
          <section key={v.id} id={v.id} className={`${card} scroll-mt-24`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-2xl">{v.name}</h2>
              <span className="text-xs text-muted tabular-nums">
                {s.items.toLocaleString()} items · {s.quotes} quotes{s.value ? ` · ${usd(s.value, 0)}` : ""}
              </span>
            </div>
            <div className="mt-3">
              <VendorContact vendor={v} partner={p} />
            </div>
            {v.categories?.length ? (
              <p className="mt-3 text-xs text-muted">Carries: {v.categories.map((c) => c.replace(/-/g, " ")).join(", ")}</p>
            ) : null}

            <details className="mt-4 rounded-xl border border-line p-4">
              <summary className="cursor-pointer text-sm font-medium">Update status, contact and notes</summary>
              <form action={saveVendorPartner} className="mt-4 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="vendor_id" value={v.id} />
                <div>
                  <label className="label" htmlFor={`${v.id}-status`}>Referral status</label>
                  <select id={`${v.id}-status`} name="status" defaultValue={p?.status ?? "not_contacted"} className="field">
                    {partnerStatuses.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor={`${v.id}-last`}>Last contacted</label>
                  <input id={`${v.id}-last`} type="date" name="last_contacted_at" defaultValue={p?.last_contacted_at ?? ""} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor={`${v.id}-name`}>Contact name</label>
                  <input id={`${v.id}-name`} name="contact_name" defaultValue={p?.contact_name ?? ""} className="field" placeholder="Who to ask for" />
                </div>
                <div>
                  <label className="label" htmlFor={`${v.id}-role`}>Role</label>
                  <input id={`${v.id}-role`} name="contact_role" defaultValue={p?.contact_role ?? ""} className="field" placeholder="Sales manager, owner…" />
                </div>
                <div>
                  <label className="label" htmlFor={`${v.id}-phone`}>Direct phone</label>
                  <input id={`${v.id}-phone`} name="contact_phone" type="tel" defaultValue={p?.contact_phone ?? ""} className="field" placeholder={v.phone} />
                </div>
                <div>
                  <label className="label" htmlFor={`${v.id}-email`}>Email</label>
                  <input id={`${v.id}-email`} name="contact_email" type="email" defaultValue={p?.contact_email ?? ""} className="field" placeholder={v.email ?? "orders@…"} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor={`${v.id}-terms`}>Referral terms</label>
                  <input id={`${v.id}-terms`} name="referral_terms" defaultValue={p?.referral_terms ?? ""} className="field" placeholder="e.g. 10% of rental subtotal, paid monthly" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor={`${v.id}-notes`}>Notes</label>
                  <textarea id={`${v.id}-notes`} name="notes" rows={2} defaultValue={p?.notes ?? ""} className="field resize-y" />
                </div>
                <div className="sm:col-span-2 grid gap-3 sm:grid-cols-[9rem_1fr]">
                  <select name="note_type" aria-label="Log type" className="field" defaultValue="call">
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="note">Note</option>
                  </select>
                  <input name="note" aria-label="Log entry" className="field" placeholder="Spoke to Maria, sending referral agreement…" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary btn-sm">Save</button>
                </div>
              </form>
              {p?.activity?.length ? (
                <ol className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs">
                  {[...p.activity].reverse().slice(0, 10).map((a, i) => (
                    <li key={i} className="grid grid-cols-[7rem_1fr] gap-2">
                      <span className="text-muted">{new Date(a.at).toLocaleDateString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric" })}</span>
                      <span>{a.text}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </details>
          </section>
        ))}
      </div>
    </div>
  );
}
