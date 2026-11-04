import Link from "next/link";
import { site } from "@/lib/site";

export function CallButton({ label = "Schedule a planning call", className = "btn-primary" }) {
  // /book shows the calendar when a booking link is set, and a call-back form until then.
  return (
    <Link href="/book?from=local-page" className={className}>
      {label}
    </Link>
  );
}

// Full-width closing band: the page's main conversion moment.
export function CallCta({ heading, place }: { heading: React.ReactNode; place?: string }) {
  return (
    <section className="relative mt-32 -mb-32 overflow-hidden bg-espresso">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(700px 300px at 50% 0%, rgba(201,169,106,0.18), transparent 70%)" }}
        aria-hidden
      />
      <div className="container-x relative py-24 text-center md:py-32">
        <span className="ornament" aria-hidden />
        <p className="eyebrow mt-8 justify-center before:hidden">{site.launch.seasonLabel}</p>
        <h2 className="display-2 mx-auto mt-8 max-w-4xl">{heading}</h2>
        <p className="mx-auto mt-6 max-w-xl leading-8 text-muted">
          Pick your rentals and see prices as you go, or tell us your guest count, chair styles and delivery window
          {place ? ` for your ${place} venue` : ""} on a quick call.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <Link href="/quote?from=local-page" className="btn-accent">
            Get a free quote
          </Link>
          <CallButton label="Book a free 15-minute call" className="btn-ghost" />
        </div>
        <ol className="mx-auto mt-16 grid max-w-3xl gap-8 text-left sm:grid-cols-3">
          {[
            ["Tell us the basics", "Date, guest count and the look you want."],
            ["Get a clear quote", "Chairs, delivery, setup and pickup, itemized."],
            ["We handle the rest", "Placed before guests arrive, collected after."],
          ].map(([t, d], i) => (
            <li key={t} className="border-t border-gold/40 pt-4">
              <span className="font-heading font-semibold text-lg text-gold">{["I", "II", "III"][i]}.</span>
              <p className="mt-2 font-heading font-semibold text-xl">{t}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
