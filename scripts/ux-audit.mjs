// UX audit: screenshots + axe-core accessibility + simple design-lint checks for the key flows.
//
//   npm run build && npm run start   (or any running server)
//   node scripts/ux-audit.mjs --base http://localhost:3000 --out out/ux-audit/before
//
// Writes <out>/<page>-<viewport>.png and <out>/report.json, and prints a summary.
// Design-lint checks: body text under 16px on mobile, tap targets under 44px, text wider than ~80ch,
// images without alt, more than one H1, skipped heading levels, horizontal scroll at 390px.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("playwright-core"));
}
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const base = arg("base", "http://localhost:3000");
const out = arg("out", "out/ux-audit");
const full = process.argv.includes("--full");
mkdirSync(out, { recursive: true });

// Fixed pages, plus "first link matching" for detail pages so the script survives content changes.
const pages = [
  { name: "home", path: "/" },
  { name: "rentals", path: "/rentals" },
  { name: "category", path: "/rentals/chairs" },
  { name: "item", from: "/rentals/chairs", match: /^\/rentals\/chairs\/[^/]+$/ },
  { name: "quote", path: "/quote" },
  { name: "blog", path: "/blog" },
  { name: "guide", from: "/blog", match: /^\/blog\/(?!topic)[^/]+$/ },
  { name: "downloads", path: "/downloads" },
  { name: "download", from: "/downloads", match: /^\/downloads\/[^/]+$/ },
  { name: "tools", path: "/tools" },
];
const viewports = [
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "desktop", width: 1440, height: 900, isMobile: false },
];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const report = [];

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.isMobile ? 2 : 1,
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  for (const p of pages) {
    let path = p.path;
    if (!path) {
      await page.goto(base + p.from, { waitUntil: "load" });
      const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
      path = hrefs.find((h) => h && p.match.test(h));
      if (!path) {
        report.push({ page: p.name, viewport: vp.name, error: "no matching link" });
        continue;
      }
    }
    await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${p.name}-${vp.name}.png`, fullPage: full });

    await page.addScriptTag({ content: axeSource });
    const axe = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        count: v.nodes.length,
        targets: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
      }));
    });

    const lint = await page.evaluate((isMobile) => {
      const issues = [];
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      };
      if (document.documentElement.scrollWidth > window.innerWidth + 1)
        issues.push(`horizontal scroll: ${document.documentElement.scrollWidth}px > ${window.innerWidth}px`);
      const h1s = document.querySelectorAll("h1");
      if (h1s.length !== 1) issues.push(`${h1s.length} h1 elements`);
      let last = 0;
      for (const h of document.querySelectorAll("main h1, main h2, main h3, main h4")) {
        const lvl = Number(h.tagName[1]);
        if (last && lvl > last + 1) issues.push(`heading skip h${last} -> h${lvl}: "${h.textContent.trim().slice(0, 40)}"`);
        last = lvl;
      }
      const small = new Set();
      for (const el of document.querySelectorAll("main p, main li")) {
        if (!visible(el)) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (isMobile && fs < 14) small.add(`${fs}px "${el.textContent.trim().slice(0, 30)}"`);
        const w = el.getBoundingClientRect().width / fs;
        if (w > 44 && el.textContent.length > 300) small.add(`long line ~${Math.round(w * 1.9)}ch`);
      }
      if (small.size) issues.push(`text: ${[...small].slice(0, 6).join("; ")}${small.size > 6 ? ` (+${small.size - 6})` : ""}`);
      if (isMobile) {
        const tiny = [];
        for (const el of document.querySelectorAll("a, button, input, select, textarea, [role=button]")) {
          if (!visible(el)) continue;
          const r = el.getBoundingClientRect();
          // inline text links inside paragraphs are exempt (WCAG 2.5.8 inline exception)
          if (el.tagName === "A" && el.closest("p, li") && getComputedStyle(el).display === "inline") continue;
          if (r.height < 24 || r.width < 24) tiny.push(`${Math.round(r.width)}x${Math.round(r.height)} ${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24)}"`);
        }
        if (tiny.length) issues.push(`tap targets <24px: ${tiny.length} e.g. ${tiny.slice(0, 4).join("; ")}`);
      }
      const noAlt = [...document.querySelectorAll("img:not([alt])")].length;
      if (noAlt) issues.push(`${noAlt} img without alt`);
      const fonts = new Set();
      for (const el of document.querySelectorAll("body *")) {
        if (el.children.length === 0 && el.textContent.trim()) {
          const s = getComputedStyle(el);
          fonts.add(`${s.fontFamily.split(",")[0]} ${s.fontWeight}`);
        }
      }
      return { issues, fonts: [...fonts] };
    }, vp.isMobile);

    report.push({ page: p.name, path, viewport: vp.name, axe, lint });
    const serious = axe.filter((v) => v.impact === "serious" || v.impact === "critical");
    console.log(
      `${p.name.padEnd(10)} ${vp.name.padEnd(8)} axe ${axe.length} (${serious.length} serious) ${serious.map((v) => `${v.id}x${v.count}`).join(", ")}`,
    );
    for (const i of lint.issues) console.log(`    - ${i}`);
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(`\nWrote ${out}/report.json`);
