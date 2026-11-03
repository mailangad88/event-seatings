import Link from "next/link";
import { FaqList, Figure, JsonLd, PageHero, Section } from "@/components/ui";
import { catalogItems } from "@/data/catalog";
import { PRICE_INDEX_SLUG, priceIndex, priceIndexCompanies } from "@/data/price-index";
import { scenes } from "@/lib/scenes";
import { seo } from "@/lib/seo";
import { site } from "@/lib/site";

const title = `Press and Media: ${site.name}`;
const description = `Facts, story ideas, price data and contact details for writers covering weddings, parties and event rentals in Chicago. Quick replies to press questions.`;

export const metadata = seo({
  title,
  description,
  alternates: { canonical: "/press" },
  openGraph: { title, description, url: "/press" },
});

const avgGap = Math.round(priceIndex.reduce((s, r) => s + r.gapPct, 0) / priceIndex.length);
const pressMail = `mailto:${site.email}?subject=Press%20question`;

const facts: [string, string][] = [
  ["What we are", `A Chicago-area event rental marketplace. Hosts build one quote for chairs, tables, linens, dinnerware, tents and more, and we book each item with a local rental company.`],
  ["Based in", `${site.city}, serving Chicago and the suburbs`],
  ["Started", "2026"],
  ["Founder", "Angad Singh"],
  ["Items listed with prices", catalogItems.length.toLocaleString()],
  ["How we charge", "The rental company's price plus a 10% fee, shown on every item. Quotes and planning calls are free."],
  ["Website", site.domain],
  ["Email", site.email],
];

const angles = [
  {
    title: "Why the same rental chair costs twice as much across town",
    text: `Our price index compares ${priceIndex.length} items at ${priceIndexCompanies} Chicago-area rental companies. On average the highest price is ${avgGap}% above the lowest for the same item.`,
    href: PRICE_INDEX_SLUG,
  },
  {
    title: "What a backyard party for 100 really costs in Chicago",
    text: "Item-by-item rental costs, plus the delivery, setup, damage waiver and tax that most people forget to budget for.",
    href: "/rental-cost",
  },
  {
    title: "Planning an outdoor party around Chicago weather",
    text: "When to book a tent, how big it needs to be and what a rain plan costs, by month.",
    href: "/chicago-event-seasons",
  },
  {
    title: "How many chairs, tables and plates do you need?",
    text: "Free calculators for tent size, tables and chairs, bar supplies and venue capacity that anyone can use or embed.",
    href: "/tools",
  },
];

const topics = [
  "Event rental prices and fees in Chicago and the suburbs",
  "Budgeting a wedding, graduation, quinceañera or backyard party",
  "How far ahead to book rentals for peak dates (June, September, December)",
  "Tents, heaters and rain plans for Chicago weather",
  "Chair and table counts, layouts and room sizes",
  "What to ask a rental company before you pay a deposit",
];

const faqs = [
  { q: "How fast do you reply to press questions?", a: `Email ${site.email} with "Press" in the subject. We reply within one business day. Tell us your deadline and we will do our best to meet it.` },
  { q: "Can I use your price data?", a: `Yes. The price index and its CSV are free to use with credit to ${site.name} and a link to the page.` },
  { q: "Can I use your photos?", a: "Most images on the site are our own renders and generated event scenes, and some are licensed stock photos. Ask us and we will send ones you can use with credit." },
  { q: "Do you own the rental items?", a: "No. The items belong to established Chicago-area rental companies we work with. We put them in one quote and coordinate delivery, setup and pickup." },
];

export default function PressPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          url: site.url,
          email: site.email,
          founder: { "@type": "Person", name: "Angad Singh" },
          foundingDate: "2026",
          address: { "@type": "PostalAddress", addressLocality: site.locality, addressRegion: site.region, addressCountry: "US" },
          areaServed: "Chicago metropolitan area",
          sameAs: [site.instagram, site.pinterest],
        }}
      />
      <PageHero
        eyebrow="Press and media"
        title={<>For writers covering <em className="text-gold">Chicago events</em></>}
        intro={
          <p data-answer>
            {site.name} is a Chicago-area event rental marketplace based in {site.city}. If you are writing about wedding or party costs, event rentals or
            planning an event in Chicago, we can give you price data, a short quote or background on how event rentals work. Email {site.email}.
          </p>
        }
        breadcrumbs={[{ name: "Press", href: "/press" }]}
        actions={
          <div className="flex flex-wrap gap-3">
            <a href={pressMail} className="btn-primary">Email a press question</a>
            <Link href={PRICE_INDEX_SLUG} className="btn-ghost">See the price data</Link>
          </div>
        }
        media={<Figure {...scenes.gildedIvory} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" />}
      />

      <Section eyebrow="Quick facts" title="About us in one look">
        <dl className="grid max-w-4xl gap-x-10 gap-y-5 sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k} className="border-l border-gold/40 pl-4">
              <dt className="text-sm text-muted">{k}</dt>
              <dd className="mt-1">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="sand" eyebrow="Story ideas" title="Stories we can help with">
        <div className="grid gap-6 md:grid-cols-2">
          {angles.map((a) => (
            <Link key={a.title} href={a.href} className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-gold">
              <h3 className="font-serif text-xl">{a.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{a.text}</p>
              <span className="mt-4 inline-block text-sm text-gold">See the page →</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Topics" title="What we can talk about">
        <ul className="grid max-w-4xl list-disc gap-3 pl-5 leading-7 text-muted sm:grid-cols-2">
          {topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" eyebrow="Logo and images" title="Brand files">
        <p className="max-w-3xl leading-7 text-muted">
          Please write the name as &ldquo;{site.name}&rdquo; (two words, capital B and C). For our logo or event photos you can publish, email{" "}
          <a href={pressMail} className="link-line">{site.email}</a> and tell us where it will run.
        </p>
      </Section>

      <Section eyebrow="FAQ" title="Press questions">
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} />
        </div>
      </Section>
    </>
  );
}
