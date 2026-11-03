// Ready-made rental packages: a typical party, already sized and priced, that opens in the planner
// with the list built. They use the same rules as the step-by-step planner (src/lib/event-plan.ts),
// so the price on the card is the price the visitor sees after one tap.
import { catalogItems } from "@/data/catalog";
import { toPublicItem } from "@/lib/catalog-types";
import { allInEstimate } from "@/lib/fees";
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

export type ReadyPackage = PackageDef & {
  eventName: string;
  settingName: string;
  styleName: string;
  image: string;
  alt: string;
  rentals: number;
  allIn: number;
  perGuest: number;
  itemCount: number;
  highlights: string[];
  href: string;
};

const byId = new Map(catalogItems.map((i) => [i.id, i]));

function build(d: PackageDef): ReadyPackage {
  const ev = getPlannerEvent(d.event)!;
  const extras = d.extras ?? ev.extras;
  const lines = recommend({ event: d.event, guests: d.guests, style: d.style, setting: d.setting, extras }).filter((l) => byId.has(l.id));
  const priced = lines.map((l) => ({ ...l, item: toPublicItem(byId.get(l.id)!), cat: byId.get(l.id)!.categoryId }));
  const rentals = priced.reduce((s, l) => s + l.item.price * l.qty, 0);
  const allIn = allInEstimate(rentals, { categoryIds: priced.map((l) => l.cat) }).total;
  // The biggest lines first, so the card names what the money goes on.
  const highlights = [...priced]
    .sort((x, y) => y.item.price * y.qty - x.item.price * x.qty)
    .slice(0, 4)
    .map((l) => `${l.item.name} × ${l.qty.toLocaleString()}`);
  const params = new URLSearchParams({ event: d.event, guests: String(d.guests), setting: d.setting, style: d.style, from: `package-${d.id}` });
  return {
    ...d,
    extras,
    eventName: ev.name,
    settingName: settings.find((s) => s.id === d.setting)!.name,
    styleName: styleName(d.style),
    image: ev.image,
    alt: ev.alt,
    rentals: Math.round(rentals),
    allIn: Math.round(allIn),
    perGuest: Math.round(allIn / d.guests),
    itemCount: lines.length,
    highlights,
    href: `/quote?${params}`,
  };
}

export const readyPackages: ReadyPackage[] = defs.map(build);
export const getPackage = (id: string) => readyPackages.find((p) => p.id === id);
