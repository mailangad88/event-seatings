import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Event Seatings is a ${site.city} wedding chair rental company bringing alternatives to the Chiavari chair.`,
};

export default function AboutPage() {
  return (
    <div className="container-x max-w-3xl py-14">
      <span className="eyebrow">👋 our story</span>
      <h1 className="mt-4 display text-5xl leading-[0.95] sm:text-7xl">every wedding had the <span className="font-italic font-normal normal-case tracking-normal">same</span> chair.</h1>
      <div className="prose-post mt-8">
        <p>
          Go to enough weddings around Chicago and you&apos;ll notice something: almost every reception has the same
          chair. The Chiavari is lovely, but when it&apos;s the only option your rental company carries, every
          wedding starts to look the same.
        </p>
        <p>
          Couples spend months choosing florals, linens and lighting, then get one chair to choose from. We think
          seating should be part of the design. Seating takes up more of the room than almost anything else.
        </p>
        <p>
          Event Seatings is a new, locally owned rental company based in {site.city}. We&apos;re building a collection
          of distinctive, commercial-grade chairs (cross-back, ghost, rattan, velvet, bentwood and more) for weddings
          and events across the Fox Valley and Chicago&apos;s western suburbs.
        </p>
        <h2>Help us build the collection</h2>
        <p>
          We&apos;re launching with our {site.launch.seasonLabel}, and we&apos;re letting couples and planners help
          decide what we stock. Every ♡ on a chair and every quote request tells us which styles to bring in first.
        </p>
        <h2>Where we deliver</h2>
        <p>{site.serviceArea.join(", ")}, and nearby. Not sure if we reach your venue? Just ask.</p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/chairs" className="btn-primary">vote on chairs →</Link>
        <a href={`mailto:${site.email}`} className="btn-ghost">email us</a>
      </div>
    </div>
  );
}
