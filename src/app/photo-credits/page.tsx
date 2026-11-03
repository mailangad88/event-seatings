import type { Metadata } from "next";
import Link from "next/link";
import { PhotoCredit, StockImg } from "@/components/rentals/StockPhoto";
import { JsonLd } from "@/components/rentals/parts";
import { UNSPLASH_LICENSE, UNSPLASH_URL, stockImageJsonLd, stockPhotos } from "@/data/stock-photos";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Photo Credits",
  description: `Credits for the real event photos used across ${site.name}: photographers on Unsplash, licence and how we label example photos.`,
  alternates: { canonical: "/photo-credits" },
});

const photos = Object.entries(stockPhotos).map(([key, p]) => ({ key, ...p }));

export default function PhotoCreditsPage() {
  return (
    <div className="container-x py-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: `${site.name} event rental photo credits`,
          url: `${site.url}/photo-credits`,
          image: photos.map((p) => stockImageJsonLd(p, p.alt)),
        }}
      />
      <div className="max-w-3xl">
        <p className="eyebrow">Credits</p>
        <h1 className="headline mt-6 text-5xl sm:text-6xl">Photo credits</h1>
        <p className="mt-6 text-lg leading-8">
          Alongside our 3D renders, {site.name} shows real photos of event rentals in use so you can picture your day. These
          photos come from photographers on{" "}
          <a href={UNSPLASH_URL} className="link-line" rel="noopener">
            Unsplash
          </a>{" "}
          under the{" "}
          <a href={UNSPLASH_LICENSE} className="link-line" rel="noopener">
            Unsplash License
          </a>
          . Thank you to every photographer below.
        </p>
        <p className="mt-4 text-muted">
          They are marked &ldquo;Example photo&rdquo; because they show the type of item, not our rental partners&rsquo;
          exact stock. Want to see the actual piece? Ask in your{" "}
          <Link href="/quote?from=photo-credits" className="link-line">
            quote request
          </Link>{" "}
          and we&rsquo;ll send photos from the rental partner.
        </p>
      </div>
      <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {photos.map((p) => (
          <li key={p.key}>
            <figure>
              <div className="media relative aspect-[4/3] overflow-hidden">
                <StockImg photo={p} alt={`${p.alt} (photo by ${p.by} on Unsplash)`} width={360} height={270} />
              </div>
              <figcaption className="mt-2 text-sm">
                {p.alt}
                <span className="block text-xs text-muted">
                  <PhotoCredit photo={p} />
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
