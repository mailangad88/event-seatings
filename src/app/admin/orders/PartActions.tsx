import { CopyButton } from "@/components/admin/CopyButton";
import { chicagoDay, money2, prettyDay } from "@/lib/admin-view";
import { mailto } from "@/lib/event-tasks";
import type { VendorPart } from "@/lib/orders";
import type { Lead, VendorPartner } from "@/lib/store";
import { partEmail, vendorConfirmUrl } from "@/lib/vendor-confirm";
import { createPartLink, markPartAction } from "./actions";

// Link buttons for one rental partner's part: make the link, or copy it and open an email draft.
export function PartLinkActions({ lead, part, partner }: { lead: Lead; part: VendorPart; partner?: VendorPartner }) {
  if (!part.vendorId) return <span className="text-xs text-muted">Pick a rental partner first</span>;
  const token = part.order?.token;
  const fresh = !token || part.state === "declined" || part.state === "no_link";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {fresh ? (
        <form action={createPartLink}>
          <input type="hidden" name="id" value={lead.id} />
          <input type="hidden" name="vendor" value={part.vendorId} />
          <button type="submit" className="btn-primary btn-sm">{token && part.state === "no_link" ? "Mark link sent" : token ? "Make a new link" : "Create link"}</button>
        </form>
      ) : null}
      {token && part.state !== "declined" && <CopyButton text={vendorConfirmUrl(token)} label="Copy link" />}
      <a href={mailto(partEmail(lead, part, partner?.contact_email))} className="btn-ghost btn-sm">Email draft</a>
    </div>
  );
}

// Delivered / picked up / paid toggles for one part.
export function PartMarks({ lead, part }: { lead: Lead; part: VendorPart }) {
  if (!part.vendorId) return null;
  const o = part.order;
  const items = [
    { mark: "delivered", label: "Delivered", on: o?.status === "delivered" || o?.status === "picked_up" },
    { mark: "picked_up", label: "Picked up", on: o?.status === "picked_up" },
    { mark: "paid", label: "Paid", on: !!o?.paid_at },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((m) => (
        <form key={m.mark} action={markPartAction}>
          <input type="hidden" name="id" value={lead.id} />
          <input type="hidden" name="vendor" value={part.vendorId} />
          <input type="hidden" name="mark" value={m.mark} />
          <input type="hidden" name="on" value={m.on ? "0" : "1"} />
          <button type="submit" className={m.on ? "chip-active" : "chip"} aria-pressed={m.on}>{m.on ? `${m.label} ✓` : `Mark ${m.label.toLowerCase()}`}</button>
        </form>
      ))}
    </div>
  );
}

// What the rental partner said: windows and total, the reason for a no, or how far the link got.
export function PartDetails({ part }: { part: VendorPart }) {
  const o = part.order;
  if (!o) return <span className="text-muted">Nothing sent yet</span>;
  if (o.answer === "no") return <span>{o.decline_reason || "No reason given"}</span>;
  if (o.answer === "yes")
    return (
      <ul className="space-y-0.5">
        <li>Delivery: {[prettyDay(o.delivery_date), o.delivery_window].filter(Boolean).join(", ")}</li>
        <li>Pickup: {[prettyDay(o.pickup_date), o.pickup_window].filter(Boolean).join(", ")}</li>
        {o.vendor_total !== undefined && <li>Their total: {money2(o.vendor_total)}</li>}
        {o.note && <li className="text-muted">{o.note}</li>}
      </ul>
    );
  return <span className="text-muted">{o.opened_at ? `Opened ${prettyDay(chicagoDay(o.opened_at))}` : o.sent_at ? `Link made ${prettyDay(chicagoDay(o.sent_at))}` : "Link not sent yet"}</span>;
}
