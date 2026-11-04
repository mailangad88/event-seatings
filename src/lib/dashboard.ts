import "server-only";
import { getVendor } from "@/data/vendors";
import { coordinationFee } from "./catalog-types";
import type { Lead, PageView } from "./store";

// Numbers for the /admin dashboard: how many enquiries, from where, through which page and form,
// what they are worth and where they sit in the pipeline. Pure functions over leads and page views.

export const ranges = [
  { id: "7", label: "7 days", days: 7 },
  { id: "30", label: "30 days", days: 30 },
  { id: "90", label: "90 days", days: 90 },
  { id: "365", label: "12 months", days: 365 },
  { id: "all", label: "All time", days: 0 },
] as const;
export type RangeId = (typeof ranges)[number]["id"];
// Start of the range as an ISO time, or undefined for all time.
export const rangeStart = (days: number) => (days ? new Date(Date.now() - days * 864e5).toISOString() : undefined);
export const getRange = (id?: string) => ranges.find((r) => r.id === id) ?? ranges[1];

export const kindLabels: Record<string, string> = {
  quote: "Quote request",
  call: "Call request",
  chat: "Chat message",
  quiz: "Style quiz",
  waitlist: "Waitlist",
  partner: "Vendor application",
};

const TZ = "America/Chicago";
// YYYY-MM-DD in Chicago time, so "today" matches Angad's day.
export const dayKey = (iso: string | Date) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });

export type Row = { label: string; count: number; value?: number; href?: string; sub?: string };

export function tally<T>(items: T[], key: (t: T) => string | undefined, value?: (t: T) => number): Row[] {
  const out = new Map<string, Row>();
  for (const i of items) {
    const k = key(i);
    if (!k) continue;
    const r = out.get(k) ?? { label: k, count: 0, value: value ? 0 : undefined };
    r.count += 1;
    if (value) r.value = (r.value ?? 0) + value(i);
    out.set(k, r);
  }
  return [...out.values()].sort((a, b) => b.count - a.count || (b.value ?? 0) - (a.value ?? 0));
}

const host = (url?: string) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : undefined;
  } catch {
    return undefined;
  }
};
export const pathOnly = (p?: string) => p?.split("?")[0] || undefined;

// The visit that converted (last touch); first-touch fields are used when the lead has no last touch.
const src = (l: Lead) => l.utm_source ?? l.first_utm_source;
const med = (l: Lead) => (l.utm_source ? l.utm_medium : l.first_utm_medium);

export function sourceLabel(l: Lead) {
  const s = src(l);
  return s ? [s, med(l)].filter(Boolean).join(" / ") : undefined;
}

// Groups every source into a handful of channels, the way GA4 does.
export function channel(source?: string, medium?: string, l?: Lead): string {
  const s = (source ?? "").toLowerCase();
  const m = (medium ?? "").toLowerCase();
  if (l?.gclid || l?.msclkid || /^(cpc|ppc|paid|paidsearch|paid_search)$/.test(m)) return "Paid search";
  if (l?.fbclid || /paid.?social|^social.?paid$/.test(m)) return "Paid social";
  if (/^e-?mail|newsletter/.test(m) || /mailchimp|klaviyo|hubspot.*email/.test(s)) return "Email";
  if (m === "organic" || /google|bing|duckduckgo|yahoo|ecosia|brave/.test(s)) return "Organic search";
  if (/chatgpt|openai|perplexity|claude|gemini|copilot/.test(s)) return "AI assistants";
  if (/social|facebook|instagram|pinterest|tiktok|linkedin|^t\.co$|twitter|x\.com|reddit|youtube|nextdoor/.test(s + " " + m))
    return "Social";
  if (/sms|text/.test(m)) return "Text message";
  if (/qr|print|flyer|card/.test(m + " " + s)) return "Print / QR";
  if (!s || s === "(direct)") return "Direct";
  return "Referral";
}
export const leadChannel = (l: Lead) => channel(src(l), med(l), l);

