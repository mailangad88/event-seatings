// "My events": event plans saved on the visitor's device (localStorage), so people can come back to a
// countdown, a personalised checklist and calendar reminders without an account.
// Pure helpers only (no React), shared by the dashboard and its tests.
import { plannerEvents, timeline, type PlanInput, type SettingId, type StyleId } from "./event-plan";

export const EVENTS_KEY = "bc-events-v1";
export const PLANNER_KEY = "bc-planner-v1"; // written by the /quote planner (EventPlanner.tsx)

export type SavedEvent = {
  id: string;
  name: string; // "Priya & Sam's wedding"
  type: string; // plannerEvents id
  date?: string; // YYYY-MM-DD
  guests: number;
  setting: SettingId;
  style: StyleId;
  done: Record<string, boolean>; // checklist task key -> ticked
  notes?: string;
  budget?: number; // overall rentals budget the host set, USD
  created: string; // ISO
};

export const newId = () => Math.random().toString(36).slice(2, 10);

export function blankEvent(type = "wedding"): SavedEvent {
  const ev = plannerEvents.find((e) => e.id === type) ?? plannerEvents[0];
  return { id: newId(), name: `My ${ev.name.toLowerCase()}`, type: ev.id, guests: ev.defaultGuests, setting: "venue", style: "classic", done: {}, created: new Date().toISOString() };
}

export function planInput(e: SavedEvent): PlanInput {
  const ev = plannerEvents.find((p) => p.id === e.type) ?? plannerEvents[0];
  return { event: ev.id, guests: e.guests, style: e.style, setting: e.setting, extras: ev.extras, date: e.date };
}

export const taskKey = (stepIndex: number, task: string) => `${stepIndex}:${task.slice(0, 60)}`;

export type ChecklistStep = { when: string; date?: string; iso?: string; tasks: { key: string; text: string }[] };

// Same milestones as the /quote planner, so the two never disagree.
export function checklist(e: SavedEvent, today = new Date()): ChecklistStep[] {
  const steps = timeline(planInput(e), today);
  const offsets = milestoneOffsets(e);
  return steps.map((s, i) => ({
    when: s.when,
    date: s.date,
    iso: e.date ? shiftDays(e.date, offsets[i] ?? 0) : undefined,
    tasks: s.tasks.map((t) => ({ key: taskKey(i, t), text: t })),
  }));
}

// Day offsets of each timeline() step, in order (kept in step with event-plan.ts).
function milestoneOffsets(e: SavedEvent) {
  const ev = plannerEvents.find((p) => p.id === e.type) ?? plannerEvents[0];
  return [-30 * Math.max(ev.leadMonths, 3), -60, -30, -14, -7, -1, 0];
}

export function shiftDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(iso?: string, today = new Date()) {
  if (!iso) return undefined;
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const d = new Date(`${iso}T00:00:00`).getTime();
  return Math.round((d - t) / 864e5);
}

export function progress(e: SavedEvent, steps = checklist(e)) {
  const all = steps.flatMap((s) => s.tasks);
  const done = all.filter((t) => e.done[t.key]).length;
  return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
}

// The open tasks whose milestone has arrived (or the next milestone if none has).
export function nextUp(e: SavedEvent, today = new Date(), steps = checklist(e, today)) {
  const todayIso = today.toISOString().slice(0, 10);
  const open = steps.map((s) => ({ ...s, tasks: s.tasks.filter((t) => !e.done[t.key]) })).filter((s) => s.tasks.length);
  const due = open.filter((s) => !s.iso || s.iso <= todayIso);
  return (due.length ? due : open.slice(0, 1)).flatMap((s) => s.tasks.map((t) => ({ ...t, when: s.when }))).slice(0, 4);
}

// ---- Calendar export (.ics) -------------------------------------------------------------------

const icsEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const icsDate = (iso: string) => iso.replace(/-/g, "");
const fold = (line: string) => (line.length <= 74 ? line : line.match(/.{1,74}/g)!.join("\r\n "));

export function eventIcs(e: SavedEvent, site: { name: string; url: string }, today = new Date()) {
  if (!e.date) return undefined;
  const stamp = today.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const todayIso = today.toISOString().slice(0, 10);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${site.name}//My events//EN`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const s of checklist(e, today)) {
    if (!s.iso || (s.iso < todayIso && s.when !== "Event day")) continue;
    const isDay = s.iso === e.date;
    const end = shiftDays(s.iso, 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}-${s.iso}@${new URL(site.url).host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(s.iso)}`,
      `DTEND;VALUE=DATE:${icsDate(end)}`,
      fold(`SUMMARY:${icsEscape(isDay ? `${e.name}: event day` : `${e.name}: ${s.when.replace(/ \(do now\)$/, "")} to-dos`)}`),
      fold(`DESCRIPTION:${icsEscape(s.tasks.map((t) => `- ${t.text}`).join("\n") + `\n\nYour checklist: ${site.url}/my-events`)}`),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-PT15H",
      fold(`DESCRIPTION:${icsEscape(`${e.name}: ${s.tasks[0]?.text ?? "event to-dos"}`)}`),
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// ---- Share link -------------------------------------------------------------------------------
// A plan travels in the URL (no server), so a partner, parent or planner can open the same checklist.

type Shared = Pick<SavedEvent, "name" | "type" | "date" | "guests" | "setting" | "style"> & { d?: string[] };

export function shareParam(e: SavedEvent) {
  const s: Shared = { name: e.name, type: e.type, date: e.date, guests: e.guests, setting: e.setting, style: e.style, d: Object.keys(e.done).filter((k) => e.done[k]) };
  return toB64(JSON.stringify(s));
}

export function fromShareParam(p: string): SavedEvent | undefined {
  try {
    const s = JSON.parse(fromB64(p)) as Shared;
    if (!s || typeof s.name !== "string" || !plannerEvents.some((e) => e.id === s.type)) return undefined;
    const guests = Math.max(1, Math.min(5000, Math.round(Number(s.guests) || 0)));
    const date = typeof s.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s.date) ? s.date : undefined;
    const setting = (["venue", "backyard", "tent", "park"] as const).find((x) => x === s.setting) ?? "venue";
    const style = (["simple", "classic", "lavish"] as const).find((x) => x === s.style) ?? "classic";
    const done = Object.fromEntries((Array.isArray(s.d) ? s.d : []).filter((k) => typeof k === "string").slice(0, 200).map((k) => [k, true]));
    return { id: newId(), name: s.name.slice(0, 80), type: s.type, date, guests, setting, style, done, created: new Date().toISOString() };
  } catch {
    return undefined;
  }
}

const toB64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)));

// ---- Import from the /quote planner -----------------------------------------------------------

export function fromPlannerStore(raw: string | null): SavedEvent | undefined {
  try {
    const v = JSON.parse(raw ?? "null");
    const a = v?.a;
    if (!a?.event || !plannerEvents.some((e) => e.id === a.event)) return undefined;
    const ev = plannerEvents.find((e) => e.id === a.event)!;
    const date = a.date || (a.month ? `${a.month}-15` : undefined);
    return {
      ...blankEvent(ev.id),
      name: `My ${ev.name.toLowerCase()}`,
      guests: Number(a.guests) || ev.defaultGuests,
      setting: a.setting ?? "venue",
      style: a.style ?? "classic",
      date: typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
    };
  } catch {
    return undefined;
  }
}
