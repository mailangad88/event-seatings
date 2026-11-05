// The call script: the same questions, in the same order, for every customer we talk to.
// Used on /admin/leads/<id>/script (a lead that came in from a form) and /admin/calls/new (someone who phoned).
//
// Answers that already sit on the lead (name, date, guests, city...) are filled in from the lead's own columns,
// so the script edits those columns directly. Everything else is saved in leads.intake (jsonb).
// Some answers are guessed from what the customer sent (planner setting, quote items); those are shown as
// "From their form, check it" until the coordinator saves the script.
//
// Plain module: no server imports, so the client form can use the same field list.

import { DEPOSIT_LABEL, PAYMENT_SCHEDULE } from "./catalog-types";
import type { Lead } from "./store";

export type IntakeValue = string | string[];
export type IntakeAnswers = Record<string, IntakeValue>;
export type Intake = { answers: IntakeAnswers; saved_at: string; calls?: number };

// Lead columns the script reads and writes directly.
export const coreFields = ["name", "phone", "email", "event_type", "event_date", "guest_count", "city", "venue", "follow_up_at"] as const;
export type CoreField = (typeof coreFields)[number];

export type IntakeField = {
  id: string;
  label: string;
  // What to say, word for word if you like.
  ask: string;
  type: "text" | "textarea" | "date" | "time" | "number" | "select" | "choices" | "email" | "tel";
  options?: readonly string[];
  // Suggestions for a text field (shown as a dropdown while typing; anything can still be typed).
  suggest?: readonly string[];
  // Needed before we can price the event with rental companies. Shown as "Ask this" when empty.
  key?: boolean;
  core?: CoreField;
  placeholder?: string;
  // Tip for the person on the phone, not read out.
  tip?: string;
  // Only for us (next step, follow-up date): never asked on the customer's own form or in the email.
  staffOnly?: boolean;
  // How to ask it in writing (email, text, customer form) when the spoken line doesn't fit.
  written?: string;
};

export type IntakeSection = { id: string; title: string; say?: string; fields: IntakeField[] };

export const occasionSuggestions = [
  "Wedding",
  "Indian wedding or sangeet",
  "Quinceañera",
  "Birthday or anniversary party",
  "Graduation party",
  "Bridal or baby shower",
  "Corporate event or gala",
  "Holiday party",
  "Memorial or celebration of life",
  "Religious or cultural event",
  "Fundraiser or school event",
  "Block party or picnic",
] as const;

export const itemOptions = [
  "Chairs",
  "Tables",
  "Linens",
  "Dinnerware",
  "Flatware",
  "Glassware",
  "Tent",
  "Dance floor or stage",
  "Lighting",
  "Heaters or fans",
  "Lounge furniture",
  "Decor",
  "Bars and catering gear",
  "Kids' games",
  "Restrooms or power",
] as const;

