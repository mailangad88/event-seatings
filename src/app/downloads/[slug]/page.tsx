import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadGate } from "@/components/DownloadGate";
import { FaqList, JsonLd, PageHero, Section } from "@/components/ui";
import { coverImage, downloads, getDownload } from "@/data/downloads";
import { getPosts } from "@/lib/blog";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export function generateStaticParams() {
  return downloads.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: PageProps<"/downloads/[slug]">): Promise<Metadata> {
  const d = getDownload((await props.params).slug);
  if (!d) return {};
  const title = `Free ${d.title} (${[...new Set(d.files.map((f) => f.format))].join(" + ")})`;
  return seo({
    title,
    description: d.description,
    keywords: [d.keyword, `free ${d.keyword}`, `${d.keyword} template`, `${d.keyword} chicago`],
    alternates: { canonical: `/downloads/${d.slug}` },
    openGraph: { title, description: d.description, url: `/downloads/${d.slug}`, images: [{ url: coverImage(d.slug), alt: `Cover of the free ${d.title}` }] },
  });
}

export default async function DownloadPage(props: PageProps<"/downloads/[slug]">) {
  const d = getDownload((await props.params).slug);
  if (!d) notFound();
  const posts = (await getPosts()).filter((p) => p.download === d.slug).slice(0, 9);
  const others = downloads.filter((o) => o.slug !== d.slug && (o.group === d.group || o.group === "Any event")).slice(0, 3);
  const url = `${site.url}/downloads/${d.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DigitalDocument",
          name: d.title,
          description: d.description,
          url,
          image: `${site.url}${coverImage(d.slug)}`,
          isAccessibleForFree: true,
          inLanguage: "en-US",
          keywords: d.keyword,
          encodingFormat: d.files.map((f) => (f.format === "PDF" ? "application/pdf" : f.format === "CSV" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")),
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
        }}
      />
      <PageHero
        eyebrow={`Free download · ${d.group}`}
        title={`Free ${d.title}`}
        intro={d.intro}
        breadcrumbs={[
          { name: "Free downloads", href: "/downloads" },
          { name: d.title, href: `/downloads/${d.slug}` },
        ]}
        actions={<a href="#get-it" className="btn-accent">Get it free</a>}
        media={
          <figure>
            <Image
              src={coverImage(d.slug)}
              alt={`Preview of the first page of the ${d.title}`}
              width={816}
              height={1056}
              className="mx-auto max-h-[560px] w-auto rounded-lg border border-line object-contain shadow-xl"
              priority
            />
            <figcaption className="mt-3 text-center text-sm text-muted">First page of the {d.title}.</figcaption>
          </figure>
        }
      />
      <Section eyebrow="What's inside" title="Everything in the kit">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <ul className="grid gap-3">
              {d.inside.map((i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-line bg-surface px-4 py-3">
                  <span aria-hidden className="mt-1 inline-block h-4 w-4 shrink-0 rounded border-2 border-gold" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <h2 className="display-3 mt-10">Files you get</h2>
            <ul className="mt-4 grid gap-3">
              {d.files.map((f) => (
                <li key={f.file} className="rounded-xl border border-line px-4 py-3">
                  <span className="mr-2 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-gold">{f.format}</span>
                  <span className="font-medium">{f.label}</span>
                  <span className="mt-1 block text-sm text-muted">{f.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div id="get-it" className="lg:sticky lg:top-24 lg:self-start">
            <DownloadGate slug={d.slug} title={d.title} files={d.files} />
          </div>
        </div>
      </Section>
      {posts.length > 0 && (
        <Section tone="sand" eyebrow="Read next" title="Guides that go with this download">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="block h-full rounded-xl border border-line bg-surface p-5 hover:border-gold">
                  <span className="font-medium">{p.title}</span>
                  <span className="mt-2 block text-sm text-muted">{p.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Section eyebrow="Questions" title={`About the ${d.title}`}>
        <FaqList faqs={d.faqs} />
      </Section>
      <Section tone="sand" eyebrow="More free downloads" title="Pair it with">
        <ul className="grid gap-6 sm:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/downloads/${o.slug}`} className="block overflow-hidden rounded-2xl border border-line bg-surface hover:border-gold">
                <div className="relative aspect-[4/3] bg-bg">
                  <Image src={coverImage(o.slug)} alt={`Preview of the ${o.title}`} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover object-top" />
                </div>
                <p className="p-4 font-medium">{o.title}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8"><Link href="/downloads" className="link">See all {downloads.length} free downloads</Link></p>
      </Section>
    </>
  );
}
