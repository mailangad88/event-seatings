import { site } from "@/lib/site";

// The site address to put in links we send out (sign-in emails, Stripe return pages), taken from the
// request so preview and vercel.app deployments link back to themselves. Only our own hosts are trusted:
// a Host or X-Forwarded-Host header naming any other domain falls back to the site address, so a forged
// header can never put a login token or checkout return link on someone else's site.
export function allowedHost(host: string, siteUrl = site.url, dev = process.env.NODE_ENV === "development"): boolean {
  const h = host.toLowerCase().replace(/^www\./, "");
  let own = "";
  try {
    own = new URL(siteUrl).host.toLowerCase().replace(/^www\./, "");
  } catch {}
  if (h === own || /^beyondchi(?:avari|vari)\.com$/.test(h)) return true;
  if (/^beyondchiavari(-[a-z0-9-]+)?\.vercel\.app$/.test(h)) return true; // production and preview deployments
  return dev && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(h);
}

export function originFrom(h: Headers, siteUrl = site.url, dev = process.env.NODE_ENV === "development"): string {
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host || !allowedHost(host, siteUrl, dev)) return siteUrl.replace(/\/+$/, "");
  const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  return `${local ? "http" : "https"}://${host}`;
}
