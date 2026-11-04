import type { IconName } from "@/components/ui";
import type { Faq } from "@/components/ui/FaqList";

// Landing pages for people who already have a rental problem ("solutions") or are choosing how to book
// ("compare"). Each page targets one search phrase, opens with a 40 to 60 word answer, shows a before/after,
// answers real buyer questions and ends in one call to action.
//
// Facts rule: everything here is either general practice a planner can check, our own published terms
// (rental companies' own prices, flat $295/$495 fee per event, nothing charged until every company confirms), or comes from our Nov 2026 vendor research
// (docs/vendor-research.md, /mnt/project-files/research/vendors). Vendors are described, never named,
// because they are our partners. Search volumes are NOT measured yet: `phrase` is the target, and the
// volume/difficulty columns get filled from Search Console or Keyword Planner once those accounts exist.

export type BuyerPage = {
  kind: "solutions" | "compare";
  slug: string;
  phrase: string; // the one search phrase this page targets
  title: string; // <title> and H1
  description: string; // meta description, 120 to 160 characters
  answer: string; // 40 to 60 words, shown first and used for AEO
  icon: IconName;
  before: { title: string; points: string[] };
  after: { title: string; points: string[] };
  sections: { h: string; p: string[]; list?: string[] }[];
  table?: { head: string[]; rows: string[][]; caption: string };
  faqs: Faq[];
  cta: { title: string; text: string };
  related: { href: string; label: string }[];
};

