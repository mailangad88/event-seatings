"use client";

import { useEffect, useState } from "react";
import { extras as extraOptions, plannerEvents, recommend, settings, styles, type ExtraId, type PlanInput, type SettingId, type StyleId } from "@/lib/event-plan";
import { Choice, NumberField, PriceLines, ShareBar, Stat, Toggles, useUrlState, type ToolPrice } from "./controls";

type Status = "need" | "have" | "venue";
const KEY = "bc-needs-status";
const PLANNER = "bc-planner-v2";

const statusLabel: Record<Status, string> = { need: "Need it", have: "Have it", venue: "Venue provides" };

export function NeedsTool({ prices }: { prices: Record<string, ToolPrice> }) {
  const [s, set] = useUrlState({ event: "wedding", guests: 120, style: "classic", setting: "venue", extras: ["ceremony", "dancing", "bar"] });
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [fromPlanner, setFromPlanner] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      // Restoring this browser's saved answers once on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && typeof saved === "object") setStatus(saved);
      // Start from the planner's answers when the visitor used /quote on this device and the URL has none.
      if (!window.location.search) {
        const a = JSON.parse(localStorage.getItem(PLANNER) ?? "null")?.a;
        if (a?.event) {
          set({ event: a.event, guests: a.guests || 100, style: a.style ?? "classic", setting: a.setting ?? "venue", extras: Array.isArray(a.extras) ? a.extras : [] });
          setFromPlanner(true);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mark = (id: string, st: Status) => {
    const next = { ...status, [id]: st };
    setStatus(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const input: PlanInput = { event: s.event, guests: s.guests, style: s.style as StyleId, setting: s.setting as SettingId, extras: s.extras as ExtraId[] };
  const lines = recommend(input);
  const groups = [...new Set(lines.map((l) => l.group))];
  const need = lines.filter((l) => (status[l.id] ?? "need") === "need");
  const done = lines.length - need.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
      <div className="card space-y-7 self-start p-6 sm:p-8 lg:sticky lg:top-24">
        {fromPlanner && <p className="rounded-xl bg-gold-soft p-3 text-sm">We started from the answers you gave in the planner on this device.</p>}
        <Choice label="Event" value={s.event} options={plannerEvents.map((e) => ({ id: e.id, label: e.name }))} onChange={(k) => set({ event: k, extras: plannerEvents.find((e) => e.id === k)?.extras ?? [] })} />
        <NumberField id="nd-guests" label="Guests" value={s.guests} onChange={(n) => set({ guests: n })} max={3000} step={5} />
        <Choice label="Where" value={s.setting} options={settings.map((x) => ({ id: x.id, label: x.name }))} onChange={(k) => set({ setting: k })} />
        <Choice label="Style" value={s.style} options={styles.map((x) => ({ id: x.id, label: x.name }))} onChange={(k) => set({ style: k })} />
        <Toggles label="Parts of the day" value={s.extras} options={extraOptions.map((x) => ({ id: x.id, label: x.name }))} onChange={(v) => set({ extras: v })} />
      </div>

      <div aria-live="polite">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat big value={lines.length} label="Things events like this use" />
          <Stat big value={done} label="Sorted" note="You have it or the venue provides it" />
          <Stat big value={need.length} label="Still to rent" />
        </div>
        <div className="mt-6 space-y-5">
          {groups.map((g) => (
            <section key={g} className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="text-sm font-medium">{g}</h3>
              <ul className="mt-3 divide-y divide-line">
                {lines.filter((l) => l.group === g).map((l) => {
                  const st = status[l.id] ?? "need";
                  return (
                    <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className={st === "need" ? "" : "text-muted line-through"}>
                        <p className="text-sm font-medium">{l.qty} × {prices[l.id]?.name ?? l.id.replace(/-/g, " ")}</p>
                        <p className="text-xs text-muted">{l.why}</p>
                      </div>
                      <div className="flex gap-1" role="group" aria-label={`Status for ${prices[l.id]?.name ?? l.id}`}>
                        {(Object.keys(statusLabel) as Status[]).map((k) => (
                          <button key={k} type="button" aria-pressed={st === k} onClick={() => mark(l.id, k)} className={`rounded-full border px-3 py-1 text-xs ${st === k ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-gold"}`}>
                            {statusLabel[k]}
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <PriceLines lines={need.map((l) => ({ id: l.id, qty: l.qty }))} prices={prices} />
        <ShareBar tool="what-do-i-need" quoteHref={`/quote?items=${need.map((l) => l.id).join(",")}&guests=${s.guests}&from=tool-what-do-i-need`} />
      </div>
    </div>
  );
}
