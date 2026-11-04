#!/usr/bin/env node
// PNG exports of the logo (for Google's logo field, social profiles, email, print) plus the
// apple-touch icon and favicon.ico. Run after scripts/brand/build-logo.py.
// Usage: node scripts/brand/render-logo-png.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Playwright is pre-installed globally in this environment; fall back to the repo copy if there is one.
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require(require.resolve("playwright", { paths: [process.env.NODE_PATH ?? ""] })));
}

const dir = "public/brand";
const jobs = [
  // [source svg, output png, width, height, background]
  ["mark-light.svg", "mark-512.png", 512, 512, null],
  ["app-icon.svg", "logo-512.png", 512, 512, null], // square logo for schema.org / Google
  ["app-icon.svg", "../../src/app/apple-icon.png", 180, 180, null],
  ["logo-horizontal-light.svg", "logo-horizontal-light.png", 1800, 0, null],
  ["logo-horizontal-dark.svg", "logo-horizontal-dark.png", 1800, 0, "#2a1519"],
  ["logo-stacked-light.svg", "logo-stacked-light.png", 1200, 0, "#f6efe4"],
  ["logo-stacked-dark.svg", "logo-stacked-dark.png", 1200, 0, "#2a1519"],
  ["favicon.svg", "favicon-16.png", 16, 16, null],
  ["favicon.svg", "favicon-32.png", 32, 32, null],
  ["favicon.svg", "favicon-48.png", 48, 48, null],
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [src, out, w, h0, bg] of jobs) {
  const svg = readFileSync(`${dir}/${src}`, "utf8");
  const [, , vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
  const h = h0 || Math.round((w * vh) / vw);
  const pad = bg ? Math.round(h * 0.18) : 0;
  await page.setViewportSize({ width: w + pad * 2, height: h + pad * 2 });
  await page.setContent(
    `<style>html,body{margin:0;background:${bg ?? "transparent"}}svg{display:block;margin:${pad}px;width:${w}px;height:${h}px}</style>${svg}`,
  );
  await page.screenshot({ path: `${dir}/${out}`, omitBackground: !bg });
}
await browser.close();

// favicon.ico (16/32/48) for old browsers and crawlers that ask for /favicon.ico.
execFileSync("python3", [
  "-c",
  `from PIL import Image
imgs=[Image.open(f"${dir}/favicon-{s}.png").convert("RGBA") for s in (48,32,16)]
imgs[0].save("src/app/favicon.ico", sizes=[(48,48),(32,32),(16,16)], append_images=imgs[1:])`,
]);
console.log("PNG exports written to", dir);
