import Link from "@/components/Link";
import { ChairArt } from "@/components/ChairArt";
import { Reveal } from "@/components/Reveal";
import { getChair } from "@/data/chairs";
import type { ChairSlug } from "@/data/geo/types";

export function RecommendedChairs({
  picks,
  eyebrow,
  heading,
}: {
  picks: { slug: ChairSlug; why: string }[];
  eyebrow: string;
  heading: React.ReactNode;
}) {
  const items = picks.flatMap((p) => {
    const chair = getChair(p.slug);
    return chair ? [{ chair, why: p.why }] : [];
  });
  return (
    <section className="mt-32">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-2 mt-6 max-w-3xl">{heading}</h2>
      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ chair, why }, i) => (
          <Reveal key={chair.slug} delay={i * 120}>
            <article className="group relative">
              <ChairArt
                chair={chair}
                className="aspect-[4/5] transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
              />
              <div className="flex items-baseline justify-between gap-4 pt-5">
                <h3 className="display-3">
                  <Link href={`/chairs/${chair.slug}`} className="after:absolute after:inset-0">
                    {chair.name}
                  </Link>
                </h3>
                <span className="shrink-0 text-xs tracking-[0.18em] text-gold uppercase">{chair.estPrice}</span>
              </div>
              <p className="mt-3 border-t border-line pt-3 text-sm leading-6 text-muted">{why}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
