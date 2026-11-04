import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, EventFacts, FeeStatus, PageTitle, PartCard, StageTrack, daysLabel } from "@/components/account/AccountUi";
import { PriceDisclaimer } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { currentAccount, fmtDay } from "@/lib/account";
import { BOOKING_FEE_LABEL, usd } from "@/lib/catalog-types";
import { updateLead } from "@/lib/store";
import { sendMessage } from "../../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your event" };

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

// One event: the order split by rental company (shown as one order), the booking fee and the message thread.
export default async function AccountEvent(props: PageProps<"/account/events/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const data = (await currentAccount())!;
  const e = data.events.find((x) => x.id === id);
  if (!e) notFound();

  // Opening the event marks our messages as read.
  if (e.unread && !data.sample) {
    const now = new Date().toISOString();
    await updateLead(e.id, { messages: e.messages.map((m) => (m.from === "team" && !m.read_at ? { ...m, read_at: now } : m)) }).catch(() => {});
  }

  const rental = e.parts.reduce((s, p) => s + p.rentalPrice, 0);
  const fee = Math.max(0, e.subtotal - rental);

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <Icon name="arrow" size={14} className="rotate-180" /> All orders
      </Link>
      <PageTitle
        eyebrow={daysLabel(e.daysLeft)}
        title={e.title}
        actions={e.proposalUrl && e.fee.status === "unpaid" ? <Link href={e.proposalUrl} className="btn-primary">Review quote and book</Link> : undefined}
      />
      <EventFacts e={e} />

      <Card>
        <p className="mb-4 text-sm"><span className="font-semibold">Where things stand:</span> <span className="text-muted">{e.stageNote}</span></p>
        <StageTrack stage={e.stage} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Your order">
            {e.parts.length ? (
              <>
                <p className="mb-4 text-sm text-muted">
                  {e.parts.length === 1
                    ? "Everything comes from one rental company."
                    : `One order, filled by ${e.parts.length} rental companies. Each one delivers its own items, and we keep it all in one place for you.`}
                </p>
                <div className="space-y-3">
                  {e.parts.map((p, i) => <PartCard key={p.key} part={p} open={i === 0} />)}
                </div>
                <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
                  <div className="flex justify-between"><dt className="text-muted">Rental companies&apos; prices</dt><dd className="tabular-nums">{usd(rental)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Our booking and coordination fee ({BOOKING_FEE_LABEL})</dt><dd className="tabular-nums">{usd(fee)}</dd></div>
                  <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>Rentals total</dt><dd className="tabular-nums">{usd(e.subtotal)}</dd></div>
                </dl>
                <PriceDisclaimer className="mt-3" />
              </>
            ) : (
              <p className="text-sm text-muted">Your coordinator is putting the item list together. It shows up here, split by rental company, as soon as it&apos;s ready.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Booking fee">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">{e.fee.label}</p>
              <FeeStatus fee={e.fee} />
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{usd(e.fee.status === "paid" ? (e.fee.amount ?? fee) : (e.fee.due ?? fee))}</p>
            <p className="mt-1 text-xs text-muted">
              {e.fee.status === "paid"
                ? `Paid ${fmtDay(e.fee.paidAt?.slice(0, 10)) ?? ""}. Rental company names and contacts are now shown on your order.`
                : "Fully refundable for 72 hours. Rental company names are shared once it's paid."}
            </p>
            {e.proposalUrl && e.fee.status === "unpaid" && <Link href={e.proposalUrl} className="btn-primary btn-sm mt-4 w-full">Pay booking fee</Link>}
            <p className="mt-4 border-t border-line pt-3 text-xs leading-5 text-muted">
              Each rental company bills its own part (plus its delivery, damage waiver and tax) under its own agreement. See{" "}
              <Link href="/account/payments" className="link">Payments</Link>.
            </p>
          </Card>

          <Card title="Messages" id="messages">
            {sp.sample && <p className="mb-3 rounded-lg bg-gold-soft px-3 py-2 text-sm">Messages aren&apos;t sent from the sample account.</p>}
            {sp.sent && <p className="mb-3 rounded-lg bg-green-soft px-3 py-2 text-sm text-green">Sent. We usually reply within one business day.</p>}
            {e.messages.length ? (
              // Newest at the bottom; column-reverse keeps the box scrolled to the latest message.
              <ol className="flex max-h-96 flex-col-reverse gap-3 overflow-y-auto">
                {[...e.messages].reverse().map((m, i) => (
                  <li key={i} className={`flex ${m.from === "customer" ? "justify-end" : ""}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "customer" ? "bg-accent text-accent-ink" : "bg-surface-2"}`}>
                      <p className="whitespace-pre-line">{m.text}</p>
                      <p className={`mt-1 text-xs ${m.from === "customer" ? "opacity-80" : "text-muted"}`}>{m.from === "team" ? "Your coordinator" : "You"} · {time(m.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">Questions about delivery, changes or anything else? Ask here and your coordinator will reply.</p>
            )}
            <form action={sendMessage} className="mt-4">
              <input type="hidden" name="lead" value={e.id} />
              <label htmlFor="msg" className="sr-only">Your message</label>
              <textarea id="msg" name="text" rows={3} required maxLength={4000} className="field" placeholder="Type a message" />
              <button className="btn-primary btn-sm mt-2 w-full">Send message</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
