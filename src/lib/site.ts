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
  // The person every customer deals with. Shown in the "Who you'll talk to" block. To add a photo, put a
  // square picture at public/brand/owner.jpg and set photo to "/brand/owner.jpg"; until then it shows initials.
  owner: { name: "Angad Singh", first: "Angad", role: "Owner", photo: "" },
  phone: process.env.NEXT_PUBLIC_PHONE ?? "",
  instagram: "https://instagram.com/beyondchiavari",
  pinterest: "https://pinterest.com/beyondchiavari",
  // Calendly / Cal.com / Google booking page for the free seating call.
  // When empty, /book shows a call-request form instead.
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
  callLength: "15-minute",
  // When someone is actually answering enquiries, e.g. "Mon–Sat, 9am–6pm". Set NEXT_PUBLIC_BUSINESS_HOURS only once those
  // hours are covered: with it set the site promises a reply within one business hour in those hours; without it,
  // the promise is "within one business day".
  hours: process.env.NEXT_PUBLIC_BUSINESS_HOURS?.trim() ?? "",
  // Booking is open now: partner rental companies deliver year-round (business-model plan, Nov 2 2026).
  // Quote requests for dates before firstEventDate get a "we're not delivering yet" note, so keep it in the past
  // unless booking ever has to pause.
  launch: {
    seasonLabel: "Now booking holidays & 2027",
    firstEventDate: "2026-11-02",
  },
  // The free 15-minute seating consult every form and email points to.
  // Set NEXT_PUBLIC_BOOKING_URL to a HubSpot Meetings, Calendly or Cal.com link. Until it's set, booking buttons stay hidden.
  booking: {
    url: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
    label: "Book a free 15-minute seating consult",
  },
};

export type Site = typeof site;

// The reply-time promise used in trust copy. Only promises a one-hour reply when business hours are configured.
export const replyPromise = site.hours
  ? `replies within one business hour (${site.hours}, Central time)`
  : "replies within one business day";
