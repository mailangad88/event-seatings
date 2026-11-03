#!/usr/bin/env node
// SEO / AEO / GEO audit for every page in the sitemap.
//
//   npm run build && npm run seo-audit            # starts `next start`, crawls, writes reports/
//   npm run seo-audit -- --base http://localhost:3000   # crawl a server that is already running
//   npm run seo-audit -- --limit 200              # quick sample
//   npm run seo-audit -- --ci                     # exit 1 on any blocking error or a low score
//
// It reads /sitemap.xml, /robots.txt and /llms.txt, fetches every URL in the sitemap, and checks
// each page for: one H1, title and meta description length, a self canonical, valid JSON-LD
// (FAQPage, BreadcrumbList, Product, ImageObject, VideoObject), a 40 to 60 word direct answer near
// the top, FAQs, image alt text, a visual (no text-only pages), internal links, broken links,
// thin and duplicate content, orphan pages and Core Web Vitals hints. Each page gets a 0 to 100
// score; the report is written to reports/seo-audit.md and reports/seo-audit.json.
//
// Rules and weights live in RULES below. "error" rules block CI; "warn" rules only lower the score.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
};
const CI = !!opt("ci", false);
const LIMIT = Number(opt("limit", 0)) || 0;
const CONCURRENCY = Number(opt("concurrency", 12));
const OUT_DIR = String(opt("out", "reports"));
const MIN_SCORE = Number(opt("min-score", 90));
const PORT = Number(opt("port", 3123));
let BASE = opt("base", "");

// Pages that are tools, forms or legal text: they still need a title, canonical, H1 and alt text,
// but not a long article, a direct answer or FAQs.
const UTILITY = [/^\/(quote|book|privacy|terms|photo-credits|vendor-listings|quiz|seating-planner|tools\/[^/]+|gallery|reviews|refer)$/];
const isUtility = (p) => UTILITY.some((re) => re.test(p));

const RULES = {
  "fetch":            { level: "error", weight: 100, label: "Page returns 200" },
  "noindex-in-sitemap": { level: "error", weight: 40, label: "Sitemap page is not noindex" },
  "title-missing":    { level: "error", weight: 25, label: "Has a <title>" },
  "title-length":     { level: "warn",  weight: 4,  label: "Title is 30 to 65 characters" },
  "title-duplicate":  { level: "error", weight: 10, label: "Title is unique" },
  "desc-missing":     { level: "error", weight: 20, label: "Has a meta description" },
  "desc-length":      { level: "warn",  weight: 4,  label: "Meta description is 70 to 165 characters" },
  "desc-duplicate":   { level: "warn",  weight: 5,  label: "Meta description is unique" },
  "canonical":        { level: "error", weight: 20, label: "Canonical points to itself" },
  "h1":               { level: "error", weight: 15, label: "Exactly one H1" },
  "lang":             { level: "error", weight: 5,  label: "<html lang> is set" },
  "og":               { level: "warn",  weight: 3,  label: "Open Graph title and image" },
  "jsonld-invalid":   { level: "error", weight: 20, label: "JSON-LD parses and has the required fields" },
  "breadcrumb":       { level: "warn",  weight: 5,  label: "BreadcrumbList schema" },
  "answer":           { level: "error", weight: 10, label: "Direct answer (30 to 100 words) near the top" },
  "answer-length":    { level: "warn",  weight: 3,  label: "Direct answer is 40 to 60 words" },
  "faq":              { level: "error", weight: 10, label: "FAQs with FAQPage schema (3 or more)" },
  "img-alt":          { level: "error", weight: 10, label: "Every image has alt text" },
  "visual":           { level: "error", weight: 15, label: "Has a visual (image, diagram or video)" },
  "thin":             { level: "error", weight: 20, label: "At least 300 words of main content" },
  "thin-warn":        { level: "warn",  weight: 4,  label: "At least 500 words of main content" },
  "duplicate":        { level: "error", weight: 15, label: "Main content is not a near-duplicate" },
  // Product variants (same item in another colour or size) are separate products with their own price
  // and specs, so a near-duplicate between two catalog item pages is a warning, not a blocker.
  "duplicate-variant": { level: "warn", weight: 4, label: "Catalog item is not a near-duplicate of a sibling variant" },
  "internal-links":   { level: "error", weight: 8,  label: "5 or more internal links in the content" },
  "broken-links":     { level: "error", weight: 15, label: "No broken internal links" },
  "orphan":           { level: "error", weight: 10, label: "Linked from at least one other page" },
  "cwv-img-size":     { level: "warn",  weight: 2,  label: "Images have width and height (CLS)" },
  "cwv-html-size":    { level: "warn",  weight: 2,  label: "HTML under 600 KB" },
  "cwv-lcp-lazy":     { level: "warn",  weight: 2,  label: "First image is not lazy-loaded (LCP)" },
};

