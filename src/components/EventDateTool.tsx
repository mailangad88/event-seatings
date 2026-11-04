"use client";

import Link from "@/components/Link";
import { useEffect, useState } from "react";
import { getTimes } from "suncalc";
import { track } from "@/lib/analytics";
import { addDays, daysBetween, holidaysNear, icsFile, longDate, season, todayChicago } from "@/lib/event-dates";

// Event date helper (/tools/event-date): weather for the date (National Weather Service forecast within a week,
// otherwise what actually happened on that date over the last 10 years in NOAA records, via /api/weather),
// sunset and golden hour (SunCalc), nearby holidays, and an add-to-calendar file.

export type Place = { slug: string; name: string; lat: number; lng: number };

import type { Weather } from "@/lib/weather";

async function lookup(place: Place, date: string): Promise<Weather | null> {
  const res = await fetch(`/api/weather?date=${date}&place=${place.slug}`);
  return res.ok ? res.json() : null;
}

const time = (d?: Date | null) =>
  !d || isNaN(d.getTime()) ? "–" : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

export function EventDateTool({ places, initialDate, initialPlace }: { places: Place[]; initialDate?: string; initialPlace?: string }) {
  const [date, setDate] = useState(initialDate ?? "");
  const [slug, setSlug] = useState(initialPlace && places.some((p) => p.slug === initialPlace) ? initialPlace : places[0]?.slug);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const place = places.find((p) => p.slug === slug) ?? places[0];
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const today = todayChicago();
  const days = valid ? daysBetween(today, date) : null;

  // Keep the URL shareable: /tools/event-date?date=2027-06-12&place=naperville
  useEffect(() => {
    if (!valid) return;
    const url = new URL(window.location.href);
    url.searchParams.set("date", date);
    url.searchParams.set("place", place.slug);
    window.history.replaceState(null, "", url);
  }, [date, place.slug, valid]);

  useEffect(() => {
    if (!valid || days === null) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setFailed(false);
      setWeather(null);
      try {
        const w = await lookup(place, date);
        if (!cancelled) {
          setWeather(w);
          setFailed(!w);
          track("event_date_lookup", { days_out: days, place: place.slug });
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [date, days, place, valid]);

  // Noon Chicago time on the event day (UTC-5 or -6), so SunCalc picks the right day.
  const times = valid ? getTimes(new Date(`${date}T17:30:00Z`), place.lat, place.lng) : null;
  const sun = times && { sunset: times.sunset, golden: times.goldenHour, dusk: times.dusk, sunrise: times.sunrise };

  const near = valid ? holidaysNear(date) : [];
  const tips: { text: string; href: string; label: string }[] = [];
  if (weather) {
    const wet = weather.kind === "forecast" ? weather.rainChance >= 30 : weather.wetShare >= 25;
    const cold = weather.kind === "forecast" ? (weather.low ?? 99) < 55 : weather.avgLow < 55;
    const hot = weather.kind === "forecast" ? (weather.high ?? 0) >= 85 : weather.avgHigh >= 82;
    const windy = weather.kind === "forecast" ? weather.wind >= 20 : weather.windyShare >= 25;
    if (wet) tips.push({ text: "Rain is a real possibility. Hold a tent or an indoor backup for any outdoor part of the day.", href: "/rentals/tents", label: "Tents" });
    if (cold) tips.push({ text: "Evenings run cool. Budget patio heaters or tent sidewalls for guests outside after dark.", href: "/rentals/heating-cooling", label: "Heating" });
    if (hot) tips.push({ text: "Expect heat. Plan shade, fans and a water station, and seat older guests out of direct sun.", href: "/rentals/heating-cooling", label: "Cooling" });
    if (windy) tips.push({ text: "Wind can gust on this date. Weigh down linens and centerpieces, and ask about tent ballast.", href: "/rentals/tents", label: "Tents" });
  }

  function downloadIcs() {
    const ics = icsFile({ date, title: "Our event", location: `${place.name}, IL`, description: "Rentals: build one quote at https://beyondchiavari.com/quote", url: "https://beyondchiavari.com/quote" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `event-${date}.ics`;
    a.click();
    track("event_date_ics");
  }

  return (
    <div className="grid gap-6">
      <div className="card grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="grid gap-1.5">
          <span className="label">Event date</span>
          <input type="date" value={date} min={addDays(today, -3650)} onChange={(e) => setDate(e.target.value)} className="field" />
        </label>
        <label className="grid gap-1.5">
          <span className="label">Where</span>
          <select value={place.slug} onChange={(e) => setSlug(e.target.value)} className="field">
            {places.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </label>
        {valid && <button type="button" className="btn-ghost" onClick={downloadIcs}>Add to calendar</button>}
      </div>

      {!valid ? (
        <p className="text-muted">Pick a date to see the weather picture, sunset time and nearby holidays.</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-6">
              <p className="label">The date</p>
              <p className="mt-2 font-heading font-semibold text-2xl">{longDate(date)}</p>
              <p className="mt-2 text-sm text-muted">
                {days === 0 ? "Today" : days! > 0 ? `${days} days away (${Math.floor(days! / 7)} weeks)` : `${-days!} days ago`} · {season(date)} in Chicago
              </p>
            </div>
            <div className="card p-6">
              <p className="label">Sun in {place.name}</p>
              <p className="mt-2 font-heading font-semibold text-2xl">Sunset {time(sun?.sunset)}</p>
              <p className="mt-2 text-sm text-muted">
                Golden hour from {time(sun?.golden)} · dark by {time(sun?.dusk)} · sunrise {time(sun?.sunrise)}
              </p>
            </div>
            <div className="card p-6">
              <p className="label">Holidays nearby</p>
              {near.length ? (
                <ul className="mt-2 grid gap-1">
                  {near.map((h) => (
                    <li key={h.date + h.name}>
                      <span className="font-medium">{h.name}</span>{" "}
                      <span className="text-sm text-muted">
                        {h.offset === 0 ? "same day" : `${Math.abs(h.offset)} day${Math.abs(h.offset) === 1 ? "" : "s"} ${h.offset > 0 ? "after" : "before"}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-muted">None within 4 days.</p>
              )}
              {near.length > 0 && <p className="mt-2 text-xs text-muted">Holiday weekends book up early and can affect delivery windows. Confirm rentals sooner.</p>}
            </div>
          </div>

          <div className="card p-6">
            <p className="label">Weather</p>
            {loading && <p className="mt-2 text-muted">Looking up {place.name}…</p>}
            {failed && !loading && <p className="mt-2 text-muted">Weather data isn&apos;t available right now. Try again in a minute.</p>}
            {weather?.kind === "forecast" && (
              <div className="mt-3 grid gap-4 sm:grid-cols-4">
                <Stat label="High / low" value={`${weather.high ?? "–"}° / ${weather.low ?? "–"}°F`} />
                <Stat label="Chance of rain" value={`${weather.rainChance}%`} />
                <Stat label="Forecast" value={weather.summary} />
                <Stat label="Wind up to" value={`${weather.wind} mph`} />
                <p className="text-xs text-muted sm:col-span-4">Live {weather.source} forecast. Forecasts change, so check again the day before.</p>
              </div>
            )}
            {weather?.kind === "history" && (
              <div className="mt-3 grid gap-4 sm:grid-cols-4">
                <Stat label="Typical high / low" value={`${weather.avgHigh}° / ${weather.avgLow}°F`} />
                <Stat label="Days with rain" value={`${weather.wetShare}%`} note="0.1 in or more" />
                <Stat label={weather.avgHigh >= 70 ? "Days 85°F or hotter" : "Nights below 50°F"} value={`${weather.avgHigh >= 70 ? weather.hotShare : weather.coldShare}%`} />
                <Stat label="Strongest wind" value={weather.maxWind ? `${weather.maxWind} mph` : "–"} note={`${weather.windyShare}% of days 20+ mph`} />
                <p className="text-xs text-muted sm:col-span-4">
                  What actually happened at {weather.station}, the nearest long-record NOAA station to {place.name}, within 3 days of this date in each of the last {weather.years} years ({weather.days} days of records). Not a forecast; the live forecast appears a week out.
                </p>
              </div>
            )}
          </div>

          {tips.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {tips.map((t) => (
                <div key={t.text} className="well flex items-start justify-between gap-4 p-5">
                  <p className="text-sm leading-6">{t.text}</p>
                  <Link href={t.href} className="btn-ghost btn-sm shrink-0">{t.label}</Link>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link href={`/quote?from=event-date`} className="btn-primary">Price rentals for this date</Link>
            <Link href={`/tools/floor-plan`} className="btn-ghost">Draw the floor plan</Link>
          </div>
        </>
      )}
      <p className="text-xs text-muted">
        Weather from the National Weather Service and NOAA National Centers for Environmental Information (public domain). Sun times calculated with SunCalc.
      </p>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-heading font-semibold text-3xl">{value}</p>
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}
