import "server-only";
import { catalogItems, getCatalogItem } from "@/data/catalog";
import { toPublicItem } from "@/lib/catalog-types";
import type { ToolPrice } from "@/components/tools/controls";

/** Customer prices (vendor rate + our fee) for a few catalog ids, for the calculators' rough cost box. */
export function toolPrices(ids: string[]): Record<string, ToolPrice> {
  const out: Record<string, ToolPrice> = {};
  for (const id of ids) {
    const item = getCatalogItem(id);
    if (!item) continue;
    const p = toPublicItem(item);
    out[id] = { id, name: p.name, price: p.price, unit: item.unit, estimated: p.estimated };
  }
  return out;
}

/** Prices for every curated (featured) catalog item: the ids the planner can recommend. */
export function featuredPrices(): Record<string, ToolPrice> {
  return toolPrices(catalogItems.filter((i) => i.featured).map((i) => i.id));
}
