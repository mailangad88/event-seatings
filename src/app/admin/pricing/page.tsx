import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { vendors } from "@/data/vendors";
import { AdminHeader, Empty, Table, Tile } from "@/components/admin/AdminUi";
import { Icon } from "@/components/ui/Icon";
import { DAMAGE_WAIVER, DELIVERY_MINIMUM_ORDER, SALES_TAX, SETUP_MIN, SETUP_SHARE } from "@/lib/fees";
import { money0, money2, prettyDay } from "@/lib/admin-view";
import { listLeads } from "@/lib/store";
import { itemUse, priceCategories, priceRows, recheckReasons, type ItemUse } from "./rows";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pricing", robots: { index: false } };

const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? id;
const filters = [
  { id: "", label: "All items" },
  { id: "estimated", label: "Estimated prices" },
  { id: "stale", label: "Not checked in 90 days" },
  { id: "cheaper", label: "Cheaper elsewhere" },
] as const;
const views = [
  { id: "", label: "Prices" },
  { id: "margin", label: "Item markup (15% since Nov 4)" },
] as const;
const sorts = [
  { id: "", label: "Biggest cut per item" },
  { id: "small", label: "Smallest cut per item" },
  { id: "booked", label: "Most earned on booked orders" },
  { id: "quoted", label: "Most quoted" },
  { id: "name", label: "Name" },
  { id: "category", label: "Category" },
] as const;
const noUse: ItemUse = { quotes: 0, qty: 0, bookedQty: 0, bookedCut: 0 };

function Thumb({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="media h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-line/40">
      {src && <Image src={src} alt={alt} width={48} height={48} className="h-full w-full object-cover" />}
    </div>
  );
}

