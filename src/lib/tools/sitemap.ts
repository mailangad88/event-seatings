import "server-only";
import { comparisonPath, comparisons } from "@/data/comparisons";
import { tools } from "@/data/tools";
import { routeExists } from "@/lib/routes";
import { site } from "@/lib/site";

// Sitemap entries for the free tools and related pages from the tools thread, kept in one place
// so src/app/sitemap.ts only needs one line. Pages from other threads appear once they exist.
export const TOOLS_UPDATED = "2026-11-03";

export function toolSitemapEntries(extra: string[] = []) {
  const paths = [...tools.map((t) => `/tools/${t.slug}`), ...extra, "/rental-comparisons", "/partners/onboard", "/tools/embed"].filter((p) => p !== "/tools/seating-readiness" && routeExists(p));
  // Dynamic comparison pages have no page.tsx of their own, so they are listed from the data.
  if (routeExists("/rental-comparisons")) paths.push(...comparisons.map(comparisonPath));
  return paths.map((p) => ({ url: `${site.url}${p}`, lastModified: TOOLS_UPDATED, changeFrequency: "monthly" as const, priority: 0.7 }));
}
