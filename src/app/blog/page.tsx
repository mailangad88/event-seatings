import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal: Wedding Seating Ideas & Chiavari Alternatives",
  description: "Wedding chair ideas, seating guides and styling inspiration from Event Seatings.",
};

export default async function BlogPage() {
  const [lead, ...rest] = await getPosts();
  return (
    <div className="container-x py-20">
      <p className="eyebrow">The journal</p>
      <h1 className="headline mt-6 text-6xl leading-[0.95] sm:text-8xl">
        Notes on <em className="text-gold">seating</em>
      </h1>

      {lead && (
        <Link href={`/blog/${lead.slug}`} className="group mt-20 grid gap-8 border-t border-ink pt-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
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

      <div className="mt-20 grid gap-x-10 gap-y-14 md:grid-cols-3">
        {rest.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group block border-t border-line pt-6">
            <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
              {formatDate(p.date)} · {p.readingMinutes} min read
            </p>
            <h2 className="headline mt-4 text-3xl leading-tight transition-colors group-hover:text-gold">{p.title}</h2>
            <p className="mt-3 line-clamp-3 leading-7 text-muted">{p.description}</p>
          </Link>
        ))}
      </div>
      {!lead && <p className="mt-16 font-serif text-2xl text-muted italic">The first articles arrive soon.</p>}
    </div>
  );
}
