import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { bookingHref, firstRoute } from "@/lib/routes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";
import { liveTools, toolImage } from "@/components/tools/ToolShell";
import { toolGroups, type ToolGroup } from "@/data/tools";

const title = "Free Event Planning Tools and Calculators for Chicago Events";
const description = `Free event planning tools from ${site.name}: tables and chairs, tent size, venue capacity, tablecloth, string light and dance floor calculators, a timeline builder, budget splitter, rain plan checklist and more. No sign-up.`;

export const metadata: Metadata = seo({
  title,
  description,
  alternates: { canonical: "/tools" },
  openGraph: { title, description, url: "/tools", images: [{ url: "/chairs/render/ghost.jpg", alt: `Ghost chair from ${site.name}` }] },
});

type Tool = { name: string; href: string; text: string; outputs: string[]; image: string; imageAlt: string; startHere?: boolean };
type Problem = { id: string; problem: string; intent: string; tools: Tool[] };

function problems(): Problem[] {
  const planner = firstRoute("/seating-planner", "/blog/how-many-chairs-do-i-need");
  const looks = firstRoute("/looks", "/chairs");
  const answers = firstRoute("/answers", "/faq");
  return [
    {
      id: "on-track",
      problem: "I want to keep my event on track",
      intent: "Save your date once and come back to a countdown, a dated checklist and reminders.",
      tools: [
        {
          name: "My Events",
          href: "/my-events",
          text: "A countdown, a checklist dated back from your event, Chicago weather and sunset for your date, and calendar reminders. No account.",
          outputs: ["Countdown", "Dated checklist", "Calendar file", "Share link"],
          image: "/rentals/styled/garden-ceremony.webp",
          imageAlt: "Garden ceremony with white chairs facing a floral arch, the image for the My Events planner",
          startHere: true,
        },
        {
          name: "Event ideas by month",
          href: "/ideas",
          text: "What Chicago hosts are planning this month, what to book now for later dates, and the guides to read.",
          outputs: ["This month", "Book-now list", "Guides"],
          image: "/rentals/styled/tent-reception-dusk.webp",
          imageAlt: "Frame tent reception lit at dusk, the image for the monthly event ideas hub",
        },
        {
          name: "Vendor guide",
          href: "/vendor-guide",
          text: "Who to hire for your kind of event, in the order to book them, with the questions to ask each one.",
          outputs: ["Booking order", "Questions to ask"],
          image: "/rentals/styled/wedding-reception.webp",
          imageAlt: "Wedding reception with round tables, the image for the event vendor guide",
        },
        {
          name: "Free planning kits",
          href: "/downloads",
          text: "Printable checklists and spreadsheets for weddings, parties and corporate events.",
          outputs: ["PDF kits", "Spreadsheets"],
          image: "/rentals/styled/farm-table-dinner.webp",
          imageAlt: "Long farm table dinner, the image for the free planning kits",
        },
      ],
    },
    {
      id: "not-ready",
      problem: "I'm not sure we're ready to book",
      intent: "Check what is still open before you request pricing.",
      tools: [
        {
          name: "Seating Readiness Score",
          href: "/tools/seating-readiness",
          text: "15 statements across five areas. Get a score out of 100 and the one area to settle first.",
          outputs: ["Score /100", "Weakest area", "Share link"],
          image: "/chairs/render/cross-back.jpg",
          imageAlt: "Cross-back vineyard chair, the image for the Seating Readiness Score tool",
          startHere: true,
        },
      ],
    },
    {
      id: "how-many",
      problem: "I don't know how many chairs I need",
      intent: "Turn a guest count into chairs and tables for every part of the day.",
      tools: [
        {
          name: planner === "/seating-planner" ? "Seating planner" : "Chair count guide",
          href: planner,
          text: "Enter your guest count to get chairs and tables for the ceremony, cocktail hour and reception.",
          outputs: ["Chairs", "Tables", "Checklist"],
          image: "/chairs/render/garden-folding.jpg",
          imageAlt: "Garden folding chair, the image for the chair and table count tool",
          startHere: true,
        },
        {
          name: "Rental calculator",
          href: "/tools/rental-calculator",
          text: "Guest count in: chairs, tables, linens, plates, flatware and glasses out, priced from current Chicago rental lists.",
          outputs: ["Quantities", "Price estimate", "Send as quote"],
          image: "/chairs/render/infinity.jpg",
          imageAlt: "Infinity chair render, the image for the event rental calculator",
        },
      ],
    },
    {
      id: "which-style",
      problem: "I can't pick a chair style",
      intent: "Match chairs to your venue, palette and season.",
      tools: [
        {
          name: "Chair style quiz",
          href: "/quiz",
          text: "Four questions about your venue, colors and mood, then a matched shortlist of chairs.",
          outputs: ["Style match", "Chair shortlist"],
          image: "/chairs/render/rattan-garden.jpg",
          imageAlt: "Rattan garden chair, the image for the chair style quiz",
          startHere: true,
        },
        {
          name: "The collection in 3D",
          href: "/chairs",
          text: "Turn every chair around in 3D, compare finishes and vote for your favorites.",
          outputs: ["3D view", "Finishes", "Price range"],
          image: "/chairs/render/velvet-dining.jpg",
          imageAlt: "Velvet dining chair, the image for the 3D chair collection",
        },
      ],
    },
    {
      id: "see-it",
      problem: "I want to see how it will look",
      intent: "See chairs styled in full rooms before you decide.",
      tools: [
        {
          name: looks === "/looks" ? "The Look Book" : "Chairs, styled",
          href: looks,
          text: "Complete decor looks built around a hero chair, with a \"Get this look\" request.",
          outputs: ["Room looks", "Get this look"],
          image: "/chairs/render/louis-medallion.jpg",
          imageAlt: "Louis medallion chair, the image for the decor Look Book",
          startHere: true,
        },
      ],
    },
    {
      id: "cost",
      problem: "I don't know what it will cost",
      intent: "Understand per-chair prices and what changes a quote.",
      tools: [
        {
          name: "Chair rental cost guide",
          href: "/blog/wedding-chair-rental-cost",
          text: "What wedding chairs cost to rent, and what moves the total up or down.",
          outputs: ["Price ranges", "Cost drivers"],
          image: "/chairs/render/infinity.jpg",
          imageAlt: "Infinity chair, the image for the chair rental cost guide",
          startHere: true,
        },
        {
          name: "Request exact pricing",
          href: "/quote",
          text: "Tell us your date, guest count and favorite chairs to get a personal proposal.",
          outputs: ["Personal quote"],
          image: "/chairs/render/wishbone.jpg",
          imageAlt: "Wishbone chair, the image for the quote request form",
        },
      ],
    },
    {
      id: "venue-weather",
      problem: "I'm worried about my venue or the weather",
      intent: "Venue rules, load-in and Chicago weather, answered.",
      tools: [
        {
          name: answers === "/answers" ? "Chicago chair answers" : "Questions, answered",
          href: answers,
          text: "Short, direct answers about venues, timing, delivery and seasons in the Chicago area.",
          outputs: ["Direct answers"],
          image: "/chairs/render/windsor.jpg",
          imageAlt: "Windsor chair, the image for the Chicago chair rental answers",
          startHere: true,
        },
        {
          name: "Event weather & sunset planner",
          href: "/tools/event-weather",
          text: "Your date's normal high, sunset, golden light and when it gets dark, with what to plan for lights, heat and rain.",
          outputs: ["Sunset", "Dark by", "What to rent"],
          image: "/rentals/styled/tent-reception-dusk.webp",
          imageAlt: "Tent reception at dusk, the image for the event weather and sunset planner",
        },
        {
          name: "Winter seating guide",
          href: "/blog/winter-wedding-seating",
          text: "How to seat a cold-weather Chicago event without losing the look.",
          outputs: ["Seasonal tips"],
          image: "/chairs/render/cane-back.jpg",
          imageAlt: "Cane-back chair, the image for the winter wedding seating guide",
        },
      ],
    },
    {
      id: "organized",
      problem: "I need a checklist or spreadsheet to stay organized",
      intent: "Free printable kits and spreadsheets that do the math for you.",
      tools: [
        {
          name: "Ultimate Event Planning Kit",
          href: "/downloads/event-planning-kit",
          text: "Printable timeline and checklists plus a workbook that sets every due date from your event date.",
          outputs: ["PDF kit", "Excel workbook", "Auto due dates"],
          image: "/dl/event-planning-kit/cover.png",
          imageAlt: "Cover of the free Ultimate Event Planning Kit",
          startHere: true,
        },
        {
          name: "Rental Order Calculator",
          href: "/downloads/rental-order-calculator",
          text: "Type a guest count and service style to get chairs, tables, linens, plates, glasses and ice.",
          outputs: ["30 quantities"],
          image: "/dl/rental-order-calculator/cover.png",
          imageAlt: "Preview of the free Rental Order Calculator spreadsheet",
        },
      ],
    },
  ];
}

