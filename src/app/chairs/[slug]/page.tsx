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
    <div className="container-x py-12">
      <nav className="text-sm font-medium" aria-label="Breadcrumb">
        <Link href="/chairs" className="underline decoration-2 underline-offset-4">chairs</Link> <span aria-hidden>/</span> {chair.name.toLowerCase()}
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="pop overflow-hidden rounded-[2rem] md:sticky md:top-24 md:self-start">
          <ChairArt chair={chair} className="aspect-square" priority />
        </div>
        <div>
          <h1 className="display text-5xl leading-[0.95] sm:text-6xl">{chair.name}</h1>
          <p className="mt-3 text-lg text-muted">{chair.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {chair.styles.map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
          <p className="mt-6 inline-block rounded-2xl border-2 border-ink bg-butter px-4 py-2 font-serif text-2xl font-extrabold">
            {chair.estPrice}
            {!chair.estPrice.includes("/") && <span className="font-sans text-base font-medium"> / chair</span>}
            <span className="ml-2 font-sans text-xs font-medium">est.</span>
          </p>
          <p className="mt-6 leading-7">{chair.description}</p>

          <div className="mt-6">
            <p className="text-sm font-bold">finishes</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {chair.finishes.map((f) => (
                <span key={f.name} className="flex items-center gap-2 text-sm font-medium">
                  <span className="h-7 w-7 rounded-full border-2 border-ink" style={{ background: f.hex }} />
                  {f.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/quote?chairs=${chair.slug}`} className="btn-primary px-6 py-3 text-base">
              get a quote →
            </Link>
            <VoteButton slug={chair.slug} size="lg" />
          </div>
          <p className="mt-3 text-xs text-muted">
            Estimated pricing, with final numbers in your quote. Votes decide which chairs drop first in our {site.launch.seasonLabel}.
          </p>

          <dl className="pop mt-10 divide-y-2 divide-ink overflow-hidden rounded-2xl bg-surface text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[120px_1fr] gap-4 px-4 py-3">
                <dt className="font-bold lowercase">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="display text-4xl sm:text-5xl">you might also <span className="font-italic font-normal normal-case tracking-normal">love</span></h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <ChairCard key={c.slug} chair={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
