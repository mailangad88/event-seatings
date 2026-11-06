import "server-only";
import { categories } from "@/data/catalog-products";
import { interestsFor, topCategories, type Interest } from "./interests";
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
//
// Personal to each person: the steps below read what they looked at and clicked (lib/interests.ts). Someone who
// spent their visit on tents gets tent planning tips and the tent size calculator; someone on linens gets linen
// tips and the linen calculator; their occasion page is linked when we know it. With no clear interest, the
// general version goes out. The set picked is saved on the lead as `sequence`, e.g. "nurture:tents+weddings".

type Focus = { category?: Interest; categories: Interest[]; occasion?: Interest; tools: Interest[] };

export function focusFor(lead: Lead): Focus {
  const list = interestsFor(lead);
  const cats = topCategories(list, 2);
  return { category: cats[0], categories: cats, occasion: list.find((i) => i.kind === "occasion" && i.href), tools: list.filter((i) => i.kind === "tool") };
}

// The calculator that goes with each kind of rental.
const toolFor: Partial<Record<string, { name: string; href: string }>> = {
  chairs: { name: "Tables and chairs calculator", href: "/tools/tables-and-chairs" },
  tables: { name: "Tables and chairs calculator", href: "/tools/tables-and-chairs" },
  linens: { name: "Linen size calculator", href: "/tools/linens" },
  tents: { name: "Tent size calculator", href: "/tools/tent-size" },
  glassware: { name: "Bar and glassware calculator", href: "/tools/bar-and-glassware" },
  "dance-floors-staging": { name: "Dance floor size calculator", href: "/tools/dance-floor" },
  lighting: { name: "Lighting planner", href: "/tools/lighting" },
};

const planningTips = (categoryId: string, n: number) => categories.find((c) => c.id === categoryId)?.planning.slice(0, n) ?? [];

// "Picked for you" lines added to the request emails: tips and a calculator for what they looked at most.
function pickedFor(l: Lead): string[] {
  const f = focusFor(l);
  if (!f.category) return [];
  const tips = planningTips(f.category.key, 2);
  const tool = toolFor[f.category.key];
  return [
    "",
    `Since you looked at ${f.categories.map((c) => c.label.toLowerCase()).join(" and ")}:`,
    ...tips.map((t) => `- ${t.title}: ${t.body}`),
    ...(tool ? [`- ${tool.name}: ${site.url}${tool.href}`] : []),
  ];
}

function occasionLine(l: Lead): string[] {
  const o = focusFor(l).occasion;
  return o ? ["", `Our ${o.label.toLowerCase()} page has a sample rental list and prices: ${site.url}${o.href}`] : [];
}

export function sequenceLabel(lead: Lead): string | undefined {
  const seq = sequenceFor(lead);
  if (!seq) return undefined;
  const f = focusFor(lead);
  const parts = [f.category?.key, f.occasion?.key].filter(Boolean);
  return parts.length ? `${seq.name}:${parts.join("+")}` : seq.name;
}

export type Step = {
  day: number;
  subject: (l: Lead) => string;
  body: (l: Lead) => string[];
  // Visual version of the same email (src/emails/FollowupEmail.tsx): a short on-page heading and
  // the one button. `body` is still the source of the wording for both the text and HTML parts.
  heading: (l: Lead) => string;
  cta: (l: Lead) => { label: string; href: string };
};

