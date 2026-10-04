import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Story",
  description: `Event Seatings is a ${site.city} wedding chair rental company bringing alternatives to the Chiavari chair.`,
};

export default function AboutPage() {
  return (
    <div className="container-x py-20">
      <div className="max-w-4xl">
        <p className="eyebrow">Our story</p>
        <h1 className="headline mt-6 text-6xl leading-[0.95] sm:text-8xl">
          Every celebration deserves a <em className="text-gold">point of view</em>
        </h1>
      </div>
      <div className="mt-20 grid gap-12 md:grid-cols-[1fr_1.6fr] md:gap-20">
        <p className="font-serif text-3xl leading-snug font-light text-muted italic">
          &ldquo;Couples spend months choosing florals, linens and light, then get one chair to choose from.&rdquo;
        </p>
        <div>
          <div className="prose-post">
          <p>
            Attend enough weddings around Chicago and you begin to notice it: nearly every reception has the same
            chair. The Chiavari is lovely, but when it&apos;s the only option a rental company carries, every room
            starts to look alike.
          </p>
          <p>
            We believe seating belongs to the design. Seating fills more of the room than almost anything else, and
            guests live with it all evening.
          </p>
          <p>
            Event Seatings is a new, locally owned company based in {site.city}. We&apos;re assembling a collection of
            distinctive, commercial-grade chairs (cross-back, ghost, rattan, velvet, bentwood and more) for weddings
            and celebrations across the Fox Valley and Chicago&apos;s western suburbs.
          </p>
          <h2>Shaped by you</h2>
          <p>
            We&apos;re launching with our {site.launch.seasonLabel}, and inviting couples and planners to help decide
            what we carry. Every saved piece and every enquiry tells us which styles to bring in first.
          </p>
          <h2>Where we deliver</h2>
          <p>{site.serviceArea.join(", ")}, and nearby. Not sure we reach your venue? Simply ask.</p>
          </div>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/chairs" className="btn-primary">Explore the collection</Link>
            <a href={`mailto:${site.email}`} className="btn-ghost">Write to us</a>
          </div>
        </div>
      </div>
    </div>
  );
}
