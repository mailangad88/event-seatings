import type { Metadata } from "next";
import Image from "next/image";
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
    alternates: { canonical: `/blog/${found.post.slug}` },
    openGraph: {
      type: "article",
      publishedTime: found.post.date,
      modifiedTime: found.post.updated ?? found.post.date,
      ...(found.post.image ? { images: [found.post.image] } : {}),
    },
  };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const found = await getPost((await props.params).slug);
  if (!found) notFound();
  const { post, html, faqs } = found;
  const url = `${site.url}/blog/${post.slug}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      mainEntityOfPage: url,
      ...(post.image ? { image: `${site.url}${post.image}` } : {}),
      keywords: post.tags.join(", "),
      author: { "@type": "Organization", name: site.name, url: site.url },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Journal", item: `${site.url}/blog` },
        { "@type": "ListItem", position: 2, name: post.title, item: url },
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
        {post.updated && post.updated !== post.date && (
          <p className="mt-6 text-[11px] tracking-[0.22em] text-muted uppercase">Updated {formatDate(post.updated)}</p>
        )}
        <span className="mx-auto mt-10 block h-px w-16 bg-gold" aria-hidden />
      </div>
      {post.image && (
        <Image
          src={post.image}
          alt={post.imageAlt ?? ""}
          width={1000}
          height={1250}
          priority
          sizes="(min-width: 640px) 420px, 100vw"
          className="mx-auto mt-12 aspect-[4/5] w-full max-w-[420px] object-cover"
        />
      )}
      <div className="prose-post mx-auto mt-12 max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="mx-auto mt-24 max-w-2xl border-t border-gold/40 pt-12 text-center">
        <p className="headline text-4xl">
          Planning your <em className="text-gold">seating</em>?
        </p>
        <p className="mt-3 text-muted">
          Get your exact chair count and a printable checklist with our free seating planner, or tell us about your
          celebration.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/seating-planner" className="btn-ghost">Free seating planner</Link>
          <Link href="/answers" className="btn-ghost">Chicago chair answers</Link>
          <Link href="/quote" className="btn-primary">Request a quote</Link>
        </div>
      </div>
    </article>
  );
}
