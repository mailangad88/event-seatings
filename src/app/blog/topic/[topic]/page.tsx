import Image from "next/image";
import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { HubFaqs, JsonLd, PageHero, QuoteCta } from "@/components/ui";
import { getPosts, getTopic, hubFaqs, topicArt, topicSlug, topics } from "@/lib/blog";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return topics.map((t) => ({ topic: topicSlug(t.name) }));
}

export async function generateMetadata(props: PageProps<"/blog/topic/[topic]">): Promise<Metadata> {
  const topic = getTopic((await props.params).topic);
  if (!topic) return {};
  const slug = topicSlug(topic.name);
  const art = topicArt(slug, `${topic.name} guides`);
  return seo({
    title: `${topic.name} Guides for Chicago Events`,
    description: `${topic.blurb} Answers for planners in Chicago and the suburbs from ${site.name}.`,
    alternates: { canonical: `/blog/topic/${slug}` },
    openGraph: { images: [{ url: art.src, alt: art.alt }] },
  });
}

export default async function TopicPage(props: PageProps<"/blog/topic/[topic]">) {
  const topic = getTopic((await props.params).topic);
  if (!topic) notFound();
  const slug = topicSlug(topic.name);
  const posts = (await getPosts()).filter((p) => p.topic === topic.name);
  const faqs = await hubFaqs(posts, 5);
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
        intro={`${topic.blurb} ${posts.length} free guides on this topic, each with a quick answer, real Chicago-area price ranges and planning FAQs, so you can work out what to rent before you build a quote.`}
        media={
          <div className="media aspect-[16/10] overflow-hidden bg-espresso shadow-lift">
            <Image src={art.src} alt={art.alt} width={1200} height={750} priority unoptimized={art.src.endsWith(".svg")} sizes="(max-width: 1024px) 100vw, 50vw" className="h-full w-full object-cover" />
          </div>
        }
      />

      <div className="container-x section-y">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
        {!posts.length && <p className="font-heading font-semibold text-2xl text-muted">Guides for this topic arrive soon.</p>}

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
      <HubFaqs faqs={faqs} title={`${topic.name}: common questions`} />
      <QuoteCta source={`blog-topic-${slug}`} />
    </>
  );
}
