import Link from "next/link";
import { ChairArt } from "@/components/ChairArt";
import { getChair } from "@/data/chairs";
import type { Post } from "@/lib/blog";

// A journal card: the post's hero art (or its chair photo), title and summary.
export function PostCard({ post }: { post: Post }) {
  const chair = getChair(post.chair);
  return (
    <Link href={`/blog/${post.slug}`} className="group block border-t border-line pt-6">
      {post.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG art renders crisp without the image optimizer
        <img src={post.image} alt={post.imageAlt ?? ""} width={800} height={600} loading="lazy" className="mb-6 aspect-[4/3] w-full object-cover" />
      ) : chair ? (
        <ChairArt chair={chair} className="mb-6 aspect-[4/3]" />
      ) : null}
      <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
        {post.topic} · {post.readingMinutes} min read
      </p>
      <h2 className="headline mt-4 text-3xl leading-tight transition-colors group-hover:text-gold">{post.title}</h2>
      <p className="mt-3 line-clamp-3 leading-7 text-muted">{post.description}</p>
    </Link>
  );
}
