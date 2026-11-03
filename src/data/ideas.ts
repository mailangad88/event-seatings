// Seasonal ideas hub (/ideas): what Chicago-area hosts celebrate, plan and book each month.
// Guides are blog slugs (missing or future-dated posts are dropped at render). Categories are /rentals/<id>.
// Images are the site's own event scenes.
import type { CategoryId } from "./catalog-products";

export type MonthIdeas = {
  slug: string; // matches /chicago-event-seasons/<slug>
  name: string;
  season: "winter" | "spring" | "summer" | "fall";
  headline: string;
  mood: string;
  image: string;
  alt: string;
  moments: { name: string; idea: string; guide?: string }[];
  rent: CategoryId[];
  guides: string[];
};

const scene = (n: string) => `/rentals/scenes/${n}.webp`;

export const monthIdeas: MonthIdeas[] = [
  {
    slug: "january", name: "January", season: "winter",
    headline: "Cozy indoor gatherings and next year's big plans",
    mood: "Engagement season's aftermath: newly engaged couples tour venues while hosts lean into warm, candlelit indoor parties.",
    image: scene("winter-tent"), alt: "Heated winter tent with clear walls, warm string lights and set tables",
    moments: [
      { name: "Engagement parties", idea: "Holiday proposals mean January engagement parties. A lounge corner and a cocktail-table layout keep it relaxed.", guide: "engagement-party-rentals" },
      { name: "Lunar New Year banquets", idea: "Round tables of 10 suit family-style service. Red and gold linens are a simple upgrade.", guide: "lunar-new-year-banquet-tables" },
      { name: "Corporate kickoffs", idea: "Theater or classroom rows for the talk, then highboys for the mixer.", guide: "conference-seating-styles-theater-classroom-banquet-u-shape" },
    ],
    rent: ["lounge", "linens", "lighting", "heating-cooling"],
    guides: ["planning-an-event-in-chicago-in-january", "chicago-winter-event-planning", "coat-racks-for-winter-events-chicago", "winter-event-lighting-chicago-sunset", "hot-cocoa-bar-winter-event"],
  },
  {
    slug: "february", name: "February", season: "winter",
    headline: "Game-day crowds, galas and the spring booking rush",
    mood: "Short, cold days. It's the month to book spring and summer tents, dance floors and specialty chairs before popular Saturdays fill.",
    image: scene("corporate-gala"), alt: "Gala room with round tables, uplighting and a stage",
    moments: [
      { name: "Super Bowl parties", idea: "Seat a big crowd facing one screen: theater rows up front, highboys behind.", guide: "super-bowl-party-seating-for-a-crowd" },
      { name: "Fundraising galas", idea: "Galas need a stage, AV and a bid-table layout as much as chairs.", guide: "fundraising-gala-planning-timeline" },
      { name: "Bridal shows and tastings", idea: "If your wedding is this summer or fall, this is the month to lock in tents and chairs.", guide: "spring-wedding-rentals-chicago" },
    ],
    rent: ["av-sound", "dance-floors-staging", "linens", "decor"],
    guides: ["planning-an-event-in-chicago-in-february", "gala-stage-decor-ideas", "charity-gala-rental-checklist", "fundraiser-auction-setup-rentals"],
  },
  {
    slug: "march", name: "March", season: "spring",
    headline: "Showers, communions and soggy-lawn planning",
    mood: "The thaw makes lawns soft and muddy, so spring outdoor parties need flooring and a tent plan. Indoor showers and brunches shine.",
    image: scene("baby-shower"), alt: "Baby shower brunch table with florals and pastel linens",
    moments: [
      { name: "Baby and bridal showers", idea: "Long tables with linens and a dessert station make a small room feel styled.", guide: "how-to-plan-a-baby-shower-checklist" },
      { name: "Ramadan and Eid gatherings", idea: "Floor cushions or long banquet tables for iftar, then a festive Eid layout.", guide: "eid-celebration-seating-and-rentals" },
      { name: "Graduation party planning", idea: "May and June open houses need tents booked now.", guide: "graduation-party-rentals-checklist" },
    ],
    rent: ["tables", "linens", "dinnerware", "tents"],
    guides: ["planning-an-event-in-chicago-in-march", "baby-shower-rentals-and-seating", "bridal-shower-table-setup", "tent-flooring-and-subfloors"],
  },
  {
    slug: "april", name: "April", season: "spring",
    headline: "Easter brunches, communions and the first outdoor parties",
    mood: "Warmer days but frequent rain. A tent or indoor backup is wise for anything outside.",
    image: scene("garden-ceremony"), alt: "Garden ceremony with white chairs facing a floral arch",
    moments: [
      { name: "Easter brunch and egg hunts", idea: "Kids' tables, a brunch buffet and a canopy in case of showers.", guide: "easter-brunch-and-egg-hunt-planning" },
      { name: "First communions and baptisms", idea: "Most are a church service then a home or hall lunch for 50-120.", guide: "first-communion-party-rentals" },
      { name: "Prom and post-prom", idea: "Post-prom lock-ins need games, lounge seating and food stations.", guide: "post-prom-party-planning" },
    ],
    rent: ["tents", "games-kids", "catering-equipment", "tables"],
    guides: ["planning-an-event-in-chicago-in-april", "baptism-christening-party-rentals", "rain-plan-with-a-tent", "umbrella-stands-and-rain-plans"],
  },
  {
    slug: "may", name: "May", season: "spring",
    headline: "Graduation season and the start of wedding season",
    mood: "Mild and green. Weekend tents and canopies go fast from mid-May through June.",
    image: scene("graduation-party"), alt: "Graduation party in a backyard with canopy, tables and food stations",
    moments: [
      { name: "Graduation open houses", idea: "Plan for guests arriving in waves: fewer chairs than guests, more tables for plates.", guide: "open-house-graduation-party-layout" },
      { name: "Mother's Day gatherings", idea: "A long garden table with linens turns a backyard into a restaurant.", guide: "mothers-day-and-fathers-day-gatherings" },
      { name: "Spring weddings", idea: "Ceremony chairs that move to the reception save money.", guide: "spring-wedding-rentals-chicago" },
    ],
    rent: ["tents", "tables", "chairs", "catering-equipment"],
    guides: ["planning-an-event-in-chicago-in-may", "graduation-party-tent-rental", "garden-party-rentals-layout", "backyard-party-layout-plan"],
  },
  {
    slug: "june", name: "June", season: "summer",
    headline: "Peak weddings, Juneteenth and long backyard evenings",
    mood: "Long days and warm nights, with a chance of thunderstorms. Peak demand for tents, chairs and dance floors.",
    image: scene("wedding-reception"), alt: "Wedding reception with round tables, gold Chiavari chairs and candlelight",
    moments: [
      { name: "Weddings", idea: "Sunset is after 8 pm, so the golden hour lands mid-reception. Plan bistro lights for after dark.", guide: "garden-wedding-chairs-and-decor" },
      { name: "Juneteenth celebrations", idea: "Community cookouts need tents, picnic tables and a stage for music.", guide: "juneteenth-community-celebration-rentals" },
      { name: "Father's Day cookouts", idea: "Picnic tables, a canopy for shade and a cooler station.", guide: "mothers-day-and-fathers-day-gatherings" },
    ],
    rent: ["tents", "dance-floors-staging", "lighting", "chairs"],
    guides: ["planning-an-event-in-chicago-in-june", "chicago-summer-event-season-planning", "tented-wedding-rentals", "backyard-party-lighting-ideas"],
  },
  {
    slug: "july", name: "July", season: "summer",
    headline: "Fourth of July, reunions and beat-the-heat parties",
    mood: "Hot and humid, with pop-up storms. Shade, fans and water matter as much as seating.",
    image: scene("backyard-birthday"), alt: "Backyard birthday party with long tables and string lights",
    moments: [
      { name: "Fourth of July parties", idea: "A backyard tent doubles as shade by day and a rain plan at night.", guide: "fourth-of-july-backyard-party-rentals" },
      { name: "Family reunions", idea: "Mix picnic tables for meals with lawn games for the kids.", guide: "family-reunion-seating-and-rentals" },
      { name: "Block parties", idea: "Chicago block parties need a city permit, so apply weeks ahead.", guide: "chicago-block-party-permit" },
    ],
    rent: ["heating-cooling", "tents", "games-kids", "concessions"],
    guides: ["planning-an-event-in-chicago-in-july", "summer-event-heat-plan-chicago", "misting-and-shade-for-summer-events", "fans-and-coolers-for-summer-events", "outdoor-events-chicago-in-july"],
  },
  {
    slug: "august", name: "August", season: "summer",
    headline: "Company picnics, back-to-school bashes and late-summer weddings",
    mood: "Hot early in the month, easing late. The last stretch of reliable backyard weather.",
    image: scene("farm-table-dinner"), alt: "Long farm table dinner outdoors with string lights",
    moments: [
      { name: "Company picnics", idea: "Games and concessions do the heavy lifting. Plan shade for every age.", guide: "company-picnic-rentals-chicago" },
      { name: "Backyard movie nights", idea: "Lawn chairs or bean bags, a screen and a projector.", guide: "backyard-movie-night-seating" },
      { name: "Late-summer weddings", idea: "Farm tables and cross-back chairs fit an outdoor dinner.", guide: "backyard-wedding-rental-checklist" },
    ],
    rent: ["games-kids", "concessions", "av-sound", "tables"],
    guides: ["planning-an-event-in-chicago-in-august", "corporate-picnic-games-chicago", "outdoor-corporate-summer-party-chicago", "picnic-tables-for-casual-events"],
  },
  {
    slug: "september", name: "September", season: "fall",
    headline: "The sweet spot for outdoor events",
    mood: "Comfortable days and cooler evenings. Plan warmth and lighting for after sunset, which arrives before 7:30 pm by late month.",
    image: scene("tent-reception-dusk"), alt: "Frame tent reception lit at dusk",
    moments: [
      { name: "Fall weddings", idea: "September and October Saturdays are the most requested dates of the year.", guide: "chicago-fall-wedding-rentals" },
      { name: "Homecoming and reunions", idea: "Class reunions work best with cocktail tables and a few lounge pockets.", guide: "class-reunion-planning-guide" },
      { name: "Fall fundraisers", idea: "A tented gala outdoors needs heaters on standby.", guide: "school-fundraiser-rentals-chicago" },
    ],
    rent: ["tents", "lighting", "heating-cooling", "linens"],
    guides: ["planning-an-event-in-chicago-in-september", "heating-a-tent-in-fall", "chicago-fall-wedding-linen-colors", "tent-lighting-ideas"],
  },
  {
    slug: "october", name: "October", season: "fall",
    headline: "Harvest dinners, Halloween and Diwali",
    mood: "Crisp and colorful, with the first frost possible after mid-month. Sidewalls and heaters for anything outdoors.",
    image: scene("boho-lounge"), alt: "Boho lounge setting with rattan seating, rugs and warm lighting",
    moments: [
      { name: "Halloween parties", idea: "Dim lighting, a bar and a photo booth carry the night.", guide: "halloween-party-planning-guide" },
      { name: "Diwali parties", idea: "Low lounge seating, lots of candles and a buffet for a crowd.", guide: "diwali-party-seating-and-rentals" },
      { name: "Harvest and Friendsgiving dinners", idea: "Long tables with real dinnerware for a seated meal.", guide: "fall-and-holiday-decor-rentals-chicago" },
    ],
    rent: ["heating-cooling", "decor", "photo-booths", "lounge"],
    guides: ["planning-an-event-in-chicago-in-october", "patio-heaters-how-many-per-guests", "tent-sidewalls-clear-window-solid", "tent-heater-vs-patio-heater"],
  },
  {
    slug: "november", name: "November", season: "fall",
    headline: "Thanksgiving tables and holiday party booking",
    mood: "Cold, gray and dark before 5 pm. Indoor events take over, and December dates get booked now.",
    image: scene("cocktail-hour"), alt: "Indoor cocktail hour with highboy tables",
    moments: [
      { name: "Thanksgiving for a crowd", idea: "Rent an extra table, chairs and real plates instead of borrowing.", guide: "thanksgiving-dinner-for-a-crowd" },
      { name: "Friendsgiving", idea: "Mismatched dinnerware looks styled when linens tie it together.", guide: "friendsgiving-thanksgiving-dinnerware" },
      { name: "Holiday office parties", idea: "December Fridays fill first. Lock in now.", guide: "company-holiday-party-planning-timeline" },
    ],
    rent: ["dinnerware", "tables", "linens", "glassware"],
    guides: ["planning-a-november-event-chicago", "chicago-winter-holiday-party-season-booking", "holiday-office-party-rentals-chicago", "holiday-party-at-home-rentals-chicago"],
  },
  {
    slug: "december", name: "December", season: "winter",
    headline: "Holiday parties, Hanukkah, Kwanzaa and New Year's Eve",
    mood: "The busiest month for indoor rentals. Confirm delivery windows and protect floors from snow and salt.",
    image: scene("dance-party"), alt: "Dance floor with uplighting at an evening party",
    moments: [
      { name: "Holiday parties at home", idea: "A rented bar, highboys and a coat rack turn a living room into a venue.", guide: "december-holiday-party-rentals-chicago" },
      { name: "Hanukkah and Kwanzaa", idea: "Family-style tables for a shared meal and a spot for candle lighting.", guide: "hanukkah-party-planning" },
      { name: "New Year's Eve", idea: "Cocktail tables, a dance floor and champagne flutes.", guide: "new-years-eve-party-at-home" },
    ],
    rent: ["glassware", "dance-floors-staging", "lighting", "lounge"],
    guides: ["planning-an-event-in-chicago-in-december", "kwanzaa-celebration-planning", "coat-racks-for-winter-events-chicago", "winter-wedding-seating"],
  },
];

export const seasonOf = (monthIndex: number) => monthIdeas[monthIndex].season;
