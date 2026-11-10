// Content for the "[item] rental [area]" landing pages (/party-rentals/[area]/[category]) and the
// "[item] rental cost" pages (/rental-cost/[category]). Prices are never written here: every number on
// those pages is computed from the catalog (our prices) at build time.
//
// Search intent these pages answer (see docs/seo-data/search-intent-map.md):
//   "tent rental naperville", "table and chair rentals evanston", "bounce house rental aurora",
//   "party rentals oak park", "event rentals near me", "how much does a tent rental cost in chicago".

import type { CategoryId } from "./catalog-products";

export const LOCAL_RENTALS_UPDATED = "2026-11-03";

/** The kind of place a celebration happens, derived from each area's settings list. */
export type SettingKind = "backyard" | "park" | "barn" | "hall" | "venue" | "rooftop";

export function settingKind(name: string): SettingKind {
  const n = name.toLowerCase();
  if (/rooftop|deck|terrace|penthouse|high-rise/.test(n)) return "rooftop";
  if (/barn|farm|pasture|meadow/.test(n)) return "barn";
  if (/park|lakefront|beach|preserve|riverwalk|riverfront|river|606|zoo|arboretum|bluff|island|lake ellyn|nature/.test(n)) return "park";
  if (/backyard|yard|lawn|estate|garden|patio|driveway|home|house|greystone|subdivision|lot/.test(n)) return "backyard";
  if (/hall|church|chapel|synagogue|parish|community|school|fieldhouse|pavilion|cultural|congregation|sanctuar/.test(n)) return "hall";
  return "venue";
}

export type GuestRow = { guests: number; label: string; qty: string };

export type LocalCategory = {
  id: CategoryId;
  /** URL segment under /party-rentals/[area]/ */
  slug: string;
  /** "Tent rentals" (H1 and titles) */
  label: string;
  /** "tent rental" (the search phrase) */
  phrase: string;
  /** Scene image slug from src/lib/scenes.ts */
  scene: string;
  /** One tip per setting kind: what changes for this category at that kind of place. */
  tips: Record<SettingKind, string>;
  /** How much of this category a guest count needs (rules of thumb, labelled as such on the page). */
  sizing: (guests: number) => string;
  sizingNote: string;
  /** When demand peaks and how far ahead to book. */
  booking: string;
  /** Extra local question for the FAQ, {area} is replaced with the area name. */
  localFaq: { q: string; a: string };
  /** Only 2-3 photographed, written-up products in this category (the rest of the catalog is
   * unphotographed vendor inventory rows). With prices hidden, a per-area page for this category
   * can't differ enough from area to area to avoid tripping near-duplicate detection, so these
   * categories skip /party-rentals/[area]/[category] entirely and point to the category hub instead. */
  thin?: boolean;
};

const GUESTS = [50, 100, 150, 200];
export const guestRows = (c: LocalCategory): GuestRow[] => GUESTS.map((g) => ({ guests: g, label: `${g} guests`, qty: c.sizing(g) }));

const tentFor = (g: number) => {
  const sqft = g * 13; // seated dinner with aisles, buffet and a small dance floor
  const sizes: [string, number][] = [["20x20", 400], ["20x30", 600], ["20x40", 800], ["30x40", 1200], ["30x60", 1800], ["40x60", 2400], ["40x80", 3200], ["40x100", 4000]];
  const pick = sizes.find(([, a]) => a >= sqft) ?? sizes[sizes.length - 1];
  return `${pick[0]} ft tent (about ${sqft.toLocaleString()} sq ft)`;
};
const floorFor = (g: number) => {
  const sqft = Math.round((g / 3) * 4.5); // a third of guests dancing at once, 4.5 sq ft each
  const side = Math.max(9, Math.ceil(Math.sqrt(sqft) / 3) * 3);
  return `${side}x${side} ft floor (${(side * side).toLocaleString()} sq ft)`;
};

