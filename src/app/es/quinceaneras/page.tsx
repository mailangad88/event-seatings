import type { Metadata } from "next";
import Link from "@/components/Link";
import { ChairArt } from "@/components/ChairArt";
import { Reveal } from "@/components/Reveal";
import { Figure, HubFaqs, Icon, JsonLd, PageHero, Section, type Faq } from "@/components/ui";
import { RecommendedChairs } from "@/components/geo/RecommendedChairs";
import { getChair } from "@/data/chairs";
import { DEPOSIT_LABEL, PAYMENT_SCHEDULE } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";
import { termsPolicy } from "@/lib/terms";

const title = "Renta de Sillas para Quinceañeras en Chicago";
const description =
  "Sillas para quinceañeras en Chicago y los suburbios: un trono para la quinceañera, sillas para su corte y asientos dorados para el salón. Pide tu cotización.";

export const metadata: Metadata = seo({
  title,
  description,
  alternates: {
    canonical: "/es/quinceaneras",
    languages: { "en-US": "/events/quinceaneras", "es-US": "/es/quinceaneras", "x-default": "/events/quinceaneras" },
  },
  openGraph: { title: `${title} | ${site.name}`, description, url: "/es/quinceaneras", locale: "es_US" },
});

const heroChairs = ["royal-throne", "infinity", "louis-medallion"].map(getChair).filter((c): c is NonNullable<typeof c> => !!c);

const painPoints = [
  {
    problem: "Las sillas del salón no van con los colores del tema.",
    solution: "Las sillas doradas infinity o las sillas Louis con medallón le dan al salón un aspecto más fino, en dorado, oro rosa, esmeralda o borgoña.",
  },
  {
    problem: "El número de invitados sigue creciendo conforme confirma la familia.",
    solution: "Cotizamos un número de trabajo con un margen extra y te decimos hasta cuándo puedes ajustar la cantidad antes de la entrega.",
  },
  {
    problem: "Ella necesita un asiento especial para el cambio de zapatos y la corona.",
    solution: "Nuestro trono real viene en acabado dorado, plateado y granate, y le da a las fotos un punto central claro.",
  },
  {
    problem: "El tiempo para montar es corto entre el evento anterior del salón y el tuyo.",
    solution: "Las sillas apilables para invitados se montan más rápido, y coordinamos el horario con el salón.",
  },
];

const checklist = [
  "Confirma el número de invitados con las dos familias",
  "Pregunta en el salón si permiten sillas de afuera y a qué hora",
  "Elige el trono de la quinceañera y los asientos de su corte",
  "Combina las sillas de los invitados con los colores del tema",
  "Decide dónde se sentarán la corte, los padrinos y los abuelos",
  "Pide tu cotización y agenda una llamada para planear",
];

const faqs: Faq[] = [
  {
    q: "¿Puedo rentar una silla de trono para una quinceañera en Chicago?",
    a: "Sí. Nuestro trono real viene en dorado y marfil, plateado y blanco, o granate y dorado, y entregamos en Chicago y los suburbios. Se renta por par, así que pregunta por una silla individual en tu cotización.",
  },
  {
    q: "¿Cuántas sillas necesito para un salón con 150 invitados?",
    a: "Unas 150 sillas para los invitados, más un margen de alrededor del 5% para invitados de último momento y familia extra, y sillas aparte para la corte de honor y el trono de la quinceañera.",
  },
  {
    q: "¿El salón no incluye sus propias sillas?",
    a: "Muchos salones de banquetes sí incluyen sillas básicas, y eso le funciona bien a algunas familias. Si quieres un estilo diferente, revisamos qué permite tu salón, planeamos la hora de entrega y cotizamos solo lo que necesitas.",
  },
  {
    q: "¿Puedo rentar sillas para la corte de honor y los padrinos también?",
    a: "Sí. Podemos cotizar un estilo para la quinceañera y su corte, y otro más sencillo para el resto de los invitados, o un solo estilo para todo el salón.",
  },
  {
    q: "¿Cómo funciona el pago?",
    a: `Reservas con un ${DEPOSIT_LABEL} (mínimo ${PAYMENT_SCHEDULE.min} dólares), reembolsable por completo si cancelas dentro de ${PAYMENT_SCHEDULE.refundHours} horas. El ${Math.round(PAYMENT_SCHEDULE.secondShare * 100)}% se paga ${PAYMENT_SCHEDULE.secondDueDaysBefore} días antes del evento, y el resto ${termsPolicy.balanceDueDays} días antes. Puedes bajar la cantidad o mover la fecha sin costo hasta ${termsPolicy.changeCutoffDays} días antes de la entrega.`,
  },
  {
    q: "¿Atienden en español?",
    a: "Por ahora las llamadas se atienden en inglés, pero puedes escribirnos en español por el formulario de cotización o por mensaje de texto y te respondemos en español.",
  },
];

