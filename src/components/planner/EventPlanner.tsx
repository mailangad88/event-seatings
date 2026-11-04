"use client";

import Image from "next/image";
import Link from "@/components/Link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { attributionFields } from "@/lib/attribution";
import { trackLead } from "@/lib/analytics";
import { bookingUrl } from "@/lib/booking";
import { sortCategories } from "@/lib/catalog-types";
import {
  assessment,
  essentialGroups,
  extras as extraOptions,
  getPlannerEvent,
  layout,
  plannerEvents,
  recommend,
  settings,
  styleName,
  styles,
  timeline,
  type ExtraId,
  type PlanInput,
  type RecLine,
  type SettingId,
  type StyleId,
} from "@/lib/event-plan";
import { blockedMessage, useBlockedDates } from "@/lib/use-blocked-dates";
import { allInEstimate } from "@/lib/fees";
import { ideaQty, type PlannerIdea } from "@/data/party-ideas/types";
import { ItemVisual, Stepper, type QuoteItem } from "../QuoteForm";
// Direct imports, not the "../ui" barrel: the barrel also holds server cards that load the full image list.
import { Icon, type IconName } from "../ui/Icon";
import { formatPrice } from "../ui/PriceTag";
import { FloorPlan } from "./FloorPlan";
import { postLead } from "@/lib/lead-client";
import { trackActivity } from "@/lib/activity-client";

// Step-by-step event planner on /quote: occasion → guests → where → package → essentials → add-ons → date & details,
// then a free personalised plan the visitor can download as a PDF. Each answer builds a recommended rental list
// (src/lib/event-plan.ts) they can adjust; sending their details puts the list in the CRM as a quote request,
// priced again on the server.

type Answers = {
  event?: string;
  guests: number;
  setting?: SettingId;
  style?: StyleId;
  extras: ExtraId[];
  extrasTouched: boolean;
  date?: string;
  month?: string; // YYYY-MM when only the month is known
  noDate?: boolean;
  ideas?: string[]; // party idea slugs picked on the Add-ons step (src/data/party-ideas)
};

const steps = ["Occasion", "Guests", "Where", "Package", "Essentials", "Add-ons", "Date & details", "Your plan"] as const;
const STORE = "bc-planner-v2";
const guestPicks = [25, 50, 75, 100, 150, 200, 300];
const IDEA_GROUP = "From your party ideas";
const groupOrder = [...essentialGroups, IDEA_GROUP, "Tent & weather", "Restrooms & power", "Bar", "Catering", "Dance & stage", "Sound & AV", "Decor & lighting", "Lounge", "Fun", "Added by you"];
const settingGroups = ["Tent & weather", "Restrooms & power"];

