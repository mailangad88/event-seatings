import "server-only";
import fs from "node:fs";
import path from "node:path";

// Several pages (seating planner, Look Book, answers hub, booking) live in
// separate pull requests. These helpers let a page link to the best page that
// exists in this build, so nothing links to a 404 before those PRs merge.

const root = process.cwd();

export function routeExists(href: string): boolean {
  const clean = href.split(/[?#]/)[0];
  const blog = clean.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blog) return fs.existsSync(path.join(root, "content", "blog", `${blog[1]}.md`));
  if (clean === "/") return true;
  return fs.existsSync(path.join(root, "src", "app", ...clean.split("/").filter(Boolean), "page.tsx"));
}

/** The first href in the list that exists in this build (the last one is the fallback). */
export function firstRoute(...hrefs: string[]): string {
  return hrefs.find(routeExists) ?? hrefs[hrefs.length - 1];
}

/** Like firstRoute, for [href, label] pairs, so the label always matches the page it links to. */
export function firstLink(...links: [string, string][]): { href: string; label: string } {
  const [href, label] = links.find(([h]) => routeExists(h)) ?? links[links.length - 1];
  return { href, label };
}

/** Where "book a call" goes: the booking link when it is set, else the booking page, else the quote form. */
export function bookingHref(from: string): string {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL;
  if (url) return url;
  return `${firstRoute("/book", "/quote")}?from=${encodeURIComponent(from)}`;
}
