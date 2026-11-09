"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { attributionFields } from "@/lib/attribution";
import { trackLead } from "@/lib/analytics";
import { sortCategories } from "@/lib/catalog-types";
import {
  assessment,
  budgets,
  extras as extraOptions,
  getPlannerEvent,
  layout,
  plannerEvents,
  recommend,
  settings,
  styles,
  timeline,
  type BudgetId,
  type ExtraId,
  type PlanInput,
  type SettingId,
  type StyleId,
} from "@/lib/event-plan";
import { BookingCta } from "../BookingCta";
import { ItemVisual, Stepper, type QuoteItem } from "../QuoteForm";
import { Icon, formatPrice, type IconName } from "../ui";
import { allInEstimate } from "@/lib/fees";
import { FloorPlan } from "./FloorPlan";

// Step-by-step event planner: a few picture-first questions build a recommended rental list the visitor can
// adjust, then a free personalised plan (assessment, timeline, layout, budget) unlocks with their email.
// Unlocking sends the list to the CRM as a quote request, priced again on the server.

type Answers = {
  event?: string;
  guests: number;
  style?: StyleId;
  setting?: SettingId;
  extras: ExtraId[];
  extrasTouched: boolean;
  date?: string;
  month?: string; // YYYY-MM when only the month is known
  noDate?: boolean;
  budget?: BudgetId;
};

type Lines = Record<string, number>;

const steps = ["Occasion", "Guests", "Style", "Setting", "Extras", "Date & budget", "Your list", "Your plan"] as const;
const STORE = "bc-planner-v1";
const guestPicks = [25, 50, 75, 100, 150, 200, 300];

const groupOrder = ["Seating", "Tables", "Linens", "Tableware", "Glassware", "Bar", "Catering", "Dance & stage", "Sound & AV", "Decor & lighting", "Lounge", "Fun", "Tent & weather", "Restrooms & power", "Added by you"];

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
          <p className="font-serif text-xl leading-tight">{title}</p>
          {badge && <span className="shrink-0 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium tabular-nums">{badge}</span>}
        </div>
        {text && <p className="mt-1 text-sm leading-6 text-muted">{text}</p>}
      </div>
    </button>
  );
}

