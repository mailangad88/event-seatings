"use client";

import Image from "next/image";
import Link from "@/components/Link";
import { useEffect, useMemo, useState } from "react";
import { getChair } from "@/data/chairs";
import type { CategoryId } from "@/data/catalog-products";
import type { PresetLine } from "@/data/quote-presets";
import { stockPhotos, stockSrc, stockSrcSet, type StockPhotoKey } from "@/data/stock-photos";
import { attributionFields } from "@/lib/attribution";
import { blockedMessage, useBlockedDates } from "@/lib/use-blocked-dates";
import { trackLead } from "@/lib/analytics";
import { sortCategories, suggestedQty, type PublicItem } from "@/lib/catalog-types";
import { DELIVERY_MINIMUM_ORDER, allInEstimate } from "@/lib/fees";
import { site } from "@/lib/site";
import { BookingCta } from "./BookingCta";
import { ChairArt } from "./ChairArt";
import { GuestCount } from "./guests/GuestCount";
import { RentalIcon } from "./rentals/RentalIcon";
// Direct imports, not the "./ui" barrel: the barrel also holds server cards that load the full image list.
import { Icon, type IconName } from "./ui/Icon";
import { PriceDisclaimer } from "./ui/PriceDisclaimer";
import { PriceTag, formatPrice } from "./ui/PriceTag";
import { postLead } from "@/lib/lead-client";
import { trackActivity } from "@/lib/activity-client";
import { clearList, readList, writeList } from "@/lib/quote-list";
import { SaveListByEmail } from "./SaveListByEmail";

export type Swatch = { key: string; label: string; src: string; alt: string };
export type QuoteItem = PublicItem & { categoryId?: CategoryId; variants?: Swatch[]; featured?: boolean; photo?: StockPhotoKey; similar?: boolean };
export type StarterPreset = {
  id: string;
  kind: "look" | "event";
  name: string;
  label: string;
  icon?: string;
  eventType?: string;
  lines: PresetLine[];
  image?: { src: string; alt: string };
};

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

const guestPresets = [50, 100, 150, 200, 300];

const fmt = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

// `auto` lines follow the guest count (at `ratio` per guest, or the item's own rule) until the visitor edits them.
type Pick = { qty: number; auto: boolean; ratio?: number };

const fromPreset = (lines: PresetLine[]) =>
  Object.fromEntries(lines.map((l) => [l.id, l.qty ? { qty: l.qty, auto: false } : { qty: 1, auto: true, ratio: l.ratio }])) as Record<
    string,
    Pick
  >;

