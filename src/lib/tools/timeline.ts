// Backward planning timeline: shared by /tools/timeline and /countdown.
// Lead times are planning guidance, not rules: the page says so and every date can be moved.

export type TimelineEvent = { id: string; label: string; runwayDays: number; outdoorDefault: boolean };

export const timelineEvents: TimelineEvent[] = [
  { id: "wedding", label: "Wedding", runwayDays: 365, outdoorDefault: false },
  { id: "milestone", label: "Quinceañera, bar or bat mitzvah, big milestone", runwayDays: 180, outdoorDefault: false },
  { id: "corporate", label: "Corporate event or gala", runwayDays: 120, outdoorDefault: false },
  { id: "graduation", label: "Graduation party", runwayDays: 60, outdoorDefault: true },
  { id: "birthday", label: "Birthday or anniversary party", runwayDays: 56, outdoorDefault: false },
  { id: "backyard", label: "Backyard party or BBQ", runwayDays: 42, outdoorDefault: true },
  { id: "shower", label: "Baby or bridal shower", runwayDays: 42, outdoorDefault: false },
];

export type Task = {
  id: string;
  title: string;
  why: string;
  href?: string;
  /** Fraction of the runway before the event (1 = the start). */
  frac?: number;
  /** Or a fixed number of days before the event (negative = after). */
  days?: number;
  only?: string[];
  outdoor?: boolean;
};

export const tasks: Task[] = [
  { id: "budget", title: "Set a budget and a rough guest count", why: "Every other decision depends on these two numbers.", href: "/tools/budget-splitter", frac: 1 },
  { id: "date", title: "Check your date: weather, sunset and holidays", why: "Know what the light and the weather usually do on your date.", href: "/tools/event-date", frac: 0.97 },
  { id: "venue", title: "Book the venue or confirm your space", why: "Popular dates go first. Check the room fits your guests.", href: "/tools/venue-capacity", frac: 0.92 },
  { id: "guests", title: "Estimate how many guests will come", why: "Order chairs and food for the people who will actually attend.", href: "/tools/guest-count", frac: 0.88 },
  { id: "catering", title: "Book catering", why: "Caterers set the service style, which decides tables, linens and tableware.", frac: 0.8, only: ["wedding", "milestone", "corporate", "graduation", "birthday"] },
  { id: "vendors", title: "Book photo, music and entertainment", why: "The best people book out early for peak weekends.", frac: 0.75, only: ["wedding", "milestone", "corporate"] },
  { id: "rentals", title: "Get a rental quote: chairs, tables, linens, tent", why: "Reserve rental stock for your date while the styles you want are free.", href: "/quote", frac: 0.7 },
  { id: "tent", title: "Size the tent and decide your rain plan", why: "A tent is the biggest rental and the first to sell out on summer weekends.", href: "/tools/tent-size", frac: 0.62, outdoor: true },
  { id: "permits", title: "Ask about permits for parks, streets or tents", why: "Parks, block parties and large tents can need permits. Lead times vary, so ask now.", frac: 0.6, outdoor: true },
  { id: "save", title: "Send save-the-dates", why: "Gives out-of-town guests time to plan travel.", frac: 0.6, only: ["wedding", "milestone"] },
  { id: "invites", title: "Send invitations", why: "Leaves time for RSVPs before your final count is due.", frac: 0.35 },
  { id: "decor", title: "Choose linens, lighting and decor", why: "Lock colours and sizes while stock is available.", href: "/tools/linens", frac: 0.4 },
  { id: "lighting", title: "Plan lighting for after sunset", why: "String lights and uplights change the room once the sun goes down.", href: "/tools/lighting", frac: 0.35 },
  { id: "layout", title: "Sketch the floor plan", why: "Check tables, dance floor, bar and buffet all fit with room to walk.", href: "/tools/floor-plan", frac: 0.2 },
  { id: "rsvp", title: "RSVP deadline", why: "You need a real count before the final numbers are due.", days: 21 },
  { id: "final", title: "Send final counts to caterer and rental company", why: "Many vendors want final numbers one to two weeks out. Ask yours for their exact deadline.", days: 14 },
  { id: "seating", title: "Finish the seating chart and place cards", why: "Leaves time to print and to handle late changes.", days: 10 },
  { id: "delivery", title: "Confirm delivery window, setup and venue access", why: "Make sure someone can let the rental crew in, and know when pickup is.", days: 7 },
  { id: "rain", title: "Make the weather call", why: "Use the forecast to decide on sidewalls, heaters or the indoor plan.", href: "/tools/rain-plan", days: 3, outdoor: true },
  { id: "walk", title: "Walk the space and check the delivery", why: "Count chairs and tables against your order before guests arrive.", days: 1 },
  { id: "event", title: "Event day", why: "Enjoy it. Keep one person in charge of vendors so you don't have to be.", days: 0 },
  { id: "return", title: "Stack rentals for pickup and check for damage", why: "Pickup windows and damage rules are in your rental agreement.", days: -1 },
];

