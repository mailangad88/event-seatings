// Every rental item the site offers, independent of which vendor supplies it.
// `id` is the canonical slug shared with the 3D renders (public/rentals/<folder>/<id>.webp)
// and the quote builder. `estimate` is a Chicago-market vendor price used only when no
// partner vendor publishes a price for the item (see src/data/catalog.ts).

export type CategoryId =
  | "chairs"
  | "tables"
  | "linens"
  | "dinnerware"
  | "flatware"
  | "glassware"
  | "catering-equipment"
  | "tents"
  | "dance-floors-staging"
  | "lighting"
  | "heating-cooling"
  | "lounge"
  | "decor"
  | "games-kids"
  | "concessions"
  | "photo-booths"
  | "av-sound"
  | "restrooms-power"
  | "fencing-crowd-control";

export type Category = {
  id: CategoryId;
  /** Display name, also the `category` string on catalog items. */
  name: string;
  /** Folder under public/rentals/ where renders live. */
  imageFolder: string;
  /** Short line for cards. */
  blurb: string;
  /** Answer-first intro paragraph for the category page. */
  intro: string;
  /** How to work out quantities, shown as a visual step list. */
  planning: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
};

export type Product = {
  id: string;
  category: CategoryId;
  name: string;
  specs: string;
  unit: string;
  description: string;
  /** Suggested quantity per guest for the quote builder (0 = not guest-driven). */
  perGuest: number;
  minQty?: number;
  /** Estimated Chicago-market vendor price (USD per unit, the customer sees the same price; no markup). */
  estimate: number;
  /** Link to the richer chair page in src/data/chairs.ts, when one exists. */
  chairSlug?: string;
  keywords: string[];
};

