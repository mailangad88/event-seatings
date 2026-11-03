import { categories, type CategoryId } from "@/data/catalog-products";
import { catalogItems } from "@/data/catalog";
import { getEventType } from "@/data/geo";
import { tools } from "@/data/tools";
import type { Journey } from "./journey";

// What a visitor seems most interested in, from the pages they read, what they clicked and what they asked for.
// Points: a page view 1, an item page 1.5, a click 2, a quote line 3, the occasion they picked 3.
// Used in the owner alert, on the lead page in /admin and to pick the follow-up emails (lib/followups.ts).

export type InterestKind = "category" | "occasion" | "tool" | "look" | "reading";
export type Interest = { kind: InterestKind; key: string; label: string; score: number; href?: string };

type LeadLike = {
  journey?: Journey | null;
  items?: { id: string; qty: number }[] | null;
  event_type?: string | null;
  quiz_styles?: string[] | null;
};

const categoryName = new Map(categories.map((c) => [c.id as string, c.name]));
const itemCategory = new Map(catalogItems.map((i) => [i.id, categories.find((c) => c.name === i.category)?.id]));
const toolName = new Map(tools.map((t) => [t.slug, t.name]));
const occasionLabel = (slug: string) =>
  (getEventType(slug)?.name ?? slug.replace(/-/g, " ")).replace(/\s*(chair|event|party)?\s*rentals?$/i, "").trim();
const pretty = (s: string) => s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

// What a site path says about interest, if anything.
function fromPath(path: string, title?: string): Omit<Interest, "score"> | undefined {
  const [p] = path.split(/[?#]/);
  const seg = p.split("/").filter(Boolean);
  const [a, b] = seg;
  if (!a) return undefined;
  if (a === "rentals" && b && categoryName.has(b)) return { kind: "category", key: b, label: categoryName.get(b)!, href: `/rentals/${b}` };
  if (a === "chairs" || a === "chair-rentals" || a === "chair-fit" || a === "chair-comparisons") return { kind: "category", key: "chairs", label: "Chairs", href: "/rentals/chairs" };
  if (a === "events" && b) return { kind: "occasion", key: b, label: occasionLabel(b), href: `/events/${b}` };
  if (a === "party-ideas" || a === "party-rentals") return { kind: "occasion", key: "party", label: "Parties", href: `/${a}` };
  if (a === "tools" && b && b !== "embed") return { kind: "tool", key: b, label: toolName.get(b) ?? title ?? pretty(b), href: `/tools/${b}` };
  if (["seating-planner", "countdown", "quiz", "my-events", "planning-assistant"].includes(a)) return { kind: "tool", key: a, label: title ?? pretty(a), href: `/${a}` };
  if (a === "looks" && b) return { kind: "look", key: b, label: title ?? pretty(b), href: `/looks/${b}` };
  if (["blog", "answers", "downloads", "seating-layouts", "room-size-guides", "table-seating-guides", "rental-cost", "chair-rental-cost", "chicago-event-seasons", "vendor-guide", "glossary"].includes(a) && b)
    return { kind: "reading", key: `${a}/${b}`, label: title ?? pretty(b), href: `/${a}/${b}` };
  return undefined;
}

export function interestsFor(lead: LeadLike): Interest[] {
  const map = new Map<string, Interest>();
  const add = (i: Omit<Interest, "score"> | undefined, pts: number) => {
    if (!i) return;
    const k = `${i.kind}:${i.key}`;
    const cur = map.get(k);
    if (cur) cur.score += pts;
    else map.set(k, { ...i, score: pts });
  };
  const titles = new Map((lead.journey?.pages ?? []).map((p) => [p.path, p.title]));
  for (const page of lead.journey?.pages ?? []) {
    const deep = page.path.split("/").filter(Boolean).length > 2;
    add(fromPath(page.path, page.title), page.path.startsWith("/rentals/") && deep ? 1.5 : 1);
  }
  for (const c of lead.journey?.clicks ?? []) if (c.href?.startsWith("/")) add(fromPath(c.href, titles.get(c.href)), 2);
  for (const line of lead.items ?? []) {
    const cat = itemCategory.get(line.id);
    if (cat) add({ kind: "category", key: cat, label: categoryName.get(cat)!, href: `/rentals/${cat}` }, 3);
  }
  if (lead.event_type) {
    const slug = lead.event_type.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const known = getEventType(slug) ?? getEventType(`${slug}s`);
    add({ kind: "occasion", key: known?.slug ?? slug, label: known ? occasionLabel(known.slug) : lead.event_type, href: known ? `/events/${known.slug}` : undefined }, 3);
  }
  for (const s of lead.quiz_styles ?? []) add({ kind: "look", key: s, label: pretty(s) }, 2);
  return [...map.values()].sort((x, y) => y.score - x.score);
}

export const topCategories = (list: Interest[], n = 3) => list.filter((i) => i.kind === "category").slice(0, n) as (Interest & { key: CategoryId })[];

// One line for alerts, e.g. "Tents, Lighting · weddings · used Tent size calculator".
export function interestSummary(list: Interest[]): string {
  const pick = (k: InterestKind, n: number) => list.filter((i) => i.kind === k).slice(0, n).map((i) => i.label);
  const parts = [
    pick("category", 3).join(", "),
    pick("occasion", 2).join(", "),
    pick("tool", 2).length ? `used ${pick("tool", 2).join(", ")}` : "",
    pick("look", 2).length ? `looked at ${pick("look", 2).join(", ")}` : "",
    pick("reading", 2).length ? `read ${pick("reading", 2).join("; ")}` : "",
  ];
  return parts.filter(Boolean).join(" · ");
}
