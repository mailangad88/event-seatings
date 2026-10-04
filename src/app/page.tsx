import Link from "next/link";
import { ChairCard } from "@/components/ChairCard";
import { HeroPlayer } from "@/components/HeroPlayer";
import { Reveal } from "@/components/Reveal";
import { ThisOrThat } from "@/components/ThisOrThat";
import { WaitlistForm } from "@/components/WaitlistForm";
import { allStyles, chairs, getChair } from "@/data/chairs";
import { formatDate, getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

const featured = ["cross-back", "ghost", "velvet-dining", "rattan-garden", "louis-medallion", "wishbone"];

const styleNotes: Record<string, string> = {
  Rustic: "Barns, vineyards & farm tables",
  Boho: "Natural textures, relaxed elegance",
  Modern: "Clean lines, quiet confidence",
  Glam: "Ballrooms, velvet & candlelight",
  Classic: "Timeless, heirloom, refined",
  Garden: "Estates, lawns & open air",
  Minimalist: "Less, but better",
  Cultural: "Mandaps, stages & celebrations",
};

export default async function Home() {
  const posts = (await getPosts()).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="container-x grid items-center gap-14 pt-14 pb-24 md:grid-cols-[1.05fr_1fr] md:pt-24 md:pb-32">
        <div className="animate-rise">
          <p className="eyebrow">{site.launch.seasonLabel} · St. Charles, Illinois</p>
          <h1 className="headline mt-8 text-[3.6rem] leading-[0.95] sm:text-7xl lg:text-[6.2rem]">
            Seating,
            <br />
            <em className="text-gold">beyond</em> Chiavari.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-8 text-muted">
            A curated collection of distinctive chairs for weddings and celebrations, delivered and styled across
            Chicago&apos;s western suburbs.
          </p>
          <div className="mt-11 flex flex-wrap items-center gap-8">
            <Link href="/chairs" className="btn-primary">Explore the collection</Link>
            <Link href="/quote" className="link-line">Request a quote</Link>
          </div>
        </div>

        <div className="animate-rise [animation-delay:200ms]">
          <div className="relative border border-gold/50 p-3 sm:p-4">
            <HeroPlayer />
            <span className="absolute -top-px left-8 -translate-y-1/2 bg-bg px-3 text-[10px] tracking-[0.35em] text-gold uppercase">
              The Founding Collection
            </span>
          </div>
          <p className="mt-5 text-center text-[10px] tracking-[0.32em] text-muted uppercase">
            Thirteen pieces · Delivered &amp; placed by our team
          </p>
        </div>
      </section>

      {/* Statement */}
      <section className="relative overflow-hidden bg-espresso text-bg">
        <div className="container-x py-28 text-center md:py-44">
          <Reveal>
            <span className="ornament" aria-hidden />
            <p className="eyebrow mt-8 justify-center before:hidden">Our philosophy</p>
            <p className="headline mx-auto mt-10 max-w-5xl text-4xl leading-[1.18] sm:text-6xl sm:leading-[1.12] md:text-7xl">
              Seating fills more of your reception than almost anything else. It deserves the same{" "}
              <em className="text-gold">care</em> as your florals, your linens, your light.
            </p>
            <span className="ornament mt-14" aria-hidden />
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="container-x grid gap-14 py-24 md:grid-cols-3 md:gap-10">
        {[
          ["I", "Curated", "More than a dozen distinctive styles, chosen for how they look in a room, in photographs and from behind."],
          ["II", "Commercial grade", "Weight-rated pieces built for events, never residential furniture. Delivered, placed and collected by our team."],
          ["III", "Locally owned", `Based in ${site.city}. We know the estates, barns and ballrooms of the Fox Valley.`],
        ].map(([n, t, d], i) => (
          <Reveal key={t} delay={i * 120} className="border-t border-ink pt-6">
            <span className="font-serif text-lg text-gold italic">{n}.</span>
            <h2 className="headline mt-3 text-3xl">{t}</h2>
            <p className="mt-3 leading-7 text-muted">{d}</p>
          </Reveal>
        ))}
      </section>

      {/* Collection */}
      <section className="container-x py-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 className="headline mt-6 text-5xl sm:text-6xl">
              Help us <em>curate</em> our founding pieces
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-muted">
              Save the chairs you love. The most-desired styles will join our {site.launch.seasonLabel} first.
            </p>
          </div>
          <Link href="/chairs" className="link-line">View all {chairs.length} chairs</Link>
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((slug, i) => (
            <Reveal key={slug} delay={(i % 3) * 120}>
              <ChairCard chair={getChair(slug)!} index={chairs.findIndex((c) => c.slug === slug)} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* By aesthetic */}
      <section className="container-x py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">By aesthetic</p>
            <h2 className="headline mt-6 text-5xl sm:text-6xl">
              Find your <em>style</em>
            </h2>
            <p className="mt-5 max-w-sm leading-7 text-muted">
              Every wedding has a point of view. Begin with yours, or let our{" "}
              <Link href="/quiz" className="underline decoration-gold underline-offset-4 hover:text-gold">style quiz</Link>{" "}
              guide you.
            </p>
          </div>
          <ul className="border-t border-line">
            {allStyles.map((s) => (
              <li key={s} className="border-b border-line">
                <Link href={`/chairs?style=${s}`} className="group flex items-baseline justify-between gap-6 py-5">
                  <span className="headline text-3xl transition-colors group-hover:text-gold sm:text-4xl">{s}</span>
                  <span className="hidden text-sm text-muted sm:block">{styleNotes[s]}</span>
                  <span className="text-gold transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Which speaks to you */}
      <section className="bg-surface-2 py-24 md:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.5fr] lg:items-center">
          <div>
            <p className="eyebrow">A moment of taste</p>
            <h2 className="headline mt-6 text-5xl sm:text-6xl">
              Which speaks <em>to you?</em>
            </h2>
            <p className="mt-5 max-w-sm leading-7 text-muted">
              Six pairings, one instinct each. Your choices are saved to your wishlist and help shape the
              founding collection.
            </p>
          </div>
          <ThisOrThat />
        </div>
      </section>

      {/* Experience */}
      <section className="container-x py-28">
        <p className="eyebrow">The experience</p>
        <h2 className="headline mt-6 text-5xl sm:text-6xl">
          Effortless, from <em>first</em> enquiry
        </h2>
        <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
          {[
            ["Select", "Explore the collection by style or occasion. Pair a ceremony chair with a different piece for dinner."],
            ["Enquire", "Share your date, guest count and venue. We prepare a personalized proposal for your celebration."],
            ["Delivered & placed", "Our team delivers, sets every chair and collects afterward. You simply take your seat."],
          ].map(([t, d], i) => (
            <li key={t}>
              <Reveal delay={i * 140}>
              <span className="headline text-7xl text-gold/70">0{i + 1}</span>
              <h3 className="mt-4 text-[11px] font-medium tracking-[0.25em] uppercase">{t}</h3>
              <p className="mt-3 leading-7 text-muted">{d}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-16">
          <Link href="/quote" className="btn-primary">Begin your enquiry</Link>
        </div>
      </section>

      {/* Journal */}
      {posts.length > 0 && (
        <section className="container-x border-t border-line py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">The journal</p>
              <h2 className="headline mt-6 text-5xl sm:text-6xl">Notes on seating</h2>
            </div>
            <Link href="/blog" className="link-line">All articles</Link>
          </div>
          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group block border-t border-ink pt-6">
                <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
                  {formatDate(p.date)} · {p.readingMinutes} min read
                </p>
                <h3 className="headline mt-4 text-3xl leading-tight transition-colors group-hover:text-gold">
                  {p.title}
                </h3>
                <p className="mt-3 line-clamp-3 leading-7 text-muted">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Private list (pulled down to sit flush on the footer) */}
      <section className="-mb-32 border-b border-bg/10 bg-espresso text-bg">
        <div className="container-x grid gap-12 py-24 md:grid-cols-2 md:items-end md:py-28">
          <div>
            <p className="eyebrow">The private list</p>
            <h2 className="headline mt-6 text-5xl leading-[1.05] sm:text-6xl">
              First access to the <em className="text-gold">founding season</em>
            </h2>
          </div>
          <div>
            <p className="mb-6 leading-7 text-bg/70">
              Founding-season dates are limited. Join the list for priority booking, launch pricing and first sight
              of new pieces.
            </p>
            <WaitlistForm source="home" dark />
          </div>
        </div>
      </section>
    </>
  );
}
