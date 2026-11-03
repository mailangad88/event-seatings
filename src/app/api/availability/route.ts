import { chicagoToday, listBlockedDates } from "@/lib/availability";

export const dynamic = "force-dynamic";

// Public list of dates we can't take (no reasons), for the planner and quote form date pickers.
export async function GET() {
  const dates = (await listBlockedDates(chicagoToday())).map((d) => d.date);
  return Response.json({ blocked: dates }, { headers: { "cache-control": "public, max-age=60, s-maxage=60" } });
}
