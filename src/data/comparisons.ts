// "X vs Y" comparison pages for event rentals (/rental-comparisons/[slug]). /compare holds the booking-model comparisons.
// Chairs have their own comparisons at /chair-comparisons. Everything here is qualitative or comes
// from the catalog (sizes, prices); no invented statistics.
// `a.id` / `b.id` are render slugs from rental-images.json; `item` is a catalog id when the side is a rental we price.

export type Side = { id: string; name: string; item?: string };

export type Comparison = {
  slug: string;
  title: string; // H1 and <title>
  description: string;
  a: Side;
  b: Side;
  answer: string; // 40-60 words, data-answer
  rows: [string, string, string][]; // criterion, A, B
  chooseA: string[];
  chooseB: string[];
  body: { h: string; p: string[] }[];
  faqs: { q: string; a: string }[];
  tools: string[]; // /tools/* slugs to link
};

export const comparisons: Comparison[] = [
  {
    slug: "round-vs-banquet-tables",
    title: "Round vs Banquet Tables: Which Is Better for Your Event?",
    description: "Round tables or long banquet tables for a wedding, party or gala? Compare seating, space, conversation, linens and look, with Chicago rental prices and a calculator for your guest count.",
    a: { id: "round-60", name: '60" round table', item: "round-60" },
    b: { id: "banquet-8ft", name: "8' banquet table", item: "banquet-8ft" },
    answer: "Round tables seat eight to ten guests facing each other, which is best for conversation and a classic reception look. Banquet tables line up into long rows, seat more people in a narrow room and suit family-style dinners. Many events mix both: rounds for guests, banquets for the head table, buffet and bar.",
    rows: [
      ["Seats", "8 comfortably, up to 10", "8 comfortably, up to 10 with ends"],
      ["Space per guest", "About 12 sq ft with aisles", "About 10 sq ft with aisles"],
      ["Conversation", "Everyone can see everyone", "You talk to neighbours and across"],
      ["Look", "Classic reception, centrepiece in the middle", "Long, family-style tables with runners"],
      ["Linens", '120" round to the floor', '90" x 156" to the floor'],
      ["Also used for", "Cake, guest book, cocktail", "Head table, buffet, bar, gifts"],
    ],
    chooseA: ["You want a classic reception look", "Guests are seated with people they may not know well", "The room is square or wide"],
    chooseB: ["The room is long and narrow", "You want family-style dining or long garden tables", "You need to fit more guests into the same space"],
    body: [
      { h: "Space and capacity", p: ["Long tables use space more efficiently because they line up end to end with one aisle between rows. Round tables need walking room on every side, so the same room seats fewer guests at rounds. If your venue is tight, run the numbers in the venue capacity calculator before you choose.", "In a tent, rounds are easier to place around poles. Long tables work best in frame tents with no centre poles."] },
      { h: "Atmosphere", p: ["Rounds make each table its own small party. Long tables make the whole room feel like one dinner, which is why they are popular for rehearsal dinners, farm-to-table menus and family celebrations.", "Mixing works well: long tables down the middle with rounds around the edge, or one long head table facing a room of rounds."] },
      { h: "Cost", p: ["Per table, rental prices are close, and the bigger difference is linens: floor-length round cloths and long banquet cloths are priced differently. Use the tables and chairs calculator for a full table count and a rough price at our catalog rates."] },
    ],
    faqs: [
      { q: "How many round tables do I need for 100 guests?", a: "At eight per 60\" round, 100 guests need 13 tables. At ten per 72\" round, they need 10. Add tables for the head table, cake, gifts, DJ, buffet and bar." },
      { q: "Can I mix round and banquet tables?", a: "Yes, and many planners do. A long head table with rounds for guests, or long tables down the middle with rounds at the sides, both work well." },
      { q: "Which is cheaper to rent?", a: "Table prices are similar per table. Total cost depends more on how many tables you need and which linens you choose. Compare both in our quote builder." },
    ],
    tools: ["tables-and-chairs", "venue-capacity", "linens"],
  },
  {
    slug: "frame-tent-vs-pole-tent",
    title: "Frame Tent vs Pole Tent: Which Tent Is Right for Your Event?",
    description: "Frame tent or pole tent for a wedding, graduation party or backyard event? Compare surfaces, centre poles, setup, look and sizes, with Chicago rental prices and a tent size calculator.",
    a: { id: "frame-tent-20x40", name: "Frame tent", item: "frame-tent-20x40" },
    b: { id: "pole-tent-40x60", name: "Pole tent", item: "pole-tent-40x60" },
    answer: "A frame tent is held up by a metal frame with no centre poles, so it can stand on grass, concrete, asphalt or a deck. A pole tent uses centre poles and stakes in the ground, giving a peaked, classic look. Choose frame for hard surfaces and open floor space; pole for lawns and a traditional style.",
    rows: [
      ["Inside", "Open floor, no centre poles", "Centre and side poles inside"],
      ["Surface", "Grass, concrete, asphalt, decks (weights or stakes)", "Grass or soil that takes stakes"],
      ["Look", "Clean lines, flatter roof", "High peaks and curves"],
      ["Space around it", "Can sit close to buildings", "Needs room for stakes and ropes outside"],
      ["Common sizes", "10' x 10' up to 40' wide", "Often 30' to 60' wide and up"],
    ],
    chooseA: ["You're on a driveway, patio, parking lot or deck", "You need every square foot without poles in the way", "The tent must sit close to a house or fence"],
    chooseB: ["You're on a lawn that can take stakes", "You love the peaked, classic wedding look", "You have room around the tent for stake lines"],
    body: [
      { h: "Where it can go", p: ["The surface often decides for you. Pole tents need stakes driven into the ground all around the outside, so they need a lawn and space beyond the tent walls. Frame tents can be staked on grass or held down with weights on hard surfaces.", "Before booking, check for buried lines and sprinklers. Your rental company will ask where the tent is going and what it sits on."] },
      { h: "Inside the tent", p: ["Frame tents give you clear floor space, which makes it easier to place a dance floor, a long head table or a stage. Pole tents have poles inside that need to be planned around. Many hosts decorate them with greenery or lights so they become part of the look."] },
      { h: "Size and price", p: ["Work out the square feet you need first with the tent size calculator, then compare the sizes each type comes in. Our catalog lists frame and pole tents with published Chicago-area prices."] },
    ],
    faqs: [
      { q: "Can a pole tent go on concrete?", a: "Usually not, because it relies on stakes in the ground. A frame tent with weights is the usual choice for hard surfaces. Ask your rental company about your site." },
      { q: "Which tent handles wind better?", a: "Both are engineered for outdoor use when installed correctly. Wind limits depend on the specific tent and how it's anchored, so ask the rental company for their guidance and plan to make a weather call." },
      { q: "Do I need sidewalls?", a: "Sidewalls are optional on both. They help with wind, rain and cold, which matters for Chicago spring and fall events." },
    ],
    tools: ["tent-size", "rain-plan", "lighting"],
  },
  {
    slug: "clear-top-tent-vs-white-tent",
    title: "Clear-Top Tent vs White Tent: Pros, Cons and When to Choose",
    description: "Clear-top or white tent for your Chicago wedding or party? Compare the view, heat, light, privacy and decor, with rental prices and tools to size your tent and plan lighting.",
    a: { id: "clear-top-tent", name: "Clear-top tent", item: "clear-top-tent" },
    b: { id: "frame-tent-20x40", name: "White frame tent", item: "frame-tent-20x40" },
    answer: "A clear-top tent shows the sky, trees and stars and makes an evening with string lights feel magical, but it lets in sun and heat during the day. A white tent gives shade, softer light for photos and privacy. Choose clear for evening events with a view, white for daytime and hot afternoons.",
    rows: [
      ["View", "Sky, trees and stars", "Enclosed, bright white ceiling"],
      ["Daytime sun", "Lets sun and heat through", "Shades guests"],
      ["Evening", "Stunning with string lights", "Glows warmly from inside"],
      ["Photos", "Can be harsh in midday sun", "Soft, even light"],
      ["Decor", "Lights and greenery hang inside", "Draping and lights hide the frame"],
    ],
    chooseA: ["Your event runs into the evening", "There's a view, tree canopy or skyline worth seeing", "You plan string lights or chandeliers"],
    chooseB: ["Your event is mostly in daylight", "It's a hot summer afternoon", "You want even light for photos"],
    body: [
      { h: "Timing is everything", p: ["The same tent feels different at 2pm and at 9pm. A clear top under midday summer sun can get warm, while a white top stays shaded. After sunset the clear top turns into a window on the night sky.", "Check what time the sun sets on your date and plan the timeline around it. Our timeline builder and event date tools help."] },
      { h: "Lighting and decor", p: ["With a clear top, the lighting design does the heavy lifting once it's dark, so plan string lights early. White tents reflect light, so uplights and draping change the mood easily. Use the string light calculator for either."] },
    ],
    faqs: [
      { q: "Do clear-top tents get hot?", a: "They can in direct sun, because they let sunlight through. Shade from trees, a late start time or sidewalls with windows can help. For hot daytime events a white top is usually more comfortable." },
      { q: "Are clear tents good for rain?", a: "Yes. Rain on a clear roof can look beautiful, and the roof keeps guests dry just like a white tent. Add sidewalls if rain could blow in." },
      { q: "Can I mix both?", a: "Some events use a white tent for dining and a smaller clear tent for a lounge or dance floor. Ask what sizes are available for your date." },
    ],
    tools: ["tent-size", "lighting", "rain-plan"],
  },
  {
    slug: "floor-length-vs-lap-length-tablecloths",
    title: "Floor-Length vs Lap-Length Tablecloths: Which Should You Rent?",
    description: "Floor-length or lap-length tablecloths for your event? Compare the look, cost, sizes and when each works, with a tablecloth size calculator and Chicago linen rental prices.",
    a: { id: "round-floor-length", name: "Floor-length cloth", item: "round-floor-length" },
    b: { id: "round-lap-length", name: "Lap-length cloth", item: "round-lap-length" },
    answer: "Floor-length tablecloths reach the ground and hide the table legs for a formal, finished look, so they are the usual choice for weddings and galas. Lap-length cloths hang about 12 inches and show the legs, which is fine for casual parties, buffets and backyard events. A 60-inch round takes a 120-inch cloth for floor length.",
    rows: [
      ["Drop", "About 30\" to the floor", "About 12\" to the lap"],
      ["Table legs", "Hidden", "Visible"],
      ["Look", "Formal and finished", "Casual and relaxed"],
      ["60\" round size", '120" round', '84" or 90" round'],
      ["8' banquet size", '90" x 156"', '60" x 120"'],
      ["Storage underneath", "Hides boxes and supplies", "Everything shows"],
    ],
    chooseA: ["It's a wedding, gala or formal dinner", "You want to hide folding table legs", "You need to stash supplies under tables"],
    chooseB: ["It's a casual party or backyard event", "You want to keep linen costs down", "Kids are around and might trip on long cloths"],
    body: [
      { h: "Look and feel", p: ["Floor-length linens make plain rental tables look like part of the decor. They also hide anything stored underneath, which caterers and DJs appreciate.", "Lap-length cloths look relaxed and can be layered with a runner or a smaller overlay for colour."] },
      { h: "Sizes and cost", p: ["Bigger cloths use more fabric, so floor-length linens usually cost more per table. Use the tablecloth calculator to get the exact size for your tables and drop, and see a rough price from our catalog."] },
    ],
    faqs: [
      { q: "What size tablecloth for a 60 inch round table to the floor?", a: "A 120\" round on a standard 30\"-high table." },
      { q: "Can I mix lengths?", a: "Yes. Many events use floor-length cloths on guest and head tables and lap-length on buffet or back-of-house tables." },
      { q: "What about cocktail highboys?", a: "A fitted spandex cover is the usual choice. A long round cloth tied with a sash is the other common look." },
    ],
    tools: ["linens", "tables-and-chairs"],
  },
  {
    slug: "string-lights-vs-uplighting",
    title: "String Lights vs Uplighting: Which Event Lighting Do You Need?",
    description: "String lights or uplights for your wedding or party? Compare where each works, the mood they create, power needs and how many you need, with a lighting calculator and Chicago rental prices.",
    a: { id: "string-lights", name: "String lights", item: "string-lights" },
    b: { id: "uplight", name: "Uplights", item: "uplight" },
    answer: "String lights hang overhead and create a warm, glowing ceiling, ideal for tents, patios and backyards. Uplights sit on the floor and wash walls or columns with colour, ideal for ballrooms, lofts and halls with walls worth lighting. Many events use both: string lights for the canopy, uplights for walls and the bar.",
    rows: [
      ["Where", "Overhead: tents, patios, yards", "Floor level: walls, columns, trees"],
      ["Mood", "Warm, cosy, bistro glow", "Bold colour washes, room transformation"],
      ["Colour", "Usually warm white", "Usually any colour"],
      ["Power", "Needs power at the end of each run", "Battery-powered models need no cords"],
      ["How many", "Feet of strand for your space", "About one every 6-10 ft of wall"],
    ],
    chooseA: ["You're outdoors or under a tent", "You want a cosy, overhead glow", "There's no wall to light"],
    chooseB: ["You're in a ballroom, hall or loft", "You want your colours on the walls", "Power outlets are scarce (battery uplights)"],
    body: [
      { h: "How much you need", p: ["String lights are measured in feet and depend on the pattern you hang them in. Uplights depend on how much wall you want to wash. The lighting calculator works out both for your space."] },
      { h: "Power and setup", p: ["String lights need a power source where each run ends, which affects where they can go in a tent or yard. Battery-powered uplights can sit anywhere, which makes them easy to place around a room. Tell your rental company where outlets are."] },
    ],
    faqs: [
      { q: "Can I use uplights outdoors?", a: "Many can light trees, walls and tent sides outdoors. Check with your rental company about weather protection." },
      { q: "When do lights turn on?", a: "Plan for them to be on before sunset. Check the sunset time on your date, especially in fall and winter." },
      { q: "How many uplights for a ballroom?", a: "It depends on the wall length and the look. Spacing one every 6 to 10 feet is a common approach; the calculator lets you set it." },
    ],
    tools: ["lighting", "tent-size"],
  },
  {
    slug: "wood-dance-floor-vs-led-dance-floor",
    title: "Wood-Look vs LED Dance Floor: Which Should You Rent?",
    description: "Classic wood-look or white vinyl dance floor, or a light-up LED floor? Compare look, sizing, power and price per square foot, with a dance floor size calculator and Chicago rental prices.",
    a: { id: "dance-floor", name: "Wood-look dance floor", item: "dance-floor" },
    b: { id: "led-dance-floor", name: "LED dance floor", item: "led-dance-floor" },
    answer: "A wood-look or white vinyl dance floor is built from 3 by 3 foot panels and gives a classic, timeless look that suits any style. An LED dance floor lights up and changes colour, which makes it the centre of the party but needs power and costs more per square foot. Size either with our dance floor calculator.",
    rows: [
      ["Look", "Classic wood or clean white", "Light-up, programmable colour"],
      ["Sizing", "3' x 3' panels", "Panels priced per sq ft"],
      ["Power", "None needed", "Needs power"],
      ["Best for", "Weddings, galas, any style", "Sweet 16s, quinceañeras, parties"],
      ["Photos", "Neutral background", "Colourful, lively"],
    ],
    chooseA: ["You want a timeless look", "There's no power near the floor", "Budget matters more than wow factor"],
    chooseB: ["The dance floor is the main event", "It's a teen party, quinceañera or celebration with a DJ", "You want colour that matches the theme"],
    body: [
      { h: "Sizing", p: ["Both are sized by how many guests dance at once. Give each dancer about 9 square feet, one 3' x 3' panel, and keep the floor close to square. The dance floor calculator does the maths and shows rough prices for both."] },
      { h: "Setup", p: ["Dance floors need a flat, firm surface. On grass, ask about a subfloor. LED floors also need a power source nearby, so plan where the cords run."] },
    ],
    faqs: [
      { q: "How big should a dance floor be for 150 guests?", a: "If a quarter dance at once, about 18' x 21'. Use the calculator for your crowd." },
      { q: "Can a dance floor go in a tent?", a: "Yes, and it's common. Include its square footage when you size the tent." },
      { q: "Is a white dance floor slippery?", a: "Rental floors are made for dancing. Ask your rental company about the surface they supply." },
    ],
    tools: ["dance-floor", "tent-size"],
  },
  {
    slug: "highboy-vs-lowboy-cocktail-tables",
    title: "Highboy vs Lowboy Cocktail Tables: Which Do You Need?",
    description: "Cocktail highboys or lowboys for your cocktail hour or party? Compare height, seating, guest flow and linens, with rental prices and a tables and chairs calculator.",
    a: { id: "cocktail-highboy", name: "Cocktail highboy", item: "cocktail-highboy" },
    b: { id: "cocktail-lowboy", name: "Cocktail lowboy", item: "cocktail-lowboy" },
    answer: "Highboys are bar-height cocktail tables (about 42 inches) that guests stand at, which keeps a cocktail hour moving and mingling. Lowboys are standard-height round tables used with chairs or lounge seating, so guests settle in. Use highboys for mingling and short receptions, lowboys when older guests need a seat.",
    rows: [
      ["Height", "Bar height, about 42\"", "Table height, about 30\""],
      ["Guests", "Stand and mingle", "Sit down"],
      ["Flow", "Keeps people moving", "People settle in"],
      ["Linens", "Spandex cover or tied cloth", "Round cloth"],
      ["Best for", "Cocktail hour, networking", "Lounges, longer receptions, older guests"],
    ],
    chooseA: ["You want guests to mingle", "Cocktail hour is short", "Space is tight"],
    chooseB: ["Older guests or kids need a seat", "The reception is cocktail-style all night", "You're building lounge areas"],
    body: [
      { h: "How many", p: ["The tables and chairs calculator starts at one highboy for every eight guests during cocktail hour, and you can change it. Mixing in a few lowboys with chairs is a kind touch for guests who'd rather sit."] },
      { h: "Linens", p: ["Spandex covers are the go-to for highboys because they hug the table. The tablecloth calculator sizes both."] },
    ],
    faqs: [
      { q: "How many cocktail tables per guest?", a: "There's no fixed rule; it depends on how relaxed you want it. The calculator starts at one per eight guests." },
      { q: "Can I use both?", a: "Yes. A mix gives standing guests a place for drinks and gives others a seat." },
      { q: "Do highboys need chairs?", a: "Usually no. Bar stools are an option if you want some seating at bar height." },
    ],
    tools: ["tables-and-chairs", "linens"],
  },
  {
    slug: "patio-heater-vs-tent-heater",
    title: "Patio Heater vs Forced-Air Tent Heater for Outdoor Events",
    description: "Patio heaters or a forced-air tent heater for a fall or spring event in Chicago? Compare open vs enclosed spaces, coverage, fuel and setup, with rental prices and a rain plan checklist.",
    a: { id: "patio-heater", name: "Patio heater", item: "patio-heater" },
    b: { id: "tent-heater", name: "Forced-air tent heater", item: "tent-heater" },
    answer: "Patio heaters are free-standing propane heaters that warm guests close by, best for open patios and tents with sidewalls up. A forced-air tent heater blows warm air through ducts into an enclosed tent, heating the whole space; our catalog lists one as heating 800 to 1,000 sq ft. Choose by whether your space is open or enclosed.",
    rows: [
      ["Space", "Open patios and open tents", "Enclosed tents with sidewalls down"],
      ["How it heats", "Radiant heat around the heater", "Warm air ducted into the tent"],
      ["Placement", "Among guests", "Outside the tent, ducted in"],
      ["Fuel", "Propane (extra)", "Fuel extra"],
      ["Feel", "Warm near the heater", "Evenly warm space"],
    ],
    chooseA: ["Your patio or tent stays open", "You want warm spots around tables or a lounge", "The night is only a little cool"],
    chooseB: ["Sidewalls will be down", "It's a cold spring, fall or winter event", "You want the whole tent comfortable"],
    body: [
      { h: "Open vs enclosed", p: ["Heat escapes from an open space, so patio heaters work by warming people close to them. In a closed tent, a ducted heater can warm the whole space. Plan your sidewalls and heating together in the rain plan checklist."] },
      { h: "Safety and setup", p: ["Your rental company will tell you where heaters can go and how much clearance they need. Ask about fuel, who refills it and how long it lasts for your event."] },
    ],
    faqs: [
      { q: "How many patio heaters do I need?", a: "It depends on the heater model, the space and the weather. Ask your rental company for their coverage guidance for the heaters they supply." },
      { q: "Can I use patio heaters inside a closed tent?", a: "Ask your rental company. Enclosed spaces have ventilation and clearance rules, which is why ducted heaters are used for closed tents." },
      { q: "When should I decide on heat?", a: "Reserve early for fall dates, then make the final call with your weather plan a few days before." },
    ],
    tools: ["rain-plan", "tent-size"],
  },
];

export const getComparison = (slug: string) => comparisons.find((c) => c.slug === slug);

export const comparisonPath = (c: Pick<Comparison, "slug">) => `/rental-comparisons/${c.slug}`;