const firstName = (l: Lead) => (l.name ? l.name.trim().split(/\s+/)[0] : "");
const hi = (l: Lead) => (firstName(l) ? `Hi ${firstName(l)},` : "Hi,");
const event = (l: Lead) => (l.event_type ?? "event").toLowerCase();
const date = (l: Lead) =>
  l.event_date ? new Date(`${l.event_date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "";
const booking = () =>
  process.env.NEXT_PUBLIC_BOOKING_URL
    ? `Pick a 15-minute time here: ${process.env.NEXT_PUBLIC_BOOKING_URL}`
    : "Reply with a good time and a number, and we'll call you.";

// The one button on the visual version of each email (src/emails/FollowupEmail.tsx). Links to the
// booking page when one is set, otherwise to the quote builder, which always works without a reply.
const bookOrQuoteCta = (): { label: string; href: string } =>
  process.env.NEXT_PUBLIC_BOOKING_URL
    ? { label: "Book a 15-minute call", href: process.env.NEXT_PUBLIC_BOOKING_URL }
    : { label: "Go to your quote", href: `${site.url}/quote` };

// Quote and call requests that nobody has answered yet.
const requestSteps: Step[] = [
  {
    day: 1,
    subject: (l) => `Quick question about your ${event(l)}${date(l) ? ` on ${date(l)}` : ""}`,
    heading: (l) => `Following up on your ${event(l)}`,
    cta: bookOrQuoteCta,
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
    heading: () => "3 things that change a rental quote",
    cta: () => ({ label: "Update your quote", href: `${site.url}/quote` }),
    body: (l) => [
      hi(l),
      "",
      "When quotes for the same items come back far apart, it's usually one of these:",
      "1. Delivery and pickup windows. Late-night or next-morning pickup changes the price.",
      "2. Setup. Some quotes include placing chairs and tables, others drop them stacked at the door.",
      "3. Damage waiver and deposit. Ask what percent, and what it covers.",
      "",
      `We put all three on one itemized proposal. Your list is saved; change it any time at ${site.url}/quote`,
      ...pickedFor(l),
    ],
  },
  {
    day: 7,
    subject: (l) => `Still planning ${date(l) ? `for ${date(l)}` : `your ${event(l)}`}?`,
    heading: (l) => `Still planning ${date(l) ? `for ${date(l)}` : `your ${event(l)}`}?`,
    cta: bookOrQuoteCta,
    body: (l) => [
      hi(l),
      "",
      "Stock is booked date by date, so checking sooner gives you more choice of styles and colors.",
      "If your plans changed, no problem. If you'd still like prices confirmed for your date, reply \"yes\" and we'll take it from there.",
      "",
      booking(),
    ],
  },
  {
    day: 14,
    subject: () => "Should I close your request?",
    heading: () => "Should we close your request?",
    cta: () => ({ label: "Reopen your request", href: `${site.url}/quote` }),
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
    subject: (l) => {
      const f = focusFor(l);
      return f.category ? `Planning ${f.category.label.toLowerCase()} for your ${event(l)}: what to check` : "The one rental list most planners forget";
    },
    heading: (l) => {
      const f = focusFor(l);
      return f.category ? `Planning ${f.category.label.toLowerCase()}: what to check` : "The one rental list most planners forget";
    },
    cta: (l) => {
      const f = focusFor(l);
      const tool = f.category ? toolFor[f.category.key] : undefined;
      return tool ? { label: tool.name, href: `${site.url}${tool.href}` } : { label: "Go to the quote builder", href: `${site.url}/quote` };
    },
    body: (l) => {
      const f = focusFor(l);
      if (!f.category)
        return [
          hi(l),
          "",
          "Chairs and tables get booked first. What gets missed: linens sized to the tables, cake and gift tables, a check-in table, chargers and enough glassware for a second drink.",
          "",
          `Our quote builder starts from your guest count and suggests quantities for each: ${site.url}/quote`,
        ];
      const tool = toolFor[f.category.key];
      return [
        hi(l),
        "",
        `You were looking at ${f.category.label.toLowerCase()}, so here's what to check before you book:`,
        ...planningTips(f.category.key, 3).map((t, i) => `${i + 1}. ${t.title}. ${t.body}`),
        "",
        ...(tool ? [`Work out how much you need: ${site.url}${tool.href}`] : []),
        `See ${f.category.label.toLowerCase()} with prices: ${site.url}${f.category.href}`,
        `Or price your whole list in one go: ${site.url}/quote`,
      ];
    },
  },
  {
    day: 6,
    subject: () => "Free tools for your seating plan",
    heading: () => "Free tools for your seating plan",
    cta: () => ({ label: "Try the seating planner", href: `${site.url}/seating-planner` }),
    body: (l) => {
      const f = focusFor(l);
      const used = new Set(f.tools.map((t) => t.href));
      const picks = f.categories.map((c) => toolFor[c.key]).filter((t): t is { name: string; href: string } => !!t && !used.has(t.href));
      const lines = [
        ...new Map(picks.map((t) => [t.href, `- ${t.name}: ${site.url}${t.href}`])).values(),
        ...(used.has("/seating-planner") ? [] : [`- Seating planner (drag tables onto a floor plan): ${site.url}/seating-planner`]),
        ...(used.has("/tools/seating-readiness") ? [] : [`- Seating readiness score (2 minutes, tells you what's still open): ${site.url}/tools/seating-readiness`]),
      ].slice(0, 3);
      return [hi(l), "", picks.length ? "Free tools that fit what you were planning:" : "Two free tools people use most:", ...lines];
    },
  },
  {
    day: 13,
    subject: (l) => (date(l) ? `Planning for ${date(l)}: want a second pair of eyes?` : "Want a second pair of eyes on your plan?"),
    heading: (l) => (date(l) ? `Planning for ${date(l)}?` : "Want a second pair of eyes on your plan?"),
    cta: bookOrQuoteCta,
    body: (l) => [
      hi(l),
      "",
      "If you have a date and a rough guest count, a 15-minute call is usually enough to price every rental and catch what's missing. It's free.",
      "",
      booking(),
      ...occasionLine(l),
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
