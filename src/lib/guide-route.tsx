import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { CallCta } from "@/components/CallCta";
import { ChairArt } from "@/components/ChairArt";
import { GuideShell, HubLinks } from "@/components/GuideShell";
import { FaqList } from "@/components/ui";
import { chairs } from "@/data/chairs";
import { type GuideFamily } from "@/lib/guide-content";
import { seo } from "@/lib/seo";
import { site } from "@/lib/site";
import { logoDataUri, logoWidth } from "@/components/brand/logo-svg";

type P = { params: Promise<{ slug: string }> };

export function guideRoute(family: GuideFamily) {
  return {
    generateStaticParams: () => family.slugs().map((slug) => ({ slug })),
    async generateMetadata({ params }: P): Promise<Metadata> {
      const g = family.build((await params).slug);
      if (!g) return {};
      return seo({
        title: g.title,
        description: g.description,
        alternates: { canonical: g.path },
        openGraph: { title: g.title, description: g.description, type: "article", url: g.path, images: [{ url: `${g.path}/opengraph-image`, alt: g.visualAlt, width: 1200, height: 630 }] },
      });
    },
    async Page({ params }: P) {
      const g = family.build((await params).slug);
      if (!g) notFound();
      return <GuideShell {...g} />;
    },
    async image({ params }: P) {
      const g = family.build((await params).slug);
      return ogCard(g?.title ?? site.name, g?.eyebrow ?? "");
    },
  };
}

export function ogCard(title: string, eyebrow: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f7f3ec", color: "#1b1815", padding: 70, fontFamily: "serif" }}>
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#a88a5a", textTransform: "uppercase", display: "flex" }}>{eyebrow}</div>
        <div style={{ fontSize: title.length > 70 ? 54 : 66, lineHeight: 1.1, display: "flex" }}>{title}</div>
        <div style={{ fontSize: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={logoDataUri("light")} width={logoWidth(64)} height={64} />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

export function guideHub(family: GuideFamily, intro: string) {
  const slugs = family.slugs();
  const sample = [chairs[0], chairs[2], chairs[5]];
  return {
    metadata: seo({
      title: family.hubTitle,
      description: family.hubDescription,
      alternates: { canonical: family.base },
    }),
    Page() {
      const items = slugs.map((s) => ({ href: `${family.base}/${s}`, ...family.label(s) }));
      const jsonLd = [
        { "@context": "https://schema.org", "@type": "CollectionPage", name: family.hubTitle, description: family.hubDescription, url: `${site.url}${family.base}` },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: family.hubTitle, item: `${site.url}${family.base}` },
          ],
        },
        { "@context": "https://schema.org", "@type": "ItemList", itemListElement: items.slice(0, 200).map((it, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}${it.href}`, name: it.label })) },
      ];
      return (
        <>
          <div className="container-x py-14">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <p className="eyebrow">Planning guides</p>
            <h1 className="display-1 mt-5 max-w-3xl">{family.hubTitle}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted" data-answer>{intro}</p>
            <div className="mt-10 grid max-w-3xl grid-cols-3 gap-4">
              {sample.map((c) => (
                <ChairArt key={c.slug} chair={c} className="aspect-[4/5] rounded-lg" />
              ))}
            </div>
            <p className="mt-3 text-sm text-muted">Photos: a few of the chairs these guides recommend.</p>
            <HubLinks items={items} />
            {family.hubFaqs && (
              <section className="mt-16 max-w-3xl" aria-labelledby="hub-faq">
                <h2 id="hub-faq" className="headline text-3xl sm:text-4xl">
                  Quick answers
                </h2>
                <FaqList faqs={family.hubFaqs} className="mt-6" />
              </section>
            )}
            <p className="mt-10 text-sm text-muted">
              Not sure? <Link href="/book?from=hub" className="underline">Book a free seating call</Link> or try the <Link href="/seating-planner" className="underline">seating planner</Link>.
            </p>
          </div>
          <CallCta source={`hub-${family.key}`} />
        </>
      );
    },
  };
}
