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
      <p className="eyebrow">The journal</p>
      <h1 className="mt-2 font-serif text-5xl sm:text-6xl">Seating ideas & planning guides</h1>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-2xl border border-line bg-surface p-7 hover:shadow-md">
            <p className="text-xs text-muted">{formatDate(p.date)} · {p.readingMinutes} min read</p>
            <h2 className="mt-2 font-serif text-3xl leading-tight group-hover:text-accent">{p.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{p.description}</p>
            {p.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            )}
          </Link>
        ))}
      </div>
      {posts.length === 0 && <p className="mt-10 text-muted">First articles coming soon.</p>}
    </div>
  );
}
