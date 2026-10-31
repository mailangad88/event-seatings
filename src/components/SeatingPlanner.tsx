"use client";

import Image from "next/image";
import { useState } from "react";
import { chairs, getChair } from "@/data/chairs";
import renders from "@/data/renders.json";
import { getAttribution } from "@/lib/attribution";
import { chairTint } from "./studio";
import { BookCall } from "./BookCall";

type EventKind = "Wedding" | "Corporate or gala" | "Party or milestone";
type Ceremony = "flip" | "separate" | "none";

const eventKinds: EventKind[] = ["Wedding", "Corporate or gala", "Party or milestone"];
const ceremonyOptions: [Ceremony, string, string][] = [
  ["separate", "Separate space", "Ceremony and dinner in different spots"],
  ["flip", "Same room, flipped", "We reset the ceremony rows into dinner"],
  ["none", "No ceremony", "Reception only"],
];

// Chairs you'd seat a whole room on (thrones are offered as an add-on instead).
const roomChairs = chairs.filter((c) => !c.estPrice.includes("/"));
const throne = getChair("royal-throne");

function priceRange(est: string): [number, number] {
  const m = est.match(/\$(\d+)\D+(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : [0, 0];
}

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const colors = { reception: "var(--gold)", ceremony: "#94a98f", lounge: "#b5643c", statement: "#efe4cf" };

export function SeatingPlanner() {
  const [guests, setGuests] = useState(120);
  const [kind, setKind] = useState<EventKind>("Wedding");
  const [ceremony, setCeremony] = useState<Ceremony>("separate");
  const [lounge, setLounge] = useState(true);
  const [statement, setStatement] = useState(true);
  const [style, setStyle] = useState("cross-back");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const g = Math.max(1, Math.min(5000, Math.round(guests || 0)));
  const wedding = kind === "Wedding";
  const buffer = Math.max(4, Math.ceil(g * 0.03));
  const rows = {
    reception: g + buffer,
    ceremony: wedding && ceremony === "separate" ? g : 0,
    lounge: lounge ? Math.ceil(g * 0.25) : 0,
    statement: wedding && statement ? 2 : 0,
  };
  const roomTotal = rows.reception + rows.ceremony + rows.lounge;
  const chair = getChair(style) ?? roomChairs[0];
  const [lo, hi] = priceRange(chair.estPrice);
  const [tlo, thi] = rows.statement && throne ? priceRange(throne.estPrice) : [0, 0];
  const cost: [number, number] = [roomTotal * lo + tlo, roomTotal * hi + thi];

  const per = roomTotal > 400 ? 10 : 5;
  const dots = (Object.keys(rows) as (keyof typeof rows)[]).flatMap((k) =>
    Array.from({ length: k === "statement" ? (rows[k] ? 1 : 0) : Math.ceil(rows[k] / per) }, () => k),
  );

  const summary = [
    `${kind}, ${g} guests, ${chair.name}`,
    `Reception ${rows.reception} (incl. ${buffer} spare)`,
    rows.ceremony ? `Ceremony ${rows.ceremony}` : wedding && ceremony === "flip" ? "Ceremony flipped to reception" : "",
    rows.lounge ? `Lounge ${rows.lounge}` : "",
    rows.statement ? "Statement pair for the couple" : "",
    `Est. ${usd(cost[0])}–${usd(cost[1])} before delivery`,
  ]
    .filter(Boolean)
    .join(" · ");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...getAttribution(),
        ...data,
        kind: "planner",
        guest_count: g,
        event_type: kind,
        chairs: [chair.slug, ...(rows.statement && throne ? [throne.slug] : [])],
        message: summary,
        source: "seating-planner",
      }),
    }).catch(() => null);
    if (res?.ok) return setStatus("done");
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  const pill = (on: boolean) =>
    `border px-4 py-3 text-left text-sm transition-colors ${on ? "border-gold bg-gold text-[#0a0806]" : "border-line bg-surface hover:border-gold/60"}`;

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      {/* Inputs */}
      <div className="min-w-0 space-y-10">
        <fieldset className="min-w-0">
          <legend className="label">1 · How many guests?</legend>
          <div className="mt-3 flex items-center gap-5">
            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={Math.min(g, 500)}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="flex-1 accent-[var(--gold)]"
              aria-label="Guest count slider"
            />
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={5000}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="field w-24 text-center font-serif text-3xl"
              aria-label="Guest count"
            />
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="label">2 · What are you planning?</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {eventKinds.map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} className={pill(kind === k)} aria-pressed={kind === k}>
                {k}
              </button>
            ))}
          </div>
        </fieldset>

        {wedding && (
          <fieldset className="min-w-0">
            <legend className="label">3 · Where is the ceremony?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {ceremonyOptions.map(([v, t, d]) => (
                <button key={v} type="button" onClick={() => setCeremony(v)} className={pill(ceremony === v)} aria-pressed={ceremony === v}>
                  <span className="block font-medium">{t}</span>
                  <span className="block text-xs opacity-75">{d}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="min-w-0">
          <legend className="label">{wedding ? "4" : "3"} · Extras</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setLounge(!lounge)} className={pill(lounge)} aria-pressed={lounge}>
              <span className="block font-medium">Cocktail lounge</span>
              <span className="block text-xs opacity-75">Seats for about a quarter of guests</span>
            </button>
            {wedding && (
              <button type="button" onClick={() => setStatement(!statement)} className={pill(statement)} aria-pressed={statement}>
                <span className="block font-medium">Statement pair</span>
                <span className="block text-xs opacity-75">Two throne chairs for the couple</span>
              </button>
            )}
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="label">{wedding ? "5" : "4"} · Pick a chair</legend>
          <div className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
            {roomChairs.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setStyle(c.slug)}
                aria-pressed={style === c.slug}
                className={`w-24 shrink-0 snap-start text-left sm:w-auto ${style === c.slug ? "outline-2 outline-offset-2 outline-gold" : "opacity-80 hover:opacity-100"}`}
              >
                <span className="relative block aspect-[4/5] overflow-hidden" style={{ background: chairTint(c.slug) }}>
                  {renders.includes(c.slug) && (
                    <Image src={`/chairs/render/${c.slug}.jpg`} alt="" fill sizes="120px" className="object-cover" />
                  )}
                </span>
                <span className="mt-1.5 block truncate text-xs">{c.name.replace(/ Chair$/, "")}</span>
                <span className="block text-[10px] text-muted">{c.estPrice}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Result */}
      <div className="min-w-0 lg:sticky lg:top-32 lg:self-start">
        <div className="border border-gold/40 bg-surface p-6 sm:p-8" aria-live="polite">
          <p className="eyebrow">Your seating plan</p>
          <p className="headline mt-4 text-7xl leading-none">
            {roomTotal + rows.statement}
            <span className="ml-3 align-middle font-sans text-sm tracking-[0.2em] text-muted uppercase">chairs</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-1" aria-hidden>
            {dots.map((k, i) => (
              <span
                key={i}
                className={k === "statement" ? "h-3 w-5 rounded-t-full" : "h-3 w-3"}
                style={{ background: colors[k] }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Each square is about {per} chairs.</p>

          <dl className="mt-6 border-t border-line text-sm">
            {[
              ["reception", wedding ? "Reception" : "Seated", `${rows.reception}`, `${g} guests + ${buffer} spare for vendors and late RSVPs`],
              ...(wedding
                ? [
                    [
                      "ceremony",
                      "Ceremony",
                      ceremony === "separate" ? `${rows.ceremony}` : "0",
                      ceremony === "flip" ? "Flipped from the ceremony, so no second set" : ceremony === "none" ? "No ceremony seating" : "A second set so dinner is ready on time",
                    ],
                  ]
                : []),
              ...(lounge ? [["lounge", "Lounge", `${rows.lounge}`, "Soft seating for cocktail hour and late night"]] : []),
              ...(rows.statement ? [["statement", "For the couple", "2", throne?.name ?? "Statement pair"]] : []),
            ].map(([k, t, n, d]) => (
              <div key={k} className="grid grid-cols-[14px_1fr_auto] items-baseline gap-3 border-b border-line py-3">
                <span className="h-2.5 w-2.5" style={{ background: colors[k as keyof typeof colors] }} />
                <span>
                  {t}
                  <span className="block text-xs text-muted">{d}</span>
                </span>
                <span className="font-serif text-2xl">{n}</span>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex items-baseline justify-between gap-4">
            <span className="text-[11px] tracking-[0.2em] text-muted uppercase">Estimated chairs</span>
            <span className="headline text-3xl">
              {usd(cost[0])}–{usd(cost[1])}
            </span>
          </div>
          <p className="mt-1 text-right text-xs text-muted">{chair.name}, before delivery and setup</p>

          <div className="mt-8 border-t border-line pt-8">
            {status === "done" ? (
              <div className="text-center">
                <p className="headline text-3xl">
                  Plan <em className="text-gold">saved</em>.
                </p>
                <p className="mt-3 leading-7 text-muted">
                  We&apos;ll email it with exact pricing for your date. Want us to check your venue&apos;s layout? It takes 15
                  minutes.
                </p>
                <div className="mt-6">
                  <BookCall chairs={[chair.slug]} />
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <p className="font-serif text-2xl leading-snug">Email me this plan with exact pricing</p>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="plan-email">Email</label>
                    <input id="plan-email" name="email" type="email" required autoComplete="email" className="field" placeholder="you@email.com" />
                  </div>
                  <div>
                    <label className="label" htmlFor="plan-date">Event date</label>
                    <input id="plan-date" name="event_date" type="date" className="field" />
                  </div>
                </div>
                <button className="btn-primary w-full" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send my plan"}
                </button>
                {status === "error" && <p className="text-sm text-red-400">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
