import "server-only";
import { addDays, daysBetween, todayChicago } from "./event-dates";
import { log } from "@/lib/log";

// Weather for /tools/event-date from US government sources: free, keyless and public domain, so they're fine
// for a commercial site (Open-Meteo's free tier is non-commercial only).
// - Within 6 days: the National Weather Service forecast (api.weather.gov) for the exact location.
// - Otherwise: NOAA NCEI daily records from the nearest major station, for the same date ± 3 days in each of the
//   last 10 full years. This is what actually happened, not a prediction.

export type Forecast = { kind: "forecast"; high?: number; low?: number; rainChance: number; wind: number; summary: string; source: string };
export type History = {
  kind: "history";
  station: string;
  years: number;
  days: number;
  avgHigh: number;
  avgLow: number;
  wetShare: number;
  hotShare: number;
  coldShare: number;
  windyShare: number;
  maxWind: number;
};
export type Weather = Forecast | History;

// NOAA GHCN-Daily stations with long, complete records in the Chicago metro.
const stations = [
  { id: "USW00094846", name: "Chicago O'Hare Airport", lat: 41.995, lng: -87.934 },
  { id: "USW00014819", name: "Chicago Midway Airport", lat: 41.786, lng: -87.752 },
];

const ua = { "User-Agent": "BeyondChiavari-EventDateTool (beyondchiavari.com)", Accept: "application/geo+json, application/json" };

function nearest(lat: number, lng: number) {
  return [...stations].sort((a, b) => (a.lat - lat) ** 2 + (a.lng - lng) ** 2 - ((b.lat - lat) ** 2 + (b.lng - lng) ** 2))[0];
}

async function forecast(lat: number, lng: number, date: string): Promise<Forecast | null> {
  const point = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`, { headers: ua, next: { revalidate: 86400 } }).then((r) => (r.ok ? r.json() : null));
  const url = point?.properties?.forecast;
  if (!url) return null;
  const fc = await fetch(url, { headers: ua, next: { revalidate: 1800 } }).then((r) => (r.ok ? r.json() : null));
  const periods: { startTime: string; isDaytime: boolean; temperature: number; probabilityOfPrecipitation?: { value: number | null }; windSpeed: string; shortForecast: string }[] =
    fc?.properties?.periods ?? [];
  const same = periods.filter((p) => p.startTime.slice(0, 10) === date);
  if (!same.length) return null;
  const day = same.find((p) => p.isDaytime);
  const night = same.find((p) => !p.isDaytime);
  const wind = Math.max(...same.map((p) => Math.max(0, ...(p.windSpeed.match(/\d+/g) ?? ["0"]).map(Number))));
  return {
    kind: "forecast",
    high: day?.temperature,
    low: night?.temperature,
    rainChance: Math.max(0, ...same.map((p) => p.probabilityOfPrecipitation?.value ?? 0)),
    wind,
    summary: (day ?? night)!.shortForecast,
    source: "National Weather Service",
  };
}

async function history(lat: number, lng: number, date: string): Promise<History | null> {
  const st = nearest(lat, lng);
  const lastYear = Number(todayChicago().slice(0, 4)) - 1;
  const firstYear = lastYear - 9;
  const url = `https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&stations=${st.id}&startDate=${firstYear}-01-01&endDate=${lastYear}-12-31&dataTypes=TMAX,TMIN,PRCP,AWND,WSF2&units=standard&format=json`;
  const rows: Record<string, string>[] | null = await fetch(url, { next: { revalidate: 7 * 86400 } }).then((r) => (r.ok ? r.json() : null));
  if (!rows?.length) return null;
  const byDate = new Map(rows.map((r) => [r.DATE, r]));
  const num = (v?: string) => (v === undefined || v.trim() === "" ? undefined : Number(v));
  const md = date.slice(5) === "02-29" ? "02-28" : date.slice(5);
  const picked: { hi: number; lo: number; rain: number; wind?: number }[] = [];
  for (let y = firstYear; y <= lastYear; y++) {
    for (let k = -3; k <= 3; k++) {
      const r = byDate.get(addDays(`${y}-${md}`, k));
      const hi = num(r?.TMAX);
      const lo = num(r?.TMIN);
      if (hi === undefined || lo === undefined) continue;
      picked.push({ hi, lo, rain: num(r?.PRCP) ?? 0, wind: num(r?.WSF2) ?? num(r?.AWND) });
    }
  }
  if (!picked.length) return null;
  const avg = (f: (r: (typeof picked)[number]) => number) => picked.reduce((s, r) => s + f(r), 0) / picked.length;
  const share = (f: (r: (typeof picked)[number]) => boolean) => Math.round((picked.filter(f).length / picked.length) * 100);
  const winds = picked.map((r) => r.wind).filter((w): w is number => w !== undefined);
  return {
    kind: "history",
    station: st.name,
    years: 10,
    days: picked.length,
    avgHigh: Math.round(avg((r) => r.hi)),
    avgLow: Math.round(avg((r) => r.lo)),
    wetShare: share((r) => r.rain >= 0.1),
    hotShare: share((r) => r.hi >= 85),
    coldShare: share((r) => r.lo < 50),
    windyShare: winds.length ? Math.round((winds.filter((w) => w >= 20).length / winds.length) * 100) : 0,
    maxWind: winds.length ? Math.round(Math.max(...winds)) : 0,
  };
}

export async function weatherFor(lat: number, lng: number, date: string): Promise<Weather | null> {
  const days = daysBetween(todayChicago(), date);
  if (days >= 0 && days <= 6) {
    const f = await forecast(lat, lng, date).catch((err) => (log.warn("weather_forecast_failed", { date, err }), null));
    if (f) return f;
  }
  return history(lat, lng, date).catch((err) => (log.warn("weather_history_failed", { date, err }), null));
}
