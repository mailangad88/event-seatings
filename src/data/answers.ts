// Chicago event chair answers: the questions people actually type (and ask AI
// assistants) before renting chairs. Each answer leads with the direct answer in
// the first sentence so Google and AI assistants can quote it. Keep answers
// factual: no invented statistics, prices only from our own catalog estimates.
//
// Shown at /answers with FAQPage structured data. Add a question by adding an
// entry to a topic. Bump `answersUpdated` when you change anything.

export const answersUpdated = "2026-10-31";

export type Answer = {
  q: string;
  a: string;
  link?: { href: string; label: string };
};

export type AnswerTopic = {
  id: string;
  title: string;
  intro: string;
  image: { src: string; alt: string; width: number; height: number };
  answers: Answer[];
};

export const answerTopics: AnswerTopic[] = [
  {
    id: "how-many-chairs",
    title: "How many chairs do I need?",
    intro: "Counting chairs is the first thing every planner gets asked. Here is the simple version.",
    image: {
      src: "/answers/chair-count-formula.svg",
      alt: "Infographic: guests plus vendors plus a small buffer equals reception chairs, with separate counts for ceremony, cocktail hour and head table",
      width: 1200,
      height: 650,
    },
    answers: [
      {
        q: "How many chairs do I need per guest?",
        a: "Plan one reception chair per confirmed guest, plus a chair for each vendor who sits down to eat, plus a small buffer of a few percent for late RSVPs. Ceremony and cocktail hour are counted separately, because you may reuse chairs or seat only part of the room.",
        link: { href: "/seating-planner", label: "Get your exact count" },
      },
      {
        q: "Do I need separate chairs for the ceremony and the reception?",
        a: "Only if both happen at the same time in different spaces, or your venue can't move chairs during cocktail hour. Otherwise a \"flip\" reuses the ceremony chairs at dinner. A flip costs less but needs enough staff and about an hour, so confirm it with your venue first.",
        link: { href: "/blog/ceremony-vs-reception-chairs", label: "Ceremony vs. reception chairs" },
      },
      {
        q: "How many chairs fit at a round table?",
        a: "A 60-inch round comfortably seats 8 and can squeeze 10. A 72-inch round seats 10 and can squeeze 12. Chairs with wide seats or arms, like velvet dining or Louis chairs, fit fewer per table, so ask for the chair's width before you finalize a floor plan.",
        link: { href: "/seating-planner", label: "Calculate tables and chairs" },
      },
      {
        q: "How many cocktail hour seats should I rent?",
        a: "You don't need a seat for every guest during cocktail hour. Most planners seat a portion of the room, prioritizing older relatives and anyone who has trouble standing, and add a lounge grouping or two for photos.",
      },
    ],
  },
  {
    id: "cost",
    title: "What do event chairs cost in Chicago?",
    intro: "Per-chair price is only part of the bill. Here's how to compare quotes honestly.",
    image: {
      src: "/answers/chair-cost-150-guests.svg",
      alt: "Bar chart of the estimated cost of 150 rental chairs by style, from teak garden folding to Louis medallion",
      width: 1200,
      height: 640,
    },
    answers: [
      {
        q: "Is Chiavari or folding chair rental cheaper?",
        a: "Folding chairs are almost always the lowest-cost rental, and Chiavari chairs usually cost several times more per chair, often before cushions. Many styles in between, like cross-back, bentwood or garden folding chairs, look far more styled than a basic folding chair for a fraction of a premium upgrade.",
        link: { href: "/blog/chiavari-vs-folding-chairs-cost-chicago", label: "Chiavari vs. folding: the real cost" },
      },
      {
        q: "What else is on a chair rental quote besides the chairs?",
        a: "Expect line items for delivery, setup, pickup and sometimes cushions, stairs, long carries, after-hours pickup and a damage waiver. Two quotes with the same per-chair price can end up far apart, so always compare the full total for your date and venue.",
      },
      {
        q: "How much would 150 chairs cost?",
        a: "Multiply the per-chair price by your count, then add delivery and setup. Using our estimated 2027 ranges, 150 chairs runs from roughly $750 for teak garden folding to about $4,500 for Louis medallion chairs, before delivery. Your quote will list every fee.",
        link: { href: "/blog/wedding-chair-rental-cost", label: "Wedding chair budget guide" },
      },
      {
        q: "Are chair covers cheaper than renting nicer chairs?",
        a: "Not always. Covers and sashes are rented, installed and removed per chair, so by the time you add labor they can approach the cost of simply renting a chair that already looks the way you want.",
      },
    ],
  },
  {
    id: "chicago-weather",
    title: "Chicago weather, outdoor events and winter",
    intro: "Chicago gives you four very different seasons. Your chair plan should change with them.",
    image: {
      src: "/answers/chicago-seasons-seating.svg",
      alt: "Infographic of Chicago event seating planning notes for winter, spring, summer and fall",
      width: 1200,
      height: 640,
    },
    answers: [
      {
        q: "What chairs work best for an outdoor event on grass in Chicago?",
        a: "Choose chairs with wide, flat feet or a full base that won't sink, like folding garden or cross-back chairs, and avoid thin metal legs on soft lawns after rain. Set chairs on the firmest ground available and keep a tent or indoor rain plan on hold until the forecast is clear.",
        link: { href: "/blog/outdoor-event-chairs-chicago-weather", label: "Outdoor chairs and Chicago weather" },
      },
      {
        q: "Can I rent chairs for a winter event in Chicago?",
        a: "Yes. Winter events are usually indoors or in heated tents, so you can use any style. Padded and velvet seats feel warmer, and your rental company should plan for snow, salt and slush at the loading door so chairs arrive clean and floors stay protected.",
        link: { href: "/blog/winter-wedding-seating", label: "Winter seating ideas" },
      },
      {
        q: "What happens to rented chairs if it rains?",
        a: "Ask your rental company before you book. Most wood and resin chairs can handle a light shower but should be wiped down before guests sit, while upholstered chairs must stay dry. The safest plan is a tent or indoor backup with time built in to move chairs.",
      },
    ],
  },
  {
    id: "venues",
    title: "Venue rules, loading docks and permits",
    intro: "Chicago venues, especially downtown, have rules your rental company has to follow.",
    image: {
      src: "/answers/venue-load-in-checklist.svg",
      alt: "Checklist of five venue rules to ask about: insurance, access, timing, floors and strike",
      width: 1200,
      height: 660,
    },
    answers: [
      {
        q: "What do Chicago venues require from a chair rental company?",
        a: "Most ask for a certificate of insurance naming the venue, a scheduled load-in and load-out window, and use of the loading dock or freight elevator. Many also require floor protection and set a firm time when everything must be gone. Ask your venue coordinator for their vendor packet first.",
        link: { href: "/blog/chicago-venue-rules-chair-rentals", label: "Venue rules checklist" },
      },
      {
        q: "Do I need a permit to rent chairs for an event in a Chicago park?",
        a: "Events in Chicago Park District parks generally need a permit from the Park District, and rentals delivered there must follow its rules. Requirements change by park and event size, so check directly with the Chicago Park District before you book any rentals.",
      },
      {
        q: "Can chairs be delivered to a high-rise or loft venue?",
        a: "Usually yes, but it takes more planning. Your rental company needs the freight elevator size and reservation time, the loading dock rules and the distance from the truck to the room, since long carries and stairs add time and often cost.",
      },
    ],
  },
  {
    id: "booking",
    title: "When to book, and last-minute rentals",
    intro: "The best chairs go first on the best dates. Here's how far ahead to plan.",
    image: {
      src: "/answers/booking-timeline.svg",
      alt: "Timeline of when to book event chairs: 9 to 12 months for peak Saturdays, 4 to 6 months for most events, final count 6 to 8 weeks out, last minute 1 to 2 weeks",
      width: 1200,
      height: 470,
    },
    answers: [
      {
        q: "How far in advance should I book event chairs in Chicago?",
        a: "For a Saturday wedding between June and October, start 9 to 12 months out, since specialty styles in limited quantities go first. Most other events are comfortable at 4 to 6 months. Confirm your final count about 6 to 8 weeks before the date.",
        link: { href: "/blog/when-to-book-event-chair-rentals-chicago", label: "Booking timeline" },
      },
      {
        q: "Can I rent chairs last minute in Chicago?",
        a: "Often yes for classic styles, especially on weekdays and in the off-season, but specialty chairs in large quantities may already be reserved. Call or email with your date, count and venue address so the rental company can check stock and delivery slots right away.",
        link: { href: "/blog/last-minute-chair-rental-chicago", label: "Last-minute rental tips" },
      },
      {
        q: "Can I change my chair count after I book?",
        a: "Most rental companies let you adjust the count up to a cutoff date before the event, often a few weeks out. Increases depend on what's still available, so lock in a close estimate early and ask about the change policy in writing.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery across Chicago and the suburbs",
    intro: "We're based in St. Charles and plan routes across the Fox Valley, west suburbs and the city.",
    image: {
      src: "/answers/service-area.svg",
      alt: "Schematic of the delivery area from St. Charles across the Fox Valley, west suburbs and Chicago",
      width: 1200,
      height: 720,
    },
    answers: [
      {
        q: "Do chair rental companies deliver to the Chicago suburbs?",
        a: "Yes. Most full-service rental companies deliver, set up and pick up, with fees based on distance, timing and venue access. We serve St. Charles, Geneva, Batavia, Elgin, Naperville, Aurora, Wheaton, Oak Brook, Schaumburg and Chicago, and we'll quote venues farther out.",
        link: { href: "/blog/chair-rental-delivery-chicago-suburbs", label: "Suburban delivery guide" },
      },
      {
        q: "Will the rental company set up the chairs?",
        a: "Full-service rentals include setup and pickup, so chairs arrive placed to your floor plan and are stacked and removed after the event. Drop-off only service costs less but leaves the setup to you or your venue, so check which one your quote includes.",
      },
      {
        q: "Can I pick up rental chairs myself to save money?",
        a: "Some companies offer will-call pickup for smaller orders. You'll need a vehicle large enough, help to load and a plan for returning on time. For more than a few dozen chairs, delivery is usually worth it.",
      },
    ],
  },
  {
    id: "styles",
    title: "Choosing a chair style",
    intro: "Chiavari isn't the only option. Here's how to pick a chair that fits your event.",
    image: {
      src: "/chairs/render/cross-back.jpg",
      alt: "A walnut cross-back vineyard chair",
      width: 1000,
      height: 1250,
    },
    answers: [
      {
        q: "What are the best alternatives to Chiavari chairs?",
        a: "Cross-back, ghost, bentwood, rattan, wishbone, cane-back and velvet dining chairs all give a room a clear point of view. Choose by your venue's style: cross-back for barns and vineyards, ghost for modern lofts, rattan for gardens and velvet for black-tie.",
        link: { href: "/blog/chiavari-chair-alternatives", label: "12 Chiavari alternatives" },
      },
      {
        q: "Which chairs are most comfortable for long events?",
        a: "Chairs with a supportive back and a cushion are most comfortable for a dinner that runs several hours. Velvet dining, Louis and cushioned cross-back chairs are good picks, and older guests appreciate a chair with arms near the dance floor.",
        link: { href: "/chairs", label: "Browse the collection" },
      },
      {
        q: "Can I mix different chair styles at one event?",
        a: "Yes. A common approach is one style for guest tables and a statement chair for the head or sweetheart table. Mixing two styles at alternating tables also works well when they share a color or material.",
        link: { href: "/quiz", label: "Take the style quiz" },
      },
    ],
  },
];

export const allAnswers = answerTopics.flatMap((t) => t.answers);
