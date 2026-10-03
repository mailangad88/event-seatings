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
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="eyebrow">Request received</p>
        <h2 className="mt-3 font-serif text-4xl">Thank you!</h2>
        <p className="mx-auto mt-4 max-w-lg text-muted">
          You&apos;re on our {site.launch.seasonLabel} list. We&apos;re finalizing our founding collection now. We&apos;ll
          email your personalized quote, with pricing and availability for your date, as soon as it&apos;s ready.
          Nothing is charged or held until you confirm.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/chairs" className="btn-ghost">Keep browsing chairs</Link>
          <Link href="/blog" className="btn-ghost">Read the journal</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-10">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <fieldset>
        <legend className="font-serif text-2xl">1. Which chairs catch your eye?</legend>
        <p className="mt-1 text-sm text-muted">Pick as many as you like.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {chairs.map((c) => {
            const on = selected.includes(c.slug);
            return (
              <label
                key={c.slug}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  on ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-ink"
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(c.slug)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                  style={{ background: c.finishes[0].hex }}
                />
                {c.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-serif text-2xl sm:col-span-2">2. Tell us about your event</legend>
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
            <p className="mt-2 text-xs leading-5 text-accent">
              Heads up: our first deliveries start {fmt(site.launch.firstEventDate)}. Send the request anyway and
              we&apos;ll let you know if we can help or point you to someone who can.
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="event_type">Event type</label>
          <select id="event_type" name="event_type" required className="field" defaultValue="">
            <option value="" disabled>Choose one</option>
            {eventTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="guest_count">Approximate guest count</label>
          <input id="guest_count" name="guest_count" type="number" min={1} max={5000} required className="field" placeholder="150" />
        </div>
        <div>
          <label className="label" htmlFor="city">Event city</label>
          <input id="city" name="city" required className="field" placeholder="St. Charles, Geneva, Naperville…" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="venue">Venue <span className="font-normal text-muted">(if booked)</span></label>
          <input id="venue" name="venue" className="field" />
        </div>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-serif text-2xl sm:col-span-2">3. How do we reach you?</legend>
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" name="name" required autoComplete="name" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone <span className="font-normal text-muted">(optional)</span></label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="message">Anything else? <span className="font-normal text-muted">(colors, theme, ceremony + reception split…)</span></label>
          <textarea id="message" name="message" rows={4} className="field" />
        </div>
      </fieldset>

      <div className="rounded-2xl border border-line bg-surface-2 p-5 text-sm text-muted">
        <strong className="text-ink">How this works:</strong> we&apos;re a new company launching our{" "}
        {site.launch.seasonLabel}. Your request puts you first in line. We&apos;ll email a personalized quote once
        our founding collection is finalized. There&apos;s no payment and no commitment until you confirm.
      </div>

      {status === "error" && <p className="text-sm text-red-700">{error}</p>}
      <button className="btn-primary w-full py-3.5 text-base sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Request my quote"}
      </button>
    </form>
  );
}
