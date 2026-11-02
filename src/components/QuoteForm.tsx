"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getChair } from "@/data/chairs";
import type { CategoryId } from "@/data/catalog-products";
import type { PresetLine } from "@/data/quote-presets";
import { attributionFields } from "@/lib/attribution";
import { sortCategories, suggestedQty, type PublicItem } from "@/lib/catalog-types";
import { site } from "@/lib/site";
import { BookingCta } from "./BookingCta";
import { ChairArt } from "./ChairArt";
import { RentalIcon } from "./rentals/RentalIcon";
import { Icon, PriceTag, formatPrice } from "./ui";

export type QuoteItem = PublicItem & { categoryId?: CategoryId };

const eventTypes = [
  "Wedding (ceremony + reception)",
  "Wedding reception",
  "Wedding ceremony",
  "Indian wedding or sangeet",
  "Rehearsal dinner",
  "Engagement party",
  "Bridal or baby shower",
  "Birthday or anniversary party",
  "Graduation party",
  "Quinceañera",
  "Religious or cultural celebration",
  "Corporate event or gala",
  "Fundraiser or community event",
  "Other celebration",
];

const fmt = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

// `auto` lines follow the guest count (at `ratio` per guest, or the item's own rule) until the visitor edits them.
type Pick = { qty: number; auto: boolean; ratio?: number };

