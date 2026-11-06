// Guides for popular Chicago-area venues whose own space doesn't come with tables and chairs:
// banquet halls, VFW/Legion halls, park district fieldhouses and cultural centers, museums and
// institutions that rent out event space, and barns, breweries and distilleries that host private
// events. Content answers "what will I need to rent if my event is at [venue]" — it is NOT a claim
// of partnership, endorsement or booking relationship with any venue named here. Facts (name, city,
// neighborhood) come from growth/referral-partners/referral-partners-chicago.md (public listings:
// Tagvenue, Zola, WeddingWire, Giggster, each venue's own site). Load-in specifics are not public for
// any of these, so every delivery note is phrased as "check with the venue," not stated as fact.

export const VENUES_UPDATED = "2026-11-06";

export type VenueKind =
  | "banquet-hall"
  | "vfw-legion"
  | "fieldhouse-cultural-center"
  | "garden-conservatory"
  | "museum-institution"
  | "barn"
  | "brewery-distillery";

export const venueKindLabel: Record<VenueKind, string> = {
  "banquet-hall": "Banquet hall",
  "vfw-legion": "VFW or American Legion hall",
  "fieldhouse-cultural-center": "Park district fieldhouse or cultural center",
  "garden-conservatory": "Garden ceremony space",
  "museum-institution": "Museum or institution",
  barn: "Barn venue",
  "brewery-distillery": "Brewery or distillery",
};

export type CapacityTier = "small" | "medium" | "large" | "outdoor";

export type VenueGuide = {
  slug: string;
  name: string;
  neighborhoodOrCity: string;
  kind: VenueKind;
  tier: CapacityTier;
  /** Rough seated capacity range shown on the page. A range, not a promise - confirm with the venue. */
  capacityNote: string;
  /** Why this kind of space usually needs outside rentals (from the referral-partner research). */
  whyFit: string;
  /** 2-4 rental categories this kind of venue usually needs, most common first. */
  needs: string[];
  /** Ready-package ids from src/lib/packages.ts to show, sized for this venue. */
  packageIds: string[];
  /** Venue-specific note when something is publicly confirmable (e.g. a stated guest cap). Optional. */
  specificNote?: string;
  sourceUrl?: string;
};

const DEFAULT_DELIVERY_NOTE: Record<VenueKind, string> = {
  "banquet-hall":
    "Most halls like this have a street-level entrance and their own tables stacked on site, so check whether you're renting the room empty or with house furniture before you order. Ask the hall's office about parking for a delivery truck and how far rentals have to be carried.",
  "vfw-legion":
    "VFW and Legion halls are usually one level with a side or rear door for deliveries. Ask the post about load-in times around their own events and bar hours, and whether a volunteer or staff member needs to let the delivery in.",
  "fieldhouse-cultural-center":
    "Chicago Park District fieldhouses and cultural centers are booked through the park district's permit office, not the building directly. Ask your permit contact about delivery windows, whether a staff member unlocks the room for you, and any rules on what can come onto park property.",
  "garden-conservatory":
    "Outdoor garden spaces like this are usually a short walk from the nearest parking or loading area, with no indoor staging room. Ask about cart or dolly access on grass or gravel paths, and what happens if it rains.",
  "museum-institution":
    "Museums and institutions that rent event space usually route deliveries through a separate events or facilities office, not the public entrance. Ask about freight elevators, after-hours access and whether their own security has to be present for the delivery.",
  barn:
    "Barn venues are often on gravel or grass with no loading dock. Ask about the width of the drive-up path, where a truck can park, and whether power for anything beyond lighting needs a generator.",
  "brewery-distillery":
    "Breweries and distilleries usually want deliveries to use a back or side entrance, not the taproom during business hours. Ask about their own delivery schedule for kegs and ingredients so your rentals don't arrive at the same time, and whether outside caterers and rental companies need to be on an approved list.",
};

export function deliveryNoteFor(v: VenueGuide): string {
  return DEFAULT_DELIVERY_NOTE[v.kind];
}

const NEEDS_BY_KIND: Record<VenueKind, string[]> = {
  "banquet-hall": ["Chairs", "Round or long tables", "Linens", "A dance floor or stage"],
  "vfw-legion": ["Chairs", "Long tables", "Linens", "A buffet or bar setup"],
  "fieldhouse-cultural-center": ["Chairs", "Round or long tables", "Linens", "A tent for the loading area in bad weather"],
  "garden-conservatory": ["Garden-style chairs", "A small signing table", "A ceremony arch or arbor", "An umbrella or small canopy"],
  "museum-institution": ["Chairs", "Cocktail and dinner tables", "Linens", "A stage or lectern"],
  barn: ["Chairs", "Farm or banquet tables", "Linens", "Lighting for the evening"],
  "brewery-distillery": ["Chairs", "Cocktail and dinner tables", "Linens", "A small stage or dance floor"],
};

