import "server-only";
import type { PortableTextBlock } from "sanity";
import { getSanityClient } from "./client";
import { urlForImage } from "./image";
import { portableTextToHtml } from "./portable-to-html";
import { chairs } from "@/data/chairs";
import { downloadForPost } from "@/data/downloads";
import type { Post, Faq } from "@/lib/blog";

type SanityImage = { asset?: { _ref: string }; alt?: string };

type SanityPostDoc = {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  publishedAt: string;
  topic: string;
  tags?: string[];
  mainImage?: SanityImage;
  body: PortableTextBlock[];
  faqs?: { question: string; answer: string }[];
  metaTitle?: string;
  metaDescription?: string;
  keyword?: string;
};

const QUERY = /* groq */ `*[_type == "post" && defined(slug.current)]{
  _id, title, slug, description, publishedAt, topic, tags, mainImage{asset, alt}, body, faqs, metaTitle, metaDescription, keyword
}`;

function pickChair(slug: string) {
  const hit = chairs.find((c) => slug.includes(c.slug) || slug.includes(c.silhouette));
  if (hit) return hit.slug;
  const n = [...slug].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return chairs[n % chairs.length].slug;
}

function wordCount(blocks: PortableTextBlock[]) {
  return blocks
    .filter((b) => b._type === "block")
    .flatMap((b) => (Array.isArray(b.children) ? b.children : []))
    .map((c) => (typeof c?.text === "string" ? c.text : ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function toEntry(doc: SanityPostDoc): { post: Post; html: string; faqs: Faq[] } {
  const slug = doc.slug.current;
  const image = urlForImage(doc.mainImage as never)?.width(1600).url();
  const post: Post = {
    slug,
    title: doc.metaTitle || doc.title,
    description: doc.metaDescription || doc.description,
    date: doc.publishedAt,
    tags: doc.tags ?? [],
    chair: pickChair(slug),
    readingMinutes: Math.max(1, Math.round(wordCount(doc.body) / 230)),
    image,
    imageAlt: doc.mainImage?.alt,
    keyword: doc.keyword,
    download: downloadForPost(slug, doc.tags ?? [], undefined).slug,
    topic: doc.topic,
  };
  const html = portableTextToHtml(doc.body);
  const faqs: Faq[] = (doc.faqs ?? []).map((f) => ({ q: f.question, a: f.answer }));
  return { post, html, faqs };
}

/** All Sanity-authored posts, mapped to the same shape as the Markdown posts in /content/blog. */
export async function getSanityPosts(): Promise<{ post: Post; html: string; faqs: Faq[] }[]> {
  const client = getSanityClient();
  if (!client) return [];
  const docs = await client.fetch<SanityPostDoc[]>(QUERY).catch(() => []);
  return docs.map(toEntry);
}
