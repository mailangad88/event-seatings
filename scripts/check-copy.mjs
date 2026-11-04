#!/usr/bin/env node
// Fails when site copy uses jargon or AI-sounding phrases. Rules and swaps: docs/plain-writing-rules.md.
// Usage: node scripts/check-copy.mjs [files or folders...]   (default: src content)
// In .ts/.tsx only string literals and JSX text are checked, so variable names and comments don't count.
// In .json only "alt", "caption", "title", "text", "intro" and similar visible fields are checked (image prompts are skipped).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const BANNED = [
  [/\breal humans?\b/i, "talk to us / a person on our team"],
  [/\bseamless(ly)?\b/i, "say what we do"],
  [/\beffortless(ly)?\b/i, "easy"],
  [/\b(hassle|stress|worry)[- ]free\b/i, "say what we handle"],
  [/\bcurated\b(?![- ]?rentals)/i, "picked, chosen"],
  [/\b(unforgettable|breathtaking|stunning|magical|wow factor)\b/i, "say what it looks like"],
  [/\b(vibrant|bustling)\b/i, "busy, colorful, large"],
  [/\btight[- ]knit\b/i, "close-knit"],
  [/\bnestled\b|\bin the heart of\b/i, "is in, sits on, is near"],
  [/\b(one-stop|one stop shop|turnkey|end-to-end|white[- ]glove)\b/i, "one quote for everything, we handle delivery and setup"],
  [/\b(peace of mind|rest easy|sit back and relax)\b/i, "say what's covered"],
  [/\b(look no further|say goodbye to|got you covered)\b/i, "cut it"],
  [/\b(delve|deep dive|dive in|tapestry|testament to|game[- ]changer|next level|unparalleled|world[- ]class|best[- ]in[- ]class|cutting[- ]edge|synergy)\b/i, "cut it"],
  [/\belevate your\b|\ba touch of (luxury|glamour|elegance|class)\b/i, "describe the thing"],
  [/\b(vetted|pre-qualified|acquisition cost|long-tail|answer engines?)\b/i, "plain words: established, customers, orders"],
];

const VISIBLE_JSON_KEYS = /"(alt|caption|title|text|intro|description|summary|q|a|answer|blurb|label|note|why|tip|body)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;

function strings(src, ext) {
  if (ext === ".md") return src;
  if (ext === ".json") return [...src.matchAll(VISIBLE_JSON_KEYS)].map((m) => m[2]).join("\n");
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\s\/\/\s.*$/gm, "");
  const out = [];
  for (const m of code.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`|>([^<>{}]+)</g)) {
    out.push(m[1] ?? m[2] ?? m[3] ?? m[4]);
  }
  return out.join("\n");
}

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (f !== "node_modules" && !f.startsWith(".")) yield* walk(join(p, f));
  } else if ([".ts", ".tsx", ".md", ".mdx", ".json"].includes(extname(p))) yield p;
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : ["src", "content"];
let problems = 0;
for (const t of targets) {
  for (const file of walk(t)) {
    const text = strings(readFileSync(file, "utf8"), extname(file));
    for (const line of text.split("\n")) {
      for (const [re, fix] of BANNED) {
        const m = line.match(re);
        if (m) {
          problems++;
          const i = Math.max(0, m.index - 50);
          console.log(`${file}: "${m[0]}" -> ${fix}\n    …${line.slice(i, m.index + 60).trim()}…`);
        }
      }
    }
  }
}
if (problems) {
  console.log(`\n${problems} phrase(s) to rewrite. See docs/plain-writing-rules.md.`);
  process.exit(1);
}
console.log("Copy check passed: no banned phrases.");
