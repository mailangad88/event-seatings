import type { Metadata } from "next";
import Link from "@/components/Link";
import { FloorPlanBuilder } from "@/components/floorplan/FloorPlanBuilder";
import { FaqList, Figure, JsonLd, PageHero, Section, type Faq } from "@/components/ui";
import { catalogItems } from "@/data/catalog";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

const title = "Free Seating Layout Builder: Drag-and-Drop Event Floor Plan";
const description =
  "Draw your event floor plan free: set the room size, drag round, banquet and farm tables, add a dance floor, bar, buffet and ceremony rows, and see seat counts and walkway warnings instantly. Share, print or download it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/floor-plan" },
  openGraph: { title, description, url: "/tools/floor-plan" },
};

const faqs: Faq[] = [
  {
    q: "How much space do I need between tables?",
    a: "Plan at least 3 feet of walkway between the backs of chairs at neighbouring tables, and 4 to 5 feet on main paths to the bar, buffet and exits. With 18-inch chairs that works out to about 60 inches between the edges of round tables. The builder flags anything tighter in amber.",
  },
  {
    q: "How many people fit at a 60-inch or 72-inch round table?",
    a: "A 60-inch round seats 8 comfortably (10 snugly), and a 72-inch round seats 10 (12 snugly). Wide or armed chairs fit fewer, so check your chair's seat width.",
  },
  {
    q: "How big should the dance floor be?",
    a: "A common rule is about 3 square feet per dancing guest, with roughly a third to half of guests dancing at once. That's about a 12×12 floor for 60 to 80 guests, 15×15 for around 100, and 18×18 to 21×21 for 150 to 250.",
  },
  {
    q: "Is my layout saved?",
    a: "Yes, in this browser automatically. Copy share link puts the whole layout in a link you can send to your planner, venue or partner; nothing is stored on our servers unless you send it to us.",
  },
  {
    q: "Can you check my layout?",
    a: `Yes. Use "Ask us to check this layout" and the ${site.name} team will look at spacing and rental counts and reply by email.`,
  },
];

export default function FloorPlanPage() {
  const quotableIds = catalogItems.map((i) => i.id);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${site.name} Seating Layout Builder`,
          url: `${site.url}/tools/floor-plan`,
          applicationCategory: "DesignApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description,
          provider: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
      <div className="print:hidden">
        <PageHero
          breadcrumbs={[
            { name: "Tools", href: "/tools" },
            { name: "Seating layout builder", href: "/tools/floor-plan" },
          ]}
          eyebrow="Free planning tool"
          title={<>Draw your floor plan</>}
          intro="Set your room, drop in tables, a dance floor, bar and ceremony rows, and drag everything into place. Seat counts update as you go, and tight walkways turn amber."
          actions={
            <>
              <a href="#builder" className="btn-primary">Start drawing</a>
              <Link href="/seating-planner" className="btn-ghost">Just count chairs</Link>
            </>
          }
          media={<Figure {...scenes.midnightLongTable} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
        />
      </div>
      <Section id="builder" eyebrow="Builder" title="Your room">
        <FloorPlanBuilder quotableIds={quotableIds} />
      </Section>
      <div className="print:hidden">
        <Section tone="sand" eyebrow="Questions" title="Layout FAQ">
          <FaqList faqs={faqs} />
        </Section>
      </div>
    </>
  );
}
