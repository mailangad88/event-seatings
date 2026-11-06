import { site } from "@/lib/site";
import { llmsSummary } from "@/lib/llms-content";

// llms.txt: a short overview of the business for AI answer engines (ChatGPT, Perplexity,
// Gemini, Claude), per the llms.txt convention. Everything past the essentials is in
// llms-full.txt instead of being repeated here.
export const revalidate = 3600;

export async function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    llmsSummary,
    "",
    "## Start here",
    `- [All event rentals with prices](${site.url}/rentals): every category and item, priced per unit`,
    `- [Instant quote builder](${site.url}/quote): pick items and quantities, see a live total, send it for a confirmed proposal`,
    `- [Ready-made packages](${site.url}/packages): typical parties already sized and priced all-in, open one and change any item`,
    `- [Book a free ${site.callLength} planning call](${site.url}/book): recommendations, quantities and an estimate for your event`,
    `- [About ${site.name}](${site.url}/about): who we are and how we work`,
    `- [How it works](${site.url}/how-it-works): the four steps from quote to pickup`,
    `- [Payments & Booking Promise](${site.url}/booking-promise): who you pay and when, deposits, damage waivers, price lock and backup guarantee`,
    `- [Pricing](${site.url}/pricing)`,
    `- [FAQ](${site.url}/faq)`,
    "",
    "## Where we deliver",
    `${site.serviceArea.join(", ")} and the wider Chicago area, based in ${site.city}.`,
    "",
    "## Contact",
    `- Email: ${site.email}`,
    ...(site.phone ? [`- Phone: ${site.phone}`] : []),
    `- Instagram: ${site.instagram}`,
    "",
    "## Full site map",
    `Every category, chair, guide, blog post and local area page is listed at ${site.url}/llms-full.txt.`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
