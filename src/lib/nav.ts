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
    promo: { title: "Price your whole event", cta: "Build a quote", href: "/quote", scene: "wedding-reception" },
  },
  {
    id: "plan",
    label: "Plan & book",
    href: "/how-it-works",
    all: "How it works",
    tone: "wine",
    groups: [
      {
        title: "Get started",
        links: [
          { href: "/quote", label: "Build a quote", blurb: "Pick items, see prices as you go", icon: "quote" },
          { href: "/packages", label: "Ready-made packages", blurb: "Sets sized for your guest count", icon: "gift" },
          { href: "/book", label: "Book a free call", blurb: "15 minutes with our team", icon: "phone" },
          { href: "/how-it-works", label: "How it works", blurb: "From quote to delivery day", icon: "list" },
        ],
      },
      {
        title: "Your event",
        links: [
          { href: "/my-events", label: "My events", blurb: "Countdown and dated checklist", icon: "calendar" },
          { href: "/account", label: "Your account", blurb: "Orders, deliveries, payments, messages", icon: "users" },
          { href: "/countdown", label: "Event countdown", blurb: "Days left and what to do now", icon: "clock" },
          { href: "/events", label: "Events we plan", blurb: "Weddings, parties, work events", icon: "users" },
          { href: "/booking-promise", label: "Payments & Booking Promise", blurb: "How paying and refunds work", icon: "shield" },
        ],
      },
    ],
    promo: { title: "Not sure where to start?", cta: "Book a free call", href: "/book", scene: "farm-table-dinner" },
  },
  {
    id: "ideas",
    label: "Ideas",
    href: "/ideas",
    all: "All event ideas",
    tone: "gold",
    groups: [
      {
        title: "Find ideas",
        links: [
          { href: "/ideas", label: "Event ideas by month", blurb: "What to plan and book now", icon: "calendar" },
          { href: "/party-ideas", label: "Party ideas & themes", blurb: "Themes with a rental list for each", icon: "spark" },
          { href: "/looks", label: "The Look Book", blurb: "Full room looks you can copy", icon: "heart" },
          { href: "/events", label: "Events we plan", blurb: "Ideas by type of event", icon: "users" },
        ],
      },
      {
        title: "See it first",
        links: [
          { href: "/gallery", label: "3D gallery", blurb: "Styled rooms you can turn around", icon: "camera" },
          { href: "/chairs", label: "Chairs in 3D", blurb: "Compare styles and finishes", icon: "chair" },
          { href: "/quiz", label: "Style quiz", blurb: "Four questions, a matched shortlist", icon: "star" },
        ],
      },
    ],
    promo: { title: "Get ideas for your date", cta: "See this month", href: "/ideas", scene: "boho-lounge" },
  },
  {
    id: "guides",
    label: "Guides",
    href: "/blog",
    all: "All planning guides",
    tone: "blue",
    groups: [
      {
        title: "Planning guides",
        links: [
          { href: "/blog", label: "All planning guides", blurb: "Step-by-step help by topic", icon: "book" },
          { href: "/vendor-guide", label: "Vendor guide", blurb: "Who to hire and in what order", icon: "list" },
          { href: "/downloads", label: "Free kits & spreadsheets", blurb: "Printable checklists", icon: "download" },
          { href: "/chicago-event-seasons", label: "Chicago event seasons", blurb: "Weather, prices and busy dates", icon: "sun" },
        ],
      },
      {
        title: "Quick answers",
        links: [
          { href: "/answers", label: "Quick answers", blurb: "Short answers to common questions", icon: "chat" },
          { href: "/solutions", label: "Rental problems solved", blurb: "Fixes for common snags", icon: "check" },
          { href: "/glossary", label: "Rental glossary", blurb: "Rental words in plain English", icon: "info" },
          { href: "/faq", label: "FAQ", blurb: "Booking, delivery and payment", icon: "help" },
        ],
      },
      {
        title: "Costs & sizes",
        links: [
          { href: "/chair-rental-cost", label: "Chair rental cost", blurb: "What chairs cost in Chicago", icon: "wallet" },
          { href: "/data/chicago-rental-prices", label: "Chicago rental prices", blurb: "Price list across rental houses", icon: "chart" },
          { href: "/compare", label: "Compare your options", blurb: "Side-by-side choices", icon: "sliders" },
          { href: "/seating-layouts", label: "Seating layouts", blurb: "Rows, rounds and long tables", icon: "ruler" },
        ],
      },
    ],
    promo: { title: "Free planning kits", cta: "Get a kit", href: "/downloads", scene: "garden-ceremony" },
  },
  {
    id: "tools",
    label: "Free tools",
    href: "/tools",
    all: "All free tools",
    tone: "green",
    groups: [
      {
        title: "Calculators",
        links: [
          { href: "/tools/rental-calculator", label: "Rental calculator", blurb: "Guest count in, full list out", icon: "chart" },
          { href: "/tools/tables-and-chairs", label: "Tables & chairs", blurb: "How many of each you need", icon: "table" },
          { href: "/tools/tent-size", label: "Tent size", blurb: "The right tent for your guests", icon: "tent" },
          { href: "/tools/guest-count", label: "Guest count", blurb: "How many will actually come", icon: "users" },
        ],
      },
      {
        title: "Plans & checklists",
        links: [
          { href: "/seating-planner", label: "Seating planner", blurb: "Chairs and tables for each part of the day", icon: "chair" },
          { href: "/tools/timeline", label: "Timeline builder", blurb: "Work back from your date", icon: "clock" },
          { href: "/tools/budget-splitter", label: "Budget splitter", blurb: "Where your money should go", icon: "wallet" },
          { href: "/tools/what-do-i-need", label: "What do I still need?", blurb: "Find the gaps in your list", icon: "check" },
        ],
      },
    ],
    promo: { title: "All free tools in one place", cta: "See every tool", href: "/tools", scene: "tent-reception-dusk" },
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    all: "About us",
    tone: "wine",
    wideOnly: true,
    groups: [
      {
        title: "About us",
        links: [
          { href: "/about", label: "About us", blurb: "Who we are", icon: "home" },
          { href: "/how-we-work", label: "How we work", blurb: "How we pick and price rentals", icon: "info" },
          { href: "/reviews", label: "Reviews", blurb: "What hosts say", icon: "star" },
          { href: "/press", label: "Press", blurb: "News and media", icon: "mail" },
          { href: "/chair-rentals", label: "Areas we serve", blurb: "Chicago and the suburbs", icon: "pin" },
          { href: "/refer", label: "Refer a friend", blurb: "Share and both save", icon: "gift" },
        ],
      },
      {
        title: "For rental companies",
        links: [
          { href: "/partners", label: "Work with us", blurb: "List your rentals with us", icon: "truck" },
          { href: "/partners/onboard", label: "Rental company sign-up", blurb: "Get set up", icon: "plus" },
          { href: "/partners/faq", label: "Partner FAQ", blurb: "Fees, orders and payouts", icon: "help" },
          { href: "/vendor-listings", label: "Vendor listings & opt-out", blurb: "Change or remove a listing", icon: "block" },
        ],
      },
    ],
    promo: { title: "Questions? Talk to us", cta: "Book a free call", href: "/book", scene: "cocktail-hour" },
  },
];

/** Footer-only extras: deeper guide pages that do not fit in a dropdown. */
export const footerExtras: MenuGroup = {
  title: "Layouts & sizing",
  links: [
    { href: "/room-size-guides", label: "Room sizes", icon: "ruler" },
    { href: "/table-seating-guides", label: "Table seating", icon: "table" },
    { href: "/chair-fit", label: "Chair fit", icon: "chair" },
    { href: "/chair-comparisons", label: "Chair comparisons", icon: "sliders" },
    { href: "/rental-comparisons", label: "Rental comparisons", icon: "sliders" },
  ],
};

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