export const venues: VenueGuide[] = [
  // Banquet halls & church halls
  {
    slug: "second-unitarian-church-lakeview",
    name: "Second Unitarian Church",
    neighborhoodOrCity: "Lakeview, Chicago",
    kind: "banquet-hall",
    tier: "medium",
    capacityNote: "roughly 80-150 seated",
    whyFit: "This church rents its hall for weddings and receptions and lets families bring in their own food and drink, which usually means bringing in your own tables and chairs too.",
    needs: NEEDS_BY_KIND["banquet-hall"],
    packageIds: ["wedding-150", "shower-40"],
  },
  {
    slug: "lasalle-street-church-leslie-hall",
    name: "LaSalle Street Church (Leslie Hall)",
    neighborhoodOrCity: "Near North Side, Chicago",
    kind: "banquet-hall",
    tier: "medium",
    capacityNote: "roughly 100-150 seated",
    whyFit: "Leslie Hall is rented out as a whole-venue space for weddings, which means the room comes empty and every table, chair and linen is on you.",
    needs: NEEDS_BY_KIND["banquet-hall"],
    packageIds: ["wedding-150", "corporate-120"],
  },
  {
    slug: "st-andrew-ukrainian-orthodox-church-bloomingdale",
    name: "St. Andrew Ukrainian Orthodox Church",
    neighborhoodOrCity: "Bloomingdale, IL",
    kind: "banquet-hall",
    tier: "medium",
    capacityNote: "roughly 100-200 seated",
    whyFit: "The parish hall here is rented separately from the church service for wedding receptions and other family celebrations.",
    needs: NEEDS_BY_KIND["banquet-hall"],
    packageIds: ["wedding-150", "sangeet-250"],
  },
  {
    slug: "tri-taylor-banquet-hall-conference-center-chapel",
    name: "Tri-Taylor Banquet Hall, Conference Center & Chapel",
    neighborhoodOrCity: "Near West Side, Chicago",
    kind: "banquet-hall",
    tier: "large",
    capacityNote: "roughly 150-250 seated",
    whyFit: "This hall and chapel hosts weddings and larger events, and a space this size is usually priced for the room alone, not furniture.",
    needs: NEEDS_BY_KIND["banquet-hall"],
    packageIds: ["sangeet-250", "corporate-120"],
  },
  {
    slug: "all-saints-parish-lockport",
    name: "All Saints Parish",
    neighborhoodOrCity: "Lockport, IL",
    kind: "banquet-hall",
    tier: "medium",
    capacityNote: "roughly 80-150 seated",
    whyFit: "The parish hall here is rented for community and family events outside of the church calendar.",
    needs: NEEDS_BY_KIND["banquet-hall"],
    packageIds: ["shower-40", "wedding-150"],
  },
  {
    slug: "royal-garden-banquets-chicago",
    name: "Royal Garden Banquets",
    neighborhoodOrCity: "Chicago",
    kind: "banquet-hall",
    tier: "large",
    capacityNote: "roughly 150-300 seated",
    whyFit: "Royal Garden allows outside food and drink, which is usually a sign the room itself is bare and every table, chair and linen is a separate order.",
    needs: NEEDS_BY_KIND["banquet-hall"],
    packageIds: ["sangeet-250", "corporate-120"],
  },
  // VFW / American Legion halls
  {
    slug: "logan-avondale-vfw-post-2978",
    name: "Logan-Avondale VFW Post 2978",
    neighborhoodOrCity: "Avondale, Chicago",
    kind: "vfw-legion",
    tier: "medium",
    capacityNote: "about 125 seated or 200 standing",
    whyFit: "This VFW hall is open to the public for rentals and seats about 125, with the post providing the room, not a rental inventory.",
    needs: NEEDS_BY_KIND["vfw-legion"],
    packageIds: ["wedding-150", "shower-40"],
    specificNote: "Public listings put the room at about 125 seated or 200 standing - confirm the current number with the post before you finalize a headcount.",
  },
  {
    slug: "american-legion-tattler-post-973",
    name: "American Legion Tattler Post 973",
    neighborhoodOrCity: "North Center, Chicago",
    kind: "vfw-legion",
    tier: "medium",
    capacityNote: "roughly 100-150 seated",
    whyFit: "This Legion hall is a community space open to the public for private events, rented as a room rather than a full-service venue.",
    needs: NEEDS_BY_KIND["vfw-legion"],
    packageIds: ["wedding-150", "shower-40"],
  },
  // Park district fieldhouses & cultural centers
  {
    slug: "south-shore-cultural-center",
    name: "South Shore Cultural Center",
    neighborhoodOrCity: "South Shore, Chicago",
    kind: "fieldhouse-cultural-center",
    tier: "large",
    capacityNote: "varies widely by room, from intimate to 300+",
    whyFit: "This Chicago Park District lakefront venue has several rooms of different sizes, and renters typically add their own seated-event furniture.",
    needs: NEEDS_BY_KIND["fieldhouse-cultural-center"],
    packageIds: ["sangeet-250", "corporate-120"],
  },
  {
    slug: "douglass-park-cultural-community-center",
    name: "Douglass Park Cultural & Community Center",
    neighborhoodOrCity: "North Lawndale, Chicago",
    kind: "fieldhouse-cultural-center",
    tier: "medium",
    capacityNote: "roughly 100-200 seated",
    whyFit: "This community center rents its hall for weddings and family events through the Chicago Park District permit office.",
    needs: NEEDS_BY_KIND["fieldhouse-cultural-center"],
    packageIds: ["wedding-150", "shower-40"],
  },
  // Garden / small outdoor ceremony space
  {
    slug: "alfred-caldwell-lily-pool-lincoln-park",
    name: "Alfred Caldwell Lily Pool",
    neighborhoodOrCity: "Lincoln Park, Chicago",
    kind: "garden-conservatory",
    tier: "small",
    capacityNote: "best for small ceremonies, roughly 50 guests or fewer",
    whyFit: "This is a small, independently managed garden space with no furniture of its own, usually booked just for a ceremony rather than a full reception.",
    needs: NEEDS_BY_KIND["garden-conservatory"],
    packageIds: ["shower-40"],
    specificNote: "This is a historic landscape with protected plantings, so ask what can and can't be staked, driven on or set directly on the grass before you order anything.",
  },
  // Lincoln Park Zoo
  {
    slug: "lincoln-park-zoo",
    name: "Lincoln Park Zoo",
    neighborhoodOrCity: "Lincoln Park, Chicago",
    kind: "museum-institution",
    tier: "large",
    capacityNote: "varies widely by space booked",
    whyFit: "The zoo books private events in several spaces and renters usually ask about bringing in outside rental furniture for seated events.",
    needs: NEEDS_BY_KIND["museum-institution"],
    packageIds: ["corporate-120", "wedding-150"],
  },
  // Museums & institutions
  {
    slug: "chicago-history-museum",
    name: "Chicago History Museum",
    neighborhoodOrCity: "Lincoln Park, Chicago",
    kind: "museum-institution",
    tier: "large",
    capacityNote: "varies widely by room booked",
    whyFit: "The museum rents its event spaces for private functions, and larger events here usually add outside rental furniture.",
    needs: NEEDS_BY_KIND["museum-institution"],
    packageIds: ["corporate-120", "wedding-150"],
  },
  {
    slug: "museum-of-contemporary-art-chicago",
    name: "Museum of Contemporary Art Chicago",
    neighborhoodOrCity: "Streeterville, Chicago",
    kind: "museum-institution",
    tier: "large",
    capacityNote: "varies widely by room booked",
    whyFit: "The MCA rents event space for weddings and private events, separate from its galleries and programming.",
    needs: NEEDS_BY_KIND["museum-institution"],
    packageIds: ["corporate-120", "wedding-150"],
  },
  {
    slug: "field-museum-chicago",
    name: "Field Museum",
    neighborhoodOrCity: "Near South Side, Chicago",
    kind: "museum-institution",
    tier: "large",
    capacityNote: "varies widely, often used for large events",
    whyFit: "Events here are often large enough that outside rental furniture is standard, on top of whatever the museum provides in-house.",
    needs: NEEDS_BY_KIND["museum-institution"],
    packageIds: ["corporate-120", "sangeet-250"],
  },
  {
    slug: "international-museum-of-surgical-science",
    name: "International Museum of Surgical Science",
    neighborhoodOrCity: "Lincoln Park, Chicago",
    kind: "museum-institution",
    tier: "small",
    capacityNote: "a smaller, hourly-booked event space",
    whyFit: "This is a smaller venue typically booked by the hour, which fits a more intimate seated event than a full reception.",
    needs: NEEDS_BY_KIND["museum-institution"],
    packageIds: ["shower-40"],
  },
  {
    slug: "smart-museum-of-art-uchicago",
    name: "Smart Museum of Art (University of Chicago)",
    neighborhoodOrCity: "Hyde Park, Chicago",
    kind: "museum-institution",
    tier: "medium",
    capacityNote: "roughly 80-150, depending on the gallery space used",
    whyFit: "The museum's galleries are rented out for private events separate from museum hours.",
    needs: NEEDS_BY_KIND["museum-institution"],
    packageIds: ["shower-40", "wedding-150"],
  },
  // Barn
  {
    slug: "hoosier-grove-barn-streamwood",
    name: "Hoosier Grove Barn",
    neighborhoodOrCity: "Streamwood, IL",
    kind: "barn",
    tier: "outdoor",
    capacityNote: "roughly 100-150 seated",
    whyFit: "This village-owned barn doesn't run its own rental furniture business, so renters bring in tables, chairs and linens separately.",
    needs: NEEDS_BY_KIND.barn,
    packageIds: ["wedding-150", "tent-wedding-150"],
  },
  // Breweries & distilleries
  {
    slug: "on-tour-brewing-company-logan-square",
    name: "On Tour Brewing Company",
    neighborhoodOrCity: "Logan Square, Chicago",
    kind: "brewery-distillery",
    tier: "medium",
    capacityNote: "up to about 100 guests",
    whyFit: "The taproom welcomes outside caterers for private events up to about 100 guests, and taprooms rarely own event-size seating.",
    needs: NEEDS_BY_KIND["brewery-distillery"],
    packageIds: ["shower-40", "wedding-150"],
  },
  {
    slug: "vice-district-brewing-co-bridgeport",
    name: "Vice District Brewing Co",
    neighborhoodOrCity: "Bridgeport, Chicago",
    kind: "brewery-distillery",
    tier: "medium",
    capacityNote: "roughly 80-150 guests",
    whyFit: "This taproom allows approved outside caterers for private events, which usually comes with bringing in your own tables and chairs.",
    needs: NEEDS_BY_KIND["brewery-distillery"],
    packageIds: ["shower-40", "wedding-150"],
  },
  {
    slug: "koval-distillery-ravenswood",
    name: "Koval Distillery",
    neighborhoodOrCity: "Ravenswood, Chicago",
    kind: "brewery-distillery",
    tier: "small",
    capacityNote: "up to about 50 guests",
    whyFit: "Koval's indoor and outdoor space is booked for events up to about 50 guests, a size where outside seating is usually needed.",
    needs: NEEDS_BY_KIND["brewery-distillery"],
    packageIds: ["shower-40"],
  },
  {
    slug: "rhine-hall-distillery-west-town",
    name: "Rhine Hall Distillery",
    neighborhoodOrCity: "West Town, Chicago",
    kind: "brewery-distillery",
    tier: "medium",
    capacityNote: "up to about 120 guests standing",
    whyFit: "The tasting room here hosts private events up to about 120 standing, and a standing-capacity space usually needs rented seating for a sit-down portion.",
    needs: NEEDS_BY_KIND["brewery-distillery"],
    packageIds: ["shower-40", "wedding-150"],
  },
  {
    slug: "pilot-project-brewing-ravenswood",
    name: "Pilot Project Brewing",
    neighborhoodOrCity: "Ravenswood, Chicago",
    kind: "brewery-distillery",
    tier: "medium",
    capacityNote: "roughly 80-120 guests",
    whyFit: "The taproom and patio here are rented out for private events, with seating brought in separately.",
    needs: NEEDS_BY_KIND["brewery-distillery"],
    packageIds: ["shower-40", "wedding-150"],
  },
  {
    slug: "dovetail-brewery-ravenswood",
    name: "Dovetail Brewery",
    neighborhoodOrCity: "Ravenswood, Chicago",
    kind: "brewery-distillery",
    tier: "medium",
    capacityNote: "roughly 80-150 guests",
    whyFit: "Dovetail hosts weddings and private events in its taproom, which comes furnished for a bar crowd, not a seated dinner.",
    needs: NEEDS_BY_KIND["brewery-distillery"],
    packageIds: ["wedding-150", "shower-40"],
  },
];

export const venuePath = (v: VenueGuide) => `/venues/${v.slug}`;
export const getVenueGuide = (slug: string) => venues.find((v) => v.slug === slug);
export const venuesByKind = (kind: VenueKind) => venues.filter((v) => v.kind === kind);
