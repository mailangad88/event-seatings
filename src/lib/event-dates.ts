// Date helpers for event planning: holidays near a date, season, weekday, and an .ics calendar file.
// Pure functions, safe on the server and in the browser. All dates are "YYYY-MM-DD" in Chicago local time.

export type Holiday = { date: string; name: string };

const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

// Nth weekday of a month (weekday 0 = Sunday). n = -1 means the last one.
function nthWeekday(y: number, m: number, weekday: number, n: number) {
  if (n > 0) {
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    return ymd(y, m, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
  }
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const last = new Date(Date.UTC(y, m - 1, lastDay)).getUTCDay();
  return ymd(y, m, lastDay - ((last - weekday + 7) % 7));
}

// Western Easter (anonymous Gregorian algorithm).
function easter(y: number) {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(y, month, day);
}

/** US holidays and big celebration days that change rental demand, traffic and venue pricing. */
export function holidays(y: number): Holiday[] {
  return [
    { date: ymd(y, 1, 1), name: "New Year's Day" },
    { date: nthWeekday(y, 1, 1, 3), name: "Martin Luther King Jr. Day" },
    { date: ymd(y, 2, 14), name: "Valentine's Day" },
    { date: nthWeekday(y, 2, 1, 3), name: "Presidents' Day" },
    { date: ymd(y, 3, 17), name: "St. Patrick's Day" },
    { date: easter(y), name: "Easter Sunday" },
    { date: nthWeekday(y, 5, 0, 2), name: "Mother's Day" },
    { date: nthWeekday(y, 5, 1, -1), name: "Memorial Day" },
    { date: nthWeekday(y, 6, 0, 3), name: "Father's Day" },
    { date: ymd(y, 6, 19), name: "Juneteenth" },
    { date: ymd(y, 7, 4), name: "Independence Day" },
    { date: nthWeekday(y, 9, 1, 1), name: "Labor Day" },
    { date: nthWeekday(y, 10, 1, 2), name: "Columbus Day / Indigenous Peoples' Day" },
    { date: ymd(y, 10, 31), name: "Halloween" },
    { date: ymd(y, 11, 11), name: "Veterans Day" },
    { date: nthWeekday(y, 11, 4, 4), name: "Thanksgiving" },
    { date: ymd(y, 12, 24), name: "Christmas Eve" },
    { date: ymd(y, 12, 25), name: "Christmas Day" },
    { date: ymd(y, 12, 31), name: "New Year's Eve" },
  ];
}

const dayMs = 864e5;
const toUtc = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
export const daysBetween = (a: string, b: string) => Math.round((toUtc(b) - toUtc(a)) / dayMs);
export const addDays = (d: string, n: number) => new Date(toUtc(d) + n * dayMs).toISOString().slice(0, 10);

/** Holidays within `window` days either side of the date, nearest first. */
export function holidaysNear(date: string, window = 4): (Holiday & { offset: number })[] {
  const y = Number(date.slice(0, 4));
  return [...holidays(y - 1), ...holidays(y), ...holidays(y + 1)]
    .map((h) => ({ ...h, offset: daysBetween(date, h.date) }))
    .filter((h) => Math.abs(h.offset) <= window)
    .sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset));
}

export function weekday(date: string) {
  return new Date(toUtc(date)).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}

export function longDate(date: string) {
  return new Date(toUtc(date)).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function season(date: string): "winter" | "spring" | "summer" | "fall" {
  const m = Number(date.slice(5, 7));
  if (m === 12 || m <= 2) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "fall";
}

/** Today in Chicago as YYYY-MM-DD. */
export function todayChicago() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
}

/** An all-day calendar entry (.ics) for the event date. */
export function icsFile({ date, title, description, location, url }: { date: string; title: string; description?: string; location?: string; url?: string }) {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Beyond Chiavari//Event date//EN",
    "BEGIN:VEVENT",
    `UID:${date}-${Math.random().toString(36).slice(2)}@beyondchiavari.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${date.replace(/-/g, "")}`,
    `DTEND;VALUE=DATE:${addDays(date, 1).replace(/-/g, "")}`,
    `SUMMARY:${esc(title)}`,
    ...(description ? [`DESCRIPTION:${esc(description)}`] : []),
    ...(location ? [`LOCATION:${esc(location)}`] : []),
    ...(url ? [`URL:${url}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
