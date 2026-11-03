import { fixed, per, type PartyIdea } from "./types";

// Theme ideas for weddings, Indian weddings, quinceañeras, showers and anniversaries.

export const celebrationIdeas: PartyIdea[] = [
  // Weddings
  {
    slug: "garden-romance-wedding",
    type: "weddings",
    name: "Garden romance wedding",
    tagline: "Soft greens, white florals and candlelight under the trees",
    summary:
      "A garden romance wedding pairs white or clear chairs with floor-length ivory linens, low greenery runners and clusters of candles. It suits a tented lawn, a conservatory or a backyard and photographs beautifully in late-afternoon light.",
    scene: "garden-ceremony",
    sceneAlt: "Garden wedding ceremony with white chairs in rows facing a floral arch",
    palette: [{ name: "Ivory", hex: "#F6F1E7" }, { name: "Sage", hex: "#A3B18A" }, { name: "Eucalyptus", hex: "#6B7F6A" }, { name: "Blush", hex: "#E8C4C0" }],
    decor: ["Low garland runners of eucalyptus and olive down each table", "Clusters of three pillar candles per table in glass", "A floral ceremony arch reused as the sweetheart backdrop", "Wooden or ivory signage with hand lettering"],
    setup: {
      backyard: "Ceremony rows on the lawn facing the arch, then a 30 by 60 frame tent for dinner with rounds of eight and a dance floor at the far end. String lights draped from the tent poles.",
      indoors: "Rounds of eight with floor-length ivory linens around a central dance floor, the arch moved behind the sweetheart table after the ceremony.",
    },
    activities: [
      { name: "Lawn games at cocktail hour", text: "Croquet or cornhole while the couple takes photos.", rentals: ["yard-games"] },
      { name: "Flower-wall photo spot", text: "A green or white flower wall by the bar.", rentals: ["flower-wall"] },
      { name: "Lemonade and iced-tea station", text: "Self-serve dispensers for a warm afternoon.", rentals: ["beverage-dispenser"] },
    ],
    props: ["Seed-packet favours", "Hand-lettered welcome sign on an easel", "Petal cones for the recessional", "Bud vases with garden roses"],
    rentals: [
      per("white-resin-folding", 1, "Garden chairs at every seat"),
      per("round-floor-length", 0.125, "Ivory floor-length cloths for each round"),
      fixed("ceremony-arch", 1, "Frames the vows, then the sweetheart table"),
      per("candle-holder", 0.4, "Candle clusters on every table", 4),
      per("string-lights", 0.02, "Bistro lights over the lawn or tent", 2),
      fixed("flower-wall", 1, "A photo backdrop by the bar"),
    ],
    faqs: [
      { q: "What chairs suit a garden wedding?", a: "White resin garden chairs, clear Chiavari or cross-back chairs all work. White resin is the budget-friendly choice; cross-backs add a rustic note." },
      { q: "Do I need a tent for a garden wedding in Chicago?", a: "Plan one, even for a summer date. Storms move in quickly, and a tent also gives you shade and somewhere to hang lights." },
    ],
  },
  {
    slug: "black-tie-gold-wedding",
    type: "weddings",
    name: "Black-tie gold wedding",
    tagline: "Gold Chiavari, sequins and warm uplighting",
    summary:
      "A black-tie gold wedding uses gold Chiavari chairs, chargers and gold flatware against ivory or black linens, with sequin overlays and amber uplighting on the walls. It suits ballrooms, lofts and evening receptions.",
    scene: "wedding-reception",
    sceneAlt: "Ballroom reception with gold Chiavari chairs, gold chargers and candlelight",
    palette: [{ name: "Gold", hex: "#C9A24A" }, { name: "Ivory", hex: "#F7F2E8" }, { name: "Black", hex: "#1D1A16" }, { name: "Champagne", hex: "#E8D7B5" }],
    decor: ["Gold chargers under ivory plates", "Sequin overlays catching candlelight", "Tall centrepieces alternating with low ones", "Amber uplighting on every wall"],
    setup: {
      backyard: "A clear-top or frame tent with chandeliers over the dance floor, rounds of ten and a lounge corner by the bar.",
      indoors: "Rounds of ten around a central dance floor, a long kings table for the wedding party, lounge seating by the bar and uplights every 8 to 10 feet of wall.",
    },
    activities: [
      { name: "Champagne wall welcome", text: "Guests take a glass as they arrive.", rentals: ["champagne-wall"] },
      { name: "Mirror photo booth", text: "Elegant prints that match a formal night.", rentals: ["mirror-photo-booth"] },
      { name: "Live band or DJ on a stage", text: "A low stage lifts performers above the floor.", rentals: ["stage-deck"] },
    ],
    props: ["Gold-foil menus", "Monogram napkin rings", "A gold-frame seating chart"],
    rentals: [
      per("gold-chiavari", 1, "Gold Chiavari chair at every seat"),
      per("charger-plate", 1, "Gold chargers frame each place"),
      per("gold-flatware", 3, "Gold fork, knife and spoon per guest"),
      per("sequin-overlay", 0.1, "Sequin overlays on every round"),
      per("uplight", 0.08, "Amber uplighting on the walls", 8),
      per("champagne-flute", 1, "A flute for the toast"),
    ],
    faqs: [
      { q: "How many uplights do I need for a ballroom?", a: "About one every 8 to 10 feet of wall. A typical 150-guest ballroom takes 12 to 16." },
      { q: "Gold or silver flatware with gold chargers?", a: "Gold, for a fully warm look. Silver flatware with gold chargers is a softer, mixed-metal look." },
    ],
  },
  {
    slug: "rustic-farm-table-wedding",
    type: "weddings",
    name: "Rustic farm-table wedding",
    tagline: "Long wooden tables, cross-back chairs and bistro lights",
    summary:
      "A rustic farm-table wedding seats guests family-style at long wooden tables with cross-back chairs, runners instead of full cloths, and bistro lights overhead. It suits barns, farms, breweries and big backyards.",
    scene: "farm-table-dinner",
    sceneAlt: "Long farm tables with cross-back chairs, greenery runners and bistro lights",
    palette: [{ name: "Walnut", hex: "#6B4A2F" }, { name: "Linen", hex: "#EDE4D3" }, { name: "Olive", hex: "#7A7D4E" }, { name: "Rust", hex: "#B5643C" }],
    decor: ["Bare wood tables with linen runners", "Mason jars or bud vases with wildflowers", "Edison bulb string lights", "Wooden crate risers on the buffet"],
    setup: {
      backyard: "Rows of farm tables under a 30 by 60 tent or open sky, with 5-foot aisles between rows, a bar at one end and lawn games at the other.",
      indoors: "In a barn or loft, run three or four long rows the length of the room and keep the dance floor at the end nearest the band.",
    },
    activities: [
      { name: "Lawn games", text: "Giant Jenga and cornhole by the bar.", rentals: ["yard-games"] },
      { name: "Family-style dinner", text: "Platters passed down the table instead of plated service.", rentals: ["serving-tray"] },
      { name: "S'mores or dessert bar", text: "A long table with cake stands and treats.", rentals: ["cake-stand", "banquet-8ft"] },
    ],
    props: ["Chalkboard signs", "Wildflower bouquets in jars", "Burlap or linen napkin ties"],
    rentals: [
      per("farm-table", 0.1, "Farm tables seat about ten each"),
      per("crossback", 1, "Cross-back chair at every seat"),
      per("table-runner", 0.1, "Linen runner down each farm table"),
      per("cloth-napkins", 1, "A cloth napkin at every seat"),
      per("string-lights", 0.02, "Bistro lights over the tables", 2),
      per("serving-tray", 0.1, "Platters for family-style service", 4),
    ],
    faqs: [
      { q: "How many guests fit at a farm table?", a: "An 8-foot farm table seats eight to ten. Pushed end to end, you gain two seats per table because the ends are shared." },
      { q: "Do farm tables need tablecloths?", a: "No, the wood is the point. A runner down the centre protects it from candles and spills." },
    ],
  },
  // Indian weddings
  {
    slug: "marigold-mehndi",
    type: "indian-weddings",
    name: "Marigold mehndi party",
    tagline: "Saffron, fuchsia and floor-level lounges",
    summary:
      "A marigold mehndi uses bright saffron and fuchsia with marigold garlands, low lounge seating and string lights, so guests can relax while henna artists work. It suits a backyard or a tented lawn in the afternoon or evening.",
    scene: "boho-lounge",
    sceneAlt: "Colourful boho lounge with sofas, cushions and low tables",
    palette: [{ name: "Marigold", hex: "#F2A900" }, { name: "Fuchsia", hex: "#C2185B" }, { name: "Emerald", hex: "#1E7F5C" }, { name: "Gold", hex: "#C9A24A" }],
    decor: ["Marigold garland strands as a backdrop", "Brass lanterns and diyas on low tables", "Colourful cushions on every sofa", "Umbrellas or canopies in bright fabric"],
    setup: {
      backyard: "Lounge clusters on rugs across the lawn, a canopy over the henna artists, a food line along one fence and string lights criss-crossed overhead.",
      indoors: "Clear the centre for dancing, ring the room with sofas and armchairs, and set the henna station near the best light.",
    },
    activities: [
      { name: "Henna station", text: "Two or three armchairs for guests waiting for henna.", rentals: ["lounge-armchair"] },
      { name: "Bangle bar", text: "A table of bangles to choose from.", rentals: ["banquet-6ft"] },
      { name: "Chai station", text: "Urns of masala chai through the afternoon.", rentals: ["coffee-urn"] },
      { name: "Dholki and dance", text: "A speaker for the playlist between live songs.", rentals: ["pa-system"] },
    ],
    props: ["Marigold garlands", "Floor cushions and rugs", "Brass lanterns", "Mehndi favour cones"],
    rentals: [
      per("lounge-sofa", 0.02, "Sofas for lounge clusters", 2),
      per("lounge-armchair", 0.04, "Armchairs for guests waiting for henna", 4),
      per("coffee-table", 0.02, "Low tables for chai and snacks", 2),
      per("string-lights", 0.02, "Lights criss-crossed overhead", 2),
      fixed("canopy-10x10", 1, "Shade over the henna artists"),
      fixed("coffee-urn", 2, "Masala chai on tap"),
    ],
    faqs: [
      { q: "How many henna artists do I need?", a: "One artist covers about 15 to 20 guests with simple designs in three hours. The bride's own henna takes several hours on its own." },
      { q: "What seating works for a mehndi?", a: "A mix of sofas, armchairs and a few chairs for elders. Floor seating looks beautiful but always add chairs." },
    ],
  },
  {
    slug: "royal-sangeet",
    type: "indian-weddings",
    name: "Royal sangeet night",
    tagline: "Jewel tones, a big stage and a bigger dance floor",
    summary:
      "A royal sangeet sets a stage for performances, a dance floor for most of the room, gold Chiavari seating and jewel-toned uplighting. Plan the floor for a third of guests dancing at once.",
    scene: "dance-party",
    sceneAlt: "Dance floor with colourful uplighting and guests dancing",
    palette: [{ name: "Ruby", hex: "#9B111E" }, { name: "Royal blue", hex: "#1F3A93" }, { name: "Emerald", hex: "#1E7F5C" }, { name: "Gold", hex: "#C9A24A" }],
    decor: ["Uplights in ruby and blue", "A draped stage backdrop", "Gold chargers on every place", "LED or wood dance floor in the centre"],
    setup: {
      backyard: "A pole tent with the stage at one end, dance floor in the middle and rounds on three sides.",
      indoors: "Stage against the long wall, dance floor in front, rounds fanning out behind and a bar at the back.",
    },
    activities: [
      { name: "Family performances", text: "A stage with two wireless mics for the hosts.", rentals: ["stage-deck", "wireless-microphone"] },
      { name: "Couple's entrance", text: "Uplights and a clear aisle to the stage.", rentals: ["uplight"] },
      { name: "360 photo booth", text: "Slow-motion videos of guests in their outfits.", rentals: ["photo-booth-360"] },
    ],
    props: ["Printed programme of performances", "Dandiya sticks", "Custom monogram on the backdrop"],
    rentals: [
      fixed("stage-deck", 8, "A 16 by 16 foot stage for performances"),
      per("dance-floor", 0.33, "Room for a third of guests dancing", 16),
      per("uplight", 0.06, "Jewel-tone uplighting", 12),
      fixed("pa-system", 1, "Sound for performances and hosts"),
      fixed("wireless-microphone", 2, "Mics for the hosts"),
      per("gold-chiavari", 1, "Gold Chiavari seating"),
    ],
    faqs: [
      { q: "What's the difference between a sangeet and a reception setup?", a: "The sangeet puts the stage and dance floor first and keeps dinner simpler. The reception adds formal place settings and a sweetheart sofa on the stage." },
    ],
  },
  {
    slug: "ivory-and-gold-reception",
    type: "indian-weddings",
    name: "Ivory and gold reception",
    tagline: "A formal dinner for hundreds with a sweetheart stage",
    summary:
      "An ivory and gold reception seats several hundred guests at rounds of ten facing a sweetheart stage, with gold chargers, ivory linens and chandeliers. It photographs well and lets the couple's outfits stand out.",
    scene: "sweetheart-stage",
    sceneAlt: "Decorated stage with a sweetheart sofa for a reception",
    palette: [{ name: "Ivory", hex: "#F7F2E8" }, { name: "Gold", hex: "#C9A24A" }, { name: "Blush", hex: "#E8C4C0" }],
    decor: ["Sweetheart sofa on a stage with a floral backdrop", "Chandeliers over the dance floor", "Gold chargers and gold flatware", "Floor-length ivory linens"],
    setup: {
      backyard: "A large pole tent with the stage at one end and a buffet line along the side; generators and restrooms out of sight.",
      indoors: "Rounds of ten across the ballroom, stage at the front, buffet along one wall and dance floor between the stage and the first tables.",
    },
    activities: [
      { name: "Buffet stations", text: "Chafers for live and hot stations.", rentals: ["chafing-dish"] },
      { name: "Stage photos with family", text: "A sweetheart sofa on the stage.", rentals: ["lounge-sofa", "stage-deck"] },
      { name: "Late-night chai and dessert", text: "Urns and cake stands.", rentals: ["coffee-urn", "cake-stand"] },
    ],
    props: ["Floral backdrop by your decorator", "Welcome sign in English and Hindi or Punjabi", "Favour boxes of mithai"],
    rentals: [
      per("round-72", 0.1, "72-inch rounds seat ten"),
      per("round-floor-length", 0.1, "Ivory floor-length cloths"),
      per("charger-plate", 1, "Gold chargers"),
      fixed("lounge-sofa", 1, "Sweetheart sofa on the stage"),
      per("chafing-dish", 0.05, "Buffet chafers", 6),
      fixed("chandelier", 2, "Over the dance floor"),
    ],
    faqs: [
      { q: "How many chafing dishes does a 300-guest buffet need?", a: "One chafer per hot dish per line. With two buffet lines of eight dishes, plan 16 chafers." },
    ],
  },
  // Quinceañeras
  {
    slug: "enchanted-garden-quinceanera",
    type: "quinceaneras",
    name: "Enchanted garden quinceañera",
    tagline: "Blush, greenery and a flower-wall throne",
    summary:
      "An enchanted garden quinceañera uses blush and sage linens, a flower wall behind the throne chair, chandeliers and fairy lights. It feels like a storybook garden indoors or under a tent.",
    scene: "garden-ceremony",
    sceneAlt: "Garden setting with a floral arch and white chairs",
    palette: [{ name: "Blush", hex: "#E8C4C0" }, { name: "Sage", hex: "#A3B18A" }, { name: "Gold", hex: "#C9A24A" }, { name: "Ivory", hex: "#F6F1E7" }],
    decor: ["Flower wall behind the throne", "Greenery garland on the court table", "Chandeliers over the dance floor", "Gold Chiavari chairs"],
    setup: {
      backyard: "A frame tent with chandeliers, a dance floor in the centre and the throne on a small stage.",
      indoors: "Rounds around the dance floor, the court table and throne along one wall with the flower wall behind.",
    },
    activities: [
      { name: "Throne moment", text: "The throne chair framed by a flower wall.", rentals: ["throne-chair", "flower-wall"] },
      { name: "Court waltz", text: "A clear dance floor and soft uplighting.", rentals: ["dance-floor", "uplight"] },
      { name: "Light-up XV", text: "Marquee letters for photos.", rentals: ["marquee-letters"] },
    ],
    props: ["Tiara and last doll", "Butterfly or floral favours", "Custom programme"],
    rentals: [
      fixed("throne-chair", 1, "The quinceañera's seat"),
      fixed("flower-wall", 1, "Backdrop behind the throne"),
      per("gold-chiavari", 1, "Gold Chiavari seating"),
      per("dance-floor", 0.25, "Floor for the waltz and guests", 16),
      fixed("marquee-letters", 2, "Light-up XV"),
      fixed("chandelier", 2, "Over the dance floor"),
    ],
    faqs: [
      { q: "Where should the throne chair go?", a: "At the edge of the dance floor on a small stage, so guests can see the changing of the shoes and photographers have a clean background." },
    ],
  },
  {
    slug: "midnight-glam-quinceanera",
    type: "quinceaneras",
    name: "Midnight glam quinceañera",
    tagline: "Navy, silver and an LED dance floor",
    summary:
      "A midnight glam quinceañera uses navy and silver linens, silver Chiavari chairs, sequin overlays and an LED dance floor that lights the waltz.",
    scene: "corporate-gala",
    sceneAlt: "Evening reception with uplighting and a stage",
    palette: [{ name: "Navy", hex: "#1B2A4A" }, { name: "Silver", hex: "#C0C4CC" }, { name: "Ice blue", hex: "#BFD7EA" }],
    decor: ["Silver sequin overlays", "Blue uplighting", "LED dance floor", "Mirror photo booth"],
    setup: {
      backyard: "A tent with sidewalls and blue uplighting, LED floor in the middle.",
      indoors: "Ballroom rounds around the LED floor with the court table on a stage.",
    },
    activities: [
      { name: "LED floor waltz", text: "The court dances on a lit floor.", rentals: ["led-dance-floor"] },
      { name: "Mirror photo booth", text: "Glam prints for every guest.", rentals: ["mirror-photo-booth"] },
    ],
    props: ["Silver tiara", "Star-shaped favours", "Glow sticks for the last dance"],
    rentals: [
      per("silver-chiavari", 1, "Silver Chiavari seating"),
      per("sequin-overlay", 0.125, "Silver sequin overlays"),
      per("led-dance-floor", 2.25, "An LED floor sized for the court and guests", 144),
      per("uplight", 0.08, "Blue uplighting", 8),
      fixed("mirror-photo-booth", 1, "Glam photo booth"),
      fixed("throne-chair", 1, "The quinceañera's seat"),
    ],
    faqs: [
      { q: "How big should an LED dance floor be?", a: "LED floors are priced per square foot. For 150 guests, about 300 to 400 square feet fits the court's waltz and guests." },
    ],
  },
  // Baby showers
  {
    slug: "oh-baby-garden-brunch",
    type: "baby-showers",
    name: "Oh baby garden brunch",
    tagline: "Sage, cream and a lemonade stand",
    summary:
      "A garden brunch baby shower uses sage and cream linens, white garden chairs, a flower-wall backdrop and a self-serve lemonade station. It works in a backyard or a bright indoor room.",
    scene: "baby-shower",
    sceneAlt: "Baby shower brunch table with florals and pastel linens",
    palette: [{ name: "Sage", hex: "#A3B18A" }, { name: "Cream", hex: "#F4EDE1" }, { name: "Peach", hex: "#F3C9A8" }],
    decor: ["Flower wall behind the parent-to-be's seat", "Bud vases down the table", "Pastel balloon garland", "Cake on a stand at the centre"],
    setup: {
      backyard: "A canopy over a long table, a gift table to the side and the lemonade stand in the shade.",
      indoors: "Rounds of eight, a dessert table and gift table along the wall, the flower wall as the focal point.",
    },
    activities: [
      { name: "Guess the bump", text: "Ribbon and scissors; closest guess wins." },
      { name: "Onesie decorating", text: "A covered table with fabric markers.", rentals: ["banquet-6ft"] },
      { name: "Lemonade stand", text: "Two dispensers with fruit slices.", rentals: ["beverage-dispenser"] },
    ],
    props: ["Balloon garland", "Plain onesies and fabric markers", "Advice cards for the parents", "Seed or honey favours"],
    rentals: [
      per("white-resin-folding", 1, "Garden chairs for every guest"),
      per("round-floor-length", 0.125, "Cream cloths on every round"),
      fixed("flower-wall", 1, "Photo backdrop"),
      fixed("beverage-dispenser", 2, "Lemonade and iced tea"),
      fixed("cake-stand", 1, "For the cake"),
      per("salad-plate", 1, "Brunch and dessert plates"),
    ],
    faqs: [
      { q: "How long does a baby shower usually last?", a: "Two to three hours, usually late morning or early afternoon." },
    ],
  },
  {
    slug: "twinkle-little-star-shower",
    type: "baby-showers",
    name: "Twinkle little star shower",
    tagline: "Navy, gold and star lights",
    summary:
      "A twinkle little star shower uses navy and gold, gold chargers, star garlands and warm string lights. It works well for an afternoon-into-evening party or a co-ed shower.",
    scene: "cocktail-hour",
    sceneAlt: "Warmly lit room with cocktail tables and soft lights",
    palette: [{ name: "Navy", hex: "#1B2A4A" }, { name: "Gold", hex: "#C9A24A" }, { name: "Cloud", hex: "#F2F2F0" }],
    decor: ["Star garlands", "Gold chargers on white linens", "String lights", "A moon and stars backdrop"],
    setup: {
      backyard: "String lights over a long table and a lounge corner for gifts.",
      indoors: "Rounds with gold chargers, a lounge for gift opening and a dessert table.",
    },
    activities: [
      { name: "Wishes for baby", text: "Guests write wishes on paper stars." },
      { name: "Gift circle lounge", text: "Sofa and armchairs for gift opening.", rentals: ["lounge-sofa", "lounge-armchair"] },
    ],
    props: ["Paper stars and pens", "Moon backdrop", "Star cookies"],
    rentals: [
      per("charger-plate", 1, "Gold chargers"),
      per("round-floor-length", 0.125, "White cloths"),
      fixed("string-lights", 2, "Twinkle lights"),
      fixed("lounge-sofa", 1, "Gift-opening sofa"),
      fixed("lounge-armchair", 2, "Gift-opening armchairs"),
    ],
    faqs: [
      { q: "Is a star theme good for a gender-neutral shower?", a: "Yes. Navy, gold and white suit any baby and photograph well." },
    ],
  },
  {
    slug: "teddy-bear-picnic-shower",
    type: "baby-showers",
    name: "Teddy bear picnic shower",
    tagline: "Gingham, honey tones and a picnic on the lawn",
    summary:
      "A teddy bear picnic shower sets low tables or a long farm table on the lawn with gingham runners, honey-coloured accents and a sweets table. It's relaxed and great for families with kids.",
    scene: "backyard-birthday",
    sceneAlt: "Backyard party with long tables and string lights",
    palette: [{ name: "Honey", hex: "#D9A441" }, { name: "Cream", hex: "#F4EDE1" }, { name: "Gingham red", hex: "#C0392B" }],
    decor: ["Gingham runners", "Teddy bears as centrepieces", "Wicker picnic baskets", "Honey-jar favours"],
    setup: {
      backyard: "A farm table under a canopy, kids' tables nearby and a picnic blanket corner.",
      indoors: "Banquet tables with gingham runners and a reading corner with a sofa.",
    },
    activities: [
      { name: "Build-a-bear station", text: "Stuff a bear for the baby's nursery.", rentals: ["banquet-6ft"] },
      { name: "Kids' corner", text: "Small tables and chairs for older siblings.", rentals: ["kids-table", "kids-chair"] },
    ],
    props: ["Teddy bears", "Gingham runners", "Honey favours", "Picnic baskets"],
    rentals: [
      per("farm-table", 0.1, "Farm tables for the picnic"),
      per("crossback", 1, "Cross-back chairs"),
      fixed("canopy-10x10", 1, "Shade over the table"),
      fixed("kids-table", 1, "For siblings"),
      fixed("kids-chair", 6, "For siblings"),
    ],
    faqs: [
      { q: "Can I have a picnic shower in a park?", a: "Yes, in many Chicago parks. Check whether you need a permit for canopies or more than a small group, and bring weights instead of stakes." },
    ],
  },
  // Bridal showers
  {
    slug: "bubbly-brunch-bridal-shower",
    type: "bridal-showers",
    name: "Bubbly brunch bridal shower",
    tagline: "Mimosa bar, blush linens and a neon sign",
    summary:
      "A bubbly brunch bridal shower centres on a mimosa bar and a long blush tablescape, with a neon sign behind the bride's seat. It works in a home, a restaurant room or a backyard.",
    scene: "bar-setup",
    sceneAlt: "Styled bar with glassware ready for a party",
    palette: [{ name: "Blush", hex: "#E8C4C0" }, { name: "Champagne", hex: "#E8D7B5" }, { name: "White", hex: "#FFFFFF" }],
    decor: ["Neon sign with a phrase or the couple's name", "Blush runner and candles", "Champagne wall at the entrance"],
    setup: {
      backyard: "Long table under bistro lights, the mimosa bar by the door.",
      indoors: "One long table down the room, a lounge for gifts and the bar at one end.",
    },
    activities: [
      { name: "Mimosa bar", text: "Flutes and juices.", rentals: ["champagne-flute", "beverage-dispenser"] },
      { name: "Champagne wall", text: "A grab-a-glass welcome.", rentals: ["champagne-wall"] },
      { name: "Advice for the couple", text: "Cards collected in a box." },
    ],
    props: ["Juices and fruit garnish", "Advice cards", "Bride sash"],
    rentals: [
      per("champagne-flute", 2, "Two flutes per guest for the mimosa bar"),
      fixed("champagne-wall", 1, "Grab-a-glass welcome"),
      fixed("neon-sign", 1, "Photo backdrop"),
      per("banquet-8ft", 0.125, "Long tablescape"),
      per("table-runner", 0.125, "Blush runners"),
      per("crossback", 1, "Cross-back chairs"),
    ],
    faqs: [
      { q: "How many flutes for a mimosa bar?", a: "Two per guest for a two-hour brunch, unless someone washes glasses during the party." },
    ],
  },
  {
    slug: "garden-tea-party-bridal-shower",
    type: "bridal-showers",
    name: "Garden tea party shower",
    tagline: "Saucers, cake stands and florals",
    summary:
      "A garden tea party bridal shower uses rounds with floral centrepieces, cups and saucers, tiered cake stands and pastel linens. It's a classic daytime look for 20 to 60 guests.",
    scene: "garden-ceremony",
    sceneAlt: "Garden setting with florals and white chairs",
    palette: [{ name: "Lavender", hex: "#C8B6E2" }, { name: "Mint", hex: "#BFE3D0" }, { name: "Rose", hex: "#E8B4B8" }],
    decor: ["Mismatched florals", "Tiered cake stands", "Pastel linens", "Lace runners"],
    setup: {
      backyard: "Rounds of six on the lawn under a canopy, tea station in the shade.",
      indoors: "48-inch rounds for intimate tables, dessert table along the wall.",
    },
    activities: [
      { name: "Tea tasting", text: "Urns of hot water and a tray of teas.", rentals: ["coffee-urn", "serving-tray"] },
      { name: "Hat contest", text: "Guests wear their best garden hat." },
    ],
    props: ["Assorted teas", "Garden hats", "Recipe cards for the couple"],
    rentals: [
      per("round-48", 0.17, "Intimate rounds of six"),
      per("coffee-cup-saucer", 1, "Cup and saucer per guest"),
      fixed("cake-stand", 3, "Tiered treats"),
      fixed("coffee-urn", 1, "Hot water for tea"),
      per("white-resin-folding", 1, "Garden chairs"),
    ],
    faqs: [
      { q: "What size tables for a tea party?", a: "48-inch rounds seat four to six and feel more intimate than 60-inch rounds." },
    ],
  },
  // Anniversaries
  {
    slug: "golden-50th-anniversary",
    type: "anniversary-parties",
    name: "Golden 50th anniversary",
    tagline: "Gold accents, the original wedding song and toasts",
    summary:
      "A golden anniversary celebrates 50 years with gold chargers and flatware, a photo display of the wedding day, toasts on a microphone and a small dance floor for the couple's song.",
    scene: "wedding-reception",
    sceneAlt: "Reception with gold chairs and candlelight",
    palette: [{ name: "Gold", hex: "#C9A24A" }, { name: "Ivory", hex: "#F7F2E8" }, { name: "Burgundy", hex: "#6D1A2B" }],
    decor: ["Wedding photos framed on every table", "Gold chargers", "Candles", "Gold 50 marquee numbers"],
    setup: {
      backyard: "A tent with rounds, a small dance floor and string lights.",
      indoors: "Rounds, a head table for the couple and a photo display by the entrance.",
    },
    activities: [
      { name: "First dance again", text: "A small floor for the couple's song.", rentals: ["dance-floor"] },
      { name: "Toasts from family", text: "A PA and two mics.", rentals: ["pa-system", "wireless-microphone"] },
      { name: "Light-up 50", text: "Marquee numbers for photos.", rentals: ["marquee-letters"] },
    ],
    props: ["Wedding album display", "Memory cards", "The original cake topper"],
    rentals: [
      per("charger-plate", 1, "Gold chargers"),
      per("gold-flatware", 3, "Gold flatware"),
      fixed("marquee-letters", 2, "Light-up 50"),
      fixed("dance-floor", 16, "A 12 by 12 foot floor"),
      fixed("wireless-microphone", 2, "For toasts"),
    ],
    faqs: [
      { q: "What colour is a 50th anniversary?", a: "Gold. Many families pair it with ivory and the couple's original wedding colours." },
    ],
  },
  {
    slug: "retirement-garden-party",
    type: "anniversary-parties",
    name: "Retirement garden party",
    tagline: "A relaxed cocktail party with a slideshow and toasts",
    summary:
      "A retirement garden party is a relaxed cocktail party with highboys, a lounge, a slideshow of the career and short toasts. It works in a backyard, a park pavilion or the office.",
    scene: "cocktail-hour",
    sceneAlt: "Cocktail hour with highboy tables",
    palette: [{ name: "Navy", hex: "#1B2A4A" }, { name: "Sage", hex: "#A3B18A" }, { name: "White", hex: "#FFFFFF" }],
    decor: ["Career photo timeline", "Simple greenery", "Bistro lights"],
    setup: {
      backyard: "Highboys on the lawn, a lounge by the house, a TV with the slideshow under a canopy.",
      indoors: "Highboys around the room, a few rounds for older guests, the slideshow on a screen.",
    },
    activities: [
      { name: "Career slideshow", text: "A TV on a stand looping photos.", rentals: ["tv-with-stand"] },
      { name: "Toasts", text: "A microphone for colleagues.", rentals: ["wireless-microphone", "pa-system"] },
    ],
    props: ["Printed photos", "Memory book", "Gift for the retiree"],
    rentals: [
      per("cocktail-highboy", 0.07, "Highboys for mingling", 4),
      per("spandex-highboy", 0.07, "Fitted covers", 4),
      fixed("tv-with-stand", 1, "Slideshow"),
      fixed("lounge-sofa", 1, "Lounge seating"),
      fixed("string-lights", 2, "Lights for the evening"),
    ],
    faqs: [
      { q: "How long should retirement speeches be?", a: "Two to three minutes each, with three or four speakers at most." },
    ],
  },
];
