import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Server-side view of every site image: the Blender render manifest (src/data/rental-images.json) with the
// Gemini styled event scene (src/data/styled-images.json, from scripts/styled-scenes.py) laid over it wherever
// one exists. Styled entries keep the slug, category, kind and parent of the image they replace, and carry
// `ai: true` so pages can label them. Read from disk so the site still builds with either file missing.

export type ManifestEntry = {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  kind?: string;
  category?: string;
  parent?: string;
  variant?: string;
  ai?: boolean;
};

let cache: Record<string, ManifestEntry> | undefined;

function readJson(rel: string): Record<string, ManifestEntry> {
  try {
    return JSON.parse(readFileSync(path.join(process.cwd(), rel), "utf8"));
  } catch {
    return {};
  }
}

export function readImageManifest(): Record<string, ManifestEntry> {
  if (cache) return cache;
  const base = readJson("src/data/rental-images.json");
  const styled = readJson("src/data/styled-images.json");
  const out: Record<string, ManifestEntry> = { ...base };
  for (const [slug, s] of Object.entries(styled)) {
    if (!s.src || !existsSync(path.join(process.cwd(), "public", s.src))) continue;
    const b = base[slug] ?? { kind: "scene", category: s.category };
    out[slug] = { ...b, src: s.src, alt: s.alt, caption: s.caption, width: s.width, height: s.height, ai: true };
  }
  cache = out;
  return out;
}

/** The original Blender render for a slug, ignoring any styled scene laid over it. */
export const originalManifestEntry = (slug: string): ManifestEntry | undefined => readJson("src/data/rental-images.json")[slug];