// ---------- helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const words = (s) => (s.match(/[A-Za-z0-9$][A-Za-z0-9'’.,$%-]*/g) ?? []).length;
const clean = (s) => s.replace(/\s+/g, " ").trim();

async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "seo-audit" } });
      const body = res.status === 200 ? await res.text() : "";
      return { status: res.status, body, location: res.headers.get("location") };
    } catch (e) {
      if (i === tries - 1) return { status: 0, body: "", error: String(e) };
      await sleep(500 * (i + 1));
    }
  }
}

async function pool(items, n, fn) {
  let i = 0;
  const out = new Array(items.length);
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k], k);
      if (k % 250 === 0 && k) process.stderr.write(`  ${k}/${items.length}\n`);
    }
  }));
  return out;
}

// 64-bit simhash of 5-word shingles (two 32-bit FNV-1a halves), for near-duplicate detection.
function fnv32(str, seed) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  return h;
}
function simhash(text) {
  const t = text.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
  const v = new Int32Array(64);
  for (let i = 0; i + 5 <= t.length; i++) {
    const sh = t.slice(i, i + 5).join(" ");
    const a = fnv32(sh, 2166136261), b = fnv32(sh, 0x9747b28c);
    for (let k = 0; k < 32; k++) {
      v[k] += (a >>> k) & 1 ? 1 : -1;
      v[k + 32] += (b >>> k) & 1 ? 1 : -1;
    }
  }
  let lo = 0, hi = 0;
  for (let k = 0; k < 32; k++) {
    if (v[k] > 0) lo |= 1 << k;
    if (v[k + 32] > 0) hi |= 1 << k;
  }
  return [lo >>> 0, hi >>> 0];
}
const pop = (x) => { let c = 0; while (x) { x &= x - 1; c++; } return c; };
const hamming = (a, b) => pop((a[0] ^ b[0]) >>> 0) + pop((a[1] ^ b[1]) >>> 0);
const band = (h, b) => (b < 2 ? h[0] >>> (b * 16) : h[1] >>> ((b - 2) * 16)) & 0xffff;

