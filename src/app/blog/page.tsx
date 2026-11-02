import type { Metadata } from "next";
import Link from "next/link";
import { ChairArt } from "@/components/ChairArt";
import { getChair } from "@/data/chairs";
import { PostCard } from "@/components/PostCard";
import { formatDate, getPosts, topicSlug, topics } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal: Chicago Event Rental Guides, Seating Ideas & Answers",
  description:
    "Hundreds of guides to renting chairs, tables, linens, dinnerware, tents and more for weddings and events in Chicago and the suburbs.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const all = await getPosts();
  const [lead, ...rest] = all;
  const count = (name: string) => all.filter((p) => p.topic === name).length;
  return (
    <div className="container-x py-20">
      <p className="eyebrow">The journal</p>
      <h1 className="headline mt-6 text-6xl leading-[0.95] sm:text-8xl">
        Notes on <em className="text-gold">seating</em>
      </h1>

      {lead && (
        <Link href={`/blog/${lead.slug}`} className="group mt-20 grid gap-8 border-t border-gold/40 pt-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            {lead.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- SVG art renders crisp without the image optimizer
              <img src={lead.image} alt={lead.imageAlt ?? ""} width={1000} height={625} className="mb-8 aspect-[16/10] w-full object-cover" />
            ) : getChair(lead.chair) && <ChairArt chair={getChair(lead.chair)!} priority className="mb-8 aspect-[16/10]" />}
            <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
              Latest · {formatDate(lead.date)} · {lead.readingMinutes} min read
            </p>
            <h2 className="headline mt-5 text-4xl leading-[1.05] transition-colors group-hover:text-gold sm:text-5xl">
              {lead.title}
            </h2>
          </div>
          <div className="md:pt-8">
            <p className="text-lg leading-8 text-muted">{lead.description}</p>
            <span className="link-line mt-8">Read the article</span>
          </div>
        </Link>
      )}

      <nav aria-label="Journal topics" className="mt-20">
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Browse by topic</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topics.filter((t) => count(t.name) > 0).map((t) => (
            <li key={t.name}>
              <Link href={`/blog/topic/${topicSlug(t.name)}`} className="group block border border-line px-5 py-4 transition-colors hover:border-gold">
                <span className="font-serif text-xl group-hover:text-gold">{t.name}</span>
                <span className="mt-1 block text-[11px] tracking-[0.18em] text-muted uppercase">{count(t.name)} guides</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <h2 className="eyebrow mt-20">Latest guides</h2>
      <div className="mt-8 grid gap-x-10 gap-y-14 md:grid-cols-3">
        {rest.slice(0, 24).map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
      {!lead && <p className="mt-16 font-serif text-2xl text-muted italic">The first articles arrive soon.</p>}
    </div>
  );
}
