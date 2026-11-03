"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import { CLIMATE_SOURCE, firstFallFreeze, lastSpringFreeze, lightTimes, monthNames, monthSlugs, normalHighF } from "@/lib/chicago-climate";

type Setting = "indoor" | "outdoor" | "tent";

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};
// Minutes after local midnight for a "7:29 PM" string.
const fromClock = (s: string) => {
  const m = s.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  return ((Number(m[1]) % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + Number(m[2]);
};
const clock = (min: number) => {
  const h = Math.floor(min / 60) % 24;
  return `${h % 12 || 12}:${String(min % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export function EventWeather({ defaultDate }: { defaultDate: string }) {
  const [date, setDate] = useState(defaultDate);
  const [setting, setSetting] = useState<Setting>("outdoor");
  const [start, setStart] = useState("17:00");
  const [end, setEnd] = useState("22:00");

  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const mi = valid ? Number(date.slice(5, 7)) - 1 : 0;
  const md = date.slice(5);
  const high = normalHighF[mi];
  const light = valid ? lightTimes(date) : undefined;
  const startMin = toMin(start);
  let endMin = toMin(end);
  if (endMin <= startMin) endMin += 24 * 60; // ends after midnight
  const outdoor = setting !== "indoor";
  const frost = md <= "04-21" || md >= "10-19";

  type Rec = { icon: "light" | "heat" | "tent" | "info" | "glass"; title: string; text: string; href?: string; link?: string };
  const recs: Rec[] = [];
  if (light) {
    const darkMin = fromClock(light.dark);
    const setMin = fromClock(light.sunset);
    if (endMin > darkMin) {
      recs.push({
        icon: "light",
        title: `It's dark by ${light.dark}`,
        text: `Your event runs about ${Math.round((endMin - darkMin) / 30) / 2} hours past dark. ${outdoor ? "Plan bistro or string lights over seating, lit paths and lighting at the bar and restrooms." : "Plan uplighting or candles so the room doesn't go flat when the windows go black."}`,
        href: "/rentals/lighting",
        link: "Lighting rentals",
      });
    }
    if (outdoor && startMin < setMin && endMin > setMin - 60) {
      recs.push({ icon: "info", title: `Golden light from about ${light.goldenStart}`, text: "The hour before sunset is the softest light for photos. Schedule portraits, a toast or the ceremony exit around it." });
    }
  }
  if (outdoor && (high < 55 || frost)) {
    recs.push({
      icon: "heat",
      title: high < 55 ? `Normal high is only ${Math.round(high)}°F` : "Your date is in frost season",
      text: `${high < 55 ? "Plan a tent with sidewalls and heat, or an indoor backup." : `Chicago's median freeze dates are ${lastSpringFreeze} and ${firstFallFreeze}, so evenings can drop near freezing.`} A common rule is one patio heater per 8 to 12 seated guests.`,
      href: "/blog/patio-heaters-how-many-per-guests",
      link: "How many heaters you need",
    });
  }
  if (outdoor && high >= 78) {
    recs.push({ icon: "glass", title: `Normal high is ${Math.round(high)}°F`, text: "Plan shade for daytime guests, water stations and fans in a tent. Light-colored chairs stay cooler than dark upholstery.", href: "/blog/summer-event-heat-plan-chicago", link: "Summer heat plan" });
  }
  if (outdoor && mi >= 3 && mi <= 8) {
    recs.push({ icon: "tent", title: "Have a rain plan", text: setting === "tent" ? "Order sidewalls with the tent so they can drop if a storm rolls in, and ask about flooring if the lawn is soft." : "Pop-up thunderstorms are common in Chicago's warm months. Price a tent or confirm an indoor backup before you finalize.", href: "/blog/rain-plan-with-a-tent", link: "Rain plans with a tent" });
  }
  if (!outdoor && (mi <= 1 || mi >= 10)) {
    recs.push({ icon: "info", title: "Winter logistics", text: "Snow can shift delivery windows. Ask for floor protection at the entrance and plan a coat rack (about one rack per 40-50 coats).", href: "/blog/coat-racks-for-winter-events-chicago", link: "Coat racks for winter events" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <form className="card space-y-4 p-6" onSubmit={(e) => e.preventDefault()} aria-label="Your event details">
        <div>
          <label className="label" htmlFor="ew-date">Event date</label>
          <input id="ew-date" type="date" className="field mt-1" value={date} onChange={(e) => { setDate(e.target.value); track("weather_tool", { month: e.target.value.slice(5, 7) }); }} />
        </div>
        <div>
          <span className="label">Setting</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["outdoor", "Outdoors"],
                ["tent", "Under a tent"],
                ["indoor", "Indoors"],
              ] as const
            ).map(([id, name]) => (
              <button key={id} type="button" className={setting === id ? "chip chip-active" : "chip"} aria-pressed={setting === id} onClick={() => setSetting(id)}>{name}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="ew-start">Starts</label>
            <input id="ew-start" type="time" className="field mt-1" value={start} onChange={(e) => setStart(e.target.value || "17:00")} />
          </div>
          <div>
            <label className="label" htmlFor="ew-end">Ends</label>
            <input id="ew-end" type="time" className="field mt-1" value={end} onChange={(e) => setEnd(e.target.value || "22:00")} />
          </div>
        </div>
        <p className="hint">For downtown Chicago. Suburbs are within a minute or two.</p>
      </form>

      {valid && light ? (
        <div className="space-y-4" aria-live="polite">
          <div className="card p-6">
            <p className="eyebrow">{new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
            <DayBar sunrise={fromClock(light.sunrise)} sunset={fromClock(light.sunset)} dark={fromClock(light.dark)} start={startMin} end={endMin} />
            <dl className="mt-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              {[
                ["Normal high", `${Math.round(high)}°F`],
                ["Sunset", light.sunset],
                ["Golden light", `from ${light.goldenStart}`],
                ["Dark by", light.dark],
              ].map(([k, v]) => (
                <div key={k} className="well p-3">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-heading font-semibold text-xl">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted">
              {light.daylight} of daylight. Normal high from {CLIMATE_SOURCE}; sun times calculated. Check the forecast 10 days out.{" "}
              <Link className="link" href={`/chicago-event-seasons/${monthSlugs[mi]}`}>Planning in {monthNames[mi]}</Link>
            </p>
          </div>
          {recs.length ? (
            <ul className="space-y-3">
              {recs.map((r) => (
                <li key={r.title} className="card flex gap-4 p-5">
                  <Icon name={r.icon} size={24} className="mt-1 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-medium">{r.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{r.text}</p>
                    {r.href && <Link href={r.href} className="link mt-2 inline-block text-sm">{r.link}</Link>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="card p-5 text-muted">No weather flags for this plan. Still check the forecast the week before.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Link href="/my-events" className="btn-primary btn-sm">Save this date in My Events</Link>
            <Link href="/quote?from=event-weather" className="btn-ghost btn-sm">Price tents, heaters or lights</Link>
          </div>
        </div>
      ) : (
        <p className="card p-6 text-muted">Pick a date to see sunset, darkness and what to plan for.</p>
      )}
    </div>
  );
}

// A 6 am to 2 am strip: daylight, twilight, dark, with the event window drawn on top.
function DayBar({ sunrise, sunset, dark, start, end }: { sunrise: number; sunset: number; dark: number; start: number; end: number }) {
  const from = 6 * 60;
  const to = 26 * 60;
  const x = (m: number) => `${(Math.min(Math.max(m, from), to) - from) / (to - from) * 100}%`;
  const w = (a: number, b: number) => `${(Math.min(Math.max(b, from), to) - Math.min(Math.max(a, from), to)) / (to - from) * 100}%`;
  return (
    <figure className="mt-4">
      <div className="relative h-10 overflow-hidden rounded-full bg-espresso" role="img" aria-label={`Daylight until ${clock(sunset)}, twilight until ${clock(dark)}, your event from ${clock(start)} to ${clock(end % 1440)}`}>
        <div className="absolute inset-y-0 bg-gold-soft" style={{ left: x(sunrise), width: w(sunrise, sunset) }} />
        <div className="absolute inset-y-0 bg-gold-bright" style={{ left: x(sunset), width: w(sunset, dark) }} />
        <div className="absolute inset-y-1 rounded-full border-2 border-gold bg-gold/25" style={{ left: x(start), width: w(start, end) }} />
      </div>
      <figcaption className="mt-2 flex justify-between text-xs text-muted">
        <span>6 AM</span><span>Noon</span><span>6 PM</span><span>Midnight</span><span>2 AM</span>
      </figcaption>
      <p className="mt-1 flex flex-wrap gap-4 text-xs text-muted">
        <span><span className="mr-1 inline-block h-2 w-3 rounded bg-gold-soft align-middle" />Daylight</span>
        <span><span className="mr-1 inline-block h-2 w-3 rounded bg-gold-bright align-middle" />Twilight</span>
        <span><span className="mr-1 inline-block h-2 w-3 rounded border border-gold bg-gold/25 align-middle" />Your event</span>
      </p>
    </figure>
  );
}