export const intakeSections: IntakeSection[] = [
  {
    id: "contact",
    title: "Who you're talking to",
    say: "Thanks for calling Beyond Chiavari. Can I grab your name and number first, in case we get cut off?",
    fields: [
      { id: "name", label: "Name", ask: "Who am I speaking with?", written: "Your name", type: "text", key: true, core: "name", placeholder: "First and last name" },
      { id: "phone", label: "Phone", ask: "Best number to reach you?", written: "Best phone number for you", type: "tel", key: true, core: "phone", placeholder: "(312) 555-0123" },
      { id: "email", label: "Email", ask: "What email should I send your quote to?", written: "Email for your quote", type: "email", key: true, core: "email", placeholder: "name@example.com" },
      { id: "contact_pref", label: "Best way to reach them", ask: "Do you prefer a call, a text or an email?", type: "choices", options: ["Call", "Text", "Email"] },
      { id: "contact_time", label: "Best time", ask: "When is a good time to reach you?", type: "select", options: ["Morning", "Afternoon", "Evening", "Weekends", "Any time"] },
      {
        id: "heard_from",
        label: "How they found us",
        ask: "How did you hear about us?",
        type: "select",
        options: ["Google search", "Instagram or Facebook", "Friend or family", "Venue or planner", "Saw us at an event", "Came back to us", "Other"],
      },
    ],
  },
  {
    id: "event",
    title: "The event",
    say: "Tell me a little about the event.",
    fields: [
      { id: "event_type", label: "Occasion", ask: "What are you celebrating?", written: "What's the occasion?", type: "text", key: true, core: "event_type", suggest: occasionSuggestions, placeholder: "Wedding, graduation party..." },
      { id: "event_date", label: "Event date", ask: "What's the date?", written: "What's the date of the event?", type: "date", key: true, core: "event_date" },
      { id: "date_flexible", label: "Is the date set?", ask: "Is that date set, or could it move?", type: "select", options: ["Date is set", "Could move a day or two", "Still picking a date"] },
      { id: "start_time", label: "Starts at", ask: "What time do guests arrive?", type: "time" },
      { id: "end_time", label: "Ends at", ask: "And what time does it wrap up?", type: "time" },
      { id: "guest_count", label: "Guests", ask: "About how many guests?", type: "number", key: true, core: "guest_count", tip: "A rough number is fine. It sets chair, table and linen counts." },
      {
        id: "seating",
        label: "How people will sit",
        ask: "Will everyone sit down to eat, or is it more mingling?",
        type: "choices",
        options: ["Seated meal", "Ceremony rows", "Buffet", "Cocktail or standing", "Kids' table"],
      },
    ],
  },
  {
    id: "place",
    title: "The place",
    say: "Now the place, so we know what we're driving to.",
    fields: [
      {
        id: "venue_type",
        label: "Type of place",
        ask: "Is this at your home, a venue, or somewhere else?",
        type: "select",
        key: true,
        options: ["Backyard or home", "Banquet hall or venue", "Tent on a lawn or farm", "Park or public space", "Church, temple or mosque", "Office or business", "Other"],
      },
      { id: "venue", label: "Venue name", ask: "What's the name of the place?", type: "text", core: "venue", placeholder: "Leave blank for a home" },
      { id: "address", label: "Delivery address", ask: "What's the street address for delivery?", type: "text", placeholder: "Street address" },
      { id: "city", label: "Town", ask: "Which town is that in?", type: "text", key: true, core: "city", placeholder: "Naperville" },
      { id: "indoor_outdoor", label: "Indoors or outdoors", ask: "Will it be inside, outside, or both?", type: "select", key: true, options: ["Indoors", "Outdoors", "Both"] },
      { id: "surface", label: "Ground", ask: "What will the chairs and tables sit on?", type: "select", options: ["Grass", "Concrete or driveway", "Patio or pavers", "Indoor floor", "Not sure"] },
      {
        id: "weather_plan",
        label: "Rain plan",
        ask: "If it rains, what's the plan?",
        type: "select",
        options: ["Need a tent", "Venue has an indoor backup", "Will take the chance", "Not sure yet", "Indoors, not needed"],
      },
      { id: "power", label: "Power nearby", ask: "Is there an outlet close to where things go?", type: "select", options: ["Yes, close by", "Yes, but far away", "No power", "Not sure"], tip: "Matters for lighting, heaters, fans and dance floor lights." },
      {
        id: "venue_rules",
        label: "Venue rules",
        ask: "Does the venue have rules for rental companies, like set delivery hours or a list of approved companies?",
        type: "textarea",
        placeholder: "Load-in after 2pm, must be out by midnight...",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery and setup",
    say: "A couple of questions about drop-off, so the driver isn't guessing.",
    fields: [
      { id: "dropoff_window", label: "Earliest drop-off", ask: "What's the earliest we can drop things off? Could it come the day before?", written: "What's the earliest the rentals can be dropped off? The day before is often cheaper.", type: "text", key: true, placeholder: "Friday after 3pm, or the morning of" },
      { id: "pickup_window", label: "Pick up by", ask: "When does everything need to be picked up by?", type: "text", placeholder: "Sunday by noon" },
      { id: "setup_help", label: "Setup", ask: "Do you want the crew to set up and take down, or just drop off?", written: "Would you like the crew to set up and take down, or just drop off?", type: "select", key: true, options: ["Set up and take down", "Drop off only", "Not sure"] },
      {
        id: "access",
        label: "Getting things in",
        ask: "Any stairs, long walks or tight spots between the truck and where things go?",
        type: "choices",
        options: ["Easy curbside", "Stairs", "Elevator", "Long walk from the truck", "Narrow gate or door", "Tight parking"],
      },
      { id: "access_notes", label: "Notes for the driver", ask: "Anything else the driver should know?", type: "textarea", placeholder: "Use the side gate, park in the alley..." },
      { id: "onsite_contact", label: "Contact on the day", ask: "Who will be there on the day for the driver to call?", type: "text", placeholder: "Name and phone" },
    ],
  },
  {
    id: "items",
    title: "What they need",
    say: "Let's go through what you need.",
    fields: [
      { id: "items_needed", label: "Items", ask: "Which of these do you need?", written: "Which of these do you need?", type: "choices", key: true, options: itemOptions },
      {
        id: "chair_style",
        label: "Chair style",
        ask: "Do you have a chair style in mind?",
        type: "text",
        suggest: ["White folding", "Padded folding", "Gold Chiavari", "Silver Chiavari", "Clear Chiavari", "Wood cross-back", "Clear ghost chair", "Kids' chairs"],
        placeholder: "Gold Chiavari, white folding...",
      },
      { id: "table_plan", label: "Tables", ask: "Round tables, long tables, or a mix? Any cocktail tables?", type: "text", placeholder: "15 rounds, 2 long for the buffet" },
      { id: "colors", label: "Colors or theme", ask: "Any colors or a theme you're going for?", type: "text", placeholder: "Ivory and sage, gold accents" },
      { id: "have_already", label: "Already have", ask: "Is there anything you already have, or that the venue gives you?", type: "textarea", placeholder: "Venue has tables, we need chairs and linens" },
      { id: "photos", label: "Photos or links", ask: "Do you have any photos or a Pinterest board you can send me?", type: "text", placeholder: "Link, or 'will text photos'" },
    ],
  },
  {
    id: "budget",
    title: "Budget and timing",
    say: "Last few, so I send you something that fits.",
    fields: [
      {
        id: "budget",
        label: "Rental budget",
        ask: "Do you have a rough budget for rentals?", written: "Do you have a rough budget for the rentals? A range is fine.",
        type: "select",
        key: true,
        options: ["Under $1,000", "$1,000 to $2,500", "$2,500 to $5,000", "$5,000 to $10,000", "Over $10,000", "Not sure yet"],
        tip: "If they don't know, give a range from a similar event and see how they react.",
      },
      { id: "deciders", label: "Who else decides", ask: "Is anyone else helping you decide?", type: "text", placeholder: "Fiancé, mom, office manager..." },
      { id: "decide_by", label: "Deciding by", ask: "When are you hoping to have this booked?", type: "select", key: true, options: ["This week", "Within 2 weeks", "This month", "Just looking for now"] },
      { id: "other_quotes", label: "Other quotes", ask: "Have you gotten other quotes yet?", type: "select", options: ["No", "Yes, one", "Yes, a few"] },
      { id: "worries", label: "Worries", ask: "Is there anything you're worried about for the day?", type: "textarea", placeholder: "Rain, late delivery, chairs on grass..." },
    ],
  },
  {
    id: "wrap",
    title: "Wrap up",
    say: `Here's how we work. You get one written quote with our price for every item, plus delivery, setup, damage waiver and tax. To book, you pay a ${DEPOSIT_LABEL}, fully refundable for ${PAYMENT_SCHEDULE.refundHours} hours, then the rest in stages, the last of it ${PAYMENT_SCHEDULE.finalDueDaysBefore} days before your event. There's no separate booking fee.`,
    fields: [
      {
        id: "next_step",
        label: "Next step",
        ask: "What happens next?", staffOnly: true,
        type: "select",
        key: true,
        options: ["Send a quote by email", "Book a planning call", "Send a few options to pick from", "Check back later", "Not a fit"],
      },
      { id: "follow_up_at", label: "Follow up on", ask: "When should I check back with you?", type: "date", core: "follow_up_at", staffOnly: true },
      { id: "notes", label: "Anything else", ask: "Is there anything I didn't ask that I should know?", written: "Anything else we should know?", type: "textarea", placeholder: "Anything else from the call" },
    ],
  },
];

export const intakeFields: IntakeField[] = intakeSections.flatMap((s) => s.fields);
export const keyFields = intakeFields.filter((f) => f.key);
const byId = new Map(intakeFields.map((f) => [f.id, f]));
export const intakeField = (id: string) => byId.get(id);

export type AnswerFrom = "lead" | "call" | "form";
export type Prefilled = Record<string, { value: IntakeValue; from: AnswerFrom }>;

export const isAnswered = (v: IntakeValue | undefined | null) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "");

// Item categories on the quote, mapped to the script's item choices.
const categoryToItem: Record<string, (typeof itemOptions)[number]> = {
  Chairs: "Chairs",
  Tables: "Tables",
  Linens: "Linens",
  Dinnerware: "Dinnerware",
  Flatware: "Flatware",
  Glassware: "Glassware",
  Tents: "Tent",
  "Dance floors & staging": "Dance floor or stage",
  Lighting: "Lighting",
  "Heating & cooling": "Heaters or fans",
  Lounge: "Lounge furniture",
  Decor: "Decor",
  "Catering equipment": "Bars and catering gear",
  Concessions: "Bars and catering gear",
  "Games & kids": "Kids' games",
  "Restrooms & power": "Restrooms or power",
};

// Planner messages start "Planner: <event>, <n> guests, <setting>, <package> package." (EventPlanner.tsx).
const plannerPlaces: { match: RegExp; venue_type: string; indoor_outdoor?: string }[] = [
  { match: /Backyard or home/i, venue_type: "Backyard or home", indoor_outdoor: "Outdoors" },
  { match: /, Indoors,/i, venue_type: "Banquet hall or venue", indoor_outdoor: "Indoors" },
  { match: /Outdoor venue or tent/i, venue_type: "Tent on a lawn or farm", indoor_outdoor: "Outdoors" },
  { match: /Park or public space/i, venue_type: "Park or public space", indoor_outdoor: "Outdoors" },
];

function guessedFromForm(lead: Partial<Lead>): IntakeAnswers {
  const out: IntakeAnswers = {};
  const msg = lead.message ?? "";
  const place = msg.startsWith("Planner:") ? plannerPlaces.find((p) => p.match.test(msg)) : undefined;
  if (place) {
    out.venue_type = place.venue_type;
    if (place.indoor_outdoor) out.indoor_outdoor = place.indoor_outdoor;
  }
  const items = [...new Set((lead.items ?? []).map((l) => categoryToItem[l.category]).filter(Boolean))];
  if (items.length) out.items_needed = itemOptions.filter((o) => items.includes(o));
  else if (lead.chairs?.length) out.items_needed = ["Chairs"];
  if (lead.quiz_styles?.length) out.colors = lead.quiz_styles.join(", ");
  if (lead.sms_consent) out.contact_pref = ["Text"];
  return out;
}

const coreValue = (lead: Partial<Lead>, k: CoreField): string => {
  const v = lead[k];
  if (v === undefined || v === null) return "";
  return k === "event_date" || k === "follow_up_at" ? String(v).slice(0, 10) : String(v);
};

/**
 * Every answer we already have for this lead, and where it came from:
 * "lead" = a column on the lead (the customer typed it, or an earlier call saved it),
 * "call" = saved from a call script, "form" = guessed from what they sent (check it).
 */
export function prefillIntake(lead: Partial<Lead> & { intake?: Intake | null }): Prefilled {
  const out: Prefilled = {};
  const saved = lead.intake?.answers ?? {};
  const guessed = guessedFromForm(lead);
  for (const f of intakeFields) {
    if (f.core) {
      const v = coreValue(lead, f.core);
      if (v) out[f.id] = { value: v, from: "lead" };
    } else if (isAnswered(saved[f.id])) {
      out[f.id] = { value: saved[f.id], from: "call" };
    } else if (isAnswered(guessed[f.id])) {
      out[f.id] = { value: guessed[f.id], from: "form" };
    }
  }
  return out;
}

export function missingKeyFields(answers: Record<string, IntakeValue | undefined>) {
  return keyFields.filter((f) => !isAnswered(answers[f.id]));
}

// Counts for a lead page badge: how many must-have answers are still missing.
export function intakeProgress(lead: Partial<Lead> & { intake?: Intake | null }) {
  const pre = prefillIntake(lead);
  const values = Object.fromEntries(Object.entries(pre).map(([k, v]) => [k, v.value]));
  const missing = missingKeyFields(values);
  return { answered: keyFields.length - missing.length, total: keyFields.length, missing, savedAt: lead.intake?.saved_at };
}

const realDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().startsWith(d);
const realTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, (s) => (s.includes("\n") ? "\n" : " ")).trim().slice(0, max) : "");

