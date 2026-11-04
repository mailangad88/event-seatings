import { getLocation } from "@/data/geo";
import { limitRequest } from "@/lib/rate-limit";
import { weatherFor } from "@/lib/weather";

// A real calendar day (the regex alone lets 2026-02-31 through).
const realDate = (d: string) => {
  const t = new Date(`${d}T00:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
};

// GET /api/weather?date=YYYY-MM-DD&place=<geo slug> for /tools/event-date (NWS forecast or NOAA history).
export async function GET(request: Request) {
  const blocked = await limitRequest(request, "weather", { limit: 30, windowMs: 60_000 });
  if (blocked) return blocked;
  const sp = new URL(request.url).searchParams;
  const date = sp.get("date") ?? "";
  const place = getLocation(sp.get("place") ?? "");
  if (!realDate(date) || !place) return Response.json({ error: "Pick a date and a place." }, { status: 400 });
  const weather = await weatherFor(place.lat, place.lng, date);
  if (!weather) return Response.json({ error: "Weather data isn't available right now." }, { status: 502 });
  return Response.json(weather, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
