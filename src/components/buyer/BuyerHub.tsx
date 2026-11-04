import Link from "@/components/Link";
import { FaqList, Figure, Icon, PageHero, QuoteCta, Section, type Faq } from "@/components/ui";
import { buyerPagesOf, type BuyerPage } from "@/data/buyer-pages";
import { sceneFor } from "@/lib/scenes";

export function BuyerHub({ kind, title, intro, faqs }: { kind: BuyerPage["kind"]; title: string; intro: string; faqs: Faq[] }) {
  const pages = buyerPagesOf(kind);
  const scene = sceneFor(`hub-${kind}`);
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: title, href: `/${kind}` }]}
        eyebrow="Event rentals, Chicago"
        title={title}
        intro={intro}
        actions={<Link href={`/quote?from=${kind}-hub`} className="btn-primary btn-lg">Get a free quote <Icon name="arrow" size={18} /></Link>}
        media={<Figure {...scene} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />
      <Section title={kind === "solutions" ? "Pick your problem" : "Pick your comparison"}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <li key={p.slug}>
              <Link href={`/${kind}/${p.slug}`} className="card flex h-full flex-col gap-3 p-6 transition-colors hover:border-gold">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-gold"><Icon name={p.icon} size={20} /></span>
                <span className="font-heading font-semibold text-2xl leading-tight">{p.title}</span>
                <span className="text-sm leading-6 text-muted">{p.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="sand" eyebrow="FAQ" title="Questions people ask">
        <FaqList faqs={faqs} />
      </Section>
      <QuoteCta source={`${kind}-hub`} />
    </>
  );
}
