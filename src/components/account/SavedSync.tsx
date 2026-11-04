"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import { syncSaved } from "@/app/account/actions";
import { EVENTS_KEY, daysUntil, type SavedEvent } from "@/lib/my-events";
import { parseIdeas, readIdeasRaw, subscribeIdeas, writeIdeas } from "@/components/myevents/ideas-store";

const readEvents = (): SavedEvent[] => {
  try {
    const v = JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

// Set after this device's first sync with the signed-in account (see syncSaved).
const SYNCED_KEY = "bc-account-synced";
const syncedBefore = (email: string) => {
  try {
    return localStorage.getItem(SYNCED_KEY) === email;
  } catch {
    return false;
  }
};

const fmt = (d?: string) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "No date yet");

// Plans from My events and the idea board, copied to the account so they're on every device the renter signs in on.
export function SavedSync({ sample, email }: { sample: boolean; email: string }) {
  const ideas = parseIdeas(useSyncExternalStore(subscribeIdeas, readIdeasRaw, () => "[]"));
  const [plans, setPlans] = useState<SavedEvent[] | null>(null);
  const [state, setState] = useState<"syncing" | "synced" | "local" | "error">("syncing");

  useEffect(() => {
    let live = true;
    const local = { events: readEvents(), ideas: parseIdeas(readIdeasRaw()) };
    syncSaved(local, syncedBefore(email))
      .then((r) => {
        if (!live) return;
        if (r.ok) {
          try {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(r.events));
            localStorage.setItem(SYNCED_KEY, email);
          } catch {}
          writeIdeas(parseIdeas(JSON.stringify(r.ideas)));
          setPlans(r.events as SavedEvent[]);
          setState("synced");
        } else {
          setPlans(local.events);
          setState("local");
        }
      })
      .catch(() => {
        if (!live) return;
        setPlans(local.events);
        setState("error");
      });
    return () => {
      live = false;
    };
  }, [email]);

  const removeIdea = (src: string) => {
    const next = ideas.filter((x) => x.src !== src);
    writeIdeas(next);
    if (state === "synced") syncSaved({ events: readEvents(), ideas: next }, true).catch(() => {});
  };

  const note = {
    syncing: "Copying your plans and ideas to your account…",
    synced: "Saved to your account. Sign in on another phone or computer and they'll be there too.",
    local: sample ? "The sample account doesn't save anything. These are the plans and ideas on this device." : "These are on this device only.",
    error: "We couldn't reach your account just now. These are the plans and ideas on this device.",
  }[state];

  return (
    <div className="space-y-6">
      <p className={`flex items-center gap-2 text-sm ${state === "synced" ? "text-green" : "text-muted"}`}>
        <Icon name={state === "synced" ? "check" : "info"} size={16} /> {note}
      </p>

      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Event plans</h2>
          <Link href="/my-events" className="text-sm font-medium text-accent">Open My events →</Link>
        </div>
        {plans === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : plans.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {plans.map((p) => {
              const d = daysUntil(p.date);
              return (
                <li key={p.id}>
                  <Link href="/my-events" className="card-hover flex items-center gap-3 rounded-xl border border-line p-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-blue-soft text-blue"><Icon name="calendar" size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.name}</span>
                      <span className="block text-xs text-muted">{fmt(p.date)} · {p.guests} guests</span>
                    </span>
                    {d !== undefined && d >= 0 && <span className="badge-blue">{d === 0 ? "Today" : `${d} days`}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            No plans yet. <Link href="/my-events" className="link">Start one in My events</Link> for a countdown and a checklist built from your date.
          </p>
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Saved ideas</h2>
          <Link href="/ideas" className="text-sm font-medium text-accent">Find more ideas →</Link>
        </div>
        {ideas.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {ideas.map((i) => (
              <li key={i.src} className="group relative">
                <Image src={i.src} alt={i.alt} width={400} height={400} sizes="(max-width: 640px) 50vw, 20vw" className="aspect-square w-full rounded-xl object-cover" />
                <p className="mt-1.5 line-clamp-2 text-xs text-muted">{i.href ? <Link href={i.href} className="hover:text-accent">{i.caption}</Link> : i.caption}</p>
                <button
                  type="button"
                  onClick={() => removeIdea(i.src)}
                  aria-label={`Remove "${i.caption}"`}
                  className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-surface/90 text-ink shadow-soft hover:text-rose"
                >
                  <Icon name="close" size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Tap the heart on any photo around the site and it saves here.</p>
        )}
      </section>
    </div>
  );
}
