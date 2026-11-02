import { chicagoLocations } from "./chicago";
import { eventTypes } from "./events";
import { northSuburbs } from "./north-suburbs";
import type { EventType, Location } from "./types";
import { westSuburbs } from "./west-suburbs";

export type { EventType, Faq, Location } from "./types";

export const locations: Location[] = [...chicagoLocations, ...westSuburbs, ...northSuburbs];
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
export const geoContentUpdated = "2026-10-31";
