import { chairs } from "@/data/chairs";
import { getPosts, topicSlug, topics } from "@/lib/blog";
import { site } from "@/lib/site";

// llms.txt: a plain-text map of the site for AI answer engines (ChatGPT, Perplexity, Gemini, Claude).
export const revalidate = 3600;

export async function GET() {
  const posts = await getPosts();
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} (${site.domain}) is an event chair rental company serving ${site.serviceArea.join(", ")} and the wider Chicago area. Delivery, setup and pickup are included in full-service rentals. We are preparing our ${site.launch.seasonLabel}; first deliveries begin ${site.launch.firstEventDate}. Quotes are free and nothing is charged until the client confirms.`,
    "",
    "## Start here",
    `- [Book a free ${site.callLength} seating call](${site.url}/book): recommendations, quantities and an estimate for your event`,
    `- [Request a quote](${site.url}/quote)`,
    `- [Chair collection](${site.url}/chairs)`,
    `- [FAQ](${site.url}/faq)`,
    `- [Style quiz](${site.url}/quiz)`,
    `- [3D rental gallery](${site.url}/gallery): true-to-size 3D renders of every chair, table, linen, tent and event rental, plus complete event setups`,
    `- [About](${site.url}/about)`,
    "",
    "## Chairs for rent (estimated per-chair price, USD)",
    ...chairs.map(
      (c) => `- [${c.name}](${site.url}/chairs/${c.slug}): ${c.tagline}. ${c.estPrice}. Best for ${c.uses.join(", ").toLowerCase()}.`,
    ),
    "",
    "## Guides by topic",
    ...topics.flatMap((t) => {
      const list = posts.filter((p) => p.topic === t.name);
      if (!list.length) return [];
      return [
        "",
        `### [${t.name}](${site.url}/blog/topic/${topicSlug(t.name)})`,
        ...list.map((p) => `- [${p.title}](${site.url}/blog/${p.slug}): ${p.description}`),
      ];
    }),
    "",
    "## Contact",
    `- Email: ${site.email}`,
    ...(site.phone ? [`- Phone: ${site.phone}`] : []),
    `- Instagram: ${site.instagram}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