function Tile({
  selected,
  onClick,
  image,
  alt,
  title,
  text,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  image?: string;
  alt?: string;
  title: string;
  text?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative overflow-hidden rounded-2xl border text-left transition ${selected ? "border-gold ring-2 ring-gold" : "border-line hover:border-gold/60"} bg-surface shadow-soft`}
    >
      {image && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
          <Image src={image} alt={alt ?? ""} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
          {selected && (
            <span className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-gold text-accent-ink shadow-soft">
              <Icon name="check" size={16} />
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-heading font-semibold text-xl leading-tight">{title}</p>
          {badge && <span className="shrink-0 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium tabular-nums">{badge}</span>}
        </div>
        {text && <p className="mt-1 text-sm leading-6 text-muted">{text}</p>}
      </div>
    </button>
  );
}

/** A ready-made package, as the planner's first step shows it (built on the server in src/lib/packages.ts). */
export type PlannerPackage = { id: string; name: string; event: string; setting: SettingId; style: StyleId; guests: number; allIn: number; perGuest: number; image: string; alt: string; href: string; styleName: string; settingName: string };

type Row = { id: string; qty: number; item: QuoteItem; group: string; why?: string };

export function EventPlanner({
  items,
  initialEvent,
  from,
  ideas = [],
  initialIdea,
  initialGuests,
  initialSetting,
  initialStyle,
  packages = [],
}: {
  items: QuoteItem[];
  initialEvent?: string;
  from?: string;
  ideas?: PlannerIdea[];
  initialIdea?: string;
  initialGuests?: number;
  initialSetting?: string;
  initialStyle?: string;
  packages?: PlannerPackage[];
}) {
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const startIdea = ideas.find((i) => i.slug === initialIdea);
  const startEvent = getPlannerEvent(initialEvent ?? startIdea?.events[0]);
  // A ready-made package link (?event=&guests=&setting=&style=) skips the questions and opens the built list.
  const startSetting = settings.find((s) => s.id === initialSetting)?.id;
  const startStyle = styles.find((s) => s.id === initialStyle)?.id;
  const startGuests = initialGuests && initialGuests > 0 ? initialGuests : undefined;
  const ready = !!(startEvent && startSetting && startStyle);
  const [step, setStep] = useState(ready ? 4 : startEvent ? (startGuests ? (startSetting ? 3 : 2) : 1) : 0);
  // Opened from a package: bring the built list into view instead of leaving the page header on screen.
  useEffect(() => {
    if (ready) top.current?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [a, setA] = useState<Answers>(
    startEvent
      ? {
          guests: startGuests ?? startEvent.defaultGuests,
          extras: startEvent.extras,
          extrasTouched: false,
          event: startEvent.id,
          setting: startSetting,
          style: startStyle,
          ideas: startIdea ? [startIdea.slug] : [],
        }
      : { guests: 100, extras: [], extrasTouched: false },
  );
  // The visitor's own changes on top of our suggestions: a new quantity (0 = removed) or an item they added.
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  // Items the visitor changed to another one: our suggested item id → the item they picked instead.
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  // Items the visitor added from a list section ("Add another"), so they show in that section: item id → section.
  const [placed, setPlaced] = useState<Record<string, string>>({});
  // The open "Change" or "Add another" picker.
  const [picker, setPicker] = useState<{ mode: "swap"; row: Row } | { mode: "add"; group: string; cats: string[] } | null>(null);
  const [adding, setAdding] = useState(false);
  const [addCat, setAddCat] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [contact, setContact] = useState<{ name?: string; email?: string }>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const blocked = useBlockedDates();
  const top = useRef<HTMLDivElement>(null);

  // Progress saved on this device by an earlier visit, offered as "pick up where you left off".
  const saved = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return localStorage.getItem(STORE);
      } catch {
        return null;
      }
    },
    () => null,
  );

  useEffect(() => {
    if (!a.event) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ a, overrides, swaps, placed, step, done }));
    } catch {}
  }, [a, overrides, swaps, placed, step, done]);

  const date = a.date || (a.month ? `${a.month}-15` : undefined);
  const dateBlocked = !!a.date && blocked.has(a.date);
  const ev = getPlannerEvent(a.event);

  const recFor = (over: Partial<PlanInput> = {}, picked: string[] = a.ideas ?? [], swapped: Record<string, string> = swaps): RecLine[] => {
    if (!a.event) return [];
    const base: PlanInput = { event: a.event, guests: a.guests, style: a.style ?? "classic", setting: a.setting ?? "venue", extras: a.extras, date, ...over };
    return withSwaps(withIdeas(recommend(base), base.guests, picked).filter((l) => byId.has(l.id)), swapped);
  };
  // Put the visitor's picks in place of our suggestions, keeping the quantity, section and reason.
  // If the new pick is already on the list, the two lines merge and keep the larger quantity.
  const withSwaps = (rec: RecLine[], swapped: Record<string, string>) => {
    const out: RecLine[] = [];
    for (const l of rec) {
      const to = swapped[l.id];
      const id = to && byId.has(to) ? to : l.id;
      const have = out.find((o) => o.id === id);
      if (have) have.qty = Math.max(have.qty, l.qty);
      else out.push({ ...l, id });
    }
    return out;
  };
  // A picked party idea adds its rentals; an item already on the list keeps the larger quantity.
  const withIdeas = (rec: RecLine[], guests: number, picked: string[]) => {
    const out = rec.map((l) => ({ ...l }));
    for (const idea of ideas.filter((i) => picked.includes(i.slug))) {
      for (const l of idea.lines) {
        const qty = ideaQty(l, guests);
        const have = out.find((o) => o.id === l.id);
        if (have) have.qty = Math.max(have.qty, qty);
        else out.push({ id: l.id, qty, group: IDEA_GROUP, why: `${idea.name}: ${l.why}` });
      }
    }
    return out;
  };
  const eventIdeas = ideas.filter((i) => a.event && i.events.includes(a.event));
  const pickedIdeas = ideas.filter((i) => (a.ideas ?? []).includes(i.slug));
  const toggleIdea = (slug: string) =>
    setA((p) => ({ ...p, ideas: (p.ideas ?? []).includes(slug) ? (p.ideas ?? []).filter((s) => s !== slug) : [...(p.ideas ?? []), slug] }));
  const priceOf = (rec: { id: string; qty: number }[]) => rec.reduce((s, l) => s + (byId.get(l.id)?.price ?? 0) * l.qty, 0);
  const applyOverrides = (rec: RecLine[]) => {
    const rows: Row[] = rec.map((l) => ({ id: l.id, qty: overrides[l.id] ?? l.qty, item: byId.get(l.id)!, group: l.group, why: l.why }));
    for (const [id, qty] of Object.entries(overrides)) {
      if (!rec.some((l) => l.id === id) && byId.has(id)) rows.push({ id, qty, item: byId.get(id)!, group: placed[id] ?? "Added by you" });
    }
    return rows.filter((r) => r.qty > 0);
  };

  const input: PlanInput | undefined =
    a.event && a.style && a.setting ? { event: a.event, guests: a.guests, style: a.style, setting: a.setting, extras: a.extras, date } : undefined;
  const rows = input ? applyOverrides(recFor()) : [];
  const total = priceOf(rows);
  // Delivered, set up, waiver and tax: the number people compare against other rental quotes.
  const allIn = Math.round(allInEstimate(total, { categoryIds: rows.map((r) => r.item.categoryId ?? "") }).total);
  const essentials = rows.filter((r) => essentialGroups.includes(r.group));
  const addons = rows.filter((r) => !essentialGroups.includes(r.group));

  const go = (n: number) => {
    setStep(n);
    trackActivity({ t: "planner", step: n, occasion: a.event });
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const restore = () => {
    try {
      const v = JSON.parse(saved ?? "null");
      if (!v?.a) return;
      setA(v.a);
      setOverrides(v.overrides ?? {});
      setSwaps(v.swaps ?? {});
      setPlaced(v.placed ?? {});
      setDone(v.done ?? {});
      go(Math.min(v.step ?? 0, 6));
    } catch {}
  };
  const setQty = (id: string, q: number) => setOverrides((p) => ({ ...p, [id]: Math.max(0, Math.min(10000, Math.floor(q) || 0)) }));
  const resetList = () => {
    setOverrides({});
    setSwaps({});
    setPlaced({});
  };
  // Change one item on the list to another, keeping its quantity and section.
  const swapItem = (row: Row, to: string) => {
    if (to === row.id || !byId.has(to)) return;
    const unswapped = recFor({}, a.ideas ?? [], {});
    const orig = Object.keys(swaps).find((k) => swaps[k] === row.id) ?? row.id;
    if (unswapped.some((l) => l.id === orig)) {
      // One of our suggestions: remember the swap so it follows guest-count changes.
      setSwaps((p) => {
        const n = { ...p };
        if (to === orig) delete n[orig];
        else n[orig] = to;
        return n;
      });
      setOverrides((p) => {
        const n = { ...p };
        delete n[row.id];
        if (row.qty !== (unswapped.find((l) => l.id === orig)?.qty ?? 0)) n[to] = row.qty;
        else delete n[to];
        return n;
      });
    } else {
      // Something the visitor added: replace it in place.
      setOverrides((p) => {
        const n = { ...p };
        delete n[row.id];
        n[to] = row.qty;
        return n;
      });
      setPlaced((p) => {
        const n = { ...p };
        delete n[row.id];
        n[to] = row.group;
        return n;
      });
    }
    setPicker(null);
  };
  // Add another item to a section of the list, e.g. a second chair style under Seating.
  const addToGroup = (id: string, group: string) => {
    const it = byId.get(id)!;
    const have = rows.find((r) => r.id === id);
    if (!have) setPlaced((p) => ({ ...p, [id]: group }));
    setQty(id, Math.max(have?.qty ?? 0, it.perGuest ? Math.ceil(a.guests * it.perGuest) : Math.max(1, it.minQty ?? 1)));
    setPicker(null);
  };
  const toggleExtra = (x: ExtraId) =>
    setA((p) => ({ ...p, extrasTouched: true, extras: p.extras.includes(x) ? p.extras.filter((e) => e !== x) : [...p.extras, x] }));

  const pickEvent = (id: string) => {
    const e = getPlannerEvent(id)!;
    setA((p) => ({
      ...p,
      event: id,
      guests: p.event ? p.guests : e.defaultGuests,
      extras: p.extrasTouched ? p.extras : e.extras,
      // Keep only the party ideas that belong to the new occasion.
      ideas: (p.ideas ?? []).filter((s) => ideas.find((i) => i.slug === s)?.events.includes(id)),
    }));
    go(1);
  };

  // Start from a ready-made package: fill in every answer and open the built list.
  const pickPackage = (pk: PlannerPackage) => {
    const e = getPlannerEvent(pk.event);
    if (!e) return;
    setA((p) => ({ ...p, event: e.id, guests: pk.guests, setting: pk.setting, style: pk.style, extras: e.extras, extrasTouched: false, ideas: [] }));
    resetList();
    go(4);
  };

  const canNext = [!!a.event, a.guests > 0, !!a.setting, !!a.style, essentials.length > 0, true, false, true][step];

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (dateBlocked) {
      setError(blockedMessage);
      setStatus("error");
      return;
    }
    if (!a.date && !a.month && !a.noDate) {
      setError("Pick a date, a month, or tick “No date yet”.");
      setStatus("error");
      return;
    }
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setStatus("sending");
    setError("");
    const summary = [
      `Planner: ${ev?.name}, ${a.guests} guests, ${settings.find((s) => s.id === a.setting)?.name}, ${styleName(a.style)} package.`,
      a.extras.length ? `Add-ons: ${a.extras.map((x) => extraOptions.find((o) => o.id === x)?.name).join(", ")}.` : "",
      pickedIdeas.length ? `Party ideas: ${pickedIdeas.map((i) => i.name).join(", ")}.` : "",
      a.month && !a.date ? `Date: only the month is known (${a.month}).` : "",
      a.noDate ? "Date: not set yet." : "",
      fd.message ? `\n${fd.message}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const body = {
      ...attributionFields(),
      ...fd,
      // A quote needs a date; with no date yet the list still reaches the CRM as an engaged planner lead.
      kind: date ? "quote" : "quiz",
      event_type: ev?.eventType,
      guest_count: a.guests,
      event_date: date,
      message: summary,
      source: `planner:${a.event}-${a.style}${from ? `-${from}` : ""}`.slice(0, 100),
      items: rows.map((l) => ({ id: l.id, qty: l.qty })),
    };
    try {
      const res = await postLead(body);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
      trackLead(date ? "quote" : "quiz", "planner", { guest_count: a.guests, item_count: rows.length });
      setContact({ name: fd.name, email: fd.email });
      setStatus("idle");
      go(7);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const nextLabel = step === 5 ? "Next: date & details" : step === 4 ? "Next: add-ons" : "Next";
  const progress = Math.round((step / (steps.length - 1)) * 100);
  const listSection = (title: string, list: Row[], intro?: string) => (
    <div className="space-y-10">
      {[...new Set(list.map((l) => l.group))]
        .sort((x, y) => groupOrder.indexOf(x) - groupOrder.indexOf(y))
        .map((g) => (
          <div key={`${title}-${g}`}>
            <h3 className="eyebrow">{g}</h3>
            {intro && settingGroups.includes(g) && <p className="mt-1 text-xs text-muted">{intro}</p>}
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {list
                .filter((l) => l.group === g)
                .map((l) => (
                  <li key={l.id} className="flex gap-3 rounded-2xl border border-line bg-surface p-3 shadow-soft">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                      <ItemVisual item={l.item} sizes="96px" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="font-medium leading-snug">{l.item.name}</p>
                      {l.why && <p className="mt-0.5 text-xs leading-5 text-muted">{l.why}</p>}
                      {featuredIn(l.item.category).length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPicker({ mode: "swap", row: l })}
                          aria-label={`Change ${l.item.name} to another item`}
                          className="mt-1 self-start text-xs font-medium text-accent underline underline-offset-4"
                        >
                          Change
                        </button>
                      )}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <Stepper name={l.item.name} qty={l.qty} onChange={(q) => setQty(l.id, q)} size="sm" />
                        <span className="text-sm tabular-nums">{formatPrice(l.item.price * l.qty)}</span>
                      </div>
                    </div>
                    <button type="button" aria-label={`Remove ${l.item.name}`} onClick={() => setQty(l.id, 0)} className="self-start rounded-full p-1 text-muted hover:bg-surface-2 hover:text-ink">
                      <Icon name="close" size={14} />
                    </button>
                  </li>
                ))}
            </ul>
            {(() => {
              const cats = [...new Set(list.filter((l) => l.group === g).map((l) => l.item.category))];
              return (
                <button
                  type="button"
                  onClick={() => setPicker({ mode: "add", group: g, cats })}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent"
                >
                  <Icon name="plus" size={14} /> {g === "Added by you" ? "Add something else" : `Add to ${g.toLowerCase()}`}
                </button>
              );
            })()}
          </div>
        ))}
    </div>
  );
  const featuredIn = (cat: string) => items.filter((i) => i.featured !== false && i.category === cat);

  return (
    <div ref={top} className={`scroll-mt-28 ${step > 0 && step < 6 ? "pb-20 sm:pb-0" : ""}`}>
      {picker && (
        <ItemPicker
          title={picker.mode === "swap" ? `Change ${picker.row.item.name.toLowerCase()}` : picker.group === "Added by you" ? "Add something else" : `Add to ${picker.group.toLowerCase()}`}
          intro={
            picker.mode === "swap"
              ? `Pick one to use instead. We'll keep your quantity of ${picker.row.qty}.`
              : "Pick one to add. You can change the quantity after."
          }
          cats={picker.mode === "swap" ? [picker.row.item.category] : picker.cats}
          items={items}
          current={picker.mode === "swap" ? picker.row : undefined}
          onList={(id) => rows.some((r) => r.id === id)}
          onPick={(id) => (picker.mode === "swap" ? swapItem(picker.row, id) : addToGroup(id, picker.group))}
          onClose={() => setPicker(null)}
        />
      )}
      {/* Progress */}
      <div className="sticky top-[6.8rem] z-20 -mx-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center justify-between gap-3 text-sm">
          <p>
            <span className="text-muted">Step {step + 1} of {steps.length}:</span> <strong>{steps[step]}</strong>
          </p>
          {input && step < 7 ? (
            <p className="text-right leading-tight tabular-nums">
              <span className="text-muted">All-in est. </span>
              <strong>{formatPrice(allIn)}</strong>
              <span className="block text-xs text-muted">{formatPrice(total)} rentals + delivery, setup, tax</span>
            </p>
          ) : null}
        </div>
        <ol className="mt-2 grid grid-cols-8 gap-1" aria-label="Planner progress">
          {steps.map((s, i) => (
            <li key={s} className={`h-1.5 rounded-full transition-colors duration-500 ${i < step ? "bg-green" : i === step ? "bg-accent" : "bg-line"}`}>
              <span className="sr-only">{`${s}${i < step ? " (done)" : i === step ? " (current)" : ""}`}</span>
            </li>
          ))}
        </ol>
        <span className="sr-only" role="status">{`${progress}% complete`}</span>
      </div>

      <div className="mt-8">
        {step === 0 && !a.event && saved?.includes('"event"') && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold-soft p-4">
            <p className="text-sm">You started planning on this device before.</p>
            <button type="button" className="btn-primary btn-sm" onClick={restore}>
              Pick up where you left off
            </button>
          </div>
        )}

        {step === 0 && (
          <section aria-labelledby="q-event">
            <h2 id="q-event" className="display-2">What are you celebrating?</h2>
            <p className="lede mt-2">Tap one. We&apos;ll suggest everything a typical one needs, and you can change any of it.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {plannerEvents.map((e) => (
                <Tile key={e.id} selected={a.event === e.id} onClick={() => pickEvent(e.id)} image={e.image} alt={e.alt} title={e.name} />
              ))}
            </div>
            {packages.length > 0 && (
              <div className="mt-10">
                <h3 className="display-3">In a hurry? Start from a ready-made package</h3>
                <p className="mt-1 text-sm text-muted">One tap builds the whole list. You can change the guest count or any item after.</p>
                <ul className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                  {packages.map((pk) => (
                    <li key={pk.id} className="w-[72%] shrink-0 snap-start sm:w-auto">
                      <button
                        type="button"
                        onClick={() => pickPackage(pk)}
                        className="flex h-full w-full gap-3 rounded-2xl border border-line bg-surface p-3 text-left shadow-soft transition hover:border-gold/60"
                      >
                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                          <Image src={pk.image} alt={pk.alt} fill sizes="64px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium leading-snug">{pk.name}</span>
                          <span className="block text-xs text-muted">{pk.guests} guests · {pk.settingName.toLowerCase()}</span>
                          <span className="mt-1 block text-sm tabular-nums">
                            <strong>{formatPrice(pk.allIn)}</strong> <span className="text-xs text-muted">all-in est.</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="q-guests" className="max-w-2xl">
            <h2 id="q-guests" className="display-2">How many guests?</h2>
            <p className="lede mt-2">A best guess is fine. Every quantity follows this number.</p>
            <div className="mt-8 flex items-end gap-3">
              <input
                type="number"
                min={1}
                max={5000}
                inputMode="numeric"
                aria-label="Number of guests"
                value={a.guests || ""}
                onChange={(e) => setA((p) => ({ ...p, guests: Math.min(5000, Math.max(0, Math.floor(Number(e.target.value)))) }))}
                className="w-40 border-b-2 border-gold bg-transparent font-heading font-semibold text-6xl tabular-nums outline-none"
              />
              <span className="pb-3 text-lg text-muted">guests</span>
            </div>
            <input
              type="range"
              min={10}
              max={400}
              step={5}
              value={Math.min(400, a.guests || 10)}
              onChange={(e) => setA((p) => ({ ...p, guests: Number(e.target.value) }))}
              className="mt-6 w-full accent-[var(--gold)]"
              aria-label="Guest count slider"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {guestPicks.map((n) => (
                <button key={n} type="button" onClick={() => setA((p) => ({ ...p, guests: n }))} className={a.guests === n ? "chip chip-active" : "chip"}>
                  {n}
                </button>
              ))}
            </div>
            {a.guests > 0 && (
              <p className="mt-6 text-sm text-muted">
                That&apos;s about {Math.ceil(a.guests / 8)} tables of eight and {Math.round(a.guests * (ev?.formal ? 12 : 10)).toLocaleString()} sq ft for seating.
              </p>
            )}
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="q-setting">
            <h2 id="q-setting" className="display-2">Where is it happening?</h2>
            <p className="lede mt-2">Outdoors we&apos;ll add cover, light, power and restrooms where you need them.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {settings.map((s) => (
                <Tile
                  key={s.id}
                  selected={a.setting === s.id}
                  onClick={() => {
                    setA((p) => ({ ...p, setting: s.id }));
                    go(3);
                  }}
                  image={s.image}
                  alt={s.alt}
                  title={s.name}
                  text={s.blurb}
                />
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="q-style">
            <h2 id="q-style" className="display-2">Pick your package</h2>
            <p className="lede mt-2">
              Prices are for your {a.guests} guests {settings.find((s) => s.id === a.setting)?.name.toLowerCase()}, so you can see
              what each level costs. You can still change any item.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {styles.map((s) => {
                const chair = byId.get(s.chair);
                const est = priceOf(recFor({ style: s.id }, a.ideas ?? [], {}));
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={a.style === s.id}
                    onClick={() => {
                      setA((p) => ({ ...p, style: s.id }));
                      resetList();
                      go(4);
                    }}
                    className={`relative overflow-hidden rounded-2xl border bg-surface text-left shadow-soft transition ${a.style === s.id ? "border-gold ring-2 ring-gold" : "border-line hover:border-gold/60"}`}
                  >
                    {s.id === "classic" && <span className="absolute top-3 left-3 z-10 rounded-full bg-gold px-3 py-1 text-xs font-medium text-accent-ink">Most popular</span>}
                    <div className="relative aspect-[16/9] bg-surface-2 md:aspect-square">{chair && <ItemVisual item={chair} sizes="(min-width: 768px) 33vw, 100vw" />}</div>
                    <div className="p-5">
                      <p className="eyebrow">{s.tagline}</p>
                      <div className="mt-1 flex items-baseline justify-between gap-2">
                        <p className="font-heading font-semibold text-3xl">{s.name}</p>
                        <span className="text-lg tabular-nums">~{formatPrice(Math.round(est))}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted">{s.blurb}</p>
                      <p className="mt-2 text-xs text-muted">About {formatPrice(a.guests ? est / a.guests : 0)} per guest in rentals</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <PackageCompare
              lists={styles.map((st) => ({ id: st.id, name: st.name, lines: recFor({ style: st.id }, a.ideas ?? [], {}) }))}
              byId={byId}
              current={a.style}
              onPick={(id) => {
                setA((p) => ({ ...p, style: id }));
                resetList();
                go(4);
              }}
            />
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="q-ess">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="q-ess" className="display-2">Your essentials</h2>
                <p className="lede mt-2">
                  Seating, tables, linens and tableware for {a.guests} guests, {styleName(a.style)} package. Adjust anything.
                </p>
              </div>
              <p className="text-right">
                <span className="text-sm text-muted">Essentials </span>
                <strong className="font-heading font-semibold text-3xl tabular-nums">{formatPrice(Math.round(priceOf(essentials)))}</strong>
              </p>
            </div>
            <div className="mt-8">{listSection("ess", essentials)}</div>
            {Object.keys(overrides).length + Object.keys(swaps).length > 0 && (
              <button type="button" className="mt-6 text-sm text-accent underline underline-offset-4" onClick={resetList}>
                Reset to our suggestions
              </button>
            )}
          </section>
        )}

        {step === 5 && (
          <section aria-labelledby="q-add">
            <h2 id="q-add" className="display-2">Add the extras</h2>
            <p className="lede mt-2">We ticked what&apos;s typical for a {ev?.name.toLowerCase()}. Tap to add or remove; prices are for your guest count.</p>
            {eventIdeas.length > 0 && (
              <div className="mt-6">
                <h3 className="eyebrow">Party ideas for your {ev?.name.toLowerCase()}</h3>
                <p className="mt-1 text-sm text-muted">
                  Pick a theme or two. We&apos;ll add its rentals below and put its setup, activities and props in your plan.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {eventIdeas.map((idea) => {
                    const picked = a.ideas ?? [];
                    const on = picked.includes(idea.slug);
                    const without = picked.filter((x) => x !== idea.slug);
                    const delta = priceOf(recFor({}, [...without, idea.slug])) - priceOf(recFor({}, without));
                    return (
                      <div key={idea.slug} className="flex flex-col">
                        <Tile
                          selected={on}
                          onClick={() => toggleIdea(idea.slug)}
                          image={idea.image}
                          alt={idea.alt}
                          title={idea.name}
                          text={idea.tagline}
                          badge={delta > 0 ? `${on ? "" : "+"}${formatPrice(delta)}` : undefined}
                        />
                        <Link href={idea.href} target="_blank" className="mt-1.5 px-1 text-xs text-accent underline">
                          See the full idea
                        </Link>
                      </div>
                    );
                  })}
                </div>
                <h3 className="eyebrow mt-8">Extras</h3>
              </div>
            )}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {extraOptions.map((o) => {
                const on = a.extras.includes(o.id);
                const delta = priceOf(recFor({ extras: [...a.extras.filter((x) => x !== o.id), o.id] })) - priceOf(recFor({ extras: a.extras.filter((x) => x !== o.id) }));
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleExtra(o.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center text-sm transition ${on ? "border-gold bg-gold-soft" : "border-line bg-surface hover:border-gold/60"}`}
                  >
                    <span className={`grid h-11 w-11 place-items-center rounded-full ${on ? "bg-gold text-accent-ink" : "bg-surface-2 text-gold"}`}>
                      <Icon name={(on ? "check" : o.icon) as IconName} size={20} />
                    </span>
                    <span className="font-medium">{o.name}</span>
                    <span className="text-xs text-muted">{o.text}</span>
                    {delta > 0 && <span className="text-xs tabular-nums">{on ? "" : "+"}{formatPrice(delta)}</span>}
                  </button>
                );
              })}
            </div>
            <div className="mt-10">
              {addons.length > 0 ? (
                listSection("add", addons, a.setting !== "venue" ? `Recommended for ${settings.find((s) => s.id === a.setting)?.name.toLowerCase()} events` : undefined)
              ) : (
                <p className="text-sm text-muted">No extras yet. Tap any above, or carry on with just the essentials.</p>
              )}
            </div>
            <div className="mt-10 rounded-2xl border border-dashed border-line p-5">
              {!adding ? (
                <button type="button" className="btn-ghost" onClick={() => setAdding(true)}>
                  <Icon name="plus" size={16} /> Add something else
                </button>
              ) : (
                <AddMore
                  items={items}
                  cat={addCat}
                  setCat={setAddCat}
                  has={(id) => rows.some((r) => r.id === id)}
                  onAdd={(id) => {
                    const it = byId.get(id)!;
                    setQty(id, Math.max(rows.find((r) => r.id === id)?.qty ?? 0, it.perGuest ? Math.ceil(a.guests * it.perGuest) : 1));
                  }}
                />
              )}
              <p className="mt-3 text-xs text-muted">
                Need something unusual? Browse the <Link href="/quote?browse=1" className="text-accent underline">full catalog of 2,500+ items</Link>, or add it to the notes in the next step.
              </p>
            </div>
          </section>
        )}

        {step === 6 && (
          <section aria-labelledby="q-date" className="grid gap-8 lg:grid-cols-[1fr_26rem]">
            <div>
              <h2 id="q-date" className="display-2">When is it, and where should we send your plan?</h2>
              <p className="lede mt-2">The date shapes your plan: Chicago weather, lead time and stock in peak season.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="p-date">Event date</label>
                  <input
                    id="p-date"
                    type="date"
                    className="field"
                    value={a.date ?? ""}
                    min={new Date().toISOString().slice(0, 10)}
                    aria-invalid={dateBlocked || undefined}
                    aria-describedby={dateBlocked ? "p-date-blocked" : undefined}
                    onChange={(e) => setA((p) => ({ ...p, date: e.target.value || undefined, month: undefined, noDate: false }))}
                  />
                  {dateBlocked && <p id="p-date-blocked" className="hint text-rose" role="alert">{blockedMessage}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="p-month">Or just the month</label>
                  <input
                    id="p-month"
                    type="month"
                    className="field"
                    value={a.month ?? ""}
                    onChange={(e) => setA((p) => ({ ...p, month: e.target.value || undefined, date: undefined, noDate: false }))}
                  />
                </div>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={!!a.noDate} onChange={(e) => setA((p) => ({ ...p, noDate: e.target.checked, date: e.target.checked ? undefined : p.date, month: e.target.checked ? undefined : p.month }))} className="accent-[var(--gold)]" />
                No date yet
              </label>
              <div className="mt-8 rounded-2xl bg-gold-soft p-5">
                <p className="font-medium">Your free plan includes</p>
                <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {[
                    ["check", "An honest assessment of your list and date"],
                    ["calendar", "A month-by-month checklist"],
                    ["ruler", "A floor plan sketch and space needed"],
                    ["quote", "A budget breakdown, as a PDF to keep"],
                  ].map(([icon, t]) => (
                    <li key={t} className="flex gap-2">
                      <Icon name={icon as IconName} size={16} className="mt-0.5 shrink-0 text-gold" />
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted">
                  Your list ({rows.length} items, {formatPrice(total)}) goes to our team as a quote request. No payment, no commitment; we reply within one business day.
                </p>
              </div>
            </div>
            <form onSubmit={send} className="space-y-3 self-start rounded-2xl border border-line bg-surface p-5 shadow-soft">
              <div>
                <label className="label" htmlFor="pl-name">Your name</label>
                <input id="pl-name" name="name" required autoComplete="name" className="field" />
              </div>
              <div>
                <label className="label" htmlFor="pl-email">Email</label>
                <input id="pl-email" name="email" type="email" required autoComplete="email" className="field" />
              </div>
              <div>
                <label className="label" htmlFor="pl-phone">Phone, optional</label>
                <input id="pl-phone" name="phone" type="tel" autoComplete="tel" className="field" />
              </div>
              <div>
                <label className="label" htmlFor="pl-city">City or venue</label>
                <input id="pl-city" name="city" autoComplete="address-level2" className="field" placeholder="Naperville, Evanston, the Ivy Room…" />
              </div>
              <div>
                <label className="label" htmlFor="pl-msg">Anything else, optional</label>
                <textarea id="pl-msg" name="message" rows={2} className="field resize-none" />
              </div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted">
                <input type="checkbox" name="email_consent" value="yes" className="mt-0.5 accent-[var(--gold)]" />
                Also email me planning tips and reminders for my date. Unsubscribe anytime.
              </label>
              {error && <p className="text-sm text-rose" role="alert">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={status === "sending" || dateBlocked}>
                {status === "sending" ? "Building your plan…" : "Get my plan and quote"}
              </button>
            </form>
          </section>
        )}

        {step === 7 && input && (
          <PlanView input={input} list={rows} total={total} name={contact.name} email={contact.email} done={done} setDone={setDone} onEdit={() => go(5)} ideas={pickedIdeas} />
        )}
      </div>

      {/* Navigation */}
      {step < 7 && (
        <div className={`mt-10 items-center justify-between gap-3 border-t border-line pt-6 ${step === 6 ? "flex" : "hidden sm:flex"}`}>
          <button type="button" className="btn-ghost" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}>
            Back
          </button>
          {step < 6 && (
            <button type="button" className="btn-primary" disabled={!canNext} onClick={() => go(step + 1)}>
              {nextLabel} <Icon name="arrow" size={16} />
            </button>
          )}
        </div>
      )}
      {/* Phones: Back, the running total and Next stay on screen, so nobody scrolls a long list to find the button. */}
      {step > 0 && step < 6 && (
        <div data-bottom-bar className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 shadow-[0_-8px_24px_rgb(0_0_0/0.08)] backdrop-blur sm:hidden">
          <div className="flex items-center gap-3">
            <button type="button" className="btn-ghost btn-sm shrink-0" onClick={() => go(step - 1)}>
              Back
            </button>
            <p className="min-w-0 flex-1 text-xs leading-tight tabular-nums">
              {input ? (
                <>
                  <strong className="text-base">{formatPrice(allIn)}</strong>
                  <span className="block text-muted">all-in est. · {rows.length} items</span>
                </>
              ) : (
                <span className="text-muted">Step {step + 1} of {steps.length}</span>
              )}
            </p>
            <button type="button" className="btn-primary btn-sm shrink-0" disabled={!canNext} onClick={() => go(step + 1)}>
              {nextLabel} <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>
      )}
      {step === 0 && (
        <p className="mt-4 text-sm text-muted">
          Know exactly what you need? <Link href="/quote?browse=1" className="text-accent underline">Browse the full catalog instead</Link>, or{" "}
          <Link href="/book?from=planner" className="text-accent underline">book a free 15-minute call</Link>.
        </p>
      )}
    </div>
  );
}

// Side by side: what each package puts on the table, row by row, so the difference is easy to see.
function PackageCompare({
  lists,
  byId,
  current,
  onPick,
}: {
  lists: { id: StyleId; name: string; lines: RecLine[] }[];
  byId: Map<string, QuoteItem>;
  current?: StyleId;
  onPick: (id: StyleId) => void;
}) {
  const rowsFor = (g: string) => lists.map((l) => l.lines.filter((x) => x.group === g));
  const groups = essentialGroups.filter((g) => lists.some((l) => l.lines.some((x) => x.group === g)));
  const extraGroups = [...new Set(lists.flatMap((l) => l.lines.map((x) => x.group)))].filter((g) => !essentialGroups.includes(g));
  const priceOf = (lines: RecLine[]) => lines.reduce((s, l) => s + (byId.get(l.id)?.price ?? 0) * l.qty, 0);
  const cell = (lines: RecLine[]) =>
    lines.length ? (
      <ul className="space-y-1">
        {lines.map((l) => (
          <li key={l.id}>
            <span className="tabular-nums text-muted">{l.qty.toLocaleString()}</span> {byId.get(l.id)?.name}
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-muted">None</span>
    );
  return (
    <details className="mt-8 rounded-2xl border border-line bg-surface p-4 sm:p-5" open>
      <summary className="cursor-pointer font-medium">Compare what&apos;s in each package</summary>
      <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[36rem] border-collapse text-left text-xs leading-5 sm:text-sm">
          <thead>
            <tr>
              <th scope="col" className="w-28 border-b border-line py-2 pr-3 font-medium text-muted">
                <span className="sr-only">Section</span>
              </th>
              {lists.map((l) => (
                <th key={l.id} scope="col" className={`border-b border-line px-3 py-2 align-bottom ${current === l.id ? "bg-gold-soft" : ""}`}>
                  <span className="font-heading font-semibold text-lg">{l.name}</span>
                  <span className="block text-xs font-normal text-muted tabular-nums">~{formatPrice(Math.round(priceOf(l.lines)))} in rentals</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...groups, ...extraGroups].map((g) => (
              <tr key={g} className="align-top">
                <th scope="row" className="border-b border-line py-2 pr-3 font-medium">{g}</th>
                {rowsFor(g).map((lines, i) => (
                  <td key={lists[i].id} className={`border-b border-line px-3 py-2 ${current === lists[i].id ? "bg-gold-soft" : ""}`}>
                    {cell(lines)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td />
              {lists.map((l) => (
                <td key={l.id} className={`px-3 pt-3 ${current === l.id ? "bg-gold-soft" : ""}`}>
                  <button type="button" className={current === l.id ? "btn-primary btn-sm" : "btn-ghost btn-sm"} onClick={() => onPick(l.id)}>
                    {current === l.id ? `Keep ${l.name}` : `Pick ${l.name}`}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}

// "Change" and "Add another" picker: items from the same category with their photo and price.
function ItemPicker({
  title,
  intro,
  cats,
  items,
  current,
  onList,
  onPick,
  onClose,
}: {
  title: string;
  intro: string;
  cats: string[];
  items: QuoteItem[];
  current?: Row;
  onList: (id: string) => boolean;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [cat, setCat] = useState(cats[0]);
  const shown = items.filter((i) => i.featured !== false && i.category === cat);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="picker-title">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-4xl flex-col rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="picker-title" className="font-heading font-semibold text-2xl leading-tight">{title}</h2>
            <p className="mt-1 text-sm text-muted">{intro}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line" aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>
        {cats.length > 1 && (
          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
            {cats.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} className={`${c === cat ? "chip chip-active" : "chip"} shrink-0`}>
                {c}
              </button>
            ))}
          </div>
        )}
        <ul className="mt-4 grid min-h-0 grid-cols-2 gap-3 overflow-y-auto pb-1 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((i) => {
            const isCurrent = current?.id === i.id;
            const taken = !isCurrent && onList(i.id);
            const diff = current ? (i.price - current.item.price) * current.qty : 0;
            return (
              <li key={i.id}>
                <button
                  type="button"
                  disabled={isCurrent || taken}
                  onClick={() => onPick(i.id)}
                  className={`group flex h-full w-full flex-col overflow-hidden rounded-xl border text-left transition ${isCurrent ? "border-gold ring-2 ring-gold" : "border-line hover:border-gold/60"} bg-surface disabled:cursor-default`}
                >
                  <div className="relative aspect-square w-full bg-surface-2">
                    <ItemVisual item={i} sizes="(min-width: 1024px) 220px, 45vw" />
                    {(isCurrent || taken) && (
                      <span className="absolute top-2 right-2 rounded-full bg-gold px-2 py-0.5 text-xs font-medium text-accent-ink">
                        {isCurrent ? "Your pick" : "On your list"}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 text-xs">
                    <p className="text-sm font-medium leading-snug">{i.name}</p>
                    <p className="mt-0.5 text-muted tabular-nums">
                      {formatPrice(i.price)} {i.unit !== "each" ? i.unit : "each"}
                    </p>
                    {current && !isCurrent && (
                      <p className="mt-1 font-medium tabular-nums">
                        {formatPrice(i.price * current.qty)} for {current.qty}
                        <span className={diff > 0 ? "text-muted" : "text-accent"}>
                          {" "}({diff >= 0 ? "+" : "−"}{formatPrice(Math.abs(diff))})
                        </span>
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function AddMore({
  items,
  cat,
  setCat,
  has,
  onAdd,
}: {
  items: QuoteItem[];
  cat: string;
  setCat: (c: string) => void;
  has: (id: string) => boolean;
  onAdd: (id: string) => void;
}) {
  const featured = items.filter((i) => i.featured);
  const cats = sortCategories(featured.map((i) => i.category));
  const current = cat || cats[0];
  return (
    <div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {cats.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className={`${c === current ? "chip chip-active" : "chip"} shrink-0`}>
            {c}
          </button>
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {featured
          .filter((i) => i.category === current)
          .map((i) => (
            <li key={i.id}>
              <button type="button" onClick={() => onAdd(i.id)} className="group block w-full overflow-hidden rounded-xl border border-line bg-surface text-left">
                <div className="relative aspect-square bg-surface-2">
                  <ItemVisual item={i} sizes="200px" />
                  <span className={`absolute right-2 bottom-2 grid h-8 w-8 place-items-center rounded-full shadow-soft ${has(i.id) ? "bg-gold text-accent-ink" : "bg-surface text-ink group-hover:bg-gold group-hover:text-accent-ink"}`}>
                    <Icon name={has(i.id) ? "check" : "plus"} size={16} />
                  </span>
                </div>
                <div className="p-2 text-xs">
                  <p className="font-medium leading-snug">{i.name}</p>
                  <p className="text-muted tabular-nums">{formatPrice(i.price)} {i.unit !== "each" ? i.unit : "each"}</p>
                </div>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}

function PlanView({
  input,
  list,
  total,
  name,
  email,
  done,
  setDone,
  onEdit,
  ideas = [],
}: {
  input: PlanInput;
  list: Row[];
  total: number;
  name?: string;
  email?: string;
  done: Record<string, boolean>;
  setDone: (f: (p: Record<string, boolean>) => Record<string, boolean>) => void;
  onEdit: () => void;
  ideas?: PlannerIdea[];
}) {
  // The setup text that fits where the event is: indoors for venues, the backyard version for everything else.
  const ideaSetup = (i: PlannerIdea) => (input.setting === "venue" ? i.setup.indoors : i.setup.backyard);
  const [pdf, setPdf] = useState<"idle" | "making" | "error">("idle");
  const ev = getPlannerEvent(input.event);
  const notes = assessment(input, total);
  const plan = layout(input, list);
  const groups = [...new Set(list.map((l) => l.group))]
    .map((g) => ({ g, value: list.filter((l) => l.group === g).reduce((s, l) => s + l.item.price * l.qty, 0) }))
    .sort((x, y) => y.value - x.value);
  const max = Math.max(1, ...groups.map((x) => x.value));
  const first = name?.split(" ")[0];
  const call = bookingUrl({ name, email }, "planner") || "/book?from=planner";

  const download = async () => {
    setPdf("making");
    try {
      const { downloadPlanPdf } = await import("./plan-pdf");
      await downloadPlanPdf({
        input,
        name,
        lines: list.map((l) => ({ name: l.item.name, qty: l.qty, unit: l.item.unit, price: l.item.price, group: l.group })),
        ideas: ideas.map((i) => ({ name: i.name, setup: ideaSetup(i), activities: i.activities, props: i.props })),
      });
      setPdf("idle");
    } catch {
      setPdf("error");
    }
  };

  return (
    <div>
      <div className="rounded-3xl bg-gold-soft p-6 sm:p-10">
        <p className="eyebrow">Your plan is ready</p>
        <h2 className="display-2 mt-2">{first ? `${first}, here's` : "Here's"} your {ev?.name.toLowerCase()} plan</h2>
        <p className="lede mt-3 max-w-2xl">
          Your quote request for {list.length} items ({formatPrice(total)} in rentals) is with our team. We&apos;ll confirm availability
          and delivery for your venue within one business day{email ? ` at ${email}` : ""}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={download} disabled={pdf === "making"}>
            <Icon name="arrow" size={16} className="rotate-90" /> {pdf === "making" ? "Preparing PDF…" : "Download my plan (PDF)"}
          </button>
          <a href={call} target={call.startsWith("http") ? "_blank" : undefined} rel="noopener" className="btn-ghost">
            <Icon name="phone" size={16} /> Book a free 15-minute call
          </a>
          <button type="button" className="btn-ghost" onClick={onEdit}>
            Edit my list
          </button>
        </div>
        {pdf === "error" && <p className="mt-3 text-sm text-rose" role="alert">The PDF couldn&apos;t be made on this device. Try again, or use your browser&apos;s Print → Save as PDF.</p>}
      </div>

      <section className="mt-12" aria-labelledby="plan-next">
        <h3 id="plan-next" className="display-3">What happens next</h3>
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["We check your date", "Our partners confirm stock for your date, and we send a proposal with delivery and setup for your venue."],
            ["You approve", "Change anything you like. Approving the proposal reserves your rentals."],
            ["Delivered and set up", "Send your final count about a week out. We deliver, set up and pick everything up after."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-line bg-surface p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-sm font-semibold text-accent-ink">{i + 1}</span>
              <p className="mt-3 font-medium">{t}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12" aria-labelledby="plan-assess">
        <h3 id="plan-assess" className="display-3">Assessment</h3>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {notes.map((n) => (
            <li key={n.text} className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm leading-6">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${n.tone === "good" ? "bg-sage text-white" : "bg-gold-soft text-gold"}`}>
                <Icon name={n.tone === "good" ? "check" : "info"} size={14} />
              </span>
              <span>
                <span className="sr-only">{n.tone === "good" ? "Good: " : "Watch: "}</span>
                {n.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {ideas.length > 0 && (
        <section className="mt-12" aria-labelledby="plan-ideas">
          <h3 id="plan-ideas" className="display-3">Your party ideas</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ideas.map((i) => (
              <article key={i.slug} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="relative aspect-[16/7] bg-surface-2">
                  <Image src={i.image} alt={i.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <p className="font-heading font-semibold text-xl">{i.name}</p>
                  <p className="mt-2 text-sm leading-6">
                    <span className="font-medium">Setup: </span>
                    {ideaSetup(i)}
                  </p>
                  <p className="mt-3 text-sm font-medium">Activities and games</p>
                  <ul className="mt-1 space-y-1 text-sm leading-6 text-muted">
                    {i.activities.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm">
                    <span className="font-medium">Props to buy or make: </span>
                    <span className="text-muted">{i.props.join(", ")}</span>
                  </p>
                  <Link href={i.href} target="_blank" className="mt-3 inline-block text-sm text-accent underline">
                    See the full idea
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12" aria-labelledby="plan-time">
        <h3 id="plan-time" className="display-3">Your checklist</h3>
        <p className="mt-1 text-sm text-muted">Tick things off as you go; this page remembers on this device, and the PDF has the same list.</p>
        <ol className="relative mt-6 space-y-6 border-l border-line pl-6">
          {timeline(input).map((s) => (
            <li key={s.when}>
              <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-gold" aria-hidden="true" />
              <p className="font-medium">
                {s.when}
                {s.date && <span className="ml-2 text-sm font-normal text-muted">{s.date}</span>}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {s.tasks.map((t) => {
                  const key = `${s.when}:${t}`;
                  return (
                    <li key={t}>
                      <label className="flex cursor-pointer items-start gap-2">
                        <input type="checkbox" checked={!!done[key]} onChange={(e) => setDone((p) => ({ ...p, [key]: e.target.checked }))} className="mt-1 accent-[var(--gold)]" />
                        <span className={done[key] ? "text-muted line-through" : ""}>{t}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]" aria-labelledby="plan-layout">
        <div className="min-w-0">
          <h3 id="plan-layout" className="display-3">Floor plan sketch</h3>
          <p className="mt-1 text-sm text-muted">
            About {plan.width}&apos; x {plan.depth}&apos; ({(plan.width * plan.depth).toLocaleString()} sq ft). We&apos;ll fit it to your real room or lawn.
          </p>
          <FloorPlan plan={plan} />
        </div>
        <div className="min-w-0">
          <h3 className="display-3">Where the budget goes</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {groups.map((x) => (
              <li key={x.g}>
                <div className="flex justify-between gap-3">
                  <span>{x.g}</span>
                  <span className="tabular-nums">{formatPrice(x.value)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-surface-2">
                  <div className="h-1.5 rounded-full bg-gold" style={{ width: `${(x.value / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-sm">
            Rentals total <strong className="tabular-nums">{formatPrice(total)}</strong>
            <span className="text-muted"> · {formatPrice(input.guests ? total / input.guests : 0)} per guest</span>
          </p>
          <p className="mt-1 text-xs text-muted">Delivery, setup, damage waiver and tax are confirmed in your proposal.</p>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-espresso p-6 sm:p-10">
        <h3 className="display-3">Want a second pair of eyes?</h3>
        <p className="mt-2 max-w-2xl text-muted">
          A 15-minute call with us covers quantities, layout and where to save. Free, no obligation, and your planner is welcome to join.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={call} target={call.startsWith("http") ? "_blank" : undefined} rel="noopener" className="btn-primary">
            Book a free call
          </a>
          <button type="button" className="btn-ghost" onClick={download}>
            Download my plan
          </button>
        </div>
      </section>
    </div>
  );
}
