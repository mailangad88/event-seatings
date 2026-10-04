import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const found = await getPost((await props.params).slug);
  if (!found) return {};
  return {
    title: found.post.title,
    description: found.post.description,
    openGraph: { type: "article", publishedTime: found.post.date },
  };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const found = await getPost((await props.params).slug);
  if (!found) notFound();
  const { post, html } = found;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
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
      <div className="prose-post mx-auto mt-12 max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="mx-auto mt-24 max-w-2xl border-t border-gold/40 pt-12 text-center">
        <p className="headline text-4xl">
          Planning your <em className="text-gold">seating</em>?
        </p>
        <p className="mt-3 text-muted">Explore the collection, or tell us about your celebration.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/chairs" className="btn-ghost">The collection</Link>
          <Link href="/quote" className="btn-primary">Request a quote</Link>
        </div>
      </div>
    </article>
  );
}
