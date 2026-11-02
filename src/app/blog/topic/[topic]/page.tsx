import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { JsonLd, PageHero, QuoteCta } from "@/components/ui";
import { getPosts, getTopic, topicArt, topicSlug, topics } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return topics.map((t) => ({ topic: topicSlug(t.name) }));
}

export async function generateMetadata(props: PageProps<"/blog/topic/[topic]">): Promise<Metadata> {
  const topic = getTopic((await props.params).topic);
  if (!topic) return {};
  const slug = topicSlug(topic.name);
  const art = topicArt(slug, `${topic.name} guides`);
  return {
    title: `${topic.name} Guides for Chicago Events`,
    description: `${topic.blurb} Answers for planners in Chicago and the suburbs from ${site.name}.`,
    alternates: { canonical: `/blog/topic/${slug}` },
    openGraph: { images: [{ url: art.src, alt: art.alt }] },
  };
}

export default async function TopicPage(props: PageProps<"/blog/topic/[topic]">) {
  const topic = getTopic((await props.params).topic);
  if (!topic) notFound();
  const slug = topicSlug(topic.name);
  const posts = (await getPosts()).filter((p) => p.topic === topic.name);
  const url = `${site.url}/blog/topic/${slug}`;
  const art = topicArt(slug, `Illustration for ${topic.name.toLowerCase()} guides`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${topic.name} guides`,
          description: topic.blurb,
          url,
          image: `${site.url}${art.src}`,
          isPartOf: { "@type": "Blog", name: `${site.name} ideas & guides`, url: `${site.url}/blog` },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: posts.length,
            itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/blog/${p.slug}`, name: p.title })),
          },
        }}
      />
      <PageHero
        breadcrumbs={[
          { name: "Ideas & guides", href: "/blog" },
          { name: topic.name, href: `/blog/topic/${slug}` },
        ]}
        eyebrow={`${posts.length} guides`}
        title={topic.name}
        intro={topic.blurb}
        media={
          <div className="media aspect-[16/10] overflow-hidden bg-espresso shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG topic art renders crisp without the image optimizer */}
            <img src={art.src} alt={art.alt} width={1200} height={750} className="h-full w-full object-cover" />
          </div>
        }
      />

      <div className="container-x section-y">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
        {!posts.length && <p className="font-serif text-2xl text-muted italic">Guides for this topic arrive soon.</p>}

        <nav aria-label="Guide topics" className="mt-20 border-t border-line pt-10">
          <p className="eyebrow">More topics</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {topics.filter((t) => t.name !== topic.name).map((t) => (
              <li key={t.name}>
                <Link href={`/blog/topic/${topicSlug(t.name)}`} className="chip transition-colors hover:border-gold hover:text-gold">{t.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <QuoteCta source={`blog-topic-${slug}`} />
    </>
  );
}
