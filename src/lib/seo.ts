import type { Metadata } from "next";
import { site } from "./site";

// Title and meta description limits the SEO audit (scripts/seo-audit.mjs) checks.
// Google shows roughly 60 characters of a title and 155-160 of a description.
export const TITLE_MAX = 65;
export const DESC_MAX = 160;
const SUFFIX = ` | ${site.name}`;

/**
 * A page title that fits in search results. Short titles keep the "| Beyond Chiavari" suffix from
 * the layout template; longer ones drop it; very long ones are cut at a word boundary.
 */
export function fitTitle(title: string): Metadata["title"] {
  const t = title.replace(/\s+/g, " ").trim();
  if (t.length + SUFFIX.length <= TITLE_MAX) return t;
  if (t.length <= TITLE_MAX) return { absolute: t };
  // Prefer cutting at a separator (":" or " - "), then at a word.
  const sep = t.slice(0, TITLE_MAX).search(/:\s[^:]*$/);
  if (sep >= 30) return { absolute: t.slice(0, sep) };
  return { absolute: t.slice(0, t.lastIndexOf(" ", TITLE_MAX - 1)).replace(/[,:;&-]+$/, "").trim() };
}

/** A meta description of at most 160 characters, cut at a sentence end when possible. */
export function fitDescription(desc: string, max = DESC_MAX): string {
  const d = desc.replace(/\s+/g, " ").trim();
  if (d.length <= max) return d;
  const head = d.slice(0, max);
  const sentence = Math.max(head.lastIndexOf(". "), head.lastIndexOf("? "), head.lastIndexOf("! "));
  if (sentence >= 90) return head.slice(0, sentence + 1);
  const cut = head.slice(0, head.lastIndexOf(" ", max - 1)).replace(/[,:;&(-]+$/, "").trim();
  return `${cut}…`;
}

/** Apply both fixes to a Metadata object (title, description and their Open Graph copies). */
export function seo(meta: Metadata): Metadata {
  const out: Metadata = { ...meta };
  if (typeof meta.title === "string") out.title = fitTitle(meta.title);
  if (typeof meta.description === "string") out.description = fitDescription(meta.description);
  if (meta.openGraph) {
    const og = { ...meta.openGraph };
    if (typeof og.description === "string") og.description = fitDescription(og.description, 200);
    out.openGraph = og;
  }
  return out;
}
