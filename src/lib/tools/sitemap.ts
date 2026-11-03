import "server-only";
import { tools } from "@/data/tools";
import { routeExists } from "@/lib/routes";
import { site } from "@/lib/site";

// Sitemap entries for the free tools and related pages from the tools thread, kept in one place
// so src/app/sitemap.ts only needs one line. Pages from other threads appear once they exist.
export const TOOLS_UPDATED = "2026-11-03";

export function toolSitemapEntries(extra: string[] = []) {
  const paths = [...tools.map((t) => `/tools/${t.slug}`), ...extra].filter((p) => p !== "/tools/seating-readiness" && routeExists(p));
  return paths.map((p) => ({ url: `${site.url}${p}`, lastModified: TOOLS_UPDATED, changeFrequency: "monthly" as const, priority: 0.7 }));
}
