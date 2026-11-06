import type { Metadata } from "next";
import Link from "@/components/Link";
import { ChairArt } from "@/components/ChairArt";
import { Reveal } from "@/components/Reveal";
import { Figure, HubFaqs, Icon, JsonLd, PageHero, type Faq } from "@/components/ui";
import { RecommendedChairs } from "@/components/geo/RecommendedChairs";
import { getChair } from "@/data/chairs";
import { DEPOSIT_LABEL, PAYMENT_SCHEDULE } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";
import { termsPolicy } from "@/lib/terms";

const title = "Renta de Sillas y Mobiliario para Bodas en Chicago";
const description =
  "Sillas, mesas, mantelería y más para bodas en Chicago y los suburbios: ceremonia y recepción en una sola cotización, con precios claros. Pide tu cotización gratis.";

export const metadata: Metadata = seo({
  title,
  description,
  alternates: {
    canonical: "/es/bodas",
    languages: { "en-US": "/events/weddings", "es-US": "/es/bodas", "x-default": "/events/weddings" },
  },
  openGraph: { title: `${title} | ${site.name}`, description, url: "/es/bodas", locale: "es_US", images: ["/opengraph-image"] },
});

const heroChairs = ["cross-back", "velvet-dining", "louis-medallion"].map(getChair).filter((c): c is NonNullable<typeof c> => !!c);

const painPoints = [
  {
    problem: "Quieren un estilo para la ceremonia y otro distinto para la recepción.",
    solution: "Cotizamos ambos juntos: sillas sencillas para la ceremonia (como cross-back o wishbone) y un estilo más elegante para la recepción, en una sola entrega.",
  },
  {
    problem: "El número de invitados sigue cambiando conforme llegan las confirmaciones.",
    solution: "Cotizamos un número de trabajo con margen extra, y puedes bajar la cantidad sin costo hasta unos días antes de la entrega.",
  },
  {
    problem: "El salón o el jardín no incluye mesas ni mantelería del color que quieren.",
    solution: "Armamos mesas, mantelería, vajilla y cristalería a juego en una sola lista, con el precio de cada cosa antes de reservar.",
  },
  {
    problem: "La ceremonia es al aire libre y temen que el pasto o el terreno sea un problema.",
    solution: "Tenemos sillas resistentes para exteriores y podemos cotizar pista o tarima si el terreno lo necesita.",
  },
];

const checklist = [
  "Confirma el número de invitados para la ceremonia y la recepción",
  "Decide si quieres el mismo estilo de silla en ambas partes, o uno distinto",
  "Pregunta en el lugar si permiten rentas externas y a qué hora se puede entregar",
  "Elige mantelería y vajilla que combinen con los colores de la boda",
  "Revisa si el terreno es pasto, grava o piso parejo, sobre todo para una boda al aire libre",
  "Pide tu cotización y agenda una llamada para planear todo junto",
];

