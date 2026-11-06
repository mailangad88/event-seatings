import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Search engines and AI answer engines are all welcome; only private routes are blocked.
// Bing, DuckDuckGo, Yahoo and Copilot all use Bingbot, which follows the "*" rule.
const aiBots = [
  // OpenAI (ChatGPT search, training, and links people click inside ChatGPT)
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  // Anthropic (Claude)
  "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai",
  // Perplexity
  "PerplexityBot", "Perplexity-User",
  // Google Gemini and AI Overviews, Apple Intelligence, Microsoft Copilot
  "Google-Extended", "GoogleOther", "Applebot", "Applebot-Extended", "bingbot",
  // Other answer engines and the open web archive many AI models learn from
  "Amazonbot", "Meta-ExternalAgent", "Meta-ExternalFetcher", "DuckAssistBot", "MistralAI-User", "cohere-ai", "YouBot", "CCBot",
];
const disallow = ["/admin", "/api", "/account", "/render", "/proposal", "/event-details", "/partners/status", "/reviews/write", "/studio", "/dl/*.pdf$", "/dl/*.xlsx$", "/dl/*.csv$"];
// Plain-text files aimed at crawlers rather than people: the short llms.txt overview, the
// exhaustive llms-full.txt site map, and humans.txt (who runs the site).
const crawlerTextFiles = ["/llms.txt", "/llms-full.txt", "/humans.txt"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiBots, allow: ["/", ...crawlerTextFiles], disallow },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
