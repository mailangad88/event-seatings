"use client";

import Link from "next/link";
import { useState } from "react";
import { chairs } from "@/data/chairs";
import { site } from "@/lib/site";

const eventTypes = [
  "Wedding (ceremony + reception)",
  "Wedding reception",
  "Wedding ceremony",
  "Rehearsal dinner",
  "Engagement party",
  "Bridal or baby shower",
  "Quinceañera",
  "Corporate event or gala",
  "Other celebration",
];

const fmt = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export function QuoteForm({ initialChairs = [] }: { initialChairs?: string[] }) {
  const [selected, setSelected] = useState<string[]>(initialChairs);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-CA");
  const beforeLaunch = date !== "" && date < site.launch.firstEventDate;

  function toggle(slug: string) {
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected.length === 0) {
      setError("Pick at least one chair you're interested in.");
      setStatus("error");
      return;
    }
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, chairs: selected, kind: "quote", source: "quote-form" }),
    }).catch(() => null);
    if (res?.ok) {
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="border border-line bg-surface px-6 py-16 text-center sm:px-14">
        <p className="eyebrow justify-center">Enquiry received</p>
        <h2 className="headline mt-6 text-5xl sm:text-6xl">
          Thank <em className="text-gold">you</em>.
        </h2>
        <p className="mx-auto mt-6 max-w-lg leading-8 text-muted">
          You&apos;re on our {site.launch.seasonLabel} list. We&apos;re finalizing the founding collection now and will
          email your personal proposal, with pricing and availability for your date, as soon as it&apos;s ready.
          Nothing is charged or held until you confirm.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/chairs" className="btn-ghost">Continue browsing</Link>
          <Link href="/blog" className="btn-ghost">Read the journal</Link>
        </div>
      </div>
    );
  }

  const legend = (n: string, title: string) => (
    <legend className="mb-8 flex items-baseline gap-4">
      <span className="font-serif text-xl text-gold italic">{n}</span>
      <span className="headline text-3xl sm:text-4xl">{title}</span>
    </legend>
  );

  return (
    <form onSubmit={submit} className="space-y-16">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <fieldset>
        {legend("I.", "The pieces you love")}
        <p className="-mt-5 mb-6 text-sm text-muted">Select as many as you wish.</p>
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {chairs.map((c) => {
            const on = selected.includes(c.slug);
            return (
              <label
                key={c.slug}
                className={`flex cursor-pointer items-center gap-3 px-4 py-4 text-sm transition-colors ${
                  on ? "bg-ink text-bg" : "bg-surface hover:bg-surface-2"
                }`}
              >
                <input type="checkbox" checked={on} onChange={() => toggle(c.slug)} className="sr-only" />
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center border text-[10px] ${on ? "border-gold bg-gold text-white" : "border-ink/40"}`}
                  aria-hidden
                >
                  {on ? "✓" : ""}
                </span>
                <span className="font-serif text-lg leading-tight">{c.name}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {legend("II.", "Your celebration")}
        <div>
          <label className="label" htmlFor="event_date">Event date</label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field"
          />
          {beforeLaunch && (
            <p className="mt-3 border-l border-gold pl-3 text-sm leading-6 text-muted">
              Our first deliveries begin {fmt(site.launch.firstEventDate)}. Do send your enquiry. We&apos;ll let you
              know if we can help, or recommend someone who can.
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="event_type">Occasion</label>
          <select id="event_type" name="event_type" required className="field" defaultValue="">
            <option value="" disabled>Select</option>
            {eventTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="guest_count">Approximate guests</label>
          <input id="guest_count" name="guest_count" type="number" min={1} max={5000} required className="field" placeholder="150" />
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input id="city" name="city" required className="field" placeholder="St. Charles, Geneva, Naperville…" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="venue">Venue, if booked</label>
          <input id="venue" name="venue" className="field" />
        </div>
      </fieldset>

      <fieldset className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {legend("III.", "How we reach you")}
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" required autoComplete="name" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone, optional</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="message">Anything else we should know</label>
          <textarea
            id="message"
            name="message"
            rows={3}
            className="field resize-none"
            placeholder="Palette, theme, ceremony and reception in separate spaces…"
          />
        </div>
      </fieldset>

      <div className="border-t border-line pt-10">
        <p className="max-w-2xl text-sm leading-7 text-muted">
          <span className="font-serif text-base text-gold italic">A note on timing.</span> We&apos;re a new company
          preparing our {site.launch.seasonLabel}. Your enquiry secures your place in line, and we&apos;ll email a
          personal proposal once our founding collection is finalized. There&apos;s no payment and no commitment until
          you confirm.
        </p>
        {status === "error" && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <button className="btn-primary mt-8 w-full sm:w-auto" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
