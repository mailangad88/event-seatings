import "server-only";
import { site } from "./site";
import type { Lead } from "./store";

// Follow-up emails for days 0 to 14 after a lead arrives. Day 0 is the instant confirmation (notify.ts).
// The cron route sends at most one step per lead per day, and only while FOLLOWUPS_ENABLED=true.
//
// Stops automatically when:
// - the visitor unsubscribes (opted_out_at), or
// - a quote/call lead is no longer "new" in /admin (someone replied, booked a call, or moved it on;
//   the booking webhook moves it to "Consult booked" by itself), or
// - a download lead later sends a quote or call request (they get that sequence instead), or
// - the event date has passed.
// Replies to these emails go to NOTIFY_EMAIL; move the lead out of "New lead" when you answer and the emails stop.

export type Step = { day: number; subject: (l: Lead) => string; body: (l: Lead) => string[] };

const firstName = (l: Lead) => (l.name ? l.name.trim().split(/\s+/)[0] : "");
const hi = (l: Lead) => (firstName(l) ? `Hi ${firstName(l)},` : "Hi,");
const event = (l: Lead) => (l.event_type ?? "event").toLowerCase();
const date = (l: Lead) =>
  l.event_date ? new Date(`${l.event_date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "";
const booking = () =>
  process.env.NEXT_PUBLIC_BOOKING_URL
    ? `Pick a 15-minute time here: ${process.env.NEXT_PUBLIC_BOOKING_URL}`
    : "Reply with a good time and a number, and we'll call you.";

// Quote and call requests that nobody has answered yet.
const requestSteps: Step[] = [
  {
    day: 1,
    subject: (l) => `Quick question about your ${event(l)}${date(l) ? ` on ${date(l)}` : ""}`,
    body: (l) => [
      hi(l),
      "",
      "Following up on your request. Two details make the proposal exact, if you have them:",
      "- Is the venue indoors, outdoors, or under a tent?",
      "- Does the venue set delivery and pickup times, or have stairs or a long carry from the truck?",
      "",
      "Just reply to this email. Or talk it through instead:",
      booking(),
    ],
  },
  {
    day: 3,
    subject: () => "3 things that change a rental quote",
    body: (l) => [
      hi(l),
      "",
      "When quotes for the same items come back far apart, it's usually one of these:",
      "1. Delivery and pickup windows. Late-night or next-morning pickup changes the price.",
      "2. Setup. Some quotes include placing chairs and tables, others drop them stacked at the door.",
      "3. Damage waiver and deposit. Ask what percent, and what it covers.",
      "",
      `We put all three on one itemized proposal. Your list is saved; change it any time at ${site.url}/quote`,
    ],
  },
  {
    day: 7,
    subject: (l) => `Still planning ${date(l) ? `for ${date(l)}` : `your ${event(l)}`}?`,
    body: (l) => [
      hi(l),
      "",
      "Rental companies confirm stock date by date, so checking sooner gives you more choice of styles and colors.",
      "If your plans changed, no problem. If you'd still like prices confirmed for your date, reply \"yes\" and we'll take it from there.",
      "",
      booking(),
    ],
  },
  {
    day: 14,
    subject: () => "Should I close your request?",
    body: (l) => [
      hi(l),
      "",
      `I haven't heard back, so I'll close your rental request for now. If you still need ${event(l)} rentals, just reply and it reopens with everything you picked.`,
      "",
      `Free planning kits and checklists, any time: ${site.url}/downloads`,
    ],
  },
];

// Downloads (and other sign-ups) where the visitor ticked "send me planning tips".
const nurtureSteps: Step[] = [
  {
    day: 2,
    subject: () => "The one rental list most planners forget",
    body: (l) => [
      hi(l),
      "",
      "Chairs and tables get booked first. What gets missed: linens sized to the tables, cake and gift tables, a check-in table, chargers and enough glassware for a second drink.",
      "",
      `Our quote builder starts from your guest count and suggests quantities for each: ${site.url}/quote`,
    ],
  },
  {
    day: 6,
    subject: () => "Free tools for your seating plan",
    body: (l) => [
      hi(l),
      "",
      "Two free tools people use most:",
      `- Seating planner (drag tables onto a floor plan): ${site.url}/seating-planner`,
      `- Seating readiness score (2 minutes, tells you what's still open): ${site.url}/tools/seating-readiness`,
    ],
  },
  {
    day: 13,
    subject: (l) => (date(l) ? `Planning for ${date(l)}: want a second pair of eyes?` : "Want a second pair of eyes on your plan?"),
    body: (l) => [
      hi(l),
      "",
      "If you have a date and a rough guest count, a 15-minute call is usually enough to price every rental and catch what's missing. It's free.",
      "",
      booking(),
    ],
  },
];

export function sequenceFor(lead: Lead): { name: "request" | "nurture"; steps: Step[] } | undefined {
  if (lead.kind === "quote" || lead.kind === "call") return { name: "request", steps: requestSteps };
  if ((lead.kind === "waitlist" || lead.kind === "quiz") && lead.email_consent) return { name: "nurture", steps: nurtureSteps };
  return undefined;
}

// The next step to send for this lead now, or why not.
export function nextStep(lead: Lead, all: Lead[], now = new Date()): { step: Step; index: number } | { skip: string } {
  if (lead.opted_out_at) return { skip: "opted out" };
  if (all.some((l) => l.email.toLowerCase() === lead.email.toLowerCase() && l.opted_out_at)) return { skip: "opted out" };
  const seq = sequenceFor(lead);
  if (!seq) return { skip: "no sequence" };
  if (lead.event_date && lead.event_date < now.toISOString().slice(0, 10)) return { skip: "event passed" };
  if (seq.name === "request" && (lead.status ?? "new") !== "new") return { skip: "handled" };
  const sameEmail = all.filter((l) => l.email.toLowerCase() === lead.email.toLowerCase() && l.id !== lead.id);
  // Only the newest lead per person gets emails, and any quote/call request outranks a download.
  if (sameEmail.some((l) => l.created_at > lead.created_at && sequenceFor(l))) return { skip: "newer lead" };
  if (seq.name === "nurture" && sameEmail.some((l) => l.kind === "quote" || l.kind === "call")) return { skip: "converted" };

  const index = lead.followup_step ?? 0;
  const step = seq.steps[index];
  if (!step) return { skip: "finished" };
  const age = (now.getTime() - new Date(lead.created_at).getTime()) / 864e5;
  if (age < step.day) return { skip: "not due" };
  // Never two emails within a day, even if the cron missed some runs.
  if (lead.followup_last_at && now.getTime() - new Date(lead.followup_last_at).getTime() < 20 * 3600e3) return { skip: "sent recently" };
  return { step, index };
}