// ---------- JSON-LD validation ----------
function flatten(node, out = [], key = "") {
  if (Array.isArray(node)) node.forEach((n) => flatten(n, out, key));
  else if (node && typeof node === "object") {
    // A Product inside an Offer (itemOffered) is a reference, not a product listing, so it is not validated.
    if (node["@type"] && key !== "itemOffered") out.push(node);
    if (node["@graph"]) flatten(node["@graph"], out);
    for (const [k, v] of Object.entries(node)) if (k !== "@graph" && v && typeof v === "object") flatten(v, out, k);
  }
  return out;
}
const types = (n) => [].concat(n["@type"] ?? []);
function validateNode(n) {
  const errs = [];
  const t = types(n);
  if (t.includes("FAQPage")) {
    const qs = [].concat(n.mainEntity ?? []);
    if (!qs.length) errs.push("FAQPage has no mainEntity");
    for (const q of qs) if (!q?.name || !q?.acceptedAnswer?.text) errs.push("FAQ Question missing name or acceptedAnswer.text");
  }
  if (t.includes("BreadcrumbList")) {
    const items = [].concat(n.itemListElement ?? []);
    if (!items.length) errs.push("BreadcrumbList is empty");
    items.forEach((it, i) => {
      if (it.position !== i + 1) errs.push("BreadcrumbList positions are not 1..n");
      if (!it.name) errs.push("Breadcrumb item has no name");
      if (i < items.length - 1 && !it.item) errs.push("Breadcrumb item has no item URL");
    });
  }
  if (t.includes("Product")) {
    if (!n.name) errs.push("Product has no name");
    if (!n.image) errs.push("Product has no image");
    const offers = [].concat(n.offers ?? []);
    if (!offers.length && !n.review && !n.aggregateRating) errs.push("Product needs offers, review or aggregateRating");
    for (const o of offers) {
      const isAgg = types(o).includes("AggregateOffer");
      if (!o.priceCurrency) errs.push("Offer has no priceCurrency");
      if (isAgg ? o.lowPrice == null : o.price == null && !o.priceSpecification) errs.push("Offer has no price");
    }
  }
  if (t.includes("ImageObject") && !n.contentUrl && !n.url) errs.push("ImageObject has no contentUrl/url");
  if (t.includes("VideoObject")) {
    for (const f of ["name", "description", "thumbnailUrl", "uploadDate"]) if (!n[f]) errs.push(`VideoObject has no ${f}`);
  }
  return errs;
}

