import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal: Wedding Seating Ideas & Chiavari Alternatives",
  description: "Wedding chair ideas, seating guides and styling inspiration from Event Seatings.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="container-x py-14">
      <span className="eyebrow">📖 the journal</span>
      <h1 className="mt-4 display text-5xl leading-[0.95] sm:text-7xl">seating ideas &amp; <span className="font-italic font-normal normal-case tracking-normal">planning</span> tea</h1>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {posts.map((p, i) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className={`pop pop-hover rounded-3xl p-7 ${["bg-surface", "bg-peach", "bg-sky", "bg-mint"][i % 4]}`}>
            <p className="text-xs font-bold">{formatDate(p.date)} · {p.readingMinutes} min read</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight font-extrabold tracking-tight">{p.title}</h2>
            <p className="mt-3 text-sm leading-6">{p.description}</p>
            {p.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            )}
          </Link>
        ))}
      </div>
      {posts.length === 0 && <p className="mt-10 text-muted">first posts dropping soon 👀</p>}
    </div>
  );
}
