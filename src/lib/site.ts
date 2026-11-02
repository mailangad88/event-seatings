// Central business settings. Edit these and the whole site updates.
export const site = {
  name: "Beyond Chiavari",
  domain: "beyondchiavari.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://beyondchiavari.com",
  tagline: "Every event rental in Chicago, one quote",
  // Primary market shown in titles and copy.
  market: "Chicago",
  marketLong: "Chicago & suburbs",
  description:
    "Beyond Chiavari is Chicago's event rental marketplace: chairs, tables, linens, dinnerware, glassware, tents, dance floors, lighting and more from trusted local rental houses. See prices upfront, build one quote, and we coordinate delivery and setup across Chicago and the suburbs.",
  // Where the business is based (used for the LocalBusiness address).
  city: "St. Charles, IL",
  locality: "St. Charles",
  region: "IL",
  // Chicago first: it is the primary market.
  serviceArea: [
    "Chicago",
    "Evanston",
    "Oak Park",
    "Oak Brook",
    "Schaumburg",
    "Naperville",
    "Wheaton",
    "Aurora",
    "St. Charles",
    "Geneva",
    "Batavia",
    "Elgin",
  ],
  email: "hello@beyondchiavari.com",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "",
  instagram: "https://instagram.com/beyondchiavari",
  pinterest: "https://pinterest.com/beyondchiavari",
  // Calendly / Cal.com / Google booking page for the free seating call.
  // When empty, /book shows a call-request form instead.
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
  callLength: "15-minute",
  // Pre-launch: the first season we will actually deliver chairs.
  // Quote requests for earlier dates get an honest "we're not delivering yet" note.
  launch: {
    seasonLabel: "2027 Founding Season",
    firstEventDate: "2027-04-01",
  },
  // The free 15-minute seating consult every form and email points to.
  // Set NEXT_PUBLIC_BOOKING_URL to a HubSpot Meetings, Calendly or Cal.com link. Until it's set, booking buttons stay hidden.
  booking: {
    url: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
    label: "Book a free 15-minute seating consult",
  },
};

export type Site = typeof site;
