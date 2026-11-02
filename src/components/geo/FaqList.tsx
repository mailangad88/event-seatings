import type { Faq } from "@/data/geo";
import { JsonLd } from "./JsonLd";

export function FaqList({ faqs, title }: { faqs: Faq[]; title: React.ReactNode }) {
  return (
    <section className="mt-32 grid gap-14 md:grid-cols-[1fr_1.6fr] md:gap-20" id="faq">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <div>
        <p className="eyebrow">Questions</p>
        <h2 className="headline mt-6 text-5xl leading-[1] sm:text-6xl">{title}</h2>
      </div>
      <div className="border-t border-gold/40">
        {faqs.map((f, i) => (
          <details key={f.q} className="group border-b border-line" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6">
              <h3 className="font-serif text-2xl leading-snug">{f.q}</h3>
              <span
                className="text-xl font-light text-gold transition-transform duration-300 group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="max-w-2xl pb-7 leading-8 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
