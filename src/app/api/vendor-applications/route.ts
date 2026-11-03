import { after } from "next/server";
import { isDisposableEmail } from "@/lib/disposable-email";
import { sendEmail } from "@/lib/notify";
import { site } from "@/lib/site";
import { addLead } from "@/lib/store";
import {
  addVendorApplication,
  ApplicationsTableMissing,
  commissionPayOptions,
  depositOptions,
  insuranceOptions,
  leadTimes,
  paymentMethods,
  setupOptions,
  vendorAreas,
  vendorCategories,
  weekDays,
  weekendOptions,
  type NewVendorApplication,
  type PriceItem,
  type VendorApplication,
} from "@/lib/vendor-applications";

// Vendor sign-up from /partners/onboard. Saves the application for review in /admin/applications,
// emails the owner, and emails the vendor a link to their status page.

const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
const pick = <T extends string>(v: unknown, allowed: readonly T[]) => (allowed.includes(v as T) ? (v as T) : undefined);
const pickMany = (v: unknown, allowed: readonly string[]) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && allowed.includes(x)))] : [];
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : undefined);

function cleanItems(v: unknown): PriceItem[] | undefined {
  if (!Array.isArray(v) || !v.length) return undefined;
  const out: PriceItem[] = [];
  for (const r of v.slice(0, 1000)) {
    if (!r || typeof r !== "object") continue;
    const name = str(r.name);
    if (!name) continue;
    out.push({
      name,
      category: str(r.category, 80),
      specs: str(r.specs),
      colors: str(r.colors),
      unit: str(r.unit, 40),
      price: num(r.price),
      min_qty: num(r.min_qty),
      setup_included: typeof r.setup_included === "boolean" ? r.setup_included : undefined,
      notes: str(r.notes),
    });
  }
  return out.length ? out : undefined;
}

