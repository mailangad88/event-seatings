import { locations, locationPath } from "@/data/geo";
import { site } from "@/lib/site";

// Service-area KML (Google Earth / Maps format) listing every area page with its coordinates.
// Linked from the LocalBusiness `hasMap` field and useful when setting up the Google Business Profile service areas.
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const placemarks = locations
    .map(
      (l) => `    <Placemark>
      <name>${esc(l.name)}</name>
      <description>${esc(`Event rentals in ${l.name}: ${site.url}${locationPath(l)}`)}</description>
      <Point><coordinates>${l.lng},${l.lat},0</coordinates></Point>
    </Placemark>`,
    )
    .join("\n");
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${esc(site.name)} service area</name>
    <description>${esc(`${site.name} coordinates event rentals across ${site.marketLong}.`)}</description>
${placemarks}
  </Document>
</kml>
`;
  return new Response(kml, { headers: { "Content-Type": "application/vnd.google-earth.kml+xml; charset=utf-8" } });
}