// The visual for an item: its 3D render, the chair illustration, or the category drawing.
export function ItemVisual({ item, sizes, variant }: { item: QuoteItem; sizes: string; variant?: string }) {
  const sw = variant ? item.variants?.find((v) => v.key === variant) : undefined;
  if (sw) return <Image src={sw.src} alt={sw.alt} fill sizes={sizes} className="object-cover" />;
  if (item.image)
    return (
      <>
        <Image src={item.image} alt={item.imageAlt ?? `${item.name} rental`} fill sizes={sizes} className="object-cover" />
        {item.similar && (
          <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-xs tracking-[0.1em] text-white uppercase">
            Similar item
          </span>
        )}
      </>
    );
  const chair = item.chairSlug ? getChair(item.chairSlug) : undefined;
  if (chair) return <ChairArt chair={chair} className="absolute inset-0" />;
  const photo = item.photo ? stockPhotos[item.photo] : undefined;
  if (photo)
    return (
      <>
        {/* Real photo of this item type from Unsplash's CDN (credited on /photo-credits). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stockSrc(photo, 320)}
          srcSet={stockSrcSet(photo, 320)}
          alt={`${photo.alt}: example photo of ${item.name} style rentals (photo by ${photo.by} on Unsplash)`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-xs tracking-[0.1em] text-white uppercase">
          Example
        </span>
      </>
    );
  return (
    <div className="grid h-full place-items-center bg-surface-2 text-gold/80">
      {item.categoryId ? <RentalIcon category={item.categoryId} className="h-1/2 w-1/2" /> : <Icon name="spark" size={40} />}
    </div>
  );
}

export function Stepper({
  name,
  qty,
  onChange,
  size = "md",
}: {
  name: string;
  qty: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div className="field-pill flex items-center gap-1 p-0.5 shadow-soft">
      <button type="button" aria-label={`Fewer ${name}`} onClick={() => onChange(qty - 1)} className={`grid ${btn} shrink-0 place-items-center rounded-full hover:bg-surface-2`}>
        <Icon name="minus" size={14} />
      </button>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        aria-label={`Quantity of ${name}`}
        value={qty}
        onChange={(e) => onChange(Number(e.target.value))}
        onFocus={(e) => e.currentTarget.select()}
        className={`${size === "sm" ? "w-10 text-xs" : "w-12 text-sm"} min-w-0 bg-transparent text-center font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
      />
      <button type="button" aria-label={`More ${name}`} onClick={() => onChange(qty + 1)} className={`grid ${btn} shrink-0 place-items-center rounded-full hover:bg-surface-2`}>
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}

// Quote builder: pick items and quantities, see a live estimate, then send the enquiry.
// Prices shown are the customer price (the vendor price; we add no markup), computed on the server.
// The server re-prices everything on submit, so the totals here are only for display.
export function QuoteForm({
  items,
  starters = [],
  initialItems = [],
  initialGuests = 0,
  initialPreset,
  from,
}: {
  items: QuoteItem[];
  starters?: StarterPreset[];
  initialItems?: string[];
  initialGuests?: number;
  initialPreset?: string;
  from?: string;
}) {
  const startPreset = starters.find((s) => s.id === initialPreset);
  const [guests, setGuests] = useState(initialGuests);
  const [picks, setPicks] = useState<Record<string, Pick>>(() => {
    const out = fromPreset(startPreset?.lines ?? []);
    for (const id of initialItems) out[id] ??= { qty: 1, auto: true };
    return out;
  });
  const [activePreset, setActivePreset] = useState(startPreset);
  // Chosen colour per item (a rendered variant key); the default render when unset.
  const [colours, setColours] = useState<Record<string, string>>({});
  const [eventType, setEventType] = useState(startPreset?.eventType ?? "");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [date, setDate] = useState("");
  const blockedDates = useBlockedDates();
  const dateBlocked = !!date && blockedDates.has(date);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [contact, setContact] = useState<{ name?: string; email?: string }>({});
  // The list saved on this device (item pages add to it). Merged in after the first render so the server
  // HTML matches; what the visitor already set on the list wins over the link's defaults.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    const saved = readList();
    const ids = Object.keys(saved.items).filter((id) => items.some((i) => i.id === id));
    if (ids.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser storage after hydration
      setPicks((p) => ({ ...p, ...Object.fromEntries(ids.map((id) => [id, saved.items[id]])) }));
      if (saved.colours) setColours((c) => ({ ...saved.colours, ...c }));
    }
    if (!initialGuests && saved.guests) setGuests(saved.guests);
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (restored && status !== "done") writeList({ items: picks, guests: guests || undefined, colours });
  }, [restored, picks, guests, colours, status]);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const categories = useMemo(() => sortCategories(items.map((i) => i.category)), [items]);
  // One picture per category tile: its first item with a render, else its drawing.
  const categoryCover = useMemo(() => {
    const out = new Map<string, QuoteItem>();
    for (const c of categories) {
      const inCat = items.filter((i) => i.category === c);
      out.set(c, inCat.find((i) => i.image) ?? inCat.find((i) => i.photo) ?? inCat[0]);
    }
    return out;
  }, [categories, items]);
  const today = new Date().toLocaleDateString("en-CA");
  const beforeLaunch = date !== "" && date < site.launch.firstEventDate;

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheet]);

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
  // Known visitors: remember the list they're building, so an unfinished quote can get a "your list is saved" email.
  const listKey = lines.map((l) => l.item.id).sort().join(",");
  useEffect(() => {
    const t = setTimeout(() => trackActivity({ t: "quote_list", items: listKey ? listKey.split(",") : [] }), 3000);
    return () => clearTimeout(t);
  }, [listKey]);
  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const pieces = lines.reduce((s, l) => s + l.qty, 0);
  const anyEstimated = lines.some((l) => l.item.estimated);
  const [withSetup, setWithSetup] = useState(true);
  // Rental rates exclude delivery, setup, waiver and tax; show the realistic delivered total.
  const allIn = allInEstimate(subtotal, { categoryIds: lines.map((l) => l.item.categoryId ?? ""), setup: withSetup });
  const addedIn = (c: string) => lines.filter((l) => l.item.category === c).length;

  // What a starter would cost at the current guest count (or 100), for the cards.
  const starterTotal = (s: StarterPreset) => {
    const g = guests || 100;
    return s.lines.reduce((sum, l) => {
      const item = byId.get(l.id);
      if (!item) return sum;
      const qty = l.qty ?? suggestedQty({ perGuest: l.ratio ?? item.perGuest, minQty: item.minQty }, g);
      return sum + item.price * qty;
    }, 0);
  };

  const q = search.trim().toLowerCase();
  const matching = items.filter(
    (i) =>
      (category === "All" || i.category === category) &&
      (!q || `${i.name} ${i.category} ${i.description ?? ""} ${i.specs ?? ""}`.toLowerCase().includes(q)),
  );
  // The full vendor inventory runs to hundreds of items; show the curated picks (and anything
  // already on the list) until the visitor searches or asks for everything.
  const collapsed = !q && !showAll && matching.some((i) => !i.featured);
  const shown = collapsed ? matching.filter((i) => i.featured !== false || (picks[i.id]?.qty ?? 0) > 0) : matching;
  const hiddenCount = matching.length - shown.length;

  function applyStarter(s: StarterPreset) {
    setPicks((p) => ({ ...p, ...fromPreset(s.lines) }));
    setActivePreset(s);
    if (s.eventType) setEventType(s.eventType);
    if (!guests) setGuests(100);
  }
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
  function toDetails() {
    setSheet(false);
    document.getElementById("details")?.scrollIntoView({ behavior: "smooth" });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) {
      setError("Add at least one item to your list.");
      setStatus("error");
      document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (dateBlocked) {
      setError(blockedMessage);
      setStatus("error");
      document.getElementById("event_date")?.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await postLead({
      ...attributionFields(),
      ...data,
      guest_count: guests || data.guest_count,
      items: lines.map((l) => ({ id: l.item.id, qty: l.qty, variant: colours[l.item.id] })),
      kind: "quote",
      source: from ? `quote-builder:${from}` : activePreset ? `quote-builder:${activePreset.kind}-${activePreset.id}` : "quote-builder",
    }).catch(() => null);
    if (res?.ok) {
      trackLead("quote", "quote-builder", { guest_count: Number(guests || data.guest_count) || undefined, item_count: lines.length });
      setContact({ name: String(data.name ?? ""), email: String(data.email ?? "") });
      clearList();
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
          We saved your estimate of about <strong className="text-ink">{formatPrice(allIn.total)}</strong> all-in ({formatPrice(subtotal)} in rentals) for {lines.length}{" "}
          {lines.length === 1 ? "item" : "items"}. We&apos;ll check availability for your date with our rental partners
          and email a confirmed proposal, usually within one business day. Nothing is charged or held until you confirm.
        </p>
        <ul className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2">
          {lines.slice(0, 12).map(({ item, qty }) => (
            <li key={item.id} className="relative h-16 w-16 overflow-hidden rounded-xl border border-line" title={`${qty} × ${item.name}`}>
              <ItemVisual item={item} sizes="64px" />
            </li>
          ))}
        </ul>
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

  const cartList = (thumb: string) => (
    <ul className="space-y-3">
      {lines.map(({ item, qty }) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className={`relative ${thumb} shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2`}>
            <ItemVisual item={item} sizes="56px" variant={colours[item.id]} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{item.name}</span>
            {colours[item.id] && (
              <span className="block text-xs text-muted capitalize">{item.variants?.find((v) => v.key === colours[item.id])?.label}</span>
            )}
            <span className="block text-xs text-muted tabular-nums">
              {formatPrice(item.price)} / {item.unit} · {formatPrice(item.price * qty)}
            </span>
          </span>
          <Stepper name={item.name} qty={qty} onChange={(n) => setQty(item.id, n)} size="sm" />
        </li>
      ))}
    </ul>
  );

  const totals = (
    <>
      <dl className="space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">
            Rentals
            <span className="block text-xs">
              {lines.length} {lines.length === 1 ? "item" : "items"} · {pieces.toLocaleString()} pieces
            </span>
          </dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {allIn.lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-3 text-muted">
            <dt>
              {l.label}
              {l.note && <span className="block text-xs">{l.note}</span>}
            </dt>
            <dd className="tabular-nums">{formatPrice(l.amount)}</dd>
          </div>
        ))}
      </dl>
      <label className="flex items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={withSetup} onChange={(e) => setWithSetup(e.target.checked)} />
        Include setup &amp; teardown
      </label>
      <div className="flex items-baseline justify-between gap-3 border-t border-line pt-4">
        <span className="text-sm text-muted">Estimated all-in</span>
        <span aria-live="polite">
          <PriceTag amount={allIn.total} unit="" size="lg" />
        </span>
      </div>
      <p className="hint text-xs leading-5">
        {anyEstimated ? "Some prices are market estimates. " : ""}
        {subtotal > 0 && subtotal < DELIVERY_MINIMUM_ORDER
          ? `Most vendors need about ${formatPrice(DELIVERY_MINIMUM_ORDER)} in rentals for delivery. `
          : ""}
        Fees are typical Chicago-area rates; your proposal confirms each one for your date and venue.
      </p>
      <PriceDisclaimer />
    </>
  );

  const looks = starters.filter((s) => s.kind === "look");
  const events = starters.filter((s) => s.kind === "event");

  return (
    <form onSubmit={submit} className="space-y-16 pb-24 lg:pb-0">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <fieldset id="builder" className="min-w-0 scroll-mt-24">
        {step(1, "Pick your rentals", "Tap a picture to add it. Quantities follow your guest count until you change them.")}

        {/* Guest count first: it drives every suggested quantity. */}
        <div className="card mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 p-4 sm:p-5">
          <label htmlFor="guest_count" className="flex items-center gap-2 font-medium">
            <Icon name="users" size={20} className="text-gold" /> How many guests?
          </label>
          <input
            id="guest_count"
            name="guest_count"
            type="number"
            min={1}
            max={5000}
            required
            className="field w-28"
            placeholder="150"
            value={guests || ""}
            onChange={(e) => setGuests(Math.max(0, Math.min(5000, Math.floor(Number(e.target.value)) || 0)))}
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick guest counts">
            {guestPresets.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGuests(g)}
                className={`${guests === g ? "chip-active" : "chip hover:border-ink/30"} px-3 py-1.5 text-sm`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {looks.length > 0 && (
          <section aria-labelledby="looks-title" className="mb-10">
            <h3 id="looks-title" className="mb-1 text-lg font-medium">Start from a look</h3>
            <p className="hint mb-4">One tap adds the chairs, tables, linens and tableware in the picture, sized for your guests.</p>
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
              {looks.map((s) => {
                const on = activePreset?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => applyStarter(s)}
                    aria-pressed={on}
                    className={`group card relative w-[78%] shrink-0 snap-start overflow-hidden text-left sm:w-auto ${on ? "ring-2 ring-gold" : "card-hover"}`}
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden bg-surface-2">
                      {s.image && (
                        <Image src={s.image.src} alt={s.image.alt} fill sizes="(max-width: 640px) 80vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                      )}
                      {on && <span className="badge absolute top-3 left-3 bg-surface/95"><Icon name="check" size={12} /> Added</span>}
                    </span>
                    <span className="flex items-end justify-between gap-3 p-4">
                      <span>
                        <span className="block font-medium">{s.name}</span>
                        <span className="text-xs text-muted">
                          {s.lines.length} items · about {formatPrice(Math.round(starterTotal(s)))} for {guests || 100} guests
                        </span>
                      </span>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${on ? "bg-green text-white" : "bg-accent text-accent-ink"}`} aria-hidden>
                        <Icon name={on ? "check" : "plus"} size={16} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {events.length > 0 && (
          <section aria-labelledby="events-title" className="mb-10">
            <h3 id="events-title" className="mb-3 text-lg font-medium">Or start from your event</h3>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
              {events.map((s) => {
                const on = activePreset?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => applyStarter(s)}
                    aria-pressed={on}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
                      on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:border-ink/30"
                    }`}
                  >
                    <Icon name={(s.icon ?? "spark") as IconName} size={16} className={on ? "" : "text-gold"} />
                    {s.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {activePreset && (
          <p className="well mb-8 flex items-start gap-3 text-sm leading-6">
            <Icon name="spark" size={18} className="mt-0.5 shrink-0 text-gold" />
            <span>
              Added {activePreset.label}. Change any quantity, remove what you don&apos;t need, or keep adding below.
            </span>
          </p>
        )}

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-lg font-medium">Browse by category</h3>
          <div className="relative w-full sm:w-72">
            <Icon name="search" size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              aria-label="Search rentals"
              className="field pl-10"
              placeholder="Search chairs, linens, tents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="-mx-4 mb-8 flex snap-x gap-3 overflow-x-auto px-4 pt-2 pb-2 sm:mx-0 sm:px-1" role="group" aria-label="Categories">
          {["All", ...categories].map((c) => {
            const cover = c === "All" ? undefined : categoryCover.get(c);
            const on = category === c;
            const n = c === "All" ? lines.length : addedIn(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCategory(c)}
                className={`relative w-24 shrink-0 snap-start text-center sm:w-28 ${on ? "" : "opacity-80 hover:opacity-100"}`}
              >
                <span className={`relative block aspect-square overflow-hidden rounded-2xl border-2 bg-surface-2 ${on ? "border-ink" : "border-transparent"}`}>
                  {cover ? (
                    <ItemVisual item={cover} sizes="112px" />
                  ) : (
                    <span className="grid h-full place-items-center text-gold"><Icon name="spark" size={32} /></span>
                  )}
                </span>
                <span className={`mt-1.5 block text-xs leading-tight ${on ? "font-semibold" : ""}`}>{c === "All" ? "Everything" : c}</span>
                {n > 0 && (
                  <span className="absolute -top-1.5 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-semibold text-accent-ink">
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
            {shown.map((item) => {
              const qty = qtyOf(item.id);
              const suggest = item.perGuest && guests ? suggestedQty(item, guests) : Math.max(1, item.minQty ?? 1);
              return (
                <li key={item.id} className={`card flex flex-col overflow-hidden transition-shadow ${qty ? "ring-2 ring-gold" : ""}`}>
                  <div className="relative aspect-square overflow-hidden">
                    {qty === 0 ? (
                      <button type="button" onClick={() => add(item)} className="group absolute inset-0" aria-label={`Add ${suggest} ${item.name}`}>
                        <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
                          <ItemVisual item={item} variant={colours[item.id]} sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 22vw" />
                        </span>
                        <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-accent py-1.5 pr-3 pl-2 text-sm font-medium text-accent-ink shadow-soft">
                          <Icon name="plus" size={16} /> {suggest > 1 ? suggest.toLocaleString() : "Add"}
                        </span>
                      </button>
                    ) : (
                      <>
                        <ItemVisual item={item} variant={colours[item.id]} sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 22vw" />
                        <span className="badge absolute top-3 left-3 bg-surface/95"><Icon name="check" size={12} /> In your list</span>
                        <div className="absolute inset-x-2 bottom-2 flex justify-center">
                          <Stepper name={item.name} qty={qty} onChange={(n) => setQty(item.id, n)} />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <h4 className="leading-snug font-medium">{item.name}</h4>
                    {item.specs && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{item.specs}</p>}
                    {item.variants && item.variants.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={`${item.name} colour`}>
                        {[{ key: "", label: "Standard", src: item.image ?? "", alt: item.imageAlt ?? item.name }, ...item.variants].map((v) => {
                          const on = (colours[item.id] ?? "") === v.key;
                          return (
                            <button
                              key={v.key || "standard"}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              title={v.label}
                              aria-label={v.label}
                              onClick={() => setColours((c) => ({ ...c, [item.id]: v.key }))}
                              className={`relative h-7 w-7 overflow-hidden rounded-full border-2 bg-surface-2 ${on ? "border-ink" : "border-line"}`}
                            >
                              {v.src && <Image src={v.src} alt={`${item.name} in ${v.label}`} fill sizes="28px" className="scale-[2.2] object-cover" />}
                            </button>
                          );
                        })}
                        {colours[item.id] && (
                          <span className="text-xs text-muted capitalize">{item.variants.find((v) => v.key === colours[item.id])?.label}</span>
                        )}
                      </div>
                    )}
                    <div className="mt-auto flex items-baseline justify-between gap-2 pt-2">
                      <PriceTag amount={item.price} unit={item.unit} size="sm" />
                      {qty > 0 && <span className="text-sm font-semibold tabular-nums">{formatPrice(item.price * qty)}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
            {shown.length === 0 && (
              <li className="col-span-full hint">Nothing matches that search yet. Tell us what you need in the notes below.</li>
            )}
            {hiddenCount > 0 && (
              <li className="col-span-full">
                <button type="button" className="btn-ghost w-full" onClick={() => setShowAll(true)}>
                  Show all {matching.length} {category === "All" ? "items" : category.toLowerCase()}
                </button>
              </li>
            )}
          </ul>

          <aside className="hidden lg:block">
            <div className="card sticky top-28 flex max-h-[calc(100vh-8rem)] flex-col p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="eyebrow">Your list</p>
                {/* Change the guest count without scrolling back up; items that follow it update at once. */}
                <GuestCount value={guests || 100} onChange={setGuests} max={5000} size="sm" />
              </div>
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                {lines.length === 0 ? (
                  <p className="hint">Tap any picture to add it. Your list and total show here.</p>
                ) : (
                  cartList("h-14 w-14")
                )}
              </div>
              <div className="mt-4">{totals}</div>
              <button type="button" onClick={toDetails} className="btn-primary mt-4 w-full justify-center" disabled={!lines.length}>
                Continue to your details
              </button>
              {lines.length > 0 && <SaveListByEmail lines={lines.map((l) => ({ id: l.item.id, qty: l.qty }))} guests={guests} />}
            </div>
          </aside>
        </div>
      </fieldset>

      {/* Phones: a sticky total bar that opens the list as a bottom sheet. */}
      {lines.length > 0 && (
        <div data-bottom-bar className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 shadow-[0_-8px_24px_rgb(0_0_0/0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <button type="button" onClick={() => setSheet(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label="View your list">
              <span className="flex -space-x-3">
                {lines.slice(0, 3).map(({ item }) => (
                  <span key={item.id} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-surface bg-surface-2">
                    <ItemVisual item={item} sizes="40px" />
                  </span>
                ))}
              </span>
              <span className="min-w-0">
                <span className="block text-base font-semibold tabular-nums">{formatPrice(allIn.total)} all-in</span>
                <span className="block text-xs text-muted underline">
                  {lines.length} {lines.length === 1 ? "item" : "items"} · view list
                </span>
              </span>
            </button>
            <button type="button" onClick={toDetails} className="btn-primary shrink-0">Continue</button>
          </div>
        </div>
      )}
      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Your rental list">
          <button type="button" aria-label="Close list" className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-surface p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-medium">Your list</p>
              <button type="button" onClick={() => setSheet(false)} className="grid h-9 w-9 place-items-center rounded-full border border-line" aria-label="Close">
                <Icon name="close" size={16} />
              </button>
            </div>
            <GuestCount value={guests || 100} onChange={setGuests} max={5000} size="sm" className="mb-4" />
            <div className="min-h-0 flex-1 overflow-y-auto">{cartList("h-14 w-14")}</div>
            <div className="mt-4">{totals}</div>
            <button type="button" onClick={toDetails} className="btn-primary mt-4 w-full justify-center">Continue to your details</button>
            <SaveListByEmail lines={lines.map((l) => ({ id: l.item.id, qty: l.qty }))} guests={guests} />
          </div>
        </div>
      )}

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
            aria-invalid={dateBlocked || undefined}
            aria-describedby={dateBlocked ? "event_date_blocked" : undefined}
          />
          {dateBlocked && (
            <p id="event_date_blocked" className="hint text-rose" role="alert">{blockedMessage}</p>
          )}
          {beforeLaunch && (
            <p className="hint">
              Our first deliveries begin {fmt(site.launch.firstEventDate)}. Send your list anyway; we&apos;ll tell you
              if we can help or recommend someone who can.
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="event_type">Occasion</label>
          <select id="event_type" name="event_type" required className="field" value={eventType} onChange={(e) => setEventType(e.target.value)}>
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
          <label className="mt-3 flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted">
            <input type="checkbox" name="email_consent" value="yes" className="mt-0.5 accent-[var(--gold)]" />
            <span>Also email me planning tips and reminders for my date. Unsubscribe in one click.</span>
          </label>
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone, optional</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" />
          <label className="mt-3 flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted">
            <input type="checkbox" name="sms_consent" value="yes" className="mt-0.5 accent-[var(--gold)]" />
            <span>Text me about my quote. Message and data rates may apply; reply STOP to opt out at any time.</span>
          </label>
          <label className="mt-2 flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted">
            <input type="checkbox" name="call_consent" value="yes" className="mt-0.5 accent-[var(--gold)]" />
            <span>It&apos;s OK to call me about this quote.</span>
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
              <span className="text-sm text-muted">Estimated all-in</span>
              <PriceTag amount={allIn.total} unit="" size="md" />
              <span className="text-xs text-muted">({formatPrice(subtotal)} rentals + delivery, setup, waiver, tax)</span>
            </div>
          )}
          <p className="hint">
            We confirm availability with established {site.market}-area rental companies and send one itemized proposal. No
            payment and no commitment until a vendor confirms and you approve.{" "}
            <Link href="/booking-promise" className="link" target="_blank">How payments work</Link>
          </p>
          {status === "error" && <p className="mt-2 text-sm text-rose">{error}</p>}
        </div>
        <button className="btn-primary btn-lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send my quote request"}
        </button>
      </div>
    </form>
  );
}
