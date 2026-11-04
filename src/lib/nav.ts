// Navigation for the rental marketplace. Categories come straight from the catalog
// (src/data/catalog-products.ts) so the menu always matches /rentals/<id>.
import type { IconName } from "@/components/ui/Icon";
import { categories, type CategoryId } from "@/data/catalog-products";
import type { MenuTone } from "./menu-style";

export { toneTile, type MenuTone } from "./menu-style";

export type NavCategory = { id: string; name: string; blurb: string; icon: IconName };

// Menu icon and short blurb per category (the catalog blurbs are too long for the menu).
const menu: Record<CategoryId, [IconName, string]> = {
  chairs: ["chair", "Chiavari, cross-back, ghost, folding"],
  tables: ["table", "Round, banquet, farm, cocktail"],
  linens: ["linen", "Tablecloths, runners, napkins"],
  dinnerware: ["plate", "Chargers, plates, bowls"],
  flatware: ["flatware", "Silver and gold finishes"],
  glassware: ["glass", "Goblets, wine, flutes, bar"],
  "catering-equipment": ["chafer", "Chafers, urns, bars"],
  tents: ["tent", "Frame, pole, sailcloth, clear-top"],
  "dance-floors-staging": ["floor", "Wood, white, LED, stages"],
  lighting: ["light", "Bistro, uplights, chandeliers"],
  "heating-cooling": ["heat", "Patio and tent heaters"],
  lounge: ["sofa", "Sofas, armchairs, coffee tables"],
  decor: ["arch", "Arches, flower walls, candles"],
  "games-kids": ["games", "Bounce houses, yard games"],
  concessions: ["spark", "Popcorn, cotton candy, snow cones"],
  "photo-booths": ["star", "360, mirror and selfie booths"],
  "av-sound": ["chat", "PA, mics, projectors, screens"],
  "restrooms-power": ["truck", "Restrooms, generators, cords"],
  "fencing-crowd-control": ["shield", "Stanchions, barricades, carpets"],
};

export const rentalCategories: NavCategory[] = categories.map((c) => ({
  id: c.id,
  name: c.name,
  blurb: menu[c.id][1],
  icon: menu[c.id][0],
}));
// Rental categories grouped the way people shop for an event. Every catalog id must sit in one group;
// any new id that is missing lands in "More for your event" so it never drops out of the menu.
const rentalGroupIds: { title: string; ids: CategoryId[] }[] = [
  { title: "Seating & tables", ids: ["chairs", "tables", "lounge"] },
  { title: "Table settings & food", ids: ["linens", "dinnerware", "flatware", "glassware", "catering-equipment"] },
  { title: "Tents, floors & power", ids: ["tents", "dance-floors-staging", "heating-cooling", "lighting", "restrooms-power", "fencing-crowd-control"] },
  { title: "Fun & decor", ids: ["decor", "photo-booths", "games-kids", "concessions", "av-sound"] },
];

export type MenuLink = { href: string; label: string; blurb?: string; icon: IconName };
export type MenuGroup = { title: string; links: MenuLink[] };
export type Menu = {
  id: string;
  label: string;
  href: string;
  /** Label for the "see everything" link under the dropdown. */
  all: string;
  tone: MenuTone;
  groups: MenuGroup[];
  /** Picture panel on the right of the dropdown. `scene` is a render slug from rental-images.json. */
  promo: { title: string; cta: string; href: string; scene: string };
  /** Hidden on narrow laptops so the bar fits on one line (still in the phone menu and footer). */
  wideOnly?: boolean;
};

const rentalsMenuGroups: MenuGroup[] = (() => {
  const byId = new Map(rentalCategories.map((c) => [c.id, c]));
  const used = new Set(rentalGroupIds.flatMap((g) => g.ids as string[]));
  const groups = rentalGroupIds.map((g) => ({
    title: g.title,
    links: g.ids.flatMap((id) => {
      const c = byId.get(id);
      return c ? [{ href: `/rentals/${c.id}`, label: c.name, blurb: c.blurb, icon: c.icon }] : [];
    }),
  }));
  const extra = rentalCategories.filter((c) => !used.has(c.id));
  if (extra.length) {
    groups.push({ title: "More for your event", links: extra.map((c) => ({ href: `/rentals/${c.id}`, label: c.name, blurb: c.blurb, icon: c.icon })) });
  }
  return groups;
})();