export type DatedTask = Task & { date: string; overdue: boolean; daysBefore: number };

const DAY = 86_400_000;
export const toISO = (d: Date) => d.toISOString().slice(0, 10);
export const parseISO = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : undefined;
};

// When time is short, these come first among the things to do today.
const urgentFirst = ["rentals", "venue", "budget", "guests", "tent", "permits", "final"];
const urgency = (id: string) => (urgentFirst.includes(id) ? urgentFirst.indexOf(id) : urgentFirst.length);

export function buildTimeline(input: { event: string; date: string; today: string; outdoor: boolean; available?: Set<string> }): {
  tasks: DatedTask[];
  runway: number;
  compressed: boolean;
  /** Days from today to the event (negative = the date has passed). */
  until: number;
  past: boolean;
} {
  const ev = timelineEvents.find((e) => e.id === input.event) ?? timelineEvents[0];
  const date = parseISO(input.date);
  const today = parseISO(input.today) ?? new Date();
  if (!date) return { tasks: [], runway: 0, compressed: false, until: 0, past: false };
  const until = Math.round((date.getTime() - today.getTime()) / DAY);
  if (until < 0) return { tasks: [], runway: 0, compressed: false, until, past: true };
  const runway = Math.max(1, Math.min(ev.runwayDays, until));
  const compressed = until < ev.runwayDays;
  const list = tasks
    .filter((t) => !t.only || t.only.includes(ev.id))
    .filter((t) => !t.outdoor || input.outdoor)
    // Save-the-dates make no sense once invitations are due.
    .filter((t) => !(t.id === "save" && until < 60))
    // Links to tools that are not in this build are dropped; the task stays.
    .map((t) => (t.href && input.available && !input.available.has(t.href) ? { ...t, href: undefined } : t))
    .map((t) => shortNotice(t, until))
    .map((t) => {
      let daysBefore = t.days ?? Math.round((t.frac ?? 0) * runway);
      // Fractional tasks never land inside the last three weeks (fixed tasks own that stretch).
      if (t.days === undefined) daysBefore = Math.max(daysBefore, Math.min(runway, 22));
      // A deadline that is today or already passed is "do now", and never shows a past date.
      // With a few days to spare, only the urgent ones land today; the rest go to tomorrow.
      const overdue = daysBefore >= until && t.days !== 0 && until > 0;
      if (overdue) daysBefore = until > 3 && !urgentFirst.includes(t.id) ? until - 1 : until;
      const d = new Date(date.getTime() - daysBefore * DAY);
      return { ...t, daysBefore, date: toISO(d), overdue };
    })
    .sort((a, b) => b.daysBefore - a.daysBefore || urgency(a.id) - urgency(b.id));
  return { tasks: list, runway, compressed, until, past: false };
}

// Wording for a short runway: say what still works in the days that are left.
function shortNotice(t: Task, until: number): Task {
  if (until > 21) return t;
  const days = until === 1 ? "one day" : `${until} days`;
  switch (t.id) {
    case "rentals":
      return { ...t, title: "Send your rental list today", why: `With ${days} to go, ask what is still free for your date. Expect fewer styles to choose from, and call if it's this week.` };
    case "venue":
      return { ...t, title: "Confirm your space and what it already has", why: "Ask the venue which tables, chairs and linens they supply, so you only rent what's missing." };
    case "invites":
      return { ...t, title: "Send invitations now if they haven't gone out", why: "A text or e-invite is fine this close. Ask for a quick yes or no." };
    case "catering":
      return { ...t, title: "Book catering this week", why: "If your first choice is full, ask about drop-off trays, and confirm who brings plates and chafers." };
    case "tent":
      return { ...t, why: "Tents book out first. If none is free, plan on canopies or an indoor backup." };
    case "permits":
      return { ...t, title: "Ask about permits today", why: "Some permits take weeks. Ask what you can do without one, or pick a space that doesn't need it." };
    default:
      return t;
  }
}

/** An .ics calendar file with one all-day entry per task. */
export function toICS(name: string, items: { title: string; date: string; why: string }[], url: string) {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Beyond Chiavari//Event timeline//EN", "CALSCALE:GREGORIAN"];
  items.forEach((t, i) => {
    const d = t.date.replace(/-/g, "");
    const next = toISO(new Date((parseISO(t.date)?.getTime() ?? 0) + DAY)).replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${d}-${i}-${name.replace(/\W/g, "").slice(0, 20)}@beyondchiavari.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${next}`,
      `SUMMARY:${esc(`${name}: ${t.title}`)}`,
      `DESCRIPTION:${esc(`${t.why}\n${url}`)}`,
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadFile(filename: string, body: string, type: string) {
  const blob = new Blob([body], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
