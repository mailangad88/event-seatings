import type { Metadata } from "next";

// Pages written for rental companies (partner sign-up, partner terms, listing changes).
// They stay open for anyone with the link, but are left out of the sitemap and llms.txt and marked noindex,
// so people searching for event rentals (and AI answer engines) find our customer pages instead.
export const VENDOR_PAGES = ["/partners", "/partners/faq", "/partners/terms", "/partners/onboard", "/vendor-listings"];

export const vendorPageRobots: Metadata["robots"] = { index: false, follow: true };

export const isVendorPage = (path: string) => VENDOR_PAGES.includes(path);
