import { site } from "@/lib/site";

// humans.txt: who runs this site, per the humans.txt convention (humanstxt.org).
export const revalidate = 86400;

export async function GET() {
  const lines = [
    "/* TEAM */",
    `Founder: ${site.owner.name}`,
    `Based in: ${site.city}`,
    `Contact: ${site.email}`,
    "",
    "/* SITE */",
    `Business: ${site.name} — ${site.tagline}`,
    `Service area: ${site.serviceArea.join(", ")} and the wider Chicago area`,
    `Standards: HTML5, CSS3`,
    `Software: Next.js`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
