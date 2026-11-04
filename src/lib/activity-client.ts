"use client";

import type { ActivityEvent } from "./activity";
import { trackingAllowed } from "./consent";

// Sends what a visitor does to /api/activity, but only once they've sent us a form with their email (so a
// reminder can reach them) and only while they haven't said no to tracking. Anonymous visitors send nothing.
// Events are batched and sent when the tab is hidden or every 15 seconds.

const KNOWN = "lead-known";
const VISITOR = "es_visitor";
// Omit for each kind of event separately (plain Omit on a union loses the fields of each kind).
type NewEvent = ActivityEvent extends infer E ? (E extends ActivityEvent ? Omit<E, "at" | "path"> & { path?: string } : never) : never;
const queue: ActivityEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let listening = false;

function storage() {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function visitorIdForLead(): string | undefined {
  try {
    return storage()?.getItem(VISITOR) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Called after a form with an email was saved: from now on this browser's activity is sent. */
export function markKnownVisitor() {
  try {
    storage()?.setItem(KNOWN, new Date().toISOString());
  } catch {}
}

export function isKnownVisitor() {
  try {
    return Boolean(storage()?.getItem(KNOWN));
  } catch {
    return false;
  }
}

function flush() {
  if (timer) clearTimeout(timer);
  timer = undefined;
  const visitor = visitorIdForLead();
  if (!queue.length || !visitor) return;
  const body = JSON.stringify({ visitor, events: queue.splice(0, 40) });
  try {
    if (!navigator.sendBeacon?.("/api/activity", new Blob([body], { type: "application/json" }))) {
      fetch("/api/activity", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {}
  if (queue.length) timer = setTimeout(flush, 1000);
}

/** Records one thing the visitor did. Does nothing for anonymous visitors or if they said no to tracking. */
export function trackActivity(event: NewEvent) {
  if (typeof window === "undefined" || !isKnownVisitor() || !trackingAllowed() || navigator.webdriver) return;
  if (!listening) {
    listening = true;
    document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
    window.addEventListener("pagehide", flush);
  }
  queue.push({ ...event, path: event.path ?? window.location.pathname, at: new Date().toISOString() } as ActivityEvent);
  if (queue.length >= 20) flush();
  else timer ??= setTimeout(flush, 15_000);
}
