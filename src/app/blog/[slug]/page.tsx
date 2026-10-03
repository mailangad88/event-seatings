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
    <article className="container-x max-w-3xl py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/blog" className="text-sm text-muted hover:text-ink">← Journal</Link>
      <p className="mt-6 text-sm text-muted">{formatDate(post.date)} · {post.readingMinutes} min read</p>
      <h1 className="mt-2 font-serif text-5xl leading-tight">{post.title}</h1>
      <p className="mt-4 text-lg text-muted">{post.description}</p>
      <div className="prose-post mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="mt-14 rounded-2xl border border-line bg-surface p-7 text-center">
        <p className="font-serif text-3xl">Planning your seating?</p>
        <p className="mt-2 text-muted">Browse our collection or tell us about your event.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/chairs" className="btn-ghost">See the chairs</Link>
          <Link href="/quote" className="btn-primary">Request a quote</Link>
        </div>
      </div>
    </article>
  );
}
