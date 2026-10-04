// Renders a still image of every chair from the 3D models.
//
//   ALLOW_RENDER=1 npm run start     (in one terminal, after `npm run build`)
//   npm run render:chairs            (in another)
//
// Optional: pass chair slugs to render only those, e.g. `npm run render:chairs -- ghost velvet-dining`.
// Set CHROME_PATH if Chromium isn't found automatically.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const base = process.env.RENDER_URL ?? "http://localhost:3000";
const out = path.join(process.cwd(), "public", "chairs", "render");
const manifest = path.join(process.cwd(), "src", "data", "renders.json");
fs.mkdirSync(out, { recursive: true });

const slugsInData = [...fs.readFileSync(path.join(process.cwd(), "src", "data", "chairs.ts"), "utf8").matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
const wanted = process.argv.slice(2);
const slugs = wanted.length ? wanted : slugsInData;

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 1250 }, deviceScaleFactor: 1 });

const done = new Set(fs.existsSync(manifest) ? JSON.parse(fs.readFileSync(manifest, "utf8")) : []);
for (const slug of slugs) {
  await page.goto(`${base}/render/${slug}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__chairReady === true, null, { timeout: 120000 });
  await page.waitForTimeout(400);
  await page.locator("#shot").screenshot({ path: path.join(out, `${slug}.jpg`), type: "jpeg", quality: 90 });
  done.add(slug);
  console.log("rendered", slug);
}
fs.writeFileSync(manifest, JSON.stringify([...done].sort(), null, 2) + "\n");
await browser.close();