export const buyerPages: BuyerPage[] = [
  {
    kind: "solutions",
    slug: "event-rental-quotes-chicago",
    phrase: "event rental quotes chicago",
    title: "How to Get Event Rental Quotes in Chicago Fast",
    description:
      "Get chairs, tables, linens, dishes and tents priced on one list in Chicago, instead of calling five rental companies and waiting days for answers.",
    answer:
      "List every item with quantities, your date, guest count and venue, then send the same list to every rental company so the quotes match. The fastest route is one itemized list that is priced as you build it. Our quote builder does that for 2,500+ Chicago rental items and confirms your date within one business day.",
    icon: "quote",
    before: {
      title: "Calling around",
      points: [
        "Five calls, five slightly different lists",
        "Most rental sites show no prices until you ask",
        "Quotes arrive days apart in different formats",
        "Delivery and damage fees appear at the end",
      ],
    },
    after: {
      title: "One priced list",
      points: [
        "Every category on one list with live prices",
        "Quantities suggested from your guest count",
        "One proposal, usually within one business day",
        "Delivery, setup and waiver shown line by line",
      ],
    },
    sections: [
      {
        h: "What a rental company needs before it can quote",
        p: ["Missing details are the main reason quotes take days. Have these ready before you ask anyone:"],
        list: [
          "Event date, plus delivery and pickup windows the venue allows",
          "Venue address, and whether it is indoors, outdoors or under a tent",
          "Guest count and the seating style (rounds, long tables, theater rows)",
          "Every item with a quantity, including linens sized to each table",
          "Stairs, elevators or a long carry from the truck",
        ],
      },
      {
        h: "Why Chicago rental quotes are hard to compare",
        p: [
          "In our research of Chicago-area rental companies in November 2026, most did not publish prices online and quoted by phone or form. The ones that did used different rental periods (one-day vs six-hour), and charged delivery by distance, time window or stairs.",
          "So two quotes for the same chairs can differ by delivery terms, setup and the damage waiver, not the chair price. Ask every company to itemize those three lines.",
        ],
      },
    ],
    faqs: [
      { q: "How long does an event rental quote take in Chicago?", a: "Companies that quote by phone or form often reply in one to three business days. Our builder shows prices as you pick, and the confirmed proposal for your date usually arrives within one business day." },
      { q: "Do I have to pay to get a quote?", a: "No. A quote is free and holds nothing. With us, nothing is charged until a rental company confirms your date and you approve the proposal." },
      { q: "Can I get one quote for chairs, tables, linens and tents?", a: "Yes. Our catalog covers 19 categories from Chicago-area rental houses, so one list can include chairs, tables, linens, tableware, tents, lighting and more." },
      { q: "What if an item I want is not on the site?", a: "Add it to the notes on your quote. We ask our rental partners and include it in the proposal if one of them carries it." },
    ],
    cta: { title: "Price your whole list now", text: "Pick items, see prices as you go, and send it once. No payment until you approve." },
    related: [
      { href: "/solutions/compare-event-rental-quotes", label: "How to compare two rental quotes" },
      { href: "/tools/rental-calculator", label: "Rental quantity calculator" },
      { href: "/how-it-works", label: "How booking works" },
    ],
  },
  {
    kind: "solutions",
    slug: "compare-event-rental-quotes",
    phrase: "how to compare event rental quotes",
    title: "How to Compare Event Rental Quotes Line by Line",
    description:
      "Two rental quotes for the same chairs can differ by delivery, setup, damage waiver and rental period. A checklist to compare them fairly before you sign.",
    answer:
      "Compare the total, not the item price. Line up five things on each quote: item prices, delivery and pickup fees, setup and breakdown, the damage waiver or protection fee, and the rental period. Then check the deposit and cancellation terms. Quotes that leave any of these out are not comparable yet, so ask for them in writing.",
    icon: "search",
    before: {
      title: "Comparing headline prices",
      points: ["$4 chair vs $6 chair looks like an easy win", "Delivery hidden in a separate email", "Waiver added at contract time", "Cancellation terms not read until too late"],
    },
    after: {
      title: "Comparing totals",
      points: ["Same item list on every quote", "Delivery, setup and waiver itemized", "Rental period and overtime written down", "Deposit and cancellation side by side"],
    },
    sections: [
      {
        h: "The five lines that change a rental total",
        p: ["These are the lines we saw vary most between Chicago-area rental companies in our November 2026 research:"],
        list: [
          "Delivery and pickup: priced by distance, time window, stairs or after-hours",
          "Setup and breakdown: some place every chair, some leave stacks at the door",
          "Damage protection: one luxury house we checked charges a mandatory 10%",
          "Rental period: one company prices a 6-hour rental with an hourly overtime fee, another a one-day rate",
          "Payment terms: deposits, card fees (one tent company adds 3.5%) and minimum orders",
        ],
      },
      {
        h: "Questions to send every company",
        p: ["Copy these into your email so every reply answers the same things:"],
        list: [
          "What is the all-in total for this list, delivered and picked up on these dates?",
          "Is setup included, and what does setup mean (placed, or dropped stacked)?",
          "What does the damage waiver cover, and what does it cost?",
          "What is the deposit, when is the balance due, and what is refundable?",
          "Is there a minimum order or a late-pickup fee?",
        ],
      },
    ],
    table: {
      caption: "Example with sample data: the same 120-chair order quoted two ways.",
      head: ["Line", "Quote A", "Quote B"],
      rows: [
        ["120 chairs", "$480", "$600"],
        ["Delivery and pickup", "$250 (separate, after hours)", "Included"],
        ["Setup", "Not included", "Included"],
        ["Damage waiver", "10% of rental", "None"],
        ["Total", "$778 plus setup labor", "$600"],
      ],
    },
    faqs: [
      { q: "What is a damage waiver on a rental quote?", a: "A fee, usually a percentage of the rental, that covers accidental damage beyond normal wear. It rarely covers loss or theft. Ask what it excludes before you compare totals." },
      { q: "Is the cheapest rental quote usually the best?", a: "Only if it includes the same delivery, setup, waiver and rental period. The lowest item price often comes with separate delivery and setup fees." },
      { q: "Should I ask for setup to be included?", a: "If your venue has no staff to place chairs and tables, yes. Ask whether setup means placed in your layout or dropped stacked near the door." },
      { q: "How does a Beyond Chiavari proposal show these lines?", a: "Every item, delivery, setup and policy is listed separately, with our flat booking fee as its own line, so you can compare it with any other quote." },
    ],
    cta: { title: "Get a quote that is already itemized", text: "Every line on one list: items, delivery, setup and fees. Compare it with anything." },
    related: [
      { href: "/solutions/event-rental-quotes-chicago", label: "Get rental quotes fast" },
      { href: "/glossary", label: "Event rental glossary" },
      { href: "/booking-promise", label: "Our Booking Promise" },
    ],
  },
  {
    kind: "solutions",
    slug: "last-minute-event-rentals-chicago",
    phrase: "last minute event rentals chicago",
    title: "Last-Minute Event Rentals in Chicago: What Still Works",
    description:
      "Need chairs, tables or linens this week in Chicago? What to ask first, what to swap if stock is gone, and how to check several rental houses at once.",
    answer:
      "Call or send your list today, and lead with the date, guest count and delivery address. Ask for in-stock substitutes instead of a specific style, and accept a wider delivery window. Checking several rental houses at once matters most, because stock is confirmed date by date and one company's sold-out item is often available at another.",
    icon: "calendar",
    before: { title: "Calling one company at a time", points: ["Sold out, call the next one", "A day lost per attempt", "Settling for whatever is left", "Delivery window you cannot make"] },
    after: { title: "Asking several at once", points: ["One list sent to every partner who carries it", "Substitutes suggested in the same style", "Flexible delivery window agreed up front", "One confirmation to track"] },
    sections: [
      {
        h: "What to do in the first hour",
        p: ["Speed comes from giving every company the same complete list. Send:"],
        list: ["Date, address and the latest delivery time the venue allows", "Guest count and the seating style", "Must-haves vs nice-to-haves (white folding chairs vs any clean chair)", "A phone number you will answer today"],
      },
      {
        h: "Good swaps when stock is gone",
        p: ["Short-notice orders work best when you are flexible on style. Common swaps: white folding for white resin folding, 60-inch rounds for 72-inch rounds with fewer tables, floor-length linens for spandex covers on cocktail tables, and gold Chiavari for silver or clear."],
      },
    ],
    faqs: [
      { q: "Can I rent chairs and tables for this weekend in Chicago?", a: "Often, yes, especially for standard folding chairs and round tables. Specialty styles and tents go first. Send your list as early as you can and say which items can be swapped." },
      { q: "Do rental companies charge more for rush orders?", a: "Some add fees for short-notice or tight delivery windows. Ask whether a wider window lowers the delivery price." },
      { q: "How fast can Beyond Chiavari confirm a last-minute order?", a: "We check your date with partner rental houses as soon as your request arrives, usually within one business day. For an event in the next few days, also book a call so we can move faster by phone." },
    ],
    cta: { title: "Send your list now", text: "We check it with several Chicago rental houses at once, with substitutes if something is booked." },
    related: [
      { href: "/book", label: "Book a call" },
      { href: "/rentals/chairs", label: "Chair rentals" },
      { href: "/solutions/event-rental-quotes-chicago", label: "Get quotes fast" },
    ],
  },
  {
    kind: "solutions",
    slug: "rental-minimum-order-too-high",
    phrase: "event rental minimum order",
    title: "Event Rental Minimum Order Too High? Your Options",
    description:
      "Some Chicago rental houses set order minimums in the thousands. How to rent for a small party anyway: combine categories, pick the right vendor type, or pick up.",
    answer:
      "Order minimums mostly come from luxury and full-service rental houses; one Chicago house we checked requires $3,500 within 50 miles. For a smaller event, use a company that rents by the piece, add the tables, linens and tableware you need to the same order to clear a lower minimum, or ask about customer pickup instead of delivery.",
    icon: "ruler",
    before: { title: "Small party, big minimum", points: ["Love the look, can't reach the minimum", "Padding the order with things you don't need", "Or giving up on the style entirely"] },
    after: { title: "Matched to the right house", points: ["Piece-by-piece rental for small counts", "One combined order across categories", "Specialty pieces only where they show", "Pickup where it saves the delivery fee"] },
    sections: [
      {
        h: "Why minimums exist",
        p: ["Delivery crews and trucks cost the same for 20 chairs or 200. Houses that specialize in large weddings set minimums so a truck run pays for itself. Party rental stores that do backyard events usually rent by the piece with a delivery fee instead."],
      },
      {
        h: "Ways around a minimum",
        p: [],
        list: [
          "Put chairs, tables, linens and tableware on one order instead of splitting them",
          "Use specialty pieces where guests see them (a head table, a lounge) and standard pieces elsewhere",
          "Ask whether customer pickup is allowed and what it saves",
          "Move to a weekday delivery if your venue allows an early drop",
        ],
      },
    ],
    faqs: [
      { q: "Do all event rental companies have a minimum order?", a: "No. Many party rental stores rent by the piece and charge delivery. Minimums are more common at luxury and full-service houses." },
      { q: "What is a typical event rental minimum?", a: "It varies widely and is often unpublished. One Chicago luxury house we checked in November 2026 listed $3,500 within 50 miles." },
      { q: "Can Beyond Chiavari help with a small order?", a: "Yes. We route each item to a partner that rents it at your quantity, and show delivery on the proposal so you can see whether pickup or a different mix is cheaper." },
    ],
    cta: { title: "See what your small event costs", text: "Build the list at your real guest count and we will match it to houses that fit the size." },
    related: [
      { href: "/tools/rental-calculator", label: "Rental quantity calculator" },
      { href: "/compare/party-store-vs-full-service-rental", label: "Party store vs full-service rental" },
      { href: "/quote", label: "Build a quote" },
    ],
  },
  {
    kind: "solutions",
    slug: "event-rental-delivery-pickup-times",
    phrase: "event rental delivery and pickup times",
    title: "Event Rental Delivery and Pickup Times, Explained",
    description:
      "When rentals arrive and leave decides your price and your setup stress. How delivery windows, late pickups and venue rules work for Chicago events.",
    answer:
      "Most rental companies deliver in a window, not at an exact time, and charge more for narrow, early, late-night or weekend windows. Get your venue's load-in and load-out rules first, then ask for delivery the day before or morning of, and pickup the same night or next morning. Write the windows into the contract.",
    icon: "truck",
    before: { title: "Guessing the timing", points: ["Rentals arrive while the florist needs the room", "Venue charges for a late load-out", "Pickup lands on a Sunday surcharge"] },
    after: { title: "Timing agreed up front", points: ["Venue rules checked before quoting", "Delivery window in writing", "Pickup time matched to venue close", "Fees for odd hours shown on the quote"] },
    sections: [
      {
        h: "What to ask your venue first",
        p: [],
        list: ["Earliest load-in and latest load-out time", "Loading dock, elevator or stairs", "Whether rentals can stay overnight", "Certificate of insurance requirements for vendors"],
      },
      {
        h: "How delivery is usually priced",
        p: ["From the Chicago-area price lists we checked: delivery is priced by distance and time, with extra charges for stairs and after-hours work; party rentals for parks often run on a fixed rental period with an hourly overtime fee."],
      },
    ],
    faqs: [
      { q: "Can event rentals be delivered the day before?", a: "Often, if your venue allows it. Day-before delivery gives setup crews more time and can be cheaper than a tight same-day window." },
      { q: "What is a late pickup fee?", a: "A charge for collecting rentals outside normal hours, such as after midnight. Ask for it in writing and compare it with next-morning pickup." },
      { q: "Do I need a certificate of insurance for rentals?", a: "Many Chicago venues ask vendors for one. Ask your venue, then ask the rental company to send it to them directly." },
    ],
    cta: { title: "Tell us your venue's rules", text: "We put delivery and pickup windows on your proposal before anything is booked." },
    related: [
      { href: "/glossary", label: "Event rental glossary" },
      { href: "/solutions/compare-event-rental-quotes", label: "Compare rental quotes" },
      { href: "/how-it-works", label: "How booking works" },
    ],
  },
  {
    kind: "solutions",
    slug: "how-much-to-rent-for-event",
    phrase: "how many rentals do i need for an event",
    title: "How Many Chairs, Tables and Dishes Do I Need?",
    description:
      "Quantities for chairs, round tables, linens, plates, flatware and glasses by guest count, with real Chicago rental prices and a free calculator.",
    answer:
      "Start with one chair per guest, one 60-inch round per eight guests, and one floor-length linen per table. For a plated dinner, plan one dinner plate, salad plate, napkin, fork, knife, water glass and wine glass per guest. Our free calculator multiplies this out for your guest count and prices it from current Chicago rental lists.",
    icon: "users",
    before: { title: "Rough guesses", points: ["Short on chairs at the ceremony", "Linens that don't fit the tables", "Forgetting chargers or salad forks"] },
    after: { title: "Counted from guest count", points: ["Every item scaled to your guests", "Tables and linens that match", "A priced list you can send as is"] },
    sections: [
      {
        h: "Rules of thumb",
        p: [],
        list: [
          "Chairs: 1 per guest, plus ceremony seats if ceremony and reception are in different spaces",
          "60-inch rounds: 8 guests each (10 is tight); 48-inch rounds: 6",
          "Cocktail highboys: about 1 per 10 guests during cocktail hour",
          "Linens: 1 per table, sized to the table and drop length",
          "Plated dinner: 1 of each plate, fork, knife, napkin and glass per guest",
          "Coffee cups: about 6 for every 10 guests",
        ],
      },
    ],
    faqs: [
      { q: "How many guests fit at a 60-inch round table?", a: "Eight comfortably, ten if chairs are narrow and plates are small. Use eight for a plated dinner with chargers." },
      { q: "Should I rent extra plates and glasses?", a: "Many planners add a small spare for breakage and late additions. Ask the rental company whether unused extras are charged." },
      { q: "Where can I calculate my rental quantities?", a: "Use our free rental calculator. Enter your guest count and it lists quantities with current prices, then sends the list to our quote builder." },
    ],
    cta: { title: "Turn your guest count into a priced list", text: "The calculator fills the quote builder for you. Change anything before you send it." },
    related: [
      { href: "/tools/rental-calculator", label: "Rental quantity calculator" },
      { href: "/blog/how-many-chairs-do-i-need", label: "How many chairs do I need?" },
      { href: "/table-seating-guides", label: "Table seating guides" },
    ],
  },
  {
    kind: "compare",
    slug: "marketplace-vs-calling-rental-companies",
    phrase: "event rental marketplace vs rental company",
    title: "Booking Through Us vs Calling Rental Companies Yourself",
    description:
      "An honest comparison: booking Chicago event rentals through Beyond Chiavari vs calling rental companies directly. Cost, time, choice and who to call when things go wrong.",
    answer:
      "Calling rental companies yourself avoids our flat booking fee, and it works well for a simple order from one company. Item prices are the same either way, because we add no markup. Booking through Beyond Chiavari costs a flat $295 ($495 over 200 guests) and saves you comparing several companies, gives one itemized proposal across every category, and adds our Booking Promise if a vendor cancels. Pick direct for simple, us for multi-category.",
    icon: "users",
    before: { title: "Calling direct", points: ["No booking fee", "You compare and chase each company", "Several contracts and contacts", "You handle a vendor cancellation"] },
    after: { title: "Booking through us", points: ["Flat $295 fee ($495 over 200 guests), no markup on items", "One list, priced as you build it", "One coordinator for every vendor", "Booking Promise if a vendor cancels"] },
    sections: [
      {
        h: "When calling direct is the better choice",
        p: ["If you need one category from one company you already trust (say, 100 folding chairs from the store down the road), call them. You will pay their price with no booking fee, and one contact is easy to manage."],
      },
      {
        h: "When booking through us is worth the fee",
        p: ["When the order spans several categories or companies (chairs from one, tents from another, linens from a third), the fee buys the comparison, the single proposal and one person who coordinates delivery and fixes problems."],
      },
    ],
    table: {
      caption: "How the two routes compare. Our terms are from /booking-promise and /how-it-works.",
      head: ["", "Calling rental companies yourself", "Booking through Beyond Chiavari"],
      rows: [
        ["Price", "Vendor price", "Vendor price, plus our flat fee paid after every company confirms"],
        ["Prices before you ask", "Most Chicago houses we checked do not publish them", "Live prices on 2,500+ items"],
        ["Categories per quote", "What that company carries", "19 categories on one list"],
        ["Contacts", "One per company", "One coordinator"],
        ["If a vendor cancels", "You find a replacement", "We find a replacement (Booking Promise)"],
        ["When you pay", "Per company's deposit terms", "Nothing until a vendor confirms and you approve"],
      ],
    },
    faqs: [
      { q: "Is it cheaper to book event rentals directly?", a: "Yes, by our flat booking fee, if you book the same items from the same company. Item prices are the same, since we add no markup. You also do the comparing, contracts and coordination yourself." },
      { q: "Who delivers if I book through Beyond Chiavari?", a: "An established Chicago-area rental company (we ask for proof of insurance), named once you approve your proposal. Its rental agreement covers delivery, setup and pickup, and we coordinate between you." },
      { q: "Can I see the vendor's price and your fee separately?", a: "Yes. Your proposal shows the rental company's price and our booking fee, so you can check the difference." },
    ],
    cta: { title: "See the full price before you decide", text: "Build your list, see every line, and decide whether booking through us is worth it." },
    related: [
      { href: "/booking-promise", label: "Our Booking Promise" },
      { href: "/how-it-works", label: "How booking works" },
      { href: "/compare/party-store-vs-full-service-rental", label: "Party store vs full-service rental" },
    ],
  },
  {
    kind: "compare",
    slug: "party-store-vs-full-service-rental",
    phrase: "party rental vs full service event rental",
    title: "Party Rental Store vs Full-Service Event Rental House",
    description:
      "Party rental stores and full-service event rental houses price, deliver and set up differently. Which fits a backyard party, a wedding or a corporate gala in Chicago.",
    answer:
      "Party rental stores rent by the piece, often with a fixed rental period and a delivery fee, and suit backyard parties and kids' events. Full-service rental houses carry upscale tableware, specialty chairs and linens, handle setup, and may set order minimums, so they suit weddings and galas. Many events mix both.",
    icon: "tent",
    before: { title: "One type for everything", points: ["Bounce-house store for a black-tie dinner", "Luxury house minimum for a birthday", "Paying for service you don't need, or missing it"] },
    after: { title: "Matched by item", points: ["Standard pieces from a by-the-piece store", "Specialty chairs and china from a full-service house", "Setup where it matters", "One list across both"] },
    sections: [
      {
        h: "What we found in Chicago price lists",
        p: [
          "Party-focused stores in our research publish prices for inflatables, games, concessions, tables and chairs, often for a set rental period with overtime charged hourly.",
          "Full-service houses publish upscale tableware and specialty chairs (one has a public 2026 price guide), or quote only, and some list order minimums, mandatory damage protection and non-refundable deposits.",
        ],
      },
    ],
    table: {
      caption: "Typical differences, from our November 2026 review of Chicago-area rental companies.",
      head: ["", "Party rental store", "Full-service rental house"],
      rows: [
        ["Best for", "Backyard parties, kids' events, picnics", "Weddings, galas, corporate dinners"],
        ["Pricing", "Usually published, by the piece", "Published price guide or quote only"],
        ["Rental period", "Often a fixed period with hourly overtime", "Often a day rate, multi-day by quote"],
        ["Setup", "Drop-off common", "Setup and breakdown often offered"],
        ["Minimums", "Rare", "Some set them"],
      ],
    },
    faqs: [
      { q: "Can I rent from a party store and a full-service house for the same event?", a: "Yes, and many planners do. The work is coordinating two deliveries; one combined proposal handles that." },
      { q: "Which is cheaper for chairs?", a: "For standard folding chairs, party stores are usually cheaper per piece. For Chiavari, cross-back or ghost chairs, full-service houses carry more choice." },
      { q: "Do party stores deliver and set up?", a: "Some deliver, but most expect you to pick up and return items yourself, and few set up. Full-service rental houses deliver, set up and collect, which matters for large orders, tents and heavy furniture." },
    ],
    cta: { title: "Get the right mix on one list", text: "We route each item to the kind of rental house that fits it, and show the total." },
    related: [
      { href: "/solutions/rental-minimum-order-too-high", label: "Minimum order too high?" },
      { href: "/compare/marketplace-vs-calling-rental-companies", label: "Booking through us vs direct" },
      { href: "/rentals", label: "Browse all rentals" },
    ],
  },
  {
    kind: "compare",
    slug: "rent-vs-buy-event-chairs",
    phrase: "rent or buy chairs for event",
    title: "Rent or Buy Chairs for an Event? A Simple Break-Even",
    description:
      "Should you rent or buy event chairs? Divide the purchase price by the rental price to find your break-even, then add storage, transport and cleaning.",
    answer:
      "Rent if you will use the chairs fewer times than the break-even, which is the purchase price divided by the rental price per event. Then add what owning really costs: storage, a vehicle to move them, cleaning and replacements. For one wedding or party, renting almost always wins; for weekly events in your own space, buying can.",
    icon: "chair",
    before: { title: "Buying on impulse", points: ["Chairs bought for one event", "Garage full of chairs", "No truck to move them next time"] },
    after: { title: "Deciding with numbers", points: ["Break-even worked out first", "Storage and transport counted", "Rent for one-off events, buy for repeat use"] },
    sections: [
      {
        h: "The break-even, step by step",
        p: ["1. Find the rental price per chair per event. 2. Find the purchase price per chair. 3. Divide purchase by rental. That is how many events before buying pays off, before storage and transport."],
      },
    ],
    table: {
      caption: "Example with sample data. Rental price from our current catalog; purchase price is a placeholder to replace with a real quote.",
      head: ["", "White folding chair"],
      rows: [
        ["Rental per event (our catalog)", "$2.48"],
        ["Purchase price (sample)", "$25.00"],
        ["Break-even", "about 10 events"],
        ["Plus owning costs", "Storage, transport, cleaning, replacements"],
      ],
    },
    faqs: [
      { q: "Is it cheaper to rent or buy chairs for a wedding?", a: "For a single wedding, renting is almost always cheaper once you count delivery, storage and resale effort." },
      { q: "When does buying event chairs make sense?", a: "When you host often in the same space and have storage, such as a church hall, venue or office." },
      { q: "How many uses before buying chairs pays off?", a: "Divide the purchase price per chair, plus storage and transport, by the rental price per chair. For basic folding chairs that is often several events; for Chiavari or cross-back chairs it is usually many more, and only if you have somewhere to store them." },
    ],
    cta: { title: "Price chairs for your date", text: "See current rental prices for every chair style in Chicago." },
    related: [
      { href: "/rentals/chairs", label: "Chair rentals" },
      { href: "/chair-rental-cost", label: "Chair rental cost guides" },
      { href: "/tools/rental-calculator", label: "Rental quantity calculator" },
    ],
  },
];