// ---------- page analysis ----------
function analyse(pathname, html) {
  const root = parse(html, { comment: false, blockTextElements: { script: true, style: true, noscript: false } });
  const issues = [];
  const add = (rule, detail) => issues.push({ rule, detail });
  const meta = (sel) => root.querySelector(sel)?.getAttribute("content")?.trim() ?? "";

  const title = clean(root.querySelector("title")?.text ?? "");
  const desc = meta('meta[name="description"]');
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
  const robots = meta('meta[name="robots"]');
  const lang = root.querySelector("html")?.getAttribute("lang");

  if (!title) add("title-missing");
  else if (title.length < 30 || title.length > 65) add("title-length", `${title.length} chars`);
  if (!desc) add("desc-missing");
  else if (desc.length < 70 || desc.length > 165) add("desc-length", `${desc.length} chars`);
  if (!canonical) add("canonical", "missing");
  else {
    let cp = "";
    try { cp = new URL(canonical, "https://x.invalid").pathname.replace(/\/$/, "") || "/"; } catch { /* bad url */ }
    if (cp !== pathname) add("canonical", `points to ${canonical}`);
  }
  if (!lang) add("lang");
  if (/noindex/i.test(robots)) add("noindex-in-sitemap");
  if (!meta('meta[property="og:title"]') || !meta('meta[property="og:image"]')) add("og");

  const h1s = root.querySelectorAll("h1");
  if (h1s.length !== 1) add("h1", `${h1s.length} H1s`);

  // JSON-LD
  const nodes = [];
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try { flatten(JSON.parse(s.text), nodes); } catch (e) { add("jsonld-invalid", `JSON parse: ${String(e.message).slice(0, 60)}`); }
  }
  const schemaTypes = [...new Set(nodes.flatMap(types))];
  const ldErrs = [...new Set(nodes.flatMap(validateNode))];
  if (ldErrs.length) add("jsonld-invalid", ldErrs.slice(0, 3).join("; "));
  if (pathname !== "/" && !schemaTypes.includes("BreadcrumbList")) add("breadcrumb");

  // Main content = <main> minus nav, header nav, aside forms and the FAQ block.
  const main = root.querySelector("main") ?? root.querySelector("body") ?? root;
  for (const el of root.querySelectorAll("script, style, noscript, template")) el.remove();
  const mainText = clean(main.text);
  const wc = words(mainText);
  const utility = isUtility(pathname);
  if (!utility) {
    if (wc < 300) add("thin", `${wc} words`);
    else if (wc < 500) add("thin-warn", `${wc} words`);
  }

  // Direct answer: an element marked data-answer, otherwise the first paragraph of 20+ words
  // that appears within the first 1,200 characters after the H1.
  let answerWords = 0;
  const marked = main.querySelector("[data-answer]");
  if (marked) answerWords = words(clean(marked.text));
  else if (h1s[0]) {
    const h1Text = clean(h1s[0].text);
    const after = mainText.slice(Math.max(0, mainText.indexOf(h1Text)) + h1Text.length);
    const window = after.slice(0, 1500);
    for (const el of main.querySelectorAll("p, .lede, [class*=lede]")) {
      const t = clean(el.text);
      const w = words(t);
      if (w >= 20 && window.includes(t.slice(0, 60))) { answerWords = w; break; }
    }
  }
  if (!utility) {
    if (answerWords < 30 || answerWords > 100) add("answer", answerWords ? `${answerWords} words` : "none found");
    else if (answerWords < 40 || answerWords > 60) add("answer-length", `${answerWords} words`);
  }

  // FAQs
  const faqCount = nodes.filter((n) => types(n).includes("FAQPage")).reduce((a, n) => a + [].concat(n.mainEntity ?? []).length, 0);
  if (!utility && faqCount < 3) add("faq", `${faqCount} questions`);

  // Images and visuals
  const imgs = main.querySelectorAll("img");
  const noAlt = imgs.filter((i) => {
    const alt = i.getAttribute("alt");
    const decorative = i.getAttribute("aria-hidden") === "true" || i.getAttribute("role") === "presentation";
    return alt == null || (!alt.trim() && !decorative);
  });
  if (noAlt.length) add("img-alt", `${noAlt.length} image(s): ${noAlt.slice(0, 2).map((i) => i.getAttribute("src")).join(", ")}`);
  const svgs = main.querySelectorAll("svg").filter((s) => (s.getAttribute("role") === "img" || s.querySelector("title") || s.getAttribute("aria-label")) || s.querySelectorAll("*").length > 25);
  const visuals = imgs.length + svgs.length + main.querySelectorAll("video, canvas, picture, iframe").length;
  if (!visuals) add("visual");
  const noDims = imgs.filter((i) => !i.getAttribute("width") && !/fill|absolute|object-cover|inset-0/.test((i.getAttribute("style") ?? "") + (i.getAttribute("class") ?? "") + (i.getAttribute("data-nimg") ?? "")));
  if (noDims.length) add("cwv-img-size", `${noDims.length} image(s)`);
  if (imgs[0]?.getAttribute("loading") === "lazy" && imgs[0]?.getAttribute("fetchpriority") !== "high") add("cwv-lcp-lazy");
  if (html.length > 600_000) add("cwv-html-size", `${Math.round(html.length / 1024)} KB`);

  // Links. Content links (inside <main>) count toward the internal-link check; links anywhere on
  // the page (header and footer too) count toward inbound links for the orphan check.
  const collect = (scope) => {
    const out = new Set();
    for (const a of scope.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto|tel|sms|javascript):/.test(href)) continue;
      let u;
      try { u = new URL(href, `https://site.invalid${pathname}`); } catch { continue; }
      if (u.hostname !== "site.invalid" && !SITE_HOSTS.has(u.hostname)) continue;
      const p = decodeURI(u.pathname).replace(/\/$/, "") || "/";
      if (p !== pathname) out.add(p);
    }
    return out;
  };
  const links = collect(main);
  const allLinks = collect(root);
  if (!utility && links.size < 5) add("internal-links", `${links.size} links`);

  return { title, desc, wc, answerWords, faqCount, schemaTypes, imgs: imgs.length, visuals, links: [...links], allLinks: [...allLinks], issues, hash: wc >= 120 ? simhash(mainText) : null };
}

// ---------- main ----------
let SITE_HOSTS = new Set();
let server;

