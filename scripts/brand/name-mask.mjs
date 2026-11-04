// Writes public/brand/name-mask.svg from NAME_PATH in src/components/brand/logo-paths.ts.
// <BrandName> uses it as a CSS mask. Run after the logo outlines change: node scripts/brand/name-mask.mjs
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("src/components/brand/logo-paths.ts", "utf8");
const get = (n) => src.match(new RegExp(`export const ${n} = ([^;]+);`, "s"))[1].trim();
const d = get("NAME_PATH").replace(/^["'`]|["'`]$/g, "");
const cap = parseFloat(get("NAME_CAP"));
const w = parseFloat(get("NAME_WIDTH"));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${-cap - 0.5} ${w.toFixed(1)} ${(cap + 1).toFixed(1)}"><path d="${d}"/></svg>\n`;
writeFileSync("public/brand/name-mask.svg", svg);
console.log(`name-mask.svg written (${svg.length} bytes)`);
