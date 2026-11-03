import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaqList, JsonLd, PageHero, Section } from "@/components/ui";
import { coverImage, downloadGroups, downloads } from "@/data/downloads";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

const title = "Free Event Planning Kits, Checklists and Spreadsheets";
const description = `${downloads.length} free event planning downloads from ${site.name}: printable kits, checklists, budget and guest list spreadsheets, seating chart and rental calculators for any event.`;

export const metadata: Metadata = seo({
  title,
  description,
  alternates: { canonical: "/downloads" },
  openGraph: { title, description, url: "/downloads", images: [{ url: coverImage("event-planning-kit"), alt: "Cover of the free Ultimate Event Planning Kit" }] },
});

const faqs = [
  { q: "Are these planning downloads free?", a: "Yes. Every kit, checklist and spreadsheet is free. Enter your email once per download and the links appear right away." },
  { q: "Which download should I start with?", a: "Start with the Ultimate Event Planning Kit if you are early in planning. It covers any event and sets every due date from your event date. Add an event-specific kit when you know the type." },
  { q: "Do the spreadsheets work in Google Sheets?", a: "Yes. Import the Excel file into Google Sheets or open it in Apple Numbers. Formulas, dropdowns and totals keep working. CSV versions are included for guest lists, budgets and vendors." },
  { q: "Can I print the kits?", a: "Yes. The PDF kits are letter-size, designed to print in color or black and white, with checkboxes and fill-in worksheets." },
];

export default function DownloadsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url: `${site.url}/downloads`,
          hasPart: downloads.map((d) => ({ "@type": "DigitalDocument", name: d.title, url: `${site.url}/downloads/${d.slug}`, isAccessibleForFree: true })),
        }}
      />
      <PageHero
        eyebrow="Free downloads"
        title="Every planning kit, checklist and spreadsheet you need, free"
        intro="Printable kits for weddings, birthdays, showers, graduations, corporate events, galas and cultural celebrations, plus spreadsheets that do the math: budget, guest list, seating chart, rental quantities and run of show."
        breadcrumbs={[{ name: "Free downloads", href: "/downloads" }]}
        actions={
          <>
            <Link href="/downloads/event-planning-kit" className="btn-accent">Start with the Ultimate Kit</Link>
            <Link href="/tools" className="btn-ghost">Free planning tools</Link>
          </>
        }
        media={
          <div className="relative mx-auto grid max-w-md grid-cols-3 gap-3">
            {["wedding-planning-kit", "event-planning-kit", "graduation-party-planning-kit"].map((s, i) => (
              <Image
                key={s}
                src={coverImage(s)}
                alt={`Cover of the free ${downloads.find((d) => d.slug === s)?.title}`}
                width={408}
                height={528}
                className={`rounded-lg border border-line shadow-lg ${i === 1 ? "-translate-y-4" : "translate-y-2"}`}
                priority
              />
            ))}
          </div>
        }
      />
      {downloadGroups.map((g) => (
        <Section key={g} eyebrow={g} title={g === "Any event" ? "For any event" : g}>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {downloads
              .filter((d) => d.group === g)
              .map((d) => (
                <li key={d.slug}>
                  <Link href={`/downloads/${d.slug}`} className="group block h-full overflow-hidden rounded-2xl border border-line bg-surface hover:border-gold">
                    <div className="relative aspect-[4/3] overflow-hidden bg-bg">
                      <Image
                        src={coverImage(d.slug)}
                        alt={`Preview of the ${d.title}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover object-top transition-transform group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-widest text-gold">{[...new Set(d.files.map((f) => f.format))].join(" + ")}</p>
                      <h2 className="mt-2 font-serif text-2xl">{d.title}</h2>
                      <p className="mt-2 text-sm text-muted">{d.blurb}</p>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
        </Section>
      ))}
      <Section tone="sand" eyebrow="Questions" title="About the free downloads">
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}
