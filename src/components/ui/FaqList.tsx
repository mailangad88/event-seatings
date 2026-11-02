import { JsonLd } from "./JsonLd";
import { Icon } from "./Icon";

export type Faq = { q: string; a: string };

// Accordion FAQs (native <details>, so answers are in the HTML for crawlers)
// plus FAQPage schema. Set schema={false} if the page already emits FAQPage.
export function FaqList({ faqs, schema = true, className = "" }: { faqs: Faq[]; schema?: boolean; className?: string }) {
  return (
    <div className={className}>
      {schema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      )}
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {faqs.map((f, i) => (
          <details key={f.q} className="group" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 font-medium transition-colors hover:bg-surface-2/50 sm:px-6 [&::-webkit-details-marker]:hidden">
              <h3 className="text-base sm:text-lg">{f.q}</h3>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-gold transition-transform group-open:rotate-45">
                <Icon name="plus" size={16} />
              </span>
            </summary>
            <div className="px-5 pb-6 leading-7 text-muted sm:px-6">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
