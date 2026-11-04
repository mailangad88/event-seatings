import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { money2, prettyDay } from "@/lib/admin-view";
import { site } from "@/lib/site";
import { getPartByToken, markPartOpened } from "@/lib/vendor-confirm";
import { answerOrder } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Confirm an order",
  robots: { index: false, follow: false },
};

const longDay = (d?: string) => prettyDay(d, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

// A rental partner's view of their part of one order: only their lines, the event details and an on-site
// contact, with a yes (delivery and pickup windows and their total) or no (why) answer.
// Typed by hand: generated route types only pick up new routes on the next `next dev` / `next build`.
export default async function VendorConfirmPage(props: { params: Promise<{ token: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token } = await props.params;
  const sp = await props.searchParams;
  const found = await getPartByToken(token);
  if (!found) notFound();
  const { lead, vendorId, order, part } = found;
  if (!order.answer && part) await markPartOpened(lead, vendorId);

  const error = sp.error === "missing" ? "Please fill in the delivery and pickup windows, and a total as a number." : sp.error === "reason" ? "Please tell us why, so we can sort it out with the customer." : undefined;
  const where = [lead.venue, lead.city].filter(Boolean).join(", ");
  const contact = [lead.name, lead.phone].filter(Boolean).join(", ");
  const facts: [string, string | undefined][] = [
    ["Event", lead.event_type],
    ["Date", longDay(lead.event_date) || "Not set yet"],
    ["Location", where || "We'll send the address"],
    ["Guests", lead.guest_count ? String(lead.guest_count) : undefined],
    ["On-site contact", contact || undefined],
  ];

  return (
    <div className="container-x section-y max-w-3xl">
      <p className="eyebrow">Order from {site.name}</p>
      <h1 className="display-2 mt-2">{part ? `Can ${part.vendorName} take this order?` : "This order changed"}</h1>

      {!part || order.status === "cancelled" ? (
        <section className="card mt-8 p-6 sm:p-8">
          <p className="leading-7 text-muted">
            Nothing on this order is with you any more, so there is nothing to confirm. Questions? Call us at {site.phone || "the number in our email"} or write to{" "}
            <a href={`mailto:${site.email}`} className="link">{site.email}</a>.
          </p>
        </section>
      ) : (
        <>
          <section className="card mt-8 p-6 sm:p-8" aria-labelledby="event">
            <h2 id="event" className="display-3">The event</h2>
            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[180px_1fr]">
              {facts.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card mt-6 p-6 sm:p-8" aria-labelledby="items">
            <h2 id="items" className="display-3">Your items</h2>
            {part.lines.length ? (
              <ul className="mt-4 divide-y divide-line text-sm">
                {part.lines.map(({ line, index }) => (
                  <li key={`${line.id}-${index}`} className="flex justify-between gap-4 py-2">
                    <span>{line.name}{line.variant ? <span className="text-muted"> ({line.variant})</span> : null}</span>
                    <span className="whitespace-nowrap tabular-nums">{line.qty} {line.unit || ""}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">We&apos;ll send the item list by email.</p>
            )}
            {part.cost > 0 && <p className="mt-4 text-sm text-muted">At your list prices this comes to {money2(part.cost)} before delivery and tax.</p>}
          </section>

          {order.answer ? (
            <section className="card mt-6 p-6 sm:p-8" aria-labelledby="answer">
              <div className="flex items-center gap-2">
                <Icon name={order.answer === "yes" ? "check" : "info"} size={20} />
                <h2 id="answer" className="display-3">{order.answer === "yes" ? "Thanks, you confirmed this order" : "Thanks, we got your answer"}</h2>
              </div>
              {order.answer === "yes" ? (
                <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[180px_1fr]">
                  <dt className="text-muted">Delivery</dt>
                  <dd>{[prettyDay(order.delivery_date), order.delivery_window].filter(Boolean).join(", ")}</dd>
                  <dt className="text-muted">Pickup</dt>
                  <dd>{[prettyDay(order.pickup_date), order.pickup_window].filter(Boolean).join(", ")}</dd>
                  {order.vendor_total !== undefined && (<><dt className="text-muted">Your total</dt><dd>{money2(order.vendor_total)}</dd></>)}
                  {order.note && (<><dt className="text-muted">Note</dt><dd>{order.note}</dd></>)}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-muted">You said you can&apos;t do this one{order.decline_reason ? `: ${order.decline_reason}` : ""}. We&apos;ll find another way for the customer.</p>
              )}
              <p className="mt-6 text-sm text-muted">
                Need to change something? Call us at {site.phone || "the number in our email"} or write to <a href={`mailto:${site.email}`} className="link">{site.email}</a>.
              </p>
            </section>
          ) : (
            <>
              {error && <p className="badge-rose mt-6" role="alert">{error}</p>}
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <form action={answerOrder} className="card p-6 sm:p-8">
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="answer" value="yes" />
                  <h2 className="display-3">Yes, we can do it</h2>
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="label" htmlFor="delivery_date">Delivery day</label>
                      <input id="delivery_date" name="delivery_date" type="date" className="field" defaultValue={lead.event_date} />
                    </div>
                    <div>
                      <label className="label" htmlFor="delivery_window">Delivery window</label>
                      <input id="delivery_window" name="delivery_window" className="field" required placeholder="8 to 10am" maxLength={120} />
                    </div>
                    <div>
                      <label className="label" htmlFor="pickup_date">Pickup day</label>
                      <input id="pickup_date" name="pickup_date" type="date" className="field" defaultValue={lead.event_date} />
                    </div>
                    <div>
                      <label className="label" htmlFor="pickup_window">Pickup window</label>
                      <input id="pickup_window" name="pickup_window" className="field" required placeholder="After 11pm, or next morning" maxLength={120} />
                    </div>
                    <div>
                      <label className="label" htmlFor="vendor_total">Your final total ($)</label>
                      <input id="vendor_total" name="vendor_total" inputMode="decimal" className="field" placeholder={part.cost > 0 ? part.cost.toFixed(2) : "0.00"} />
                      <p className="hint">With delivery, setup and tax, what you will bill.</p>
                    </div>
                    <div>
                      <label className="label" htmlFor="note">Note (optional)</label>
                      <textarea id="note" name="note" rows={3} className="field" maxLength={1000} placeholder="Anything we should tell the customer" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary mt-6 w-full">Confirm the order</button>
                </form>

                <form action={answerOrder} className="card p-6 sm:p-8">
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="answer" value="no" />
                  <h2 className="display-3">We can&apos;t do it</h2>
                  <div className="mt-5">
                    <label className="label" htmlFor="reason">Why not?</label>
                    <textarea id="reason" name="reason" rows={5} className="field" required maxLength={1000} placeholder="Booked that day, not enough stock, too far to deliver..." />
                    <p className="hint">We&apos;ll let the customer know and find another rental company.</p>
                  </div>
                  <button type="submit" className="btn-ghost mt-6 w-full">Send my answer</button>
                </form>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