export default async function PricingPage(props: PageProps<"/admin/pricing">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const f = typeof sp.f === "string" ? sp.f : "";
  const vendor = typeof sp.vendor === "string" ? sp.vendor : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const view = sp.view === "margin" ? "margin" : "";
  const sort = sorts.find((x) => x.id === sp.sort)?.id ?? "";

  const rows = priceRows();
  const categories = priceCategories();
  const usage = view === "margin" ? itemUse(await listLeads()) : new Map<string, ItemUse>();
  const statsOf = (id: string) => usage.get(id) ?? noUse;
  const toRecheck = rows.filter((r) => recheckReasons(r).length > 0).length;
  const filtered = rows.filter(
    (r) =>
      (!q || `${r.i.name} ${r.i.category} ${r.i.id}`.toLowerCase().includes(q)) &&
      (!vendor || r.i.vendorId === vendor) &&
      (!category || r.i.category === category) &&
      (f !== "estimated" || r.estimated) &&
      (f !== "stale" || r.stale) &&
      (f !== "cheaper" || !!r.cheapest),
  );
  const shown = [...filtered].sort((a, b) =>
    sort === "small" ? a.cut - b.cut
    : sort === "booked" ? statsOf(b.i.id).bookedCut - statsOf(a.i.id).bookedCut || b.cut - a.cut
    : sort === "quoted" ? statsOf(b.i.id).quotes - statsOf(a.i.id).quotes || b.cut - a.cut
    : sort === "name" ? a.i.name.localeCompare(b.i.name)
    : sort === "category" ? a.i.category.localeCompare(b.i.category) || a.i.name.localeCompare(b.i.name)
    : view === "margin" ? b.cut - a.cut
    : 0,
  );
  const bookedCut = [...usage.values()].reduce((t, u) => t + u.bookedCut, 0);
  const href = (p: Record<string, string>) => {
    const u = new URLSearchParams({
      ...(q && { q }),
      ...(f && { f }),
      ...(vendor && { vendor }),
      ...(category && { category }),
      ...(view && { view }),
      ...(sort && { sort }),
      ...p,
    });
    for (const [k, v] of [...u]) if (!v) u.delete(k);
    return `/admin/pricing${u.size ? `?${u}` : ""}`;
  };
  const exportHref = href({}).replace("/admin/pricing", "/admin/pricing/export");

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Sell"
        title="Pricing"
        intro={
          <>
            Every catalog item with the rental company&apos;s price and what customers see (the rental company&apos;s price plus 15%, shown as our own price). To change
            the price on one order, use Edit quote on the lead. Catalog prices across the site change with the next site update, so send Claude the
            new prices.
          </>
        }
        actions={
          <>
            <a href={exportHref} className="btn-ghost btn-sm">
              <Icon name="download" size={16} /> Export CSV
            </a>
            <a href={`/admin/pricing/recheck${vendor ? `?vendor=${encodeURIComponent(vendor)}` : ""}`} className="btn-ghost btn-sm">
              <Icon name="download" size={16} /> Items to recheck ({toRecheck.toLocaleString()})
            </a>
          </>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="wine" label="Items" value={rows.length.toLocaleString()} href="/admin/pricing" />
        <Tile tone="amber" label="Estimated prices" value={rows.filter((r) => r.estimated).length.toLocaleString()} note="No public price from the vendor" href={href({ f: "estimated" })} />
        <Tile tone="amber" label="Not checked in 90 days" value={rows.filter((r) => r.stale).length.toLocaleString()} href={href({ f: "stale" })} />
        <Tile tone="gold" label="Cheaper elsewhere" value={rows.filter((r) => r.cheapest).length.toLocaleString()} note="Another vendor lists it for less" href={href({ f: "cheaper" })} />
      </div>

      <p className="mt-4 text-xs text-muted">
        On top of the item price, every delivered order also gets: a delivery &amp; pickup fee (roughly $150-$400+ by order size, orders under {money0(DELIVERY_MINIMUM_ORDER)} may not
        qualify for delivery), setup &amp; teardown (currently {Math.round(SETUP_SHARE * 100)}% of the rental subtotal, at least {money0(SETUP_MIN)} combined), a {Math.round(DAMAGE_WAIVER * 100)}%
        damage waiver, and {(SALES_TAX * 100).toFixed(2)}% Illinois sales tax. These fee rules are changing in PR #177 (real per-chair setup/teardown rates, 40% item markup) — this page will pick
        up the new numbers once it merges.
      </p>

      <nav aria-label="Pricing view" className="mt-8 flex flex-wrap gap-2">
        {views.map((x) => (
          <Link key={x.id} href={href({ view: x.id, sort: "" })} className={x.id === view ? "chip-active" : "chip"} aria-current={x.id === view ? "page" : undefined}>{x.label}</Link>
        ))}
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <nav aria-label="Filter items" className="flex flex-wrap gap-2">
          {filters.map((x) => (
            <Link key={x.id} href={href({ f: x.id })} className={x.id === f ? "chip-active" : "chip"}>{x.label}</Link>
          ))}
        </nav>
        <form action="/admin/pricing" className="ml-auto flex flex-wrap gap-2">
          {f && <input type="hidden" name="f" value={f} />}
          {view && <input type="hidden" name="view" value={view} />}
          <label htmlFor="sort" className="sr-only">Sort by</label>
          <select id="sort" name="sort" defaultValue={sort} className="field min-h-10 py-2">
            {sorts.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
          <label htmlFor="category" className="sr-only">Category</label>
          <select id="category" name="category" defaultValue={category} className="field min-h-10 py-2">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
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
        <p className="mb-3 text-sm text-muted">
          {shown.length.toLocaleString()} items{shown.length > 300 ? ", showing the first 300" : ""}
          {view === "margin" && ` · ${money0(bookedCut)} earned on booked orders so far, from quote lines on confirmed events`}
        </p>
        {shown.length === 0 ? (
          <Empty>No items match.</Empty>
        ) : view === "margin" ? (
          <Table head={["Item", "Rental company", "Their price", "Our price", "Our margin", "On quotes", "Earned on booked orders"]} right={[2, 3, 4, 5, 6]} min={1100}>
            {shown.slice(0, 300).map(({ i, ours, cut, cutPercent, image }) => {
              const u = statsOf(i.id);
              return (
                <tr key={i.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Thumb src={image} alt={i.imageAlt ?? i.name} />
                      <div>{i.name}<div className="text-xs text-muted">{i.category} · {i.unit}</div></div>
                    </div>
                  </td>
                  <td>{vendorName(i.vendorId)}</td>
                  <td className="text-right tabular-nums">{money2(i.vendorPrice)}</td>
                  <td className="text-right tabular-nums">{money2(ours)}</td>
                  <td className="text-right tabular-nums">{money2(cut)}<div className="text-xs text-muted">{i.vendorPrice > 0 ? `${cutPercent}% of our price` : ""}</div></td>
                  <td className="text-right tabular-nums">{u.quotes ? <>{u.quotes}<div className="text-xs text-muted">{u.qty.toLocaleString()} units</div></> : <span className="text-muted">–</span>}</td>
                  <td className="text-right tabular-nums">{u.bookedQty ? <>{money2(u.bookedCut)}<div className="text-xs text-muted">{u.bookedQty.toLocaleString()} units</div></> : <span className="text-muted">–</span>}</td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <Table head={["Item", "Rental company", "Their price", "Customer price", "Margin", "Price from", "Cheaper offer"]} right={[2, 3, 4]} min={1100}>
            {shown.slice(0, 300).map(({ i, ours, cut, cutPercent, image, cheapest, stale, estimated }) => (
              <tr key={i.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <Thumb src={image} alt={i.imageAlt ?? i.name} />
                    <div>{i.name}<div className="text-xs text-muted">{i.category} · {i.unit}</div></div>
                  </div>
                </td>
                <td>{vendorName(i.vendorId)}</td>
                <td className="text-right tabular-nums">{money2(i.vendorPrice)}</td>
                <td className="text-right tabular-nums">{money2(ours)}</td>
                <td className="text-right tabular-nums">{money2(cut)}<div className="text-xs text-muted">{i.vendorPrice > 0 ? `${cutPercent}%` : ""}</div></td>
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