/**
 * Reads the script form. Field inputs are named f_<id>; choices send one value per ticked box.
 * Drops anything that doesn't fit the field (unknown options, bad dates, silly guest counts).
 */
export function parseIntakeForm(form: { get(name: string): unknown; getAll(name: string): unknown[] }): IntakeAnswers {
  const out: IntakeAnswers = {};
  for (const f of intakeFields) {
    const name = `f_${f.id}`;
    if (f.type === "choices") {
      const picked = form.getAll(name).filter((v): v is string => typeof v === "string" && (f.options ?? []).includes(v));
      out[f.id] = [...new Set(picked)];
      continue;
    }
    const raw = clean(form.get(name), f.type === "textarea" ? 2000 : 200);
    let v = raw;
    if (f.type === "date" && raw && !realDate(raw)) v = "";
    if (f.type === "time" && raw && !realTime(raw)) v = "";
    if (f.type === "select" && raw && !(f.options ?? []).includes(raw)) v = "";
    if (f.type === "number" && raw) {
      const n = Math.round(Number(raw.replace(/,/g, "")));
      v = Number.isFinite(n) && n > 0 && n <= 50_000 ? String(n) : "";
    }
    if (f.type === "email" && raw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) v = "";
    if (f.type === "email") v = v.toLowerCase();
    out[f.id] = v;
  }
  return out;
}

