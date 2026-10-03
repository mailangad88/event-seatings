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
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/chairs" className="hover:text-ink">Chairs</Link> <span aria-hidden>/</span> {chair.name}
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ChairArt chair={chair} className="aspect-square rounded-3xl border border-line" priority />
        <div>
          <h1 className="font-serif text-5xl leading-tight">{chair.name}</h1>
          <p className="mt-2 text-lg text-muted">{chair.tagline}</p>
          <p className="mt-5 text-2xl">
            {chair.estPrice}
            {!chair.estPrice.includes("/") && <span className="text-base text-muted"> per chair</span>}
            <span className="ml-2 align-middle text-xs text-muted">(estimated; final pricing in your quote)</span>
          </p>
          <p className="mt-6 leading-7">{chair.description}</p>

          <div className="mt-6">
            <p className="text-sm font-medium">Finishes</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {chair.finishes.map((f) => (
                <span key={f.name} className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-6 w-6 rounded-full border border-black/10" style={{ background: f.hex }} />
                  {f.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/quote?chairs=${chair.slug}`} className="btn-primary px-6 py-3 text-base">
              Get a quote
            </Link>
            <VoteButton slug={chair.slug} size="lg" />
          </div>
          <p className="mt-3 text-xs text-muted">
            Votes help us decide which chairs join the {site.launch.seasonLabel} collection first.
          </p>

          <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 py-3">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-3xl">You might also love</h2>
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
