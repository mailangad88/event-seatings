// Ready-made rental packages: a typical party, already sized and priced, that opens in the planner
// with the list built. They use the same rules as the step-by-step planner (src/lib/event-plan.ts),
// so the price on the card is the price the visitor sees after one tap.
import { catalogItems } from "@/data/catalog";
import { toPublicItem } from "@/lib/catalog-types";
import { MAX_GUESTS, MIN_GUESTS, packageHref, quotePackage, type PackageItemInfo, type PackageQuote } from "@/lib/package-price";
import { getPlannerEvent, recommend, settings, styleName, type ExtraId, type SettingId, type StyleId } from "@/lib/event-plan";

type PackageDef = {
  id: string;
  name: string;
  event: string;
  guests: number;
  setting: SettingId;
  style: StyleId;
  extras?: ExtraId[];
  blurb: string;
};

const defs: PackageDef[] = [
  { id: "backyard-birthday-50", name: "Backyard birthday", event: "birthday", guests: 50, setting: "backyard", style: "simple", blurb: "Chairs, long tables, a tent for shade or rain and a drinks setup for a party at home." },
  { id: "graduation-80", name: "Graduation open house", event: "graduation", guests: 80, setting: "backyard", style: "simple", blurb: "Long tables, chairs, a buffet line and a canopy for the yard." },
  { id: "shower-40", name: "Bridal or baby shower", event: "shower", guests: 40, setting: "venue", style: "classic", blurb: "Garden chairs, full linens and a brunch buffet." },
  { id: "kids-party-30", name: "Kids' party", event: "kids", guests: 30, setting: "backyard", style: "simple", blurb: "Kid-size tables and chairs, seats for parents and a bounce house." },
  { id: "wedding-150", name: "Wedding reception", event: "wedding", guests: 150, setting: "venue", style: "classic", blurb: "Rounds, floor-length linens, full place settings, bar and dance floor." },
  { id: "tent-wedding-150", name: "Tented wedding", event: "wedding", guests: 150, setting: "tent", style: "classic", blurb: "Everything in the reception package, plus a tent, lights and power." },
  { id: "sangeet-250", name: "Indian wedding or sangeet", event: "indian-wedding", guests: 250, setting: "venue", style: "lavish", blurb: "Gold Chiavari chairs, sequin linens, lounge seating and a big dance floor." },
  { id: "corporate-120", name: "Company dinner or gala", event: "corporate", guests: 120, setting: "venue", style: "classic", blurb: "Padded chairs, rounds, a bar, standing tables and a sound system." },
];

export type ReadyPackage = PackageDef &
  PackageQuote & {
    extras: ExtraId[];
    eventName: string;
    settingName: string;
    styleName: string;
    image: string;
    alt: string;
    href: string;
    /** Price, name and category of every item the package can use, so a card can reprice for another guest count. */
    items: Record<string, PackageItemInfo>;
  };

const byId = new Map(catalogItems.map((i) => [i.id, i]));

function build(d: PackageDef): ReadyPackage {
  const ev = getPlannerEvent(d.event)!;
  const extras = d.extras ?? ev.extras;
  const shape = { event: d.event, setting: d.setting, style: d.style, extras };
  // Collect every item the package uses at any size (some only appear above or below a guest count).
  const items: Record<string, PackageItemInfo> = {};
  for (const g of [MIN_GUESTS, 10, 25, d.guests, 100, 250, 500, MAX_GUESTS]) {
    for (const l of recommend({ ...shape, guests: g })) {
      const it = byId.get(l.id);
      if (it && !items[l.id]) items[l.id] = { name: it.name, price: toPublicItem(it).price, cat: it.categoryId ?? "" };
    }
  }
  return {
    ...d,
    ...quotePackage(shape, d.guests, items),
    extras,
    eventName: ev.name,
    settingName: settings.find((s) => s.id === d.setting)!.name,
    styleName: styleName(d.style),
    image: ev.image,
    alt: ev.alt,
    href: packageHref({ id: d.id, ...shape }, d.guests),
    items,
  };
}

export const readyPackages: ReadyPackage[] = defs.map(build);
export const getPackage = (id: string) => readyPackages.find((p) => p.id === id);
