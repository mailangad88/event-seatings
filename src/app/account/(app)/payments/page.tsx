import Link from "@/components/Link";
import { Card, FeeStatus, PageTitle } from "@/components/account/AccountUi";
import { PrintButton, printCss } from "@/components/admin/PrintButton";
import { site } from "@/lib/site";
import { requireAccount, fmtDay } from "@/lib/account";
import { usd } from "@/lib/catalog-types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payments" };

// What's paid and what's still to pay: the deposit per event, and the rest of each order,
// which the renter pays to that company under its own agreement.
export default async function AccountPayments() {
  const { events } = await requireAccount();
  const paid = events.filter((e) => e.fee.status === "paid").reduce((s, e) => s + (e.fee.amount ?? 0), 0);
  const due = events.filter((e) => e.fee.status === "unpaid" && e.proposalUrl).reduce((s, e) => s + (e.fee.due ?? 0), 0);
  const upcoming = events.filter((e) => (e.daysLeft ?? 0) >= 0 && e.stage < 5);
  const toCompanies = upcoming.reduce((s, e) => s + e.parts.reduce((t, p) => t + p.rentalPrice, 0), 0);

  return (
    <div className="space-y-6" data-print-doc>
      <style>{printCss}</style>
      <PageTitle title="Payments" intro="You pay a deposit to book each event, and the balance before the event." actions={<PrintButton />} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card stat-green"><p className="stat-label">Deposits paid</p><p className="stat-value">{usd(paid, 0)}</p></div>
        <div className={`stat-card ${due ? "stat-amber" : "stat-green"}`}><p className="stat-label">Deposits due</p><p className="stat-value">{usd(due, 0)}</p></div>
        <div className="stat-card stat-blue"><p className="stat-label">Upcoming rentals</p><p className="stat-value">{usd(toCompanies, 0)}</p><p className="mt-2 text-xs text-muted">Upcoming orders, before their delivery and tax</p></div>
      </div>
      {events.map((e) => (
        <Card key={e.id} title={`${e.title}${e.date ? ` · ${fmtDay(e.date, { month: "long", day: "numeric", year: "numeric" })}` : ""}`} more={{ href: `/account/events/${e.id}`, label: "Open" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-line"><th className="py-2 pr-4 font-medium">What</th><th className="py-2 pr-4 font-medium">Paid to</th><th className="py-2 pr-4 font-medium">Status</th><th className="py-2 text-right font-medium">Amount</th></tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-line [&>tr:last-child]:border-0">
                <tr>
                  <td className="py-2.5 pr-4">{e.fee.label}</td>
                  <td className="py-2.5 pr-4">{site.name}</td>
                  <td className="py-2.5 pr-4">
                    <FeeStatus fee={e.fee} />
                    {e.fee.status === "paid" && e.fee.paidAt && <span className="ml-2 text-xs text-muted">{fmtDay(e.fee.paidAt.slice(0, 10))}</span>}
                    {e.fee.status === "unpaid" && e.proposalUrl && <Link href={e.proposalUrl} className="ml-2 text-xs font-semibold text-accent">Pay now</Link>}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{usd(e.fee.status === "paid" ? (e.fee.amount ?? 0) : (e.fee.due ?? 0))}</td>
                </tr>
                {e.parts.map((p) => (
                  <tr key={p.key}>
                    <td className="py-2.5 pr-4">Rentals ({p.lines.length} {p.lines.length === 1 ? "item" : "items"})</td>
                    <td className="py-2.5 pr-4">{site.name}</td>
                    <td className="py-2.5 pr-4 text-xs text-muted">{e.fee.status === "paid" ? "Balance before the event" : "After booking"}</td>
                    <td className="py-2.5 text-right tabular-nums">{usd(p.rentalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
      <p className="text-xs leading-5 text-muted">
        Delivery, setup, damage waiver and sales tax are added to your balance, as shown on your quote. Questions about a charge? Message us from the event and we&apos;ll sort it out.
      </p>
    </div>
  );
}
