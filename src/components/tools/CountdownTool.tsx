"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { attributionFields } from "@/lib/attribution";
import { track, trackLead } from "@/lib/analytics";
import { buildTimeline, downloadFile, timelineEvents, toICS, toISO } from "@/lib/tools/timeline";
import { useUrlState } from "./controls";

const subscribe = () => () => {};

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Reminders({ date, event, name }: { date: string; event: string; name: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...attributionFields(),
        ...data,
        kind: "waitlist",
        source: `countdown:${event}`,
        event_date: date,
        event_type: event,
        message: name ? `Countdown: ${name}` : undefined,
      }),
    }).catch(() => null);
    if (res?.ok) {
      trackLead("waitlist", `countdown:${event}`);
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }
  if (status === "done") return <p className="font-serif text-xl">You&apos;re signed up. We&apos;ll email your milestones once reminders start.</p>;
  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
        <label className="sr-only" htmlFor="cd-name">First name</label>
        <input id="cd-name" name="name" autoComplete="given-name" placeholder="First name" className="field" />
        <label className="sr-only" htmlFor="cd-email">Email</label>
        <input id="cd-email" name="email" type="email" required autoComplete="email" placeholder="Email address" className="field" />
        <button className="btn-accent" disabled={status === "sending"}>{status === "sending" ? "Saving…" : "Remind me"}</button>
      </div>
      {status === "error" && <p className="text-sm text-rose">{error}</p>}
      <p className="text-xs leading-5 text-muted">
        Milestone reminder emails are starting soon. Sign up now and we&apos;ll email you before each deadline once they start. See our <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
    </form>
  );
}

export function CountdownTool({ available }: { available: string[] }) {
  const today = useSyncExternalStore(subscribe, () => toISO(new Date()), () => "");
  const now = useNow();
  const [s, set] = useUrlState({ d: "", n: "", t: "wedding", time: "17:00" });
  const avail = useMemo(() => new Set(available), [available]);
  const ev = timelineEvents.find((e) => e.id === s.t) ?? timelineEvents[0];
  const name = s.n || `Our ${ev.label.split(",")[0].toLowerCase()}`;
  const target = s.d ? new Date(`${s.d}T${/^\d{2}:\d{2}$/.test(s.time) ? s.time : "17:00"}:00`).getTime() : NaN;
  const left = now && Number.isFinite(target) ? Math.max(0, target - now) : 0;
  const parts = [
    ["Days", Math.floor(left / 86_400_000)],
    ["Hours", Math.floor(left / 3_600_000) % 24],
    ["Minutes", Math.floor(left / 60_000) % 60],
    ["Seconds", Math.floor(left / 1000) % 60],
  ] as const;
  const tl = useMemo(() => (today && s.d ? buildTimeline({ event: s.t, date: s.d, today, outdoor: ev.outdoorDefault, available: avail }) : null), [s.d, s.t, today, ev.outdoorDefault, avail]);
  // Late tasks are already moved to today, so the next deadlines always start with what to do now.
  const upcoming = tl?.tasks.filter((t) => t.date >= today).slice(0, 4) ?? [];
  const fmt = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-10">
      <div className="card grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr]">
        <div>
          <label htmlFor="cd-n" className="label">Event name</label>
          <input id="cd-n" className="field" maxLength={60} placeholder="Maya and Sam's wedding" value={s.n} onChange={(e) => set({ n: e.target.value })} />
        </div>
        <div>
          <label htmlFor="cd-d" className="label">Date</label>
          <input id="cd-d" type="date" className="field" min={today || undefined} value={s.d} onChange={(e) => set({ d: e.target.value })} />
        </div>
        <div>
          <label htmlFor="cd-t" className="label">Event</label>
          <select id="cd-t" className="field" value={s.t} onChange={(e) => set({ t: e.target.value })}>
            {timelineEvents.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cd-time" className="label">Start time</label>
          <input id="cd-time" type="time" className="field" value={s.time} onChange={(e) => set({ time: e.target.value })} />
        </div>
      </div>

      {!s.d ? (
        <div className="well grid min-h-48 place-items-center p-10 text-center">
          <p className="max-w-md text-muted">Pick a date to start your countdown. You&apos;ll get a page you can share with family and friends, and your next planning deadlines.</p>
        </div>
      ) : (
        <>
          <section aria-labelledby="cd-title" className="tone-dark overflow-hidden rounded-3xl bg-espresso p-8 text-center sm:p-14">
            <p className="eyebrow justify-center">Counting down to</p>
            <h2 id="cd-title" className="display-2 mt-3">{name}</h2>
            <p className="mt-2 text-ink/80">{new Date(`${s.d}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}</p>
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-4 gap-3 sm:gap-6" role="timer" aria-live="off">
              {parts.map(([label, n]) => (
                <div key={label} className="rounded-2xl border border-ink/15 p-3 sm:p-5">
                  <p className="font-serif text-4xl tabular-nums sm:text-6xl">{now === null ? "–" : n}</p>
                  <p className="mt-1 text-xs tracking-[0.2em] text-ink/70 uppercase">{label}</p>
                </div>
              ))}
            </div>
            {now !== null && left === 0 && <p className="mt-8 font-serif text-2xl">{tl?.past ? "This date has passed. Pick a new date to start a new countdown." : "It's here. Have a wonderful day."}</p>}
            <div className="mt-10 flex flex-wrap justify-center gap-3 print:hidden">
              <button
                type="button"
                className="btn-accent"
                onClick={async () => {
                  await navigator.clipboard?.writeText(window.location.href).catch(() => {});
                  setCopied(true);
                  track("tool_share", { tool: "countdown" });
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Link copied" : "Share this countdown"}
              </button>
              <button
                type="button"
                className="btn border border-ink/25 text-ink hover:bg-ink hover:text-bg"
                onClick={() => {
                  const items = [...(tl?.tasks ?? [])];
                  downloadFile(`${name.replace(/[^\w]+/g, "-").toLowerCase()}.ics`, toICS(name, items, window.location.href), "text/calendar");
                  track("tool_calendar_download", { tool: "countdown" });
                }}
              >
                Add date and deadlines to calendar
              </button>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <section aria-labelledby="cd-next" className="card p-6 sm:p-8">
              <h2 id="cd-next" className="display-3">Your next deadlines</h2>
              {upcoming.length ? (
                <ol className="mt-5 space-y-4">
                  {upcoming.map((t) => (
                    <li key={t.id} className="flex gap-4">
                      <span className="w-24 shrink-0 text-sm font-medium text-gold">{t.date === today ? "Today" : fmt(t.date)}</span>
                      <span>
                        <span className="font-medium">{t.title}</span>
                        {t.href && (
                          <>
                            {" "}
                            <Link href={t.href} className="text-sm link">Tool</Link>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-muted">{tl?.past ? "This date has passed." : "No deadlines left before the day."}</p>
              )}
              <Link href={`/tools/timeline?event=${s.t}&date=${s.d}${s.n ? `&name=${encodeURIComponent(s.n)}` : ""}`} className="mt-6 inline-block link">See the full timeline</Link>
            </section>
            <section aria-labelledby="cd-remind" className="card p-6 sm:p-8">
              <h2 id="cd-remind" className="display-3">Get milestone reminders</h2>
              <p className="mt-2 text-sm text-muted">A short email before each big deadline: venue, rentals, invitations, final counts and the weather call.</p>
              <div className="mt-5">
                <Reminders date={s.d} event={s.t} name={s.n} />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