const cleanUrl = (v: unknown) => {
  const s = str(v, 500);
  if (!s) return undefined;
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request" }, { status: 400 });
  // Honeypot: people never see or fill this field.
  if (body.hp) return Response.json({ ok: true });
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return Response.json({ error: "Too many tries. Please wait a few minutes." }, { status: 429 });

  const email = str(body.email, 254);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (isDisposableEmail(email)) {
    return Response.json({ error: "Please use an email address you check. New orders go there." }, { status: 400 });
  }
  const company = str(body.company, 150);
  const contact_name = str(body.contact_name, 120);
  const phone = str(body.phone, 40);
  if (!company || !contact_name || !phone || phone.replace(/\D/g, "").length < 7) {
    return Response.json({ error: "Please add your company name, your name and a phone number." }, { status: 400 });
  }
  const categories = pickMany(body.categories, vendorCategories);
  const areas = pickMany(body.areas, vendorAreas);
  if (!categories.length || !areas.length) {
    return Response.json({ error: "Please pick at least one category and one delivery area." }, { status: 400 });
  }
  if (body.agree !== true) {
    return Response.json({ error: "Please tick the box to say you've read the partner terms." }, { status: 400 });
  }
  const maxEvents = Number(body.max_events_per_day);
  const photo = pick(body.photo_permission, ["yes", "no"] as const);
  const billingEmail = str(body.billing_email, 254);

  const input: NewVendorApplication = {
    company,
    contact_name,
    email,
    phone,
    website: cleanUrl(body.website),
    contact_role: str(body.contact_role, 80),
    years_in_business: str(body.years_in_business, 20),
    categories,
    areas,
    area_notes: str(body.area_notes, 500),
    order_minimum: str(body.order_minimum, 80),
    lead_time: pick(body.lead_time, leadTimes),
    setup: pick(body.setup, setupOptions),
    weekends: pick(body.weekends, weekendOptions),
    open_days: pickMany(body.open_days, weekDays),
    max_events_per_day: Number.isFinite(maxEvents) && maxEvents > 0 ? Math.min(Math.round(maxEvents), 500) : undefined,
    blackout_dates: str(body.blackout_dates, 1000),
    price_list_url: cleanUrl(body.price_list_url),
    price_items: cleanItems(body.price_items),
    deposit_policy: pick(body.deposit_policy, depositOptions),
    payment_methods: pickMany(body.payment_methods, paymentMethods),
    damage_waiver: str(body.damage_waiver, 200),
    billing_name: str(body.billing_name, 120),
    billing_email: billingEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail) ? billingEmail : undefined,
    commission_pay: pick(body.commission_pay, commissionPayOptions),
    insurance: pick(body.insurance, insuranceOptions.map((o) => o.id)),
    photo_permission: photo,
    photo_link: photo === "yes" ? cleanUrl(body.photo_link) : undefined,
    agreed_terms_at: new Date().toISOString(),
    notes: str(body.notes, 2000),
    source: str(body.source, 60) ?? "partner-onboard",
    page_path: str(body.page_path, 300),
  };

  let saved: VendorApplication | undefined;
  try {
    saved = await addVendorApplication(input);
  } catch (err) {
    if (!(err instanceof ApplicationsTableMissing)) {
      console.error("vendor application save failed", err);
      return Response.json({ error: "We couldn't save that just now. Please try again, or call us." }, { status: 500 });
    }
    // Table not created yet (schema.sql not re-run). Keep the application as a partner lead so nothing is lost.
    console.warn("VENDOR_APPLICATIONS_TABLE_MISSING: re-run supabase/schema.sql. Saved as a partner lead instead.");
    await addLead({
      kind: "partner",
      source: "partner-onboard",
      event_type: "Vendor onboarding",
      name: contact_name,
      email,
      phone,
      venue: company,
      city: areas.join(", ").slice(0, 100),
      message: summary(input).slice(0, 2000),
      page_path: input.page_path,
    });
  }

  after(async () => {
    const owner = process.env.NOTIFY_EMAIL;
    if (owner) {
      await sendEmail({
        to: owner,
        subject: `New vendor application: ${company} (${categories.slice(0, 3).join(", ")})`,
        text: [
          summary(input),
          "",
          saved ? `Review it: ${site.url}/admin/applications/${saved.id}` : `Saved as a partner lead: ${site.url}/admin/leads?kind=partner`,
        ].join("\n"),
      });
    }
    if (process.env.NOTIFY_FROM && saved) {
      await sendEmail({
        to: email,
        subject: `We have your ${site.name} partner application`,
        text: [
          `Hi ${contact_name.split(" ")[0]},`,
          "",
          `Thanks for applying to list ${company} with ${site.name}. Here is what happens next:`,
          "",
          "1. We call you within one business day to go over your service area and prices.",
          "2. You get the one-page partner agreement and a preview of your listing.",
          "3. Your listing goes live once you've checked it, and orders from Chicago-area hosts start coming to you.",
          "",
          `Check where your application is at any time: ${site.url}/partners/status/${saved.status_token}`,
          "",
          "Questions? Just reply to this email.",
          "",
          `The ${site.name} team`,
        ].join("\n"),
      });
    }
  });

  return Response.json({ ok: true, status_url: saved ? `/partners/status/${saved.status_token}` : undefined });
}

function summary(a: NewVendorApplication) {
  const row = (label: string, v?: string | number | string[]) =>
    v === undefined || v === "" || (Array.isArray(v) && !v.length) ? [] : [`${label}: ${Array.isArray(v) ? v.join(", ") : v}`];
  return [
    ...row("Company", a.company),
    ...row("Website", a.website),
    ...row("Contact", [a.contact_name, a.contact_role].filter(Boolean).join(", ")),
    ...row("Email", a.email),
    ...row("Phone", a.phone),
    ...row("Years in business", a.years_in_business),
    ...row("Rents", a.categories),
    ...row("Delivers to", a.areas),
    ...row("Area notes", a.area_notes),
    ...row("Order minimum", a.order_minimum),
    ...row("Notice needed", a.lead_time),
    ...row("Setup", a.setup),
    ...row("Weekends", a.weekends),
    ...row("Open days", a.open_days),
    ...row("Events per day", a.max_events_per_day),
    ...row("Blackout dates", a.blackout_dates),
    ...row("Price list link", a.price_list_url),
    ...row("Price list rows uploaded", a.price_items?.length),
    ...row("Deposit", a.deposit_policy),
    ...row("Takes payment by", a.payment_methods),
    ...row("Damage waiver", a.damage_waiver),
    ...row("Billing contact", [a.billing_name, a.billing_email].filter(Boolean).join(", ")),
    ...row("Pays commission by", a.commission_pay),
    ...row("Insurance certificate", insuranceOptions.find((o) => o.id === a.insurance)?.label),
    ...row("Photos", a.photo_permission === "yes" ? `OK to use with credit${a.photo_link ? ` (${a.photo_link})` : ""}` : "Use site images only"),
    ...row("Notes", a.notes),
  ].join("\n");
}