export function EventPlanner({ items, initialEvent, from }: { items: QuoteItem[]; initialEvent?: string; from?: string }) {
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const startEvent = getPlannerEvent(initialEvent);
  const [step, setStep] = useState(startEvent ? 1 : 0);
  const [a, setA] = useState<Answers>(
    startEvent
      ? { guests: startEvent.defaultGuests, extras: startEvent.extras, extrasTouched: false, event: startEvent.id }
      : { guests: 100, extras: [], extrasTouched: false },
  );
  const [lines, setLines] = useState<Lines>({});
  const [why, setWhy] = useState<Record<string, { group: string; why: string }>>({});
  const [listTouched, setListTouched] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addCat, setAddCat] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [contact, setContact] = useState<{ name?: string; email?: string }>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
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
  const restore = () => {
    try {
      const v = JSON.parse(saved ?? "null");
      if (!v?.a) return;
      setA(v.a);
      setLines(v.lines ?? {});
      setWhy(v.why ?? {});
      setListTouched(!!v.listTouched);
      setDone(v.done ?? {});
      go(Math.min(v.step ?? 0, 6));
    } catch {}
  };

  useEffect(() => {
    if (!a.event) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ a, lines, why, listTouched, step, done }));
    } catch {}
  }, [a, lines, why, listTouched, step, done]);

  const date = a.date || (a.month ? `${a.month}-15` : undefined);
  const input: PlanInput | undefined =
    a.event && a.style && a.setting ? { event: a.event, guests: a.guests, style: a.style, setting: a.setting, extras: a.extras, date } : undefined;

  const priceOf = (rec: { id: string; qty: number }[]) => rec.reduce((s, l) => s + (byId.get(l.id)?.price ?? 0) * l.qty, 0);
  const recFor = (over: Partial<PlanInput>) => {
    if (!a.event) return [];
    const base: PlanInput = { event: a.event, guests: a.guests, style: a.style ?? "classic", setting: a.setting ?? "venue", extras: a.extras, date, ...over };
    return recommend(base).filter((l) => byId.has(l.id));
  };

  // Rebuild the list from the answers until the visitor starts editing it themselves.
  const rebuild = (force = false) => {
    if (!input || (listTouched && !force)) return;
    const rec = recommend(input).filter((l) => byId.has(l.id));
    setLines(Object.fromEntries(rec.map((l) => [l.id, l.qty])));
    setWhy(Object.fromEntries(rec.map((l) => [l.id, { group: l.group, why: l.why }])));
    if (force) setListTouched(false);
  };

  const go = (n: number) => {
    if (n === 6) rebuild();
    setStep(n);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const pickEvent = (id: string) => {
    const ev = getPlannerEvent(id)!;
    setA((p) => ({ ...p, event: id, guests: p.event ? p.guests : ev.defaultGuests, extras: p.extrasTouched ? p.extras : ev.extras }));
    setListTouched(false);
    go(1);
  };

  const list = Object.entries(lines)
    .filter(([id, q]) => q > 0 && byId.has(id))
    .map(([id, qty]) => ({ id, qty, item: byId.get(id)!, group: why[id]?.group ?? "Added by you", why: why[id]?.why }));
  const total = priceOf(list);
  const ev = getPlannerEvent(a.event);
  const budgetCap = budgets.find((b) => b.id === a.budget)?.max;
  const canNext = [!!a.event, a.guests > 0, !!a.style, !!a.setting, true, !!(a.date || a.month || a.noDate) && !!a.budget, list.length > 0, true][step];

  const setQty = (id: string, q: number) => {
    setListTouched(true);
    setLines((p) => ({ ...p, [id]: Math.max(0, Math.min(10000, Math.floor(q) || 0)) }));
  };

  async function unlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setStatus("sending");
    setError("");
    const summary = [
      `Planner answers: ${ev?.name}, ${a.guests} guests, ${styles.find((s) => s.id === a.style)?.name}, ${settings.find((s) => s.id === a.setting)?.name}.`,
      a.extras.length ? `Extras: ${a.extras.map((x) => extraOptions.find((o) => o.id === x)?.name).join(", ")}.` : "",
      `Budget: ${budgets.find((b) => b.id === a.budget)?.name ?? "not given"}.`,
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
      items: list.map((l) => ({ id: l.id, qty: l.qty })),
    };
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
      trackLead(date ? "quote" : "quiz", "planner", { guest_count: a.guests, item_count: list.length });
      setContact({ name: fd.name, email: fd.email });
      setStatus("idle");
      go(7);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const progress = Math.round((step / (steps.length - 1)) * 100);

  return (
    <div ref={top} className="scroll-mt-24">
      {/* Progress */}
      <div className="sticky top-[6.8rem] z-20 -mx-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center justify-between gap-3 text-sm">
          <p>
            <span className="text-muted">Step {step + 1} of {steps.length}:</span> <strong>{steps[step]}</strong>
          </p>
          {step >= 2 && list.length > 0 && step < 7 ? (
            <p className="tabular-nums">
              <span className="text-muted">Est. </span>
              <strong>{formatPrice(step < 6 && input ? priceOf(recFor({})) : total)}</strong>
            </p>
          ) : null}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Planner progress">
          <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${Math.max(4, progress)}%` }} />
        </div>
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
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="q-guests" className="max-w-2xl">
            <h2 id="q-guests" className="display-2">How many guests?</h2>
            <p className="lede mt-2">A best guess is fine. Quantities follow this number.</p>
            <div className="mt-8 flex items-end gap-3">
              <input
                type="number"
                min={1}
                max={5000}
                inputMode="numeric"
                aria-label="Number of guests"
                value={a.guests || ""}
                onChange={(e) => setA((p) => ({ ...p, guests: Math.min(5000, Math.max(0, Math.floor(Number(e.target.value)))) }))}
                className="w-40 border-b-2 border-gold bg-transparent font-serif text-7xl tabular-nums outline-none"
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
          <section aria-labelledby="q-style">
            <h2 id="q-style" className="display-2">What feel are you going for?</h2>
            <p className="lede mt-2">Prices are for your {a.guests} guests, so you can see what each level costs.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {styles.map((s) => {
                const chair = byId.get(s.id === "classic" && a.event === "corporate" ? "black-padded-folding" : s.chair);
                const est = priceOf(recFor({ style: s.id }));
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={a.style === s.id}
                    onClick={() => {
                      setA((p) => ({ ...p, style: s.id }));
                      setListTouched(false);
                      go(3);
                    }}
                    className={`overflow-hidden rounded-2xl border bg-surface text-left shadow-soft transition ${a.style === s.id ? "border-gold ring-2 ring-gold" : "border-line hover:border-gold/60"}`}
                  >
                    <div className="relative aspect-[16/9] bg-surface-2 md:aspect-square">{chair && <ItemVisual item={chair} sizes="(min-width: 768px) 33vw, 100vw" />}</div>
                    <div className="p-5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-serif text-2xl">{s.name}</p>
                        <span className="text-sm tabular-nums text-muted">~{formatPrice(est)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted">{s.blurb}</p>
                      <p className="mt-2 text-xs text-muted">About {formatPrice(a.guests ? est / a.guests : 0)} per guest</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="q-setting">
            <h2 id="q-setting" className="display-2">Where is it?</h2>
            <p className="lede mt-2">Outdoors we&apos;ll add cover, light, power and restrooms where you need them.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {settings.map((s) => (
                <Tile
                  key={s.id}
                  selected={a.setting === s.id}
                  onClick={() => {
                    setA((p) => ({ ...p, setting: s.id }));
                    setListTouched(false);
                    go(4);
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

        {step === 4 && (
          <section aria-labelledby="q-extras" className="max-w-3xl">
            <h2 id="q-extras" className="display-2">What&apos;s happening on the day?</h2>
            <p className="lede mt-2">We ticked what&apos;s typical for a {ev?.name.toLowerCase()}. Tap to change.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {extraOptions.map((o) => {
                const on = a.extras.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setA((p) => ({ ...p, extrasTouched: true, extras: on ? p.extras.filter((x) => x !== o.id) : [...p.extras, o.id] }));
                      setListTouched(false);
                    }}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-sm transition ${on ? "border-gold bg-gold-soft" : "border-line bg-surface hover:border-gold/60"}`}
                  >
                    <span className={`grid h-11 w-11 place-items-center rounded-full ${on ? "bg-gold text-accent-ink" : "bg-surface-2 text-gold"}`}>
                      <Icon name={(on ? "check" : o.icon) as IconName} size={20} />
                    </span>
                    {o.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 5 && (
          <section aria-labelledby="q-date" className="max-w-3xl">
            <h2 id="q-date" className="display-2">When, and what budget?</h2>
            <p className="lede mt-2">The date shapes your plan: Chicago weather, lead time and peak-season stock.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="p-date">Event date</label>
                <input
                  id="p-date"
                  type="date"
                  className="field"
                  value={a.date ?? ""}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setA((p) => ({ ...p, date: e.target.value || undefined, month: undefined, noDate: false }));
                    setListTouched(false);
                  }}
                />
              </div>
              <div>
                <label className="label" htmlFor="p-month">Or just the month</label>
                <input
                  id="p-month"
                  type="month"
                  className="field"
                  value={a.month ?? ""}
                  onChange={(e) => {
                    setA((p) => ({ ...p, month: e.target.value || undefined, date: undefined, noDate: false }));
                    setListTouched(false);
                  }}
                />
              </div>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={!!a.noDate} onChange={(e) => setA((p) => ({ ...p, noDate: e.target.checked, date: e.target.checked ? undefined : p.date, month: e.target.checked ? undefined : p.month }))} className="accent-[var(--gold)]" />
              No date yet
            </label>
            <p className="label mt-8">Rental budget</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {budgets.map((b) => (
                <button key={b.id} type="button" onClick={() => setA((p) => ({ ...p, budget: b.id }))} className={a.budget === b.id ? "chip chip-active" : "chip"} aria-pressed={a.budget === b.id}>
                  {b.name}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Just the rentals: chairs, tables, linens, tableware, tent and so on. Not food, venue or staff.</p>
          </section>
        )}

        {step === 6 && (
          <section aria-labelledby="q-list">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="q-list" className="display-2">Here&apos;s your list</h2>
                <p className="lede mt-2">
                  Built for {a.guests} guests at a {styles.find((s) => s.id === a.style)?.name.toLowerCase()} {ev?.name.toLowerCase()}. Adjust anything.
                </p>
              </div>
              {listTouched && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => rebuild(true)}>
                  Reset to our suggestions
                </button>
              )}
            </div>

            <BudgetMeter total={total} cap={budgetCap} budgetName={budgets.find((b) => b.id === a.budget)?.name} />
            {budgetCap && total > budgetCap && a.style !== "simple" && (
              <p className="mt-3 text-sm">
                <button
                  type="button"
                  className="font-medium text-accent underline underline-offset-4"
                  onClick={() => {
                    const next: StyleId = a.style === "lavish" ? "classic" : "simple";
                    const rec = recFor({ style: next });
                    setA((p) => ({ ...p, style: next }));
                    setLines(Object.fromEntries(rec.map((l) => [l.id, l.qty])));
                    setWhy(Object.fromEntries(rec.map((l) => [l.id, { group: l.group, why: l.why }])));
                    setListTouched(false);
                  }}
                >
                  Switch to {a.style === "lavish" ? "Classic" : "Simple"} and save about{" "}
                  {formatPrice(total - priceOf(recFor({ style: a.style === "lavish" ? "classic" : "simple" })))}
                </button>
              </p>
            )}

            <div className="mt-8 space-y-10">
              {[...new Set(list.map((l) => l.group))]
                .sort((x, y) => groupOrder.indexOf(x) - groupOrder.indexOf(y))
                .map((g) => (
                  <div key={g}>
                    <h3 className="eyebrow">{g}</h3>
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
                  </div>
                ))}
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
                  has={(id) => (lines[id] ?? 0) > 0}
                  onAdd={(id) => {
                    const it = byId.get(id)!;
                    setWhy((p) => ({ ...p, [id]: p[id] ?? { group: "Added by you", why: "" } }));
                    setQty(id, Math.max(lines[id] ?? 0, it.perGuest ? Math.ceil(a.guests * it.perGuest) : 1));
                  }}
                />
              )}
              <p className="mt-3 text-xs text-muted">
                Need something unusual? Browse the <Link href="/quote?browse=1" className="text-accent underline">full catalog of 2,500+ items</Link>, or add it to the notes in the next step.
              </p>
            </div>
          </section>
        )}

        {step === 6 && list.length > 0 && (
          <section aria-labelledby="q-unlock" className="mt-12 grid gap-8 rounded-3xl bg-espresso p-6 sm:p-10 lg:grid-cols-[1fr_26rem]">
            <div>
              <p className="eyebrow text-gold">Free, personalised</p>
              <h2 id="q-unlock" className="display-2 mt-2">Get your event plan</h2>
              <p className="mt-3 max-w-lg leading-7 text-muted">
                We&apos;ll send your list to our team for real availability and unlock your plan right here:
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  ["check", "An honest assessment of your list, budget and date"],
                  ["calendar", "A month-by-month checklist counted back from your date"],
                  ["ruler", "A floor plan sketch and the space you'll need"],
                  ["quote", "A budget breakdown by category"],
                ].map(([icon, t]) => (
                  <li key={t} className="flex gap-3">
                    <Icon name={icon as IconName} size={18} className="mt-0.5 shrink-0 text-gold" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted">No payment and no commitment. We reply within one business day.</p>
            </div>
            <form onSubmit={unlock} className="space-y-3 rounded-2xl bg-surface p-5">
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
              <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
                {status === "sending" ? "Building your plan…" : "Show my plan"}
              </button>
            </form>
          </section>
        )}

        {step === 7 && input && (
          <PlanView
            input={input}
            list={list}
            total={total}
            budget={a.budget}
            name={contact.name}
            email={contact.email}
            done={done}
            setDone={setDone}
            onEdit={() => go(6)}
          />
        )}
      </div>

      {/* Navigation */}
      {step < 7 && (
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          <button type="button" className="btn-ghost" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}>
            Back
          </button>
          {step < 6 && (
            <button type="button" className="btn-primary" disabled={!canNext} onClick={() => go(step + 1)}>
              {step === 5 ? "See my list" : "Next"} <Icon name="arrow" size={16} />
            </button>
          )}
          {step === 6 && (
            <a href="#q-unlock" className="btn-primary">
              Get my free plan <Icon name="arrow" size={16} />
            </a>
          )}
        </div>
      )}
      {step === 0 && (
        <p className="mt-4 text-sm text-muted">
          Know exactly what you need? <Link href="/quote?browse=1" className="text-accent underline">Browse the full catalog instead</Link>.
        </p>
      )}
    </div>
  );
}

