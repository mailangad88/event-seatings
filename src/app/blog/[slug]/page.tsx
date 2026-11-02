import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChairArt } from "@/components/ChairArt";
import { chairAlt, chairImage, getChair } from "@/data/chairs";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { ArticleLayout, JsonLd, QuoteCard, QuoteCta, type TocItem } from "@/components/ui";
import { sceneFor } from "@/lib/scenes";
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

// Give each <h2> an id so the table of contents can link to it.
function withHeadingIds(html: string) {
  const toc: TocItem[] = [];
  const out = html.replace(/<h2>(.*?)<\/h2>/g, (_, inner: string) => {
    const label = inner.replace(/<[^>]+>/g, "");
    const id = label.toLowerCase().replace(/&[a-z#0-9]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    toc.push({ id, label });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const found = await getPost((await props.params).slug);
  if (!found) notFound();
  const { post } = found;
  const { html, toc } = withHeadingIds(found.html);
  const chair = getChair(post.chair);
  const img = chair && chairImage(chair);
  const hero = sceneFor(post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    image: [
      { "@type": "ImageObject", url: `${site.url}${hero.src}`, caption: hero.alt },
      ...(img && chair ? [{ "@type": "ImageObject", url: `${site.url}${img}`, caption: chairAlt(chair) }] : []),
    ],
    keywords: post.tags.join(", "),
    url: `${site.url}/blog/${post.slug}`,
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@id": `${site.url}/#business` },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ArticleLayout
        breadcrumbs={[
          { name: "Ideas & guides", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
        eyebrow={post.tags[0] ?? "Guide"}
        title={post.title}
        intro={post.description}
        meta={
          <>
            {formatDate(post.date)} · {post.readingMinutes} min read · By the {site.name} team
          </>
        }
        hero={{ src: hero.src, alt: hero.alt, caption: hero.caption }}
        toc={toc}
        aside={
          <>
            <QuoteCard source={`blog-${post.slug}`} />
            {chair && (
              <Link href={`/chairs/${chair.slug}`} className="group card card-hover block overflow-hidden">
                <ChairArt chair={chair} className="aspect-[4/3]" />
                <span className="block p-4">
                  <span className="block text-xs font-medium tracking-wide text-muted uppercase">Featured piece</span>
                  <span className="mt-1 block font-medium group-hover:text-gold">{chair.name}</span>
                </span>
              </Link>
            )}
          </>
        }
      >
        <div className="prose-post max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />
        {post.tags.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6">
            {post.tags.map((t) => (
              <li key={t} className="chip">{t}</li>
            ))}
          </ul>
        )}
      </ArticleLayout>
      <QuoteCta source={`blog-${post.slug}`} title="Ready to price your event?" />
    </>
  );
}
