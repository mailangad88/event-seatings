#!/usr/bin/env node
// Fails when a page drifts off the design system: font sizes, fonts, colours or spacing that
// aren't tokens. The scale and tokens live in src/app/globals.css; the guide is docs/DESIGN_SYSTEM.md.
// Usage: node scripts/check-design.mjs [files or folders...]   (default: src)
// Only class names are checked. Inline style objects (emails, OG images, Remotion, SVG art) are skipped.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const RULES = [
  [/(?<![\w-])(?:[a-z0-9-]+:)*text-\[\d[\w.%]*\]/g, "one-off font size: use the type scale (text-xs … text-6xl)"],
  [/(?<![\w-])(?:[a-z0-9-]+:)*text-[78]xl\b/g, "past the top of the type scale: use display-1 or text-6xl at most"],
  [/(?<![\w-])(?:[a-z0-9-]+:)*font-serif\b/g, "the serif is only for the logo: use headline / display-* / font-heading"],
  [/(?<![\w-])(?:[a-z0-9-]+:)*(?:bg|text|border|from|via|to|fill|stroke|ring|outline|decoration|divide|accent|caret)-\[#[0-9a-fA-F]{3,8}\]/g, "hard-coded colour: use a colour token (wine, gold, green, amber, rose, blue, ink, muted…)"],
  [new RegExp(`(?<![\\w-])(?:[a-z0-9-]+:)*(?:bg|text|border|from|via|to|fill|stroke|ring|outline|decoration|divide)-(?:${PALETTE})-\\d{2,3}\\b`, "g"), "Tailwind palette colour: use a colour token (green, amber, rose, blue…)"],
  [/(?<![\w-])-?(?:[a-z0-9-]+:)*(?:p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|space-x|space-y)-\[[^\]]+\]/g, "one-off spacing: use the spacing scale (1 = 4px: 2, 3, 4, 6, 8, 12, 16…)"],
];

const SKIP = /(^|\/)(remotion|emails)(\/|$)|opengraph-image|twitter-image|icon\.tsx|apple-icon/;

function* walk(p) {
  const s = statSync(p);
  if (s.isDirectory()) {
    for (const f of readdirSync(p)) if (f !== "node_modules" && !f.startsWith(".")) yield* walk(join(p, f));
  } else if ([".tsx", ".ts", ".css"].includes(extname(p))) yield p;
}

const roots = process.argv.slice(2);
let problems = 0;
for (const root of roots.length ? roots : ["src"]) {
  for (const file of walk(root)) {
    const rel = relative(process.cwd(), file);
    if (SKIP.test(rel)) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line) || line.includes("design-ok")) return; // comments, or an explained exception
      for (const [re, why] of RULES) {
        for (const m of line.matchAll(re)) {
          problems++;
          console.log(`${rel}:${i + 1}  ${m[0]}  → ${why}`);
        }
      }
    });
  }
}

if (problems) {
  console.log(`\n${problems} design-system problem(s). See docs/DESIGN_SYSTEM.md (Type, Colour, Spacing).`);
  console.log(`A real exception can stay if the line says why and includes "design-ok".`);
  process.exit(1);
}
console.log("Design check passed: only scale font sizes, token colours and scale spacing.");