// Which form a lead came through, from the `source` each form sends ("quote-builder:look-blush-garden" → "Quote builder").
const formNames: Record<string, string> = {
  "quote-builder": "Quote builder",
  look: "Shop-the-look form",
  chat: "Chat dock",
  "seating-planner": "Seating planner",
  "seating-readiness": "Seating readiness score",
  "style-quiz": "Style quiz",
  quiz: "Style quiz",
  guide: "Guide download",
};
export function formName(l: Lead) {
  const prefix = (l.source ?? "").split(":")[0];
  if (formNames[prefix]) return formNames[prefix];
  if (prefix) return prefix.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  return kindLabels[l.kind] ?? l.kind;
}
// The specific link or preset inside a form, e.g. "look-blush-garden".
export const formDetail = (l: Lead) => l.source?.split(":").slice(1).join(":") || undefined;

const isWon = (l: Lead) => l.status === "booked" || l.status === "completed";
const isOpen = (l: Lead) => !isWon(l) && l.status !== "lost" && l.status !== "future_season";

// Hours from the lead arriving to the first time someone acted on it (a call, email, text or stage change).
export function firstResponseHours(l: Lead): number | undefined {
  const hit = (l.activity ?? []).find(
    (a) => ["call", "email", "text"].includes(a.type) || (a.type === "status" && a.text.startsWith("Stage:")),
  );
  if (!hit) return undefined;
  return Math.max(0, (new Date(hit.at).getTime() - new Date(l.created_at).getTime()) / 36e5);
}

