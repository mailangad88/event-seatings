"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { attributionFields } from "@/lib/attribution";
import { parseIdeas, readIdeasRaw, subscribeIdeas, writeIdeas } from "./ideas-store";
import { track, trackLead } from "@/lib/analytics";
import { CLIMATE_SOURCE, sunTimes, weatherNotes } from "@/lib/chicago-climate";
import { occasions, roles } from "@/data/vendor-guide";
import { plannerEvents, settings, styles } from "@/lib/event-plan";
import {
  EVENTS_KEY,
  PLANNER_KEYS,
  blankEvent,
  budgetTotals,
  checklist,
  daysUntil,
  eventIcs,
  fromPlannerStore,
  fromShareParam,
  migrateDone,
  nextUp,
  progress,
  shareParam,
  vendorOccasionFor,
  type SavedEvent,
} from "@/lib/my-events";

// ---- Device storage as an external store (no setState-in-effect, no hydration mismatch) ----------
const listeners = new Set<() => void>();
const readKey = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", l);
  };
};
const noop = () => () => {};
function save(list: SavedEvent[]) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
  } catch {}
  listeners.forEach((l) => l());
}
const parse = (raw: string | null): SavedEvent[] => {
  try {
    const v = JSON.parse(raw ?? "[]");
    return Array.isArray(v) ? v.filter((e) => e && typeof e.id === "string").map((e) => migrateDone({ ...e, done: e.done ?? {} })) : [];
  } catch {
    return [];
  }
};

