import type { Vendor } from "@/data/vendors";
import { partnerStatusLabel, type VendorPartner } from "@/lib/store";
import { CopyButton } from "./CopyButton";

const tone: Record<string, string> = {
  signed: "bg-sage text-white",
  talking: "bg-gold-soft text-ink",
  contacted: "bg-gold-soft text-ink",
  declined: "bg-surface-2 text-muted line-through",
  not_contacted: "bg-surface-2 text-muted",
};

export function PartnerBadge({ status }: { status?: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone[status ?? "not_contacted"] ?? tone.not_contacted}`}>
      {partnerStatusLabel(status)}
    </span>
  );
}

const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
const mapsHref = (a: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`;

// Everything needed to reach a vendor: who to ask for, how to call or email them, where they are,
// and (with `order`) a one-tap email or copy of the order for this lead.
export function VendorContact({
  vendor,
  partner,
  order,
  subject,
  compact,
}: {
  vendor: Pick<Vendor, "id" | "name"> & Partial<Vendor>;
  partner?: VendorPartner;
  order?: string;
  subject?: string;
  compact?: boolean;
}) {
  const email = partner?.contact_email || vendor.email;
  const mainPhone = vendor.phone;
  const direct = partner?.contact_phone && partner.contact_phone !== mainPhone ? partner.contact_phone : undefined;
  const mailto =
    email && `mailto:${email}?subject=${encodeURIComponent(subject ?? "Rental availability")}${order ? `&body=${encodeURIComponent(`Hi${partner?.contact_name ? ` ${partner.contact_name.split(" ")[0]}` : ""},\n\n${order}\n\nThank you,\nBeyond Chiavari`)}` : ""}`;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <PartnerBadge status={partner?.status} />
        {vendor.priceTransparency && <span className="text-xs text-muted">Prices: {vendor.priceTransparency.replace(/-/g, " ")}</span>}
      </div>
      <dl className="grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1">
        <dt className="text-muted">Ask for</dt>
        <dd>
          {partner?.contact_name ? (
            <>
              <strong>{partner.contact_name}</strong>
              {partner.contact_role && <span className="text-muted"> · {partner.contact_role}</span>}
            </>
          ) : (
            <span className="text-muted">Rentals desk (no named contact yet, add one in Vendors)</span>
          )}
        </dd>
        {mainPhone && (
          <>
            <dt className="text-muted">Phone</dt>
            <dd>
              <a href={telHref(mainPhone)} className="text-accent">{mainPhone}</a>
              {direct && <> · direct <a href={telHref(direct)} className="text-accent">{direct}</a></>}
            </dd>
          </>
        )}
        {!mainPhone && direct && (
          <>
            <dt className="text-muted">Phone</dt>
            <dd><a href={telHref(direct)} className="text-accent">{direct}</a></dd>
          </>
        )}
        <dt className="text-muted">Email</dt>
        <dd className="[overflow-wrap:anywhere]">
          {email ? <a href={`mailto:${email}`} className="text-accent">{email}</a> : <span className="text-muted">None published, use phone or website form</span>}
        </dd>
        {vendor.website && (
          <>
            <dt className="text-muted">Website</dt>
            <dd className="[overflow-wrap:anywhere]">
              <a href={vendor.website} target="_blank" rel="noopener" className="text-accent">{vendor.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a>
            </dd>
          </>
        )}
        {(vendor.address || vendor.city) && (
          <>
            <dt className="text-muted">Address</dt>
            <dd>
              <a href={mapsHref(vendor.address ?? `${vendor.name} ${vendor.city}`)} target="_blank" rel="noopener" className="text-accent">
                {vendor.address ?? vendor.city}
              </a>
            </dd>
          </>
        )}
        {!compact && vendor.serviceArea?.length ? (
          <>
            <dt className="text-muted">Serves</dt>
            <dd>{vendor.serviceArea.join(", ")}</dd>
          </>
        ) : null}
        {partner?.referral_terms && (
          <>
            <dt className="text-muted">Our deal</dt>
            <dd>{partner.referral_terms}</dd>
          </>
        )}
        {!compact && vendor.notes && (
          <>
            <dt className="text-muted">Notes</dt>
            <dd className="text-muted">{vendor.notes}</dd>
          </>
        )}
      </dl>
      {order && (
        <div className="flex flex-wrap gap-2 pt-1">
          {mainPhone && <a href={telHref(partner?.contact_phone || mainPhone)} className="btn-primary btn-sm">Call {partner?.contact_name?.split(" ")[0] ?? "vendor"}</a>}
          {mailto && <a href={mailto} className="btn-ghost btn-sm">Email this order</a>}
          <CopyButton text={order} />
        </div>
      )}
    </div>
  );
}