const faqs: Faq[] = [
  {
    q: "¿Pueden cotizar sillas para la ceremonia y la recepción juntas?",
    a: "Sí. Puedes pedir un estilo para la ceremonia y otro para la recepción, o el mismo para ambas, y todo sale en una sola cotización con entrega coordinada entre las dos partes del evento.",
  },
  {
    q: "¿Cuántas sillas necesito para una boda con 120 invitados?",
    a: "Unas 120 sillas para la ceremonia (si todos se sientan) más un margen de alrededor del 5%, y suficientes para la recepción según cuántas mesas usen. Nuestra cotización ayuda a calcular ambas.",
  },
  {
    q: "¿Rentan para bodas al aire libre?",
    a: "Sí. Tenemos sillas resistentes para pasto y jardín, y podemos cotizar una tarima o pista si el terreno lo requiere. Dinos si es pasto, grava o piso parejo.",
  },
  {
    q: "¿También rentan mesas, mantelería y vajilla, o solo sillas?",
    a: "Rentamos todo junto: sillas, mesas, mantelería, vajilla, cristalería, carpas y más. Una sola cotización para toda la boda, no solo las sillas.",
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

export default function SpanishWeddingsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Renta de sillas y mobiliario para bodas",
          serviceType: "Renta de sillas y mobiliario para bodas",
          description,
          url: `${site.url}/es/bodas`,
          provider: { "@id": `${site.url}/#business` },
          areaServed: [{ "@type": "City", name: "Chicago, IL" }, { "@type": "AdministrativeArea", name: "Chicago metropolitan area" }],
          inLanguage: "es-US",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Cómo planear las sillas y el mobiliario para una boda",
          inLanguage: "es-US",
          step: checklist.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
        }}
      />
      <PageHero
        breadcrumbs={[
          { name: "Español", href: "/es" },
          { name: "Bodas", href: "/es/bodas" },
        ]}
        eyebrow="Chicago y los suburbios · Bodas"
        title={
          <>
            Sillas y mobiliario para una boda que se vea <em className="text-gold">como la imaginaron</em>
          </>
        }
        intro="Rentamos sillas, mesas, mantelería, vajilla y carpas para bodas en Chicago y los suburbios, para la ceremonia y la recepción en una sola cotización. Dinos el número de invitados, el lugar y el estilo que buscan, y te ayudamos a planear todo."
        actions={
          <>
            <Link href="/quote?event=wedding&from=es-bodas" className="btn-primary">
              Pide tu cotización gratis <Icon name="arrow" size={16} />
            </Link>
            <Link href="/book?from=es-bodas" className="link-line">
              O llámanos o escríbenos
            </Link>
          </>
        }
        media={
          <Figure
            src={scenes.midnightLongTable.src}
            alt="Mesa larga de recepción con sillas doradas, mantelería color carbón y velas, montada para una boda"
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
            { slug: "cross-back", why: "Un estilo sencillo y versátil, ideal para la ceremonia, al aire libre o adentro." },
            { slug: "velvet-dining", why: "Un acabado más elegante para la recepción, en terciopelo y varios colores." },
            { slug: "louis-medallion", why: "Un toque clásico y tapizado para la mesa de honor o los padrinos." },
          ]}
          eyebrow="Nuestras recomendaciones"
          heading={
            <>
              Sillas que elegiríamos para una <em className="text-gold">boda</em>
            </>
          }
        />

        <section className="mt-32 grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
          <div>
            <p className="eyebrow">Notas de planeación</p>
            <div className="prose-post mt-8 space-y-6">
              <p>
                Desde una ceremonia en un jardín en los suburbios hasta una recepción grande en un salón del centro de
                Chicago, cada boda tiene dos partes con necesidades distintas: la ceremonia suele pedir sillas sencillas y
                fáciles de acomodar en filas, mientras que la recepción pide un estilo que combine con la mesa, las flores
                y la mantelería.
              </p>
              <p>
                Si la ceremonia es al aire libre, el tipo de terreno importa: pasto, grava o piso parejo cambian qué silla
                conviene y si hace falta una tarima. Cuéntanos esos detalles en tu cotización para que la entrega salga
                bien el día del evento.
              </p>
              <p>
                Muchas parejas usan el mismo estilo de silla en ambas partes para simplificar, y otras prefieren un estilo
                más sencillo para la ceremonia y uno más elegante para la recepción. Las dos opciones se cotizan igual de
                fácil, junto con mesas, mantelería, vajilla y cristalería si las necesitan.
              </p>
            </div>
          </div>
          <div className="md:pt-14">
            <h2 className="display-2">Tu lista para la boda</h2>
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

      {/* Chair collage, matching the Spanish quinceañeras page's hero treatment. */}
      <section className="container-x mt-32">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {heroChairs.map((c) => (
            <ChairArt key={c.slug} chair={c} className="aspect-square" />
          ))}
        </div>
      </section>

      <div className="container-x">
        <HubFaqs faqs={faqs} title="Preguntas sobre sillas y mobiliario para bodas" eyebrow="Preguntas" />
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
            Hablemos de las sillas y el mobiliario para <em className="text-gold">su boda</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl leading-8 text-muted">
            Dinos el número de invitados, el lugar y el estilo que buscan en una llamada corta, o pide tu cotización en
            línea.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <Link href="/quote?event=wedding&from=es-bodas" className="btn-primary">
              Pide tu cotización gratis
            </Link>
            <Link href="/book?from=es-bodas" className="link-line">
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
