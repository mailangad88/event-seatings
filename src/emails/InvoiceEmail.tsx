import { Text } from "@react-email/components";
import { usd } from "@/lib/catalog-types";
import type { Invoice } from "@/lib/invoices";
import { brand, CtaButton, Divider, EmailLayout, Heading, P } from "./Layout";

const statusColor: Record<string, string> = { paid: "#2f6b3f", due: brand.brass, overdue: "#9c3b3b", upcoming: brand.muted };
const statusWord: Record<string, string> = { paid: "Paid", due: "Due now", overdue: "Overdue", upcoming: "Upcoming" };

/** The invoice sent from /admin/invoices/order/<id>: this order's total and payment schedule, status per stage. */
export function InvoiceEmail({ number, invoice, name, eventLabel, viewUrl }: { number: string; invoice: Invoice; name?: string; eventLabel?: string; viewUrl: string }) {
  const next = invoice.stages.find((s) => s.status !== "paid");
  return (
    <EmailLayout preview={`Invoice ${number} · ${usd(invoice.total, 0)}${next ? ` · ${usd(next.amount - next.paidAmount)} ${statusWord[next.status].toLowerCase()}` : ""}`}>
      <Heading>Your invoice</Heading>
      <P>{name ? `Hi ${name},` : "Hi,"} here is the invoice for your order{eventLabel ? ` (${eventLabel})` : ""}.</P>
      <Text style={{ fontSize: 12, color: brand.muted, margin: "0 0 16px" }}>Invoice {number}</Text>

      <table width="100%" cellPadding={0} cellSpacing={0} style={{ fontSize: 14, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "6px 0", color: brand.muted }}>Rentals</td>
            <td style={{ padding: "6px 0", textAlign: "right" }}>{usd(invoice.rentals)}</td>
          </tr>
          {invoice.fees.map((f) => (
            <tr key={f.label}>
              <td style={{ padding: "6px 0", color: brand.muted }}>{f.label}</td>
              <td style={{ padding: "6px 0", textAlign: "right" }}>{usd(f.amount)}</td>
            </tr>
          ))}
          <tr>
            <td style={{ padding: "10px 0 6px", borderTop: `1px solid ${brand.line}`, fontWeight: 600 }}>Total</td>
            <td style={{ padding: "10px 0 6px", borderTop: `1px solid ${brand.line}`, textAlign: "right", fontWeight: 600 }}>{usd(invoice.total)}</td>
          </tr>
        </tbody>
      </table>

      <Divider />
      <Text style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px", color: brand.ink }}>Payment schedule</Text>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ fontSize: 14, borderCollapse: "collapse" }}>
        <tbody>
          {invoice.stages.map((s, i) => (
            <tr key={i}>
              <td style={{ padding: "6px 0", color: brand.ink }}>
                {s.label}
                {s.dueDate && <div style={{ fontSize: 11, color: brand.muted }}>Due {s.dueDate}</div>}
              </td>
              <td style={{ padding: "6px 0", textAlign: "right", color: brand.ink }}>{usd(s.amount)}</td>
              <td style={{ padding: "6px 0 6px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: statusColor[s.status] }}>{statusWord[s.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {next ? (
        <P>
          <strong>{usd(next.amount - next.paidAmount)}</strong> is {next.status === "overdue" ? "overdue" : "due"}
          {next.dueDate ? ` ${next.dueDate}` : " now"}.
        </P>
      ) : (
        <P>This order is paid in full. Thank you!</P>
      )}
      <CtaButton href={viewUrl}>View your order</CtaButton>
      <P muted>Questions about anything here? Just reply to this email.</P>
    </EmailLayout>
  );
}
