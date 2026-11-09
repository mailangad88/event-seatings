import type { Metadata } from "next";
import Link from "@/components/Link";
import { site } from "@/lib/site";
import { ChairStrip } from "@/components/ChairStrip";
import { HubFaqs, StepFlow, type Faq } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { seo } from "@/lib/seo";
import { TERMS_UPDATED, TERMS_VERSION, termsPolicy as t } from "@/lib/terms";

// Customer Terms and Conditions. Numbers live in src/lib/terms.ts.
// NOTE FOR THE OWNER: these terms were written without a lawyer. Have an Illinois attorney review them
// before relying on them in a dispute. Bump TERMS_VERSION in src/lib/terms.ts after any change that matters.

export const metadata: Metadata = seo({
  title: "Terms and Conditions",
  description: `The terms for renting from ${site.name}: quotes and bookings, deposits, cancellations, date changes, delivery, damage, weather and liability.`,
  alternates: { canonical: "/terms" },
});

const sections = [
  ["about", "Who we are and how these terms work"],
  ["quotes", "Quotes are not bookings"],
  ["payment", "Deposit and payment"],
  ["cancel", "Cancelling"],
  ["changes", "Changing your date or order"],
  ["delivery", "Delivery, setup and pickup"],
  ["care", "Looking after the rentals"],
  ["damage", "Damage, loss, missing items and cleaning"],
  ["weather", "Weather and outdoor use"],
  ["venue", "Your venue and your guests"],
  ["substitutions", "Swaps for a similar item"],
  ["images", "Photos and prices on this site"],
  ["liability", "Limits on our liability"],
  ["force", "Events outside anyone's control"],
  ["disputes", "Illinois law and disputes"],
  ["other", "Everything else"],
] as const;

const steps = [
  { title: "Quote", text: "You send a list. We send prices. Nothing is held yet.", icon: "list" },
  { title: "Deposit", text: `You agree to these terms and pay ${t.depositPercent}% (${t.lateDepositPercent}% if booking within ${t.secondDueDays} days of the event).`, icon: "check" },
  { title: "Installments", text: `The rest comes due in stages: ${t.secondPercent}% ${t.secondDueDays} days out, the balance ${t.balanceDueDays} days before.`, icon: "calendar" },
  { title: "Event day", text: "We deliver, set up and pick up in the agreed windows.", icon: "truck" },
] as const;

const faqs: Faq[] = [
  {
    q: "Does sending a quote request commit me to anything?",
    a: "No. A quote request holds nothing and costs nothing. Your booking starts only when you agree to these terms, pay the deposit and get our written confirmation.",
  },
  {
    q: "Can I get my deposit back?",
    a: `Yes, in full, if you cancel within ${t.coolingOffHours} hours of paying it and your event is more than ${t.balanceDueDays} days away. After that, if you cancel more than ${t.fullWindowDays} days before delivery, we keep the deposit as a credit you can use on a new date within ${t.creditMonths} months.`,
  },
  {
    q: "What if it rains?",
    a: "Rain alone doesn't cancel an order, and our normal cancellation terms apply. Tell us early and we'll try to move your date or change items. If wind or storms make it unsafe to put up or leave a tent, we may hold off or take it down, and that is not a missed delivery.",
  },
  {
    q: "What happens if something gets broken?",
    a: `Tell us at pickup. We send any repair, replacement or cleaning charge within ${t.damageNoticeDays} days of pickup, with photos. Normal wear is never charged.`,
  },
  {
    q: "Do you give certificates of insurance?",
    a: "No. We don't issue certificates of insurance. If your venue needs one from you, ask your own insurance agent about event coverage.",
  },
];