function BudgetMeter({ total, cap, budgetName }: { total: number; cap?: number; budgetName?: string }) {
  if (!cap) {
    return (
      <p className="mt-6 text-lg">
        Estimated rentals: <strong className="font-serif text-3xl tabular-nums">{formatPrice(total)}</strong>
        <span className="ml-2 text-sm text-muted">before delivery and tax</span>
      </p>
    );
  }
  const pct = Math.min(100, (total / cap) * 100);
  const over = total > cap;
  return (
    <div className="mt-6 max-w-xl">
      <div className="flex items-baseline justify-between gap-3">
        <p>
          Estimated rentals <strong className="font-serif text-3xl tabular-nums">{formatPrice(total)}</strong>
        </p>
        <p className={`text-sm ${over ? "text-rose" : "text-muted"}`}>{over ? `Over your ${budgetName} budget` : `Within ${budgetName}`}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div className={`h-full rounded-full ${over ? "bg-rose" : "bg-sage"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">Before delivery, setup and tax, which depend on your venue.</p>
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
  budget,
  name,
  email,
  done,
  setDone,
  onEdit,
}: {
  input: PlanInput;
  list: { id: string; qty: number; item: QuoteItem; group: string }[];
  total: number;
  budget?: BudgetId;
  name?: string;
  email?: string;
  done: Record<string, boolean>;
  setDone: (f: (p: Record<string, boolean>) => Record<string, boolean>) => void;
  onEdit: () => void;
}) {
  const ev = getPlannerEvent(input.event);
  const notes = assessment(input, total, budget);
  const steps = timeline(input);
  const plan = layout(input, list);
  const groups = [...new Set(list.map((l) => l.group))]
    .map((g) => ({ g, value: list.filter((l) => l.group === g).reduce((s, l) => s + l.item.price * l.qty, 0) }))
    .sort((x, y) => y.value - x.value);
  const max = Math.max(1, ...groups.map((x) => x.value));
  const first = name?.split(" ")[0];
  const chairList = list.filter((l) => l.item.categoryId === "chairs");
  const allIn = allInEstimate(total, {
    categoryIds: list.map((l) => l.item.categoryId ?? ""),
    chairQty: chairList.reduce((s, l) => s + l.qty, 0),
    chairRentals: chairList.reduce((s, l) => s + l.item.price * l.qty, 0),
  });

  return (
    <div>
      <div className="rounded-3xl bg-gold-soft p-6 sm:p-10">
        <p className="eyebrow">Your plan is ready</p>
        <h2 className="display-2 mt-2">{first ? `${first}, here's` : "Here's"} your {ev?.name.toLowerCase()} plan</h2>
        <p className="lede mt-3 max-w-2xl">
          Your list of {list.length} rentals ({formatPrice(total)}) is with our team. We&apos;ll confirm availability and
          delivery for your venue within one business day{email ? ` at ${email}` : ""}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => window.print()}>
            Print or save as PDF
          </button>
          <button type="button" className="btn-ghost" onClick={onEdit}>
            Edit my list
          </button>
        </div>
        <BookingCta name={name} email={email} content="planner" note="Want to talk it through? Book a free 15-minute call." />
      </div>

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

      <section className="mt-12" aria-labelledby="plan-time">
        <h3 id="plan-time" className="display-3">Your checklist</h3>
        <p className="mt-1 text-sm text-muted">Tick things off as you go; this page remembers on this device.</p>
        <ol className="relative mt-6 space-y-6 border-l border-line pl-6">
          {steps.map((s) => (
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
        <div>
          <h3 id="plan-layout" className="display-3">Floor plan sketch</h3>
          <p className="mt-1 text-sm text-muted">
            About {plan.width}&apos; x {plan.depth}&apos; ({(plan.width * plan.depth).toLocaleString()} sq ft). We&apos;ll fit it to your real room or lawn.
          </p>
          <FloorPlan plan={plan} />
        </div>
        <div>
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
            Rentals <strong className="tabular-nums">{formatPrice(total)}</strong>
            <span className="text-muted"> · {formatPrice(input.guests ? total / input.guests : 0)} per guest</span>
          </p>
          <dl className="mt-2 space-y-1 text-sm text-muted">
            {allIn.lines.map((l) => (
              <div key={l.label} className="flex justify-between gap-4">
                <dt>{l.label}</dt>
                <dd className="tabular-nums">{formatPrice(l.amount)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-line pt-3 text-sm">
            Estimated total <strong className="tabular-nums">{formatPrice(allIn.total)}</strong>
          </p>
          <p className="mt-1 text-xs text-muted">
            This is an estimate. We confirm the final price for your date and venue in your proposal.
          </p>
        </div>
      </section>
    </div>
  );
}
