"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { site } from "@/lib/site";

// Free lead magnet: a seating calculator that shows chair and table counts
// instantly, then unlocks a personalized, printable planning checklist in
// exchange for an email. Leads are saved as kind "waitlist", source "seating-planner".

// Optional: set NEXT_PUBLIC_BOOKING_URL (Calendly, Cal.com, etc.) to send people
// straight to a call. Without it, the button opens the quote form.
const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

const eventTypes = [
  "Wedding",
  "Corporate event or gala",
  "Birthday or anniversary party",
  "Quinceañera or sweet 16",
  "Shower or engagement party",
  "Graduation party",
  "Religious or cultural celebration",
  "Other event",
];

type Ceremony = "none" | "flip" | "separate";
type Setting = "indoor" | "tent" | "outdoor";
type Table = "round8" | "round10" | "long";

const seasonOf = (date: string) => {
  if (!date) return null;
  const m = Number(date.slice(5, 7));
  if (m === 12 || m <= 3) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "fall";
};

const daysUntil = (date: string) =>
  date ? Math.round((new Date(`${date}T12:00:00`).getTime() - Date.now()) / 86_400_000) : null;

export function SeatingPlanner() {
  const [guests, setGuests] = useState(150);
  const [vendors, setVendors] = useState(4);
  const [buffer, setBuffer] = useState(3);
  const [ceremony, setCeremony] = useState<Ceremony>("flip");
  const [cocktail, setCocktail] = useState(40);
  const [headTable, setHeadTable] = useState(2);
  const [table, setTable] = useState<Table>("round8");
  const [setting, setSetting] = useState<Setting>("indoor");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState(eventTypes[0]);

  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const plan = useMemo(() => {
    const g = Math.max(0, guests || 0);
    const guestSeats = Math.ceil((g + Math.max(0, vendors || 0)) * (1 + Math.max(0, buffer) / 100));
    const head = Math.max(0, headTable || 0);
    const reception = Math.max(0, guestSeats - head);
    const ceremonySeats = ceremony === "none" ? 0 : g;
    const cocktailSeats = Math.ceil((g * cocktail) / 100);
    const perTable = table === "round8" ? 8 : 10; // 72" rounds and 8-ft banquet tables both seat about 10
    const tables = Math.ceil(reception / perTable);
    // Chairs that must be rented: the largest moment at one time, unless spaces run at once.
    const rentals =
      ceremony === "separate" ? guestSeats + ceremonySeats + cocktailSeats : Math.max(guestSeats, ceremonySeats) + cocktailSeats;
    return { guestSeats, reception, head, ceremonySeats, cocktailSeats, tables, perTable, rentals };
  }, [guests, vendors, buffer, ceremony, cocktail, headTable, table]);

  const season = seasonOf(date);
  const days = daysUntil(date);

  const checklist = useMemo(() => {
    const items: string[] = [
      `Confirm your guest count and add ${vendors} vendor seat${vendors === 1 ? "" : "s"} and a ${buffer}% buffer (${plan.guestSeats} reception seats in total).`,
      "Ask your venue for its vendor packet: certificate of insurance wording, load-in and load-out windows, loading dock and elevator rules.",
      `Draw the floor plan: ${plan.tables} ${table === "long" ? "long banquet tables" : `${plan.perTable}-top round tables`} plus the head table, with 54 to 60 inches between table edges for chairs and service.`,
      "Measure your chair's seat width before finalizing how many fit per table. Wide or armed chairs fit fewer.",
      plan.head > 0
        ? `Pick ${plan.head === 2 ? "a statement pair" : `${plan.head} statement chairs`} for the head or sweetheart table. It's the most photographed seat in the room.`
        : "Decide whether a head table or sweetheart table deserves a statement chair.",
    ];
    if (ceremony === "flip")
      items.push("Confirm the ceremony-to-reception flip: who moves the chairs, how long it takes, and where guests wait.");
    if (ceremony === "separate")
      items.push(`Reserve a second set of ${plan.ceremonySeats} ceremony chairs so both spaces can be set before guests arrive.`);
    items.push(
      `Plan cocktail seating for about ${plan.cocktailSeats} guests, with older relatives and anyone with mobility needs seated first.`,
    );
    if (setting === "outdoor")
      items.push(
        "Choose chairs with wide feet that won't sink into grass, set them on the firmest ground, and hold a tent or indoor rain plan.",
      );
    if (setting === "tent")
      items.push("Confirm tent size against your floor plan and check flooring or ground leveling for stable chairs.");
    if (season === "winter")
      items.push("Winter in Chicago: plan for snow and salt at load-in, floor mats at the door, and padded or velvet seats.");
    if (season === "spring")
      items.push("Spring: lawns can be soft after rain. Keep a backup space and choose wipe-clean finishes.");
    if (season === "summer")
      items.push("Summer: shade ceremony seating, favor lighter finishes in full sun, and book peak Saturdays early.");
    if (season === "fall")
      items.push("Fall: expect cooler evenings and wind. Consider throws on chair backs and earlier sunset times for photos.");
    if (days !== null && days >= 0 && days < 60)
      items.push("Your date is less than two months away. Request quotes this week and ask what's still available in your count.");
    else if (days !== null && days >= 270)
      items.push("You're early, which is ideal. Shortlist styles now and hold a quote for your date.");
    items.push("Set your final count deadline about 6 to 8 weeks before the event and get the change policy in writing.");
    items.push("Compare quotes on the full total: chairs, cushions, delivery, setup, pickup, after-hours fees and damage waiver.");
    return items;
  }, [plan, vendors, buffer, table, ceremony, setting, season, days]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const summary = [
      `Seating planner: ${eventType}, ${guests} guests, ${setting}.`,
      `Reception seats ${plan.guestSeats} (head table ${plan.head}), ceremony ${ceremony} (${plan.ceremonySeats}), cocktail ${plan.cocktailSeats}.`,
      `${plan.tables} tables (${table}). Estimated chairs to rent: ${plan.rentals}.`,
    ].join(" ");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        kind: "waitlist",
        source: "seating-planner",
        event_type: eventType,
        guest_count: guests,
        event_date: date || undefined,
        message: summary,
      }),
    }).catch(() => null);
    if (res?.ok) return setStatus("done");
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  const unlocked = status === "done";
  const radio = <T extends string>(name: string, value: T, current: T, set: (v: T) => void, label: string) => (
    <label
      className={`flex cursor-pointer items-center justify-center border px-3 py-3 text-center text-sm transition-colors ${
        current === value ? "border-gold bg-gold text-[#0a0806]" : "border-line bg-surface hover:bg-surface-2"
      }`}
    >
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => set(value)} className="sr-only" />
      {label}
    </label>
  );

  const stats: [string, number, string][] = [
    ["Reception seats", plan.guestSeats, plan.head ? `incl. ${plan.head} at the head table` : "guests, vendors and buffer"],
    ["Ceremony seats", plan.ceremonySeats, ceremony === "flip" ? "reused at dinner" : ceremony === "separate" ? "a second set" : "no ceremony"],
    ["Cocktail seats", plan.cocktailSeats, `${cocktail}% of guests`],
    ["Tables", plan.tables, table === "long" ? "8-ft banquet tables" : `${plan.perTable}-top rounds`],
  ];

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
      {/* Inputs */}
      <div className="space-y-8 print:hidden">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="sp-guests">Guests</label>
            <input
              id="sp-guests"
              type="number"
              min={1}
              max={5000}
              value={guests}
              onChange={(e) => setGuests(Math.min(5000, Number(e.target.value)))}
              className="field font-serif text-3xl"
            />
          </div>
          <div>
            <label className="label" htmlFor="sp-type">Event</label>
            <select id="sp-type" value={eventType} onChange={(e) => setEventType(e.target.value)} className="field">
              {eventTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sp-date">Event date, optional</label>
            <input id="sp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="sp-vendors">Vendors who sit to eat</label>
            <input
              id="sp-vendors"
              type="number"
              min={0}
              max={50}
              value={vendors}
              onChange={(e) => setVendors(Number(e.target.value))}
              className="field"
            />
          </div>
        </div>

        <fieldset>
          <legend className="label mb-3">Ceremony</legend>
          <div className="grid grid-cols-3 gap-2">
            {radio("ceremony", "none", ceremony, setCeremony, "No ceremony")}
            {radio("ceremony", "flip", ceremony, setCeremony, "Same chairs, flipped")}
            {radio("ceremony", "separate", ceremony, setCeremony, "Separate set")}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label mb-3">Setting</legend>
          <div className="grid grid-cols-3 gap-2">
            {radio("setting", "indoor", setting, setSetting, "Indoors")}
            {radio("setting", "tent", setting, setSetting, "Tent")}
            {radio("setting", "outdoor", setting, setSetting, "Open air")}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label mb-3">Tables</legend>
          <div className="grid grid-cols-3 gap-2">
            {radio("table", "round8", table, setTable, "60\" rounds (8)")}
            {radio("table", "round10", table, setTable, "72\" rounds (10)")}
            {radio("table", "long", table, setTable, "Long banquet")}
          </div>
        </fieldset>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="sp-cocktail">Cocktail seating: {cocktail}%</label>
            <input
              id="sp-cocktail"
              type="range"
              min={0}
              max={100}
              step={5}
              value={cocktail}
              onChange={(e) => setCocktail(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--gold)]"
            />
          </div>
          <div>
            <label className="label" htmlFor="sp-buffer">Buffer: {buffer}%</label>
            <input
              id="sp-buffer"
              type="range"
              min={0}
              max={10}
              value={buffer}
              onChange={(e) => setBuffer(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--gold)]"
            />
          </div>
          <div>
            <label className="label" htmlFor="sp-head">Head table seats</label>
            <input
              id="sp-head"
              type="number"
              min={0}
              max={40}
              value={headTable}
              onChange={(e) => setHeadTable(Number(e.target.value))}
              className="field"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="border border-gold/60 bg-surface p-8 sm:p-10" aria-live="polite">
          <p className="text-[11px] tracking-[0.25em] text-gold uppercase">Your seating plan</p>
          <p className="headline mt-4 text-7xl leading-none sm:text-8xl">{plan.rentals}</p>
          <p className="mt-2 text-muted">estimated chairs to rent for {guests || 0} guests</p>

          <dl className="mt-8 grid grid-cols-2 gap-px bg-line">
            {stats.map(([k, v, hint]) => (
              <div key={k} className="bg-surface p-4">
                <dt className="text-[10px] tracking-[0.2em] text-muted uppercase">{k}</dt>
                <dd className="mt-1 font-serif text-4xl">{v}</dd>
                <dd className="text-xs text-muted">{hint}</dd>
              </div>
            ))}
          </dl>

          {/* Visual: a dot for every 10 chairs */}
          <div className="mt-8" aria-hidden>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: Math.min(60, Math.ceil(plan.rentals / 10)) }).map((_, i) => (
                <svg key={i} viewBox="0 0 26 36" className="h-5 w-4 text-gold">
                  <path d="M4 2 V34 M22 2 V34 M4 18 H22 M4 2 H22 M4 10 H22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Each icon is about 10 chairs.</p>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="headline text-3xl">Your planning checklist</h2>
            {unlocked && (
              <button type="button" onClick={() => window.print()} className="link-line text-gold print:hidden">
                Print or save as PDF
              </button>
            )}
          </div>
          <ol className="mt-6 space-y-4">
            {checklist.map((item, i) => {
              const hidden = !unlocked && i >= 3;
              return (
                <li
                  key={item}
                  className={`flex gap-4 border-b border-line pb-4 leading-7 ${hidden ? "select-none blur-[5px] print:hidden" : ""}`}
                  aria-hidden={hidden || undefined}
                >
                  <span className="font-serif text-xl text-gold italic">{String(i + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              );
            })}
          </ol>

          {!unlocked ? (
            <form onSubmit={submit} className="mt-8 border border-line bg-surface-2 p-6 sm:p-8 print:hidden">
              <p className="headline text-2xl">
                Unlock all {checklist.length} steps <em className="text-gold">free</em>
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Get the full printable checklist for your event, plus occasional Chicago seating tips. No spam,
                unsubscribe anytime.
              </p>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="sp-name">First name</label>
                  <input id="sp-name" name="name" autoComplete="given-name" className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="sp-email">Email</label>
                  <input id="sp-email" name="email" type="email" required autoComplete="email" className="field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="sp-city">City or venue, optional</label>
                  <input id="sp-city" name="city" className="field" placeholder="Naperville, Chicago, St. Charles…" />
                </div>
              </div>
              {status === "error" && <p className="mt-4 text-sm text-red-400">{error}</p>}
              <button className="btn-primary mt-8 w-full sm:w-auto" disabled={status === "sending"}>
                {status === "sending" ? "Unlocking…" : "Unlock my checklist"}
              </button>
            </form>
          ) : (
            <div className="mt-8 border border-gold/60 bg-gold-soft/40 p-6 sm:p-8 print:hidden">
              <p className="headline text-2xl">
                Your checklist is <em className="text-gold">unlocked</em>.
              </p>
              <p className="mt-2 leading-7 text-muted">
                Want a second pair of eyes on your plan? Book a free 15-minute seating call and we&apos;ll suggest
                chairs that suit your venue, season and budget. We&apos;re reserving our {site.launch.seasonLabel} now.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                {bookingUrl ? (
                  <a href={bookingUrl} target="_blank" rel="noopener" className="btn-primary">
                    Book a free seating call
                  </a>
                ) : (
                  <Link href="/book?from=seating-planner" className="btn-primary">Book a free seating call</Link>
                )}
                <button type="button" onClick={() => window.print()} className="btn-ghost">
                  Print checklist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
