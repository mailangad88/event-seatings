// Free, email-gated planning downloads (the /downloads library).
//
// Files live in public/dl/<slug>/ and are built by scripts:
//   python3 scripts/build-spreadsheets.py   -> .xlsx and .csv (live formulas)
//   node scripts/build-kit-pdfs.mjs         -> <slug>.pdf + cover.png from src/data/kits/<slug>.json
//   bash scripts/build-previews.sh          -> cover.png for spreadsheet-only downloads
//
// Every email captured is saved as a lead (kind "waitlist", source "download:<slug>") so the CRM can
// segment by asset. Blog posts pick their offer with `download: <slug>` in the header, or by
// matching `downloadForPost` below.
import backyard from "./kits/backyard-party-planning-kit.json";
import birthday from "./kits/birthday-party-planning-kit.json";
import celebration from "./kits/celebration-of-life-planning-checklist.json";
import corporate from "./kits/corporate-event-planning-kit.json";
import master from "./kits/event-planning-kit.json";
import gala from "./kits/gala-fundraiser-planning-kit.json";
import graduation from "./kits/graduation-party-planning-kit.json";
import holiday from "./kits/holiday-party-planning-kit.json";
import mitzvah from "./kits/mitzvah-planning-kit.json";
import weather from "./kits/outdoor-event-weather-plan.json";
import quince from "./kits/quinceanera-planning-kit.json";
import runOfShow from "./kits/run-of-show-template.json";
import seating from "./kits/seating-chart-planner.json";
import shower from "./kits/shower-planning-kit.json";
import southAsian from "./kits/south-asian-wedding-planner.json";
import wedding from "./kits/wedding-planning-kit.json";

export type DownloadFile = { label: string; file: string; format: "PDF" | "Excel" | "CSV"; note: string };
type KitJson = { title: string; subtitle: string; intro: string; sections: { heading: string; kind: string }[] };

export type Download = {
  slug: string;
  title: string;
  /** Short line for cards. */
  blurb: string;
  /** Meta description, 140-160 characters. */
  description: string;
  /** Who it is for, used to group the library. */
  group: "Any event" | "Weddings" | "Parties" | "Corporate & nonprofit" | "Cultural celebrations";
  keyword: string;
  files: DownloadFile[];
  /** What is inside, shown as a checklist on the landing page. */
  inside: string[];
  intro: string;
  faqs: { q: string; a: string }[];
  /** Words in a post slug or tags that make this the best offer for that post. */
  match: string[];
};

const pdf = (slug: string, title: string, pages = "Printable"): DownloadFile => ({
  label: `${title} (PDF)`,
  file: `/dl/${slug}/${slug}.pdf`,
  format: "PDF",
  note: `${pages} kit with timeline, checklists, tables and a fill-in worksheet`,
});
const xlsx = (slug: string, name: string, label: string, note: string): DownloadFile => ({ label, file: `/dl/${slug}/${name}.xlsx`, format: "Excel", note });
const csv = (slug: string, name: string, label: string, note: string): DownloadFile => ({ label, file: `/dl/${slug}/${name}.csv`, format: "CSV", note });
const sections = (k: KitJson) => k.sections.map((s) => s.heading);

const commonFaqs = (what: string) => [
  {
    q: `Is the ${what} really free?`,
    a: `Yes. Enter your email and the download links appear right away, with no account needed. You can unsubscribe from planning emails at any time.`,
  },
  {
    q: "Will the spreadsheets work in Google Sheets or Numbers?",
    a: "Yes. The Excel files open in Microsoft Excel, Google Sheets (File, then Import) and Apple Numbers, and the formulas keep working. CSV versions are there for any tool that prefers plain columns.",
  },
  {
    q: "Can I share it with my partner, family or committee?",
    a: "Yes. Print it, forward it or upload it to a shared drive. It is free for personal and nonprofit planning use.",
  },
];