export default function SpanishQuinceanerasPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Renta de sillas para quinceañeras",
          serviceType: "Renta de sillas para quinceañeras",
          description,
          url: `${site.url}/es/quinceaneras`,
          provider: { "@id": `${site.url}/#business` },
          areaServed: [{ "@type": "City", name: "Chicago, IL" }, { "@type": "AdministrativeArea", name: "Chicago metropolitan area" }],
          inLanguage: "es-US",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Cómo planear las sillas para una quinceañera",
          inLanguage: "es-US",
          step: checklist.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
        }}
      />
      <PageHero
        breadcrumbs={[
          { name: "Español", href: "/es" },
          { name: "Quinceañeras", href: "/es/quinceaneras" },
        ]}
        eyebrow="Chicago y los suburbios · Quinceañeras"
        title={
          <>
            Sillas para una quinceañera que luzca como <em className="text-gold">su gran noche</em>
          </>
        }
        intro="Rentamos sillas para quinceañeras en Chicago y los suburbios, incluyendo un trono real para la quinceañera, sillas para su corte de honor y asientos para el salón de banquetes. Dinos el número de invitados y los colores, y te ayudamos a planear el salón."
        actions={
          <>
            <Link href="/quote?event=quinceanera&from=es-quinceaneras" className="btn-primary">
              Pide tu cotización gratis <Icon name="arrow" size={16} />
            </Link>
            <Link href="/book?from=es-quinceaneras" className="link-line">
              O llámanos o escríbenos
            </Link>
          </>
        }
        media={
          <Figure
            src={scenes.gildedIvory.src}
            alt="Sillas doradas con mantelería color marfil y centros de mesa dorados, montadas para el salón de una quinceañera"
            ratio="4/5"
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="mx-auto max-w-md"
          />
        }
      />

      <div className="container-x">
        <section className="mt-28">
          <p className="eyebrow">Lo que suele salir mal</p>
          <h2 className="display-2 mt-6 max-w-3xl">
            Problemas <em className="text-gold">comunes</em> y cómo los resolvemos
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {painPoints.map((p, i) => (
              <Reveal key={p.problem} delay={(i % 2) * 120}>
                <article className="h-full border border-line bg-surface p-8">
                  <p className="text-xs tracking-[0.2em] text-muted uppercase">El problema</p>
                  <h3 className="display-3 mt-3">{p.problem}</h3>
                  <p className="mt-6 border-t border-gold/40 pt-5 text-xs tracking-[0.2em] text-gold uppercase">Cómo ayudamos</p>
                  <p className="mt-2 leading-7 text-muted">{p.solution}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <RecommendedChairs
          picks={[
            { slug: "royal-throne", why: "El asiento central para la quinceañera, en acabados que combinan con sus colores." },
            { slug: "infinity", why: "Sillas doradas, plateadas o negras para invitados, que se apilan y lucen bien en salones de banquetes." },
            { slug: "louis-medallion", why: "Un toque elegante y tapizado para los padres, padrinos o la mesa de honor de la corte." },
          ]}
          eyebrow="Nuestras recomendaciones"
          heading={
            <>
              Sillas que elegiríamos para una <em className="text-gold">quinceañera</em>
            </>
          }
        />

        <section className="mt-32 grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
          <div>
            <p className="eyebrow">Notas de planeación</p>
            <div className="prose-post mt-8 space-y-6">
              <p>
                Desde Pilsen y Little Village hasta Aurora, Elgin y Joliet, las quinceañeras en el área de Chicago suelen ser
                celebraciones grandes y familiares: una misa por la tarde, y después un salón de banquetes lleno de tíos,
                primos, padrinos, una corte de honor y una pista de baile que se llena rápido.
              </p>
              <p>
                La silla de la quinceañera es el centro de atención. Un trono en un lugar elevado cerca de la pista de baile
                le da un espacio para el cambio de zapatos, las fotos y el brindis. Alrededor de ella, las sillas de los
                invitados en los colores del tema unen todo el salón.
              </p>
              <p>
                Muchos salones de banquetes ya incluyen sillas básicas, y para algunas familias eso funciona bien. Si quieres
                un estilo diferente, revisamos qué permite tu salón, planeamos la hora de entrega y cotizamos solo lo que
                necesitas.
              </p>
            </div>
          </div>
          <div className="md:pt-14">
            <h2 className="display-2">Tu lista de sillas</h2>
            <ol className="relative mt-6 border-l border-gold/40 pl-8">
              {checklist.map((s, i) => (
                <li key={s} className="relative pb-6 last:pb-0">
                  <span className="absolute top-0.5 -left-[2.65rem] grid h-5 w-5 place-items-center rounded-full border border-gold bg-bg text-xs text-gold">
                    {i + 1}
                  </span>
                  <p className="leading-7">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      {/* Chair collage, matching the English events page's hero treatment. */}
      <section className="container-x mt-32">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {heroChairs.map((c) => (
            <ChairArt key={c.slug} chair={c} className="aspect-square" />
          ))}
        </div>
      </section>

      <div className="container-x">
        <HubFaqs faqs={faqs} title="Preguntas sobre sillas para quinceañeras" eyebrow="Preguntas" />
      </div>

      <section className="relative mt-24 -mb-32 overflow-hidden bg-espresso">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(700px 300px at 50% 0%, rgba(201,169,106,0.18), transparent 70%)" }}
          aria-hidden
        />
        <div className="container-x relative py-24 text-center md:py-32">
          <span className="ornament" aria-hidden />
          <p className="eyebrow mt-8 justify-center before:hidden">{site.launch.seasonLabel}</p>
          <h2 className="display-2 mx-auto mt-8 max-w-4xl">
            Hablemos de las sillas para <em className="text-gold">su quinceañera</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl leading-8 text-muted">
            Dinos el número de invitados, los estilos de silla y la ventana de entrega en una llamada corta, o pide tu
            cotización en línea.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <Link href="/quote?event=quinceanera&from=es-quinceaneras" className="btn-primary">
              Pide tu cotización gratis
            </Link>
            <Link href="/book?from=es-quinceaneras" className="link-line">
              O llámanos o escríbenos
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x mt-24">
        <p className="eyebrow">Más en español</p>
        <p className="mt-4">
          <Link href="/es" className="link">
            Ver todo lo que rentamos para eventos en Chicago →
          </Link>
        </p>
      </section>
    </>
  );
}
