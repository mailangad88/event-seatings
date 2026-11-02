import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { getPosts, getTopic, topicSlug, topics } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return topics.map((t) => ({ topic: topicSlug(t.name) }));
}

export async function generateMetadata(props: PageProps<"/blog/topic/[topic]">): Promise<Metadata> {
  const topic = getTopic((await props.params).topic);
  if (!topic) return {};
  return {
    title: `${topic.name} Guides for Chicago Events`,
    description: `${topic.blurb} Answers for planners in Chicago and the suburbs from ${site.name}.`,
    alternates: { canonical: `/blog/topic/${topicSlug(topic.name)}` },
  };
}

export default async function TopicPage(props: PageProps<"/blog/topic/[topic]">) {
  const topic = getTopic((await props.params).topic);
  if (!topic) notFound();
  const posts = (await getPosts()).filter((p) => p.topic === topic.name);
  const url = `${site.url}/blog/topic/${topicSlug(topic.name)}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${topic.name} guides`,
      description: topic.blurb,
      url,
      isPartOf: { "@type": "Blog", name: `${site.name} Journal`, url: `${site.url}/blog` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/blog/${p.slug}`, name: p.title })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Journal", item: `${site.url}/blog` },
        { "@type": "ListItem", position: 2, name: topic.name, item: url },
      ],
    },
  ];

  return (
    <div className="container-x py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/blog" className="text-[11px] tracking-[0.22em] text-muted uppercase hover:text-ink">← The journal</Link>
      <p className="eyebrow mt-10">{posts.length} guides</p>
      <h1 className="headline mt-6 text-6xl leading-[0.95] sm:text-7xl">{topic.name}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{topic.blurb}</p>
      <div className="mt-16 grid gap-x-10 gap-y-14 md:grid-cols-3">
        {posts.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
      {!posts.length && <p className="mt-16 font-serif text-2xl text-muted italic">Guides for this topic arrive soon.</p>}
      <TopicNav current={topic.name} />
    </div>
  );
}

function TopicNav({ current }: { current: string }) {
  return (
    <nav aria-label="Journal topics" className="mt-24 border-t border-line pt-10">
      <p className="text-[11px] tracking-[0.22em] text-gold uppercase">More topics</p>
      <ul className="mt-6 flex flex-wrap gap-3">
        {topics.filter((t) => t.name !== current).map((t) => (
          <li key={t.name}>
            <Link href={`/blog/topic/${topicSlug(t.name)}`} className="btn-ghost">{t.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