export const categories: Category[] = [
  {
    id: "chairs",
    name: "Chairs",
    imageFolder: "chairs",
    blurb: "Chiavari, cross-back, ghost, folding and kids' chairs",
    intro:
      "Event chair rentals in Chicago run from about $3 for a white folding chair to $10-16 for Chiavari, cross-back and ghost chairs, with delivery and setup quoted on top. Plan one chair per guest plus 3-5% spares, and pick the style that matches your tables and venue.",
    planning: [
      { title: "Count guests", body: "One chair per seated guest, plus 3-5% spares for vendors and late RSVPs." },
      { title: "Split ceremony and reception", body: "If the ceremony and reception are in different spaces with no flip time, you need two sets." },
      { title: "Match the table", body: "A 60\" round seats 8 Chiavari chairs or 10 folding chairs. A 72\" round seats 10-12." },
      { title: "Add cushions", body: "Chiavari and cross-back chairs usually include or rent a seat pad; confirm the color." },
    ],
    faqs: [
      { q: "How much does it cost to rent chairs in Chicago?", a: "Basic white folding chairs rent for roughly $3-4 each, padded folding chairs about $4, and Chiavari, cross-back or ghost chairs about $10-16 each. Delivery, setup and pickup are usually quoted separately and depend on distance, stairs and timing." },
      { q: "How many chairs fit at a 60-inch round table?", a: "Eight chairs fit comfortably and ten fit snugly. Chiavari chairs are narrow, so ten Chiavari chairs at a 60\" round still leave elbow room; for wider chairs like cross-back, plan eight." },
      { q: "Do I need separate chairs for the ceremony and reception?", a: "Only if both are set at the same time. If the ceremony chairs can be moved during cocktail hour, one set works and you pay a flip fee instead of a second rental." },
      { q: "Are chair cushions included?", a: "It varies by vendor and chair. We list what is included on each item and price the cushion separately when it is not." },
    ],
  },
  {
    id: "tables",
    name: "Tables",
    imageFolder: "tables",
    blurb: "Round, banquet, farm, cocktail and sweetheart tables",
    intro:
      "Most Chicago events use 60\" round tables (seats 8-10) or 8-foot banquet tables (seats 8-10), which rent for about $10-15 each. Add one cocktail table for every 8-10 guests during cocktail hour and a few 6' or 8' tables for gifts, cake, DJ and buffet.",
    planning: [
      { title: "Guest tables", body: "Divide your guest count by 8 for 60\" rounds or by 10 for 72\" rounds, and round up." },
      { title: "Service tables", body: "Plan 1 for gifts and cards, 1 for cake, 1 for the DJ, and 1 per 50 guests for a buffet." },
      { title: "Cocktail tables", body: "One highboy per 8-10 guests standing during cocktail hour." },
      { title: "Check the floor plan", body: "Allow about 10-12 sq ft per seated guest including aisles; we sketch this on the free planning call." },
    ],
    faqs: [
      { q: "How many people sit at an 8-foot banquet table?", a: "Eight to ten: four on each long side and one on each end if you do not need the ends clear. For buffet use, an 8' table holds about 6-8 chafing dishes." },
      { q: "What size tablecloth fits a 60-inch round table?", a: "A 120\" round linen falls to the floor at standard 30\" table height. A 90\" round gives a lap-length drop of about 15 inches." },
      { q: "Round tables or long banquet tables?", a: "Rounds make conversation easy and fit more guests in square rooms. Long banquet or farm tables feel communal and photograph well in barns, tents and lofts. Many couples mix both." },
      { q: "Do table rentals include linens?", a: "Usually not. Linens are priced separately; the quote builder suggests the right size for each table you add." },
    ],
  },
  {
    id: "linens",
    name: "Linens",
    imageFolder: "linens",
    blurb: "Tablecloths, runners, napkins, overlays and chair sashes",
    intro:
      "Table linens in Chicago rent for about $10-20 per polyester tablecloth, $25-45 for sequin or specialty fabrics, and about $1 per cloth napkin. Order linens by table size: 120\" rounds for 60\" tables, 132\" rounds for 72\" tables, and 90\"x156\" for 8' banquet tables to reach the floor.",
    planning: [
      { title: "Match each table", body: "Floor-length cloths look formal; lap-length cloths are cheaper and fine for casual events." },
      { title: "One napkin per guest", body: "Add 5% spares, plus cocktail napkins if you are serving passed appetizers." },
      { title: "Don't forget service tables", body: "Gift, cake, DJ and buffet tables need linens too; they show up in photos." },
      { title: "Accent layers", body: "Runners, overlays and chair sashes add color without replacing every tablecloth." },
    ],
    faqs: [
      { q: "What size tablecloth do I need for an 8-foot table?", a: "A 90\"x156\" cloth reaches the floor on an 8' x 30\" banquet table. A 90\"x132\" cloth gives a lap-length drop, and 60\"x120\" just covers the top." },
      { q: "Are linen rentals cleaned and pressed?", a: "Yes. Rental linens arrive laundered and pressed. Most vendors ask you to shake out food and return them dry; wet or stained returns can carry a fee." },
      { q: "Should I rent napkins or buy them?", a: "Rental cloth napkins cost about $0.75-1.25 each including laundering, which is usually cheaper than buying and cleaning 150 napkins yourself." },
      { q: "Can I mix linen colors?", a: "Yes. A neutral base cloth with a colored runner or overlay is the most budget-friendly way to bring in your palette." },
    ],
  },
  {
    id: "dinnerware",
    name: "Dinnerware",
    imageFolder: "tableware",
    blurb: "Chargers, dinner and salad plates, bowls, cups and saucers",
    intro:
      "Rental dinnerware in Chicago costs about $0.50-1.00 per plate and $1.50-3.00 per charger, and arrives racked so it goes straight back dirty. Plan one of each plate per guest per course, plus 10% spares.",
    planning: [
      { title: "List the courses", body: "Salad, entree, dessert and bread each need their own plate per guest." },
      { title: "Add a charger", body: "Chargers sit under each place setting and set the color story; they are removed before the entree." },
      { title: "Plan for buffets", body: "Buffets need about 1.5 dinner plates per guest because people go back for seconds." },
      { title: "Coffee and dessert", body: "Add cups and saucers for about 60% of guests if coffee is served." },
    ],
    faqs: [
      { q: "Do I have to wash rental dishes before returning them?", a: "Most Chicago rental companies only ask you to scrape food and put dishes back in their racks. They wash them; some add a fee if dishes come back with food left on." },
      { q: "How many plates do I need for a wedding?", a: "For a plated dinner, one dinner plate, one salad plate and one dessert plate per guest plus 10% spares. For a buffet, plan 1.5 dinner plates per guest." },
      { q: "Are chargers worth it?", a: "Chargers are the cheapest way to make a table look finished in photos, at about $2 per guest. Gold, silver and glass beaded chargers are the most requested." },
    ],
  },
  {
    id: "flatware",
    name: "Flatware",
    imageFolder: "tableware",
    blurb: "Forks, knives and spoons in silver and gold finishes",
    intro:
      "Flatware rents for about $0.50-0.75 per piece for classic stainless and $1.25-2.00 per piece for gold or matte black. A typical plated dinner uses four pieces per guest: dinner fork, salad fork, knife and teaspoon.",
    planning: [
      { title: "Pieces per guest", body: "Plated dinner: 4 pieces. Buffet: 3 pieces. Dessert only: 1 fork or spoon." },
      { title: "Add spares", body: "Add 10% for drops and for the caterer's service." },
      { title: "Match finishes", body: "Gold flatware pairs with gold chargers and Chiavari chairs; stainless suits everything." },
    ],
    faqs: [
      { q: "How much flatware do I need per guest?", a: "Four pieces for a plated dinner (dinner fork, salad fork, dinner knife, teaspoon), plus a dessert fork if dessert is plated separately." },
      { q: "Does my caterer supply flatware?", a: "Some caterers include basic flatware; many charge extra or expect you to rent it. Ask your caterer what is included before you order." },
    ],
  },
  {
    id: "glassware",
    name: "Glassware",
    imageFolder: "tableware",
    blurb: "Goblets, wine glasses, flutes and bar glasses",
    intro:
      "Rental glassware in Chicago costs about $0.60-1.00 per glass and arrives in racks of 16-36. For a wedding, plan one water goblet and one wine glass per guest, champagne flutes for the toast, and bar glasses at about 1.5 per guest for a full bar.",
    planning: [
      { title: "At the table", body: "One water goblet and one wine glass per guest." },
      { title: "Toast", body: "One champagne flute per guest, or skip it and toast with what's poured." },
      { title: "Bar", body: "Rocks and highball glasses at about 1.5 per guest for a 4-5 hour open bar." },
      { title: "Order by the rack", body: "Glasses come in racks, so round up to the nearest full rack." },
    ],
    faqs: [
      { q: "How many glasses do I need for an open bar?", a: "Plan about 1.5-2 bar glasses per guest for a four-hour reception, split between rocks and highball glasses, because bartenders swap glasses rather than refill used ones." },
      { q: "Is renting glassware cheaper than plastic cups?", a: "Quality plastic costs about $0.30-0.50 per cup, so real glass at $0.60-1.00 is close in price, looks far better and creates less waste." },
    ],
  },
  {
    id: "catering-equipment",
    name: "Catering equipment",
    imageFolder: "catering",
    blurb: "Chafing dishes, dispensers, coffee urns, trays and bars",
    intro:
      "Buffet and bar equipment in Chicago rents for about $15-25 per chafing dish, $20-30 per coffee urn and $100-200 for a portable bar. Plan one chafing dish per hot dish, about one per 15-20 guests on a buffet.",
    planning: [
      { title: "Hot food", body: "One full-size chafing dish per hot dish on the menu, with fuel for 2-3 hours." },
      { title: "Drinks", body: "One 3-gallon beverage dispenser serves about 45 cups; one 100-cup urn covers coffee for 100 guests." },
      { title: "Bar", body: "One bar and one bartender per 75-100 guests keeps lines short." },
    ],
    faqs: [
      { q: "Do chafing dish rentals include fuel?", a: "Usually not. Chafing fuel cans cost about $2-4 each and last 2-6 hours depending on type. We add them to your quote if you need them." },
      { q: "How many chafing dishes do I need for 100 guests?", a: "Typically 5-7: one per hot entree and side. Cold items can sit on platters and trays instead." },
    ],
  },
  {
    id: "tents",
    name: "Tents",
    imageFolder: "tents",
    blurb: "Frame, pole, sailcloth and clear-top tents with sidewalls",
    intro:
      "Tent rental in the Chicago area runs from about $125 for a 10x10 pop-up canopy to $700-900 for a 20x40 frame tent and $2,000+ for a 40x60 pole tent, installed. Allow about 10-12 sq ft per seated guest, so a 20x40 tent seats about 60-80 guests at round tables.",
    planning: [
      { title: "Size it", body: "Seated dinner: 10-12 sq ft per guest. Standing cocktail: 6-8 sq ft. Add room for dance floor, bar and buffet." },
      { title: "Check the ground", body: "Pole tents are staked into grass; frame tents can sit on pavement with water barrels or concrete weights." },
      { title: "Permits and utilities", body: "Many Chicago-area towns require a permit for tents over 400 sq ft, and staking needs a utility locate (JULIE in Illinois)." },
      { title: "Plan for weather", body: "Add sidewalls, heaters or fans; a Chicago spring or fall evening can drop below 50°F." },
    ],
    faqs: [
      { q: "How big a tent do I need for 100 guests?", a: "For a seated dinner, about 1,000-1,200 sq ft, which is a 30x40 tent, or a 40x40 if you add a dance floor and buffet. For a standing cocktail party, a 20x40 tent works." },
      { q: "Do I need a permit for a tent in Chicago?", a: "Chicago and many suburbs require a permit for tents over a set size (often 400 sq ft or larger) or with sidewalls. Most tent vendors handle the permit and the JULIE utility locate for you." },
      { q: "Can a tent go on a driveway or patio?", a: "Frame tents can, using water barrels or concrete ballast instead of stakes. Pole tents need to be staked into grass." },
      { q: "How far ahead should I book a tent?", a: "For May-October weekends, book 4-6 months ahead; popular sizes sell out first." },
    ],
  },
  {
    id: "dance-floors-staging",
    name: "Dance floors & staging",
    imageFolder: "floors",
    blurb: "Wood, white and LED dance floors, stage decks",
    intro:
      "A dance floor in Chicago rents for about $2-4 per square foot for wood or vinyl and $10-15 per square foot for LED, installed. Size it at about 3-4 sq ft per guest who will dance at once, which is usually a third to half of the room: a 12x12 floor suits 75-100 guests.",
    planning: [
      { title: "Who dances", body: "Assume 30-50% of guests are on the floor at peak." },
      { title: "Square footage", body: "Give each dancer about 3-4.5 sq ft: 15x15 for 150 guests, 18x18 for 200+." },
      { title: "Stage", body: "A 8x12 to 12x16 stage at 16-24\" high fits a band; DJs usually need only a table." },
    ],
    faqs: [
      { q: "What size dance floor do I need for 150 guests?", a: "About 15x15 feet (225 sq ft), assuming a third to half of guests dance at once. For 100 guests, 12x12 is the usual size." },
      { q: "Can you put a dance floor on grass?", a: "Yes, but grass needs a subfloor first so the panels sit level. Your tent vendor can quote leveled subflooring." },
    ],
  },
  {
    id: "lighting",
    name: "Lighting",
    imageFolder: "lighting",
    blurb: "Bistro string lights, uplights, chandeliers and drape",
    intro:
      "Event lighting in Chicago rents for about $25-40 per LED uplight, $50-100 per 100 feet of bistro string lights and $75-150 per chandelier. Uplights transform a room for the least money: 8-12 wash a ballroom, 16-24 a large hall.",
    planning: [
      { title: "Uplighting", body: "One uplight every 8-10 feet of wall, set to your color palette." },
      { title: "String lights", body: "For a tent, plan the tent length x 3-4 for a zig-zag or perimeter pattern." },
      { title: "Drape", body: "Pipe and drape is priced per running foot; use it to hide walls, storage or a kitchen door." },
    ],
    faqs: [
      { q: "How many uplights do I need?", a: "For a typical hotel ballroom, 12-16 uplights. Space them every 8-10 feet along the walls you want to color." },
      { q: "Are string lights safe in rain?", a: "Commercial rental bistro lights are rated for outdoor use. Vendors still route power through covered connections and GFCI outlets." },
    ],
  },
  {
    id: "heating-cooling",
    name: "Heating & cooling",
    imageFolder: "heating",
    blurb: "Patio heaters and forced-air tent heaters",
    intro:
      "Patio heaters rent for about $75-125 each in Chicago, and forced-air tent heaters for $200-350 per day plus fuel. Plan one patio heater per 15-20 guests on an open patio, or one forced-air heater per 800-1,000 sq ft of enclosed tent.",
    planning: [
      { title: "Open air", body: "One mushroom patio heater per 15-20 guests, spaced about 10-15 feet apart." },
      { title: "Tents", body: "Close the sidewalls and use forced-air heaters, about 1 per 800-1,000 sq ft." },
      { title: "Fuel", body: "Propane and diesel are usually billed separately by what you use." },
    ],
    faqs: [
      { q: "How many patio heaters do I need?", a: "About one per 15-20 guests in an open area. In a tent with sidewalls, one forced-air heater per 800-1,000 sq ft keeps it comfortable on a 40°F night." },
      { q: "Is propane included with heater rentals?", a: "Usually not. Propane is billed by the tank or by usage; we include it as a line on your quote." },
    ],
  },
  {
    id: "lounge",
    name: "Lounge",
    imageFolder: "lounge",
    blurb: "Sofas, armchairs and coffee tables for lounge areas",
    intro:
      "Lounge furniture rents for about $150-300 per sofa and $75-150 per armchair in Chicago. A lounge group of one sofa, two armchairs and a coffee table seats 5-6 guests; plan seating for 20-30% of guests in lounge areas at a cocktail-style event.",
    planning: [
      { title: "Groups", body: "Arrange in groups: sofa + 2 armchairs + coffee table + rug." },
      { title: "How many", body: "Lounge seating for 20-30% of guests at a cocktail party; 1-2 groups at a seated wedding." },
    ],
    faqs: [
      { q: "Can lounge furniture go outdoors?", a: "Most upholstered pieces are for dry, covered areas only. Ask for outdoor-rated pieces if you are not under a tent." },
      { q: "What is a lounge vignette?", a: "A styled seating group of sofa, chairs, rug, coffee table and decor. It gives guests a place to rest and makes a strong photo spot." },
    ],
  },
  {
    id: "decor",
    name: "Decor",
    imageFolder: "decor",
    blurb: "Ceremony arches, flower walls, marquee letters and candles",
    intro:
      "Decor rentals in Chicago include ceremony arches ($100-250), flower and greenery walls ($300-600), light-up marquee letters ($50-100 per letter) and candle holders ($1-5 each). Renting decor costs a fraction of buying and you do not have to store it after.",
    planning: [
      { title: "Ceremony", body: "One arch or backdrop as the focal point; add aisle decor every 2-3 rows." },
      { title: "Photo moment", body: "A flower wall or marquee letters near the bar gets used all night." },
      { title: "Candles", body: "Three to five candle holders per guest table; check venue rules on open flame." },
    ],
    faqs: [
      { q: "Is it cheaper to rent or buy wedding decor?", a: "Rent anything large or that you will not use again: arches, flower walls, marquee letters. Buying usually makes sense only for small items you will keep." },
      { q: "Do decor rentals include setup?", a: "Large pieces such as flower walls and marquee letters usually include delivery and setup. Small items are typically pick-up or delivered for you to place." },
    ],
  },
  {
    id: "games-kids",
    name: "Games & kids",
    imageFolder: "games",
    blurb: "Bounce houses, yard games and concession machines",
    intro:
      "Party extras in Chicago rent for about $175-300 per day for a bounce house, $25-60 per yard game and $75-125 for popcorn or cotton candy machines. They are the easiest way to keep kids and casual guests entertained at graduation parties, picnics and corporate family days.",
    planning: [
      { title: "Space", body: "A standard 15x15 bounce house needs about 20x20 of flat ground plus a power outlet within 50-100 feet." },
      { title: "Supervision", body: "Plan one adult supervising each inflatable at all times." },
      { title: "Supplies", body: "Concession machines need supplies (kernels, sugar, cones) priced per batch." },
    ],
    faqs: [
      { q: "How much is a bounce house rental in Chicago?", a: "About $175-300 for a day, including delivery and setup in most nearby suburbs. Combo units with a slide run $300-450." },
      { q: "Can a bounce house be set up on concrete?", a: "Yes, with sandbags instead of stakes and a tarp underneath. Grass is preferred." },
    ],
  },
  {
    id: "concessions",
    name: "Concessions",
    imageFolder: "concessions",
    blurb: "Popcorn, cotton candy, snow cone and dessert carts",
    intro:
      "Concession machines rent for about $75-125 a day in the Chicago area, with supplies priced per batch (popcorn kits, flavored sugar, syrup). One machine serves roughly 100-150 guests over a few hours, and styled carts for ice cream, coffee or charcuterie run $50-200.",
    planning: [
      { title: "Pick your treats", body: "Popcorn and cotton candy suit kids and school events; dessert and coffee carts suit weddings and corporate events." },
      { title: "Count servings", body: "Plan 1-2 servings per guest; one popcorn kit makes about 20-25 servings." },
      { title: "Power", body: "Most machines need a standard 15-20 amp outlet within 50 feet, or a generator outdoors." },
      { title: "Staffing", body: "Machines are self-serve with a volunteer; carts often include an attendant, so check what is included." },
    ],
    faqs: [
      { q: "How much does a popcorn machine rental cost in Chicago?", a: "About $75-125 for the day for a kettle machine with cart, plus about $1-2 per serving for supplies. Some rental companies bundle 50-100 servings." },
      { q: "Do concession machines need electricity?", a: "Yes. Popcorn, cotton candy and snow cone machines each need a dedicated standard outlet. Outdoors, plan an extension cord run or a small generator." },
      { q: "Are supplies included with concession rentals?", a: "Usually not. Supplies are priced per batch or bag; we list them on your quote so you can choose how many servings you want." },
    ],
  },
  {
    id: "photo-booths",
    name: "Photo booths",
    imageFolder: "photo-booths",
    blurb: "360 booths, mirror booths, selfie stations and props",
    intro:
      "Photo booth rentals in Chicago run from about $150 for a self-serve selfie station to $400-800 for a mirror or 360 booth with an attendant for 3-4 hours. They are one of the most-used extras at weddings, quinceañeras and corporate parties, and the photos double as favors.",
    planning: [
      { title: "Choose the style", body: "360 booths make shareable video; mirror and open-air booths make printed photos." },
      { title: "Space", body: "Allow about 10' x 10' for most booths and a 12' circle for a 360 platform." },
      { title: "Hours", body: "Two to three hours during the reception is usually enough; peak use is after dinner." },
      { title: "Backdrop", body: "Pair with a flower wall or sequin backdrop for better photos." },
    ],
    faqs: [
      { q: "How much is a photo booth rental in Chicago?", a: "About $150-450 for a few hours depending on the booth type, prints and whether an attendant is included. 360 video booths and magic mirrors sit at the top of that range." },
      { q: "How much space does a photo booth need?", a: "About 10' x 10' including a backdrop, or a 12-foot circle for a 360 platform, plus a standard outlet nearby." },
    ],
  },
  {
    id: "av-sound",
    name: "AV & sound",
    imageFolder: "av",
    blurb: "Projectors, screens, speakers, microphones and TVs",
    intro:
      "AV rentals in Chicago start around $50-100 for a speaker with microphone and run $150-400 for a projector and screen package. Plan a microphone for every toast or speech, and a screen sized so the back row sits within six screen-heights.",
    planning: [
      { title: "Speeches", body: "One powered speaker and wireless mic covers up to about 150 guests indoors." },
      { title: "Screens", body: "Pick screen height of at least 1/6 of the distance to the back row." },
      { title: "Power and cables", body: "Each device needs an outlet; plan cable covers where guests walk." },
    ],
    faqs: [
      { q: "Do I need a DJ for a microphone and speaker?", a: "No. A powered speaker with a wireless microphone is plug-and-play and is enough for toasts, ceremonies and announcements." },
      { q: "What size projector screen do I need?", a: "Make the screen height about one sixth of the distance to the furthest seat: a 6' screen for a room about 36' deep." },
    ],
  },
  {
    id: "restrooms-power",
    name: "Restrooms & power",
    imageFolder: "restrooms-power",
    blurb: "Portable restrooms, restroom trailers and generators",
    intro:
      "Portable restroom units rent for roughly $150-300 each and luxury restroom trailers for $1,000-3,000 a day in the Chicago area. Plan one unit per 50 guests for a four-hour event (more if alcohol is served), and a generator sized to every heater, light and caterer's appliance on site.",
    planning: [
      { title: "Count units", body: "About 1 restroom per 50 guests for 4 hours; add 20% if serving alcohol and an ADA unit." },
      { title: "Hand washing", body: "Add a hand-wash station for every 2-3 restrooms if no sinks are nearby." },
      { title: "Power load", body: "Add up the watts of lights, heaters, sound and catering; size the generator 20% above the total." },
      { title: "Placement", body: "Restrooms need level ground and truck access; generators go downwind and away from guests." },
    ],
    faqs: [
      { q: "How many portable restrooms do I need for 100 guests?", a: "Two standard units for a four-hour event, three if alcohol is served, plus a hand-wash station. A restroom trailer with 2-3 stalls covers about 100-150 guests." },
      { q: "What size generator do I need for a tent wedding?", a: "Add up the watts of everything you will run (string lights, DJ, caterer's warmers, fans or heaters) and add 20%. Most 100-guest tents need about 7,000-10,000 watts; a vendor sizes it for you." },
    ],
  },
  {
    id: "fencing-crowd-control",
    name: "Fencing & crowd control",
    imageFolder: "fencing",
    blurb: "Stanchions, red carpets, barricades and fencing",
    intro:
      "Crowd-control rentals in Chicago range from about $10-20 per stanchion post and $50-100 for a red carpet runner to $15-30 per barricade section. They guide lines at check-in, bars and VIP entrances, and keep festival and block-party areas safe.",
    planning: [
      { title: "Lines", body: "One stanchion every 6-8 feet along a queue." },
      { title: "Perimeter", body: "Bike-rack barricades are about 8' long; divide the perimeter by 8." },
      { title: "Entrances", body: "A 4' x 20' red carpet with 6 posts makes an entrance or step-and-repeat." },
    ],
    faqs: [
      { q: "Do I need a permit for barricades on a Chicago street?", a: "Street closures for block parties need a City of Chicago permit, which comes with its own barricades in many wards. Private property events do not need a permit for rope-and-post stanchions." },
      { q: "How many stanchions do I need?", a: "One post every 6-8 feet of line, plus one at each end and each turn." },
    ],
  },
];