const fmtLong = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export function MyEvents({ site }: { site: { name: string; url: string } }) {
  const raw = useSyncExternalStore(subscribe, () => readKey(EVENTS_KEY), () => null);
  const plannerRaw = useSyncExternalStore(noop, () => PLANNER_KEYS.map(readKey).find(Boolean) ?? null, () => null);
  const search = useSyncExternalStore(noop, () => window.location.search, () => "");
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  const events = useMemo(() => parse(raw), [raw]);
  const shared = useMemo(() => {
    const p = new URLSearchParams(search).get("e");
    return p ? fromShareParam(p) : undefined;
  }, [search]);
  const fromPlanner = useMemo(() => fromPlannerStore(plannerRaw), [plannerRaw]);
  const startType = useMemo(() => {
    const t = new URLSearchParams(search).get("new");
    return plannerEvents.some((e) => e.id === t) ? t! : "wedding";
  }, [search]);
  const [dismissedShare, setDismissedShare] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);

  const current = events.find((e) => e.id === selected) ?? events[0];

  const update = (patch: Partial<SavedEvent>) => current && save(events.map((e) => (e.id === current.id ? { ...e, ...patch } : e)));
  const add = (e: SavedEvent, source: string) => {
    save([...events, e]);
    setSelected(e.id);
    track("my_event_created", { source, event_type: e.type });
  };
  const remove = () => {
    if (!current || !confirm(`Delete "${current.name}" from this device?`)) return;
    save(events.filter((e) => e.id !== current.id));
    setSelected(undefined);
  };

  if (!hydrated) {
    return <div className="card min-h-64 animate-pulse p-8" aria-busy="true" aria-label="Loading your saved events" />;
  }

  const shareBanner = shared && !dismissedShare && (
    <div className="card mb-8 flex flex-wrap items-center justify-between gap-4 border-gold p-5">
      <p>
        <strong>A plan was shared with you:</strong> {shared.name}
        {shared.date ? ` on ${fmtLong(shared.date)}` : ""}.
      </p>
      <div className="flex gap-2">
        <button
          className="btn-primary btn-sm"
          onClick={() => {
            add(shared, "share-link");
            setDismissedShare(true);
            history.replaceState(null, "", "/my-events");
          }}
        >
          Save to my events
        </button>
        <button className="btn-ghost btn-sm" onClick={() => setDismissedShare(true)}>Not now</button>
      </div>
    </div>
  );

  if (!current) {
    return (
      <div>
        {shareBanner}
        <StartForm key={startType} initialType={startType} onStart={(e) => add(e, "new")} fromPlanner={fromPlanner} onImport={() => fromPlanner && add(fromPlanner, "planner")} />
      </div>
    );
  }

  const steps = checklist(current);
  const prog = progress(current, steps);
  const days = daysUntil(current.date);
  const next = nextUp(current, new Date(), steps);
  const outdoor = current.setting !== "venue";
  const wx = current.date ? weatherNotes(current.date, outdoor) : undefined;
  const sun = current.date ? sunTimes(current.date) : undefined;
  const ev = plannerEvents.find((p) => p.id === current.type) ?? plannerEvents[0];

  const downloadIcs = () => {
    const ics = eventIcs(current, site);
    if (!ics) return;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${current.name.replace(/[^\w]+/g, "-").toLowerCase()}-reminders.ics`;
    a.click();
    URL.revokeObjectURL(url);
    track("my_event_calendar", { event_type: current.type });
  };
  const copyShare = async () => {
    const link = `${site.url}/my-events?e=${shareParam(current)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      prompt("Copy this link", link);
    }
    track("my_event_share", { event_type: current.type });
  };

  return (
    <div>
      {shareBanner}

      {/* Event switcher: every saved event, plus "plan another" */}
      <div className="flex flex-wrap items-center gap-2 print:hidden" role="tablist" aria-label="Your saved events">
        {events.map((e) => (
          <button key={e.id} role="tab" aria-selected={e.id === current.id} className={e.id === current.id ? "chip chip-active" : "chip"} onClick={() => setSelected(e.id)}>
            {e.name}
          </button>
        ))}
        <button className="chip" onClick={() => add(blankEvent(), "another")}>
          <Icon name="plus" size={14} /> Plan another event
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Countdown + details */}
        <section className="card p-6 sm:p-8" aria-labelledby="ev-title">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <label className="label" htmlFor="ev-name">Event name</label>
              <input id="ev-name" className="field mt-1 font-serif text-2xl" value={current.name} maxLength={80} onChange={(e) => update({ name: e.target.value })} />
              <h2 id="ev-title" className="sr-only">{current.name}</h2>
            </div>
            <div className="text-center" aria-live="polite">
              {days === undefined ? (
                <p className="text-sm text-muted">Add a date to start the countdown</p>
              ) : days > 0 ? (
                <>
                  <p className="font-serif text-6xl leading-none text-gold">{days}</p>
                  <p className="mt-1 text-sm text-muted">{days === 1 ? "day to go" : "days to go"}</p>
                </>
              ) : days === 0 ? (
                <p className="font-serif text-3xl text-gold">It&apos;s today!</p>
              ) : (
                <p className="text-sm text-muted">This event was {-days} days ago</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ev-type">Occasion</label>
              <select id="ev-type" className="field mt-1" value={current.type} onChange={(e) => update({ type: e.target.value })}>
                {plannerEvents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="ev-date">Date</label>
              <input id="ev-date" type="date" className="field mt-1" value={current.date ?? ""} onChange={(e) => update({ date: e.target.value || undefined })} />
            </div>
            <div>
              <label className="label" htmlFor="ev-guests">Guests</label>
              <input id="ev-guests" type="number" min={1} max={5000} className="field mt-1" value={current.guests} onChange={(e) => update({ guests: Math.max(1, Math.min(5000, Number(e.target.value) || 1)) })} />
            </div>
            <div>
              <label className="label" htmlFor="ev-setting">Setting</label>
              <select id="ev-setting" className="field mt-1" value={current.setting} onChange={(e) => update({ setting: e.target.value as SavedEvent["setting"] })}>
                {settings.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <span className="label">Style</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button key={s.id} className={current.style === s.id ? "chip chip-active" : "chip"} onClick={() => update({ style: s.id })} aria-pressed={current.style === s.id}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">Checklist progress</span>
              <span className="text-muted">{prog.done} of {prog.total} done</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={prog.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress">
              <div className="h-full bg-gold transition-all" style={{ width: `${prog.pct}%` }} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 print:hidden">
            <Link href={`/quote?event=${current.type}&from=my-events`} className="btn-primary btn-sm">Price rentals for this event</Link>
            <button className="btn-ghost btn-sm" onClick={downloadIcs} disabled={!current.date} title={current.date ? undefined : "Add a date first"}>
              <Icon name="calendar" size={16} /> Add reminders to my calendar
            </button>
            <button className="btn-ghost btn-sm" onClick={copyShare}>{copied ? "Link copied" : "Share with partner or planner"}</button>
            <button className="btn-ghost btn-sm" onClick={() => window.print()}>Print</button>
          </div>
        </section>

        {/* Next up + weather */}
        <aside className="space-y-6">
          <section className="card p-6" aria-labelledby="next-up">
            <h2 id="next-up" className="font-serif text-2xl">Next up</h2>
            {next.length ? (
              <ul className="mt-4 space-y-3">
                {next.map((t) => (
                  <li key={t.key} className="flex gap-3">
                    <input type="checkbox" className="mt-1 accent-[var(--gold)]" id={`n-${t.key}`} checked={!!current.done[t.key]} onChange={(e) => update({ done: { ...current.done, [t.key]: e.target.checked } })} />
                    <label htmlFor={`n-${t.key}`} className="leading-6">
                      {t.text}
                      <span className="block text-xs text-muted">{t.when}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-muted">Everything is ticked off. Enjoy your event.</p>
            )}
          </section>

          {wx && sun && current.date && (
            <section className="card p-6" aria-labelledby="wx-title">
              <h2 id="wx-title" className="font-serif text-2xl">Your date in Chicago</h2>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="well p-3">
                  <dt className="text-xs text-muted">Normal high</dt>
                  <dd className="font-serif text-2xl">{Math.round(wx.high)}°F</dd>
                </div>
                <div className="well p-3">
                  <dt className="text-xs text-muted">Sunrise</dt>
                  <dd className="font-serif text-xl">{sun.sunrise}</dd>
                </div>
                <div className="well p-3">
                  <dt className="text-xs text-muted">Sunset</dt>
                  <dd className="font-serif text-xl">{sun.sunset}</dd>
                </div>
              </dl>
              {wx.notes.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm leading-6">
                  {wx.notes.map((n) => <li key={n} className="flex gap-2"><Icon name="info" size={16} className="mt-1 shrink-0 text-gold" />{n}</li>)}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted">
                Normal high from {CLIMATE_SOURCE}. Sunset calculated for downtown Chicago.{" "}
                <Link href={`/chicago-event-seasons/${wx.slug}`} className="link">Planning in {wx.month}</Link> ·{" "}
                <Link href="/tools/event-weather" className="link">Golden light and dark-by times</Link>
              </p>
            </section>
          )}
        </aside>
      </div>

      {days !== undefined && days >= 0 && days <= 30 && steps.some((s) => s.kind === "rush") && (
        <section className="card mt-10 border-gold/40 p-6 sm:p-8 print:hidden" aria-labelledby="rush-title">
          <h2 id="rush-title" className="font-serif text-2xl">
            {days <= 1 ? "Your event is almost here" : `${days} days to go: here's what still works`}
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            We moved everything that was due earlier into one short list, with the most important things first. Rentals go fast this close to the date, so send us your list today
            {days <= 7 ? " and call us" : ""}. We check what is still free for your date and get back to you, usually within one business day.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/quote?event=${current.type}&from=my-events-rush`} className="btn-primary btn-sm">Send my rental list</Link>
            <Link href="/book" className="btn-ghost btn-sm">Book a call</Link>
          </div>
        </section>
      )}
      {days !== undefined && days < 0 && (
        <section className="card mt-10 p-6 sm:p-8 print:hidden" aria-labelledby="past-title">
          <h2 id="past-title" className="font-serif text-2xl">This date has passed</h2>
          <p className="mt-2 max-w-2xl text-muted">If your event moved, change the date above and your checklist rebuilds from the days left. If it&apos;s over, here are a few things to wrap up.</p>
        </section>
      )}

      {/* Full checklist */}
      <section className="mt-10" aria-labelledby="full-list">
        <h2 id="full-list" className="display-3">{days !== undefined && days < 0 ? `After your ${ev.name.toLowerCase()}` : `Your ${ev.name.toLowerCase()} checklist`}</h2>
        <p className="mt-2 text-muted">Built for {current.guests} guests at {settings.find((s) => s.id === current.setting)?.name.toLowerCase()}. Ticks are saved on this device.</p>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {steps.map((s) => (
            <li key={s.when} className={s.kind === "rush" ? "card border-gold/50 p-5" : "card p-5"}>
              <p className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-xl">{s.when}</span>
                {s.date && <span className="text-sm text-muted">{s.date}</span>}
              </p>
              <ul className="mt-3 space-y-2">
                {s.tasks.map((t) => (
                  <li key={t.key} className="flex gap-3">
                    <input type="checkbox" className="mt-1 accent-[var(--gold)]" id={`t-${t.key}`} checked={!!current.done[t.key]} onChange={(e) => update({ done: { ...current.done, [t.key]: e.target.checked } })} />
                    <label htmlFor={`t-${t.key}`} className={`leading-6 ${current.done[t.key] ? "text-muted line-through" : ""}`}>{t.text}</label>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <VendorBudget event={current} update={update} />

      <IdeaBoard />

      <section className="mt-10 grid gap-6 md:grid-cols-2 print:hidden">
        <div className="card p-6">
          <label htmlFor="ev-notes" className="font-serif text-2xl">Notes</label>
          <textarea id="ev-notes" className="field mt-3 min-h-32" placeholder="Venue contact, colours, ideas you saved…" value={current.notes ?? ""} maxLength={4000} onChange={(e) => update({ notes: e.target.value })} />
        </div>
        <CheckIn event={current} siteName={site.name} />
      </section>

      <p className="mt-8 text-right text-sm print:hidden">
        <button className="text-muted underline underline-offset-4 hover:text-ink" onClick={remove}>Delete this event from this device</button>
      </p>
    </div>
  );
}

function StartForm({ initialType, onStart, fromPlanner, onImport }: { initialType: string; onStart: (e: SavedEvent) => void; fromPlanner?: SavedEvent; onImport: () => void }) {
  const [type, setType] = useState(initialType);
  const [date, setDate] = useState("");
  return (
    <div className="card p-6 sm:p-10">
      <h2 className="display-3">Start your event plan</h2>
      <p className="mt-2 text-muted">Pick the occasion and date. You&apos;ll get a countdown, a checklist dated back from your event, Chicago weather notes and calendar reminders.</p>
      {fromPlanner && (
        <div className="well mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
          <p>You started a {plannerEvents.find((p) => p.id === fromPlanner.type)?.name.toLowerCase()} plan in our rental planner.</p>
          <button className="btn-accent btn-sm" onClick={onImport}>Bring it here</button>
        </div>
      )}
      <form
        className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          onStart({ ...blankEvent(type), date: date || undefined });
        }}
      >
        <div>
          <label className="label" htmlFor="st-type">Occasion</label>
          <select id="st-type" className="field mt-1" value={type} onChange={(e) => setType(e.target.value)}>
            {plannerEvents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="st-date">Date (if you know it)</label>
          <input id="st-date" type="date" className="field mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button className="btn-primary">Create my plan</button>
      </form>
      <p className="hint mt-4">No account needed. Your plan is saved in this browser; use the share link to open it on another device.</p>
    </div>
  );
}

function CheckIn({ event, siteName }: { event: SavedEvent; siteName: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const ev = plannerEvents.find((p) => p.id === event.type);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...attributionFields(),
        ...data,
        kind: "waitlist",
        source: "my-events",
        event_type: ev?.eventType,
        event_date: event.date,
        guest_count: event.guests,
      }),
    }).catch(() => null);
    if (res?.ok) {
      trackLead("waitlist", "my-events");
      return setStatus("done");
    }
    setStatus("error");
  }
  return (
    <div className="card p-6">
      <h2 className="font-serif text-2xl">Want a free planning check-in?</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Leave your email and a {siteName} planner will reach out once before your first rental milestone, with what to book and when. No spam, and you can say no thanks.
      </p>
      {status === "done" ? (
        <p className="mt-4 font-serif text-xl italic">Thank you. We&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <label className="sr-only" htmlFor="ci-email">Email address</label>
          <input id="ci-email" name="email" type="email" required placeholder="Your email" className="field min-w-0 flex-1" />
          <button className="btn-accent btn-sm shrink-0" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Yes please"}</button>
        </form>
      )}
      {status === "error" && <p className="mt-2 text-sm text-rose">Something went wrong. Please try again.</p>}
    </div>
  );
}

const usd0 = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const num = (v: string) => {
  const n = Math.round(Number(v.replace(/[^\d.]/g, "")));
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10_000_000) : undefined;
};

// Vendor team for this kind of event (from the vendor guide), with booked ticks and a simple budget.
function VendorBudget({ event, update }: { event: SavedEvent; update: (p: Partial<SavedEvent>) => void }) {
  const occ = occasions.find((o) => o.id === vendorOccasionFor(event.type)) ?? occasions[0];
  const ids = [...occ.essential, ...occ.often];
  const rows = [...ids.map((id) => ({ id, name: roles.find((r) => r.id === id)!.name, essential: occ.essential.includes(id) })), { id: "other", name: "Everything else (attire, favors, stationery)", essential: false }];
  const costs = event.costs ?? {};
  const t = budgetTotals(event);
  const booked = ids.filter((id) => event.vendors?.[id]).length;
  const setCost = (id: string, k: "est" | "paid", v: string) => update({ costs: { ...costs, [id]: { ...costs[id], [k]: num(v) } } });
  return (
    <section className="mt-10" aria-labelledby="vb-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="vb-title" className="display-3">Vendors and budget</h2>
          <p className="mt-2 text-muted">
            {booked} of {ids.length} vendors booked. <Link href="/vendor-guide" className="link">When to book each one</Link>
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="label" htmlFor="vb-budget">Total budget</label>
            <input id="vb-budget" inputMode="numeric" className="field mt-1 w-36" placeholder="$" value={event.budget ?? ""} onChange={(e) => update({ budget: num(e.target.value) })} />
          </div>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="sr-only">Vendor team with booked status, estimated cost and amount paid</caption>
          <thead className="border-b border-line text-muted">
            <tr><th className="p-3 font-medium">Booked</th><th className="p-3 font-medium">Vendor</th><th className="p-3 font-medium">Estimate</th><th className="p-3 font-medium">Paid</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-3">
                  {r.id !== "other" && (
                    <input type="checkbox" className="accent-[var(--gold)]" aria-label={`${r.name} booked`} checked={!!event.vendors?.[r.id]} onChange={(e) => update({ vendors: { ...event.vendors, [r.id]: e.target.checked } })} />
                  )}
                </td>
                <td className="p-3">
                  {r.id === "other" ? r.name : <a href={`/vendor-guide#${r.id}`} className="hover:text-gold">{r.name}</a>}
                  {r.essential && <span className="badge ml-2">Essential</span>}
                </td>
                <td className="p-2"><input inputMode="numeric" aria-label={`${r.name} estimate`} className="field w-28" placeholder="$" value={costs[r.id]?.est ?? ""} onChange={(e) => setCost(r.id, "est", e.target.value)} /></td>
                <td className="p-2"><input inputMode="numeric" aria-label={`${r.name} paid`} className="field w-28" placeholder="$" value={costs[r.id]?.paid ?? ""} onChange={(e) => setCost(r.id, "paid", e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-line font-medium">
            <tr>
              <td className="p-3" colSpan={2}>
                Total
                {t.left !== undefined && <span className={`ml-3 text-sm font-normal ${t.left < 0 ? "text-rose" : "text-muted"}`}>{t.left < 0 ? `${usd0(-t.left)} over budget` : `${usd0(t.left)} left to plan`}</span>}
              </td>
              <td className="p-3">{usd0(t.est)}</td>
              <td className="p-3">{usd0(t.paid)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="hint mt-3">Amounts stay on this device and aren&apos;t included in share links. For rentals, <Link href={`/quote?event=${event.type}&from=my-events-budget`} className="link">get a free itemized quote</Link> to fill in that line.</p>
    </section>
  );
}

// Images the visitor hearted in the gallery (and anywhere else SaveIdea appears).
function IdeaBoard() {
  const ideas = parseIdeas(useSyncExternalStore(subscribeIdeas, readIdeasRaw, () => "[]"));
  return (
    <section className="mt-10" aria-labelledby="ib-title">
      <h2 id="ib-title" className="display-3">Saved ideas</h2>
      {ideas.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ideas.map((i) => (
            <li key={i.src} className="group relative">
              <Image src={i.src} alt={i.alt} width={400} height={400} sizes="(max-width: 640px) 50vw, 20vw" className="aspect-square w-full rounded-xl object-cover" />
              <button
                className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white opacity-90 hover:bg-black/70 print:hidden"
                aria-label={`Remove ${i.caption}`}
                onClick={() => writeIdeas(ideas.filter((x) => x.src !== i.src))}
              >
                <Icon name="close" size={14} />
              </button>
              <p className="mt-2 text-sm leading-5">{i.href ? <Link href={i.href} className="hover:text-gold">{i.caption}</Link> : i.caption}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-muted">
          Tap the heart on any picture in the <Link href="/gallery" className="link">gallery</Link> to collect chairs, tables and setups you love here.
        </p>
      )}
    </section>
  );
}