const faqs: [string, string][] = [
  ["Are these tools free?", `Yes. Every ${site.name} tool is free and shows its result right away, with no sign-up.`],
  ["Which tool should I start with?", "Start with the rental calculator. Put in your guest count and it gives you a full rental list, then links you to the next tool you need."],
  ["Can I share my results?", "Yes. Every calculator keeps your answers in the page link, so you can send it to a partner, planner or venue coordinator and they see the same result."],
  ["Do the tools work for events other than weddings?", "Yes. They work for any seated event: corporate dinners, galas, showers, milestone birthdays and cultural celebrations."],
  ["Can someone help me with my results?", `Yes. Book a free 15-minute seating call and ${site.name} will turn your results into a chair count, a style shortlist and a timeline.`],
];

export default function ToolsPage() {
  const list = problems();
  const live = liveTools();
  const allTools = [...live.map((t) => ({ name: t.name, href: `/tools/${t.slug}` })), ...list.flatMap((p) => p.tools).filter((t) => !live.some((l) => `/tools/${l.slug}` === t.href))];
  const book = bookingHref("tools-hub");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: `${site.url}/tools`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: allTools.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${site.url}${t.href}` })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];

  // Three tools most people need first get a picture card; everything else is a short text list.
  const startSlugs = ["rental-calculator", "tables-and-chairs", "timeline"];
  const start = startSlugs.flatMap((slug) => live.filter((t) => t.slug === slug));
  const more = allTools.filter((t, n, a) => !t.href.startsWith("/tools/") && a.findIndex((x) => x.href === t.href) === n);

  return (
    <div className="container-x py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-3xl">
        <p className="eyebrow">Free tools</p>
        <h1 className="display-1 mt-6">Free event planning tools</h1>
        <p className="mt-6 text-lg leading-8 text-muted" data-answer>
          Free calculators and checklists for weddings, parties and work events across the Chicago area. Work out
          how many chairs, tables and linens you need, what size tent fits, and when to book. Each one shows your
          answer right away, with no sign-up. Not sure where to begin? Start with one of these three.
        </p>
      </div>

      <section aria-labelledby="start-here" className="mt-14">
        <h2 id="start-here" className="sr-only">Start here</h2>
        <ul className="grid gap-5 sm:grid-cols-3">
          {start.map((t, n) => {
            const img = toolImage(t);
            return (
              <li key={t.slug}>
                <Link href={`/tools/${t.slug}`} className="card card-hover block h-full overflow-hidden">
                  <div className="media aspect-[4/3] rounded-none">
                    <Image src={img.src} alt={img.alt} fill priority={n === 0} sizes="(min-width: 640px) 30vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-5">
                    <p className="display-3">{t.name}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{t.short}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="all-tools" className="mt-20">
        <h2 id="all-tools" className="display-2">Every free tool</h2>
        <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(toolGroups) as ToolGroup[]).map((g) => {
            const group = live.filter((t) => t.group === g);
            if (!group.length) return null;
            return (
              <div key={g}>
                <h3 className="eyebrow border-b border-line pb-2">{toolGroups[g].title}</h3>
                <ul className="mt-2">
                  {group.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/tools/${t.slug}`} className="group block rounded-xl p-2.5 transition-colors hover:bg-surface-2">
                        <span className="block font-medium group-hover:text-accent">{t.name}</span>
                        <span className="block text-sm leading-6 text-muted">{t.short}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {more.length > 0 && (
            <div>
              <h3 className="eyebrow border-b border-line pb-2">More planning help</h3>
              <ul className="mt-2">
                {more.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} className="block rounded-xl p-2.5 font-medium transition-colors hover:bg-surface-2 hover:text-accent">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="mt-8 text-sm text-muted">
          Run a venue or planning business? <Link href="/tools/embed" className="link">Put these calculators on your site</Link>.
        </p>
      </section>

      <section className="mt-28 grid gap-14 border-t border-gold/40 pt-16 md:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="display-2 mt-6">About the tools</h2>
        </div>
        <dl className="divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <div key={q} className="py-6">
              <dt className="font-heading font-semibold text-2xl">{q}</dt>
              <dd className="mt-3 leading-7 text-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-28 grid items-center gap-10 border border-line bg-surface p-10 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="display-2">Rather talk it through?</h2>
          <p className="mt-3 max-w-xl leading-7 text-muted">
            A free 15-minute seating call. Bring your guest count and venue, and leave with a chair count, a style
            shortlist and a timeline.
          </p>
        </div>
        <a href={book} className="btn-primary">Book a free seating call</a>
      </section>
    </div>
  );
}
