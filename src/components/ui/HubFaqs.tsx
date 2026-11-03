import { FaqList, type Faq } from "./FaqList";

// FAQ section for hub and index pages: heading, the accordion and FAQPage schema.
export function HubFaqs({ faqs, title = "Frequently asked questions", eyebrow = "FAQ", className = "" }: { faqs: Faq[]; title?: string; eyebrow?: string; className?: string }) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="hub-faq" className={`container-x section-y ${className}`}>
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="hub-faq" className="headline mt-4 mb-8 text-3xl sm:text-4xl">{title}</h2>
        <FaqList faqs={faqs} />
      </div>
    </section>
  );
}