// The header menus, the phone menu and the footer all read from this one list, so a page only needs
// adding here to show up everywhere in the same section.
export const menus: Menu[] = [
  {
    id: "rentals",
    label: "Rentals",
    href: "/rentals",
    all: "Browse all rentals",
    tone: "gold",
    groups: rentalsMenuGroups,
    promo: { title: "Price your whole event", cta: "Get a quote", href: "/quote", scene: "wedding-reception" },
  },
  {
    id: "plan",
    label: "Plan your event",
    href: "/how-it-works",
    all: "How it works",
    tone: "wine",
    groups: [
      {
        title: "Get started",
        links: [
          { href: "/quote", label: "Get a quote", blurb: "Pick items, see prices as you go", icon: "quote" },
          { href: "/packages", label: "Ready-made packages", blurb: "Sets sized for your guest count", icon: "gift" },
          { href: "/how-it-works", label: "How it works", blurb: "From quote to delivery day", icon: "list" },
          { href: "/pricing", label: "Pricing", blurb: "One flat fee, no markup on rentals", icon: "wallet" },
        ],
      },
      {
        title: "Your event",
        links: [
          { href: "/tools/rental-calculator", label: "Rental calculator", blurb: "Guest count in, full list out", icon: "chart" },
          { href: "/my-events", label: "My events", blurb: "Countdown and dated checklist", icon: "calendar" },
          { href: "/tools", label: "All free tools", blurb: "Calculators and checklists", icon: "sliders" },
          { href: "/account", label: "Your account", blurb: "Orders, deliveries, payments, messages", icon: "users" },
        ],
      },
    ],
    promo: { title: "Not sure where to start?", cta: "Book a free call", href: "/book", scene: "farm-table-dinner" },
  },
  {
    id: "ideas",
    label: "Ideas & guides",
    href: "/blog",
    all: "All planning guides",
    tone: "blue",
    groups: [
      {
        title: "Ideas",
        links: [
          { href: "/ideas", label: "Event ideas by month", blurb: "What to plan and book now", icon: "calendar" },
          { href: "/party-ideas", label: "Party ideas & themes", blurb: "Themes with a rental list for each", icon: "spark" },
          { href: "/looks", label: "The Look Book", blurb: "Full room looks you can copy", icon: "heart" },
          { href: "/gallery", label: "Photo gallery", blurb: "Styled rooms and tables", icon: "camera" },
        ],
      },
      {
        title: "Guides",
        links: [
          { href: "/blog", label: "Planning guides", blurb: "Step-by-step help by topic", icon: "book" },
          { href: "/chair-rental-cost", label: "What rentals cost", blurb: "Chicago prices, explained", icon: "wallet" },
          { href: "/downloads", label: "Free checklists", blurb: "Printable planning kits", icon: "download" },
          { href: "/faq", label: "FAQ", blurb: "Booking, delivery and payment", icon: "help" },
        ],
      },
    ],
    promo: { title: "Free planning kits", cta: "Get a kit", href: "/downloads", scene: "garden-ceremony" },
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    all: "About us",
    tone: "wine",
    groups: [
      {
        title: "About us",
        links: [
          { href: "/about", label: "About us", blurb: "Who we are", icon: "home" },
          { href: "/reviews", label: "Reviews", blurb: "What hosts say", icon: "star" },
          { href: "/chair-rentals", label: "Areas we serve", blurb: "Chicago and the suburbs", icon: "pin" },
          { href: "/booking-promise", label: "Payments & refunds", blurb: "How paying works", icon: "shield" },
        ],
      },
      {
        title: "For rental companies",
        links: [
          { href: "/partners", label: "Work with us", blurb: "List your rentals with us", icon: "truck" },
          { href: "/vendor-listings", label: "Change a listing", blurb: "Update or remove a listing", icon: "block" },
        ],
      },
    ],
    promo: { title: "Questions? Talk to us", cta: "Book a free call", href: "/book", scene: "cocktail-hour" },
  },
];

/**
 * Pages that are no longer in the menus but still deserve a link from every page (for people and for
 * search). The footer shows them as one quiet row of small links.
 */
export const footerMore: { href: string; label: string }[] = [
  { href: "/events", label: "Events we plan" },
  { href: "/vendor-guide", label: "Vendor guide" },
  { href: "/chicago-event-seasons", label: "Chicago event seasons" },
  { href: "/answers", label: "Quick answers" },
  { href: "/solutions", label: "Rental problems solved" },
  { href: "/glossary", label: "Glossary" },
  { href: "/data/chicago-rental-prices", label: "Chicago rental prices" },
  { href: "/compare", label: "Compare options" },
  { href: "/seating-layouts", label: "Seating layouts" },
  { href: "/room-size-guides", label: "Room sizes" },
  { href: "/table-seating-guides", label: "Table seating" },
  { href: "/chair-fit", label: "Chair fit" },
  { href: "/chair-comparisons", label: "Chair comparisons" },
  { href: "/rental-comparisons", label: "Rental comparisons" },
  { href: "/chairs", label: "Chairs in 3D" },
  { href: "/quiz", label: "Style quiz" },
  { href: "/countdown", label: "Event countdown" },
  { href: "/seating-planner", label: "Seating planner" },
  { href: "/how-we-work", label: "How we work" },
  { href: "/press", label: "Press" },
  { href: "/refer", label: "Refer a friend" },
  { href: "/partners/faq", label: "Partner FAQ" },
];

// Flat list kept for older imports.
export const primaryNav = [
  { href: "/rentals", label: "Rentals" },
  { href: "/packages", label: "Packages" },
  { href: "/ideas", label: "Ideas" },
  { href: "/blog", label: "Guides" },
  { href: "/tools", label: "Free tools" },
  { href: "/my-events", label: "My events" },
  { href: "/how-it-works", label: "How it works" },
];

