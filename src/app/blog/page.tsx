import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero, QuoteCta } from "@/components/ui";
import { formatDate, getPosts } from "@/lib/blog";
import { sceneFor, scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Event Planning Ideas & Rental Guides for Chicago",
  description: `Event rental guides, costs, quantities, layouts and styling ideas for weddings, parties and corporate events in Chicago, from ${site.name}.`,
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [lead, ...rest] = await getPosts();
  const tags = [...new Set([lead, ...rest].filter(Boolean).flatMap((p) => p!.tags))].slice(0, 12);
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Ideas & guides", href: "/blog" }]}
        eyebrow="Ideas & guides"
        title="Plan a better event in Chicago"
        intro="Costs, quantities, layouts, venue rules and styling ideas for weddings, parties and corporate events, written by people who plan them."
        meta={
          tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t} className="chip">{t}</li>
              ))}
            </ul>
          )
        }
        media={
          <div className="media aspect-[16/11] shadow-lift">
            <Image src={scenes.threeLooks.src} alt={scenes.threeLooks.alt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => {
            const s = sceneFor(p.slug);
            return (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group card card-hover flex flex-col overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={s.src} alt={s.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  {p.tags[0] && <p className="text-xs font-medium tracking-wide text-gold uppercase">{p.tags[0]}</p>}
                  <h2 className="mt-2 font-serif text-2xl leading-tight transition-colors group-hover:text-gold">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{p.description}</p>
                  <p className="mt-auto pt-5 text-xs text-muted">
                    {formatDate(p.date)} · {p.readingMinutes} min read
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        {!lead && <p className="mt-16 font-serif text-2xl text-muted italic">The first guides arrive soon.</p>}
      </div>
      <QuoteCta source="blog" />
    </>
  );
}
