"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getChair } from "@/data/chairs";
import { attributionFields } from "@/lib/attribution";
import { sortCategories, suggestedQty, usd, type PublicItem } from "@/lib/catalog-types";
import { site } from "@/lib/site";
import { BookingCta } from "./BookingCta";
import { ChairArt } from "./ChairArt";

const eventTypes = [
  "Wedding (ceremony + reception)",
  "Wedding reception",
  "Wedding ceremony",
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

type Pick = { qty: number; auto: boolean };

// Quote builder: pick items and quantities, see a live estimate, then send the enquiry.
// Prices shown are the customer price (vendor price + our markup), computed on the server.
// The server re-prices everything on submit, so the totals here are only for display.
export function QuoteForm({ items, initialItems = [] }: { items: PublicItem[]; initialItems?: string[] }) {
  const [guests, setGuests] = useState(0);
  const [picks, setPicks] = useState<Record<string, Pick>>(() =>
    Object.fromEntries(initialItems.map((id) => [id, { qty: 1, auto: true }])),
  );
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

  // Items still on "auto" follow the guest count until the visitor types their own quantity.
  const qtyOf = (id: string) => {
    const p = picks[id];
    if (!p) return 0;
    const item = byId.get(id);
    return p.auto && item && guests > 0 && item.perGuest ? suggestedQty(item, guests) : p.qty;
  };

  const lines = Object.keys(picks)
    .map((id) => ({ item: byId.get(id)!, qty: qtyOf(id) }))
    .filter((l) => l.item && l.qty > 0);
  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const anyEstimated = lines.some((l) => l.item.estimated);

  const shown = items.filter(
    (i) =>
      (category === "All" || i.category === category) &&
      (!search.trim() || `${i.name} ${i.category} ${i.description ?? ""}`.toLowerCase().includes(search.trim().toLowerCase())),
  );

  function add(item: PublicItem) {
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
        source: "quote-builder",
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
      <div className="border border-line bg-surface px-6 py-16 text-center sm:px-14">
        <p className="eyebrow justify-center">Enquiry received</p>
        <h2 className="headline mt-6 text-5xl sm:text-6xl">
          Thank <em className="text-gold">you</em>.
        </h2>
        <p className="mx-auto mt-6 max-w-lg leading-8 text-muted">
          Your estimate of <strong className="text-ink">{usd(subtotal)}</strong> for {lines.length}{" "}
          {lines.length === 1 ? "item" : "items"} is saved. We&apos;ll check availability for your date with our rental
          partners and email a confirmed proposal, usually within one business day. Nothing is charged or held until you
          confirm.
        </p>
        <BookingCta
          {...contact}
          content="quote-thank-you"
          note="Want to talk it through sooner? Pick a time and we'll walk your layout, quantities and delivery together."
        />
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

  const summary = (
    <div className="border border-line bg-surface p-6">
      <p className="eyebrow">Your estimate</p>
      {lines.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">Add items and quantities to see a live price.</p>
      ) : (
        <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1 text-sm">
          {lines.map(({ item, qty }) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                <span className="tabular-nums">{qty.toLocaleString()} ×</span> {item.name}
                <span className="block text-xs text-muted">
                  {usd(item.price)} / {item.unit}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">{usd(item.price * qty)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">Estimated rental total</span>
        <span className="font-serif text-3xl tabular-nums" aria-live="polite">{usd(subtotal)}</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        {anyEstimated ? "Some prices are market estimates. " : ""}Delivery, setup, damage waiver and sales tax are quoted
        once we confirm availability for your date and venue.
      </p>
      <a href="#details" className="btn-primary mt-5 w-full text-center">Continue to details</a>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-16">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <fieldset id="builder" className="scroll-mt-24">
        {legend("I.", "Build your rental list")}
        <div className="-mt-3 mb-8 grid gap-6 sm:grid-cols-[minmax(0,14rem)_1fr]">
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
              onChange={(e) => setGuests(Math.max(0, Math.min(5000, Number(e.target.value) || 0)))}
            />
            <p className="mt-2 text-xs leading-5 text-muted">Chairs, tables and place settings fill in to match.</p>
          </div>
          <div>
            <label className="label" htmlFor="item_search">Search the collection</label>
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

        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Categories">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={`border border-line px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors ${
                category === c ? "bg-gold text-[#0a0806]" : "bg-surface hover:bg-surface-2"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((item) => {
              const qty = qtyOf(item.id);
              const chair = item.chairSlug ? getChair(item.chairSlug) : undefined;
              return (
                <li key={item.id} className={`flex flex-col border bg-surface ${qty ? "border-gold" : "border-line"}`}>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.imageAlt ?? `${item.name} rental`}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : chair ? (
                    <ChairArt chair={chair} className="aspect-[4/3]" />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-surface-2 font-serif text-2xl text-gold italic" aria-hidden>
                      {item.category}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] tracking-[0.16em] text-muted uppercase">{item.category}</p>
                    <h3 className="mt-1 font-serif text-xl leading-tight">{item.name}</h3>
                    {item.description && <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>}
                    <p className="mt-3 text-sm">
                      <span className="font-semibold tabular-nums">{usd(item.price)}</span>
                      <span className="text-muted"> / {item.unit}</span>
                      {item.estimated && <span className="text-muted"> · est.</span>}
                    </p>
                    <div className="mt-auto pt-4">
                      {qty === 0 ? (
                        <button type="button" onClick={() => add(item)} className="btn-ghost w-full">
                          Add{item.perGuest && guests ? ` ${suggestedQty(item, guests).toLocaleString()}` : ""}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Fewer ${item.name}`}
                            onClick={() => setQty(item.id, qty - 1)}
                            className="h-10 w-10 border border-line text-lg hover:bg-surface-2"
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
                            className="field h-10 w-full text-center tabular-nums"
                          />
                          <button
                            type="button"
                            aria-label={`More ${item.name}`}
                            onClick={() => setQty(item.id, qty + 1)}
                            className="h-10 w-10 border border-line text-lg hover:bg-surface-2"
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
            {shown.length === 0 && <li className="text-sm text-muted">Nothing matches that search yet. Tell us what you need in the notes below.</li>}
          </ul>
          <aside className="hidden lg:block">
            <div className="sticky top-24">{summary}</div>
          </aside>
        </div>
        <div className="mt-10 lg:hidden">{summary}</div>
      </fieldset>

      <fieldset id="details" className="grid scroll-mt-24 gap-x-10 gap-y-8 sm:grid-cols-2">
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
          <label className="label" htmlFor="city">City</label>
          <input id="city" name="city" required className="field" placeholder="Chicago, Naperville, Oak Brook…" />
        </div>
        <div>
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
          <label className="mt-3 flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted">
            <input type="checkbox" name="sms_consent" value="yes" className="mt-0.5 accent-[var(--gold)]" />
            <span>
              Text me about my quote. Message and data rates may apply; reply STOP to opt out at any time.
            </span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="message">Anything else we should know</label>
          <textarea
            id="message"
            name="message"
            rows={3}
            className="field resize-none"
            placeholder="Items you didn't see, palette, indoor or outdoor, ceremony and reception in separate spaces…"
          />
        </div>
      </fieldset>

      <div className="border-t border-line pt-10">
        <p className="max-w-2xl text-sm leading-7 text-muted">
          <span className="font-serif text-base text-gold italic">How pricing works.</span> The total above is an
          estimate from current rental rates. We confirm availability with our Chicago-area rental partners and send a
          final proposal. There&apos;s no payment and no commitment until you confirm.
        </p>
        {lines.length > 0 && (
          <p className="mt-6 text-lg">
            Estimated rental total: <strong className="tabular-nums">{usd(subtotal)}</strong>
          </p>
        )}
        {status === "error" && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button className="btn-primary mt-8 w-full sm:w-auto" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send my quote request"}
        </button>
      </div>
    </form>
  );
}
