// A visitor's path through the site before they sent a form: when they first came, how many visits, and each page
// (with its title and time). Kept in the visitor's own browser (localStorage) and sent only with a form they submit.
// Visitors can turn it off from the notice at the bottom of the page (lib/consent.ts); browsers that send
// Global Privacy Control are treated as "off" until the visitor says otherwise.

export type JourneyPage = { path: string; title?: string; at: string; visit: number };

// A link or button they clicked: its visible text, where it pointed (site path or outside host) and the page it was on.
export type JourneyClick = { label: string; href?: string; path: string; at: string };

export type Journey = {
  first_seen?: string;
  visits: number;
  page_views: number;
  pages: JourneyPage[];
  clicks?: JourneyClick[];
  // Added on the server from the request, never from the browser.
  device?: string;
  location?: string;
};

export const journeyMaxPages = 30;
export const journeyMaxClicks = 40;

const iso = (v: unknown) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : undefined);
const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
const count = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), 100_000) : 0;
};

// Cleans a journey sent by the browser (as a JSON string or object). Anything malformed is dropped.
export function parseJourney(raw: unknown): Journey | undefined {
  let data: unknown = raw;
  if (typeof raw === "string") {
    if (raw.length > 20_000) return undefined;
    try {
      data = JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  if (!data || typeof data !== "object") return undefined;
  const j = data as Record<string, unknown>;
  const pages: JourneyPage[] = (Array.isArray(j.pages) ? j.pages : [])
    .slice(-journeyMaxPages)
    .map((p: unknown): JourneyPage | undefined => {
      const r = (p ?? {}) as Record<string, unknown>;
      const path = text(r.path, 200);
      const at = iso(r.at);
      if (!path || !path.startsWith("/") || !at) return undefined;
      return { path, title: text(r.title, 140), at, visit: count(r.visit) || 1 };
    })
    .filter((p): p is JourneyPage => !!p);
  if (!pages.length) return undefined;
  const clicks: JourneyClick[] = (Array.isArray(j.clicks) ? j.clicks : [])
    .slice(-journeyMaxClicks)
    .map((c: unknown): JourneyClick | undefined => {
      const r = (c ?? {}) as Record<string, unknown>;
      const label = text(r.label, 80);
      const path = text(r.path, 200);
      const at = iso(r.at);
      if (!label || !path?.startsWith("/") || !at) return undefined;
      return { label, href: text(r.href, 200), path, at };
    })
    .filter((c): c is JourneyClick => !!c);
  return {
    first_seen: iso(j.first_seen) ?? pages[0].at,
    visits: count(j.visits) || 1,
    page_views: Math.max(count(j.page_views), pages.length),
    pages,
    ...(clicks.length ? { clicks } : {}),
  };
}

// "Chicago, IL, US" from the location headers Vercel adds to every request (approximate, from the IP address).
export function locationFromHeaders(headers: Headers): string | undefined {
  const dec = (v: string | null) => {
    if (!v) return undefined;
    try {
      return decodeURIComponent(v).slice(0, 60);
    } catch {
      return v.slice(0, 60);
    }
  };
  const parts = [dec(headers.get("x-vercel-ip-city")), dec(headers.get("x-vercel-ip-country-region")), dec(headers.get("x-vercel-ip-country"))];
  const out = parts.filter(Boolean).join(", ");
  return out || undefined;
}

export function deviceFromUserAgent(ua: string | null): string | undefined {
  if (!ua) return undefined;
  const os = /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux|CrOS/.test(ua) ? "Linux" : undefined;
  const kind = /iPad|Tablet/.test(ua) ? "Tablet" : /Mobi|iPhone|Android/.test(ua) ? "Phone" : "Computer";
  return os ? `${kind} (${os})` : kind;
}

// Plain label for where a visit came from, e.g. "Google search", "chatgpt.com", "Direct, bookmark or unknown".
export function sourceLabel(source?: string, medium?: string): string {
  if (!source || source === "(direct)") return "Direct, bookmark or unknown";
  const s = source.toLowerCase();
  if (medium === "organic") return `${source.replace(/\.(com|net|org)$/, "").replace(/^./, (c) => c.toUpperCase())} search`;
  if (medium === "cpc") return `${source} ad`;
  if (/chatgpt|openai|perplexity|claude|gemini|copilot/.test(s)) return `${source} (AI assistant)`;
  return medium ? `${source} (${medium})` : source;
}
