// Sanity checks for the location landing pages in src/data/geo.
// Run: npx tsx scripts/check-geo.ts   (exits 1 on errors, prints warnings)
import { chairs } from "../src/data/chairs";
import { eventTypes, locations } from "../src/data/geo";

const errors: string[] = [];
const warnings: string[] = [];
const slugs = new Set<string>();
const chairSlugs = new Set(chairs.map((c) => c.slug));
const eventSlugs = new Set(eventTypes.map((e) => e.slug));
const banned = [
  /—|(?<!\d)–|–(?!\$?\d)/, // no em dashes; en dashes only inside number ranges like $5–7
  /\bwe(?:'|’)ve (?:served|done|delivered|worked)\b/i,
  /\bour (?:past )?clients\b/i,
  /\btrusted by\b/i,
  /\b\d+ (?:years|yrs) (?:of experience|in business)\b/i,
  /\b5-star\b|\breviews?\b.*\b(?:rated|stars)\b/i,
];

for (const l of locations) {
  const where = `${l.slug}:`;
  if (slugs.has(l.slug)) errors.push(`${where} duplicate slug`);
  slugs.add(l.slug);
}

for (const l of locations) {
  const where = `${l.slug}:`;
  if (!/^[a-z0-9-]+$/.test(l.slug)) errors.push(`${where} bad slug`);
  if (l.lat < 40.9 || l.lat > 42.6 || l.lng < -89 || l.lng > -87.3) errors.push(`${where} lat/lng outside Chicagoland`);
  if (l.metaTitle.length > 60) warnings.push(`${where} metaTitle ${l.metaTitle.length} chars`);
  if (l.metaDescription.length < 120 || l.metaDescription.length > 165)
    warnings.push(`${where} metaDescription ${l.metaDescription.length} chars`);
  if ((l.headline.match(/\*/g) ?? []).length !== 2) errors.push(`${where} headline needs exactly one *emphasis*`);
  if (l.story.length !== 3) errors.push(`${where} story needs 3 paragraphs`);
  if (l.settings.length !== 4) errors.push(`${where} settings needs 4`);
  if (l.logistics.length !== 4) errors.push(`${where} logistics needs 4`);
  if (l.recommendedChairs.length !== 3) errors.push(`${where} recommendedChairs needs 3`);
  if (l.faqs.length < 5) errors.push(`${where} needs 5+ faqs`);
  for (const r of l.recommendedChairs) if (!chairSlugs.has(r.slug)) errors.push(`${where} unknown chair ${r.slug}`);
  for (const e of l.popularEvents) if (!eventSlugs.has(e)) errors.push(`${where} unknown event ${e}`);
  const missing = l.nearby.filter((n) => !slugs.has(n) || n === l.slug);
  if (missing.length) warnings.push(`${where} nearby not found: ${missing.join(", ")}`);
  if (l.nearby.length - missing.length < 2) warnings.push(`${where} fewer than 2 working nearby links`);
  const text = JSON.stringify(l);
  for (const re of banned) if (re.test(text)) errors.push(`${where} banned copy ${re}`);
  // We don't issue COIs: a page may mention them only alongside a clear "we can't issue" disclaimer.
  if (/certificates? of insurance|\bCOI\b/i.test(text) && !/(?:can't|can’t|cannot|don't|don’t|do not) (?:issue|provide)|which we can't|can't issue|isn't something we/i.test(text))
    errors.push(`${where} mentions certificates of insurance without the "we can't issue" disclaimer`);
  const words = [l.intro, ...l.story, ...l.faqs.map((f) => f.a)].join(" ").split(/\s+/).length;
  if (words < 450) warnings.push(`${where} only ${words} words of body copy`);
}

console.log(`${locations.length} locations, ${errors.length} errors, ${warnings.length} warnings`);
for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
process.exit(errors.length ? 1 : 0);
