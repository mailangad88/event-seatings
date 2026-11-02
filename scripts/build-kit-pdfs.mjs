// Turns each planning kit in src/data/kits/*.json into a designed, printable PDF plus a cover preview image.
//
//   node scripts/build-kit-pdfs.mjs            (all kits)
//   node scripts/build-kit-pdfs.mjs wedding-planning-kit
//
// Output: public/dl/<slug>/<slug>.pdf and public/dl/<slug>/cover.png (page 1, used on the landing page).
// Spreadsheet-only downloads get their preview from scripts/build-previews.sh instead.
// Uses the pre-installed Playwright Chromium; set CHROME_PATH to point at another browser.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("playwright-core"));
}

const root = process.cwd();
const kitDir = path.join(root, "src/data/kits");
const fontDir = path.join(root, "public/fonts");
const font = (f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontDir, f)).toString("base64")})`;

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const css = `
@font-face { font-family: Cormorant; src: ${font("cormorant-garamond-latin-400-italic.woff2")}; font-style: italic; }
@font-face { font-family: Cormorant; src: ${font("cormorant-garamond-latin-300-normal.woff2")}; font-weight: 300; }
@font-face { font-family: Jost; src: ${font("jost-latin-400-normal.woff2")}; font-weight: 400; }
@font-face { font-family: Jost; src: ${font("jost-latin-500-normal.woff2")}; font-weight: 500; }
@page { size: Letter; margin: 0.6in 0.65in 0.7in; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Jost, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #1d1a16; }
h1, h2 { font-family: Cormorant, Georgia, serif; font-weight: 300; margin: 0; }
section > .eyebrow { break-after: avoid; }
h2 { font-size: 23pt; line-height: 1.1; margin-bottom: 4pt; break-after: avoid; }
.eyebrow { font-size: 8pt; letter-spacing: 0.18em; text-transform: uppercase; color: #8a6628; font-weight: 500; }
.note { color: #5b544b; margin: 0 0 10pt; font-size: 9.5pt; }
section { margin-top: 22pt; }
.cover { height: 9.6in; display: flex; flex-direction: column; justify-content: space-between; background: #faf7f2; margin: -0.6in -0.65in 0; padding: 0.9in 0.85in 0.7in; break-after: page; }
.cover h1 { font-size: 48pt; line-height: 1; margin-top: 14pt; }
.cover .sub { font-family: Cormorant, Georgia, serif; font-style: italic; font-size: 17pt; color: #5b544b; margin-top: 12pt; max-width: 5.4in; }
.cover .intro { max-width: 5.2in; margin-top: 18pt; font-size: 11pt; }
.rule { width: 64pt; height: 2px; background: #8a6628; margin-top: 18pt; }
.cover-foot { display: flex; justify-content: space-between; align-items: flex-end; font-size: 9pt; color: #5b544b; }
.toc { columns: 2; margin-top: 16pt; font-size: 10pt; padding-left: 16pt; }
.toc li { margin-bottom: 3pt; }
.phase { display: grid; grid-template-columns: 1.25in 1fr; gap: 10pt; border-top: 1px solid #ddd3c4; padding: 7pt 0; break-inside: avoid; }
.phase .when { font-family: Cormorant, Georgia, serif; font-style: italic; font-size: 14pt; color: #8a6628; }
ul.check { list-style: none; padding: 0; margin: 0; }
ul.check li { position: relative; padding-left: 17pt; margin: 0 0 4pt; break-inside: avoid; }
ul.check li::before { content: ""; position: absolute; left: 0; top: 2.5pt; width: 9pt; height: 9pt; border: 1.2px solid #8a6628; border-radius: 2px; }
.groups { columns: 2; column-gap: 22pt; }
.group { break-inside: avoid; margin-bottom: 12pt; }
.group h3 { font-size: 9pt; letter-spacing: 0.12em; text-transform: uppercase; color: #8a6628; margin: 0 0 6pt; font-weight: 500; }
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
th { background: #1d1a16; color: #fff; text-align: left; font-weight: 500; padding: 5pt 6pt; }
td { border-bottom: 1px solid #ddd3c4; padding: 5pt 6pt; vertical-align: top; }
tr { break-inside: avoid; }
tbody tr:nth-child(even) td { background: #faf7f2; }
.bar { display: flex; height: 22pt; border-radius: 3px; overflow: hidden; margin: 6pt 0 12pt; }
.bar span { display: block; height: 100%; }
.budget td.amt { text-align: right; white-space: nowrap; }
.budget .sw { display: inline-block; width: 9pt; height: 9pt; border-radius: 2px; margin-right: 6pt; vertical-align: -1pt; }
.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt 22pt; margin-top: 8pt; }
.field { border-bottom: 1px solid #1d1a16; padding-bottom: 14pt; font-size: 8.5pt; color: #5b544b; text-transform: uppercase; letter-spacing: 0.08em; break-inside: avoid; }
ol.q { padding-left: 18pt; margin: 0; } ol.q li { margin-bottom: 5pt; break-inside: avoid; }
ul.tips { padding-left: 16pt; margin: 0; } ul.tips li { margin-bottom: 5pt; break-inside: avoid; }
.cta { margin-top: 28pt; background: #1d1a16; color: #faf7f2; padding: 20pt 24pt; border-radius: 4px; break-inside: avoid; }
.cta h2 { color: #faf7f2; font-size: 22pt; }
.cta a { color: #e2c48a; }
.small { font-size: 8pt; color: #8a8278; margin-top: 14pt; }
`;

const palette = ["#8a6628", "#1d1a16", "#b89556", "#5b544b", "#d9c39a", "#3d3830", "#c7a979", "#8a8278", "#e8dcc6", "#6e5420", "#a69a88", "#4a4239"];

// A simple illustrated place setting for the cover: plate, cutlery, glass and a Chiavari-style chair.
const coverArt = `
<svg width="210" height="210" viewBox="0 0 210 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="105" cy="105" r="100" fill="none" stroke="#ddd3c4" stroke-width="1.5"/>
  <circle cx="105" cy="112" r="46" fill="#fff" stroke="#8a6628" stroke-width="2"/>
  <circle cx="105" cy="112" r="33" fill="none" stroke="#ddd3c4" stroke-width="1.5"/>
  <rect x="45" y="78" width="4" height="70" rx="2" fill="#1d1a16"/>
  <path d="M40 78 v16 M47 78 v16 M54 78 v16 M40 94 h14" stroke="#1d1a16" stroke-width="2" fill="none"/>
  <rect x="160" y="78" width="4" height="70" rx="2" fill="#1d1a16"/>
  <path d="M160 78 q10 10 4 26" stroke="#1d1a16" stroke-width="2" fill="none"/>
  <path d="M150 42 h18 l-3 22 a6 6 0 0 1 -12 0 z" fill="none" stroke="#8a6628" stroke-width="2"/>
  <path d="M159 70 v10 M152 80 h14" stroke="#8a6628" stroke-width="2"/>
</svg>`;

function section(s, i) {
  const head = `<p class="eyebrow">Part ${i + 1}</p><h2>${esc(s.heading)}</h2>${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}`;
  let body = "";
  switch (s.kind) {
    case "timeline":
      body = (s.phases ?? [])
        .map((p) => `<div class="phase"><div class="when">${esc(p.when)}</div><ul class="check">${(p.tasks ?? []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`)
        .join("");
      break;
    case "checklist":
      body = `<div class="groups">${(s.groups ?? [])
        .map((g) => `<div class="group"><h3>${esc(g.title)}</h3><ul class="check">${(g.items ?? []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`)
        .join("")}</div>`;
      break;
    case "table":
      body = `<table><thead><tr>${(s.columns ?? []).map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${(s.rows ?? [])
        .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table>`;
      break;
    case "budget": {
      const lines = s.lines ?? [];
      body = `<div class="bar">${lines.map((l, j) => `<span style="width:${l.share}%;background:${palette[j % palette.length]}"></span>`).join("")}</div>
      <table class="budget"><thead><tr><th>Category</th><th>Share</th><th>Your budget: $______</th><th>Tip</th></tr></thead><tbody>${lines
        .map((l, j) => `<tr><td><span class="sw" style="background:${palette[j % palette.length]}"></span>${esc(l.category)}</td><td class="amt">${l.share}%</td><td class="amt">$________</td><td>${esc(l.tip ?? "")}</td></tr>`)
        .join("")}</tbody></table>`;
      break;
    }
    case "worksheet":
      body = `<div class="fields">${(s.fields ?? []).map((f) => `<div class="field">${esc(f)}</div>`).join("")}</div>`;
      break;
    case "questions":
      body = `<ol class="q">${(s.items ?? []).map((t) => `<li>${esc(t)}</li>`).join("")}</ol>`;
      break;
    default:
      body = `<ul class="tips">${(s.items ?? []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  }
  return `<section>${head}${body}</section>`;
}

function html(kit) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(kit.title)}</title><style>${css}</style></head><body>
  <div class="cover">
    <div>
      <p class="eyebrow">Beyond Chiavari · Free planning kit</p>
      <h1>${esc(kit.title)}</h1>
      <p class="sub">${esc(kit.subtitle)}</p>
      <div class="rule"></div>
      <p class="intro">${esc(kit.intro)}</p>
      <p class="eyebrow" style="margin-top:22pt">Inside</p>
      <ol class="toc">${kit.sections.map((s) => `<li>${esc(s.heading)}</li>`).join("")}</ol>
    </div>
    <div class="cover-foot">
      <div>beyondchiavari.com<br/>Chairs, tables, linens, tents and more across Chicagoland, on one quote.</div>
      ${coverArt}
    </div>
  </div>
  ${kit.sections.map(section).join("")}
  <div class="cta">
    <p class="eyebrow" style="color:#e2c48a">Next step</p>
    <h2>Get every rental on one quote</h2>
    <p>Pick chairs, tables, linens, dinnerware, tents and decor from Chicago-area rental companies and see prices as you build your list at <a href="https://beyondchiavari.com/quote">beyondchiavari.com/quote</a>. Want a second set of eyes on your plan? Book a free planning call at <a href="https://beyondchiavari.com/book">beyondchiavari.com/book</a>.</p>
  </div>
  <p class="small">Planning rules of thumb only. Confirm counts, rules and timing with your venue and vendors. © Beyond Chiavari. Free to print and share for personal planning.</p>
  </body></html>`;
}

const wanted = process.argv.slice(2);
const files = fs.readdirSync(kitDir).filter((f) => f.endsWith(".json") && (!wanted.length || wanted.includes(f.replace(/\.json$/, ""))));
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 1.5 });
for (const f of files) {
  const kit = JSON.parse(fs.readFileSync(path.join(kitDir, f), "utf8"));
  const out = path.join(root, "public/dl", kit.slug);
  fs.mkdirSync(out, { recursive: true });
  await page.setContent(html(kit), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: path.join(out, `${kit.slug}.pdf`),
    format: "Letter",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="width:100%;font-size:7pt;color:#8a8278;padding:0 0.65in;display:flex;justify-content:space-between;font-family:Helvetica"><span>${esc(kit.title)} · beyondchiavari.com</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: "0.6in", bottom: "0.7in", left: "0.65in", right: "0.65in" },
  });
  // Cover preview: render the cover alone at page size.
  await page.emulateMedia({ media: "screen" });
  await page.setContent(html(kit).replace("<body>", '<body style="width:816px;padding:0.6in 0.65in 0">'), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".cover").screenshot({ path: path.join(out, "cover.png") });
  await page.emulateMedia({ media: "print" });
  console.log(`built ${kit.slug}`);
}
await browser.close();
