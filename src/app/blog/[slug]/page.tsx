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
      <Link href="/blog" className="chip px-3 py-1 text-sm hover:bg-butter">← journal</Link>
      <p className="mt-6 text-sm font-bold">{formatDate(post.date)} · {post.readingMinutes} min read</p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">{post.title}</h1>
      <p className="mt-4 text-lg text-muted">{post.description}</p>
      <div className="prose-post mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="pop mt-14 rounded-3xl bg-lilac p-8 text-center">
        <p className="display text-4xl">planning your seating?</p>
        <p className="mt-2">Browse the collection or tell us about your event.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/chairs" className="btn-ghost">see the chairs</Link>
          <Link href="/quote" className="btn-primary">request a quote →</Link>
        </div>
      </div>
    </article>
  );
}