export const localCategories: LocalCategory[] = [
  {
    id: "tables",
    slug: "tables",
    label: "Table rentals",
    phrase: "table rental",
    scene: "hero-tables",
    tips: {
      backyard: "Lawns are rarely level. Banquet tables with adjustable legs or a few shims keep plates from sliding, and 60-inch rounds fit better than long rows between trees.",
      park: "Park pavilions often provide picnic tables, so rent only what the permit allows you to add, and keep tables off root zones and paths.",
      barn: "Long farm tables suit barn beams and seat more guests per square foot than rounds. Check the floor: gravel and old boards need sturdy legs.",
      hall: "Halls usually supply basic 8-foot tables. Renting 60-inch rounds or farm tables changes the look without changing the room.",
      venue: "Venues set strict load-in windows. Folding rounds and banquet tables move fastest, and the venue's floor plan tells you exactly how many fit.",
      rooftop: "Rooftops limit weight and elevator size. Folding tables that fit in a freight elevator, plus a few highboys, work better than heavy farm tables.",
    },
    sizing: (g) => `${Math.ceil(g / 8)} x 60" rounds + ${Math.max(3, Math.ceil(g / 50) + 2)} service tables`,
    sizingNote: "Guest tables at 8 per 60-inch round, plus tables for the cake, gifts, DJ and one buffet table per 50 guests.",
    booking: "Tables rarely sell out, but farm tables and specialty shapes do on summer Saturdays, so book 2 to 3 months ahead for May to October.",
    localFaq: {
      q: "Do you rent tables and chairs together in {area}?",
      a: "Yes. Add tables, chairs and linens to one quote and we book them together, so they arrive on the same truck for {area} and the linens are sized to the tables you chose.",
    },
  },
  {
    id: "tents",
    slug: "tents",
    label: "Tent rentals",
    phrase: "tent rental",
    scene: "tent-reception-dusk",
    tips: {
      backyard: "Before anything else, mark sprinkler heads, septic fields and buried utilities. Stake tents need soft ground and clearance; frame tents can sit on patios with weights.",
      park: "Most park districts limit staking and require approval for tents, so a weighted frame tent or a reserved pavilion is often the simpler route.",
      barn: "A tent next to the barn adds a dining or dance space. Gravel lots need frame tents with ballast instead of stakes.",
      hall: "Halls rarely need a tent, but an entry canopy keeps guests dry between the parking lot and the door in spring and fall.",
      venue: "Venue courtyards and lots usually need a frame tent with water barrels or concrete weights, and the venue's approval of the layout first.",
      rooftop: "Rooftops almost never allow stakes and limit wind exposure. Small frame tents or market umbrellas with heavy bases are the usual answer.",
    },
    sizing: (g) => tentFor(g),
    sizingNote: "About 13 square feet per seated guest, which covers round tables, aisles, a buffet and a small dance floor. Add space for a band or lounge.",
    booking: "Tents are the first rental to sell out for June to September Saturdays. Book 3 to 6 months ahead, and confirm any permit before the install date.",
    localFaq: {
      q: "Do I need a permit for a tent in {area}?",
      a: "Many Chicago-area towns require a permit for tents above a certain size, and rules differ by town. Check with {area}'s building or permit office before you book; we can usually supply the tent specs the permit asks for.",
    },
  },
  {
    id: "linens",
    slug: "linens",
    label: "Linen rentals",
    phrase: "linen rental",
    scene: "hero-linens",
    tips: {
      backyard: "Floor-length linens hide folding tables but catch wind outdoors. Use clips or a lap-length cloth for breezy lawns.",
      park: "Picnic tables need fitted or lap-length cloths; floor-length linens drag on the ground and stain on grass.",
      barn: "Many barn tables look best bare with a runner. Rent napkins and runners and skip full cloths to save money.",
      hall: "Hall tables are usually plain plastic, so full floor-length linens make the biggest difference in this kind of room.",
      venue: "Venues often include white house linens. Renting colored or textured linens is the cheapest way to change the room.",
      rooftop: "Wind is the main problem on rooftops. Fitted spandex cloths and napkin weights keep everything in place.",
    },
    sizing: (g) => `${Math.ceil(g / 8) + 4} tablecloths + ${Math.ceil(g * 1.05)} napkins`,
    sizingNote: "One cloth per guest and service table, one napkin per guest plus 5% spares. A 120-inch round cloth reaches the floor on a 60-inch round.",
    booking: "Standard colors are easy to get; specialty fabrics and large napkin counts need 4 to 8 weeks, longer in June and October.",
    localFaq: {
      q: "Are linens delivered pressed in {area}?",
      a: "Rental linens arrive cleaned and pressed, usually folded or on hangers, and you return them used without washing. Setup crews can place them on tables if your quote includes setup in {area}.",
    },
  },
  {
    id: "dance-floors-staging",
    slug: "dance-floors",
    label: "Dance floor rentals",
    phrase: "dance floor rental",
    scene: "dance-party",
    tips: {
      backyard: "A dance floor on grass needs a level subfloor first, which adds to the price. A patio or driveway is often the cheapest base.",
      park: "Parks rarely allow a dance floor without a pavilion or permit, so check the rules before planning dancing on grass.",
      barn: "Barn boards can be uneven, and gravel never works for dancing. A portable floor gives a clean, level space by the band.",
      hall: "Most halls already have a hard floor; rent a white or black floor only for the look, or a small stage for the band.",
      venue: "Check the venue's floor plan for a built-in dance area. Many lofts need a rented floor to protect concrete or carpet.",
      rooftop: "Rooftop decks need weight and drainage checks before a floor goes down. Smaller interlocking panels are easier to bring up.",
    },
    sizing: (g) => floorFor(g),
    sizingNote: "About a third of guests dance at once, at roughly 4.5 square feet each. Weddings with a band may need more.",
    booking: "Floors are limited stock. For Saturdays from May to October, book 2 to 4 months ahead, and longer for LED or white floors.",
    localFaq: {
      q: "Can you lay a dance floor on grass in {area}?",
      a: "Yes, with a subfloor that levels the ground first, which adds cost and setup time. Tell us about the slope and surface at your {area} site and the partner prices the right base.",
    },
    thin: true,
  },
  {
    id: "games-kids",
    slug: "bounce-houses",
    label: "Bounce house and party game rentals",
    phrase: "bounce house rental",
    scene: "kids-party",
    tips: {
      backyard: "Measure the yard: most bounce houses need a flat space about 5 feet larger than the unit on each side, an outlet within 50 feet, and no overhead wires.",
      park: "Parks usually require permission for inflatables and often a generator, since there is no outlet nearby.",
      barn: "Inflatables need flat grass or a tarp-covered hard surface, not gravel. Keep them away from animals and machinery.",
      hall: "Indoor inflatables need ceiling height: check the clearance, since most units stand 13 to 16 feet tall.",
      venue: "Venues may require proof of insurance from the inflatable company and limit where units go; ask before you book.",
      rooftop: "Inflatables are rarely allowed on rooftops because of wind and weight. Tabletop and yard games are the better fit.",
    },
    sizing: (g) => (g <= 50 ? "1 bounce house or combo unit" : g <= 100 ? "1 combo unit + 2 yard games" : g <= 150 ? "2 inflatables + 3 yard games" : "2-3 inflatables + games for adults"),
    sizingNote: "Roughly one inflatable per 25 to 30 kids at a time, plus a few yard games for older guests. Adjust for the age mix.",
    booking: "Bounce houses sell out first for June graduation weekends and summer Saturdays. Book 3 to 6 weeks ahead, longer for water slides.",
    localFaq: {
      q: "Can I put a bounce house in my {area} backyard?",
      a: "Usually, if the yard has a flat space larger than the unit, power within about 50 feet and no overhead lines. Some {area} parks and HOAs have their own rules, so check before booking an inflatable for a shared space.",
    },
    thin: true,
  },
  {
    id: "photo-booths",
    slug: "photo-booths",
    label: "Photo booth rentals",
    phrase: "photo booth rental",
    scene: "hero-celebrations",
    tips: {
      backyard: "Outdoor booths need shade, power and a level spot out of direct sun. Evening parties need extra lighting.",
      park: "Parks rarely have power where you need it, so ask for a battery option or a generator in the quote.",
      barn: "Barns make good backdrops on their own. Pick an open-air booth so the beams show in the photos.",
      hall: "Halls usually have power along the walls. Put the booth near the dance floor, not the exit, so it gets used.",
      venue: "Venues may limit where the booth goes and how long the attendant stays. Check the load-in and power plan.",
      rooftop: "Wind and glare are the issues on rooftops. An enclosed booth or a covered corner works best.",
    },
    sizing: (g) => (g <= 150 ? "1 booth, 3-4 hours" : "1-2 booths or a 360 booth, 4 hours"),
    sizingNote: "One booth handles about 150 guests over three to four hours. Larger parties add a second booth or a 360 platform.",
    booking: "Popular booth types book 1 to 3 months ahead for wedding season and graduation weekends.",
    localFaq: {
      q: "Does a photo booth need power at my {area} venue?",
      a: "Most booths need one standard outlet nearby. For outdoor spots in {area} without power, ask for a battery-powered booth or add a quiet generator to the quote.",
    },
    thin: true,
  },
  {
    id: "lighting",
    slug: "lighting",
    label: "Event lighting rentals",
    phrase: "event lighting rental",
    scene: "cocktail-hour",
    tips: {
      backyard: "String lights between trees or poles turn a yard into a venue after dark. Plan power runs and keep cords off walkways.",
      park: "Park events usually end at dusk; if yours does not, battery lanterns and uplights avoid the need for power.",
      barn: "Barns are dark after sunset. String lights along the beams and a few uplights on the walls make the biggest change.",
      hall: "Hall lighting is often harsh. Uplights in your colors and dimmed overheads change the room more than any decor.",
      venue: "Check what the venue's house lighting can do first, then rent uplights or pin spots for the cake and centerpieces.",
      rooftop: "Rooftops need wind-rated fixtures and battery uplights where cords cannot run. Keep lights low to protect the view.",
    },
    sizing: (g) => `${Math.max(8, Math.ceil(g / 10))} uplights or ${Math.ceil(g * 1.2)} ft of string lights`,
    sizingNote: "About one uplight per 8 to 10 feet of wall, or string lights in rows 8 to 10 feet apart over the seating area.",
    booking: "Lighting is easier to get than tents, but book 4 to 8 weeks ahead for fall weddings, when sunset comes early.",
    localFaq: {
      q: "Can string lights be installed at my {area} home?",
      a: "Yes, if there are trees, poles or structures to hang them from, or the partner brings poles. Tell us the layout and where outlets are at your {area} site so power runs are planned before the install.",
    },
  },
  {
    id: "heating-cooling",
    slug: "heaters",
    label: "Patio heater and fan rentals",
    phrase: "patio heater rental",
    scene: "winter-tent",
    tips: {
      backyard: "Propane patio heaters need clearance from tent walls, trees and eaves. Plan one heater per 10 to 12 guests on a cold night.",
      park: "Many parks restrict open-flame and propane heaters, so ask the park district before you rely on them.",
      barn: "Old barns get cold and drafty in spring and fall. Forced-air tent heaters work better than patio heaters in large spaces.",
      hall: "Halls are climate controlled, but outdoor smoking or cocktail areas still benefit from one or two heaters.",
      venue: "Venues often have their own fire rules for propane. Electric heaters or forced-air units outside the space may be required.",
      rooftop: "Rooftops get windy and cold quickly after sunset. Heaters rated for wind, with weighted bases, are a must.",
    },
    sizing: (g) => `${Math.ceil(g / 12)} patio heaters (or 1 tent heater per 800 sq ft)`,
    sizingNote: "About one patio heater per 10 to 12 guests outdoors in cool weather. Tents use forced-air heaters sized to the tent.",
    booking: "Heaters run short on cold October and November weekends. Book 4 to 6 weeks ahead for fall events, and order propane refills with them.",
    localFaq: {
      q: "When do you need patio heaters for an outdoor event in {area}?",
      a: "In the Chicago area, evenings below about 60 degrees, which is common from late September through May. Book heaters for any outdoor event in {area} after sunset in spring or fall.",
    },
    thin: true,
  },
  {
    id: "dinnerware",
    slug: "dinnerware",
    label: "Dinnerware and plate rentals",
    phrase: "dinnerware rental",
    scene: "hero-dinnerware",
    tips: {
      backyard: "At home, rental china means no dishwashing: plates go back scraped but unwashed. Plan a spot for the return crates.",
      park: "Parks rarely suit real china because of breakage and cleanup; consider rentals only for a seated dinner under a pavilion.",
      barn: "Stoneware and gold-rim plates both look good in barns. Ask whether the barn has a prep area for the caterer.",
      hall: "Halls often stock basic plates. Renting chargers and gold-rim plates upgrades the table at a modest cost.",
      venue: "Many venues and caterers include plates. Rent only what they don't have, such as chargers or dessert plates.",
      rooftop: "Rooftops need sturdy plates and a plan for clearing them quickly; lighter melamine works for casual events.",
    },
    sizing: (g) => `${Math.ceil(g * 1.05)} each of dinner, salad and dessert plates`,
    sizingNote: "One of each plate per guest plus 5% spares, more for a buffet where guests take a fresh plate.",
    booking: "Common patterns are easy to get; large counts of specialty patterns need 4 to 8 weeks.",
    localFaq: {
      q: "Do I have to wash rental plates after my {area} event?",
      a: "No. Rental plates go back scraped of food but unwashed, packed in the crates they arrived in. The partner collects them from your {area} venue at pickup.",
    },
  },
  {
    id: "concessions",
    slug: "concessions",
    label: "Popcorn, cotton candy and concession rentals",
    phrase: "concession machine rental",
    scene: "backyard-birthday",
    tips: {
      backyard: "Concession machines need a level table and an outlet; popcorn and cotton candy machines each use a standard circuit, so avoid sharing it with a bounce house blower.",
      park: "Parks without power need a generator for concession machines, and some do not allow food stands without approval.",
      barn: "Barns with limited outlets need a power check before adding machines that draw a lot of current.",
      hall: "Halls may limit open food stations or require them in the kitchen area; ask before you plan a cotton candy station.",
      venue: "Venues often have exclusive caterers, so check whether outside concession machines are allowed.",
      rooftop: "Wind makes cotton candy nearly impossible on rooftops; popcorn and slushie machines work better.",
    },
    sizing: (g) => (g <= 100 ? "1 machine + supplies for 100 servings" : `1-2 machines + supplies for ${Math.ceil(g / 50) * 50} servings`),
    sizingNote: "One machine serves a party of 100 to 150 comfortably. Order supplies by servings, not by machine.",
    booking: "Machines are easy to book most of the year; graduation and fair weekends in June need 2 to 4 weeks' notice.",
    localFaq: {
      q: "Are supplies included with concession rentals in {area}?",
      a: "Usually not. Popcorn kernels, sugar floss, cones and cups are priced per serving on the same quote, so you can order the amount your {area} party needs.",
    },
  },
];