export const showValue = (f: IntakeField, v: IntakeValue | undefined) => {
  if (!isAnswered(v)) return "";
  const s = Array.isArray(v) ? v.join(", ") : v!;
  if (f.type === "date") return new Date(`${s}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  if (f.type === "time") {
    const [h, m] = s.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  }
  return s;
};

// Plain text of the answers, section by section, for the timeline and for databases without the intake column.
export function intakeText(answers: IntakeAnswers, only?: Set<string>) {
  const lines: string[] = [];
  for (const s of intakeSections) {
    const rows = s.fields.filter((f) => (!only || only.has(f.id)) && isAnswered(answers[f.id])).map((f) => `${f.label}: ${showValue(f, answers[f.id])}`);
    if (rows.length) lines.push(...rows);
  }
  return lines.join("\n");
}

// Splits parsed answers into lead column changes and the rest (for leads.intake).
export function splitAnswers(answers: IntakeAnswers) {
  const core: Partial<Record<CoreField, string | number>> = {};
  const extra: IntakeAnswers = {};
  for (const f of intakeFields) {
    const v = answers[f.id];
    if (f.core) core[f.core] = f.core === "guest_count" ? (v ? Number(v) : "") : (v as string) ?? "";
    else if (isAnswered(v)) extra[f.id] = v;
  }
  return { core, extra };
}

// Which answers changed compared with what was there before (for the timeline note).
export function changedAnswers(before: Prefilled, after: IntakeAnswers) {
  const same = (a?: IntakeValue, b?: IntakeValue) => JSON.stringify(Array.isArray(a) ? [...a].sort() : a ?? "") === JSON.stringify(Array.isArray(b) ? [...b].sort() : b ?? "");
  return new Set(
    intakeFields
      .filter((f) => {
        const prev = before[f.id];
        // A guess from the form counts as new once someone saves it on a call.
        const prevValue = prev && prev.from !== "form" ? prev.value : undefined;
        return isAnswered(after[f.id]) ? !same(prevValue, after[f.id]) : isAnswered(prevValue);
      })
      .map((f) => f.id),
  );
}

// The question as written to the customer (email, text or their own form).
export const writtenAsk = (f: IntakeField) => f.written ?? f.ask;

// Missing answers we can ask the customer for in writing: must-haves first, then the rest.
export function missingForCustomer(answers: Record<string, IntakeValue | undefined>) {
  const open = intakeFields.filter((f) => !f.staffOnly && !isAnswered(answers[f.id]));
  return { key: open.filter((f) => f.key), more: open.filter((f) => !f.key) };
}

const prettyDate = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

// "your graduation party on Saturday, June 12 for about 120 guests in Naperville"
export function eventPhrase(lead: Partial<Lead>) {
  const what = lead.event_type ? `your ${lead.event_type.replace(/\s*\(.*\)$/, "").toLowerCase()}` : "your event";
  return [what, lead.event_date && `on ${prettyDate(lead.event_date)}`, lead.guest_count && `for about ${lead.guest_count} guests`, lead.city && `in ${lead.city}`]
    .filter(Boolean)
    .join(" ");
}

// "chairs, tables and linens" from the quote's item categories (or the call answers).
export function itemsPhrase(answers: Record<string, IntakeValue | undefined>) {
  const items = Array.isArray(answers.items_needed) ? answers.items_needed.map((i) => i.toLowerCase()) : [];
  if (!items.length) return "";
  return items.length === 1 ? items[0] : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export type Outreach = { opener: string; subject: string; email: string; text: string; asks: IntakeField[] };

/**
 * Personal messages for a lead, built from what they already told us and only asking what's missing:
 * a call opener, an email and a short text. `link` is their own form (/event-details/<token>).
 */
export function buildOutreach(lead: Partial<Lead> & { intake?: Intake | null }, opts: { link?: string; from?: string; phone?: string } = {}): Outreach {
  const pre = prefillIntake(lead);
  const answers = Object.fromEntries(Object.entries(pre).map(([k, v]) => [k, v.value]));
  const { key, more } = missingForCustomer(answers);
  const asks = (key.length ? key : more).slice(0, 6);
  const first = lead.name?.trim().split(/\s+/)[0];
  const hi = first ? `Hi ${first}` : "Hi there";
  const me = opts.from ? `${opts.from} from Beyond Chiavari` : "Beyond Chiavari";
  const event = eventPhrase(lead);
  const items = itemsPhrase(answers);
  const list = (lead.items?.length ?? 0) > 0;
  const sent = list ? `your list for ${event}${items ? ` (${items})` : ""}` : `${event}${items ? ` and the ${items} you need` : ""}`;

  const opener = asks.length
    ? `${hi}, this is ${me}. I'm calling about ${sent}. I have ${asks.length === 1 ? "one quick question" : "a few quick questions"} so I can check availability and prices for your date. Is now a good time?`
    : `${hi}, this is ${me}. I'm calling about ${sent}. I have everything I need to check availability for your date, so I just want to confirm a couple of things with you. Is now a good time?`;

  const subject = lead.event_type ? `Your ${lead.event_type.replace(/\s*\(.*\)$/, "").toLowerCase()} rentals: a few quick questions` : "Your event rentals: a few quick questions";
  const numbered = asks.map((f, i) => `${i + 1}. ${writtenAsk(f)}`);
  const email = [
    `${hi},`,
    "",
    list ? `Thanks for sending ${sent}.` : `Thanks for getting in touch about ${sent}.`,
    "",
    asks.length
      ? `To check availability and prices for your date, I just need ${asks.length === 1 ? "one more detail" : "a few more details"}:`
      : "I have what I need to check availability and prices for your date. I'll be back to you shortly.",
    ...(asks.length ? ["", ...numbered] : []),
    "",
    ...(asks.length && opts.link ? [`You can reply to this email, or fill them in here (it takes about 2 minutes): ${opts.link}`, ""] : asks.length ? ["Just reply to this email with what you know. A rough answer is fine.", ""] : []),
    opts.phone ? `If it's easier to talk, call or text me at ${opts.phone}.` : "If it's easier to talk, reply with a good time and I'll call you.",
    "",
    "Thanks,",
    opts.from ? `${opts.from}, Beyond Chiavari` : "Beyond Chiavari",
  ].join("\n");

  const text = asks.length
    ? `${hi}, it's ${me}. Thanks for ${list ? "your list" : "reaching out"} for ${event}. To check prices I need ${asks.length === 1 ? "one more detail" : `${asks.length} more details`}${opts.link ? `, quick form here: ${opts.link}` : `. Is now a good time for a 5 minute call?`}`
    : `${hi}, it's ${me}. Thanks for ${list ? "your list" : "reaching out"} for ${event}. I'm checking availability for your date now and will be back to you shortly.`;

  return { opener, subject, email, text, asks };
}

// Call answers a rental company needs to price delivery and setup. Street address and the on-site contact are
// left out on purpose: they go to the rental company once the booking is confirmed.
export const vendorFieldIds = ["venue_type", "indoor_outdoor", "surface", "start_time", "end_time", "dropoff_window", "pickup_window", "setup_help", "access", "access_notes", "power", "venue_rules", "chair_style", "table_plan", "colors"] as const;

export function vendorDetails(lead: Partial<Lead> & { intake?: Intake | null }) {
  const pre = prefillIntake(lead);
  return vendorFieldIds
    .map((id) => {
      const f = intakeField(id);
      const v = pre[id]?.value;
      return f && isAnswered(v) ? `${f.label}: ${showValue(f, v)}` : "";
    })
    .filter(Boolean);
}

// The email that goes with the customer proposal link.
export function proposalEmail(lead: Partial<Lead>, url: string, from?: string) {
  const first = lead.name?.trim().split(/\s+/)[0];
  const subject = lead.event_type ? `Your ${lead.event_type.replace(/\s*\(.*\)$/, "").toLowerCase()} rental quote` : "Your event rental quote";
  const body = [
    `${first ? `Hi ${first}` : "Hi there"},`,
    "",
    `Here is your quote for ${eventPhrase(lead)}: ${url}`,
    "",
    `It shows every item at our price, with delivery, setup, damage waiver and tax on their own lines. You book with a ${DEPOSIT_LABEL}, fully refundable for ${PAYMENT_SCHEDULE.refundHours} hours, then the rest in stages before your event.`,
    "",
    "If you want to change anything, just reply and I'll update it.",
    "",
    "Thanks,",
    from ? `${from}, Beyond Chiavari` : "Beyond Chiavari",
  ].join("\n");
  return { subject, body };
}
