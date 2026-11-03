import { buyerPagesOf } from "@/data/buyer-pages";
import { chairs } from "@/data/chairs";
import { categories } from "@/data/catalog";
import { eventPath, eventTypes, locationPath, locations } from "@/data/geo";
import { getPosts, topicSlug, topics } from "@/lib/blog";
import { families } from "@/lib/guide-content";
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
    `${site.name} (${site.domain}) is a one-stop event rental marketplace for ${site.serviceArea.join(", ")} and the wider Chicago area. Planners build one itemized quote for chairs, tables, linens, dinnerware, glassware, tents, lighting, dance floors and more; we book it with vetted Chicago-area rental companies and coordinate delivery, setup and pickup. Prices shown are partner rates plus our 10% service fee, and quotes are free.`,
    "",
    "## Start here",
    `- [All event rentals with prices](${site.url}/rentals): every category and item, priced per unit`,
    `- [Instant quote builder](${site.url}/quote): pick items and quantities, see a live total, send it for a confirmed proposal`,
    `- [Book a free ${site.callLength} planning call](${site.url}/book): recommendations, quantities and an estimate for your event`,
    `- [Chair collection](${site.url}/chairs)`,
    `- [How it works](${site.url}/how-it-works): the four steps from quote to pickup`,
    `- [Payments & Booking Promise](${site.url}/booking-promise): who you pay and when, deposits, damage waivers, insurance, price lock and backup guarantee`,
    `- [For rental companies](${site.url}/partners): become a partner and receive itemized Chicago event bookings`,
    `- [Rental calculator](${site.url}/tools/rental-calculator): guest count in, quantities and prices out`,
    `- [Event rental glossary](${site.url}/glossary): damage waiver, drop length, load-in and other quote terms`,
    `- [FAQ](${site.url}/faq)`,
    "",
    "## Rental problems solved",
    ...buyerPagesOf("solutions").map((p) => `- [${p.title}](${site.url}/solutions/${p.slug}): ${p.answer}`),
    "",
    "## Comparisons",
    ...buyerPagesOf("compare").map((p) => `- [${p.title}](${site.url}/compare/${p.slug}): ${p.answer}`),
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
    "## Rental categories",
    ...categories.map((c) => `- [${c.name}](${site.url}/rentals/${c.id})`),
    "",
    "## Planning guides (computed chair counts, floor plans and estimates)",
    ...families.map((f) => `- [${f.hubTitle}](${site.url}${f.base}): ${f.hubDescription} (${f.slugs().length} guides)`),
    "",
    "## Areas we serve",
    ...locations.map((l) => `- [${l.name}](${site.url}${locationPath(l)})`),
    "",
    "## Events",
    ...eventTypes.map((e) => `- [${e.name}](${site.url}${eventPath(e)})`),
    "",
    "## Tools",
    `- [Quote builder](${site.url}/quote): pick items, see live prices, send one request`,
    `- [Seating planner](${site.url}/seating-planner)`,
    `- [Style quiz](${site.url}/quiz)`,
    `- [Quick answers](${site.url}/answers)`,
    "",
    "## Contact",
    `- Email: ${site.email}`,
    ...(site.phone ? [`- Phone: ${site.phone}`] : []),
    `- Instagram: ${site.instagram}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