const P = (
  id: string,
  category: CategoryId,
  name: string,
  specs: string,
  unit: string,
  estimate: number,
  perGuest: number,
  description: string,
  keywords: string[],
  extra: Partial<Product> = {},
): Product => ({ id, category, name, specs, unit, estimate, perGuest, description, keywords, ...extra });

export const products: Product[] = [
  // Chairs
  P("gold-chiavari", "chairs", "Gold Chiavari chair", "Resin or wood, 15.5\"W x 16\"D x 36\"H, seat pad included", "each", 9.5, 1,
    "The classic ballroom wedding chair: slim, light and gold. It reads elegant in hotel ballrooms and tents alike and fits ten to a 60\" round.",
    ["gold chiavari chair rental chicago", "chiavari chairs for rent"]),
  P("silver-chiavari", "chairs", "Silver Chiavari chair", "Resin, 15.5\"W x 16\"D x 36\"H, seat pad included", "each", 9.5, 1,
    "A cooler take on the Chiavari for winter weddings, galas and silver or blue palettes.", ["silver chiavari chair rental"]),
  P("clear-chiavari", "chairs", "Clear Chiavari chair", "Clear polycarbonate, 15.5\"W x 16\"D x 36\"H", "each", 10.5, 1,
    "A crystal-clear Chiavari that disappears into the room and lets florals and linens take center stage.", ["clear chiavari chair rental chicago"]),
  P("white-chiavari", "chairs", "White Chiavari chair", "Resin, 15.5\"W x 16\"D x 36\"H, seat pad included", "each", 9.5, 1,
    "Bright white Chiavari for garden ceremonies, summer weddings and all-white palettes.", ["white chiavari chair rental"]),
  P("white-folding", "chairs", "White folding chair", "Plastic seat, steel frame, 18\"W", "each", 2.75, 1,
    "The budget workhorse for ceremonies, graduations, picnics and church events. Light, stackable and quick to set.",
    ["folding chair rental chicago", "white folding chairs for rent"]),
  P("white-resin-folding", "chairs", "White resin garden chair", "Padded resin folding chair, 17.5\"W", "each", 4.25, 1,
    "The \"garden chair\" with a padded seat and slatted back: a step up from basic folding chairs for outdoor ceremonies.",
    ["white resin folding chair rental", "garden ceremony chair rental"]),
  P("black-padded-folding", "chairs", "Black padded folding chair", "Padded vinyl seat, steel frame", "each", 3.5, 1,
    "Comfortable padded folding chair for corporate events, galas and long presentations.", ["padded folding chair rental"]),
  P("crossback", "chairs", "Cross-back chair", "Wood, 17.5\"W x 19\"D x 35\"H, wicker or wood seat", "each", 9, 1,
    "The rustic farmhouse chair with an X-back. Pairs with farm tables, barns and vineyard-style receptions.",
    ["cross back chair rental chicago", "vineyard chair rental"], { chairSlug: "cross-back" }),
  P("ghost", "chairs", "Ghost chair", "Clear polycarbonate armless Louis-style, 15\"W x 19\"D x 36\"H", "each", 14, 1,
    "A clear Louis-style chair that makes modern and glam events feel airy. Popular for head tables and lounge corners.",
    ["ghost chair rental chicago", "clear chair rental"], { chairSlug: "ghost" }),
  P("bentwood", "chairs", "Bentwood bistro chair", "Wood, 17\"W, café style", "each", 9, 0,
    "The Parisian café classic for bistro-style receptions and rehearsal dinners.", ["bentwood chair rental chicago"], { chairSlug: "bentwood" }),
  P("louis-medallion", "chairs", "Louis medallion chair", "Upholstered French oval back", "each", 20, 0,
    "French upholstered elegance for head tables and luxury receptions.", ["louis chair rental chicago"], { chairSlug: "louis-medallion" }),
  P("rattan-garden", "chairs", "Rattan garden chair", "Hand-woven rattan", "each", 12, 0,
    "Hand-woven texture for boho and garden parties.", ["rattan chair rental chicago"], { chairSlug: "rattan-garden" }),
  P("wishbone", "chairs", "Wishbone chair", "Oak frame, woven cord seat", "each", 14, 0,
    "Scandinavian lines for modern and minimalist weddings.", ["wishbone chair rental chicago"], { chairSlug: "wishbone" }),
  P("velvet-dining", "chairs", "Velvet dining chair", "Upholstered velvet, jewel tones", "each", 18, 0,
    "Jewel-toned luxury for evening receptions.", ["velvet chair rental chicago"], { chairSlug: "velvet-dining" }),
  P("infinity", "chairs", "Infinity chair", "Metal frame, gold, silver or black", "each", 9, 0,
    "Sleek metal curves with a modern edge.", ["infinity chair rental chicago"], { chairSlug: "infinity" }),
  P("cane-back", "chairs", "Cane-back chair", "Wood frame, woven cane back", "each", 12, 0,
    "Woven cane panel with soft vintage charm.", ["cane back chair rental"], { chairSlug: "cane-back" }),
  P("windsor", "chairs", "Windsor spindle chair", "Wood spindle back", "each", 9, 0,
    "Farmhouse spindles with a heritage feel.", ["windsor chair rental"], { chairSlug: "windsor" }),
  P("shell", "chairs", "Mid-century shell chair", "Molded shell, wood legs", "each", 9, 0,
    "Modern molded comfort for corporate events and lofts.", ["shell chair rental"], { chairSlug: "shell" }),
  P("garden-folding", "chairs", "Teak garden folding chair", "Teak-finish slatted folding chair", "each", 5, 0,
    "A ceremony chair that is a step up from white folding chairs.", ["wood folding chair rental chicago"], { chairSlug: "garden-folding" }),
  P("kids-chair", "chairs", "Kids' chair", "Child-size folding or Chiavari chair, seat height 12-14\"", "each", 3, 0,
    "Child-size chairs for kids' tables at weddings, birthdays and first communions.", ["kids chair rental"]),
  P("throne-chair", "chairs", "Throne chair", "High-back king/queen chair, gold or silver frame, velvet upholstery", "each", 150, 0,
    "A statement chair for quinceañeras, sweet 16s, baby showers and bride-and-groom portraits.",
    ["throne chair rental chicago", "quinceanera throne chair rental"], { minQty: 1, chairSlug: "royal-throne" }),
  P("bar-stool", "chairs", "Chiavari bar stool", "Gold Chiavari stool with back, 30\" seat height, for 42\" highboy tables", "each", 15.75, 0,
    "Chiavari-style seating for highboy cocktail tables, bars and lounge counters.", ["bar stool rental chicago"]),

  // Tables
  P("round-48", "tables", "48\" round table", "Seats 6, 30\" high", "each", 10, 1 / 6,
    "Small round for intimate dinners, kids' tables and cake or gift tables.", ["48 inch round table rental"]),
  P("round-60", "tables", "60\" round table", "Seats 8-10, 30\" high", "each", 12, 1 / 8,
    "The most-rented event table. Seats 8 comfortably and 10 snugly, and takes a 120\" floor-length linen.",
    ["60 inch round table rental chicago", "round table rental"]),
  P("round-72", "tables", "72\" round table", "Seats 10-12, 30\" high", "each", 14, 0,
    "A larger round for 10-12 guests when you want fewer tables in the room.", ["72 inch round table rental"]),
  P("banquet-6ft", "tables", "6' banquet table", "6' x 30\", seats 6-8", "each", 10, 0,
    "Rectangular table for buffets, gifts, check-in and smaller guest tables.", ["6 foot table rental"]),
  P("banquet-8ft", "tables", "8' banquet table", "8' x 30\", seats 8-10", "each", 11, 0,
    "The standard long table for family-style dinners, head tables and buffets.", ["8 foot table rental chicago", "banquet table rental"]),
  P("cocktail-highboy", "tables", "Highboy cocktail table", "30\" round top, 42\" high", "each", 15, 1 / 10,
    "Standing-height table for cocktail hour, corporate mixers and bars. Usually dressed with a spandex cover.",
    ["highboy table rental chicago", "cocktail table rental"]),
  P("cocktail-lowboy", "tables", "Lowboy cocktail table", "30\" round top, 30\" high", "each", 12, 0,
    "Seated-height small round for lounge areas and cocktail seating.", ["cocktail table rental"]),
  P("farm-table", "tables", "Farm table", "Wood, 8' x 40\", seats 8-10", "each", 85, 0,
    "A solid-wood harvest table that looks great bare, no linen needed. Pairs with cross-back chairs.",
    ["farm table rental chicago", "harvest table rental"]),
  P("sweetheart-table", "tables", "Sweetheart table", "Decorative table for two, about 4'-5' wide", "each", 60, 0,
    "A styled table for two at the front of the room for the couple.", ["sweetheart table rental"], { minQty: 1 }),
  P("kids-table", "tables", "Kids' table", "6' x 30\" at 22\" high", "each", 8, 0,
    "Low table sized for children's parties and kids' corners.", ["kids table rental"]),

  // Linens
  P("round-floor-length", "linens", "120\" round tablecloth", "Polyester, floor length on a 60\" round", "each", 16, 1 / 8,
    "Floor-length cloth for 60\" round tables. Hides table legs for a formal finish.", ["120 round tablecloth rental"]),
  P("round-lap-length", "linens", "90\" round tablecloth", "Polyester, lap length on a 60\" round", "each", 11, 0,
    "Lap-length cloth for 60\" rounds: a lower-cost option for casual events.", ["90 round tablecloth rental"]),
  P("banquet-floor-length", "linens", "90\" x 156\" tablecloth", "Polyester, floor length on an 8' table", "each", 19, 0,
    "Floor-length cloth for 8' banquet tables, buffets and head tables.", ["90x156 tablecloth rental"]),
  P("banquet-lap-length", "linens", "90\" x 132\" tablecloth", "Polyester, lap length on an 8' table", "each", 15, 0,
    "Lap-length cloth for 8' or floor-length for 6' banquet tables.", ["90x132 tablecloth rental"]),
  P("spandex-highboy", "linens", "Spandex highboy cover", "Fitted stretch cover for 30\" x 42\" tables", "each", 14, 1 / 10,
    "Fitted stretch cover that gives highboys a sleek hourglass shape.", ["spandex highboy cover rental"]),
  P("sequin-overlay", "linens", "Sequin overlay", "72\" x 72\" or 90\" round sequin topper", "each", 30, 0,
    "Sparkling overlay for sweetheart, cake and head tables.", ["sequin tablecloth rental chicago"]),
  P("table-runner", "linens", "Table runner", "12\" x 108\" satin, chiffon or burlap", "each", 7, 1 / 8,
    "A strip of color down the table: the cheapest way to add your palette.", ["table runner rental"]),
  P("cloth-napkins", "linens", "Cloth napkin", "20\" x 20\" polyester, many colors", "each", 0.95, 1,
    "Laundered and pressed dinner napkins in your colors.", ["napkin rental chicago", "cloth napkin rental"]),
  P("chair-sash", "linens", "Chair sash", "Satin or organza tie", "each", 2.5, 0,
    "A colored tie for folding or banquet chair covers.", ["chair sash rental"]),
  P("chair-cover", "linens", "Chair cover", "Spandex or polyester fitted cover", "each", 3.5, 0,
    "Fitted cover that turns a folding or banquet chair formal.", ["chair cover rental chicago"]),

  // Dinnerware
  P("charger-plate", "dinnerware", "Charger plate", "13\" gold, silver or glass beaded", "each", 1.75, 1,
    "The decorative base under each place setting: the biggest visual upgrade per dollar.", ["charger plate rental chicago"]),
  P("dinner-plate", "dinnerware", "Dinner plate", "10.5\" white china", "each", 0.75, 1,
    "Classic white china dinner plate, racked for easy return.", ["dinner plate rental", "dish rental chicago"]),
  P("salad-plate", "dinnerware", "Salad / dessert plate", "8\" white china", "each", 0.65, 1,
    "Salad, appetizer and dessert plate.", ["salad plate rental"]),
  P("bread-plate", "dinnerware", "Bread & butter plate", "6\" white china", "each", 0.6, 0,
    "Small plate for bread service and cake.", ["bread plate rental"]),
  P("soup-bowl", "dinnerware", "Soup / salad bowl", "White china bowl", "each", 0.75, 0,
    "For soup courses, pasta and salads.", ["bowl rental"]),
  P("coffee-cup-saucer", "dinnerware", "Coffee cup & saucer", "7 oz white china", "set", 0.9, 0.6,
    "For coffee and tea service with dessert.", ["coffee cup rental"]),

  // Flatware
  P("dinner-fork", "flatware", "Dinner fork", "Stainless steel", "each", 0.55, 1, "Classic stainless dinner fork.", ["flatware rental chicago"]),
  P("salad-fork", "flatware", "Salad fork", "Stainless steel", "each", 0.55, 1, "Salad and dessert fork.", ["salad fork rental"]),
  P("dinner-knife", "flatware", "Dinner knife", "Stainless steel", "each", 0.55, 1, "Classic stainless dinner knife.", ["knife rental"]),
  P("teaspoon", "flatware", "Teaspoon", "Stainless steel", "each", 0.55, 1, "For coffee, tea and desserts.", ["spoon rental"]),
  P("gold-flatware", "flatware", "Gold flatware (per piece)", "Gold-finish stainless, fork, knife or spoon", "each", 1.5, 0,
    "Gold-finish flatware to match gold chargers and Chiavari chairs.", ["gold flatware rental chicago"]),

  // Glassware
  P("water-goblet", "glassware", "Water goblet", "12 oz stemmed goblet", "each", 0.85, 1, "Stemmed water glass for every place setting.", ["glassware rental chicago"]),
  P("wine-glass", "glassware", "Wine glass", "10-12 oz all-purpose", "each", 0.85, 1, "All-purpose red or white wine glass.", ["wine glass rental"]),
  P("champagne-flute", "glassware", "Champagne flute", "6 oz flute", "each", 0.85, 1, "For the toast and sparkling cocktails.", ["champagne flute rental chicago"]),
  P("rocks-glass", "glassware", "Rocks glass", "10 oz old-fashioned", "each", 0.8, 0.75, "Bar glass for cocktails on the rocks.", ["rocks glass rental"]),
  P("highball-glass", "glassware", "Highball glass", "10-12 oz", "each", 0.8, 0.75, "Tall bar glass for mixed drinks and soda.", ["highball glass rental"]),
  P("pilsner-glass", "glassware", "Beer / pilsner glass", "12-16 oz", "each", 0.85, 0, "For beer service.", ["beer glass rental"]),

  // Catering equipment
  P("chafing-dish", "catering-equipment", "Chafing dish", "8 qt full-size, stainless", "each", 18, 1 / 20, "Keeps buffet food hot for 2-3 hours with fuel.", ["chafing dish rental chicago"]),
  P("beverage-dispenser", "catering-equipment", "Beverage dispenser", "3 gallon glass with stand", "each", 20, 0, "For lemonade, iced tea and infused water.", ["beverage dispenser rental"]),
  P("coffee-urn", "catering-equipment", "Coffee urn", "100-cup percolator", "each", 25, 0, "Brews and holds coffee for up to 100 cups.", ["coffee urn rental"]),
  P("serving-tray", "catering-equipment", "Serving tray / platter", "Stainless or silver, assorted sizes", "each", 6, 0, "For passed appetizers and buffet display.", ["serving tray rental"]),
  P("cake-stand", "catering-equipment", "Cake stand", "Silver, gold or glass pedestal", "each", 15, 0, "Pedestal stand for wedding and birthday cakes.", ["cake stand rental"]),
  P("champagne-wall", "catering-equipment", "Champagne wall", "Display wall holding about 30-50 glasses", "each", 145, 0, "Guests grab a glass of bubbly from a styled wall as they arrive.", ["champagne wall rental chicago"], { minQty: 1 }),
  P("portable-bar", "catering-equipment", "Portable bar", "4'-6' folding bar with skirt; wood and barrel bars cost more", "each", 125, 0, "A finished bar front for bartenders, indoors or under a tent.", ["portable bar rental chicago"]),

  // Tents
  P("canopy-10x10", "tents", "10' x 10' canopy", "Pop-up or frame canopy, 100 sq ft", "each", 125, 0, "Shade for check-in, food service or a vendor booth.", ["canopy rental chicago", "10x10 tent rental"]),
  P("frame-tent-20x20", "tents", "20' x 20' frame tent", "400 sq ft, seats about 32-40", "each", 400, 0, "No center poles, so it can go on pavement or grass. Fits a backyard party.", ["20x20 tent rental chicago"]),
  P("frame-tent-20x40", "tents", "20' x 40' frame tent", "800 sq ft, seats about 64-80", "each", 800, 0, "The graduation-party favorite: seats 64-80 or covers food and bar for 150.", ["20x40 tent rental chicago", "graduation party tent rental"]),
  P("frame-tent-30x60", "tents", "30' x 60' frame tent", "1,800 sq ft, seats about 150-180", "each", 1600, 0, "Large clear-span tent for weddings and corporate events.", ["30x60 tent rental"]),
  P("pole-tent-40x60", "tents", "40' x 60' pole tent", "2,400 sq ft, seats about 200-240", "each", 2200, 0, "Classic peaked tent for big weddings; staked into grass.", ["40x60 tent rental chicago", "wedding tent rental chicago"]),
  P("sailcloth-tent", "tents", "Sailcloth tent", "Translucent peaked tent with wood poles, from 32' x 50'", "each", 4500, 0, "The romantic, glowing tent for luxury weddings.", ["sailcloth tent rental chicago"]),
  P("clear-top-tent", "tents", "Clear-top tent", "20' x 40' clear vinyl frame tent", "each", 1400, 0, "See the sky (and string lights) while staying dry.", ["clear tent rental chicago"]),
  P("tent-sidewall", "tents", "Tent sidewall", "Per 20' section, solid, window or clear", "per 20' section", 40, 0, "Walls that block wind and rain, or keep heat in.", ["tent sidewall rental"]),

  // Dance floors & staging
  P("dance-floor", "dance-floors-staging", "Dance floor section", "3' x 3' wood-look or white vinyl panel with edging; a 12' x 12' floor is 16 sections", "per 3' x 3' section", 22, 0, "Portable floor laid in panels; works indoors or on a tent subfloor.", ["dance floor rental chicago"], { minQty: 16 }),
  P("led-dance-floor", "dance-floors-staging", "LED dance floor", "Programmable LED panels, priced per sq ft", "per sq ft", 12, 0, "Light-up floor that changes color with the music.", ["led dance floor rental chicago"], { minQty: 144 }),
  P("stage-deck", "dance-floors-staging", "Stage section", "4' x 8' deck, 16-32\" adjustable legs", "each", 75, 0, "Modular staging for bands, speakers and head tables.", ["stage rental chicago"]),

  // Lighting
  P("string-lights", "lighting", "Bistro string lights", "Per 100 ft strand, LED globe bulbs", "per 100 ft", 75, 0, "Warm globe lights for tents, patios and backyards.", ["string light rental chicago", "bistro lights rental"]),
  P("uplight", "lighting", "LED uplight", "Wireless, battery powered, any color", "each", 30, 0, "Washes walls in your color for an instant room change.", ["uplighting rental chicago"]),
  P("chandelier", "lighting", "Chandelier", "Crystal or wood-and-iron, for tents and lofts", "each", 125, 0, "A focal-point light over the dance floor or head table.", ["chandelier rental chicago"]),
  P("pipe-and-drape", "lighting", "Pipe & drape", "Per 10' section, 8'-16' tall", "per 10' section", 50, 0, "Fabric walls to hide clutter or create a backdrop.", ["pipe and drape rental chicago"]),

  // Heating & cooling
  P("patio-heater", "heating-cooling", "Patio heater", "Propane mushroom heater, propane extra", "each", 95, 0, "Keeps a patio or open tent comfortable into the evening.", ["patio heater rental chicago"]),
  P("tent-heater", "heating-cooling", "Forced-air tent heater", "Indirect-fired, heats 800-1,000 sq ft, fuel extra", "each", 275, 0, "Ducted heat for enclosed tents in spring and fall.", ["tent heater rental"]),

  // Lounge
  P("lounge-sofa", "lounge", "Lounge sofa", "Velvet or leather 3-seat sofa", "each", 225, 0, "Anchors a lounge vignette at receptions and corporate parties.", ["lounge furniture rental chicago", "sofa rental for events"]),
  P("lounge-armchair", "lounge", "Lounge armchair", "Accent armchair", "each", 110, 0, "Pairs with sofas for a conversation group.", ["accent chair rental"]),
  P("coffee-table", "lounge", "Coffee table", "Wood, acrylic or metal", "each", 75, 0, "Center of a lounge group.", ["coffee table rental"]),

  // Decor
  P("ceremony-arch", "decor", "Ceremony arch", "Wood, metal hexagon or round arch, about 7' tall", "each", 175, 0, "The focal point for your ceremony; flowers optional.", ["wedding arch rental chicago"], { minQty: 1 }),
  P("flower-wall", "decor", "Flower wall", "8' x 8' faux flower or greenery wall", "each", 450, 0, "A ready-made photo backdrop for weddings and parties.", ["flower wall rental chicago"], { minQty: 1 }),
  P("marquee-letters", "decor", "Marquee letter", "4' light-up letter or number", "each", 85, 0, "Spell initials, \"LOVE\" or an age in light.", ["marquee letters rental chicago"]),
  P("candle-holder", "decor", "Candle holder", "Votive, hurricane or taper holder", "each", 2.5, 0.4, "Candlelight for every table.", ["candle holder rental"]),

  P("neon-sign", "decor", "Neon sign", "LED neon phrase sign, e.g. \"Better Together\" or \"Mr & Mrs\"", "each", 89, 0, "A glowing phrase over the bar, lounge or sweetheart table.", ["neon sign rental chicago"]),
  P("photo-booth-360", "photo-booths", "360 photo booth", "Platform with rotating video arm, attendant varies", "each", 149, 0, "Slow-motion 360 videos guests share all night.", ["360 photo booth rental chicago", "photo booth rental chicago"], { minQty: 1 }),
  P("mirror-photo-booth", "photo-booths", "Mirror photo booth", "Full-length touch-screen mirror with prints", "each", 395, 0, "The glam selfie mirror that prints photos on the spot.", ["mirror photo booth rental chicago"], { minQty: 1 }),

  // Games & kids
  P("bounce-house", "games-kids", "Bounce house", "15' x 15' inflatable, needs 20' x 20' and power", "each", 225, 0, "The kids' party headliner for birthdays and picnics.", ["bounce house rental chicago"], { minQty: 1 }),
  P("yard-games", "games-kids", "Yard game", "Giant Jenga, cornhole, Connect 4 and more", "each", 45, 0, "Lawn games for graduation parties and picnics.", ["yard game rental chicago", "cornhole rental"]),
  P("popcorn-machine", "concessions", "Popcorn machine", "8 oz kettle with cart, supplies extra", "each", 95, 0, "Fresh popcorn for parties and school events.", ["popcorn machine rental chicago"]),
  // Concessions
  P("snow-cone-machine", "concessions", "Snow cone machine", "Shaved-ice machine, syrups and cones extra", "each", 85, 0, "Icy treats for summer parties, picnics and school events.", ["snow cone machine rental chicago"]),
  P("nacho-cheese-warmer", "concessions", "Nacho cheese warmer", "Countertop cheese dispenser, supplies extra", "each", 75, 0, "Warm nacho cheese on tap for graduations and game-day parties.", ["nacho machine rental chicago"]),
  P("hot-dog-roller", "concessions", "Hot dog warmer", "Steamer or roller holding about 50-80 hot dogs", "each", 75, 0, "Hot dogs ready all party long with no grill needed.", ["hot dog machine rental chicago"]),

  // Restrooms & power
  P("portable-restroom", "restrooms-power", "Portable restroom", "Standard single unit with hand sanitizer", "each", 175, 1 / 50, "A clean single restroom unit for backyard parties, festivals and construction-free venues.", ["porta potty rental chicago", "portable toilet rental chicago"], { minQty: 1 }),
  P("ada-restroom", "restrooms-power", "ADA accessible restroom", "Wheelchair accessible unit with ramp-level entry", "each", 225, 0, "The accessible unit to include at any public or large private event.", ["ada porta potty rental chicago"], { minQty: 1 }),
  P("restroom-trailer", "restrooms-power", "Luxury restroom trailer", "2-3 stall trailer with flushing toilets, sinks, lights and climate control", "each", 1500, 0, "Wedding-grade restrooms with running water, mirrors and air conditioning.", ["restroom trailer rental chicago", "luxury bathroom trailer rental"], { minQty: 1 }),
  P("hand-wash-station", "restrooms-power", "Hand-wash station", "Portable 2-sink station with fresh water and soap", "each", 95, 0, "Fresh-water hand washing next to portable restrooms or food service.", ["hand washing station rental chicago"]),
  P("generator-7kw", "restrooms-power", "Generator, 7,000-8,000 watt", "Portable generator, fuel extra", "each", 225, 0, "Runs string lights, a DJ and a few caterer's warmers.", ["generator rental chicago", "party generator rental"]),
  P("generator-20kw", "restrooms-power", "Generator, 20 kW towable", "Towable diesel generator with distribution, fuel extra", "each", 450, 0, "Powers a tent wedding with lighting, sound, heaters and catering.", ["tent generator rental chicago"]),
  P("cable-ramp", "restrooms-power", "Cable ramp / cord cover", "5' section protecting cables where guests walk", "each", 15, 0, "Keeps guests from tripping over power runs.", ["cable cover rental"]),

  // AV & sound
  P("pa-system", "av-sound", "Portable PA system", "Powered speakers with a microphone, for toasts and announcements", "each", 150, 0, "Clear speeches, toasts and background music for up to about 300 guests.", ["pa system rental chicago", "speaker rental chicago"]),
  P("wireless-microphone", "av-sound", "Wireless microphone", "Lapel or handheld wireless mic", "each", 35, 0, "Hands-free mic for officiants, speeches and presentations.", ["wireless microphone rental chicago"]),
  P("projector", "av-sound", "Projector", "LCD projector, 1,200+ lumens", "each", 100, 0, "Slideshows, videos and presentations at receptions and corporate events.", ["projector rental chicago"]),
  P("projection-screen", "av-sound", "Projection screen", "8' x 8' tripod screen", "each", 50, 0, "Pairs with a projector for slideshows and presentations.", ["projector screen rental chicago"]),
  P("podium", "av-sound", "Podium", "Floor-standing lectern", "each", 60, 0, "A spot for speeches, awards and ceremonies.", ["podium rental chicago", "lectern rental"]),
  P("tv-with-stand", "av-sound", "TV with stand", "60\" TV on a rolling stand", "each", 225, 0, "Shows slideshows, menus or the big game.", ["tv rental chicago event"]),

  // Fencing & crowd control
  P("stanchion", "fencing-crowd-control", "Stanchion post with rope", "Chrome or gold post with velvet rope", "each", 15, 0, "Guides lines at check-in, bars and VIP entrances.", ["stanchion rental chicago"]),
  P("barricade", "fencing-crowd-control", "Steel barricade", "8' bike-rack style crowd barrier", "each", 20, 0, "Interlocking barriers for block parties, festivals and parking control.", ["barricade rental chicago"]),
  P("temporary-fence", "fencing-crowd-control", "Temporary fence panel", "6' x 12' chain-link panel with stand", "each", 25, 0, "Perimeter fencing for festivals, beer gardens and outdoor events.", ["temporary fence rental chicago"]),

  P("soft-play", "games-kids", "Soft play set", "Toddler soft play blocks, ball pit and mats", "each", 225, 0, "A safe play zone for toddlers at birthdays and baby showers.", ["soft play rental chicago"], { minQty: 1 }),
  P("cotton-candy-machine", "concessions", "Cotton candy machine", "Commercial machine, supplies extra", "each", 95, 0, "Carnival treat for kids' events.", ["cotton candy machine rental"]),
];

export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const getProduct = (id: string) => products.find((p) => p.id === id);
