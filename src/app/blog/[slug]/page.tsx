import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChairArt } from "@/components/ChairArt";
import { chairAlt, chairImage, getChair } from "@/data/chairs";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const found = await getPost((await props.params).slug);
  if (!found) return {};
  const chair = getChair(found.post.chair);
  const img = chair && chairImage(chair);
  return {
    title: found.post.title,
    description: found.post.description,
    alternates: { canonical: `/blog/${found.post.slug}` },
    openGraph: {
      type: "article",
      publishedTime: found.post.date,
      ...(img && chair && { images: [{ url: img, alt: chairAlt(chair) }] }),
    },
  };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const found = await getPost((await props.params).slug);
  if (!found) notFound();
  const { post, html } = found;
  const chair = getChair(post.chair);
  const img = chair && chairImage(chair);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    ...(img && chair && { image: { "@type": "ImageObject", url: `${site.url}${img}`, caption: chairAlt(chair) } }),
    keywords: post.tags.join(", "),
    url: `${site.url}/blog/${post.slug}`,
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@id": `${site.url}/#business` },
  };

  return (
    <article className="container-x max-w-4xl py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="text-center">
        <Link href="/blog" className="text-[11px] tracking-[0.22em] text-muted uppercase hover:text-ink">
          ← The journal
        </Link>
        <p className="mt-10 text-[11px] tracking-[0.22em] text-gold uppercase">
          {formatDate(post.date)} · {post.readingMinutes} min read
        </p>
        <h1 className="headline mt-6 text-5xl leading-[1.02] sm:text-7xl">{post.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl font-serif text-2xl leading-snug font-light text-muted italic">
          {post.description}
        </p>
        <span className="mx-auto mt-10 block h-px w-16 bg-gold" aria-hidden />
      </div>
      {chair && (
        <figure className="mx-auto mt-12 max-w-md">
          <ChairArt chair={chair} priority className="aspect-[4/5]" />
          <figcaption className="mt-3 text-sm text-muted">
            Pictured: the <Link href={`/chairs/${chair.slug}`} className="underline decoration-gold underline-offset-4">{chair.name}</Link>, {chair.tagline.charAt(0).toLowerCase()}{chair.tagline.slice(1)}.
          </figcaption>
        </figure>
      )}
      <div className="prose-post mx-auto mt-12 max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />
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
