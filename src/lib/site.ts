// Central business settings. Edit these and the whole site updates.
export const site = {
  name: "Event Seatings",
  domain: "eventseatings.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://eventseatings.com",
  tagline: "Wedding chairs beyond Chiavari",
  description:
    "Event Seatings rents distinctive wedding and event chairs (cross-back, ghost, rattan, bentwood, velvet and more) across St. Charles, the Fox Valley and Chicago's western suburbs.",
  city: "St. Charles, IL",
  serviceArea: [
    "St. Charles",
    "Geneva",
    "Batavia",
    "Elgin",
    "Naperville",
    "Aurora",
    "Wheaton",
    "Oak Brook",
    "Schaumburg",
    "Chicago",
  ],
  email: "hello@eventseatings.com",
  instagram: "https://instagram.com/eventseatings",
  pinterest: "https://pinterest.com/eventseatings",
  // Pre-launch: the first season we will actually deliver chairs.
  // Quote requests for earlier dates get an honest "we're not delivering yet" note.
  launch: {
    seasonLabel: "2027 Founding Season",
    firstEventDate: "2027-04-01",
  },
};

export type Site = typeof site;