export const getBuyerPage = (kind: BuyerPage["kind"], slug: string) => buyerPages.find((p) => p.kind === kind && p.slug === slug);
export const buyerPagesOf = (kind: BuyerPage["kind"]) => buyerPages.filter((p) => p.kind === kind);

// Three "money page" links for a guide, picked by words in its title and tags. Guides link into the pages
// that turn readers into quote requests; the calculator and quote guide are the fallbacks.
const linkRules: { words: RegExp; href: string; label: string }[] = [
  { words: /how many|quantit|count|guest/i, href: "/tools/rental-calculator", label: "Rental quantity calculator" },
  { words: /cost|price|budget|afford/i, href: "/solutions/compare-event-rental-quotes", label: "How to compare rental quotes" },
  { words: /last.?minute|this week|rush/i, href: "/solutions/last-minute-event-rentals-chicago", label: "Last-minute rentals in Chicago" },
  { words: /tent|outdoor|backyard|rain/i, href: "/solutions/event-rental-delivery-pickup-times", label: "Delivery and pickup times" },
  { words: /small|intimate|birthday|backyard|kids/i, href: "/solutions/rental-minimum-order-too-high", label: "Minimum order too high?" },
  { words: /buy|diy/i, href: "/compare/rent-vs-buy-event-chairs", label: "Rent or buy chairs?" },
  { words: /planner|vendor|book/i, href: "/compare/marketplace-vs-calling-rental-companies", label: "Book through us or direct?" },
];
const fallbackLinks = [
  { href: "/tools/rental-calculator", label: "Rental quantity calculator" },
  { href: "/solutions/event-rental-quotes-chicago", label: "Get rental quotes fast" },
  { href: "/glossary", label: "Event rental glossary" },
];

export function buyerLinksFor(text: string) {
  const picked = linkRules.filter((r) => r.words.test(text)).map(({ href, label }) => ({ href, label }));
  const out = [...picked, ...fallbackLinks].filter((l, i, a) => a.findIndex((x) => x.href === l.href) === i);
  return out.slice(0, 3);
}
