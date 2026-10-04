import Link from "next/link";
import { ChairArt } from "@/components/ChairArt";
import { ChairCard } from "@/components/ChairCard";
import { Marquee } from "@/components/Marquee";
import { ThisOrThat } from "@/components/ThisOrThat";
import { WaitlistForm } from "@/components/WaitlistForm";
import { allStyles, chairs, getChair } from "@/data/chairs";
import { formatDate, getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

const featured = ["cross-back", "ghost", "rattan-garden", "velvet-dining", "wishbone", "royal-throne"];

const styleColors = ["bg-peach", "bg-mint", "bg-sky", "bg-pink", "bg-butter", "bg-lilac", "bg-surface", "bg-accent"];
const styleEmoji: Record<string, string> = {
  Rustic: "🌾",
  Boho: "🌿",
  Modern: "◼︎",
  Glam: "✨",
  Classic: "🕊️",
  Garden: "🌷",
  Minimalist: "○",
  Cultural: "🪔",
};

export default async function Home() {
  const posts = (await getPosts()).slice(0, 3);
  const [h1, h2, h3] = ["cross-back", "velvet-dining", "rattan-garden"].map((s) => getChair(s)!);

  return (
    <>
      {/* Hero */}
      <section className="container-x grid items-center gap-12 pt-12 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-20 md:pb-24">
        <div>
          <span className="eyebrow">📍 {site.city.toLowerCase()} · {site.launch.seasonLabel.toLowerCase()}</span>
          <h1 className="display mt-5 text-[3.4rem] leading-[0.92] sm:text-7xl lg:text-[5.5rem]">
            chiavari is{" "}
            <span className="font-italic font-normal tracking-normal normal-case">so</span>{" "}
            <span className="relative inline-block">
              <span className="relative z-10">over.</span>
              <svg className="absolute -bottom-2 left-0 w-full text-accent" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden>
                <path d="M2 14 Q50 2 100 12 T198 8" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
            Your wedding has a vibe. Your chairs should too. Cross-back, ghost, rattan, velvet and more, delivered
            across the Fox Valley &amp; Chicago burbs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/chairs" className="btn-primary px-6 py-3 text-base">browse chairs →</Link>
            <Link href="/quiz" className="btn-ghost px-6 py-3 text-base">find my chair vibe</Link>
          </div>
        </div>

        <div className="relative mx-auto h-[380px] w-full max-w-[440px] sm:h-[440px]">
          <Link href={`/chairs/${h1.slug}`} className="pop pop-hover absolute top-0 left-0 w-[52%] rotate-[-6deg] overflow-hidden rounded-3xl">
            <ChairArt chair={h1} className="aspect-[4/5]" priority />
          </Link>
          <Link href={`/chairs/${h2.slug}`} className="pop pop-hover absolute top-[10%] right-0 w-[50%] rotate-[5deg] overflow-hidden rounded-3xl">
            <ChairArt chair={h2} className="aspect-[4/5]" priority />
          </Link>
          <Link href={`/chairs/${h3.slug}`} className="pop pop-hover absolute bottom-0 left-[24%] w-[48%] rotate-[-1deg] overflow-hidden rounded-3xl">
            <ChairArt chair={h3} className="aspect-[5/4]" priority />
          </Link>
          <span
            className="absolute top-[42%] -left-2 animate-float rounded-full border-2 border-ink bg-butter px-3 py-1.5 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] [--r:-10deg]"
          >
            13 styles 🪑
          </span>
          <span
            className="absolute -top-3 right-6 animate-float rounded-full border-2 border-ink bg-pink px-3 py-1.5 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] [--r:8deg] [animation-delay:1.5s]"
          >
            vote your fave 💖
          </span>
        </div>
      </section>

      <Marquee items={["no more chiavari", "cross-back", "ghost chairs", "rattan", "velvet", "bentwood", "wishbone", "sit different"]} />

      {/* This or that */}
      <section className="bg-lilac py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <span className="eyebrow bg-surface">🎮 quick game</span>
            <h2 className="display mt-4 text-5xl leading-[0.95] sm:text-6xl">
              this <span className="font-italic font-normal normal-case">or</span> that?
            </h2>
            <p className="mt-4 max-w-sm text-lg">
              Six matchups, zero overthinking. Your picks become votes, and the most-loved chairs drop first in our{" "}
              {site.launch.seasonLabel.toLowerCase()}.
            </p>
          </div>
          <ThisOrThat />
        </div>
      </section>

      {/* Featured chairs */}
      <section className="container-x py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">the collection</span>
            <h2 className="display mt-4 text-5xl leading-[0.95] sm:text-6xl">
              pick your <span className="font-italic font-normal normal-case">seat</span>
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Hit <strong className="text-ink">♡ want</strong> on the ones you love. Most-wanted styles join the
              founding collection first.
            </p>
          </div>
          <Link href="/chairs" className="btn-ghost">see all {chairs.length} →</Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((slug) => (
            <ChairCard key={slug} chair={getChair(slug)!} />
          ))}
        </div>
      </section>

      {/* Shop by vibe */}
      <section className="border-y-2 border-ink bg-butter py-20">
        <div className="container-x">
          <h2 className="display text-5xl leading-[0.95] sm:text-6xl">what&apos;s the vibe?</h2>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {allStyles.map((s, i) => (
              <Link
                key={s}
                href={`/chairs?style=${s}`}
                className={`pop pop-hover flex items-center justify-between rounded-2xl px-5 py-5 font-serif text-xl font-extrabold lowercase sm:text-2xl ${styleColors[i % styleColors.length]}`}
              >
                {s}
                <span className="text-2xl" aria-hidden>{styleEmoji[s]}</span>
              </Link>
            ))}
          </div>
          <p className="mt-8 font-medium">
            not sure?{" "}
            <Link href="/quiz" className="underline decoration-2 underline-offset-4 hover:bg-surface">
              take the 30-sec style quiz →
            </Link>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="container-x py-20">
        <h2 className="display text-5xl leading-[0.95] sm:text-6xl">
          how it <span className="font-italic font-normal normal-case">works</span>
        </h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["pick your chairs", "Browse by vibe or take the quiz. Mix a ceremony chair with a different reception chair.", "bg-mint"],
            ["request a quote", "Drop your date, guest count and venue. We'll send a personalized quote.", "bg-sky"],
            ["we deliver + set up", "Our crew delivers, sets up and picks up. You just sit down and enjoy it.", "bg-pink"],
          ].map(([t, d, bg], i) => (
            <li key={t} className={`pop rounded-3xl p-6 ${bg}`}>
              <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-surface font-serif text-2xl font-extrabold">
                {i + 1}
              </span>
              <h3 className="mt-5 font-serif text-2xl font-extrabold tracking-tight lowercase">{t}</h3>
              <p className="mt-2 text-sm leading-6">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Link href="/quote" className="btn-dark px-7 py-3 text-base">request a quote →</Link>
        </div>
      </section>

      {/* Journal */}
      {posts.length > 0 && (
        <section className="container-x py-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="display text-5xl leading-[0.95] sm:text-6xl">the journal</h2>
            <Link href="/blog" className="hidden font-bold underline decoration-2 underline-offset-4 sm:block">
              all posts →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {posts.map((p, i) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className={`pop pop-hover flex flex-col rounded-3xl p-6 ${["bg-surface", "bg-peach", "bg-sky"][i % 3]}`}
              >
                <p className="text-xs font-bold">{formatDate(p.date).toLowerCase()} · {p.readingMinutes} min</p>
                <h3 className="mt-3 font-serif text-2xl leading-tight font-extrabold tracking-tight">{p.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Waitlist */}
      <section className="container-x pt-16">
        <div className="pop relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white sm:px-12">
          <span className="absolute top-6 right-6 hidden rotate-12 rounded-full border-2 border-white bg-accent px-3 py-1 text-sm font-bold text-ink md:block">
            limited dates 🔥
          </span>
          <h2 className="display text-5xl leading-[0.95] sm:text-6xl">
            get on the <span className="font-italic font-normal text-butter normal-case">list</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/75">
            Early access to founding-season dates, launch pricing and new chair drops. No spam, promise.
          </p>
          <div className="mx-auto mt-8 max-w-md text-left">
            <WaitlistForm source="home" />
          </div>
        </div>
      </section>
    </>
  );
}
