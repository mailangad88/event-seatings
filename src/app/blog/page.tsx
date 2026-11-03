import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HubFaqs, PageHero, QuoteCta } from "@/components/ui";
import { PostCard } from "@/components/PostCard";
import { formatDate, getPosts, hubFaqs, topicArt, topicSlug, topics } from "@/lib/blog";
import { render, sceneFor } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = seo({
  title: "Event Planning Ideas & Rental Guides for Chicago",
  description: `Event rental guides, costs, quantities, layouts and styling ideas for weddings, parties and corporate events in Chicago, from ${site.name}.`,
  alternates: { canonical: "/blog" },
});

export default async function BlogPage() {
  const all = await getPosts();
  // One question from each of the newest posts in different topics.
  const faqs = await hubFaqs(topics.map((t) => all.find((x) => x.topic === t.name)).filter((x) => !!x), 6);
  const [lead, ...rest] = all;
  const count = (name: string) => all.filter((p) => p.topic === name).length;
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Ideas & guides", href: "/blog" }]}
        eyebrow="Ideas & guides"
        title="Plan a better event in Chicago"
        intro="Free planning guides for Chicago-area events: what rentals cost, how many chairs, tables and linens you need, tent sizes, floor plans, venue rules and styling ideas for weddings, cultural celebrations, parties and corporate events. Every guide starts with a quick answer and ends with the questions planners ask most."
        meta={all.length > 0 && <p>{all.length} guides across {topics.filter((t) => count(t.name) > 0).length} topics</p>}
        media={
          <div className="media aspect-[16/11] shadow-lift">
            <Image src={render("hero-layouts").src} alt={render("hero-layouts").alt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          </div>
        }
      />

      <div className="container-x section-y">
        {lead && (
          <Link href={`/blog/${lead.slug}`} className="group card card-hover grid overflow-hidden md:grid-cols-[1.2fr_1fr]">
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-80">
              <Image src={sceneFor(lead.slug).src} alt={sceneFor(lead.slug).alt} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span className="badge self-start">Latest</span>
              <h2 className="display-2 mt-4 transition-colors group-hover:text-gold">{lead.title}</h2>
              <p className="mt-4 leading-7 text-muted">{lead.description}</p>
              <p className="mt-6 text-sm text-muted">
                {formatDate(lead.date)} · {lead.readingMinutes} min read
              </p>
            </div>
          </Link>
        )}

        <nav aria-label="Guide topics" className="mt-16">
          <h2 className="eyebrow">Browse by topic</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topics.filter((t) => count(t.name) > 0).map((t) => (
              <li key={t.name}>
                <Link href={`/blog/topic/${topicSlug(t.name)}`} className="group card card-hover flex items-center gap-4 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG topic art renders crisp without the image optimizer */}
                  <img src={topicArt(topicSlug(t.name)).src} alt={`Illustration for ${t.name.toLowerCase()} rental guides`} width={96} height={64} loading="lazy" className="h-14 w-20 shrink-0 rounded-lg bg-espresso object-cover" />
                  <span>
                    <span className="block font-heading font-semibold text-lg leading-tight transition-colors group-hover:text-gold">{t.name}</span>
                    <span className="mt-0.5 block text-xs text-muted">{count(t.name)} guides</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <h2 className="eyebrow mt-16">Latest guides</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(0, 24).map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
        {!lead && <p className="mt-16 font-heading font-semibold text-2xl text-muted">The first guides arrive soon.</p>}
      </div>
      <HubFaqs faqs={faqs} title="Questions these guides answer" />
      <QuoteCta source="blog" />
    </>
  );
}