const median = (xs: number[]) => {
  if (xs.length === 0) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export type DayPoint = { day: string; count: number; quotes: number; value: number; views: number; visitors: number };

export function buildDashboard(allLeads: Lead[], views: PageView[], rangeDays: number, now = new Date()) {
  const since = rangeDays ? new Date(now.getTime() - rangeDays * 864e5) : undefined;
  const prevSince = rangeDays ? new Date(now.getTime() - 2 * rangeDays * 864e5) : undefined;
  const inRange = (iso: string) => !since || new Date(iso) >= since;
  const leads = allLeads.filter((l) => inRange(l.created_at));
  const prevLeads = since && prevSince ? allLeads.filter((l) => new Date(l.created_at) >= prevSince && new Date(l.created_at) < since) : undefined;
  // Form starts are stored as page views on "/__form-start/<page>" (see /api/views); keep them out of visit counts.
  const formStartPrefix = "/__form-start";
  const rangeStarts = views.filter((v) => v.path.startsWith(formStartPrefix) && inRange(v.created_at));
  const rangeViews = views.filter((v) => !v.path.startsWith("/__") && inRange(v.created_at));
  views = views.filter((v) => !v.path.startsWith("/__"));

  const quotes = leads.filter((l) => l.kind === "quote");
  const priced = quotes.filter((l) => (l.quote_subtotal ?? 0) > 0);
  const quoteValue = priced.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0);
  const won = leads.filter(isWon);
  const wonValue = won.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0);
  // Our earnings are the flat coordination fee per event (no markup on items since Nov 4 2026).
  const wonMargin = won.reduce((s, l) => s + (l.fee_amount ?? coordinationFee(l.guest_count)), 0);
  const decided = leads.filter((l) => isWon(l) || l.status === "lost").length;
  const visitors = new Set(rangeViews.map((v) => v.visitor_id)).size;
  const responses = leads.map(firstResponseHours).filter((h): h is number => h !== undefined);
  const uncontacted = leads.filter((l) => (l.status ?? "new") === "new").length;

  // Daily series. "All time" starts at the first lead or view.
  const firstDay =
    since ??
    new Date(
      Math.min(now.getTime(), ...allLeads.map((l) => new Date(l.created_at).getTime()), ...views.slice(0, 1).map((v) => new Date(v.created_at).getTime())),
    );
  const days: DayPoint[] = [];
  const index = new Map<string, DayPoint>();
  for (let t = new Date(dayKey(firstDay) + "T12:00:00Z").getTime(); dayKey(new Date(t)) <= dayKey(now); t += 864e5) {
    const p = { day: dayKey(new Date(t)), count: 0, quotes: 0, value: 0, views: 0, visitors: 0 };
    days.push(p);
    index.set(p.day, p);
    if (days.length > 800) break;
  }
  for (const l of leads) {
    const p = index.get(dayKey(l.created_at));
    if (!p) continue;
    p.count += 1;
    if (l.kind === "quote") p.quotes += 1;
    p.value += l.quote_subtotal ?? 0;
  }
  const dayVisitors = new Map<string, Set<string>>();
  for (const v of rangeViews) {
    const d = dayKey(v.created_at);
    const p = index.get(d);
    if (!p) continue;
    p.views += 1;
    const set = dayVisitors.get(d) ?? new Set();
    set.add(v.visitor_id);
    dayVisitors.set(d, set);
  }
  for (const [d, set] of dayVisitors) index.get(d)!.visitors = set.size;
  // Long ranges read better by week.
  const series = days.length > 120 ? byWeek(days) : days;

  // Conversion by page: enquiries sent from a page vs. unique visitors who saw it.
  const pageVisitors = new Map<string, Set<string>>();
  const pageViews = new Map<string, number>();
  for (const v of rangeViews) {
    pageViews.set(v.path, (pageViews.get(v.path) ?? 0) + 1);
    const set = pageVisitors.get(v.path) ?? new Set();
    set.add(v.visitor_id);
    pageVisitors.set(v.path, set);
  }
  const pageLeads = new Map<string, Lead[]>();
  for (const l of leads) {
    const p = pathOnly(l.page_path);
    if (!p) continue;
    pageLeads.set(p, [...(pageLeads.get(p) ?? []), l]);
  }
  // Unique visitors who started a form on each page (typed into any field).
  const pageStarts = new Map<string, Set<string>>();
  for (const v of rangeStarts) {
    const p = v.path.slice(formStartPrefix.length) || "/";
    const set = pageStarts.get(p) ?? new Set();
    set.add(v.visitor_id);
    pageStarts.set(p, set);
  }
  const pages = [...new Set([...pageViews.keys(), ...pageLeads.keys()])]
    .map((path) => {
      const ls = pageLeads.get(path) ?? [];
      const vis = pageVisitors.get(path)?.size ?? 0;
      return {
        path,
        views: pageViews.get(path) ?? 0,
        visitors: vis,
        enquiries: ls.length,
        starts: pageStarts.get(path)?.size ?? 0,
        value: ls.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0),
        rate: vis ? ls.length / vis : undefined,
      };
    })
    .sort((a, b) => b.enquiries - a.enquiries || b.visitors - a.visitors)
    .slice(0, 40);

  // Visitors by channel, so each channel's conversion rate can be shown next to its enquiries.
  const channelVisitors = new Map<string, Set<string>>();
  for (const v of rangeViews) {
    const [s, m] = (v.source ?? "").split(" / ");
    const c = channel(s || undefined, m);
    const set = channelVisitors.get(c) ?? new Set();
    set.add(v.visitor_id);
    channelVisitors.set(c, set);
  }
  const channels = tally(leads, leadChannel, (l) => l.quote_subtotal ?? 0).map((r) => {
    const vis = channelVisitors.get(r.label)?.size ?? 0;
    return { ...r, visitors: vis, rate: vis ? r.count / vis : undefined };
  });
  for (const [c, set] of channelVisitors) {
    if (!channels.some((r) => r.label === c)) channels.push({ label: c, count: 0, value: 0, visitors: set.size, rate: 0 });
  }

  // Items and categories across every quote in range.
  const items = new Map<string, { label: string; quotes: number; qty: number; value: number; category: string }>();
  const categories = new Map<string, { label: string; quotes: Set<string>; qty: number; value: number }>();
  const vendorDemand = new Map<string, { label: string; quotes: Set<string>; lines: number; cost: number; value: number }>();
  for (const l of quotes) {
    for (const line of l.items ?? []) {
      const key = line.id;
      const it = items.get(key) ?? { label: line.name.replace(/ \([^)]*\)$/, ""), quotes: 0, qty: 0, value: 0, category: line.category };
      it.quotes += 1;
      it.qty += line.qty;
      it.value += line.line_total;
      items.set(key, it);
      const c = categories.get(line.category) ?? { label: line.category, quotes: new Set(), qty: 0, value: 0 };
      c.quotes.add(l.id);
      c.qty += line.qty;
      c.value += line.line_total;
      categories.set(line.category, c);
      const v = vendorDemand.get(line.vendor_id) ?? {
        label: getVendor(line.vendor_id)?.name ?? line.vendor_id,
        quotes: new Set(),
        lines: 0,
        cost: 0,
        value: 0,
      };
      v.quotes.add(l.id);
      v.lines += 1;
      v.cost += line.vendor_price * line.qty;
      v.value += line.line_total;
      vendorDemand.set(line.vendor_id, v);
    }
  }

  const assigned = tally(
    leads.filter((l) => l.assigned_vendor),
    (l) => getVendor(l.assigned_vendor!)?.name ?? l.assigned_vendor,
    (l) => l.quote_subtotal ?? 0,
  );

  return {
    leads,
    quotes,
    prevCount: prevLeads?.length,
    kpis: {
      enquiries: leads.length,
      quotes: quotes.length,
      visitors,
      views: rangeViews.length,
      conversion: visitors ? leads.length / visitors : undefined,
      quoteValue,
      avgQuote: priced.length ? quoteValue / priced.length : undefined,
      margin: priced.reduce((s, l) => s + (l.fee_amount ?? coordinationFee(l.guest_count)), 0),
      wonCount: won.length,
      wonValue,
      wonMargin,
      winRate: decided ? won.length / decided : undefined,
      medianResponse: median(responses),
      uncontacted,
      openValue: leads.filter(isOpen).reduce((s, l) => s + (l.quote_subtotal ?? 0), 0),
      guests: quotes.reduce((s, l) => s + (l.guest_count ?? 0), 0),
    },
    series,
    weekly: series !== days,
    byKind: tally(leads, (l) => kindLabels[l.kind] ?? l.kind),
    byScore: tally(leads, (l) => (l.lead_score ? `${l.lead_score} lead` : undefined)),
    formStarts: new Set(rangeStarts.map((v) => v.visitor_id)).size,
    forms: tally(leads, formName, (l) => l.quote_subtotal ?? 0),
    formLinks: tally(leads.filter((l) => formDetail(l)), (l) => `${formName(l)} · ${formDetail(l)}`),
    channels,
    sources: tally(leads, sourceLabel),
    campaigns: tally(leads, (l) => l.utm_campaign ?? l.first_utm_campaign),
    referrers: tally(leads, (l) => host(l.referrer ?? l.first_referrer)),
    landing: tally(leads, (l) => pathOnly(l.first_landing_page ?? l.landing_page)),
    pages,
    hasViews: views.length > 0,
    items: [...items.values()].sort((a, b) => b.quotes - a.quotes || b.value - a.value).slice(0, 15),
    categories: [...categories.values()]
      .map((c) => ({ label: c.label, quotes: c.quotes.size, qty: c.qty, value: c.value }))
      .sort((a, b) => b.value - a.value),
    vendorDemand: [...vendorDemand.values()]
      .map((v) => ({ label: v.label, quotes: v.quotes.size, lines: v.lines, cost: v.cost, value: v.value }))
      .sort((a, b) => b.value - a.value),
    assigned,
    unassignedOpen: leads.filter((l) => isOpen(l) && l.kind === "quote" && !l.assigned_vendor).length,
    lostReasons: tally(leads.filter((l) => l.status === "lost"), (l) => l.lost_reason || "No reason recorded"),
    eventTypes: tally(quotes, (l) => l.event_type, (l) => l.quote_subtotal ?? 0),
    cities: tally(quotes, (l) => l.city?.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())),
    eventMonths: tally(quotes, (l) =>
      l.event_date ? new Date(`${l.event_date}T12:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : undefined,
    ).sort((a, b) => new Date(`1 ${a.label}`).getTime() - new Date(`1 ${b.label}`).getTime()),
    guestBands: tally(quotes, (l) => {
      const g = l.guest_count;
      if (!g) return undefined;
      return g <= 50 ? "Up to 50" : g <= 100 ? "51–100" : g <= 150 ? "101–150" : g <= 250 ? "151–250" : "250+";
    }).sort((a, b) => ["Up to 50", "51–100", "101–150", "151–250", "250+"].indexOf(a.label) - ["Up to 50", "51–100", "101–150", "151–250", "250+"].indexOf(b.label)),
  };
}

function byWeek(days: DayPoint[]): DayPoint[] {
  const out: DayPoint[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    out.push({
      day: chunk[0].day,
      count: chunk.reduce((s, d) => s + d.count, 0),
      quotes: chunk.reduce((s, d) => s + d.quotes, 0),
      value: chunk.reduce((s, d) => s + d.value, 0),
      views: chunk.reduce((s, d) => s + d.views, 0),
      visitors: chunk.reduce((s, d) => s + d.visitors, 0),
    });
  }
  return out;
}

export type Dashboard = ReturnType<typeof buildDashboard>;
