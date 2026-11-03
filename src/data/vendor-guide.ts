// Vendor team guide (/vendor-guide): who hosts hire for each kind of event, when to book them,
// what to ask, and where their job overlaps with rentals. Generic roles only; no vendor is named.
import type { IconName } from "@/components/ui/Icon";

export type RoleId =
  | "venue" | "caterer" | "rentals" | "tent" | "dj" | "photographer" | "florist"
  | "bartender" | "officiant" | "planner" | "cake" | "lighting" | "photobooth" | "permits";

export type Role = {
  id: RoleId;
  name: string;
  icon: IconName;
  does: string;
  book: string; // when, in plain words
  monthsOut: number; // for sorting the timeline
  ask: string[];
  overlap?: string; // where this role and rentals meet
  link?: { href: string; label: string };
};

export const roles: Role[] = [
  {
    id: "venue", name: "Venue", icon: "pin", monthsOut: 12,
    does: "The room or site, its rules, and often its own tables, chairs and staff.",
    book: "First, as soon as you have a date range and a rough guest count. Popular Saturdays go 12+ months out.",
    ask: ["What tables, chairs and linens are included, and can we bring our own?", "What is the load-in and load-out window for vendors?", "Do vendors need a certificate of insurance?", "What is the seated capacity with round tables and a dance floor?"],
    overlap: "Ask what's included before you rent. Many halls include basic banquet chairs, so you might rent only upgrades.",
    link: { href: "/blog/chicago-venue-rules-chair-rentals", label: "What Chicago venues require from rental vendors" },
  },
  {
    id: "planner", name: "Planner or day-of coordinator", icon: "calendar", monthsOut: 10,
    does: "Keeps the timeline and vendors on track. A day-of coordinator usually starts 4-8 weeks out.",
    book: "Right after the venue for full planning; 2-4 months out for day-of coordination.",
    ask: ["Full planning, partial or day-of only?", "How many events do you take on one date?", "Do you run the vendor timeline and confirm deliveries?"],
    overlap: "Share your rental order with them so they can check it against the floor plan and the delivery window.",
  },
  {
    id: "caterer", name: "Caterer", icon: "chafer", monthsOut: 9,
    does: "Food, service staff and sometimes plates, glasses, linens and chafers.",
    book: "Soon after the venue, especially for weddings and cultural celebrations with specific cuisine.",
    ask: ["Do you bring plates, flatware, glassware and linens, or should we rent them?", "How many staff per guest for buffet vs plated?", "Do you need a prep tent or kitchen space?", "Is the bar included, and are you licensed to serve alcohol?"],
    overlap: "The biggest overlap. Get the caterer's equipment list in writing so you don't rent (or miss) dinnerware, chafers or a prep tent.",
    link: { href: "/rentals/dinnerware", label: "Dinnerware rentals" },
  },
  {
    id: "photographer", name: "Photographer or videographer", icon: "star", monthsOut: 9,
    does: "Captures the day. In-demand photographers book a year out for peak Saturdays.",
    book: "6-12 months out for weddings; 1-3 months for parties and corporate events.",
    ask: ["How many hours, and is a second shooter included?", "What lighting do you need for evening shots?", "When will we get the photos?"],
    overlap: "Plan lighting with them. Check sunset for your date so portraits land in golden light.",
    link: { href: "/tools/event-weather", label: "Sunset and darkness for your date" },
  },
  {
    id: "tent", name: "Tent and structures", icon: "tent", monthsOut: 6,
    does: "Tents, sidewalls, flooring, heaters and the permits that come with them.",
    book: "4-8 months out for May-October weekends; tents are among the first rentals to sell out.",
    ask: ["What size fits our guests, tables and dance floor?", "Stakes or weights, and who calls 811 (JULIE in Illinois)?", "Does our town need a tent permit, and who applies?", "Are sidewalls and heaters included or extra?"],
    overlap: "Book the tent and the furniture together so sizes, layout and delivery times line up.",
    link: { href: "/blog/what-size-tent-do-i-need", label: "What size tent do I need?" },
  },
  {
    id: "rentals", name: "Furniture and tableware rentals", icon: "chair", monthsOut: 5,
    does: "Chairs, tables, linens, dinnerware, glassware, lounge, decor, dance floors and lighting.",
    book: "3-6 months out for weddings and big parties; 4-8 weeks for smaller events, earlier for specialty chairs on peak dates.",
    ask: ["What's the delivery window, and is setup and breakdown included?", "Is there a damage waiver, and what does it cover?", "When is the final count due?", "How should linens and dishes be packed for return?"],
    overlap: `This is what we do: one itemized quote from vetted Chicago-area rental companies.`,
    link: { href: "/quote?from=vendor-guide", label: "Build a free rental quote" },
  },
  {
    id: "dj", name: "DJ, band or AV", icon: "spark", monthsOut: 6,
    does: "Music, microphones for speeches, and sometimes dance floor lighting.",
    book: "6-9 months for wedding Saturdays; 1-3 months for parties and corporate events.",
    ask: ["How much power do you need, and where?", "Do you bring microphones and speakers for the ceremony?", "What size dance floor and stage do you need?"],
    overlap: "Share the dance floor size and power needs, and ask whether you need a generator outdoors.",
    link: { href: "/rentals/dance-floors-staging", label: "Dance floors and staging" },
  },
  {
    id: "florist", name: "Florist and decor", icon: "arch", monthsOut: 5,
    does: "Centerpieces, arches, aisle decor and installations.",
    book: "4-8 months out for weddings; 1-2 months for parties.",
    ask: ["Do you supply vases, arches and candle holders, or should we rent them?", "When do you need access to set up?", "Do you collect your items after the event?"],
    overlap: "Arches, flower walls and candle holders can come from the florist or a rental company. Decide who brings what.",
    link: { href: "/rentals/decor", label: "Decor rentals" },
  },
  {
    id: "officiant", name: "Officiant", icon: "heart", monthsOut: 6,
    does: "Leads the ceremony; for weddings, also handles the license paperwork with you.",
    book: "4-9 months out.",
    ask: ["Will you attend the rehearsal?", "Do you need a microphone or a table?"],
    overlap: "Ceremony chairs, an aisle runner and a small signing table are easy to forget.",
  },
  {
    id: "cake", name: "Cake and desserts", icon: "plate", monthsOut: 4,
    does: "Cake, dessert table or sweets bar.",
    book: "3-6 months out.",
    ask: ["Do you bring stands and serving pieces?", "Does the cake need refrigeration or a shaded table?"],
    overlap: "You'll usually need a dedicated round table, a linen and cake plates.",
  },
  {
    id: "bartender", name: "Bar service", icon: "glass", monthsOut: 3,
    does: "Licensed bartenders, sometimes with the bar itself and glassware.",
    book: "2-4 months out; your caterer or venue may already cover it.",
    ask: ["Are you licensed and insured to serve?", "Do you bring a bar, ice and glassware?", "How many bartenders per guest?"],
    overlap: "Portable bars, coolers and glassware are common rental add-ons.",
    link: { href: "/rentals/glassware", label: "Glassware rentals" },
  },
  {
    id: "lighting", name: "Lighting", icon: "light", monthsOut: 3,
    does: "Uplighting, string lights, pin spots and outdoor lighting.",
    book: "2-4 months out. Often supplied by the DJ or the rental company.",
    ask: ["What power do the lights need?", "Who installs and who takes down?"],
    overlap: "If your event runs past dark, plan lights for paths, the bar and restrooms too.",
    link: { href: "/rentals/lighting", label: "Lighting rentals" },
  },
  {
    id: "photobooth", name: "Photo booth and entertainment", icon: "games", monthsOut: 2,
    does: "Photo booths, games, bounce houses, performers.",
    book: "1-3 months out.",
    ask: ["How much floor space and power?", "Is an attendant included?"],
    overlap: "Many booths and games are rentable items with delivery.",
    link: { href: "/rentals/photo-booths", label: "Photo booth rentals" },
  },
  {
    id: "permits", name: "Permits and the city", icon: "shield", monthsOut: 2,
    does: "Park, block party, tent and fire permits.",
    book: "At least 30-60 days out; some parks and towns need more.",
    ask: ["Does the park district or town need a permit for our size?", "Are tents, amplified sound or alcohol allowed?"],
    overlap: "Tents over a certain size and outdoor events in parks usually need paperwork before rentals can be delivered.",
    link: { href: "/blog/chicago-tent-permit", label: "Chicago tent permits" },
  },
];

