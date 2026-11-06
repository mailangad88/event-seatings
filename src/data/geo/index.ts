import { chicagoLocations } from "./chicago";
import { eventTypes } from "./events";
import { northSuburbs } from "./north-suburbs";
import type { EventType, Location } from "./types";
import { westSuburbs } from "./west-suburbs";
import { chicagoNorthAreas } from "./areas/chicago-north";
import { chicagoSouthAreas } from "./areas/chicago-south";
import { countiesOuterAreas } from "./areas/counties-outer";
import { dupageAreas } from "./areas/dupage";
import { farSouthCookAreas } from "./areas/far-south-cook";
import { foxValleyMchenryAreas } from "./areas/fox-valley-mchenry";
import { lakeCountyAreas } from "./areas/lake-county";
import { nearWestCookAreas } from "./areas/near-west-cook";
import { nearWestCookAreas2 } from "./areas/near-west-cook-2";
import { northCookAreas } from "./areas/north-cook";
import { southCookWillAreas } from "./areas/south-cook-will";
import { westSouthwestCookAreas } from "./areas/west-southwest-cook";

export type { EventType, Faq, Location } from "./types";

const allLocations: Location[] = [
  ...chicagoLocations,
  ...chicagoNorthAreas,
  ...chicagoSouthAreas,
  ...westSuburbs,
  ...northSuburbs,
  ...northCookAreas,
  ...lakeCountyAreas,
  ...foxValleyMchenryAreas,
  ...dupageAreas,
  ...westSouthwestCookAreas,
  ...southCookWillAreas,
  ...countiesOuterAreas,
  ...nearWestCookAreas,
  ...nearWestCookAreas2,
  ...farSouthCookAreas,
];

// First entry wins if a slug is ever duplicated across files.
export const locations: Location[] = allLocations.filter(
  (l, i, all) => all.findIndex((o) => o.slug === l.slug) === i,
);

/** The county a location sits in, e.g. "Cook County" (Chicago neighborhoods are in Cook). */
export function countyOf(l: Location): string | undefined {
  if (l.kind === "county") return l.name;
  if (l.kind === "city" || l.kind === "neighborhood") return "Cook County";
  return /County$/.test(l.region) ? l.region : undefined;
}

export const counties = () => locations.filter((l) => l.kind === "county");

/** Towns and neighborhoods inside a county page's county. */
export const placesInCounty = (county: Location) =>
  locations.filter((l) => l.kind !== "county" && countyOf(l) === county.name);
export { eventTypes };

export const getLocation = (slug: string) => locations.find((l) => l.slug === slug);
export const getEventType = (slug: string) => eventTypes.find((e) => e.slug === slug);

export const locationPath = (l: Pick<Location, "slug">) => `/chair-rentals/${l.slug}`;
export const eventPath = (e: Pick<EventType, "slug">) => `/events/${e.slug}`;

// Where we're based. Used for the map and "miles from base" estimates.
export const homeBase = { name: "St. Charles", lat: 41.914, lng: -88.309 };

export function milesFrom(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * r * Math.asin(Math.sqrt(h)));
}

// Pages log: bump `updated` when a page's content changes (also mirrored in SITE_LOG.md).
export const geoContentUpdated = "2026-11-06";
