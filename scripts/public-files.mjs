// Writes src/data/public-files.json: every file under public/ as a site path ("/rentals/chairs/x.webp").
// Pages check this list instead of looking at the disk, so server functions no longer have to carry
// all of public/ (130+ MB) just to answer "does this image exist?". Runs before every build and dev start
// (npm prebuild/predev); run `node scripts/public-files.mjs` after adding images if you need it sooner.
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "public");
const out = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else out.push("/" + path.relative(root, full).split(path.sep).join("/"));
  }
}
walk(root);
out.sort();
writeFileSync(path.join(process.cwd(), "src/data/public-files.json"), JSON.stringify(out) + "\n");
console.log(`public-files: ${out.length} files listed`);