export type Occasion = { id: string; name: string; essential: RoleId[]; often: RoleId[] };

export const occasions: Occasion[] = [
  { id: "wedding", name: "Wedding", essential: ["venue", "caterer", "photographer", "rentals", "dj", "florist", "officiant"], often: ["planner", "tent", "cake", "bartender", "lighting", "photobooth"] },
  { id: "indian-wedding", name: "Indian wedding or sangeet", essential: ["venue", "caterer", "rentals", "dj", "photographer", "florist"], often: ["planner", "tent", "lighting", "photobooth", "bartender"] },
  { id: "quinceanera", name: "Quinceañera", essential: ["venue", "caterer", "rentals", "dj", "photographer"], often: ["florist", "cake", "lighting", "photobooth", "planner"] },
  { id: "corporate", name: "Corporate event or gala", essential: ["venue", "caterer", "rentals", "dj"], often: ["planner", "lighting", "photographer", "bartender", "florist"] },
  { id: "backyard", name: "Backyard party", essential: ["rentals", "tent", "caterer"], often: ["bartender", "lighting", "dj", "photobooth", "permits"] },
  { id: "graduation", name: "Graduation open house", essential: ["rentals", "tent", "caterer"], often: ["photobooth", "cake", "permits"] },
  { id: "shower", name: "Bridal or baby shower", essential: ["venue", "caterer", "rentals"], often: ["florist", "cake", "photographer"] },
  { id: "park", name: "Park or community event", essential: ["permits", "rentals", "tent"], often: ["caterer", "dj", "photobooth", "lighting"] },
];
