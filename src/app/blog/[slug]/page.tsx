import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChairArt } from "@/components/ChairArt";
import { chairAlt, chairImage, getChair } from "@/data/chairs";
import { formatDate, getPost, getPosts, getRelated, topicSlug } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const found = await getPost((await props.params).slug);
  if (!found) return {};
  const { post } = found;
  const chair = getChair(post.chair);
  const img = post.image ?? (chair && chairImage(chair));
  const alt = post.image ? post.imageAlt ?? post.title : chair && chairAlt(chair);
  return {
    title: post.title,
    description: post.description,
    keywords: [post.keyword, ...post.tags].filter(Boolean) as string[],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      // SVG art can't be a social preview, so sharing falls back to the chair photo.
      ...(img && !img.endsWith(".svg") ? { images: [{ url: img, alt }] } : chair && chairImage(chair) ? { images: [{ url: chairImage(chair)!, alt: chairAlt(chair) }] } : {}),
    },
  };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const found = await getPost((await props.params).slug);
  if (!found) notFound();
  const { post, html, faqs } = found;
  const chair = getChair(post.chair);
  const img = post.image ?? (chair && chairImage(chair));
  const alt = post.image ? post.imageAlt ?? post.title : chair ? chairAlt(chair) : "";
  const related = await getRelated(post);
  const url = `${site.url}/blog/${post.slug}`;
  const topicUrl = `/blog/topic/${topicSlug(post.topic)}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      ...(img && { image: { "@type": "ImageObject", url: `${site.url}${img}`, caption: alt } }),
      keywords: [post.keyword, ...post.tags].filter(Boolean).join(", "),
      articleSection: post.topic,
      url,
      mainEntityOfPage: url,
      inLanguage: "en-US",
      spatialCoverage: { "@type": "Place", name: "Chicago metropolitan area, Illinois" },
      author: { "@type": "Organization", name: site.name, url: site.url },
      publisher: { "@id": `${site.url}/#business` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Journal", item: `${site.url}/blog` },
        { "@type": "ListItem", position: 2, name: post.topic, item: `${site.url}${topicUrl}` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (faqs.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

  return (
    <article className="container-x max-w-4xl py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="text-center">
        <nav aria-label="Breadcrumb" className="text-[11px] tracking-[0.22em] text-muted uppercase">
          <Link href="/blog" className="hover:text-ink">The journal</Link>
          <span aria-hidden> / </span>
          <Link href={topicUrl} className="hover:text-ink">{post.topic}</Link>
        </nav>
        <p className="mt-10 text-[11px] tracking-[0.22em] text-gold uppercase">
          {formatDate(post.date)} · {post.readingMinutes} min read
        </p>
        <h1 className="headline mt-6 text-5xl leading-[1.02] sm:text-7xl">{post.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl font-serif text-2xl leading-snug font-light text-muted italic">
          {post.description}
        </p>
        {post.updated && post.updated !== post.date && (
          <p className="mt-6 text-[11px] tracking-[0.22em] text-muted uppercase">Updated {formatDate(post.updated)}</p>
        )}
        <span className="mx-auto mt-10 block h-px w-16 bg-gold" aria-hidden />
      </div>
      {post.image ? (
        <figure className="mx-auto mt-12 max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG art renders crisp without the image optimizer */}
          <img src={post.image} alt={alt} width={800} height={1000} className="aspect-[4/5] w-full object-cover" />
          {post.imageAlt && <figcaption className="mt-3 text-sm text-muted">{post.imageAlt}</figcaption>}
        </figure>
      ) : chair && (
        <figure className="mx-auto mt-12 max-w-md">
          <ChairArt chair={chair} priority className="aspect-[4/5]" />
          <figcaption className="mt-3 text-sm text-muted">
            Pictured: the <Link href={`/chairs/${chair.slug}`} className="underline decoration-gold underline-offset-4">{chair.name}</Link>, {chair.tagline.charAt(0).toLowerCase()}{chair.tagline.slice(1)}.
          </figcaption>
        </figure>
      )}
      <div className="prose-post mx-auto mt-12 max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />
      {related.length > 0 && (
        <aside className="mx-auto mt-20 max-w-2xl border-t border-line pt-10">
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Related guides</p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {related.map((r) => {
              const rc = getChair(r.chair);
              return (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`} className="group flex gap-4">
                    {r.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small SVG thumbnail
                      <img src={r.image} alt={r.imageAlt ?? ""} width={80} height={100} loading="lazy" className="h-[100px] w-[80px] shrink-0 object-cover" />
                    ) : rc ? (
                      <ChairArt chair={rc} className="aspect-[4/5] w-[80px] shrink-0" />
                    ) : null}
                    <span className="font-serif text-xl leading-snug transition-colors group-hover:text-gold">{r.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href={topicUrl} className="link-line mt-8">More in {post.topic}</Link>
        </aside>
      )}
      <div className="mx-auto mt-24 max-w-2xl border-t border-gold/40 pt-12 text-center">
        <p className="headline text-4xl">
          Planning your <em className="text-gold">seating</em>?
        </p>
        <p className="mt-3 text-muted">Explore the collection, or tell us about your celebration.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/chairs" className="btn-ghost">The collection</Link>
          <Link href="/quote" className="btn-ghost">Request a quote</Link>
          <Link href={`/book?from=blog-${post.slug}`} className="btn-primary">Book a free call</Link>
        </div>
      </div>
    </article>
  );
}
