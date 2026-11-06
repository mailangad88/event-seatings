import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { EmbedBuilder } from "@/components/tools/EmbedBuilder";
import { FaqList, PageHero, QuoteCta, Section, StepFlow } from "@/components/ui";
import { getTool } from "@/data/tools";
import { embeddable } from "@/lib/tools/embeds";
import { render } from "@/lib/scenes";
import { site } from "@/lib/site";

const title = "Free Event Calculators to Embed on Your Website";
const description = `Add ${site.name}'s tent size, tables and chairs, and other event calculators to your website with one copy-and-paste snippet. No account needed.`;
const hero = render("hero-layouts");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/embed" },
  openGraph: { title, description, url: "/tools/embed", images: [{ url: hero.src, alt: hero.alt }] },
};

const faqs = [
  { q: "Is it free to embed the calculators?", a: "Yes. No account, no fee and no ads. We ask that you keep the small credit link under the calculator." },
  { q: "Will it slow down my site?", a: "The calculator loads in an iframe with lazy loading, so it only loads when a visitor scrolls to it and doesn't block your page." },
  { q: "Does it collect my visitors' data?", a: "The calculators run in the browser and don't ask for contact details. If a visitor clicks through to our site, that visit is tagged with your website name so we know you sent them." },
  { q: "Can I change the size?", a: "The snippet resizes the iframe to fit the calculator automatically. You can also set a fixed height in the iframe tag." },
  { q: "Do you have a version for my venue's capacity?", a: "Tell us your room sizes and we can suggest which calculator fits best, or book a call to talk about a partner listing." },
];

export default function EmbedPage() {
  const tools = embeddable.map((s) => getTool(s)).filter((t): t is NonNullable<typeof t> => !!t).map((t) => ({ slug: t.slug, name: t.name }));
  return (
    <>
      <PageHero
        eyebrow="For venues and planners"
        title={<>Put our free calculators <em className="text-gold">on your site</em></>}
        intro={
          <p data-answer>
            Pick a calculator, copy one snippet and paste it into any page on your website. Your visitors get a free tent size, tables and chairs, venue capacity, bar or budget calculator that resizes itself, with no account, no ads and nothing to maintain. Just keep the small credit link underneath.
          </p>
        }
        breadcrumbs={[{ name: "Free tools", href: "/tools" }, { name: "Embed", href: "/tools/embed" }]}
        media={
          <figure className="media aspect-[4/3] shadow-lift">
            <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </figure>
        }
      />
      <Section eyebrow="Get the code" title="Choose a calculator">
        <EmbedBuilder tools={tools} siteUrl={site.url} siteName={site.name} />
      </Section>
      <Section tone="sand" eyebrow="How it works" title="Three steps, two minutes">
        <StepFlow
          steps={[
            { title: "Pick a calculator", text: "Ten to choose from.", icon: "ruler" },
            { title: "Copy the snippet", text: "Add your site name if you like.", icon: "quote" },
            { title: "Paste it into your page", text: "Works in WordPress, Squarespace, Wix and plain HTML.", icon: "check" },
          ]}
        />
      </Section>
      <Section eyebrow="Available calculators" title="What you can embed">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <li key={t.slug}>
              <Link href={`/tools/${t.slug}`} className="card card-hover block h-full p-4 text-sm font-medium">{t.name}</Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="sand" eyebrow="Questions" title="Embedding FAQ">
        <FaqList faqs={faqs} className="max-w-3xl" />
        <p className="mt-6 text-sm text-muted">Rental company? See <Link href="/partners" className="link">our partner program</Link>.</p>
      </Section>
      <QuoteCta source="tools-embed" />
    </>
  );
}
