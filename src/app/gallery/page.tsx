import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { CallCta } from "@/components/CallCta";
import { SaveIdea } from "@/components/myevents/SaveIdea";
import { getProduct } from "@/data/catalog-products";
import { extraImages, imageCategories, productImages, rentalImageJsonLd, sceneImages } from "@/data/rental-images";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Event Rental Gallery: Chairs, Tables, Tents & Linens",
  description: `See every event rental ${site.name} offers in the Chicago area, pictured true to size in real-world settings: chairs, tables, linens, tents, dinnerware, dance floors, lighting, lounge furniture and more.`,
  alternates: { canonical: "/gallery" },
  openGraph: sceneImages[0] ? { images: [{ url: sceneImages[0].src, alt: sceneImages[0].alt }] } : undefined,
});

const faqs = [
  {
    q: "Are these photos of the actual rentals?",
    a: `They are photorealistic visualizations built to each item's real rental dimensions and lit with real-world light, so you can compare styles and sizes before you book. Pages also show real event photos (marked "Example photo"). Exact finishes vary slightly by partner vendor; ask on your free call and we will send photos of the specific stock reserved for your date.`,
  },
  {
    q: "Can I see a whole table or tent set up before I rent?",
    a: "Yes. The event setups at the top of this page show complete looks (a ballroom reception, a garden ceremony, a cocktail hour and tent receptions). On a seating call we can sketch your own layout and quantities.",
  },
  {
    q: "How do I get prices for what I see here?",
    a: "Request a free quote listing the pieces you like (or book a free call) and we send an all-in estimate and confirm availability and delivery for your Chicago-area venue.",
  },
  {
    q: "Do you deliver these rentals across Chicago and the suburbs?",
    a: `Yes. We coordinate delivery, setup and pickup across ${site.serviceArea.slice(0, 6).join(", ")} and the wider Chicago area.`,
  },
];

export default function GalleryPage() {
  const url = `${site.url}/gallery`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageGallery",
        "@id": `${url}#gallery`,
        url,
        name: `${site.name} event rental gallery`,
        description: metadata.description,
        about: "Event rentals in the Chicago area",
        image: [...sceneImages, ...productImages, ...extraImages].map((i) => rentalImageJsonLd(i)),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  const groups = imageCategories
    .map((c) => ({
      ...c,
      items: productImages.filter((i) => i.category === c.id),
      extras: extraImages.filter((i) => i.category === c.id),
    }))
    .filter((g) => g.items.length);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-x py-20">
        <Breadcrumbs items={[{ name: "Gallery", href: "/gallery" }]} className="mb-6" />
        <p className="eyebrow">Gallery</p>
        <h1 className="display-1 mt-6 max-w-4xl">
          See the rentals before you book
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Pictures of {productImages.length} event rentals and {sceneImages.length} full setups, drawn from real rental
          sizes so you can see how chairs, tables, linens, tents and decor will look at your Chicago event before
          you book. Pick a section below to jump straight to it, then add what you like to your quote.
        </p>
        <nav aria-label="Gallery sections" className="mt-8 flex flex-wrap gap-3 text-sm">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="rounded-full border border-line px-4 py-1.5 hover:border-gold">
              {g.label}
            </a>
          ))}
        </nav>

        {sceneImages.length > 0 && (
          <section aria-labelledby="setups" className="mt-16">
            <h2 id="setups" className="headline text-4xl">Complete event setups</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sceneImages.slice(0, 6).map((s, i) => (
                <SetupFigure key={s.slug} s={s} priority={i === 0} />
              ))}
            </div>
            {sceneImages.length > 6 && (
              <details className="mt-8">
                <summary className="link-line cursor-pointer text-sm">Show all {sceneImages.length} setups</summary>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sceneImages.slice(6).map((s) => (
                    <SetupFigure key={s.slug} s={s} />
                  ))}
                </div>
              </details>
            )}
          </section>
        )}

        {groups.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="mt-20 scroll-mt-24">
            <div className="flex items-end justify-between gap-6">
              <h2 id={`${g.id}-h`} className="headline text-4xl">{g.label}</h2>
              <Link href="/quote" className="link-line text-sm">Get a quote</Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {g.items.slice(0, 4).map((it) => (
                <ItemFigure key={it.slug} it={it} />
              ))}
            </ul>
            {g.items.length > 4 && (
              <details className="mt-8">
                <summary className="link-line cursor-pointer text-sm">Show all {g.items.length} {g.label.toLowerCase()}</summary>
                <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {g.items.slice(4).map((it) => (
                    <ItemFigure key={it.slug} it={it} />
                  ))}
                </ul>
              </details>
            )}
            {g.extras.length > 0 && (
              <details className="mt-8">
                <summary className="link-line cursor-pointer text-sm">
                  More colours &amp; angles ({g.extras.length})
                </summary>
                <ul className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                  {g.extras.map((it) => (
                    <li key={it.slug}>
                      <figure>
                        <Image
                          src={it.src}
                          alt={it.alt}
                          width={it.width}
                          height={it.height}
                          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                          className="aspect-square h-auto w-full bg-surface-2 object-cover"
                        />
                        <figcaption className="mt-1 text-xs text-muted">{it.caption}</figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        ))}

        <section aria-labelledby="gallery-faq" className="mt-24 max-w-3xl">
          <h2 id="gallery-faq" className="headline text-4xl">Gallery questions</h2>
          <dl className="mt-8 space-y-8">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-heading font-semibold text-2xl">{f.q}</dt>
                <dd className="mt-2 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <div className="mt-12 -mb-32">
        <CallCta source="gallery" title={<>Like what you see? Let&apos;s <em className="text-gold">plan it</em></>} />
      </div>
    </>
  );
}

type Img = (typeof productImages)[number];

function SetupFigure({ s, priority = false }: { s: (typeof sceneImages)[number]; priority?: boolean }) {
  return (
    <figure className="relative">
      <SaveIdea idea={{ src: s.src, alt: s.alt, caption: s.caption }} className="absolute top-3 right-3 z-10" />
      <div className="media relative aspect-[4/3] overflow-hidden">
        <Image src={s.src} alt={s.alt} fill priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
      </div>
      <figcaption className="mt-3 text-sm text-muted">{s.caption}</figcaption>
    </figure>
  );
}

function ItemFigure({ it }: { it: Img }) {
  const product = getProduct(it.slug);
  return (
    <li>
      <figure className="relative">
        <SaveIdea
          idea={{ src: it.src, alt: it.alt, caption: it.caption, href: product ? `/rentals/${product.category}/${it.slug}` : undefined }}
          className="absolute top-2 right-2 z-10"
        />
        <Image
          src={it.src}
          alt={it.alt}
          width={it.width}
          height={it.height}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="aspect-square h-auto w-full bg-surface-2 object-cover"
        />
        <figcaption className="mt-2 text-sm">{it.caption}</figcaption>
      </figure>
    </li>
  );
}
