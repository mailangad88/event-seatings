import type { MetadataRoute } from "next";
import { families } from "@/lib/guide-content";
import { site } from "@/lib/site";

// Search engines and AI answer engines are all welcome; only private routes are blocked.
const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Applebot-Extended"];
const disallow = ["/admin", "/api", "/render"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiBots, allow: ["/", "/llms.txt"], disallow },
    ],
    sitemap: [0, ...families.map((_, i) => i + 1)].map((i) => `${site.url}/sitemap/${i}.xml`),
    host: site.url,
  };
}
