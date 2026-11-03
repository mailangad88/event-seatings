import { getLocation } from "@/data/geo";
import { weatherFor } from "@/lib/weather";

// GET /api/weather?date=YYYY-MM-DD&place=<geo slug> for /tools/event-date (NWS forecast or NOAA history).
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const date = sp.get("date") ?? "";
  const place = getLocation(sp.get("place") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !place) return Response.json({ error: "Pick a date and a place." }, { status: 400 });
  const weather = await weatherFor(place.lat, place.lng, date);
  if (!weather) return Response.json({ error: "Weather data isn't available right now." }, { status: 502 });
  return Response.json(weather, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
