// Static scan: code that ships to the browser must never pull in vendor names, vendor prices or server-only modules.
// Follows value imports (not `import type`) from every "use client" file through @/ and relative paths.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");
const rel = (f: string) => path.relative(root, f).split(path.sep).join("/");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mjs|js)$/.test(name) ? [p] : [];
  });
}

const files = walk(src);
const cache = new Map<string, string>();
const read = (f: string) => cache.get(f) ?? (cache.set(f, readFileSync(f, "utf8")), cache.get(f)!);
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const isClient = (f: string) => /^\s*(?:\/\/.*\n|\/\*[\s\S]*?\*\/\s*)*\s*["']use client["']/.test(read(f));
// A "use server" module is a boundary: the browser only gets a reference to its actions, never its imports.
const isServerActions = (f: string) => /^\s*(?:\/\/.*\n|\/\*[\s\S]*?\*\/\s*)*\s*["']use server["']/.test(read(f));
const isServerOnly = (f: string) => /^\s*import\s+["']server-only["']/m.test(read(f));

/** Value imports of a file (type-only imports are erased at build time, so they are skipped). */
function valueImports(f: string): string[] {
  const code = stripComments(read(f));
  const out: string[] = [];
  const re = /(?:^|[;\n])\s*(import|export)\s+([\s\S]*?)\s*from\s*["']([^"']+)["']|(?:^|[;\n])\s*import\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  for (const m of code.matchAll(re)) {
    const spec = m[3] ?? m[4] ?? m[5];
    const clause = m[2] ?? "";
    if (m[3]) {
      if (/^type\s/.test(clause)) continue;
      // import { type A, type B } from "x" is also erased.
      const braces = /^\{([\s\S]*)\}$/.exec(clause.trim());
      if (braces && braces[1].split(",").map((s) => s.trim()).filter(Boolean).every((s) => s.startsWith("type "))) continue;
    }
    out.push(spec);
  }
  return out;
}

function resolve(from: string, spec: string): string | undefined {
  let base: string;
  if (spec.startsWith("@/")) base = path.join(src, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return undefined; // packages
  for (const c of [base, ...[".ts", ".tsx", ".js", ".mjs", ".json"].map((e) => base + e), path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return undefined;
}

// Back-office data: vendor names, contacts and raw vendor prices.
const secretData = ["src/data/vendors.ts", "src/data/catalog.ts", "src/data/catalog-inventory.json"].map((f) => path.join(root, f));

function reachable(entry: string) {
  const seen = new Map<string, string[]>(); // file -> import chain
  const queue: [string, string[]][] = [[entry, [rel(entry)]]];
  while (queue.length) {
    const [f, chain] = queue.shift()!;
    if (seen.has(f)) continue;
    seen.set(f, chain);
    if (!/\.(tsx?|mjs|js)$/.test(f)) continue;
    if (f !== entry && isServerActions(f)) continue;
    for (const spec of valueImports(f)) {
      if (spec === "server-only") continue;
      const r = resolve(f, spec);
      if (r && !seen.has(r)) queue.push([r, [...chain, rel(r)]]);
    }
  }
  return seen;
}

const clientFiles = files.filter(isClient);

describe("client bundle boundary", () => {
  it("finds the client components", () => {
    expect(clientFiles.length).toBeGreaterThan(10);
  });

  it("no 'use client' file reaches vendor data or a server-only module", () => {
    const problems: string[] = [];
    for (const f of clientFiles) {
      for (const [dep, chain] of reachable(f)) {
        if (dep === f) continue;
        if (secretData.includes(dep)) problems.push(`vendor data: ${chain.join(" -> ")}`);
        else if (/\.(tsx?|mjs|js)$/.test(dep) && isServerOnly(dep)) problems.push(`server-only: ${chain.join(" -> ")}`);
      }
    }
    expect(problems).toEqual([]);
  });

  // Big data files (the image list, the full inventory, the public file list) make every page that reaches them
  // download hundreds of KB of JavaScript. Browser code should get what it needs as props or from a small map.
  it("no 'use client' file reaches a data file over 100 KB", () => {
    const problems: string[] = [];
    for (const f of clientFiles) {
      for (const [dep, chain] of reachable(f)) {
        if (/\.json$/.test(dep) && statSync(dep).size > 100_000) problems.push(chain.join(" -> "));
      }
    }
    expect(problems).toEqual([]);
  });

  it("no component imports the vendor list as a value", () => {
    const offenders = files
      .filter((f) => rel(f).startsWith("src/components/"))
      .filter((f) => valueImports(f).some((s) => resolve(f, s) === secretData[0]))
      .map(rel);
    expect(offenders).toEqual([]);
  });

  it("the scanner follows imports through @/ paths", () => {
    const f = path.join(src, "components/QuoteForm.tsx");
    if (!existsSync(f)) return;
    expect([...reachable(f).keys()].map(rel)).toContain("src/lib/catalog-types.ts");
  });

  it("the scanner itself sees type-only imports as type-only", () => {
    const f = path.join(src, "components/admin/VendorContact.tsx");
    if (!existsSync(f)) return;
    expect(read(f)).toContain("@/data/vendors");
    expect(valueImports(f).some((s) => s === "@/data/vendors")).toBe(false);
  });
});
