"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "@/components/Link";
import type { CategoryId } from "@/data/catalog-products";
// Direct imports, not the "./ui" barrel: the barrel also holds server cards that load the full
// image list and catalog data, which a "use client" file must not pull into the browser bundle.
import { Icon } from "@/components/ui/Icon";
import { ThumbZoom } from "@/components/ui/ThumbZoom";
import { formatPrice } from "@/components/ui/PriceTag";
import { RentalIcon } from "./RentalIcon";

export type PriceListRow = {
  id: string;
  name: string;
  specs?: string;
  price: number;
  unit: string;
  href: string;
  section: string;
  thumbSrc?: string;
  thumbAlt?: string;
  /** A larger version of thumbSrc for the hover/long-press zoom; falls back to thumbSrc. */
  zoomSrc?: string;
};

type SortKey = "section" | "price-asc" | "price-desc" | "name";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "section", label: "Grouped (default)" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

function Thumb({ row, category }: { row: PriceListRow; category: CategoryId }) {
  if (!row.thumbSrc) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-surface-2 text-gold/80">
        <RentalIcon category={category} className="h-6 w-6" title={`${row.name} illustration`} />
      </span>
    );
  }
  return (
    <ThumbZoom src={row.zoomSrc ?? row.thumbSrc} alt={row.thumbAlt ?? row.name}>
      <span className="relative block h-11 w-11 overflow-hidden rounded-sm bg-surface-2">
        <Image src={row.thumbSrc} alt={row.thumbAlt ?? ""} fill sizes="44px" loading="lazy" className="object-cover" />
      </span>
    </ThumbZoom>
  );
}

// The category page's "full price list": a filter box and a sort picker over the full inventory
// table. Grouped by section by default (same layout as before this existed); filtering or sorting by
// price or name flattens it into one list, since a search match or a price rank doesn't respect sections.
export function PriceList({ rows, category }: { rows: PriceListRow[]; category: CategoryId }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("section");

  const query = q.trim().toLowerCase();
  const filtered = query
    ? rows.filter((r) => `${r.name} ${r.specs ?? ""}`.toLowerCase().includes(query))
    : rows;

  const grouped = sort === "section" && !query;
  const flat = useMemo(() => {
    const list = [...filtered];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filtered, sort]);

  const sections = useMemo(
    () => [...Map.groupBy(filtered, (r) => r.section)].sort((a, b) => a[0].localeCompare(b[0])),
    [filtered],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-[180px]">
          <span className="sr-only">Search this price list</span>
          <Icon name="search" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search this list…"
            className="field w-full pl-9"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="field w-auto py-2">
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No items match &ldquo;{q}&rdquo;. Try a different word.</p>
      ) : grouped ? (
        <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-2">
          {sections.map(([section, sectionRows]) => (
            <table key={section} className="w-full self-start text-sm">
              <caption className="pb-3 text-left text-xs font-medium tracking-[0.18em] text-muted uppercase">{section}</caption>
              <tbody>
                {sectionRows.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="w-14 py-2.5 pr-3 align-top">
                      <Thumb row={r} category={category} />
                    </td>
                    <td className="py-2.5 pr-3">
                      <Link href={r.href} className="hover:text-gold">
                        {r.name}
                      </Link>
                      {r.specs && <span className="block text-xs text-muted">{r.specs}</span>}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap tabular-nums">
                      {formatPrice(r.price)}
                      <span className="block text-xs text-muted">{r.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      ) : (
        <table className="mt-10 w-full text-sm">
          <tbody>
            {flat.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="w-14 py-2.5 pr-3 align-top">
                  <Thumb row={r} category={category} />
                </td>
                <td className="py-2.5 pr-3">
                  <Link href={r.href} className="hover:text-gold">
                    {r.name}
                  </Link>
                  {r.specs && <span className="block text-xs text-muted">{r.specs}</span>}
                  <span className="block text-xs text-muted">{r.section}</span>
                </td>
                <td className="py-2.5 text-right whitespace-nowrap tabular-nums">
                  {formatPrice(r.price)}
                  <span className="block text-xs text-muted">{r.unit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