export const getLocalCategory = (slug: string) => localCategories.find((c) => c.slug === slug);
export const localCategoryPath = (areaSlug: string, c: Pick<LocalCategory, "slug">) => `/party-rentals/${areaSlug}/${c.slug}`;
export const areaRentalsPath = (areaSlug: string) => `/party-rentals/${areaSlug}`;

// ---------- rental cost pages ----------

export type CostCategory = {
  id: CategoryId;
  /** "How much does it cost to rent a tent in Chicago?" */
  question: string;
  /** What moves the price, 3-4 drivers. */
  drivers: { title: string; body: string }[];
  /** Ways to keep the bill down. */
  savings: string[];
};

export const costCategories: CostCategory[] = [
  {
    id: "chairs",
    question: "How much does it cost to rent chairs in Chicago?",
    drivers: [
      { title: "Style", body: "Folding chairs are the cheapest; Chiavari, cross-back and ghost chairs cost three to four times more; thrones and velvet chairs more again." },
      { title: "Quantity", body: "Price is per chair, so the guest count drives the total. Ceremony and reception sets double it unless one set is flipped." },
      { title: "Labor", body: "Setup, a ceremony flip and stairs are quoted separately and can add a meaningful share to the bill." },
    ],
    savings: ["Use a premium chair only at the head table", "Flip ceremony chairs instead of renting two sets", "Choose a weekday or winter date"],
  },
  {
    id: "tables",
    question: "How much does it cost to rent tables in Chicago?",
    drivers: [
      { title: "Shape and material", body: "Folding banquet tables and plastic rounds are cheapest; wood farm tables and specialty shapes cost several times more." },
      { title: "Count", body: "Guest tables plus service tables for cake, gifts, DJ and buffet, which people often forget to budget." },
      { title: "Linens", body: "Tables are priced without linens, which roughly double the cost of a dressed table." },
    ],
    savings: ["Mix a few farm tables with standard rounds", "Use venue tables for service areas", "Skip floor-length linens on farm tables"],
  },
  {
    id: "linens",
    question: "How much does it cost to rent tablecloths and napkins in Chicago?",
    drivers: [
      { title: "Fabric", body: "Polyester is the cheapest; satin, sequin, velvet and textured fabrics cost more per cloth." },
      { title: "Size", body: "Floor-length cloths cost more than lap-length, and large rectangles more than rounds." },
      { title: "Napkins", body: "Napkins are priced each, so a large guest count adds up even at low unit prices." },
    ],
    savings: ["Use specialty fabric only for the head and cake tables", "Choose runners on farm tables instead of full cloths", "Ask for the venue's house linens"],
  },
  {
    id: "dinnerware",
    question: "How much does it cost to rent plates and dinnerware in Chicago?",
    drivers: [
      { title: "Pattern", body: "Plain white china is the cheapest; gold-rim, colored and specialty patterns cost more per piece." },
      { title: "Pieces per guest", body: "Dinner, salad, bread and dessert plates plus chargers quickly multiply the per-guest cost." },
      { title: "Minimums", body: "Many rental houses rent china in racks or dozens, so counts round up." },
    ],
    savings: ["Rent chargers only and use the caterer's plates", "Serve dessert on the salad plate", "Choose a buffet with fewer plate types"],
  },
  {
    id: "flatware",
    question: "How much does it cost to rent flatware in Chicago?",
    drivers: [
      { title: "Finish", body: "Stainless is the cheapest; gold, matte black and specialty finishes cost more." },
      { title: "Pieces per setting", body: "Dinner fork, salad fork, knife, spoon and dessert fork can mean five pieces per guest." },
      { title: "Counts", body: "Flatware is often rented by the dozen, so totals round up." },
    ],
    savings: ["Drop the salad fork for family style service", "Use gold flatware only at the head table", "Confirm what the caterer already brings"],
  },
  {
    id: "glassware",
    question: "How much does it cost to rent glassware in Chicago?",
    drivers: [
      { title: "Glass type", body: "Basic wine and water glasses are the cheapest; coupes, colored and crystal glasses cost more." },
      { title: "Glasses per guest", body: "A full bar can need two to three glasses per guest, and a toast adds a flute each." },
      { title: "Racks", body: "Glasses come in racks of 16 to 36, so counts round up to full racks." },
    ],
    savings: ["Use one all-purpose wine glass", "Skip flutes and toast with what guests hold", "Ask whether the bartender brings glassware"],
  },
  {
    id: "catering-equipment",
    question: "How much does it cost to rent catering equipment in Chicago?",
    drivers: [
      { title: "Chafers and fuel", body: "Chafing dishes are priced each, and fuel cans or sterno are extra per hour of service." },
      { title: "Serving pieces", body: "Trays, bowls and utensils are low-cost individually but add up for a large buffet." },
      { title: "Heavy equipment", body: "Grills, warmers and coffee urns cost more and sometimes need delivery by a larger truck." },
    ],
    savings: ["Ask what the caterer already brings", "Plate dinner to reduce chafers", "Combine pickup with other rentals"],
  },
  {
    id: "tents",
    question: "How much does it cost to rent a tent in Chicago?",
    drivers: [
      { title: "Size and type", body: "Pop-up canopies are the cheapest; frame, pole and sailcloth tents cost far more as size increases." },
      { title: "Install", body: "Most tent prices include installation, but surfaces, weights instead of stakes and permits change the quote." },
      { title: "Add-ons", body: "Sidewalls, lighting, flooring and heaters often add a large share on top of the tent itself." },
    ],
    savings: ["Size the tent to the seated layout, not the guest list", "Book an off-peak date", "Skip sidewalls in summer unless rain is forecast"],
  },
  {
    id: "dance-floors-staging",
    question: "How much does it cost to rent a dance floor in Chicago?",
    drivers: [
      { title: "Size", body: "Floors are priced by section or square foot, so a larger guest count means a larger floor." },
      { title: "Finish", body: "Wood-look floors are the cheapest; white, black, LED and mirror finishes cost more." },
      { title: "Subfloor", body: "Grass and uneven ground need a subfloor first, which adds cost and setup time." },
    ],
    savings: ["Size for a third of guests dancing at once", "Lay the floor on a patio instead of grass", "Use the venue's built-in floor"],
  },
  {
    id: "lighting",
    question: "How much does event lighting rental cost in Chicago?",
    drivers: [
      { title: "Fixture count", body: "Uplights are priced each, string lights by length, so room size drives cost." },
      { title: "Labor", body: "Installation, especially overhead string lights in tents and barns, is often a large part of the price." },
      { title: "Power", body: "Outdoor setups may need a generator or extra cords." },
    ],
    savings: ["Light only the walls guests see", "Use battery uplights to skip cord runs", "Combine lighting install with the tent install"],
  },
  {
    id: "heating-cooling",
    question: "How much does it cost to rent patio heaters in Chicago?",
    drivers: [
      { title: "Heater type", body: "Propane patio heaters are the cheapest; forced-air tent heaters cost more but heat large spaces." },
      { title: "Fuel", body: "Propane tanks or diesel are usually extra and depend on how many hours the heaters run." },
      { title: "Count", body: "Roughly one patio heater per 10 to 12 guests outdoors on a cool night." },
    ],
    savings: ["Close tent sidewalls to hold heat", "Run heaters only after sunset", "Choose a tent heater over many patio heaters for large tents"],
  },
  {
    id: "lounge",
    question: "How much does it cost to rent lounge furniture in Chicago?",
    drivers: [
      { title: "Piece type", body: "Sofas and chesterfields cost the most; ottomans, cubes and side tables less." },
      { title: "Groupings", body: "A lounge vignette usually needs a sofa, two chairs, a coffee table and a rug." },
      { title: "Handling", body: "Heavy upholstered pieces need more crew and careful delivery, which affects labor." },
    ],
    savings: ["Build one lounge vignette, not several", "Mix rented pieces with venue furniture", "Choose cubes and ottomans for flexible seating"],
  },
  {
    id: "decor",
    question: "How much does it cost to rent event decor in Chicago?",
    drivers: [
      { title: "Piece size", body: "Backdrops, flower walls and arches cost more than tabletop decor." },
      { title: "Setup", body: "Large decor often needs installation, which is priced on top." },
      { title: "Quantity", body: "Centerpiece pieces are cheap each but multiply by the table count." },
    ],
    savings: ["Rent one statement backdrop instead of many pieces", "Reuse ceremony decor at the reception", "Choose tabletop decor that does double duty"],
  },
  {
    id: "games-kids",
    question: "How much does it cost to rent a bounce house in Chicago?",
    drivers: [
      { title: "Unit size", body: "Small bounce houses are the cheapest; combos with slides, water slides and obstacle courses cost more." },
      { title: "Hours", body: "Most prices cover a set rental window; overnight or extra hours cost more." },
      { title: "Setup site", body: "Generators, tarps for hard surfaces and long walks from the truck can add fees." },
    ],
    savings: ["Pick one combo unit instead of two inflatables", "Choose a weekday or a Sunday", "Add yard games, which cost far less"],
  },
  {
    id: "concessions",
    question: "How much does it cost to rent a popcorn or cotton candy machine in Chicago?",
    drivers: [
      { title: "Machine", body: "Popcorn and cotton candy machines are the cheapest; slushie and specialty machines cost more." },
      { title: "Supplies", body: "Supplies are usually priced per serving on top of the machine." },
      { title: "Attendant", body: "An attendant to run the machine adds labor per hour." },
    ],
    savings: ["Order supplies for the real headcount", "Run the machine yourself if allowed", "Bundle with other party rentals for one delivery"],
  },
  {
    id: "photo-booths",
    question: "How much does it cost to rent a photo booth in Chicago?",
    drivers: [
      { title: "Booth type", body: "Open-air booths are usually the cheapest; mirror and 360 booths cost more." },
      { title: "Hours", body: "Packages are priced by the hour, usually with a minimum of two to three hours." },
      { title: "Prints and extras", body: "Unlimited prints, custom templates, props and an attendant are often included or tiered." },
    ],
    savings: ["Book three hours during the reception's busiest part", "Choose digital sharing over prints", "Skip extra props"],
  },
  {
    id: "av-sound",
    question: "How much does it cost to rent sound and AV equipment in Chicago?",
    drivers: [
      { title: "System size", body: "A single speaker and mic is cheap; a full PA, projectors and screens cost much more." },
      { title: "Technician", body: "An on-site technician adds hourly labor but avoids problems during speeches." },
      { title: "Power", body: "Outdoor sound may need a generator." },
    ],
    savings: ["Use the venue's built-in system", "Rent a speaker and mic only for speeches", "Combine AV with the DJ's equipment"],
  },
  {
    id: "restrooms-power",
    question: "How much does it cost to rent portable restrooms and generators in Chicago?",
    drivers: [
      { title: "Unit type", body: "Standard portable toilets are the cheapest; restroom trailers cost several times more." },
      { title: "Count and hours", body: "Plan about one unit per 50 to 75 guests for a four-hour event, more if alcohol is served." },
      { title: "Generator size", body: "Generators are priced by output; tents with lights, heaters and catering need larger units." },
    ],
    savings: ["Use the home's bathrooms for small parties", "Size the generator to the real load", "Book units with the tent for one delivery"],
  },
  {
    id: "fencing-crowd-control",
    question: "How much does it cost to rent stanchions, barricades and fencing in Chicago?",
    drivers: [
      { title: "Type", body: "Velvet ropes and stanchions are priced each; barricades and temporary fence by the panel or foot." },
      { title: "Length", body: "The length of the line or perimeter drives the count." },
      { title: "Install", body: "Temporary fencing needs installation and removal, priced on top." },
    ],
    savings: ["Use stanchions only at the entrance", "Combine with the venue's own barriers", "Book fencing with other rentals for one delivery"],
  },
];

export const getCostCategory = (id: string) => costCategories.find((c) => c.id === id);
export const costPath = (id: string) => `/rental-cost/${id}`;

// Areas that get /party-rentals pages: only those with their own venue settings, delivery notes and
// story, so every page has local content (thinner area entries keep just their chair page).
import { locations } from "./geo";
export const localAreas = locations.filter((l) => (l.settings?.length ?? 0) >= 2 && (l.logistics?.length ?? 0) >= 2 && (l.story?.length ?? 0) >= 1);
