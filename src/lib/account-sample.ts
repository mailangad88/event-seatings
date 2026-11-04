// Example data for the sample account (/account/sign-in → "See a sample account"). Not a real customer:
// it lets the owner and visitors see what the renter account looks like before Supabase is switched on.
// Dates are relative to today so the sample always looks current.
import type { QuoteLine } from "./catalog-types";
import type { CustomerAccount, Lead } from "./store";
import { SAMPLE_EMAIL } from "./account-auth";

const iso = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const at = (days: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};

const line = (id: string, name: string, category: string, qty: number, unit_price: number, vendor_id: string, unit = "each", variant?: string): QuoteLine => ({
  id,
  name,
  category,
  unit,
  qty,
  unit_price,
  line_total: Math.round(unit_price * qty * 100) / 100,
  vendor_id,
  vendor_price: Math.round((unit_price / 1.1) * 100) / 100,
  ...(variant ? { variant } : {}),
});

const sum = (lines: QuoteLine[], k: "line_total" | "cost") =>
  Math.round(lines.reduce((s, l) => s + (k === "line_total" ? l.line_total : l.vendor_price * l.qty), 0) * 100) / 100;

export function sampleAccount(): CustomerAccount {
  return { email: SAMPLE_EMAIL, created_at: at(-30), name: "Priya Shah", phone: "(312) 555-0142", last_login_at: at(0, 8) };
}

export function sampleLeads(): Lead[] {
  const wedding = [
    line("gold-chiavari", "Gold Chiavari chair", "Chairs", 150, 10.45, "arlington-rental"),
    line("round-60", "60\" round table", "Tables", 19, 13.2, "arlington-rental"),
    line("farm-table", "Farm table, 8 ft", "Tables", 2, 82.5, "arlington-rental"),
    line("linen-120-round", "120\" round tablecloth", "Linens", 19, 24.2, "windy-city-linen", "each", "ivory"),
    line("napkin-poly", "Dinner napkin", "Linens", 160, 1.1, "windy-city-linen", "each", "sage"),
    line("tent-40x60", "40 x 60 frame tent", "Tents", 1, 2750, "big-tent-events", "per event"),
    line("string-lights", "Bistro string lights, 100 ft", "Lighting", 4, 60.5, "big-tent-events"),
  ];
  const birthday = [
    line("white-folding", "White folding chair", "Chairs", 40, 3.3, "halls-rental"),
    line("rect-6", "6 ft banquet table", "Tables", 6, 11, "halls-rental"),
    line("linen-90x132", "90 x 132 tablecloth", "Linens", 6, 19.8, "halls-rental", "each", "white"),
  ];
  const shower = [
    line("crossback", "Crossback chair", "Chairs", 30, 9.35, "house-of-rental"),
    line("round-60", "60\" round table", "Tables", 4, 13.2, "house-of-rental"),
  ];
  const base = { kind: "quote" as const, email: SAMPLE_EMAIL, name: "Priya Shah", phone: "(312) 555-0142", source: "sample" };
  return [
    {
      ...base,
      id: "sample-wedding",
      created_at: at(-30),
      event_type: "wedding",
      event_date: iso(38),
      guest_count: 150,
      city: "Naperville",
      venue: "Backyard, 1418 Maple Lane, Naperville",
      items: wedding,
      quote_subtotal: sum(wedding, "line_total"),
      quote_cost: sum(wedding, "cost"),
      status: "booked",
      proposal_token: "sample",
      fee_status: "paid",
      fee_amount: Math.round((sum(wedding, "line_total") - sum(wedding, "cost")) * 100) / 100,
      fee_paid_at: at(-21),
      vendor_orders: {
        "arlington-rental": { status: "scheduled", delivery_date: iso(37), delivery_window: "8 to 10am", pickup_date: iso(39), pickup_window: "9am to noon", note: "Driver will call 30 minutes before arriving." },
        "windy-city-linen": { status: "confirmed", delivery_date: iso(37), note: "Linens arrive pressed and folded." },
        "big-tent-events": { status: "sent", note: "Waiting for a site visit time for the tent stakes." },
      },
      messages: [
        { at: at(-20, 14), from: "team", text: "Thanks, Priya! Your booking is secured. We've sent each part of your order to its rental company and will post their confirmations here.", read_at: at(-20, 18) },
        { at: at(-20, 18), from: "customer", text: "Great, thank you. Can the chairs come the day before so we can set up?", read_at: at(-19, 9) },
        { at: at(-1, 11), from: "team", text: "Yes. Chairs and tables arrive the day before, 8 to 10am. The tent company wants to visit the yard first. Does Saturday morning work?" },
      ],
    },
    {
      ...base,
      id: "sample-birthday",
      created_at: at(-4),
      event_type: "birthday party",
      event_date: iso(12),
      guest_count: 40,
      city: "Chicago",
      items: birthday,
      quote_subtotal: sum(birthday, "line_total"),
      quote_cost: sum(birthday, "cost"),
      status: "quote_sent",
      proposal_token: "sample",
      fee_status: "unpaid",
      messages: [{ at: at(-3, 16), from: "team", text: "Your quote is ready. Everything is from one rental company and they have your date open right now.", read_at: at(-2, 9) }],
    },
    {
      ...base,
      id: "sample-shower",
      created_at: at(-120),
      event_type: "baby shower",
      event_date: iso(-75),
      guest_count: 30,
      city: "Oak Park",
      venue: "Oak Park home",
      items: shower,
      quote_subtotal: sum(shower, "line_total"),
      quote_cost: sum(shower, "cost"),
      status: "completed",
      fee_status: "paid",
      fee_amount: Math.round((sum(shower, "line_total") - sum(shower, "cost")) * 100) / 100,
      fee_paid_at: at(-100),
      vendor_orders: { "house-of-rental": { status: "picked_up", delivery_date: iso(-76), pickup_date: iso(-74) } },
    },
  ];
}
