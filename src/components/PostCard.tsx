import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/blog";
import { sceneFor } from "@/lib/scenes";

// A guide card in the kit's card style: topic art (or a scene render), topic, title, summary.
export function PostCard({ post }: { post: Post }) {
  const scene = sceneFor(post.slug);
  return (
    <Link href={`/blog/${post.slug}`} className="group card card-hover flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden bg-espresso">
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- SVG topic art renders crisp without the image optimizer
          <img src={post.image} alt={post.imageAlt ?? ""} width={800} height={500} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <Image src={scene.src} alt={scene.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-medium tracking-wide text-gold uppercase">{post.topic}</p>
        <h2 className="display-3 mt-2 transition-colors group-hover:text-gold">{post.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{post.description}</p>
        <p className="mt-auto pt-5 text-xs text-muted">{post.readingMinutes} min read</p>
      </div>
    </Link>
  );
}
