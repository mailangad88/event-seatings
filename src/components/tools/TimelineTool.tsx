"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { buildTimeline, downloadFile, timelineEvents, toICS, toISO } from "@/lib/tools/timeline";
import { Choice, ShareBar, Stat, useUrlState } from "./controls";

const subscribe = () => () => {};
const todayISO = () => toISO(new Date());

export function TimelineTool({ available }: { available: string[] }) {
  const today = useSyncExternalStore(subscribe, todayISO, () => "");
  const [s, set] = useUrlState({ event: "wedding", date: "", outdoor: false, name: "" });
  const avail = useMemo(() => new Set(available), [available]);
  const r = useMemo(() => (today && s.date ? buildTimeline({ event: s.event, date: s.date, today, outdoor: s.outdoor, available: avail }) : null), [s, today, avail]);
  const ev = timelineEvents.find((e) => e.id === s.event) ?? timelineEvents[0];
  const title = s.name || `Our ${ev.label.split(",")[0].toLowerCase()}`;
  const fmt = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const daysLeft = r && today ? Math.round((Date.parse(s.date) - Date.parse(today)) / 86_400_000) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
      <div className="card space-y-7 self-start p-6 sm:p-8 lg:sticky lg:top-24">
        <Choice label="What are you planning?" value={s.event} options={timelineEvents.map((e) => ({ id: e.id, label: e.label }))} onChange={(k) => set({ event: k, outdoor: timelineEvents.find((e) => e.id === k)?.outdoorDefault ?? false })} />
        <div>
          <label htmlFor="tl-date" className="label">Event date</label>
          <input id="tl-date" type="date" className="field" min={today || undefined} value={s.date} onChange={(e) => set({ date: e.target.value })} />
        </div>
        <div>
          <label htmlFor="tl-name" className="label">Name it (optional)</label>
          <input id="tl-name" className="field" maxLength={60} placeholder="Maya and Sam's wedding" value={s.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <Choice label="Any of it outdoors?" value={s.outdoor ? "yes" : "no"} options={[{ id: "no", label: "No, all indoors" }, { id: "yes", label: "Yes, some or all" }]} onChange={(k) => set({ outdoor: k === "yes" })} />
      </div>

      <div aria-live="polite">
        {r?.past ? (
          <div className="well grid min-h-64 place-items-center p-10 text-center">
            <p className="max-w-sm text-muted">This date has passed. Pick the new date if your event moved, and the timeline rebuilds from the days left.</p>
          </div>
        ) : !r ? (
          <div className="well grid min-h-64 place-items-center p-10 text-center">
            <p className="max-w-sm text-muted">Pick your event and date. Your timeline appears here with a real deadline for every task.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat big value={daysLeft} label="Days to go" />
              <Stat big value={r.tasks.length} label="Tasks" />
              <Stat big value={r.tasks.filter((t) => t.overdue).length} label="Late, do soon" note={r.compressed ? (r.until <= 21 ? "Short on time: anything already late moves to today or tomorrow, most important first" : "Short runway: tasks are squeezed into the time you have") : undefined} />
            </div>
            <ol className="relative mt-8 border-l border-gold/30 pl-6">
              {r.tasks.map((t) => (
                <li key={t.id} className="relative pb-7">
                  <span className={`absolute top-1.5 -left-[31px] h-3 w-3 rounded-full border-2 ${t.overdue ? "border-rose bg-rose" : t.days === 0 ? "border-gold bg-gold" : "border-gold bg-surface"}`} aria-hidden />
                  <p className="text-xs font-semibold tracking-wide text-gold uppercase">
                    {t.date === today ? "Today" : fmt(t.date)}
                    {t.overdue && <span className="ml-2 text-rose">{t.date === today ? "Do now" : "Catch up"}</span>}
                  </p>
                  <p className="mt-1 font-medium">{t.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-muted">{t.why}</p>
                  {t.href && (
                    <Link href={t.href.includes("?") || !s.date ? t.href : `${t.href}?date=${s.date}`} className="mt-1 inline-block text-sm link">
                      Open the tool
                    </Link>
                  )}
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-3 print:hidden">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  downloadFile(`${title.replace(/[^\w]+/g, "-").toLowerCase()}-timeline.ics`, toICS(title, r.tasks, window.location.href), "text/calendar");
                  track("tool_calendar_download", { tool: "timeline" });
                }}
              >
                Add all to my calendar
              </button>
            </div>
            <ShareBar tool="timeline" quoteHref={`/quote?from=tool-timeline`} />
          </>
        )}
      </div>
    </div>
  );
}
