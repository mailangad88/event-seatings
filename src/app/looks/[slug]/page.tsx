import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChairCard } from "@/components/ChairCard";
import { DecoFrame } from "@/components/DecoFrame";
import { FaqList } from "@/components/FaqList";
import { LookLeadForm } from "@/components/LookLeadForm";
import { LookScene, lookMedia } from "@/components/LookScene";
import { chairs, getChair } from "@/data/chairs";
import { getLook, looks } from "@/data/looks";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return looks.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(props: PageProps<"/looks/[slug]">): Promise<Metadata> {
  const look = getLook((await props.params).slug);
  if (!look) return {};
  const chair = getChair(look.heroChair);
  const description = `${look.kicker}. How to get the ${look.name} look for your wedding or event, built around the ${chair?.name}. Delivered and set up across Chicagoland.`;
  return {
    title: `${look.name} Wedding Decor Look`,
    description,
    alternates: { canonical: `/looks/${look.slug}` },
    openGraph: {
      title: `${look.name}: get the look`,
      description,
      url: `/looks/${look.slug}`,
      images: [
        lookMedia(look).still
          ? { url: lookMedia(look).still!, width: 1080, height: 1920 }
          : { url: `/chairs/render/${look.heroChair}.jpg`, width: 1000, height: 1250 },
      ],
    },
  };
}

export default async function LookPage(props: PageProps<"/looks/[slug]">) {
  const look = getLook((await props.params).slug);
  if (!look) notFound();

  const hero = getChair(look.heroChair)!;
  const also = look.alsoChairs.map(getChair).filter((c) => c !== undefined);
  const leadChairs = [hero.slug, ...also.map((c) => c.slug)];
  const others = looks.filter((l) => l.slug !== look.slug).slice(0, 3);

  const faqs: [string, string][] = [
    [
      `What chairs create the ${look.name} look?`,
      `The ${hero.name} is the heart of it (estimated ${hero.estPrice}${hero.estPrice.includes("/") ? "" : " per chair"}). It also works with the ${also.map((c) => c.name).join(" or the ")} for a ceremony, lounge or a second room.`,
    ],
    [
      `What venues suit ${look.name}?`,
      `${look.bestFor.join(", ")}. Around Chicagoland that includes venues from the city and North Shore to the Fox Valley and western suburbs.`,
    ],
    [
      "How much does it cost to rent chairs for this look?",
      `Multiply your guest count by the per-chair estimate, then add delivery, which depends on distance and venue access. For an exact number, request the look board and we'll price it for your date.`,
    ],
    [
      "Do you set up the chairs?",
      "Yes. We deliver, place every chair to your layout and collect everything after the event.",
    ],
  ];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "The Look Book", item: `${site.url}/looks` },
      { "@type": "ListItem", position: 2, name: look.name, item: `${site.url}/looks/${look.slug}` },
    ],
  };

  return (
    <div className="pb-24 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />

      <div className="container-x pt-8 md:pt-14">
        <nav className="text-[11px] tracking-[0.2em] text-muted uppercase" aria-label="Breadcrumb">
          <Link href="/looks" className="hover:text-ink">The look book</Link>
          <span className="mx-3 text-gold" aria-hidden>/</span>
          {look.name}
        </nav>

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
          <div className="md:sticky md:top-32 md:self-start">
            <LookScene look={look} priority motion className="aspect-[4/5] md:aspect-[9/12]" />
          </div>

          <div className="md:py-4">
            <p className="font-serif text-lg text-gold italic">{look.season}</p>
            <h1 className="headline mt-3 text-5xl leading-[1] sm:text-7xl">{look.name}</h1>
            <p className="mt-4 font-serif text-2xl leading-snug font-light text-muted italic">{look.kicker}</p>
            <p className="mt-6 leading-8">{look.story}</p>

            <div id="get" className="mt-10 scroll-mt-32">
              <DecoFrame label="Get this look">
                <div className="bg-surface px-5 pt-10 pb-6 sm:px-8">
                  <p className="mb-6 text-center leading-7 text-muted">
                    The full recipe and chair pricing for your date, sent to your inbox.
                  </p>
                  <LookLeadForm lookSlug={look.slug} lookName={look.name} chairs={leadChairs} />
                </div>
              </DecoFrame>
            </div>

            <h2 className="mt-14 text-[11px] font-medium tracking-[0.25em] text-gold uppercase">The palette</h2>
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {look.palette.map((s) => (
                <li key={s.name}>
                  <span className="block aspect-square ring-1 ring-ink/15" style={{ background: s.hex }} />
                  <span className="mt-2 block text-xs text-muted">{s.name}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-12 text-[11px] font-medium tracking-[0.25em] text-gold uppercase">The recipe</h2>
            <dl className="mt-4 border-t border-line text-sm">
              <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">Chair</dt>
                <dd>
                  <Link href={`/chairs/${hero.slug}`} className="underline decoration-gold underline-offset-4 hover:text-gold">
                    {hero.name}
                  </Link>
                </dd>
              </div>
              {look.details.map((d) => (
                <div key={d.label} className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                  <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">{d.label}</dt>
                  <dd>{d.text}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">Best for</dt>
                <dd>{look.bestFor.join(" · ")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* The chairs */}
      <section className="container-x mt-24">
        <p className="eyebrow">The chairs</p>
        <h2 className="headline mt-6 text-5xl sm:text-6xl">
          What makes it <em>work</em>
        </h2>
        <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {[hero, ...also].map((c) => (
            <ChairCard key={c.slug} chair={c} index={chairs.indexOf(c)} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x mt-24">
        <div className="grid gap-14 md:grid-cols-[1fr_1.6fr] md:gap-20">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="headline mt-6 text-5xl leading-[0.95]">
              About <em className="text-gold">this look</em>
            </h2>
            <p className="mt-6 leading-7 text-muted">
              Rather talk it through?{" "}
              <Link href={`/book?from=look-${look.slug}`} className="underline decoration-gold underline-offset-4 hover:text-gold">
                Book a free 15-minute call
              </Link>
              .
            </p>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </section>

      {/* More looks */}
      <section className="container-x mt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="headline text-5xl">More looks</h2>
          <Link href="/looks" className="link-line">All {looks.length} looks</Link>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-8">
          {others.map((l) => (
            <Link key={l.slug} href={`/looks/${l.slug}`} className="group">
              <LookScene look={l} showPalette={false} className="aspect-[4/5]" />
              <p className="mt-3 font-serif text-lg leading-tight transition-colors group-hover:text-gold sm:text-2xl">{l.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Sticky mobile call to action */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 p-3 backdrop-blur md:hidden">
        <a href="#get" className="btn-primary w-full">Get this look</a>
      </div>
    </div>
  );
}