// Quote builder: pick items and quantities, see a live estimate, then send the enquiry.
// Prices shown are the customer price (vendor price + our markup), computed on the server.
// The server re-prices everything on submit, so the totals here are only for display.
export function QuoteForm({
  items,
  initialItems = [],
  initialGuests = 0,
  preset,
  from,
}: {
  items: QuoteItem[];
  initialItems?: string[];
  initialGuests?: number;
  preset?: { label: string; eventType?: string; lines: PresetLine[] };
  from?: string;
}) {
  const [guests, setGuests] = useState(initialGuests);
  const [picks, setPicks] = useState<Record<string, Pick>>(() => {
    const out: Record<string, Pick> = {};
    for (const l of preset?.lines ?? []) out[l.id] = l.qty ? { qty: l.qty, auto: false } : { qty: 1, auto: true, ratio: l.ratio };
    for (const id of initialItems) out[id] ??= { qty: 1, auto: true };
    return out;
  });
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [contact, setContact] = useState<{ name?: string; email?: string }>({});

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const categories = useMemo(() => ["All", ...sortCategories(items.map((i) => i.category))], [items]);
  const today = new Date().toLocaleDateString("en-CA");
  const beforeLaunch = date !== "" && date < site.launch.firstEventDate;

  const qtyOf = (id: string) => {
    const p = picks[id];
    const item = byId.get(id);
    if (!p || !item) return 0;
    const perGuest = p.ratio ?? item.perGuest;
    return p.auto && guests > 0 && perGuest ? suggestedQty({ perGuest, minQty: item.minQty }, guests) : p.qty;
  };

  const lines = Object.keys(picks)
    .map((id) => ({ item: byId.get(id)!, qty: qtyOf(id) }))
    .filter((l) => l.item && l.qty > 0);
  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const anyEstimated = lines.some((l) => l.item.estimated);

  const q = search.trim().toLowerCase();
  const shown = items.filter(
    (i) =>
      (category === "All" || i.category === category) &&
      (!q || `${i.name} ${i.category} ${i.description ?? ""} ${i.specs ?? ""}`.toLowerCase().includes(q)),
  );

  function add(item: QuoteItem) {
    setPicks((p) => ({ ...p, [item.id]: { qty: Math.max(1, item.minQty ?? 1), auto: !!item.perGuest } }));
  }
  function setQty(id: string, qty: number) {
    setPicks((p) => {
      const next = { ...p };
      if (!Number.isFinite(qty) || qty <= 0) delete next[id];
      else next[id] = { qty: Math.min(10_000, Math.floor(qty)), auto: false };
      return next;
    });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) {
      setError("Add at least one item to your list.");
      setStatus("error");
      document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...attributionFields(),
        ...data,
        items: lines.map((l) => ({ id: l.item.id, qty: l.qty })),
        kind: "quote",
        source: from ? `quote-builder:${from}` : "quote-builder",
      }),
    }).catch(() => null);
    if (res?.ok) {
      setContact({ name: String(data.name ?? ""), email: String(data.email ?? "") });
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="card px-6 py-16 text-center sm:px-14">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-soft text-gold">
          <Icon name="check" size={28} />
        </span>
        <h2 className="display-2 mt-6">Your quote is in</h2>
        <p className="lede mx-auto mt-6 max-w-xl">
          We saved your estimate of <strong className="text-ink">{formatPrice(subtotal)}</strong> for {lines.length}{" "}
          {lines.length === 1 ? "item" : "items"}. We&apos;ll check availability for your date with our rental partners
          and email a confirmed proposal, usually within one business day. Nothing is charged or held until you confirm.
        </p>
        <BookingCta
          {...contact}
          content="quote-thank-you"
          note="Want to talk it through sooner? Pick a time and we'll walk your layout, quantities and delivery together."
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/rentals" className="btn-ghost">Keep browsing rentals</Link>
          <Link href="/blog" className="btn-ghost">Planning guides</Link>
        </div>
      </div>
    );
  }

  const step = (n: number, title: string, hint?: string) => (
    <legend className="mb-6">
      <span className="text-xs font-semibold tracking-wide text-gold uppercase">Step {n}</span>
      <span className="display-3 mt-1 block">{title}</span>
      {hint && <span className="hint block">{hint}</span>}
    </legend>
  );

  const visual = (item: QuoteItem) => {
    if (item.image)
      return (
        <Image
          src={item.image}
          alt={item.imageAlt ?? `${item.name} rental`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20vw"
          className="object-cover"
        />
      );
    const chair = item.chairSlug ? getChair(item.chairSlug) : undefined;
    if (chair) return <ChairArt chair={chair} className="absolute inset-0" />;
    return (
      <div className="grid h-full place-items-center text-gold/80">
        {item.categoryId ? <RentalIcon category={item.categoryId} className="h-1/2 w-1/2" /> : <Icon name="spark" size={48} />}
      </div>
    );
  };

  const summary = (
    <div className="card p-6">
      <p className="eyebrow">Your estimate</p>
      {lines.length === 0 ? (
        <p className="hint mt-4">Add items and quantities to see a live price.</p>
      ) : (
        <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1 text-sm">
          {lines.map(({ item, qty }) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                <span className="tabular-nums">{qty.toLocaleString()} ×</span> {item.name}
                <span className="block text-xs text-muted">
                  {formatPrice(item.price)} / {item.unit}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">{formatPrice(item.price * qty)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-line pt-4">
        <span className="text-sm text-muted">Estimated rental total</span>
        <span aria-live="polite">
          <PriceTag amount={subtotal} unit="" size="lg" />
        </span>
      </div>
      <p className="hint text-xs leading-5">
        {anyEstimated ? "Some prices are market estimates. " : ""}Delivery, setup, damage waiver and sales tax are quoted
        once we confirm availability for your date and venue.
      </p>
      <a href="#details" className="btn-primary mt-5 w-full justify-center">Continue to your details</a>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-16">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <fieldset id="builder" className="min-w-0 scroll-mt-24">
        {step(1, "Build your rental list", "Prices include coordination with our rental partners. Quantities update with your guest count.")}
        {preset && (
          <p className="well mb-6 flex items-start gap-3 text-sm leading-6">
            <Icon name="spark" size={18} className="mt-0.5 shrink-0 text-gold" />
            <span>
              We started your list with {preset.label}. Change any quantity, remove what you don&apos;t need or add more
              below.
            </span>
          </p>
        )}
        <div className="mb-6 grid gap-5 sm:grid-cols-[minmax(0,14rem)_1fr]">
          <div>
            <label className="label" htmlFor="guest_count">Approximate guests</label>
            <input
              id="guest_count"
              name="guest_count"
              type="number"
              min={1}
              max={5000}
              required
              className="field"
              placeholder="150"
              defaultValue={initialGuests || undefined}
              onChange={(e) => setGuests(Math.max(0, Math.min(5000, Number(e.target.value) || 0)))}
            />
          </div>
          <div>
            <label className="label" htmlFor="item_search">Search rentals</label>
            <input
              id="item_search"
              type="search"
              className="field"
              placeholder="Chiavari, 60-inch round, napkins, tent…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`${category === c ? "chip-active" : "chip hover:border-ink/30"} shrink-0 px-4 py-1.5 text-sm`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <ul className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {shown.map((item) => {
              const qty = qtyOf(item.id);
              return (
                <li key={item.id} className={`card flex flex-col overflow-hidden ${qty ? "ring-2 ring-gold" : ""}`}>
                  <div className="relative aspect-square overflow-hidden bg-surface-2">
                    {visual(item)}
                    {qty > 0 && (
                      <span className="badge absolute top-3 left-3 bg-surface/95">{qty.toLocaleString()} added</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs text-muted">{item.category}</p>
                    <h3 className="mt-0.5 leading-snug font-medium">{item.name}</h3>
                    {item.specs && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.specs}</p>}
                    <PriceTag amount={item.price} unit={item.unit} size="sm" className="mt-2" />
                    {item.estimated && <span className="text-[11px] text-muted">Estimated price</span>}
                    <div className="mt-auto pt-4">
                      {qty === 0 ? (
                        <button type="button" onClick={() => add(item)} className="btn-ghost btn-sm w-full justify-center">
                          <Icon name="plus" size={14} /> Add
                          {item.perGuest && guests ? ` ${suggestedQty(item, guests).toLocaleString()}` : ""}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Fewer ${item.name}`}
                            onClick={() => setQty(item.id, qty - 1)}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line hover:border-ink/30"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            aria-label={`Quantity of ${item.name}`}
                            value={qty}
                            onChange={(e) => setQty(item.id, Number(e.target.value))}
                            className="field h-9 min-w-0 px-1 py-0 text-center text-sm tabular-nums"
                          />
                          <button
                            type="button"
                            aria-label={`More ${item.name}`}
                            onClick={() => setQty(item.id, qty + 1)}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line hover:border-ink/30"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {shown.length === 0 && (
              <li className="col-span-full hint">Nothing matches that search yet. Tell us what you need in the notes below.</li>
            )}
          </ul>
          <aside className="hidden lg:block">
            <div className="sticky top-28">{summary}</div>
          </aside>
        </div>
        <div className="mt-8 lg:hidden">{summary}</div>
      </fieldset>

      <fieldset id="details" className="grid min-w-0 scroll-mt-24 gap-x-8 gap-y-6 sm:grid-cols-2">
        {step(2, "Your event")}
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
            <p className="hint">
              Our first deliveries begin {fmt(site.launch.firstEventDate)}. Send your list anyway; we&apos;ll tell you
              if we can help or recommend someone who can.
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="event_type">Occasion</label>
          <select id="event_type" name="event_type" required className="field" defaultValue={preset?.eventType ?? ""}>
            <option value="" disabled>Select</option>
            {eventTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input id="city" name="city" required className="field" placeholder="Chicago, Naperville, Oak Brook…" />
        </div>
        <div>
          <label className="label" htmlFor="venue">Venue, if booked</label>
          <input id="venue" name="venue" className="field" />
        </div>
      </fieldset>

      <fieldset className="grid min-w-0 gap-x-8 gap-y-6 sm:grid-cols-2">
        {step(3, "How we reach you")}
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
          <label className="mt-3 flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted">
            <input type="checkbox" name="sms_consent" value="yes" className="mt-0.5 accent-[var(--gold)]" />
            <span>Text me about my quote. Message and data rates may apply; reply STOP to opt out at any time.</span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="message">Anything else we should know</label>
          <textarea
            id="message"
            name="message"
            rows={3}
            className="field resize-none"
            placeholder="Items you didn't see, colors, indoor or outdoor, ceremony and reception in separate spaces…"
          />
        </div>
      </fieldset>

      <div className="card flex flex-wrap items-center justify-between gap-6 p-6">
        <div className="max-w-xl">
          {lines.length > 0 && (
            <div className="flex items-baseline gap-3">
              <span className="text-sm text-muted">Estimated total</span>
              <PriceTag amount={subtotal} unit="" size="md" />
            </div>
          )}
          <p className="hint">
            We confirm availability with our {site.market}-area rental partners and send a final proposal. No payment and
            no commitment until you confirm.
          </p>
          {status === "error" && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <button className="btn-primary btn-lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send my quote request"}
        </button>
      </div>
    </form>
  );
}
