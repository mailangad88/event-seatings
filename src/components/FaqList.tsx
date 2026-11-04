// Accordion FAQs with matching FAQPage structured data (for Google rich results and AI answers).
export function FaqList({ faqs }: { faqs: [string, string][] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <div className="border-t border-gold/40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {faqs.map(([q, a]) => (
        <details key={q} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6">
            <span className="font-heading font-semibold text-2xl leading-snug">{q}</span>
            <span className="text-xl font-light text-gold transition-transform duration-300 group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="max-w-2xl pb-7 leading-8 text-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}
