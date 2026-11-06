// One-time (re-runnable) migration: imports every Markdown post in /content/blog into Sanity,
// so each one is editable in Studio (not just new posts written there). Idempotent: each post
// gets a deterministic document id (`post-<slug>`) and is written with createOrReplace, so
// running this again just re-syncs from Markdown (any edits already made in Studio to an
// imported post would be overwritten — this is meant to run once, before anyone edits there).
//
// Needs real internet access to api.sanity.io and the live site, so run it from GitHub Actions
// (workflow_dispatch: "Import blog posts to Sanity"), not from a sandboxed session.
//
// Required env: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN
// Optional env: SITE_URL (default https://beyondchiavari.com), IMPORT_CONCURRENCY (default 4)

import { createClient } from "@sanity/client";
import { parse as parseHtml } from "node-html-parser";
import { marked } from "marked";
import { promises as fs } from "fs";
import path from "path";

const SITE_URL = process.env.SITE_URL || "https://beyondchiavari.com";
const CONCURRENCY = Number(process.env.IMPORT_CONCURRENCY || 4);
const DRY_RUN = process.argv.includes("--dry-run");

const projectId = requireEnv("SANITY_PROJECT_ID");
const dataset = requireEnv("SANITY_DATASET");
const token = DRY_RUN ? undefined : requireEnv("SANITY_WRITE_TOKEN");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-01-01", useCdn: false });

// Same 20 topic names as src/lib/blog.ts's `topics`, so post.topic matches the hub pages.
const TOPIC_NAMES = [
  "Chairs", "Tables", "Linens & Napkins", "Dinnerware", "Glassware & Bar", "Tents",
  "Lighting & Power", "Dance Floors & Decor", "Catering Equipment", "Lounge & Specialty",
  "Weddings", "Cultural Celebrations", "Parties", "Corporate & Nonprofit", "Chicago Planning",
  "Suburb Guides", "Budget & Booking", "Layouts & Floor Plans", "Seasons & Venues", "Planning",
];

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {};
  for (const line of (match?.[1] ?? "").split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: match?.[2] ?? raw };
}

// Mirrors src/lib/blog.ts's extractFaqs: pulls Q&A pairs out of "## Frequently asked questions".
function extractFaqs(body) {
  const section = body.match(/^## Frequently asked questions\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1];
  if (!section) return [];
  return section
    .split(/^### /m)
    .slice(1)
    .map((chunk) => {
      const [q, ...rest] = chunk.split("\n");
      const a = rest
        .join("\n")
        .trim()
        .split(/\n\s*\n/)[0]
        .replace(/<[^>]+>/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return { question: q.trim(), answer: a };
    })
    .filter((f) => f.question && f.answer);
}

let blockKey = 0;
const key = () => `b${blockKey++}`;

/** HTML (from marked) -> Portable Text body. Headings become real blocks; everything else
 * (paragraphs, divs, figures, lists, tables) stays as an "html" passthrough block, so the page
 * renders byte-for-byte like the Markdown version did. Stops at the FAQ heading: PostBody
 * replaces everything from there with the structured `faqs` field already. */
function toPortableText(html) {
  const root = parseHtml(html);
  const blocks = [];
  for (const node of root.childNodes) {
    if (node.nodeType !== 1) continue; // skip stray text/whitespace
    const tag = node.tagName?.toLowerCase();
    if (tag === "h2" || tag === "h3") {
      const text = node.text.trim();
      blocks.push({ _type: "block", _key: key(), style: tag, children: [{ _type: "span", _key: key(), text, marks: [] }] });
      if (text === "Frequently asked questions") break;
      continue;
    }
    const code = node.toString();
    if (code.trim()) blocks.push({ _type: "html", _key: key(), code });
  }
  return blocks;
}

async function withRetry(fn, label, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === attempts) throw e;
      console.warn(`  retry ${i}/${attempts - 1} for ${label}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

/** The hero image the live page already resolved (from its BlogPosting JSON-LD), so we don't
 * have to reimplement the chair/topic-art/hero-render fallback logic here. */
async function fetchLiveImage(slug) {
  const res = await withRetry(() => fetch(`${SITE_URL}/blog/${slug}`), `fetch /blog/${slug}`);
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(/"@type":"BlogPosting"[\s\S]*?"image":\[\{"@type":"ImageObject","url":"([^"]+)","caption":"([^"]*)"/);
  if (!m) return null;
  return { url: m[1].replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16))), caption: m[2] };
}

async function uploadMainImage(slug, title) {
  const found = await fetchLiveImage(slug).catch(() => null);
  if (!found) return null;
  const imgRes = await withRetry(() => fetch(found.url), `download image for ${slug}`).catch(() => null);
  if (!imgRes || !imgRes.ok) return null;
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const filename = path.basename(new URL(found.url).pathname) || `${slug}.jpg`;
  const asset = await withRetry(() => client.assets.upload("image", buffer, { filename, contentType }), `upload image for ${slug}`);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: found.caption || title };
}

async function importOne(file) {
  const slug = file.replace(/\.md$/, "");
  const raw = await fs.readFile(path.join("content", "blog", file), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const tags = (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const topic = TOPIC_NAMES.find((t) => t.toLowerCase() === (tags[0] ?? "").toLowerCase()) ?? "Planning";
  const faqs = extractFaqs(body);
  const html = (await marked.parse(body)).replace(
    /<div class="table-wrap">/g,
    '<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable table">',
  );
  const bodyBlocks = toPortableText(html);
  const mainImage = await uploadMainImage(slug, meta.title ?? slug).catch((e) => {
    console.warn(`  no image for ${slug}: ${e.message}`);
    return null;
  });

  const doc = {
    _id: `post-${slug}`,
    _type: "post",
    title: meta.title ?? slug,
    slug: { _type: "slug", current: slug },
    description: meta.description ?? "",
    publishedAt: meta.date ?? "1970-01-01",
    topic,
    tags,
    body: bodyBlocks,
    faqs: faqs.length ? faqs : undefined,
    keyword: meta.keyword || undefined,
    importedFrom: "markdown-migration",
    ...(mainImage ? { mainImage } : {}),
  };

  if (DRY_RUN) return { slug, ok: true, dryRun: true };
  await withRetry(() => client.createOrReplace(doc), `createOrReplace ${slug}`);
  return { slug, ok: true };
}

async function runPool(items, limit, fn) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = await fn(items[i]);
      } catch (e) {
        results[i] = { slug: items[i], ok: false, error: e.message };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const files = (await fs.readdir(path.join("content", "blog"))).filter((f) => f.endsWith(".md"));
  console.log(`Importing ${files.length} posts into Sanity (project ${projectId}, dataset ${dataset})${DRY_RUN ? " [dry run]" : ""}...`);
  let done = 0;
  const results = await runPool(files, CONCURRENCY, async (file) => {
    const r = await importOne(file);
    done += 1;
    if (done % 25 === 0) console.log(`  ${done}/${files.length}`);
    return r;
  });
  const failed = results.filter((r) => !r.ok);
  console.log(`Done: ${results.length - failed.length}/${results.length} imported.`);
  if (failed.length) {
    console.log(`${failed.length} failed:`);
    for (const f of failed) console.log(`  ${f.slug}: ${f.error}`);
    process.exitCode = 1;
  }
}

main();