export default function TermsPage() {
  return (
    <>
      <div className="container-x max-w-3xl py-20">
        <Breadcrumbs items={[{ name: "Terms and conditions", href: "/terms" }]} className="mb-6" />
        <p className="eyebrow">Legal</p>
        <h1 className="display-1 mt-6">Terms and conditions</h1>
        <p className="mt-4 text-sm text-muted">
          Last updated {TERMS_UPDATED} · Version {TERMS_VERSION}
        </p>
        <p className="mt-6 text-lg leading-8">
          These are the rules for renting from {site.name}. We wrote them in plain words. Please read them before you book,
          because when you tick &ldquo;I agree&rdquo; on a quote or pay a deposit, they become our agreement with you.
        </p>
        <ChairStrip className="mt-10" slugs={["windsor", "shell", "garden-folding"]} caption="How a rental with us works, start to finish." />

        <StepFlow className="mt-12" steps={[...steps]} caption="The four steps of every booking." />

        <nav aria-labelledby="toc" className="card mt-12 p-6">
          <h2 id="toc" className="font-heading text-xl font-semibold">On this page</h2>
          <ol className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {sections.map(([id, label], i) => (
              <li key={id}>
                <a href={`#${id}`} className="inline-block py-1 hover:text-gold">
                  {i + 1}. {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="prose-post mt-12">
          <h2 id="about">1. Who we are and how these terms work</h2>
          <p>
            {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) rents event items such as chairs, tables, linens, dinnerware,
            tents and lighting in {site.marketLong}. &ldquo;You&rdquo; means the person who books, and anyone booking on their
            behalf. These terms cover every quote, booking and order you make with us, and your use of this website.
          </p>
          <p>
            We may use independent delivery, setup and supply partners to fill your order. They work under our directions
            for your booking, and you deal with us for everything: questions, changes, payments and problems. These partners
            are not our employees, and nothing in these terms makes them a party to your booking.
          </p>
          <p>
            If your written quote or confirmation says something different from these terms, the quote or confirmation wins
            for that point.
          </p>

          <h2 id="quotes">2. Quotes are not bookings</h2>
          <ul>
            <li>Sending a quote request, building a list or talking to us does not hold any items or any date.</li>
            <li>
              A written quote from us shows the items, our prices, delivery and pickup, setup, any damage waiver, sales tax and
              the deposit. Its prices hold for {t.quoteValidDays} days unless it says otherwise.
            </li>
            <li>
              Your booking is confirmed only when all three have happened: you agree to these terms, you pay the deposit,
              and we send you a written confirmation. Until then, items can go to someone else.
            </li>
            <li>
              Items, prices and dates are subject to availability until confirmed. If something isn&apos;t available, we&apos;ll
              tell you and offer a similar item or remove it.
            </li>
          </ul>

          <h2 id="payment">3. Deposit and payment</h2>
          <ul>
            <li>
              To book, you pay a deposit. Unless your quote says otherwise, it is {t.depositPercent}% of the rental
              subtotal, at least ${t.depositMin} (never more than the subtotal). If your event is within {t.secondDueDays}{" "}
              days when you book, the deposit is {t.lateDepositPercent}% instead.
            </li>
            <li>
              If your event is more than {t.secondDueDays} days away when you book, a second payment of {t.secondPercent}%
              of the rental subtotal is due {t.secondDueDays} days before your event.
            </li>
            <li>
              The balance is due {t.balanceDueDays} days before your event. If you book inside that window, you pay the full
              amount to book. If a payment isn&apos;t made on time, we may treat the order as cancelled by you (see section 4).
            </li>
            <li>
              We take card and bank payments through Stripe, a secure payment company. We never see or store your full card
              number.
            </li>
            <li>
              Charges you agree to after booking (more items, extra time, longer carries or later pickups) are added to your
              balance.
            </li>
            <li>
              If you have a problem with a charge, please talk to us first. If you dispute a payment with your bank for a
              service you received, you are still responsible for the amount, plus reasonable costs of collecting it.
            </li>
          </ul>

          <h2 id="cancel">4. Cancelling</h2>
          <p>To cancel, email us at <a href={`mailto:${site.email}`}>{site.email}</a>. The time we receive your email counts.</p>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-sm">
              <caption className="sr-only">What you pay if you cancel</caption>
              <thead className="text-left text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-4 font-medium">When you cancel</th>
                  <th scope="col" className="py-2 font-medium">What happens</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line/60">
                  <td className="py-2 pr-4">Within {t.coolingOffHours} hours of paying the deposit (and more than {t.balanceDueDays} days before your event)</td>
                  <td className="py-2">Full refund of everything you paid</td>
                </tr>
                <tr className="border-b border-line/60">
                  <td className="py-2 pr-4">More than {t.fullWindowDays} days before delivery</td>
                  <td className="py-2">We keep the deposit as a credit toward a new date within {t.creditMonths} months. Anything above the deposit is refunded.</td>
                </tr>
                <tr className="border-b border-line/60">
                  <td className="py-2 pr-4">{t.midWindowDays} to {t.fullWindowDays} days before delivery</td>
                  <td className="py-2">You owe {t.midCharge}% of the order total</td>
                </tr>
                <tr className="border-b border-line/60">
                  <td className="py-2 pr-4">{t.balanceDueDays} days or less before delivery, or no one is there at delivery</td>
                  <td className="py-2">You owe the full order total</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            If we have to cancel your order for a reason that isn&apos;t yours, we refund everything you paid us for the items
            we can&apos;t supply. That refund is the most we owe for a cancellation.
          </p>

          <h2 id="changes">5. Changing your date or order</h2>
          <ul>
            <li>
              Moving your date: tell us at least {t.changeCutoffDays} days before delivery and we&apos;ll move your booking and
              deposit to a new date within {t.creditMonths} months, if the items are free that day. Prices for the new date may
              differ.
            </li>
            <li>
              Adding items: ask any time. We add them if they are available, at our current price.
            </li>
            <li>
              Removing items or lowering counts: free up to {t.changeCutoffDays} days before delivery. After that, you pay for
              the original amount.
            </li>
            <li>Changes count only once we confirm them in writing (email or text is fine).</li>
          </ul>

          <h2 id="delivery">6. Delivery, setup and pickup</h2>
          <ul>
            <li>
              We agree a delivery window and a pickup window with you. Windows are estimates. Traffic, weather and earlier
              stops can make us a little early or late, and that is not a breach of these terms.
            </li>
            <li>
              You make sure we can get in: a clear path, a place to park or unload close to the door, working elevators, and
              someone (you or a person you name) there to meet us and sign for the order.
            </li>
            <li>
              Tell us before booking about stairs, long carries, loading-dock rules, tight venue times or anything else unusual.
              If we find these on the day, or have to wait, we may charge for the extra time or come back at another time.
            </li>
            <li>
              Setup means placing the items we listed in your quote where you show us. It does not include moving other
              furniture, decorating or cleaning the venue, unless your quote says so.
            </li>
            <li>
              At pickup, items should be in the same place they were delivered, stacked or grouped as we left them. If items
              aren&apos;t ready, or the venue is locked, we may charge for a second trip.
            </li>
            <li>
              Please count the items and look them over when they arrive. Tell us that day about anything missing or damaged,
              or we&apos;ll treat the delivery as complete and in good shape.
            </li>
          </ul>

          <h2 id="care">7. Looking after the rentals</h2>
          <p>
            The items are yours to look after from the time they are delivered until we pick them up. That means keeping them
            safe from theft, weather and misuse, using them only for what they are made for, and not moving them off the
            event site. Please don&apos;t paint, tape, nail, staple or glue anything to them.
          </p>

          <h2 id="damage">8. Damage, loss, missing items and cleaning</h2>
          <ul>
            <li>
              You pay for items that are lost, stolen or damaged beyond normal wear while in your care. We charge the repair
              cost, or the replacement cost if it can&apos;t be fixed.
            </li>
            <li>
              If your quote includes a damage waiver, it covers small accidental damage from normal use. It does not cover
              loss, theft, items left outside in the weather, misuse, or damage done on purpose.
            </li>
            <li>
              Cleaning: scrape food off plates and dishes and empty glasses. You don&apos;t need to wash them. Return linens
              dry, and shake off food. Wax, paint, glitter, burns, stains that won&apos;t wash out and very dirty items may be
              charged a cleaning fee, or the replacement cost.
            </li>
            <li>
              We send any damage, loss or cleaning charge within {t.damageNoticeDays} days of pickup, with photos. You agree we
              can charge it to the card you paid with if you don&apos;t pay it within 7 days.
            </li>
          </ul>

          <h2 id="weather">9. Weather and outdoor use</h2>
          <ul>
            <li>
              Outdoor events are at your own risk. Rain, wind, heat or cold are not a reason for a refund, and our normal
              cancellation terms apply. Tell us early and we&apos;ll try to move your date or swap items.
            </li>
            <li>
              Cover or bring in items when it rains. Wet and muddy items left outside may be charged for cleaning or damage.
            </li>
            <li>
              Tents: before any stakes go in, you must call 811 (JULIE, the Illinois utility locating service) or get your
              venue&apos;s OK, and tell us where buried lines, sprinklers and pipes are. You are responsible for any damage to
              lines we weren&apos;t told about, and for any tent permit your city or venue needs.
            </li>
            <li>
              If our crew thinks wind, storms or ground conditions make it unsafe to put up or keep up a tent or other
              structure, we can delay, refuse or take it down. If wind or lightning is coming, get guests out of tents.
            </li>
            <li>No open flames, heaters or cooking under or near tents unless we agree in writing.</li>
          </ul>

          <h2 id="venue">10. Your venue and your guests</h2>
          <ul>
            <li>
              You are responsible for getting your venue&apos;s permission for the rentals, delivery and setup times, any
              permits, and any insurance the venue asks for.
            </li>
            <li>
              We do not provide insurance and do not issue certificates of insurance. If your venue needs one from you, ask
              your own insurance agent about event coverage.
            </li>
            <li>
              You are responsible for how your guests use the rentals. That includes keeping children off stacked chairs and
              tables, making sure no one stands on chairs or tables, and following any weight limits we give you.
            </li>
            <li>
              To the extent the law allows, you agree to cover our costs (including reasonable lawyer fees) if someone makes
              a claim against us because of how you, your guests or your venue used the rentals, or because something you
              were responsible for under these terms wasn&apos;t done.
            </li>
          </ul>

          <h2 id="substitutions">11. Swaps for a similar item</h2>
          <p>
            Sometimes an item becomes unavailable after booking, for example because it was damaged at an earlier event. When
            that happens, we may replace it with an item of the same or better quality, at the price you agreed. If the
            change is something you would notice, like a different color or style, we&apos;ll tell you first. If you
            don&apos;t want the swap, we&apos;ll remove that item and refund what you paid for it.
          </p>

          <h2 id="images">12. Photos and prices on this site</h2>
          <ul>
            <li>
              Photos, 3D pictures and styled event scenes on this site show the style of each item. Real items may differ a
              little in color, finish, size and details. Some event scenes are made with computer image tools and are for
              ideas only.
            </li>
            <li>
              Prices on this site are estimates until they are in your written quote. We work hard to keep them right, but
              mistakes happen. If a price on a quote or confirmation is clearly wrong, we&apos;ll tell you and give you the
              choice to go ahead at the right price or cancel that part for a full refund.
            </li>
            <li>
              Planning articles, guides and tools on this site are general ideas, not professional advice. Check
              requirements with your venue.
            </li>
          </ul>

          <h2 id="liability">13. Limits on our liability</h2>
          <ul>
            <li>
              To the extent the law allows, the most we owe you for anything to do with a booking is the amount you paid us
              for that booking.
            </li>
            <li>
              We are not responsible for indirect losses, such as lost profits, costs from other vendors, travel costs, or
              upset or disappointment, even if we knew they could happen.
            </li>
            <li>
              We are not responsible for injury, loss or damage caused by misuse of the rentals, by not following these terms
              or our instructions, or by things at the venue we don&apos;t control.
            </li>
            <li>
              Nothing in these terms limits liability that the law does not allow us to limit, such as for our own gross
              negligence or intentional wrongdoing.
            </li>
          </ul>

          <h2 id="force">14. Events outside anyone&apos;s control</h2>
          <p>
            We are not responsible for delays or failures caused by things outside our reasonable control, such as severe
            weather, fire, flood, road closures, power cuts, government orders, public health emergencies, strikes, or
            accidents. If one of these stops us from delivering, we&apos;ll offer a new date or a refund of what you paid us
            for the items we couldn&apos;t deliver.
          </p>

          <h2 id="disputes">15. Illinois law and disputes</h2>
          <ul>
            <li>These terms are governed by the laws of the State of Illinois.</li>
            <li>
              If something goes wrong, please tell us first at <a href={`mailto:${site.email}`}>{site.email}</a>. We&apos;ll
              both try in good faith to fix it within {t.disputeTalkDays} days before either of us goes to court.
            </li>
            <li>
              If we can&apos;t fix it, either of us may bring a claim in small claims court, or otherwise in the state or
              federal courts for {t.county}, and we both agree to those courts.
            </li>
          </ul>

          <h2 id="other">16. Everything else</h2>
          <ul>
            <li>
              We may update these terms. The version you agreed to when you booked applies to that booking. The date and
              version are at the top of this page.
            </li>
            <li>
              If a court finds part of these terms can&apos;t be enforced, the rest still applies.
            </li>
            <li>
              If we don&apos;t enforce a term right away, we can still enforce it later.
            </li>
            <li>
              These terms, your written quote and our confirmation are the whole agreement between us for your booking.
            </li>
            <li>
              How we handle your information is in our <Link href="/privacy">Privacy Policy</Link>.
            </li>
          </ul>

          <h2>Contact us</h2>
          <p>
            {site.name}, {site.city}. Email <a href={`mailto:${site.email}`}>{site.email}</a>
            {site.phone ? (
              <>
                {" "}or call <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}>{site.phone}</a>
              </>
            ) : null}
            .
          </p>
        </div>
      </div>
      <HubFaqs faqs={faqs} title="Questions about our terms" />
    </>
  );
}
