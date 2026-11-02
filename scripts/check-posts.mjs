#!/usr/bin/env node
// Quality gate for journal posts in content/blog.
// Usage: node scripts/check-posts.mjs [files...]   (no args = every post)
// Exits 1 if any post fails. Warnings don't fail the run.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const blogDir = path.join(root, "content", "blog");
const topics = [
  "Chairs", "Tables", "Linens & Napkins", "Dinnerware", "Glassware & Bar", "Tents", "Lighting & Power",
  "Dance Floors & Decor", "Catering Equipment", "Lounge & Specialty", "Weddings", "Cultural Celebrations",
  "Parties", "Corporate & Nonprofit", "Chicago Planning", "Suburb Guides", "Budget & Booking",
  "Layouts & Floor Plans", "Seasons & Venues", "Planning",
];
const topicSlug = (n) => n.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const chairs = [...fs.readFileSync(path.join(root, "src/data/chairs.ts"), "utf8").matchAll(/^\s{4}slug: "([a-z-]+)"/gm)].map((m) => m[1]);
const allSlugs = new Set(fs.readdirSync(blogDir).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)));
const staticRoutes = new Set(["/", "/chairs", "/quote", "/book", "/quiz", "/faq", "/blog", "/about"]);
const banned = [/award[- ]winning/i, /\b\d+\+? years of experience/i, /happy (clients|customers|couples)/i, /5[- ]star/i, /our (past )?clients (say|love)/i, /we('ve| have) (served|delivered|set up) /i, /as seen in/i, /trusted by/i, /lorem/i, /TODO|TBD/];

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...allSlugs].map((s) => path.join(blogDir, `${s}.md`));

let failed = 0;
const titles = new Map();
for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const slug = path.basename(file, ".md");
  const errors = [];
  const warns = [];
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) { console.log(`✗ ${slug}: missing --- header ---`); failed++; continue; }
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  const body = m[2];
  if (!/^[a-z0-9-]+$/.test(slug)) errors.push("slug must be lowercase a-z, 0-9 and dashes");
  for (const k of ["title", "description", "date", "tags", "keyword"]) if (!meta[k]) errors.push(`header is missing ${k}:`);
  if (meta.title && meta.title.length > 75) warns.push(`title is ${meta.title.length} chars (aim for 70 or fewer)`);
  if (meta.description && (meta.description.length < 90 || meta.description.length > 170)) warns.push(`description is ${meta.description.length} chars (aim for 120-160)`);
  if (meta.date && !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) errors.push("date must be YYYY-MM-DD");
  const firstTag = (meta.tags ?? "").split(",")[0].trim();
  if (!topics.includes(firstTag)) errors.push(`first tag "${firstTag}" must be one of: ${topics.join(" | ")}`);
  if (meta.chair && !chairs.includes(meta.chair)) errors.push(`chair: "${meta.chair}" is not a chair slug (${chairs.join(", ")})`);
  if (meta.image) {
    if (!fs.existsSync(path.join(root, "public", meta.image))) errors.push(`image ${meta.image} does not exist in /public`);
    if (!meta.imageAlt) errors.push("image: needs imageAlt:");
  }
  if (!meta.chair && !meta.image) errors.push("set chair: or image: so the post has a hero visual");
  if (meta.title) {
    const key = meta.title.toLowerCase();
    if (titles.has(key)) errors.push(`duplicate title with ${titles.get(key)}`);
    titles.set(key, slug);
  }

  // Answer-first and FAQs (FAQPage schema comes from these).
  if (!/<div class="answer-box">\s*\n\s*\n\*\*Quick answer\*\*/.test(body)) errors.push('missing <div class="answer-box"> with a blank line then **Quick answer**');
  const faq = body.match(/^## Frequently asked questions\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1];
  const qs = faq ? faq.split(/^### /m).slice(1).length : 0;
  if (qs < 5) errors.push(`needs "## Frequently asked questions" with at least 5 "### Question?" entries (found ${qs})`);

  // Visuals: at least one inline SVG figure plus two more visual blocks.
  const svgs = [...body.matchAll(/<svg[\s\S]*?<\/svg>/g)].map((x) => x[0]);
  if (!svgs.length) errors.push("needs at least one <figure> with an inline <svg> diagram");
  for (const svg of svgs) {
    if (!/role="img"/.test(svg)) errors.push("each <svg> needs role=\"img\"");
    if (!/<title[^>]*>[^<]{8,}<\/title>/.test(svg)) errors.push("each <svg> needs a descriptive <title>");
    if (!/<desc[^>]*>[^<]{20,}<\/desc>/.test(svg)) errors.push("each <svg> needs a <desc> describing what it shows");
    if (!/viewBox="/.test(svg)) errors.push("each <svg> needs a viewBox");
    if (/\n\s*\n/.test(svg)) errors.push("an <svg> contains a blank line (Markdown would break it)");
    const vbw = Number(svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+)/)?.[1] ?? 720);
    const minFont = Math.round(vbw / 36); // ~10.5px on a 380px-wide phone column
    const small = [...svg.matchAll(/font-size="([\d.]+)"/g)].map((x) => Number(x[1])).filter((n) => n < minFont);
    if (small.length) errors.push(`svg text too small for phones: font-size ${[...new Set(small)].join(", ")} (minimum ${minFont} for a ${vbw}-wide viewBox)`);
    if (/#fff\b|#ffffff|white"/i.test(svg) && !/var\(--/.test(svg)) warns.push("svg uses hard-coded white; prefer var(--surface)/currentColor so it works on dark and light pages");
  }
  for (const fig of body.matchAll(/<figure[\s\S]*?<\/figure>/g)) {
    if (/\n\s*\n/.test(fig[0])) errors.push("a <figure> contains a blank line (Markdown would break it)");
    if (!/<figcaption>/.test(fig[0])) errors.push("each <figure> needs a <figcaption>");
  }
  const visuals =
    (body.match(/<figure/g) ?? []).length +
    (body.match(/^\|.*\|\s*$\n^\|[\s:-]+\|/gm) ?? []).length +
    (body.match(/<ol class="flow">/g) ?? []).length +
    (body.match(/<div class="stat-grid">/g) ?? []).length +
    (body.match(/<div class="chair-pair">/g) ?? []).length;
  if (visuals < 3) errors.push(`needs at least 3 visual blocks (svg figures, tables, flow, stat-grid, chair-pair); found ${visuals}`);
  for (const img of body.matchAll(/<img [^>]*>/g)) {
    if (!/alt="[^"]{10,}"/.test(img[0])) errors.push(`<img> without descriptive alt: ${img[0].slice(0, 60)}`);
    const src = img[0].match(/src="([^"]+)"/)?.[1];
    if (src?.startsWith("/") && !fs.existsSync(path.join(root, "public", src))) errors.push(`<img> src ${src} does not exist`);
  }

  // Length, without SVG markup.
  const words = body.replace(/<svg[\s\S]*?<\/svg>/g, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  if (words < 900) errors.push(`only ${words} words (minimum 900)`);

  // Internal links must resolve.
  const links = [...body.matchAll(/\]\((\/[^)\s#]*)/g), ...body.matchAll(/href="(\/[^"#]*)"/g)].map((x) => x[1].replace(/\?.*$/, ""));
  for (const l of links) {
    const ok =
      staticRoutes.has(l) ||
      (l.startsWith("/chairs/") && chairs.includes(l.slice(8))) ||
      (l.startsWith("/blog/topic/") && topics.map(topicSlug).includes(l.slice(12))) ||
      (l.startsWith("/blog/") && allSlugs.has(l.slice(6)));
    if (!ok) errors.push(`internal link ${l} doesn't exist`);
  }
  const ctas = links.filter((l) => l === "/book" || l === "/quote").length;
  if (!ctas) errors.push("link to /book or /quote at least once");
  if (new Set(links.filter((l) => l.startsWith("/chairs/") || l.startsWith("/blog/"))).size < 2) warns.push("add more internal links (chair pages or related posts)");

  for (const b of banned) if (b.test(body)) errors.push(`contains a claim we can't make yet: ${b}`);
  if (!/Chicago/.test(body)) errors.push("never mentions Chicago");

  if (errors.length) failed++;
  const mark = errors.length ? "✗" : "✓";
  if (errors.length || warns.length || files.length < 30) {
    console.log(`${mark} ${slug} (${words} words, ${qs} FAQs, ${visuals} visuals)`);
    for (const e of errors) console.log(`    error: ${e}`);
    for (const w of warns) console.log(`    warn:  ${w}`);
  }
}
console.log(`\n${files.length - failed}/${files.length} posts pass.`);
process.exit(failed ? 1 : 0);
