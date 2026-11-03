import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Search engines and AI answer engines are all welcome; only private routes are blocked.
const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Applebot-Extended"];
const disallow = ["/admin", "/api", "/render", "/proposal", "/reviews/write", "/dl/*.pdf$", "/dl/*.xlsx$", "/dl/*.csv$"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiBots, allow: ["/", "/llms.txt"], disallow },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
