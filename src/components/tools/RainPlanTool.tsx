"use client";

import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { parseISO, toISO } from "@/lib/tools/timeline";
import { NumberField, ShareBar, ToolFrame, useUrlState } from "./controls";

export type RainSection = { id: string; title: string; items: { id: string; text: string; href?: string }[] };

const KEY = "bc-rain-plan";

export function RainPlanTool({ sections, eventDateHref }: { sections: RainSection[]; eventDateHref?: string }) {
  const [s, set] = useUrlState({ date: "", lead: 3, tentLead: 14 });
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      // Restoring saved ticks from this browser once on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved)) setDone(saved.filter((x) => typeof x === "string"));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const all = sections.flatMap((x) => x.items);
  const pct = Math.round((all.filter((i) => done.includes(i.id)).length / all.length) * 100);
  const date = parseISO(s.date);
  const minus = (days: number) => (date ? new Date(date.getTime() - days * 86_400_000) : undefined);
  const fmt = (d?: Date) => (d ? d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }) : "—");

  return (
    <ToolFrame
      inputs={
        <>
          <div>
            <label htmlFor="rp-date" className="label">Event date</label>
            <input id="rp-date" type="date" className="field" value={s.date} min={toISO(new Date())} onChange={(e) => set({ date: e.target.value })} />
          </div>
          <NumberField id="rp-lead" label="Make the weather call this many days before" suffix="days" min={1} max={14} value={s.lead} onChange={(n) => set({ lead: n })} hint="Ask your rental company how late they can add sidewalls or heaters." />
          <NumberField id="rp-tent" label="Tent decision needed this many days before" suffix="days" min={1} max={120} value={s.tentLead} onChange={(n) => set({ tentLead: n })} hint="If you might want a tent only in bad weather, ask the rental company for their cut-off." />
          <div className="rounded-2xl bg-surface-2 p-5">
            <p className="text-sm font-medium">Your key dates</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Reserve the tent or backup space by</dt><dd className="font-medium">{fmt(minus(s.tentLead))}</dd></div>
              <div className="flex justify-between"><dt>Weather call</dt><dd className="font-medium">{fmt(minus(s.lead))}</dd></div>
              <div className="flex justify-between"><dt>Tell guests if the plan changes</dt><dd className="font-medium">{fmt(minus(Math.max(1, s.lead - 1)))}</dd></div>
            </dl>
            {date && eventDateHref && (
              <p className="mt-3 text-sm">
                <Link href={`${eventDateHref}?date=${s.date}`} className="link">Check the usual weather and sunset for this date</Link>
              </p>
            )}
          </div>
        </>
      }
      results={
        <div>
          <div className="flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Rain plan progress">
              <div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-heading font-semibold text-2xl tabular-nums">{pct}%</span>
          </div>
          <div className="mt-6 space-y-5">
            {sections.map((sec) => (
              <fieldset key={sec.id} className="rounded-2xl border border-line bg-surface p-5">
                <legend className="px-1 text-sm font-medium">{sec.title}</legend>
                <ul className="space-y-2">
                  {sec.items.map((i) => (
                    <li key={i.id}>
                      <label className="flex cursor-pointer gap-3 text-sm leading-6">
                        <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--gold)]" checked={done.includes(i.id)} onChange={() => toggle(i.id)} />
                        <span className={done.includes(i.id) ? "text-muted line-through" : ""}>
                          {i.text}
                          {i.href && (
                            <>
                              {" "}
                              <Link href={i.href} className="link text-gold">Tool</Link>
                            </>
                          )}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">Ticks are saved in this browser only.</p>
          <ShareBar tool="rain-plan" quoteHref="/quote?items=frame-tent-20x40,tent-sidewall&from=tool-rain-plan" />
        </div>
      }
    />
  );
}
