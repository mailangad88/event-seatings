import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChairArt } from "@/components/ChairArt";
import { ChairCard } from "@/components/ChairCard";
import { VoteButton } from "@/components/VoteProvider";
import { chairs, getChair } from "@/data/chairs";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return chairs.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/chairs/[slug]">): Promise<Metadata> {
  const chair = getChair((await props.params).slug);
  if (!chair) return {};
  return {
    title: `${chair.name} Rental`,
    description: `${chair.tagline}. Rent the ${chair.name} for weddings and events in ${site.city} and Chicago's western suburbs.`,
  };
}

export default async function ChairPage(props: PageProps<"/chairs/[slug]">) {
  const chair = getChair((await props.params).slug);
  if (!chair) notFound();

  const related = chairs
    .filter((c) => c.slug !== chair.slug && c.styles.some((s) => chair.styles.includes(s)))
    .slice(0, 3);

  const facts: [string, string][] = [
    ["Best for", chair.uses.join(", ")],
    ["Styles", chair.styles.join(", ")],
    ["Cushion", chair.cushion],
    ["Stackable", chair.stackable ? "Yes" : "No"],
    ["Outdoor friendly", chair.outdoorFriendly ? "Yes" : "Indoor / tented recommended"],
    ["Pairs with", chair.pairsWith],
  ];

  return (
    <div className="container-x py-14">
      <nav className="text-[11px] tracking-[0.2em] text-muted uppercase" aria-label="Breadcrumb">
        <Link href="/chairs" className="hover:text-ink">The collection</Link>
        <span className="mx-3 text-gold" aria-hidden>/</span>
        {chair.name}
      </nav>

      <div className="mt-10 grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <div className="md:sticky md:top-32 md:self-start">
          <ChairArt chair={chair} className="aspect-[4/5]" priority />
        </div>
        <div className="md:py-6">
          <p className="font-serif text-lg text-gold italic">
            No. {String(chairs.indexOf(chair) + 1).padStart(2, "0")} · {chair.styles.join(" · ")}
          </p>
          <h1 className="headline mt-4 text-5xl leading-[1] sm:text-7xl">{chair.name}</h1>
          <p className="mt-5 font-serif text-2xl leading-snug font-light text-muted italic">{chair.tagline}</p>

          <p className="mt-8 leading-8">{chair.description}</p>

          <div className="mt-10 flex items-baseline gap-3 border-y border-line py-5">
            <span className="text-[11px] tracking-[0.2em] text-muted uppercase">Estimated</span>
            <span className="headline text-3xl">{chair.estPrice}</span>
            {!chair.estPrice.includes("/") && <span className="text-sm text-muted">per chair</span>}
          </div>

          <div className="mt-8">
            <p className="label">Finishes</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
              {chair.finishes.map((f) => (
                <span key={f.name} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="h-5 w-5 rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-bg"
                    style={{ background: f.hex }}
                  />
                  {f.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href={`/quote?chairs=${chair.slug}`} className="btn-primary">
              Request a quote
            </Link>
            <VoteButton slug={chair.slug} size="lg" />
          </div>
          <p className="mt-4 text-sm text-muted">
            Final pricing is confirmed in your personal quote. Saved pieces help shape our {site.launch.seasonLabel}.
          </p>

          <dl className="mt-12 border-t border-line text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[150px_1fr] gap-4 border-b border-line py-4">
                <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-32">
          <p className="eyebrow">Also consider</p>
          <h2 className="headline mt-6 text-5xl">
            Pieces in a <em>similar</em> spirit
          </h2>
          <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <ChairCard key={c.slug} chair={c} index={chairs.indexOf(c)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
