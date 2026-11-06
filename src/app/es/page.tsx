import type { Metadata } from "next";
import Link from "@/components/Link";
import { Figure, HubFaqs, Icon, IconCards, JsonLd, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { DEPOSIT_LABEL, PAYMENT_SCHEDULE } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";
import { termsPolicy } from "@/lib/terms";

const title = "Renta de Sillas y Mobiliario para Eventos en Chicago";
const description =
  "Renta de sillas, mesas, mantelería y más para bodas, quinceañeras, bautizos y fiestas en Chicago y los suburbios. Precios claros, una sola cotización y nosotros coordinamos la entrega.";

export const metadata: Metadata = seo({
  title,
  description,
  alternates: { canonical: "/es", languages: { "en-US": "/", "es-US": "/es", "x-default": "/" } },
  openGraph: { title: `${title} | ${site.name}`, description, url: "/es", locale: "es_US" },
});

const occasions: { title: string; text: string; href?: string; cta?: string }[] = [
  {
    title: "Quinceañeras",
    text: "Un trono para la quinceañera, sillas para su corte y asientos para el salón de banquetes.",
    href: "/es/quinceaneras",
    cta: "Ver la página de quinceañeras",
  },
  {
    title: "Bodas",
    text: "Sillas para la ceremonia y la recepción, mesas, mantelería y pista de baile en una sola lista.",
    href: "/quote?event=wedding&from=es-home",
    cta: "Cotizar esta boda",
  },
  {
    title: "Bautizos y primeras comuniones",
    text: "Sillas y mesas para la misa y para la celebración en casa o en un salón después.",
    href: "/quote?from=es-home",
    cta: "Cotizar este evento",
  },
  {
    title: "Cumpleaños y aniversarios",
    text: "Desde una fiesta en el patio hasta una celebración grande de aniversario en un salón.",
    href: "/quote?event=birthday&from=es-home",
    cta: "Cotizar este evento",
  },
  {
    title: "Eventos religiosos y comunitarios",
    text: "Mesas largas y sillas sencillas para salones de iglesia, templo o del vecindario.",
    href: "/quote?from=es-home",
    cta: "Cotizar este evento",
  },
  {
    title: "Eventos de empresa",
    text: "Sillas, mesas y mantelería para una junta, una cena o una fiesta de fin de año.",
    href: "/quote?event=corporate&from=es-home",
    cta: "Cotizar este evento",
  },
];

const faqs: Faq[] = [
  {
    q: "¿En qué áreas de Chicago entregan?",
    a: `Entregamos en Chicago y los suburbios, incluyendo ${site.serviceArea.slice(1).join(", ")}. Si tu evento es más lejos, pregúntanos.`,
  },
  {
    q: "¿Cómo funcionan los precios?",
    a: "Cada silla, mesa y artículo tiene su precio en el sitio. Tu cotización suma lo que elijas más entrega, montaje, el seguro de daños y el impuesto. No hay un cargo aparte por reservar.",
  },
  {
    q: "¿Cuánto hay que pagar para reservar la fecha?",
    a: `Reservas con un ${DEPOSIT_LABEL} (mínimo ${PAYMENT_SCHEDULE.min} dólares), reembolsable por completo si cancelas dentro de ${PAYMENT_SCHEDULE.refundHours} horas. El ${Math.round(PAYMENT_SCHEDULE.secondShare * 100)}% se paga ${PAYMENT_SCHEDULE.secondDueDaysBefore} días antes del evento, y el resto ${termsPolicy.balanceDueDays} días antes.`,
  },
  {
    q: "¿Podemos cambiar la cantidad o la fecha después de reservar?",
    a: `Sí. Puedes bajar la cantidad o mover la fecha sin costo hasta ${termsPolicy.changeCutoffDays} días antes de la entrega. Después de eso, pregúntanos qué cambios todavía son posibles.`,
  },
  {
    q: "¿Las llamadas se atienden en español?",
    a: "Por ahora atendemos las llamadas en inglés, pero puedes escribirnos en español por el formulario de cotización o por mensaje de texto y te respondemos en español.",
  },
  {
    q: "¿Cuánto antes debemos reservar?",
    a: "Mientras antes, mejor, sobre todo para fechas de mayo a octubre, cuando las sillas y carpas más populares se reservan primero. Un mes de anticipación y un número aproximado de invitados son suficientes para empezar.",
  },
];

export default function SpanishHomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${site.url}/es/#webpage`,
          name: title,
          description,
          url: `${site.url}/es`,
          inLanguage: "es-US",
          isPartOf: { "@id": `${site.url}/#website` },
          about: { "@id": `${site.url}/#business` },
        }}
      />
      <PageHero
        eyebrow="Chicago y los suburbios"
        title={
          <>
            Todo lo que necesitas para tu evento, en <em className="text-gold">una sola cotización</em>
          </>
        }
        intro="Rentamos sillas, mesas, mantelería, vajilla, carpas y más para bodas, quinceañeras, bautizos y fiestas en Chicago y los suburbios. Ves los precios antes de reservar y nosotros coordinamos la entrega y el montaje."
        actions={
          <>
            <Link href="/quote?from=es-home" className="btn-primary">
              Pide tu cotización gratis <Icon name="arrow" size={16} />
            </Link>
            <Link href="/book?from=es-home" className="link-line">
              O llámanos o escríbenos
            </Link>
          </>
        }
        media={
          <Figure
            src={scenes.gildedIvory.src}
            alt="Sillas doradas, mantelería color marfil y centros de mesa dorados en un salón de banquetes, ideal para bodas y quinceañeras en Chicago"
            ratio="4/5"
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="mx-auto max-w-md"
          />
        }
      />

      <Section
        eyebrow="Tu evento"
        title="¿Qué estás celebrando?"
        intro="Elige tu tipo de evento para ver ideas de sillas y mobiliario, o empieza tu cotización directamente."
      >
        <IconCards
          columns={3}
          items={occasions.map((o) => ({
            title: o.title,
            text: o.text,
            extra: o.href ? (
              <Link href={o.href} className="link-line mt-3 text-sm">
                {o.cta} <Icon name="arrow" size={14} />
              </Link>
            ) : undefined,
          }))}
        />
      </Section>

      <Section tone="sand" eyebrow="Cómo funciona" title="De la primera llamada a la entrega">
        <StepFlow
          caption="Cómo se reserva un evento: una llamada o un mensaje, una cotización por escrito, un depósito para reservar, y la entrega revisada el día del evento."
          steps={[
            { icon: "phone", title: "Cuéntanos tu evento", text: "Fecha, número de invitados y el lugar donde será." },
            { icon: "quote", title: "Cotización por escrito", text: "Cada artículo y su precio por escrito. Puedes cambiar lo que quieras." },
            {
              icon: "check",
              title: "Reserva con un depósito",
              text: `${DEPOSIT_LABEL}, reembolsable por completo dentro de ${PAYMENT_SCHEDULE.refundHours} horas.`,
            },
            { icon: "truck", title: "Entrega y montaje", text: "Revisamos cada entrega la mañana de tu evento." },
          ]}
        />
      </Section>

      <section className="container-x section-y">
        <div className="tone-dark relative grid overflow-hidden rounded-3xl bg-espresso md:grid-cols-[1.3fr_1fr]">
          <div className="relative z-10 p-8 sm:p-12 lg:p-16">
            <p className="eyebrow">Cotización gratis · sin compromiso</p>
            <h2 className="display-2 mt-4 max-w-xl">Pide el precio de todo tu evento</h2>
            <p className="lede mt-5 max-w-lg">
              Elige sillas, mesas, mantelería, vajilla y más, mira los precios al momento, y recibe una cotización por escrito
              para tu fecha.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-ink/85 sm:grid-cols-2">
              {[
                "Precios al momento de elegir",
                "Entrega y montaje incluidos en la cotización",
                "Una sola persona para contactar",
                "Respuesta dentro de un día hábil",
                `${DEPOSIT_LABEL} para reservar, reembolsable dentro de ${PAYMENT_SCHEDULE.refundHours} horas`,
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon name="check" size={16} className="text-gold" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/quote?from=es-home" className="btn-accent btn-lg">
                Empezar mi cotización <Icon name="arrow" size={18} />
              </Link>
              <Link href="/book?from=es-home" className="btn border border-ink/25 text-ink hover:border-accent hover:bg-accent-soft hover:text-accent">
                Llámanos o escríbenos
              </Link>
            </div>
          </div>
          <div className="relative min-h-64 md:min-h-full">
            <Figure
              src={scenes.midnightLongTable.src}
              alt="Mesa larga de recepción con sillas doradas, mantelería color carbón y velas, para bodas y fiestas grandes"
              ratio="4/5"
              className="h-full"
              imgClassName="h-full"
            />
          </div>
        </div>
      </section>

      <HubFaqs faqs={faqs} title="Preguntas frecuentes" eyebrow="Preguntas" />
    </>
  );
}
