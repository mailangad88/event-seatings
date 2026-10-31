// Central business settings. Edit these and the whole site updates.
export const site = {
  name: "Beyond Chivary",
  domain: "beyondchivary.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://beyondchivary.com",
  tagline: "Event chair rentals beyond Chiavari",
  // Primary market shown in titles and copy.
  market: "Chicago",
  marketLong: "Chicago & suburbs",
  description:
    "Beyond Chivary rents distinctive chairs for weddings, corporate events, galas and parties across Chicago and the suburbs: cross-back, ghost, rattan, bentwood, velvet, Chiavari alternatives and more, delivered and set up.",
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
  email: "hello@beyondchivary.com",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "",
  instagram: "https://instagram.com/beyondchivary",
  pinterest: "https://pinterest.com/beyondchivary",
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
};

export type Site = typeof site;
