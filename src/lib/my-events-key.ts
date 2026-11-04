// The tiny bits of src/lib/my-events.ts that the header needs on every page. Kept apart so the header's
// countdown link doesn't pull the whole planner data (src/lib/event-plan.ts) into every page's JavaScript.

export const EVENTS_KEY = "bc-events-v1";

export function daysUntil(iso?: string, today = new Date()) {
  if (!iso) return undefined;
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const d = new Date(`${iso}T00:00:00`).getTime();
  return Math.round((d - t) / 864e5);
}
