import { buyerPagesOf } from "@/data/buyer-pages";
import { chairs } from "@/data/chairs";
import { categories } from "@/data/catalog";
import { eventPath, eventTypes, locationPath, locations } from "@/data/geo";
import { getPosts, topicSlug, topics } from "@/lib/blog";
import { families } from "@/lib/guide-content";
import { areaRentalsPath, costCategories, costPath, localAreas } from "@/data/local-rentals";
import { getCategory } from "@/data/catalog-products";
import { site } from "@/lib/site";
import { getPartyType, ideaPath, ideas, partyTypes, typePath } from "@/data/party-ideas";

// llms.txt: a plain-text map of the site for AI answer engines (ChatGPT, Perplexity, Gemini, Claude).
export const revalidate = 3600;

export async function GET() {
  const posts = await getPosts();
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} (${site.domain}) is an event rental marketplace for ${site.serviceArea.join(", ")} and the wider Chicago area. Planners build one itemized quote for chairs, tables, linens, dinnerware, glassware, tents, lighting, dance floors and more; we book it with established Chicago-area rental companies and coordinate delivery, setup and pickup. Prices shown are the rental companies' own rates with no markup. Our fee is a flat $295 per event ($495 over 200 guests), paid only after every rental company confirms, and quotes are free. Pricing details: ${site.url}/pricing.`,
    "",
    "## Start here",
    `- [All event rentals with prices](${site.url}/rentals): every category and item, priced per unit`,
    `- [Instant quote builder](${site.url}/quote): pick items and quantities, see a live total, send it for a confirmed proposal`,
    `- [Ready-made packages](${site.url}/packages): typical parties already sized and priced all-in, open one and change any item`,
    `- [Book a free ${site.callLength} planning call](${site.url}/book): recommendations, quantities and an estimate for your event`,
    `- [Chair collection](${site.url}/chairs)`,
    `- [How it works](${site.url}/how-it-works): the four steps from quote to pickup`,
    `- [Payments & Booking Promise](${site.url}/booking-promise): who you pay and when, deposits, damage waivers, insurance, price lock and backup guarantee`,
    `- [For rental companies](${site.url}/partners): become a partner and receive itemized Chicago event bookings`,
    `- [Rental calculator](${site.url}/tools/rental-calculator): guest count in, quantities and prices out`,
    `- [Event rental glossary](${site.url}/glossary): damage waiver, drop length, load-in and other quote terms`,
    `- [Event ideas by month](${site.url}/ideas): what Chicago hosts plan and book each month, normal highs, and what to book now for later dates`,
    `- [My Events planner](${site.url}/my-events): free countdown, dated checklist, Chicago weather and sunset for an event date, calendar reminders, no account`,
    `- [Chicago event weather and sunset planner](${site.url}/tools/event-weather): normal high, sunset, golden light and darkness for any date, with a month-by-month table`,
    `- [Event vendor guide](${site.url}/vendor-guide): which vendors each event type needs, when to book them, what to ask and where they overlap with rentals`,
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
    `- [Party ideas](${site.url}/party-ideas): themes, setups, activities, games, props and the rentals for each, by occasion`,
    "",
    "## Party ideas by occasion",
    ...partyTypes.map((t) => `- [${t.name}](${site.url}${typePath(t.slug)}): ${t.setups.length} setup ideas, ${t.activities.length} activities`),
    ...ideas.map((i) => `- [${i.name}](${site.url}${ideaPath(i)}) (${getPartyType(i.type)?.name}): ${i.tagline}`),
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
    "## Party rentals by area (local prices, venue notes, delivery tips)",
    `- [All areas](${site.url}/party-rentals)`,
    ...localAreas.map((l) => `- [Party rentals in ${l.name}](${site.url}${areaRentalsPath(l.slug)}): tents, tables, linens, dance floors, bounce houses, photo booths, lighting, heaters, dinnerware and concessions`),
    "",
    "## Rental cost guides (Chicago price ranges computed from the catalog)",
    `- [All cost guides](${site.url}/rental-cost)`,
    `- [Chicago event rental price index](${site.url}/data/chicago-rental-prices): what the same item costs at different Chicago-area rental companies, with a free CSV`,
    `- [Press and media](${site.url}/press): facts, story ideas and contact for writers`,
    ...costCategories.map((c) => `- [${getCategory(c.id)?.name ?? c.id} rental cost](${site.url}${costPath(c.id)}): ${c.question}`),
    "",
    "## Tools",
    `- [Quote builder](${site.url}/quote): pick items, see live prices, send one request`,
    `- [Seating planner](${site.url}/seating-planner)`,
    `- [Seating layout builder](${site.url}/tools/floor-plan): drag-and-drop floor plan with seat counts and walkway checks`,
    `- [Event date checker](${site.url}/tools/event-date): 10-year weather history or live forecast, sunset, golden hour, nearby holidays`,
    ...(process.env.NEXT_PUBLIC_PLANNING_ASSISTANT === "on" ? [`- [Planning assistant](${site.url}/planning-assistant): priced rental plan from event type, guests, setting and budget`] : []),
    `- [Customer reviews](${site.url}/reviews): real reviews only, published as written`,
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
