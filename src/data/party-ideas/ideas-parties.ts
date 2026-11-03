import { fixed, per, type PartyIdea } from "./types";

// Theme ideas for birthdays, kids' parties, graduations, corporate events, backyard parties and holidays.

export const partyIdeas: PartyIdea[] = [
  // Adult birthdays
  {
    slug: "speakeasy-birthday",
    type: "birthday-parties",
    name: "1920s speakeasy birthday",
    tagline: "Black, gold, a bar and a dress code",
    summary:
      "A speakeasy birthday turns a room or garage into a 1920s bar: black and gold, dim amber lighting, a portable bar with a signature cocktail, lounge seating and highboys. Great for 30th, 40th and 50th birthdays.",
    scene: "bar-setup",
    sceneAlt: "Styled bar with glassware and warm lighting",
    palette: [{ name: "Black", hex: "#1D1A16" }, { name: "Gold", hex: "#C9A24A" }, { name: "Burgundy", hex: "#6D1A2B" }],
    decor: ["Amber uplighting", "Gold sequin overlays on highboys", "Feathers and pearls", "A password at the door"],
    setup: {
      backyard: "A frame tent with sidewalls as the 'hidden bar', lounge inside and highboys out front.",
      indoors: "Bar along one wall, highboys in the middle, a lounge corner with low light.",
    },
    activities: [
      { name: "Signature cocktails", text: "A bar with rocks and highball glasses.", rentals: ["portable-bar", "rocks-glass"] },
      { name: "Casino or card table", text: "A round table for poker or blackjack (play money only).", rentals: ["round-60"] },
      { name: "Swing dance floor", text: "A small floor for the Charleston.", rentals: ["dance-floor"] },
      { name: "Photo booth with props", text: "Feather boas, hats and pearls.", rentals: ["photo-booth-360"] },
    ],
    props: ["Feather boas and fedoras", "Play-money casino chips", "Vintage jazz playlist", "Printed cocktail menu"],
    rentals: [
      fixed("portable-bar", 1, "The speakeasy bar"),
      per("rocks-glass", 1.5, "Cocktails and spirits"),
      per("cocktail-highboy", 0.07, "Highboys for mingling", 4),
      per("sequin-overlay", 0.07, "Gold sequin on highboys", 4),
      per("uplight", 0.08, "Amber uplighting", 6),
      fixed("lounge-sofa", 1, "Lounge corner"),
    ],
    faqs: [
      { q: "Can I serve alcohol at a home party?", a: "Yes at a private home. In a park or rented venue, check the alcohol rules; Chicago parks need a permit for alcohol." },
    ],
  },
  {
    slug: "garden-dinner-party-birthday",
    type: "birthday-parties",
    name: "Garden dinner party",
    tagline: "One long table, bistro lights and family-style food",
    summary:
      "A garden dinner party birthday seats everyone at one long table in the backyard under bistro lights, with cross-back chairs, a runner, candles and family-style platters. Ideal for 12 to 40 guests.",
    scene: "farm-table-dinner",
    sceneAlt: "Long farm table dinner with bistro lights",
    palette: [{ name: "Olive", hex: "#7A7D4E" }, { name: "Terracotta", hex: "#C46A4A" }, { name: "Linen", hex: "#EDE4D3" }],
    decor: ["Candles in glass down the table", "Herb and citrus centrepieces", "Linen napkins", "Bistro lights overhead"],
    setup: {
      backyard: "Farm tables end to end down the lawn, lights strung between the house and a pole or tree.",
      indoors: "Clear the living room for one long table; rent chairs so everyone matches.",
    },
    activities: [
      { name: "Toasts between courses", text: "Ask three friends to speak." },
      { name: "Family-style platters", text: "Shared dishes passed down the table.", rentals: ["serving-tray"] },
      { name: "Lawn games after dinner", text: "Bocce or cornhole as the sun goes down.", rentals: ["yard-games"] },
    ],
    props: ["Menu cards", "Herb bundles", "Polaroid camera"],
    rentals: [
      per("farm-table", 0.1, "Long farm table"),
      per("crossback", 1, "Cross-back chairs"),
      per("cloth-napkins", 1, "Linen napkins"),
      per("candle-holder", 0.3, "Candles down the table", 4),
      per("string-lights", 0.04, "Bistro lights", 1),
      per("serving-tray", 0.1, "Family-style platters", 3),
    ],
    faqs: [
      { q: "How long a table for 24 guests?", a: "Three 8-foot farm tables end to end (24 feet) seat 24 to 26." },
    ],
  },
  {
    slug: "neon-glow-birthday",
    type: "birthday-parties",
    name: "Neon glow party",
    tagline: "Black light, neon signs and an LED dance floor",
    summary:
      "A neon glow birthday is a dance party: an LED dance floor, neon signs, colourful uplighting, glow sticks and a DJ. Great for 18th, 21st and 30th birthdays.",
    scene: "dance-party",
    sceneAlt: "Dance floor with colourful lighting",
    palette: [{ name: "Hot pink", hex: "#FF2E88" }, { name: "Electric blue", hex: "#2E7DFF" }, { name: "Lime", hex: "#B6FF2E" }],
    decor: ["Neon sign with the birthday name", "Uplights in pink and blue", "Glow sticks and bracelets"],
    setup: {
      backyard: "A tent with sidewalls for darkness, the LED floor in the middle.",
      indoors: "Clear the room, LED floor in the centre, DJ on a stage at one end.",
    },
    activities: [
      { name: "LED dance floor", text: "The centrepiece of the party.", rentals: ["led-dance-floor"] },
      { name: "360 booth", text: "Slow-mo videos under neon.", rentals: ["photo-booth-360"] },
      { name: "Glow-in-the-dark games", text: "Glow ring toss or glow cornhole.", rentals: ["yard-games"] },
    ],
    props: ["Glow sticks", "Neon face paint", "Black lights"],
    rentals: [
      per("led-dance-floor", 2.25, "LED floor", 144),
      fixed("neon-sign", 1, "Neon name sign"),
      per("uplight", 0.1, "Colour uplighting", 6),
      fixed("photo-booth-360", 1, "360 booth"),
      fixed("pa-system", 1, "Sound"),
    ],
    faqs: [
      { q: "How dark does a room need to be for a glow party?", a: "Dark enough that uplights and neon are the main light. Tent sidewalls or blackout curtains help for evening parties." },
    ],
  },
  // Kids
  {
    slug: "carnival-kids-party",
    type: "kids-parties",
    name: "Backyard carnival",
    tagline: "Bounce house, popcorn and midway games",
    summary:
      "A backyard carnival kids' party pairs a bounce house with popcorn and cotton candy machines, giant yard games and red-and-white stripes. Great for ages 4 to 10 and mixed-age groups.",
    scene: "backyard-birthday",
    sceneAlt: "Backyard party with a bounce house, canopy and treat cart",
    palette: [{ name: "Carnival red", hex: "#D62828" }, { name: "Sunshine", hex: "#F7B32B" }, { name: "White", hex: "#FFFFFF" }],
    decor: ["Striped tablecloths", "Pennant banners", "Ticket-booth signage", "Paper popcorn cones"],
    setup: {
      backyard: "Bounce house at the back, games along the side, treat machines under a canopy near an outlet, kids' tables in the middle.",
      indoors: "A gym or party room with soft play and game stations around the edge.",
    },
    activities: [
      { name: "Bounce house", text: "The main attraction.", rentals: ["bounce-house"] },
      { name: "Midway games", text: "Ring toss, Jenga, connect four.", rentals: ["yard-games"] },
      { name: "Popcorn and cotton candy", text: "Fresh treats from the machine.", rentals: ["popcorn-machine", "cotton-candy-machine"] },
      { name: "Prize tickets", text: "Kids win tickets and trade them for small prizes." },
    ],
    props: ["Roll of carnival tickets", "Small prizes", "Paper popcorn cones", "Face paint"],
    rentals: [
      fixed("bounce-house", 1, "Bounce house"),
      fixed("yard-games", 3, "Midway game stations"),
      fixed("popcorn-machine", 1, "Popcorn"),
      fixed("cotton-candy-machine", 1, "Cotton candy"),
      per("kids-table", 0.17, "Kids' tables", 1),
      per("kids-chair", 1, "Kids' chairs"),
      fixed("canopy-10x10", 1, "Shade over the treats"),
    ],
    faqs: [
      { q: "Do cotton candy and popcorn machines need special power?", a: "Most run on a standard 120V outlet, but each needs its own circuit. Keep them within reach of a grounded outlet or add a generator." },
    ],
  },
  {
    slug: "little-explorers-kids-party",
    type: "kids-parties",
    name: "Little explorers safari",
    tagline: "Soft play, scavenger hunt and jungle greens",
    summary:
      "A little explorers safari party suits toddlers and preschoolers: a soft play area, a scavenger hunt for toy animals, jungle-green decor and snacks in the shade.",
    scene: "kids-party",
    sceneAlt: "Kids' party area with small tables",
    palette: [{ name: "Jungle", hex: "#2E6B3F" }, { name: "Khaki", hex: "#C3B091" }, { name: "Sunset orange", hex: "#E07A2F" }],
    decor: ["Palm-leaf garlands", "Toy animals on every table", "Explorer hats", "Binocular favours"],
    setup: {
      backyard: "Soft play on a mat in the shade, scavenger hunt across the yard, kids' tables under a canopy.",
      indoors: "Soft play in the centre, craft table in a corner, parents' seating around the edge.",
    },
    activities: [
      { name: "Soft play for under-fives", text: "Safe climbing and crawling.", rentals: ["soft-play"] },
      { name: "Animal scavenger hunt", text: "Hide toy animals; kids tick them off a card." },
      { name: "Snow cones", text: "A cool treat on a hot day.", rentals: ["snow-cone-machine"] },
    ],
    props: ["Toy animals", "Explorer hats", "Scavenger hunt cards", "Paper binoculars"],
    rentals: [
      fixed("soft-play", 1, "Soft play set"),
      per("kids-table", 0.17, "Kids' tables", 1),
      per("kids-chair", 1, "Kids' chairs"),
      fixed("canopy-10x10", 1, "Shade"),
      fixed("snow-cone-machine", 1, "Snow cones"),
    ],
    faqs: [
      { q: "What age is soft play for?", a: "Most soft play sets are designed for babies to about five years old." },
    ],
  },
  {
    slug: "backyard-movie-night-kids",
    type: "kids-parties",
    name: "Backyard movie night",
    tagline: "A big screen, popcorn and blankets",
    summary:
      "A backyard movie night party for older kids sets a projector and screen on the lawn, a popcorn machine, blankets and bean bags, and string lights for after the film.",
    scene: "tent-reception-dusk",
    sceneAlt: "Backyard at dusk with string lights",
    palette: [{ name: "Midnight", hex: "#1B2A4A" }, { name: "Popcorn", hex: "#F7E3A1" }, { name: "Red", hex: "#C0392B" }],
    decor: ["Ticket-stub invitations", "Popcorn boxes", "String lights", "A marquee 'Now showing' sign"],
    setup: {
      backyard: "Screen at the far end with the sun behind it, blankets and kids' chairs in front, the popcorn machine near the house.",
      indoors: "A basement or garage with the screen on one wall.",
    },
    activities: [
      { name: "Outdoor movie", text: "Projector, screen and speaker.", rentals: ["projector", "projection-screen", "pa-system"] },
      { name: "Popcorn bar", text: "Popcorn with toppings.", rentals: ["popcorn-machine"] },
    ],
    props: ["Blankets and pillows", "Popcorn boxes", "Toppings", "Glow sticks"],
    rentals: [
      fixed("projector", 1, "Projector"),
      fixed("projection-screen", 1, "Screen"),
      fixed("pa-system", 1, "Sound"),
      fixed("popcorn-machine", 1, "Popcorn"),
      per("kids-chair", 1, "Seats for the kids"),
      fixed("string-lights", 2, "Light after the movie"),
    ],
    faqs: [
      { q: "When does it get dark enough for an outdoor movie in Chicago?", a: "About 30 minutes after sunset: around 9 pm in June and July, 8:30 pm in August and 7:30 pm in September." },
    ],
  },
  // Graduation
  {
    slug: "school-colors-open-house",
    type: "graduation-parties",
    name: "School colours open house",
    tagline: "Canopies, a memory table and food that holds",
    summary:
      "A school colours open house dresses canopies, tables and balloons in the grad's school colours, with a memory table, a buffet of food that holds for hours and yard games.",
    scene: "graduation-party",
    sceneAlt: "Graduation party in a backyard with canopy and tables",
    palette: [{ name: "School colour 1", hex: "#1F3A93" }, { name: "School colour 2", hex: "#F2A900" }, { name: "White", hex: "#FFFFFF" }],
    decor: ["Balloon arch in school colours", "Pennants and jerseys", "Graduation cap centrepieces", "Yard sign with the grad's name"],
    setup: {
      backyard: "Canopies over food and seating, a memory table by the entrance, games on the open lawn.",
      indoors: "Food in the kitchen, seating in the basement or garage, memory table by the door.",
    },
    activities: [
      { name: "Memory table", text: "Yearbooks, photos and awards.", rentals: ["banquet-8ft"] },
      { name: "Cornhole in school colours", text: "A bracket with a prize.", rentals: ["yard-games"] },
      { name: "Photo slideshow", text: "A TV looping photos.", rentals: ["tv-with-stand"] },
    ],
    props: ["Balloon arch", "Advice cards", "Graduation photo prints", "Yard sign"],
    rentals: [
      per("canopy-10x10", 0.025, "Canopies over food and seating", 2),
      per("banquet-8ft", 0.07, "Buffet and seating tables", 3),
      per("white-folding", 0.5, "Seats for about half of guests"),
      per("chafing-dish", 0.05, "Hot food that holds", 4),
      fixed("yard-games", 2, "Lawn games"),
      fixed("tv-with-stand", 1, "Slideshow"),
    ],
    faqs: [
      { q: "What food holds well for an open house?", a: "Chafer dishes such as pasta, pulled pork, tacos and Italian beef stay hot for hours. Keep cold dishes on ice." },
    ],
  },
  {
    slug: "taco-bar-grad-party",
    type: "graduation-parties",
    name: "Taco and nacho bar grad party",
    tagline: "A make-your-own food bar and snack machines",
    summary:
      "A taco and nacho bar graduation party feeds a big, come-and-go crowd with chafers of fillings, a nacho cheese warmer, beverage dispensers and highboys for standing.",
    scene: "buffet-setup",
    sceneAlt: "Buffet line with chafing dishes",
    palette: [{ name: "Lime", hex: "#8BC34A" }, { name: "Chili", hex: "#C62828" }, { name: "Corn", hex: "#F9D56E" }],
    decor: ["Papel picado banners", "Cactus centrepieces", "Chalkboard menu"],
    setup: {
      backyard: "The food bar along one long table under a canopy, highboys and seating across the lawn.",
      indoors: "Food bar in the garage, seating on the driveway.",
    },
    activities: [
      { name: "Nacho station", text: "Warm cheese all afternoon.", rentals: ["nacho-cheese-warmer"] },
      { name: "Agua fresca bar", text: "Dispensers of horchata and jamaica.", rentals: ["beverage-dispenser"] },
    ],
    props: ["Papel picado", "Taco toppings", "Chalkboard menu"],
    rentals: [
      per("chafing-dish", 0.05, "Chafers for fillings", 4),
      fixed("nacho-cheese-warmer", 1, "Nacho cheese"),
      fixed("beverage-dispenser", 3, "Agua fresca and water"),
      per("cocktail-highboy", 0.05, "Standing tables", 3),
      fixed("canopy-10x10", 1, "Shade over the food"),
    ],
    faqs: [
      { q: "How many chafers for a taco bar for 100 guests?", a: "Four to six: two proteins, rice, beans and a vegetarian option, with toppings in bowls." },
    ],
  },
  {
    slug: "sunset-grad-celebration",
    type: "graduation-parties",
    name: "Sunset grad celebration",
    tagline: "An evening party with lounge seating and lights",
    summary:
      "A sunset grad celebration moves the party to the evening: lounge furniture, bistro lights, a neon sign with the class year and a small dance floor.",
    scene: "boho-lounge",
    sceneAlt: "Lounge with sofas and string lights",
    palette: [{ name: "Peach", hex: "#F3C9A8" }, { name: "Coral", hex: "#F08A6B" }, { name: "Gold", hex: "#C9A24A" }],
    decor: ["Neon 'Class of' sign", "String lights", "Lounge cushions"],
    setup: {
      backyard: "Lounge clusters under string lights, a dance floor by the speaker.",
      indoors: "A rented room with lounge seating and a dance floor.",
    },
    activities: [
      { name: "Dance floor", text: "A small floor for friends.", rentals: ["dance-floor", "pa-system"] },
      { name: "Neon photo spot", text: "The class year in lights.", rentals: ["neon-sign"] },
    ],
    props: ["Class year banner", "Photo props", "Favour bags"],
    rentals: [
      fixed("lounge-sofa", 2, "Lounge seating"),
      fixed("lounge-armchair", 4, "Lounge seating"),
      per("string-lights", 0.03, "Bistro lights", 2),
      fixed("neon-sign", 1, "Photo spot"),
      fixed("dance-floor", 16, "A 12 by 12 foot floor"),
    ],
    faqs: [
      { q: "Are there noise rules for a backyard party?", a: "Most Chicago-area towns have quiet hours starting around 10 pm. Tell neighbours ahead of time." },
    ],
  },
  // Corporate
  {
    slug: "company-summer-picnic",
    type: "corporate-events",
    name: "Company summer picnic",
    tagline: "Lawn games, BBQ and canopies",
    summary:
      "A company summer picnic brings teams and families together in a park or campus lawn with canopies, banquet tables, a BBQ buffet, yard games, a bounce house for kids and a PA for announcements.",
    scene: "graduation-party",
    sceneAlt: "Outdoor party with canopies and tables",
    palette: [{ name: "Brand primary", hex: "#1F3A93" }, { name: "Sky", hex: "#BFD7EA" }, { name: "Grass", hex: "#6BA368" }],
    decor: ["Branded banners", "Team t-shirts", "Picnic gingham"],
    setup: {
      backyard: "Canopies in a row over food and seating, games on the lawn, kids' area at the far end.",
      indoors: "Rain plan: a gym or warehouse with the same zones.",
    },
    activities: [
      { name: "Department cornhole bracket", text: "A prize for the winners.", rentals: ["yard-games"] },
      { name: "Kids' zone", text: "Bounce house and snow cones.", rentals: ["bounce-house", "snow-cone-machine"] },
      { name: "Announcements and raffle", text: "A PA and mic.", rentals: ["pa-system", "wireless-microphone"] },
    ],
    props: ["Raffle tickets and prizes", "Team t-shirts", "Sunscreen station"],
    rentals: [
      per("canopy-10x10", 0.02, "Shade over food and seating", 3),
      per("banquet-8ft", 0.1, "Picnic seating"),
      per("white-folding", 0.8, "Chairs for most guests"),
      fixed("yard-games", 4, "Game stations"),
      fixed("bounce-house", 1, "Kids' zone"),
      fixed("pa-system", 1, "Announcements"),
    ],
    faqs: [
      { q: "Do I need a permit for a company picnic in a Chicago park?", a: "Usually yes for large groups, tents, amplified sound or alcohol. Apply to the Chicago Park District at least 30 days ahead." },
    ],
  },
  {
    slug: "product-launch-reception",
    type: "corporate-events",
    name: "Product launch reception",
    tagline: "A stage moment, demo stations and branded lighting",
    summary:
      "A product launch reception pairs a short stage presentation with demo stations on TVs, highboys for networking, uplighting in the brand colour and a neon sign photo moment.",
    scene: "corporate-gala",
    sceneAlt: "Corporate event room with stage and uplighting",
    palette: [{ name: "Brand", hex: "#2E7DFF" }, { name: "Charcoal", hex: "#2B2B2B" }, { name: "White", hex: "#FFFFFF" }],
    decor: ["Uplighting in the brand colour", "Branded neon sign", "Clean white highboy covers"],
    setup: {
      backyard: "A clear-top tent on a campus lawn for a summer launch.",
      indoors: "Stage at one end, demo stations around the edge, highboys in the middle.",
    },
    activities: [
      { name: "Launch presentation", text: "Stage, podium, screen and mics.", rentals: ["stage-deck", "podium", "projector", "projection-screen"] },
      { name: "Demo stations", text: "TVs on stands.", rentals: ["tv-with-stand"] },
      { name: "Branded photo moment", text: "Neon logo.", rentals: ["neon-sign"] },
    ],
    props: ["Product samples", "Branded swag", "Name badges"],
    rentals: [
      fixed("stage-deck", 4, "A presentation stage"),
      fixed("podium", 1, "Podium"),
      fixed("projector", 1, "Projector"),
      fixed("projection-screen", 1, "Screen"),
      fixed("tv-with-stand", 3, "Demo stations"),
      per("cocktail-highboy", 0.08, "Networking tables", 6),
      per("uplight", 0.08, "Brand-colour uplighting", 8),
    ],
    faqs: [
      { q: "How long should a launch presentation be?", a: "Ten to twenty minutes, then open the demo stations so guests can try the product." },
    ],
  },
  {
    slug: "fundraising-gala",
    type: "corporate-events",
    name: "Fundraising gala",
    tagline: "Rounds of ten, a paddle raise and a silent auction",
    summary:
      "A fundraising gala seats donors at rounds of ten facing a stage, with a silent auction along one wall, uplighting, a bar at the back and a programme with a paddle raise.",
    scene: "corporate-gala",
    sceneAlt: "Gala room with rounds and stage",
    palette: [{ name: "Navy", hex: "#1B2A4A" }, { name: "Gold", hex: "#C9A24A" }, { name: "Ivory", hex: "#F7F2E8" }],
    decor: ["Gold Chiavari chairs", "Floor-length linens", "Candle centrepieces", "Uplighting"],
    setup: {
      backyard: "A pole tent with sidewalls for a summer gala.",
      indoors: "Rounds facing the stage, silent auction tables along one wall, bar at the back.",
    },
    activities: [
      { name: "Silent auction", text: "Banquet tables with bid sheets.", rentals: ["banquet-8ft", "banquet-floor-length"] },
      { name: "Paddle raise", text: "Stage, podium and mics.", rentals: ["stage-deck", "podium", "wireless-microphone"] },
      { name: "Mission video", text: "Projector and screen.", rentals: ["projector", "projection-screen"] },
    ],
    props: ["Bid paddles", "Programme cards", "Auction bid sheets"],
    rentals: [
      per("round-72", 0.1, "Rounds of ten"),
      per("round-floor-length", 0.1, "Floor-length linens"),
      per("gold-chiavari", 1, "Gold Chiavari chairs"),
      per("banquet-8ft", 0.03, "Silent auction tables", 3),
      fixed("stage-deck", 4, "Stage"),
      fixed("podium", 1, "Podium"),
      per("uplight", 0.08, "Uplighting", 8),
    ],
    faqs: [
      { q: "How much space does a silent auction need?", a: "About 3 feet of table per item, with room for guests to stand on one side." },
    ],
  },
  // Backyard
  {
    slug: "summer-bbq-block-party",
    type: "backyard-parties",
    name: "Summer BBQ block party",
    tagline: "Long tables, lawn games and lemonade",
    summary:
      "A summer BBQ block party sets long banquet tables in rows, canopies over the grill and food, beverage dispensers, yard games and a bounce house for the kids.",
    scene: "backyard-birthday",
    sceneAlt: "Backyard party with long tables",
    palette: [{ name: "Gingham red", hex: "#C0392B" }, { name: "Sky", hex: "#87BFFF" }, { name: "White", hex: "#FFFFFF" }],
    decor: ["Gingham runners", "Mason jar lights", "American flag bunting"],
    setup: {
      backyard: "Grill and food under canopies, tables in rows, games at the end of the street or yard.",
      indoors: "Rain plan: garages open with tables inside.",
    },
    activities: [
      { name: "Yard game tournament", text: "Cornhole and Jenga.", rentals: ["yard-games"] },
      { name: "Bounce house", text: "For the kids.", rentals: ["bounce-house"] },
      { name: "Snow cones", text: "A cool treat.", rentals: ["snow-cone-machine"] },
    ],
    props: ["Gingham runners", "Bunting", "Water balloons"],
    rentals: [
      per("banquet-8ft", 0.1, "Tables for eating"),
      per("white-folding", 1, "Chairs"),
      per("canopy-10x10", 0.02, "Shade", 2),
      fixed("beverage-dispenser", 3, "Lemonade, iced tea and water"),
      fixed("yard-games", 3, "Games"),
    ],
    faqs: [
      { q: "Do I need a permit for a block party in Chicago?", a: "Yes, the City of Chicago issues block party permits through your alderman's office. Apply several weeks ahead." },
    ],
  },
  {
    slug: "bistro-lights-cocktail-night",
    type: "backyard-parties",
    name: "Bistro lights cocktail night",
    tagline: "Highboys, a bar and a lounge under the lights",
    summary:
      "A bistro lights cocktail night turns the backyard into a terrace bar with highboys, a portable bar, lounge furniture and a canopy of string lights. Perfect for 30 to 80 guests on a summer evening.",
    scene: "tent-reception-dusk",
    sceneAlt: "Tent at dusk with bistro lights",
    palette: [{ name: "Warm white", hex: "#FFF4D6" }, { name: "Charcoal", hex: "#2B2B2B" }, { name: "Greenery", hex: "#5B7F4E" }],
    decor: ["A canopy of string lights", "Lanterns on highboys", "Greenery on the bar"],
    setup: {
      backyard: "Lights criss-crossed overhead, bar on the patio, highboys on the lawn, lounge by the fire pit.",
      indoors: "A rooftop or loft with the same layout.",
    },
    activities: [
      { name: "Signature cocktail bar", text: "Bar and glassware.", rentals: ["portable-bar", "rocks-glass", "wine-glass"] },
      { name: "Lounge corner", text: "Sofas and armchairs.", rentals: ["lounge-sofa", "lounge-armchair"] },
    ],
    props: ["Lanterns", "Cocktail menu", "Bug spray station"],
    rentals: [
      per("string-lights", 0.04, "A canopy of lights", 2),
      fixed("portable-bar", 1, "Bar"),
      per("cocktail-highboy", 0.07, "Highboys", 3),
      per("spandex-highboy", 0.07, "Covers", 3),
      fixed("lounge-sofa", 1, "Lounge"),
      per("wine-glass", 1, "Wine glasses"),
    ],
    faqs: [
      { q: "How many string lights for a backyard?", a: "Measure the runs you want to cover. A 40 by 40 foot zigzag takes about 150 to 200 feet of lights." },
    ],
  },
  {
    slug: "fall-bonfire-party",
    type: "backyard-parties",
    name: "Fall bonfire party",
    tagline: "Heaters, lounge seating and warm drinks",
    summary:
      "A fall bonfire party keeps guests warm with patio heaters, lounge seating around the fire pit, a hot cider station and string lights. Great for September to November in Chicagoland.",
    scene: "winter-tent",
    sceneAlt: "Heated tent with warm lighting",
    palette: [{ name: "Pumpkin", hex: "#D9822B" }, { name: "Plaid red", hex: "#8E2C2C" }, { name: "Bark", hex: "#5A4632" }],
    decor: ["Plaid blankets", "Pumpkins and hay bales", "Lanterns"],
    setup: {
      backyard: "Lounge furniture in a half circle around the fire pit, heaters on the edges, a cider station near the house.",
      indoors: "A heated tent if the weather turns.",
    },
    activities: [
      { name: "Hot cider bar", text: "Urns and mugs.", rentals: ["coffee-urn"] },
      { name: "S'mores station", text: "A table with sticks and toppings.", rentals: ["banquet-6ft"] },
      { name: "Lawn games", text: "Before it gets dark.", rentals: ["yard-games"] },
    ],
    props: ["Plaid blankets", "S'mores supplies", "Pumpkins"],
    rentals: [
      per("patio-heater", 0.04, "Patio heaters", 2),
      fixed("lounge-sofa", 2, "Lounge around the fire"),
      fixed("lounge-armchair", 4, "Lounge around the fire"),
      fixed("coffee-urn", 2, "Hot cider"),
      fixed("string-lights", 2, "Lights"),
    ],
    faqs: [
      { q: "Are backyard fire pits allowed in Chicago?", a: "Recreational fires are allowed in Chicago with limits on size and what you burn; suburbs set their own rules. Check your town before the party." },
    ],
  },
  // Holidays
  {
    slug: "winter-wonderland-holiday-party",
    type: "holiday-parties",
    name: "Winter wonderland holiday party",
    tagline: "Silver, white and a heated tent",
    summary:
      "A winter wonderland holiday party uses silver and white linens, silver Chiavari chairs, chandeliers and a heated tent or ballroom. Great for company holiday parties and family gatherings in December.",
    scene: "winter-tent",
    sceneAlt: "Heated winter tent with warm lighting",
    palette: [{ name: "Snow", hex: "#FFFFFF" }, { name: "Silver", hex: "#C0C4CC" }, { name: "Ice blue", hex: "#BFD7EA" }],
    decor: ["Silver sequin overlays", "White branches with lights", "Chandeliers", "Faux snow on the tables"],
    setup: {
      backyard: "A frame tent with all sidewalls and a forced-air heater, rounds and a bar inside.",
      indoors: "Rounds with silver overlays, uplighting in ice blue, a bar and dessert table.",
    },
    activities: [
      { name: "Hot chocolate bar", text: "Urns and toppings.", rentals: ["coffee-urn"] },
      { name: "Gift swap", text: "White elephant after dinner." },
      { name: "Photo booth", text: "Hats and scarves props.", rentals: ["photo-booth-360"] },
    ],
    props: ["Faux snow", "Hats and scarves", "Ornament favours"],
    rentals: [
      per("silver-chiavari", 1, "Silver Chiavari chairs"),
      per("sequin-overlay", 0.125, "Silver sequin overlays"),
      fixed("chandelier", 2, "Chandeliers"),
      per("uplight", 0.08, "Ice-blue uplighting", 8),
      fixed("tent-heater", 1, "Heat for a tent party"),
      fixed("coffee-urn", 2, "Hot chocolate"),
    ],
    faqs: [
      { q: "How warm does a tent heater keep a tent?", a: "A forced-air heater with all sidewalls down keeps a 20 by 40 tent comfortable down to about freezing. Bigger tents need more heaters." },
    ],
  },
  {
    slug: "friendsgiving-dinner",
    type: "holiday-parties",
    name: "Friendsgiving dinner",
    tagline: "One long table, chargers and candlelight",
    summary:
      "A Friendsgiving dinner seats everyone at one long farm table with cross-back chairs, chargers, cloth napkins, candles and a potluck buffet. Great for 12 to 40 friends.",
    scene: "farm-table-dinner",
    sceneAlt: "Long farm table dinner with candles",
    palette: [{ name: "Pumpkin", hex: "#D9822B" }, { name: "Cranberry", hex: "#8E2C3C" }, { name: "Linen", hex: "#EDE4D3" }],
    decor: ["Mini pumpkins and leaves down the table", "Gold chargers", "Candles", "Name cards"],
    setup: {
      backyard: "A heated tent if the weather is mild.",
      indoors: "One long table through the living and dining room.",
    },
    activities: [
      { name: "Potluck buffet", text: "Chafers keep dishes warm.", rentals: ["chafing-dish"] },
      { name: "Gratitude cards", text: "Each guest writes what they're thankful for." },
    ],
    props: ["Mini pumpkins", "Name cards", "Gratitude cards"],
    rentals: [
      per("farm-table", 0.1, "Long farm table"),
      per("crossback", 1, "Cross-back chairs"),
      per("charger-plate", 1, "Gold chargers"),
      per("cloth-napkins", 1, "Cloth napkins"),
      per("chafing-dish", 0.1, "Potluck chafers", 3),
      per("candle-holder", 0.3, "Candles", 4),
    ],
    faqs: [
      { q: "Can I rent dishes so I don't wash up?", a: "Yes. Most rental companies take plates and glasses back dirty: scrape and return them in their racks." },
    ],
  },
  {
    slug: "new-years-eve-party",
    type: "holiday-parties",
    name: "New Year's Eve party",
    tagline: "Gold, black, a champagne wall and a midnight toast",
    summary:
      "A New Year's Eve party uses black and gold, a champagne wall, highboys, a dance floor and a countdown on a screen, ending with a midnight toast.",
    scene: "dance-party",
    sceneAlt: "Dance floor with lighting",
    palette: [{ name: "Black", hex: "#1D1A16" }, { name: "Gold", hex: "#C9A24A" }, { name: "Silver", hex: "#C0C4CC" }],
    decor: ["Gold and silver balloons", "Sequin overlays", "Neon 'Cheers' sign"],
    setup: {
      backyard: "A heated tent with sidewalls.",
      indoors: "Highboys around a dance floor, champagne wall at the entrance, countdown on a TV.",
    },
    activities: [
      { name: "Champagne wall", text: "Grab a glass on arrival.", rentals: ["champagne-wall"] },
      { name: "Countdown", text: "A TV with the countdown.", rentals: ["tv-with-stand"] },
      { name: "Dance floor", text: "Dance into the new year.", rentals: ["dance-floor"] },
    ],
    props: ["Noisemakers and hats", "Confetti (check venue rules)", "Midnight kiss sign"],
    rentals: [
      fixed("champagne-wall", 1, "Champagne wall"),
      per("champagne-flute", 1.5, "Flutes for the toast"),
      per("cocktail-highboy", 0.07, "Highboys", 4),
      per("dance-floor", 0.25, "Dance floor", 16),
      fixed("neon-sign", 1, "Cheers sign"),
      fixed("tv-with-stand", 1, "Countdown"),
    ],
    faqs: [
      { q: "When should I book rentals for New Year's Eve?", a: "By early November. Dance floors, heaters and champagne walls are in demand for December 31." },
    ],
  },
  {
    slug: "diwali-celebration",
    type: "holiday-parties",
    name: "Diwali celebration",
    tagline: "Diyas, marigolds and a festive dinner",
    summary:
      "A Diwali celebration uses warm candlelight and diyas, marigold garlands, jewel-toned linens, a buffet dinner and a dance floor for the evening.",
    scene: "sweetheart-stage",
    sceneAlt: "Decorated stage with warm lighting",
    palette: [{ name: "Marigold", hex: "#F2A900" }, { name: "Magenta", hex: "#C2185B" }, { name: "Gold", hex: "#C9A24A" }],
    decor: ["Diyas and candles on every table", "Marigold garlands", "Rangoli at the entrance", "Gold chargers"],
    setup: {
      backyard: "A heated tent for a November evening.",
      indoors: "Rounds, a buffet along one wall and a dance floor.",
    },
    activities: [
      { name: "Rangoli station", text: "Coloured powders on a table at the entrance.", rentals: ["banquet-6ft"] },
      { name: "Buffet dinner", text: "Chafers for hot dishes.", rentals: ["chafing-dish"] },
      { name: "Dance floor", text: "Bollywood and bhangra.", rentals: ["dance-floor", "pa-system"] },
    ],
    props: ["Diyas", "Rangoli colours", "Mithai boxes"],
    rentals: [
      per("candle-holder", 0.4, "Candles and diyas", 6),
      per("charger-plate", 1, "Gold chargers"),
      per("chafing-dish", 0.05, "Buffet chafers", 4),
      per("dance-floor", 0.25, "Dance floor", 16),
      per("uplight", 0.08, "Warm uplighting", 6),
    ],
    faqs: [
      { q: "Can we use real diyas at an indoor venue?", a: "Many venues allow only enclosed or LED candles. Ask your venue and use glass candle holders." },
    ],
  },
];
