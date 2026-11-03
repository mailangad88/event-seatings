// Every free planning tool, in one list. The /tools hub, related-tool links and the sitemap read from here,
// so a new tool only needs a line here plus its page.
// `scene` is a render slug from rental-images.json (falls back to a rotating scene when missing).

export type ToolGroup = "calculators" | "plans" | "checks";

export type ToolEntry = {
  slug: string; // route under /tools
  name: string;
  short: string; // one line for cards
  group: ToolGroup;
  scene: string;
  outputs: string[];
  /** Built by another thread; listed only when its page exists in the build. */
  external?: boolean;
};

export const toolGroups: Record<ToolGroup, { title: string; intro: string }> = {
  calculators: { title: "Calculators", intro: "Turn a guest count and a room into exact rental numbers." },
  plans: { title: "Plans and timelines", intro: "Work back from your date and your budget." },
  checks: { title: "Checks and checklists", intro: "Find the gaps before they find you." },
};

export const tools: ToolEntry[] = [
  {
    slug: "rental-calculator",
    name: "Event rental calculator",
    short: "Guest count and service style in, a full list of chairs, tables, linens and dishes out.",
    group: "calculators",
    scene: "buffet-setup",
    outputs: ["Full rental list", "Quantities", "Quote"],
    external: true,
  },
  {
    slug: "guest-count",
    name: "Guest count estimator",
    short: "How many of your invited guests will actually come, and how many chairs to order.",
    group: "calculators",
    scene: "wedding-reception",
    outputs: ["Expected guests", "Low and high range", "Chairs to order"],
  },
  {
    slug: "tables-and-chairs",
    name: "Tables and chairs calculator",
    short: "Rounds or banquets, cocktail tables, ceremony chairs and every extra table.",
    group: "calculators",
    scene: "hero-tables",
    outputs: ["Tables by size", "Chairs", "Extra tables"],
  },
  {
    slug: "tent-size",
    name: "Tent size calculator",
    short: "Square feet for seating, dancing, bar and buffet, matched to standard tent sizes.",
    group: "calculators",
    scene: "tent-reception-dusk",
    outputs: ["Square feet", "Tent sizes that fit", "Space breakdown"],
  },
  {
    slug: "venue-capacity",
    name: "Venue capacity calculator",
    short: "How many guests a room holds for dinner, a ceremony, a cocktail party or a meeting.",
    group: "calculators",
    scene: "corporate-gala",
    outputs: ["Capacity by layout", "Usable square feet", "Fit check"],
  },
  {
    slug: "linens",
    name: "Tablecloth and linen calculator",
    short: "The right tablecloth size for every table and drop, plus napkins and runners.",
    group: "calculators",
    scene: "hero-linens",
    outputs: ["Cloth size", "Drop length", "Napkins and runners"],
  },
  {
    slug: "lighting",
    name: "String light and uplight calculator",
    short: "Feet of string lights for a tent, patio or backyard canopy, and how many uplights.",
    group: "calculators",
    scene: "string-lights",
    outputs: ["Feet of lights", "Bulb count", "Uplights"],
  },
  {
    slug: "dance-floor",
    name: "Dance floor size calculator",
    short: "Dance floor size and panel count for your guest count and crowd.",
    group: "calculators",
    scene: "dance-party",
    outputs: ["Floor size", "Panels", "Square feet"],
  },
  {
    slug: "timeline",
    name: "Event timeline builder",
    short: "Enter your date and get every planning task with a real deadline, ready for your calendar.",
    group: "plans",
    scene: "garden-ceremony",
    outputs: ["Dated tasks", "Calendar file", "Printable plan"],
  },
  {
    slug: "budget-splitter",
    name: "Event budget splitter",
    short: "Split one budget across categories, see cost per guest, and split it between hosts.",
    group: "plans",
    scene: "buffet-setup",
    outputs: ["Category budget", "Per guest", "Who pays what"],
  },
  {
    slug: "event-weather",
    name: "Event weather and sunset planner",
    short: "Your date's normal high, sunset, golden light and dark-by time, with what to plan for lights, heat and rain.",
    group: "plans",
    scene: "tent-reception-dusk",
    outputs: ["Sunset", "Dark by", "What to rent"],
  },
  {
    slug: "event-date",
    name: "Chicago event date checker",
    short: "Weather history, sunset and golden hour, and holidays near your date.",
    group: "plans",
    scene: "garden-ceremony",
    outputs: ["Weather", "Sunset", "Holidays"],
    external: true,
  },
  {
    slug: "floor-plan",
    name: "Floor plan builder",
    short: "Drag tables and chairs into your room and see what fits.",
    group: "plans",
    scene: "hero-layouts",
    outputs: ["Floor plan", "Table count", "Share link"],
    external: true,
  },
  {
    slug: "rain-plan",
    name: "Rain plan checklist",
    short: "Every decision for an outdoor event's backup plan, with your call-it date.",
    group: "checks",
    scene: "winter-tent",
    outputs: ["Checklist", "Decision date", "Printable"],
  },
  {
    slug: "seating-readiness",
    name: "Seating Readiness Score",
    short: "15 statements, a score out of 100 and the one area to settle first.",
    group: "checks",
    scene: "cross-back",
    outputs: ["Score /100", "Weakest area", "Share link"],
  },
];

export const getTool = (slug: string) => tools.find((t) => t.slug === slug);