export const downloads: Download[] = [
  {
    slug: "event-planning-kit",
    title: "Ultimate Event Planning Kit",
    blurb: "A start-to-finish planner for any event, plus a workbook that sets every due date from your event date.",
    description: "Free event planning kit: a printable PDF timeline and checklists plus an Excel workbook with budget, guest list, RSVPs, vendors and auto due dates.",
    group: "Any event",
    keyword: "event planning kit",
    files: [
      pdf("event-planning-kit", "Event Planning Kit"),
      xlsx("event-planning-kit", "event-planning-workbook", "Event Planning Workbook (Excel)", "Timeline with auto due dates, budget, guest list, RSVP summary, vendors and day-of contacts"),
    ],
    inside: [...sections(master), "Workbook: type your event date and all 26 task due dates fill in"],
    intro: master.intro,
    faqs: [
      { q: "What events does the kit work for?", a: "Any event with guests, a date and a budget: birthdays, showers, weddings, reunions, galas, corporate events, religious and cultural celebrations. Event-specific kits are in the library if you want more detail for one type." },
      { q: "How far ahead should I start planning an event?", a: "Six months is comfortable for most parties of 75 or more guests, and 9 to 12 months for weddings and galas. The workbook works backward from your date, so starting late just means more tasks are due this week." },
      ...commonFaqs("event planning kit"),
    ],
    match: ["plan-an-event", "event-planning", "step-by-step", "how-to-plan", "checklist", "planning"],
  },
  {
    slug: "event-budget-spreadsheet",
    title: "Event Budget Spreadsheet",
    blurb: "Every line item for any event, with estimate, quote and actual columns, balances due and cost per guest.",
    description: "Free event budget spreadsheet for Excel and Google Sheets: 45 line items, suggested category split, balances due and cost per guest that update as you type.",
    group: "Any event",
    keyword: "event budget spreadsheet",
    files: [
      xlsx("event-budget-spreadsheet", "event-budget-spreadsheet", "Event Budget (Excel)", "Totals, cost per guest, left-in-budget warning and a suggested split by category"),
      csv("event-budget-spreadsheet", "event-budget", "Event Budget (CSV)", "Plain columns for any tool"),
    ],
    inside: [
      "45 prefilled line items across 10 categories",
      "Estimate, quote, actual, paid and balance due columns",
      "Cost per guest and money left in budget, with a red warning when you go over",
      "Suggested category split you can change",
      "Due date and vendor columns so nothing gets paid late",
    ],
    intro: "Most event budgets go wrong in the gap between the first estimate and the final invoice. This spreadsheet keeps estimate, quote and actual side by side, so you see the gap while there is still time to adjust.",
    faqs: [
      { q: "How should I split an event budget?", a: "A common starting split puts about a third into food and drink, a fifth into the venue, roughly a tenth into rentals, and the rest across decor, entertainment, photos and a 5 to 10 percent contingency. The spreadsheet starts there and lets you change every share." },
      { q: "What do people forget to budget for?", a: "Delivery and pickup fees, service charges and tax on catering, gratuities, overtime, permits, and a contingency. They are all listed as line items so you can price them early." },
      ...commonFaqs("budget spreadsheet"),
    ],
    match: ["budget", "cost", "price", "fees", "save-money", "deposit", "paying"],
  },
  {
    slug: "guest-list-rsvp-tracker",
    title: "Guest List and RSVP Tracker",
    blurb: "One row per invitation with RSVP, meal and thank-you dropdowns, and a summary tab that counts everything.",
    description: "Free guest list and RSVP tracker spreadsheet: RSVP, meal choice and thank-you dropdowns plus automatic counts of seats, responses and meals for the caterer.",
    group: "Any event",
    keyword: "guest list rsvp tracker spreadsheet",
    files: [
      xlsx("guest-list-rsvp-tracker", "guest-list-rsvp-tracker", "Guest List and RSVP Tracker (Excel)", "300 rows, dropdowns, color-coded RSVPs and an automatic summary"),
      csv("guest-list-rsvp-tracker", "guest-list-rsvp-tracker", "Guest List (CSV)", "Import into Google Sheets, Zola, The Knot or a mail-merge tool"),
    ],
    inside: [
      "Household, group, contact and mailing address columns",
      "RSVP, meal choice and thank-you dropdowns",
      "Seats invited vs. seats attending",
      "Summary tab: response rate, pending replies, meal counts, dietary notes",
      "Table number column that feeds your seating chart",
    ],
    intro: "The guest list drives almost every number in your plan: venue size, chairs, tables, meals and favors. Keep it in one place and the headcount you give your caterer and rental company will be right the first time.",
    faqs: [
      { q: "When should RSVPs be due?", a: "Three to four weeks before the event is typical. That leaves a week to chase missing replies before your caterer and rental company need final counts, usually 10 to 14 days out." },
      { q: "Should I track households or individual guests?", a: "Track one row per invitation (household) with a seats-invited number. It matches how invitations go out and how people reply, and the summary still totals individual seats." },
      ...commonFaqs("guest list tracker"),
    ],
    match: ["guest-list", "rsvp", "invitation", "save-the-date", "headcount"],
  },
  {
    slug: "seating-chart-planner",
    title: "Seating Chart Planner",
    blurb: "A printable seating guide plus a spreadsheet that shows open seats at every table as you assign guests.",
    description: "Free seating chart planner: printable PDF with table capacities and etiquette, plus an Excel template that counts assigned and open seats at every table.",
    group: "Any event",
    keyword: "seating chart template",
    files: [
      pdf("seating-chart-planner", "Seating Chart Planner"),
      xlsx("seating-chart-planner", "seating-chart-planner", "Seating Chart Spreadsheet (Excel)", "40 tables, 500 guests, live open-seat counts and over-full warnings"),
      csv("seating-chart-planner", "seating-guest-list", "Seating Guest List (CSV)", "Plain columns for seating apps"),
    ],
    inside: [...sections(seating), "Spreadsheet: assign a table number and open seats update instantly"],
    intro: seating.intro,
    faqs: [
      { q: "How many people fit at a round table?", a: "A 60 inch round seats 8 comfortably and 10 tightly. A 72 inch round seats 10 to 12, and a 48 inch round seats 6. The planner has a full capacity table, including banquet and farm tables." },
      { q: "When should I make the seating chart?", a: "Start a draft when RSVPs open and finish within a few days of the RSVP deadline, usually 2 to 3 weeks before the event, so escort cards and the floor plan can be printed." },
      ...commonFaqs("seating chart planner"),
    ],
    match: ["seating-chart", "seating", "floor-plan", "layout", "table-", "head-table", "sweetheart", "reserved"],
  },
  {
    slug: "rental-order-calculator",
    title: "Rental Order Calculator",
    blurb: "Type your guest count and service style. Get chairs, tables, linens, plates, flatware, glasses and ice.",
    description: "Free rental order calculator spreadsheet: enter guest count and service style to get chairs, tables, linens, plates, flatware, glassware and ice counts.",
    group: "Any event",
    keyword: "event rental calculator",
    files: [xlsx("rental-order-calculator", "rental-order-calculator", "Rental Order Calculator (Excel)", "30 quantities from 9 inputs, with how each one is calculated")],
    inside: [
      "Inputs: guests, share seated, seats per table, service style, courses, hours, bar, cocktail hour",
      "Seating: chairs, guest tables, buffet and utility tables, cocktail tables",
      "Linens and napkins with spares",
      "Dinnerware and flatware by course and service style",
      "Glassware, toast flutes and ice in pounds",
      "Chafing dishes, coffee urns, dispensers and trash stations",
    ],
    intro: "Rental orders usually go wrong on the small stuff: not enough plates for a buffet's second trip, no flutes for the toast, ice that runs out by 8 p.m. Change the yellow cells and every quantity recalculates.",
    faqs: [
      { q: "How many plates do I need per guest?", a: "For a buffet, plan about 1.5 dinner plates per guest for second trips, plus one each for salad and dessert if served. Plated dinners need one per course. The calculator adds a 10 percent spare you can change." },
      { q: "How much ice do I need for a party?", a: "A common rule is about 1.5 pounds per guest for drinks, plus more for chilling bottles on long or hot days. The calculator adds extra for each hour of the event." },
      ...commonFaqs("rental calculator"),
    ],
    match: ["how-many", "plates", "glass", "napkin", "flatware", "chafing", "how-much-ice", "linens", "dinnerware", "china", "tablecloth", "rental"],
  },
  {
    slug: "vendor-tracker",
    title: "Vendor Comparison and Contact Tracker",
    blurb: "Track 16 vendor types, deposits and balances, and score up to three quotes on terms, not just price.",
    description: "Free vendor tracker spreadsheet: compare up to three quotes per vendor, track deposits, balances, contracts and insurance, and score quotes on terms.",
    group: "Any event",
    keyword: "event vendor tracker spreadsheet",
    files: [
      xlsx("vendor-tracker", "vendor-tracker", "Vendor Tracker (Excel)", "Vendors tab plus a quote comparison scorecard"),
      csv("vendor-tracker", "vendor-tracker", "Vendor Tracker (CSV)", "Plain columns for any tool"),
    ],
    inside: [
      "16 vendor categories prefilled, from venue to photo booth",
      "Quote, deposit, balance and due dates with automatic totals",
      "Contract signed and certificate of insurance checkboxes",
      "Status dropdown from researching to paid in full",
      "Compare tab: score three quotes on 10 questions that matter",
    ],
    intro: "The cheapest quote is often the one that leaves out delivery, setup or a damage waiver. This tracker puts every vendor, payment and contract in one place and scores quotes on what they actually include.",
    faqs: [
      { q: "How many quotes should I get for each vendor?", a: "Two or three is enough for most categories. More than that slows you down without changing the decision much. Use the compare tab to score them on terms, not just the total." },
      { q: "What should every vendor quote include?", a: "Exact items and quantities, delivery and pickup windows, setup, the damage or breakage policy, cancellation and weather terms, deposit dates and insurance. The scorecard lists all ten." },
      ...commonFaqs("vendor tracker"),
    ],
    match: ["vendor", "quote", "contract", "questions-to-ask", "red-flags", "hire", "compare", "insurance", "coi"],
  },
  {
    slug: "run-of-show-template",
    title: "Day-of Timeline and Run of Show",
    blurb: "Sample run-of-show schedules for a party, a wedding and a corporate evening, with auto clock times.",
    description: "Free run of show template: printable day-of timelines for parties, weddings and corporate events plus an Excel version that sets clock times from your start.",
    group: "Any event",
    keyword: "run of show template",
    files: [
      pdf("run-of-show-template", "Run of Show"),
      xlsx("run-of-show-template", "run-of-show-template", "Run of Show (Excel)", "Three timelines plus a contact sheet. Type a start time and every clock time updates"),
    ],
    inside: [...sections(runOfShow), "Spreadsheet: party, wedding and corporate tabs with auto clock times"],
    intro: runOfShow.intro,
    faqs: [
      { q: "What is a run of show?", a: "A minute-by-minute schedule for the event day that lists what happens, who leads it, where, and any music or AV cue. Every vendor and helper works from the same copy." },
      { q: "When should I send the run of show to vendors?", a: "Share a draft about a month out and the final version 7 to 10 days before, with arrival times and a single day-of point person." },
      ...commonFaqs("run of show"),
    ],
    match: ["timeline", "run-of-show", "day-of", "schedule", "itinerary", "flip", "hour"],
  },
  {
    slug: "wedding-planning-kit",
    title: "Wedding Planning Kit",
    blurb: "12-month timeline, budget split, vendor order, rental quantities and a wedding workbook.",
    description: "Free wedding planning kit for Chicago couples: 12-month checklist, budget split, vendor booking order, rental quantities and an Excel wedding workbook.",
    group: "Weddings",
    keyword: "wedding planning checklist",
    files: [
      pdf("wedding-planning-kit", "Wedding Planning Kit"),
      xlsx("wedding-planning-kit", "wedding-planning-workbook", "Wedding Workbook (Excel)", "Budget, timeline with auto due dates, guest list with rehearsal and welcome party columns, vendors"),
    ],
    inside: [...sections(wedding), "Workbook: wedding budget, 30-task timeline, 350-row guest list and vendor tracker"],
    intro: wedding.intro,
    faqs: [
      { q: "How far ahead should we start planning a Chicago wedding?", a: "Twelve months is comfortable, especially for June through October Saturdays when venues and vendors book early. Six months is doable with a weekday, Friday or off-season date." },
      { q: "What should we book first?", a: "The venue and date, then the vendors who only do one wedding a day: photographer, caterer and band or DJ. Rentals, florals and decor follow once you know the space." },
      ...commonFaqs("wedding planning kit"),
    ],
    match: ["wedding", "bride", "groom", "bridal-party", "elopement", "engagement", "rehearsal", "bachelor"],
  },
  {
    slug: "birthday-party-planning-kit",
    title: "Birthday Party Planning Kit",
    blurb: "For kids' parties and milestone birthdays from 1st to 90th: timeline, food amounts, games and budget.",
    description: "Free birthday party planning kit: printable timeline, checklists, food and drink amounts, games and budget for kids' parties and milestone adult birthdays.",
    group: "Parties",
    keyword: "birthday party planning checklist",
    files: [pdf("birthday-party-planning-kit", "Birthday Party Planning Kit")],
    inside: sections(birthday),
    intro: birthday.intro,
    faqs: [
      { q: "How far ahead should I plan a birthday party?", a: "Four to six weeks for a kids' party at home, and two to three months for a milestone party at a venue or with rentals, especially in May, June and December." },
      ...commonFaqs("birthday party kit"),
    ],
    match: ["birthday", "sweet-16", "21st", "50th", "milestone", "first-birthday", "kids-party", "debut", "doljanchi"],
  },
  {
    slug: "shower-planning-kit",
    title: "Baby and Bridal Shower Planning Kit",
    blurb: "Who hosts, timeline, games, menu amounts, budget and a gift tracker for thank-you notes.",
    description: "Free baby and bridal shower planning kit: who hosts, timeline, games and activities, menu amounts, budget and a printable gift tracker for thank-you notes.",
    group: "Parties",
    keyword: "baby shower planning checklist",
    files: [pdf("shower-planning-kit", "Shower Planning Kit")],
    inside: sections(shower),
    intro: shower.intro,
    faqs: [
      { q: "When should a baby shower be held?", a: "Most are held 4 to 8 weeks before the due date, when the parent-to-be still feels up to a party. Bridal showers are usually 2 to 3 months before the wedding." },
      ...commonFaqs("shower planning kit"),
    ],
    match: ["shower", "sip-and-see", "gender-reveal", "baby"],
  },
  {
    slug: "corporate-event-planning-kit",
    title: "Corporate Event Planning Kit",
    blurb: "Event brief, timeline, AV and room setups, registration tracker, budget per attendee and ROI checklist.",
    description: "Free corporate event planning kit: event brief, timeline, venue questions, room setups, registration tracker, budget per attendee and ROI checklist.",
    group: "Corporate & nonprofit",
    keyword: "corporate event planning checklist",
    files: [
      pdf("corporate-event-planning-kit", "Corporate Event Planning Kit"),
      xlsx("corporate-event-planning-kit", "corporate-event-workbook", "Corporate Event Workbook (Excel)", "Budget with cost per attendee, registration and check-in tracker, timeline"),
    ],
    inside: [...sections(corporate), "Workbook: budget per attendee, 600-row registration tracker with show rate, timeline"],
    intro: corporate.intro,
    faqs: [
      { q: "How far in advance should a corporate event be planned?", a: "Three to six months for most company events, and 9 to 12 months for conferences or anything in December, when Chicago venues book up for holiday parties." },
      ...commonFaqs("corporate event kit"),
    ],
    match: ["corporate", "conference", "company", "offsite", "team-building", "employee", "sales-kickoff", "awards", "registration", "client", "product-launch", "trade-show", "networking", "board", "office"],
  },
  {
    slug: "gala-fundraiser-planning-kit",
    title: "Gala and Fundraiser Planning Kit",
    blurb: "Committee timeline, sponsorship tiers, auction checklist, run of show and donor follow-up, plus trackers.",
    description: "Free gala and fundraiser planning kit: committee timeline, sponsorship tiers, silent auction checklist, run of show, volunteer roles and sponsor trackers.",
    group: "Corporate & nonprofit",
    keyword: "fundraising gala planning checklist",
    files: [
      pdf("gala-fundraiser-planning-kit", "Gala and Fundraiser Kit"),
      xlsx("gala-fundraiser-planning-kit", "gala-fundraiser-workbook", "Gala Workbook (Excel)", "Sponsor tracker, 80-item auction tracker with suggested opening bids, expense budget, timeline"),
    ],
    inside: [...sections(gala), "Workbook: sponsors, auction items, expenses and timeline"],
    intro: gala.intro,
    faqs: [
      { q: "How far ahead should a fundraising gala be planned?", a: "Nine to twelve months is common, because sponsors set budgets early and popular Chicago ballrooms book a year out for spring and fall dates." },
      ...commonFaqs("gala kit"),
    ],
    match: ["gala", "fundraiser", "fundraising", "auction", "charity", "nonprofit", "sponsor", "volunteer", "5k", "school-fundraiser"],
  },
  {
    slug: "graduation-party-planning-kit",
    title: "Graduation Party Planning Kit",
    blurb: "Open-house planning for the May and June crunch: timeline, food amounts, display table and rain plan.",
    description: "Free graduation party planning kit: open house timeline, food amounts by guest count, photo display table, budget and rain plan for Chicago-area grads.",
    group: "Parties",
    keyword: "graduation party planning checklist",
    files: [pdf("graduation-party-planning-kit", "Graduation Party Kit")],
    inside: sections(graduation),
    intro: graduation.intro,
    faqs: [
      { q: "When should I book rentals for a graduation party?", a: "Four to six weeks ahead at minimum for May and June weekends, and earlier for tents. The weekends right after commencement fill first." },
      ...commonFaqs("graduation party kit"),
    ],
    match: ["graduation", "grad", "commencement", "prom", "open-house"],
  },
  {
    slug: "quinceanera-planning-kit",
    title: "Quinceañera Planning Kit",
    blurb: "A 12-month plan for the Mass, reception, court of honor and padrinos, with a budget and worksheet.",
    description: "Free quinceañera planning kit: 12-month timeline, Mass and reception checklists, court of honor, padrinos tracker, budget and worksheet for Chicago families.",
    group: "Cultural celebrations",
    keyword: "quinceanera planning checklist",
    files: [pdf("quinceanera-planning-kit", "Quinceañera Planning Kit")],
    inside: sections(quince),
    intro: quince.intro,
    faqs: [
      { q: "How far ahead should we plan a quinceañera?", a: "About a year. Parishes, banquet halls and photographers book early, and the court needs months to learn the vals." },
      ...commonFaqs("quinceañera kit"),
    ],
    match: ["quinceanera", "quince", "mexican", "puerto-rican", "padrinos", "dia-de-muertos"],
  },
  {
    slug: "south-asian-wedding-planner",
    title: "South Asian Wedding Multi-Event Planner",
    blurb: "Roka to reception: every event, headcount, outfit and rental, plus a guest list by event.",
    description: "Free South Asian wedding planner: per-event plan for mehndi, sangeet, haldi, baraat, ceremony and reception, with budget and a guest list by event.",
    group: "Cultural celebrations",
    keyword: "indian wedding planning checklist",
    files: [
      pdf("south-asian-wedding-planner", "South Asian Wedding Planner"),
      xlsx("south-asian-wedding-planner", "south-asian-wedding-workbook", "Multi-Event Workbook (Excel)", "Events tab with budgets, 600-row guest list with per-event invites, vendors"),
    ],
    inside: [...sections(southAsian), "Workbook: per-event budget, guest list by event with counts"],
    intro: southAsian.intro,
    faqs: [
      { q: "How many events are in a South Asian wedding?", a: "Often three to six, such as a mehndi, sangeet, haldi, the ceremony and a reception, though it varies by family, region and faith. The planner lets you rename and add events." },
      ...commonFaqs("South Asian wedding planner"),
    ],
    match: ["south-asian", "indian", "sangeet", "mehndi", "haldi", "mandap", "sikh", "anand-karaj", "nikah", "diwali", "garba", "navratri", "holi", "eid", "iftar"],
  },
  {
    slug: "mitzvah-planning-kit",
    title: "Bar and Bat Mitzvah Planning Kit",
    blurb: "A 12 to 18 month plan for the service and the party, with kids and adult zones and a budget.",
    description: "Free bar and bat mitzvah planning kit: 12 to 18 month timeline, service and party checklists, kids and adult zones, rentals table, budget and worksheet.",
    group: "Cultural celebrations",
    keyword: "bar mitzvah planning checklist",
    files: [pdf("mitzvah-planning-kit", "Bar and Bat Mitzvah Kit")],
    inside: sections(mitzvah),
    intro: mitzvah.intro,
    faqs: [
      { q: "How far ahead should a bar or bat mitzvah be planned?", a: "Most families start 12 to 18 months ahead, once the synagogue sets the date, so the party venue, DJ and photographer can be booked." },
      { q: "How do I keep kids and adults both entertained?", a: "Split the room into zones: a kids' area with a DJ, games and their own food station, and an adult area with a bar and lounge seating nearby so parents can watch from a seat. The kit's rentals table lists what each zone typically needs." },
      { q: "What rentals come up most often for a mitzvah party?", a: "Lounge furniture and a dance floor for the party, standard tables and chairs for the adult dinner, and kids' tables sized lower than the adult ones. The kit's rentals table breaks this down by guest count." },
      ...commonFaqs("mitzvah kit"),
    ],
    match: ["mitzvah", "jewish", "bris", "passover", "hanukkah", "shiva", "rosh"],
  },
  {
    slug: "holiday-party-planning-kit",
    title: "Holiday Party Planning Kit",
    blurb: "Office and home holiday parties from Friendsgiving to New Year's, with Chicago winter logistics.",
    description: "Free holiday party planning kit: office and home party timeline, food and drink amounts, budget and Chicago winter logistics like coats, snow and parking.",
    group: "Parties",
    keyword: "holiday party planning checklist",
    files: [pdf("holiday-party-planning-kit", "Holiday Party Kit")],
    inside: sections(holiday),
    intro: holiday.intro,
    faqs: [
      { q: "When should we book a December holiday party in Chicago?", a: "By late summer or early fall for Friday and Saturday dates in December, which are the first to go at venues and rental companies." },
      ...commonFaqs("holiday party kit"),
    ],
    match: ["holiday", "christmas", "thanksgiving", "friendsgiving", "new-year", "december", "halloween", "easter", "kwanzaa", "winter", "hot-cocoa", "super-bowl", "lunar"],
  },
  {
    slug: "outdoor-event-weather-plan",
    title: "Outdoor Event Weather Plan",
    blurb: "Chicago seasons, tent decisions, rain, heat, wind and cold plans, and a go or no-go timeline.",
    description: "Free outdoor event weather plan for Chicago: seasonal guide, tent decision checklist, rain, heat and wind plans, permits and a go or no-go decision timeline.",
    group: "Any event",
    keyword: "outdoor event rain plan",
    files: [pdf("outdoor-event-weather-plan", "Outdoor Event Weather Plan")],
    inside: sections(weather),
    intro: weather.intro,
    faqs: [
      { q: "When should I decide on a rain plan?", a: "Pick the backup when you book, then make the call with the 5 to 7 day forecast, since many tent companies need a few days' notice to add a tent or sidewalls." },
      ...commonFaqs("weather plan"),
    ],
    match: ["tent", "outdoor", "rain", "weather", "heat", "wind", "lakefront", "beach", "park", "forest-preserve", "summer", "april", "-in-may", "june", "july", "august", "september", "october", "garden"],
  },
  {
    slug: "celebration-of-life-planning-checklist",
    title: "Celebration of Life Planning Checklist",
    blurb: "A gentle guide to gathering family and friends: venue, program, memory table and repast.",
    description: "Free celebration of life planning checklist: first steps, venue options, order of service, memory table, repast food amounts and a helper task list.",
    group: "Any event",
    keyword: "celebration of life planning checklist",
    files: [pdf("celebration-of-life-planning-checklist", "Celebration of Life Checklist")],
    inside: sections(celebration),
    intro: celebration.intro,
    faqs: [
      { q: "How soon after a death is a celebration of life held?", a: "Anywhere from a week to several months later. Unlike a funeral, it can wait until family can travel and the weather suits the gathering you want." },
      { q: "What belongs on a memory table?", a: "Photos spanning different years, a few personal items that say something about them, a guest book and a sign asking guests to share a story on a card. The checklist includes a simple layout for setting it up near the entrance." },
      { q: "Who usually handles the logistics?", a: "Often a close family member or friend volunteers to coordinate, since the immediate family is grieving. The checklist's helper task list is built so you can hand off specific jobs, like the memory table or the repast, to different people." },
      ...commonFaqs("celebration of life checklist"),
    ],
    match: ["celebration-of-life", "memorial", "funeral", "repast", "shiva"],
  },
  {
    slug: "backyard-party-planning-kit",
    title: "Backyard Party Planning Kit",
    blurb: "Measure your yard, size the party, and plan shade, power, restrooms, neighbors and cleanup.",
    description: "Free backyard party planning kit: yard measuring worksheet, space per guest, tent and shade, power, restrooms, food amounts, rentals checklist and budget.",
    group: "Parties",
    keyword: "backyard party planning checklist",
    files: [pdf("backyard-party-planning-kit", "Backyard Party Kit")],
    inside: sections(backyard),
    intro: backyard.intro,
    faqs: [
      { q: "How many guests fit in my backyard?", a: "Plan about 10 to 12 square feet per guest for a seated dinner at round tables and 6 to 8 for a standing party, after you subtract beds, trees and paths. The worksheet walks you through it." },
      ...commonFaqs("backyard party kit"),
    ],
    match: ["backyard", "block-party", "bbq", "garage", "yard", "picnic", "home", "housewarming", "reunion", "fourth-of-july", "juneteenth", "neighborhood"],
  },
];

export const downloadGroups = ["Any event", "Weddings", "Parties", "Corporate & nonprofit", "Cultural celebrations"] as const;

export function getDownload(slug: string) {
  return downloads.find((d) => d.slug === slug);
}

export const coverImage = (slug: string) => `/dl/${slug}/cover.png`;

/**
 * The best free download to offer on a blog post: the post's own `download:` header, else the asset whose
 * match words hit the slug and tags most specifically (event-type kits before generic tools), else the master kit.
 */
export function downloadForPost(slug: string, tags: string[] = [], named?: string): Download {
  const own = named ? getDownload(named) : undefined;
  if (own) return own;
  const hay = `${slug} ${tags.join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  // Event-type kits come first so a "wedding budget" post offers the wedding kit, not the generic budget sheet.
  const order = [...downloads.filter((d) => d.group !== "Any event"), ...downloads.filter((d) => d.group === "Any event")];
  for (const d of order) if (d.slug !== "event-planning-kit" && d.match.some((m) => hay.includes(m))) return d;
  return downloads[0];
}
