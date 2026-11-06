import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { FaqList, Icon, JsonLd, PageHero, QuoteCta, Section, StepFlow, type Faq, type Step } from "@/components/ui";
import { rentalImage } from "@/data/rental-images";
import { getTool, tools, type ToolEntry } from "@/data/tools";
import { routeExists } from "@/lib/routes";
import { sceneFor } from "@/lib/scenes";
import { site } from "@/lib/site";

// Shared frame for every /tools/* page: hero with image, the tool itself, how it works,
// the method (every rule of thumb in plain words), FAQs with schema, related tools and a quote band.

export function toolImage(t: Pick<ToolEntry, "slug" | "scene" | "name">) {
  const r = rentalImage(t.scene);
  if (r) return { src: r.src, alt: r.alt, width: r.width, height: r.height };
  const s = sceneFor(`tool-${t.slug}`);
  return { src: s.src, alt: s.alt, width: s.width, height: s.height };
}

/** Tools whose pages exist in this build (tools from other threads appear once they merge). */
export const liveTools = () => tools.filter((t) => routeExists(`/tools/${t.slug}`));

export function toolMetadata(slug: string, title: string, description: string): Metadata {
  const t = getTool(slug)!;
  const img = toolImage(t);
  const url = `/tools/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", images: [{ url: img.src, alt: img.alt }] },
    twitter: { card: "summary_large_image", title, description, images: [img.src] },
  };
}

export function ToolShell({
  slug,
  title,
  intro,
  answer,
  steps,
  method,
  faqs,
  children,
  description,
}: {
  slug: string;
  title: React.ReactNode;
  intro: React.ReactNode;
  /** 40-60 word direct answer, marked for answer engines. */
  answer: string;
  steps: Step[];
  method: React.ReactNode;
  faqs: Faq[];
  description: string;
  children: React.ReactNode;
}) {
  const t = getTool(slug)!;
  const img = toolImage(t);
  const url = `${site.url}/tools/${slug}`;
  const related = liveTools().filter((r) => r.slug !== slug && r.group === t.group).concat(liveTools().filter((r) => r.slug !== slug && r.group !== t.group)).slice(0, 4);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: `${t.name} by ${site.name}`,
            url,
            description,
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires JavaScript",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            image: `${site.url}${img.src}`,
            areaServed: { "@type": "City", name: site.market },
            provider: { "@type": "Organization", name: site.name, url: site.url },
            featureList: t.outputs.join(", "),
          },
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to use the ${t.name.toLowerCase()}`,
            step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
          },
        ]}
      />
      <PageHero
        eyebrow="Free planning tool"
        title={title}
        intro={
          <>
            <p>{intro}</p>
            <p data-answer className="mt-4 rounded-2xl border border-gold/30 bg-surface/70 p-4 text-base leading-7 text-ink">
              {answer}
            </p>
          </>
        }
        breadcrumbs={[{ name: "Free tools", href: "/tools" }, { name: t.name, href: `/tools/${slug}` }]}
        actions={
          <a href="#tool" className="btn-accent">
            Start now <Icon name="arrow" size={18} />
          </a>
        }
        media={
          <figure className="media aspect-[4/3] shadow-lift">
            <Image src={img.src} alt={img.alt} fill priority fetchPriority="high" sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </figure>
        }
        meta={<span>No sign-up. Your answers stay in your browser and in the page link.</span>}
      />

      <section id="tool" className="scroll-mt-24">
        <div className="container-x py-12 md:py-16">{children}</div>
      </section>

      <Section tone="sand" eyebrow="How it works" title={`Using the ${t.name.toLowerCase()}`}>
        <StepFlow steps={steps} caption={`How the ${t.name.toLowerCase()} works, step by step.`} />
      </Section>

      <Section eyebrow="The method" title="How we work out the numbers">
        <div className="prose-post max-w-3xl">{method}</div>
      </Section>

      <Section tone="sand" eyebrow="Questions" title={`${t.name}: FAQ`}>
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>

      {related.length > 0 && (
        <Section eyebrow="Keep planning" title="More free tools" action={<Link href="/tools" className="link-line">All tools <Icon name="arrow" size={16} /></Link>}>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => {
              const ri = toolImage(r);
              return (
                <li key={r.slug}>
                  <Link href={`/tools/${r.slug}`} className="card card-hover block h-full overflow-hidden">
                    <div className="media aspect-[4/3] rounded-none">
                      <Image src={ri.src} alt={ri.alt} fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" />
                    </div>
                    <div className="p-5">
                      <p className="font-medium">{r.name}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">{r.short}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <QuoteCta source={`tool-${slug}`} title="Turn your numbers into a real quote" />
    </>
  );
}
