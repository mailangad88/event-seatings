import type { Metadata } from "next";
import Link from "next/link";
import { catalogItems } from "@/data/catalog";
import { vendors } from "@/data/vendors";
import { AdminHeader, Empty, Table, Tile } from "@/components/admin/AdminUi";
import { addDays, chicagoDay, money2, prettyDay } from "@/lib/admin-view";
import { customerPrice, MARKUP } from "@/lib/catalog-types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pricing", robots: { index: false } };

const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? id;
const filters = [
  { id: "", label: "All items" },
  { id: "estimated", label: "Estimated prices" },
  { id: "stale", label: "Not checked in 90 days" },
  { id: "cheaper", label: "Cheaper elsewhere" },
] as const;

export default async function PricingPage(props: PageProps<"/admin/pricing">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const f = typeof sp.f === "string" ? sp.f : "";
  const vendor = typeof sp.vendor === "string" ? sp.vendor : "";
  const staleBefore = addDays(chicagoDay(), -90);

  const rows = catalogItems.map((i) => {
    const cheapest = (i.altOffers ?? []).filter((o) => o.vendorPrice > 0 && o.vendorPrice < i.vendorPrice).sort((a, b) => a.vendorPrice - b.vendorPrice)[0];
    return { i, cheapest, stale: !i.priceCheckedAt || i.priceCheckedAt < staleBefore, estimated: i.priceSource === "estimated" };
  });
  const shown = rows.filter(
    (r) =>
      (!q || `${r.i.name} ${r.i.category} ${r.i.id}`.toLowerCase().includes(q)) &&
      (!vendor || r.i.vendorId === vendor) &&
      (f !== "estimated" || r.estimated) &&
      (f !== "stale" || r.stale) &&
      (f !== "cheaper" || !!r.cheapest),
  );
  const href = (p: Record<string, string>) => {
    const u = new URLSearchParams({ ...(q && { q }), ...(f && { f }), ...(vendor && { vendor }), ...p });
    for (const [k, v] of [...u]) if (!v) u.delete(k);
    return `/admin/pricing${u.size ? `?${u}` : ""}`;
  };

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Sell"
        title="Pricing"
        intro={
          <>
            Every catalog item with the rental company&apos;s price and what customers see (their price plus our {Math.round(MARKUP * 100)}%). To change
            the price on one order, use Edit quote on the lead. Catalog prices across the site change with the next site update, so send Claude the
            new prices.
          </>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Items" value={rows.length.toLocaleString()} href="/admin/pricing" />
        <Tile label="Estimated prices" value={rows.filter((r) => r.estimated).length.toLocaleString()} note="No public price from the vendor" href={href({ f: "estimated" })} />
        <Tile label="Not checked in 90 days" value={rows.filter((r) => r.stale).length.toLocaleString()} href={href({ f: "stale" })} />
        <Tile label="Cheaper elsewhere" value={rows.filter((r) => r.cheapest).length.toLocaleString()} note="Another vendor lists it for less" href={href({ f: "cheaper" })} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <nav aria-label="Filter items" className="flex flex-wrap gap-2">
          {filters.map((x) => (
            <Link key={x.id} href={href({ f: x.id })} className={x.id === f ? "chip-active" : "chip"}>{x.label}</Link>
          ))}
        </nav>
        <form action="/admin/pricing" className="ml-auto flex flex-wrap gap-2">
          {f && <input type="hidden" name="f" value={f} />}
          <label htmlFor="vendor" className="sr-only">Rental company</label>
          <select id="vendor" name="vendor" defaultValue={vendor} className="field min-h-10 py-2">
            <option value="">All rental companies</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <label htmlFor="q" className="sr-only">Search items</label>
          <input id="q" name="q" defaultValue={q} placeholder="Chair, linen, tent…" className="field min-h-10 py-2" />
          <button type="submit" className="btn-ghost btn-sm">Search</button>
        </form>
      </div>

      <section className="card mt-4 p-6">
        <p className="mb-3 text-sm text-muted">{shown.length.toLocaleString()} items{shown.length > 300 ? ", showing the first 300" : ""}</p>
        {shown.length === 0 ? (
          <Empty>No items match.</Empty>
        ) : (
          <Table head={["Item", "Rental company", "Their price", "Customer price", "Our fee", "Price from", "Cheaper offer"]} right={[2, 3, 4]} min={1000}>
            {shown.slice(0, 300).map(({ i, cheapest, stale, estimated }) => (
              <tr key={i.id}>
                <td>{i.name}<div className="text-xs text-muted">{i.category} · {i.unit}</div></td>
                <td>{vendorName(i.vendorId)}</td>
                <td className="text-right tabular-nums">{money2(i.vendorPrice)}</td>
                <td className="text-right tabular-nums">{money2(customerPrice(i))}</td>
                <td className="text-right tabular-nums">{money2(customerPrice(i) - i.vendorPrice)}</td>
                <td className="text-xs">
                  <span className={estimated ? "text-rose" : ""}>{estimated ? "Estimate" : "Their price list"}</span>
                  <div className={stale ? "text-rose" : "text-muted"}>{i.priceCheckedAt ? `checked ${prettyDay(i.priceCheckedAt, { month: "short", day: "numeric", year: "numeric" })}` : "never checked"}</div>
                  {i.sourceUrl && <a href={i.sourceUrl} target="_blank" rel="noopener" className="text-accent">source</a>}
                </td>
                <td className="text-xs">{cheapest ? <>{vendorName(cheapest.vendorId)}<div className="tabular-nums">{money2(cheapest.vendorPrice)}</div></> : <span className="text-muted">–</span>}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}
