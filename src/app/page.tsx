import Link from "next/link";
import { ChairArt } from "@/components/ChairArt";
import { ChairCard } from "@/components/ChairCard";
import { WaitlistForm } from "@/components/WaitlistForm";
import { allStyles, chairs } from "@/data/chairs";
import { formatDate, getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

const featured = ["cross-back", "ghost", "rattan-garden", "velvet-dining", "wishbone", "royal-throne"];

export default async function Home() {
  const posts = (await getPosts()).slice(0, 3);
  const hero = chairs.filter((c) => ["cross-back", "ghost", "velvet-dining"].includes(c.slug));

  return (
    <>
      {/* Hero */}
      <section className="container-x grid items-center gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div>
          <p className="eyebrow">{site.launch.seasonLabel} · {site.city}</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Your wedding deserves more than Chiavari.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted">
            Cross-back, ghost, rattan, velvet and more. Event Seatings brings distinctive chairs to
            weddings across the Fox Valley and Chicago&apos;s western suburbs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/chairs" className="btn-primary px-6 py-3 text-base">Browse the collection</Link>
            <Link href="/quiz" className="btn-ghost px-6 py-3 text-base">Take the style quiz</Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {hero.map((c, i) => (
            <Link
              key={c.slug}
              href={`/chairs/${c.slug}`}
              className={`overflow-hidden rounded-2xl border border-line ${i === 1 ? "translate-y-8" : ""}`}
            >
              <ChairArt chair={c} className="aspect-[3/5]" priority />
            </Link>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-line bg-surface">
        <div className="container-x grid gap-8 py-14 md:grid-cols-3">
          {[
            ["Beyond the default", "Most rental companies around Chicago stock one ballroom chair. We carry 10+ styles, so your seating fits your wedding."],
            ["Built for real events", "Commercial-grade, weight-rated chairs. They're delivered, set up and picked up by our team."],
            ["Locally owned", `Based in ${site.city}. We know the barns, estates and ballrooms of the Fox Valley.`],
          ].map(([title, text]) => (
            <div key={title}>
              <h2 className="font-serif text-2xl">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured chairs */}
      <section className="container-x py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Help us choose our founding chairs</h2>
            <p className="mt-3 max-w-xl text-muted">
              Tap <span className="text-accent">♡ Want this</span> on the chairs you love. The most-wanted styles
              join our {site.launch.seasonLabel} collection first.
            </p>
          </div>
          <Link href="/chairs" className="btn-ghost">See all {chairs.length} chairs</Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((slug) => {
            const chair = chairs.find((c) => c.slug === slug)!;
            return <ChairCard key={slug} chair={chair} />;
          })}
        </div>
      </section>

      {/* Shop by style */}
      <section className="bg-surface-2 py-20">
        <div className="container-x">
          <p className="eyebrow">Shop by style</p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl">What&apos;s your wedding vibe?</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {allStyles.map((s) => (
              <Link
                key={s}
                href={`/chairs?style=${s}`}
                className="rounded-full border border-line bg-surface px-6 py-3 font-serif text-xl hover:border-accent"
              >
                {s}
              </Link>
            ))}
          </div>
          <p className="mt-8 text-muted">
            Not sure?{" "}
            <Link href="/quiz" className="text-accent underline underline-offset-2">
              Take the 30-second style quiz →
            </Link>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="container-x py-20">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Three steps to better seating</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            ["Pick your chairs", "Browse by style or take the quiz. Mix a ceremony chair with a different reception chair."],
            ["Request a quote", "Tell us your date, guest count and venue. We'll send a personalized quote."],
            ["We deliver & set up", "Our team delivers, sets up and picks up. You just sit down and enjoy it."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-line bg-surface p-6">
              <span className="font-serif text-5xl text-accent">{i + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link href="/quote" className="btn-primary px-7 py-3 text-base">Request a quote</Link>
        </div>
      </section>

      {/* Journal */}
      {posts.length > 0 && (
        <section className="container-x py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">The journal</p>
              <h2 className="mt-2 font-serif text-4xl">Seating ideas & planning guides</h2>
            </div>
            <Link href="/blog" className="hidden text-sm text-accent underline sm:block">All articles</Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-2xl border border-line bg-surface p-6 hover:shadow-md">
                <p className="text-xs text-muted">{formatDate(p.date)} · {p.readingMinutes} min read</p>
                <h3 className="mt-2 font-serif text-2xl leading-tight group-hover:text-accent">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Waitlist */}
      <section className="container-x pt-16">
        <div className="rounded-3xl bg-ink px-6 py-14 text-center text-white sm:px-12">
          <h2 className="font-serif text-4xl sm:text-5xl">Be first in line for launch</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/75">
            Founding-season dates are limited. Join the list for early access, launch pricing and new chair drops.
          </p>
          <div className="mx-auto mt-8 max-w-md text-left [&_.field]:border-white/20">
            <WaitlistForm source="home" />
          </div>
        </div>
      </section>
    </>
  );
}
