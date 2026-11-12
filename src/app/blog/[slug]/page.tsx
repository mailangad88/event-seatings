import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { DownloadGate } from "@/components/DownloadGate";
import { buyerLinksFor } from "@/data/buyer-pages";
import { PostBody } from "@/components/PostBody";
import { ArticleLayout, JsonLd, LinkCards, QuoteCard, QuoteCta, type TocItem } from "@/components/ui";
import { coverImage, getDownload } from "@/data/downloads";
import { formatDate, getPost, getPosts, getRelated, topicSlug } from "@/lib/blog";
import { sceneFor } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const found = await getPost((await props.params).slug);
  if (!found) return {};
  const { post } = found;
  const hero = post.hero ?? sceneFor(post.slug);
  return seo({
    title: post.title,
    description: post.description,
    keywords: [post.keyword, ...post.tags].filter(Boolean) as string[],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: [{ url: hero.src, alt: hero.alt }],
    },
  });
}

// Give each <h2> an id so the table of contents can link to it.
function withHeadingIds(html: string) {
  const toc: TocItem[] = [];
  let n = 0;
  const out = html.replace(/<h2>(.*?)<\/h2>/g, (_, inner: string) => {
    const label = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const id = label.toLowerCase().replace(/&[a-z#0-9]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    toc.push({ id, label });
    // Number each section (shown as a badge by CSS) so long guides read as clear steps.
    if (/^frequently asked questions$/i.test(label)) return `<h2 id="${id}">${inner}</h2>`;
    n += 1;
    return `<h2 id="${id}" data-n="${String(n).padStart(2, "0")}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const found = await getPost((await props.params).slug);
  if (!found) notFound();
  const { post, faqs } = found;
  const { html, toc } = withHeadingIds(found.html);
  const hero = post.hero ?? sceneFor(post.slug);
  const related = await getRelated(post);
  const offer = getDownload(post.download ?? "") ?? getDownload("event-planning-kit")!;
  const url = `${site.url}/blog/${post.slug}`;
  const topicUrl = `/blog/topic/${topicSlug(post.topic)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    image: [
      { "@type": "ImageObject", url: `${site.url}${hero.src}`, caption: hero.alt },
      ...(post.image && !post.hero ? [{ "@type": "ImageObject", url: `${site.url}${post.image}`, caption: post.imageAlt ?? post.title }] : []),
    ],
    keywords: [post.keyword, ...post.tags].filter(Boolean).join(", "),
    articleSection: post.topic,
    inLanguage: "en-US",
    spatialCoverage: { "@type": "Place", name: "Chicago metropolitan area, Illinois" },
    url,
    mainEntityOfPage: url,
    author: { "@type": "Person", name: site.owner.name, jobTitle: "Founder", worksFor: { "@id": `${site.url}/#business` } },
    publisher: { "@id": `${site.url}/#business` },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ArticleLayout
        breadcrumbs={[
          { name: "Ideas & guides", href: "/blog" },
          { name: post.topic, href: topicUrl },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
        eyebrow={<Link href={topicUrl} className="hover:underline">{post.topic}</Link>}
        title={post.title}
        intro={post.description}
        meta={
          <>
            {formatDate(post.date)} · {post.readingMinutes} min read · By the {site.name} team
            {post.updated && post.updated !== post.date && <> · Updated {formatDate(post.updated)}</>}
          </>
        }
        hero={{ src: hero.src, alt: hero.alt, caption: hero.caption }}
        toc={toc}
        aside={
          <>
            <QuoteCard source={`blog-${post.slug}`} />
          </>
        }
      >
        <PostBody html={html} faqs={faqs} toc={toc} />
        <aside id="free-download" aria-label="Free download" className="mt-12 grid max-w-2xl scroll-mt-24 gap-6 sm:grid-cols-[160px_1fr]">
          <Link href={`/downloads/${offer.slug}`} className="hidden sm:block">
            <Image src={coverImage(offer.slug)} alt={`Cover of the free ${offer.title}`} width={160} height={207} className="rounded-lg border border-line shadow" />
          </Link>
          <div>
            <p className="mb-3 text-sm text-muted">{offer.blurb} <Link href={`/downloads/${offer.slug}`} className="link">See what&apos;s inside</Link>.</p>
            <DownloadGate slug={offer.slug} title={offer.title} files={offer.files} compact placement={`blog:${post.slug}`} />
          </div>
        </aside>
        <section aria-labelledby="rental-help" className="mt-12 max-w-2xl">
          <p id="rental-help" className="eyebrow">Ready to rent?</p>
          <LinkCards
            compact
            columns={3}
            className="mt-4"
            items={buyerLinksFor(`${post.title} ${post.tags.join(" ")}`).map((l) => ({ href: l.href, label: l.label }))}
          />
        </section>
        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-14 max-w-2xl">
            <p id="related" className="eyebrow">Related guides</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`} className="group card card-hover flex h-full gap-4 overflow-hidden p-3">
                    <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      {r.image ? (
                        <Image src={r.image} alt={r.imageAlt ?? `Cover image for the guide: ${r.title}`} fill unoptimized={r.image.endsWith(".svg")} sizes="80px" className="object-cover" />
                      ) : (
                        <Image src={sceneFor(r.slug).src} alt={sceneFor(r.slug).alt} fill sizes="80px" className="object-cover" />
                      )}
                    </span>
                    <span className="self-center font-heading font-semibold text-lg leading-snug transition-colors group-hover:text-gold">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={topicUrl} className="link-line mt-6 inline-block">More in {post.topic}</Link>
          </section>
        )}
      </ArticleLayout>
      <QuoteCta source={`blog-${post.slug}`} title="Ready to price your event?" />
    </>
  );
}
