import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CallCta } from "@/components/CallCta";
import { extraImages, imageCategories, productImages, rentalImageJsonLd, sceneImages } from "@/data/rental-images";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Event Rental Gallery: Chairs, Tables, Tents & Linens",
  description: `See every event rental ${site.name} offers in the Chicago area, pictured true to size in real-world settings: chairs, tables, linens, tents, dinnerware, dance floors, lighting, lounge furniture and more.`,
  alternates: { canonical: "/gallery" },
  openGraph: sceneImages[0] ? { images: [{ url: sceneImages[0].src, alt: sceneImages[0].alt }] } : undefined,
};

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
        <p className="eyebrow">Gallery</p>
        <h1 className="headline mt-6 max-w-4xl text-5xl leading-[0.98] sm:text-7xl">
          Every rental, <em className="text-gold">true to size</em> before you book
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          {productImages.length} event rentals, {extraImages.length} extra colours and angles, and{" "}
          {sceneImages.length} full setups, built from real rental dimensions and pictured in real-world light
          so you can picture your Chicago event: chairs, tables, linens, tents, dinnerware, dance floors,
          lighting, lounge furniture, decor and games.
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
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {sceneImages.map((s, i) => (
                <figure key={s.slug} className={i === 0 ? "md:col-span-2" : ""}>
                  <Image
                    src={s.src}
                    alt={s.alt}
                    width={s.width}
                    height={s.height}
                    priority={i === 0}
                    sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                    className="h-auto w-full"
                  />
                  <figcaption className="mt-3 text-sm text-muted">{s.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {groups.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="mt-20 scroll-mt-24">
            <div className="flex items-end justify-between gap-6">
              <h2 id={`${g.id}-h`} className="headline text-4xl">{g.label}</h2>
              <Link href="/quote" className="link-line text-sm">Get a quote</Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {g.items.map((it) => (
                <li key={it.slug}>
                  <figure>
                    <Image
                      src={it.src}
                      alt={it.alt}
                      width={it.width}
                      height={it.height}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="aspect-square h-auto w-full bg-[#efe9df] object-cover"
                    />
                    <figcaption className="mt-2 text-sm">{it.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            {g.extras.length > 0 && (
              <details className="mt-8">
                <summary className="cursor-pointer text-sm font-medium">
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
                          className="aspect-square h-auto w-full bg-[#efe9df] object-cover"
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
                <dt className="font-serif text-2xl">{f.q}</dt>
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