async function startServer() {
  if (!fs.existsSync(".next/BUILD_ID")) {
    console.error("No production build found. Run `npm run build` first, or pass --base <url>.");
    process.exit(2);
  }
  BASE = `http://127.0.0.1:${PORT}`;
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, PORT: String(PORT) } });
  server.stderr.on("data", (d) => process.stderr.write(d));
  for (let i = 0; i < 120; i++) {
    const r = await get(`${BASE}/robots.txt`, 1);
    if (r.status === 200) return;
    await sleep(500);
  }
  throw new Error("next start did not come up");
}

async function main() {
  const started = Date.now();
  if (!BASE) await startServer();
  BASE = String(BASE).replace(/\/$/, "");
  const site = [];
  const siteIssue = (rule, detail) => site.push({ rule, detail });

  // robots.txt + sitemap + llms.txt
  const robots = await get(`${BASE}/robots.txt`);
  if (robots.status !== 200) siteIssue("robots", "robots.txt does not return 200");
  else if (!/sitemap:/i.test(robots.body)) siteIssue("robots", "robots.txt does not reference the sitemap");
  const sm = await get(`${BASE}/sitemap.xml`);
  if (sm.status !== 200) { console.error("sitemap.xml failed", sm.status); process.exit(2); }
  const locs = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const urls = [...new Set(locs)];
  if (urls.length !== locs.length) siteIssue("sitemap", `${locs.length - urls.length} duplicate <loc> entries`);
  const hosts = new Set(urls.map((u) => new URL(u).hostname));
  SITE_HOSTS = hosts;
  const toPath = (u) => new URL(u).pathname.replace(/\/$/, "") || "/";
  let paths = urls.map(toPath);
  if (LIMIT) paths = paths.slice(0, LIMIT);

  const llms = await get(`${BASE}/llms.txt`);
  if (llms.status !== 200) siteIssue("llms", "llms.txt does not return 200");
  else {
    if (!llms.body.startsWith("# ")) siteIssue("llms", "llms.txt does not start with an H1 (# Name)");
    const llmsLinks = [...llms.body.matchAll(/\]\((https?:[^)]+)\)/g)].map((m) => m[1]).filter((u) => hosts.has(new URL(u).hostname));
    const inSitemap = new Set(urls.map(toPath));
    const missing = llmsLinks.map(toPath).filter((p) => !inSitemap.has(p));
    if (missing.length) siteIssue("llms", `${missing.length} llms.txt links are not in the sitemap: ${missing.slice(0, 5).join(", ")}`);
  }

  console.error(`Crawling ${paths.length} pages from ${BASE} ...`);
  const pages = await pool(paths, CONCURRENCY, async (p) => {
    const r = await get(`${BASE}${p}`);
    if (r.status !== 200) return { path: p, status: r.status, issues: [{ rule: "fetch", detail: `HTTP ${r.status}${r.location ? ` -> ${r.location}` : ""}` }], links: [] };
    try {
      return { path: p, status: 200, ...analyse(p, r.body) };
    } catch (e) {
      return { path: p, status: 200, issues: [{ rule: "fetch", detail: `parse error ${e}` }], links: [] };
    }
  });

  // Cross-page checks: duplicates, orphans, broken links.
  const known = new Set(pages.map((p) => p.path));
  const byTitle = new Map(), byDesc = new Map();
  for (const p of pages) {
    if (p.title) byTitle.set(p.title, [...(byTitle.get(p.title) ?? []), p.path]);
    if (p.desc) byDesc.set(p.desc, [...(byDesc.get(p.desc) ?? []), p.path]);
  }
  for (const p of pages) {
    const t = byTitle.get(p.title);
    if (t && t.length > 1) p.issues.push({ rule: "title-duplicate", detail: `same as ${t.find((x) => x !== p.path)}` });
    const d = byDesc.get(p.desc);
    if (d && d.length > 1) p.issues.push({ rule: "desc-duplicate", detail: `same as ${d.find((x) => x !== p.path)}` });
  }

  // Near-duplicates via simhash banding (4 bands of 16 bits), hamming distance <= 3.
  const bands = new Map();
  pages.forEach((p, i) => {
    if (p.hash == null) return;
    for (let b = 0; b < 4; b++) {
      const key = `${b}:${band(p.hash, b)}`;
      bands.set(key, [...(bands.get(key) ?? []), i]);
    }
  });
  const dupOf = new Map();
  for (const ids of bands.values()) {
    if (ids.length < 2 || ids.length > 400) continue;
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
      const [x, y] = [pages[ids[a]], pages[ids[b]]];
      if (hamming(x.hash, y.hash) <= 3) {
        if (!dupOf.has(y.path)) dupOf.set(y.path, x.path);
      }
    }
  }
  const itemCat = (p) => p.match(/^\/rentals\/([^/]+)\/[^/]+$/)?.[1];
  for (const p of pages) {
    const other = dupOf.get(p.path);
    if (!other) continue;
    const variant = itemCat(p.path) && itemCat(p.path) === itemCat(other);
    p.issues.push({ rule: variant ? "duplicate-variant" : "duplicate", detail: `near-duplicate of ${other}` });
  }

  // Inbound links (content links only) and broken links.
  const inbound = new Map();
  const unknown = new Set();
  for (const p of pages) for (const l of p.allLinks ?? []) {
    inbound.set(l, (inbound.get(l) ?? 0) + 1);
    if (!known.has(l)) unknown.add(l);
  }
  // Unknown targets: fetch once to see whether they resolve (pages not in the sitemap, files, etc.).
  const unknownStatus = new Map();
  const canonicalElsewhere = new Set();
  if (!LIMIT) {
    await pool([...unknown], CONCURRENCY, async (l) => {
      const r = await get(`${BASE}${l}`, 2);
      unknownStatus.set(l, r.status);
      // noindex pages (forms like /reviews/write) are meant to stay out of the sitemap.
      if (/<meta name="robots" content="[^"]*noindex/i.test(r.body)) canonicalElsewhere.add(l);
      // A page whose canonical points to another URL is a duplicate by design and belongs out of the sitemap.
      const canon = r.body.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      if (canon) {
        try { if ((new URL(canon, "https://x.invalid").pathname.replace(/\/$/, "") || "/") !== l) canonicalElsewhere.add(l); } catch { /* ignore */ }
      }
    });
  }
  const notInSitemap = [];
  for (const [l, s] of unknownStatus) if (s === 200 && !/\.\w{2,4}$/.test(l) && !canonicalElsewhere.has(l)) notInSitemap.push(l);
  if (notInSitemap.length) siteIssue("sitemap", `${notInSitemap.length} linked pages are missing from the sitemap: ${notInSitemap.slice(0, 8).join(", ")}`);
  for (const p of pages) {
    const broken = (p.allLinks ?? []).filter((l) => unknownStatus.has(l) && ![200, 301, 302, 307, 308].includes(unknownStatus.get(l)));
    if (broken.length) p.issues.push({ rule: "broken-links", detail: broken.slice(0, 3).join(", ") });
    if (!LIMIT && p.path !== "/" && !inbound.get(p.path)) p.issues.push({ rule: "orphan" });
  }

  // Scores
  for (const p of pages) {
    const seen = new Set();
    let s = 100;
    for (const i of p.issues) {
      if (seen.has(i.rule)) continue;
      seen.add(i.rule);
      s -= RULES[i.rule]?.weight ?? 5;
    }
    p.score = Math.max(0, s);
    p.errors = p.issues.filter((i) => RULES[i.rule]?.level === "error").length;
  }
  const avg = pages.reduce((a, p) => a + p.score, 0) / (pages.length || 1);
  const ruleCounts = Object.fromEntries(Object.keys(RULES).map((r) => [r, pages.filter((p) => p.issues.some((i) => i.rule === r)).length]));
  const blocking = pages.filter((p) => p.errors > 0);

  // Section breakdown by first path segment.
  const sections = new Map();
  for (const p of pages) {
    const s = "/" + (p.path.split("/")[1] ?? "");
    const e = sections.get(s) ?? { pages: 0, score: 0, errors: 0 };
    e.pages++; e.score += p.score; e.errors += p.errors ? 1 : 0;
    sections.set(s, e);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    pages: pages.length,
    score: Math.round(avg * 10) / 10,
    pagesWithErrors: blocking.length,
    siteIssues: site,
    rules: Object.fromEntries(Object.entries(RULES).map(([k, v]) => [k, { ...v, failing: ruleCounts[k] }])),
    sections: Object.fromEntries([...sections].map(([k, v]) => [k, { pages: v.pages, score: Math.round((v.score / v.pages) * 10) / 10, pagesWithErrors: v.errors }])),
    results: pages.map(({ hash, links, allLinks, ...rest }) => ({ ...rest, internalLinks: links?.length ?? 0, inbound: inbound.get(rest.path) ?? 0 })),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "seo-audit.json"), JSON.stringify(report, null, 1));

  const md = [];
  md.push(`# SEO / AEO / GEO audit`, "", `Generated ${report.generatedAt} from ${pages.length} sitemap pages in ${Math.round((Date.now() - started) / 1000)}s.`, "");
  md.push(`**Site score: ${report.score} / 100.** Pages with blocking errors: ${blocking.length}.`, "");
  md.push("## Site-wide checks", "", site.length ? site.map((s) => `- ${s.rule}: ${s.detail}`).join("\n") : "- robots.txt, sitemap.xml and llms.txt all pass.", "");
  md.push("## Checks", "", "| Check | Level | Pages failing |", "|---|---|---|");
  for (const [k, v] of Object.entries(RULES)) md.push(`| ${v.label} (\`${k}\`) | ${v.level} | ${ruleCounts[k]} |`);
  md.push("", "## By section", "", "| Section | Pages | Avg score | Pages with errors |", "|---|---|---|---|");
  for (const [k, v] of [...sections].sort((a, b) => b[1].pages - a[1].pages)) md.push(`| ${k} | ${v.pages} | ${(v.score / v.pages).toFixed(1)} | ${v.errors} |`);
  md.push("", "## Lowest-scoring pages", "", "| Page | Score | Issues |", "|---|---|---|");
  for (const p of [...pages].sort((a, b) => a.score - b.score).slice(0, 40)) {
    md.push(`| ${p.path} | ${p.score} | ${p.issues.map((i) => `${i.rule}${i.detail ? ` (${i.detail})` : ""}`).join("; ").replace(/\|/g, "/")} |`);
  }
  fs.writeFileSync(path.join(OUT_DIR, "seo-audit.md"), md.join("\n") + "\n");

  console.log(`Score ${report.score}/100 across ${pages.length} pages; ${blocking.length} with blocking errors.`);
  for (const [k, v] of Object.entries(ruleCounts)) if (v) console.log(`  ${RULES[k].level.padEnd(5)} ${k.padEnd(20)} ${v}`);
  for (const s of site) console.log(`  site  ${s.rule}: ${s.detail}`);
  console.log(`Report: ${path.join(OUT_DIR, "seo-audit.md")}`);

  server?.kill();
  if (CI && (blocking.length || site.length || report.score < MIN_SCORE)) {
    console.error(`\nSEO audit failed: ${blocking.length} pages with blocking errors, ${site.length} site issues, score ${report.score} (min ${MIN_SCORE}).`);
    for (const p of blocking.slice(0, 30)) console.error(`  ${p.path}: ${p.issues.filter((i) => RULES[i.rule]?.level === "error").map((i) => `${i.rule}${i.detail ? ` (${i.detail})` : ""}`).join("; ")}`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); server?.kill(); process.exit(2); });
