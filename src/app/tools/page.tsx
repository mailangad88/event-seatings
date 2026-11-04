import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  ["Which tool should I start with?", "If you're not sure, start with the Seating Readiness Score. It shows which part of your seating plan to settle first and links you to the right next tool."],
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

  const route = [
    ["Readiness score", "/tools/seating-readiness"],
    ["Chair count", list[1].tools[0].href],
    ["Style quiz", "/quiz"],
    ["Free seating call", book],
  ] as const;

  return (
    <div className="container-x py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-3xl">
        <p className="eyebrow">Free tools</p>
        <h1 className="display-1 mt-6">
          Start with your <em className="text-gold">problem</em>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted" data-answer>
          Free planning tools for weddings and events across the Chicago area: a seating planner, a readiness score,
          a style quiz and the quote builder. Pick what&apos;s on your mind and we&apos;ll point you to the tool that
          answers it. No sign-up needed.
        </p>
      </div>

      <nav aria-label="Problems" className="mt-14 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <a key={p.id} href={`#${p.id}`} className="group flex items-center justify-between gap-4 border border-line bg-surface px-6 py-5 transition-colors hover:border-gold">
            <span className="font-heading font-semibold text-xl leading-snug">{p.problem}</span>
            <span className="text-gold transition-transform group-hover:translate-x-1" aria-hidden>→</span>
          </a>
        ))}
      </nav>


      <section aria-labelledby="all-tools" className="mt-20">
        <h2 id="all-tools" className="headline text-4xl sm:text-5xl">Every free tool</h2>
        <p className="mt-3 max-w-2xl text-muted">Calculators that show their working, plans that count back from your date, and checklists you can print. Your answers stay in your browser and the page link. Run a venue or planning business? <Link href="/tools/embed" className="link">Embed these calculators on your site</Link>.</p>
        {(Object.keys(toolGroups) as ToolGroup[]).map((g) => {
          const group = live.filter((t) => t.group === g);
          if (!group.length) return null;
          return (
            <div key={g} className="mt-12">
              <h3 className="eyebrow">{toolGroups[g].title}</h3>
              <p className="mt-2 text-sm text-muted">{toolGroups[g].intro}</p>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {group.map((t) => {
                  const img = toolImage(t);
                  return (
                    <li key={t.slug}>
                      <Link href={`/tools/${t.slug}`} className="card card-hover block h-full overflow-hidden">
                        <div className="media aspect-[4/3] rounded-none">
                          <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
                        </div>
                        <div className="p-5">
                          <p className="font-heading font-semibold text-xl">{t.name}</p>
                          <p className="mt-1 text-sm leading-6 text-muted">{t.short}</p>
                          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="What you get">
                            {t.outputs.map((o) => <li key={o} className="chip">{o}</li>)}
                          </ul>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <figure className="mt-20 border-y border-line py-10">
        <p className="eyebrow">Not sure? Follow the route</p>
        <ol className="mt-8 grid gap-6 sm:grid-cols-4">
          {route.map(([name, href], i) => (
            <li key={name} className="relative">
              <Link href={href} className="group block">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold font-heading font-semibold text-xl text-gold">{i + 1}</span>
                <span className="mt-4 block font-heading font-semibold text-2xl group-hover:text-gold">{name}</span>
              </Link>
            </li>
          ))}
        </ol>
        <figcaption className="mt-8 text-sm text-muted">
          Each tool answers one question and leads to the next: find your gaps, count your chairs, pick a style, then
          talk it through with us.
        </figcaption>
      </figure>

      <div className="mt-24 space-y-24">
        {list.map((p) => (
          <section key={p.id} id={p.id} className="scroll-mt-28">
            <h2 className="display-2">{p.problem}</h2>
            <p className="mt-3 text-muted">{p.intent}</p>
            <ul className="mt-10 grid gap-8 md:grid-cols-2">
              {p.tools.map((t) => (
                <li key={t.name}>
                  <Link href={t.href} className="group grid grid-cols-[120px_1fr] gap-6 border border-line bg-surface p-5 transition-colors hover:border-gold">
                    <Image src={t.image} alt={t.imageAlt} width={1000} height={1250} sizes="120px" className="aspect-[4/5] w-full object-cover" />
                    <div className="flex flex-col">
                      {t.startHere && <span className="w-fit bg-gold px-2 py-1 text-xs font-medium tracking-[0.2em] text-accent-ink uppercase">Start here</span>}
                      <h3 className="display-3 mt-3 group-hover:text-gold">{t.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{t.text}</p>
                      <ul className="mt-auto flex flex-wrap gap-2 pt-4" aria-label="What you get">
                        {t.outputs.map((o) => (
                          <li key={o} className="border border-line px-2 py-1 text-xs tracking-[0.18em] text-ink/80 uppercase">{o}</li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-28 grid gap-10 border-t border-gold/40 pt-16 md:grid-cols-3">
        {[
          ["Answers first", "Every tool shows your result right away. Email is only for sending yourself a copy."],
          ["Built to share", "Send your link to a partner, planner or venue coordinator and they see the same result."],
          ["Shows its working", "Each tool explains how it counts, so you can check the numbers yourself."],
        ].map(([h, t]) => (
          <div key={h} className="border-t border-line pt-6">
            <h3 className="display-3">{h}</h3>
            <p className="mt-3 leading-7 text-muted">{t}</p>
          </div>
        ))}
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
