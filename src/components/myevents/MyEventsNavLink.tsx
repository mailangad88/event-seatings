"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { EVENTS_KEY, daysUntil } from "@/lib/my-events";

// Header link to /my-events that shows the countdown to the visitor's next saved event, so a return
// visit opens with "My events · 42 days". Reads the same browser storage as the dashboard.
const noop = () => () => {};
function nextCountdown() {
  try {
    const list = JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "[]") as { date?: string }[];
    const days = list.map((e) => daysUntil(e.date)).filter((d): d is number => d !== undefined && d >= 0);
    return days.length ? Math.min(...days) : -1;
  } catch {
    return -1;
  }
}

export function MyEventsNavLink({ className, label }: { className?: string; label: string }) {
  const days = useSyncExternalStore(noop, nextCountdown, () => -1);
  return (
    <Link href="/my-events" className={className}>
      {label}
      {days >= 0 && (
        <span className="ml-1.5 rounded-full bg-wine-soft px-2 py-0.5 text-[11px] font-semibold text-wine" aria-label={`${days} days to your next event`}>
          {days === 0 ? "today" : `${days}d`}
        </span>
      )}
    </Link>
  );
}
