import { Column, Link, Row, Section, Text } from "@react-email/components";
import { usd } from "@/lib/catalog-types";
import { site } from "@/lib/site";
import type { Lead } from "@/lib/store";
import { brand, CtaButton, Divider, EmailLayout, Heading, P } from "./Layout";

// Every transactional email the site can send, built with React Email. Sending happens in src/lib/notify.ts
// and only when RESEND_API_KEY (and NOTIFY_FROM for customer emails) are set. Previews: /admin/emails.

const unsubscribe = "You're getting this because you asked us something on our website. Reply STOP to get no more emails.";

/** To the owner: a new lead arrived. */
export function OwnerLeadEmail({ lead }: { lead: Lead }) {
  const skip = new Set(["items", "activity", "quote_cost", "id", "email", "name", "phone", "kind"]);
  const rows = Object.entries(lead).filter(
    ([k, v]) => !skip.has(k) && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0),
  );
  return (
    <EmailLayout preview={`New ${lead.kind} lead from ${lead.name ?? lead.email}`}>
      <Heading>New {lead.kind} lead</Heading>
      <P>
        <strong>{lead.name ?? "No name given"}</strong>
        <br />
        <Link href={`mailto:${lead.email}`} style={{ color: brand.brass }}>{lead.email}</Link>
        {lead.phone ? <> · <Link href={`tel:${lead.phone}`} style={{ color: brand.brass }}>{lead.phone}</Link></> : null}
      </P>
      {lead.items?.length ? (
        <Section style={{ backgroundColor: brand.paper, borderRadius: 12, padding: "12px 16px", margin: "0 0 16px" }}>
          {lead.items.map((i) => (
            <Row key={i.id}>
              <Column style={{ fontSize: 13, padding: "3px 0" }}>{i.qty} × {i.name}</Column>
              <Column style={{ fontSize: 13, textAlign: "right" }}>{usd(i.line_total)}</Column>
            </Row>
          ))}
          <Row>
            <Column style={{ fontSize: 13, paddingTop: 8, fontWeight: 700 }}>Quote total</Column>
            <Column style={{ fontSize: 13, paddingTop: 8, textAlign: "right", fontWeight: 700 }}>{usd(lead.quote_subtotal ?? 0)}</Column>
          </Row>
          <Text style={{ fontSize: 12, color: brand.muted, margin: "6px 0 0" }}>
            Vendor cost {usd(lead.quote_cost ?? 0)} · margin {usd((lead.quote_subtotal ?? 0) - (lead.quote_cost ?? 0))}
          </Text>
        </Section>
      ) : null}
      {rows.map(([k, v]) => (
        <Text key={k} style={{ fontSize: 13, lineHeight: "20px", margin: 0 }}>
          <span style={{ color: brand.muted }}>{k.replace(/_/g, " ")}:</span> {Array.isArray(v) ? v.join(", ") : String(v)}
        </Text>
      ))}
      <Divider />
      <CtaButton href={`${site.url}/admin/leads/${lead.id}`}>Open in CRM</CtaButton>
    </EmailLayout>
  );
}

/** To a visitor: the files they unlocked on /downloads. */
export function DownloadEmail({ name, title, files }: { name?: string; title: string; files: { label: string; file: string }[] }) {
  return (
    <EmailLayout preview={`Your free ${title} is ready`} footerNote={unsubscribe}>
      <Heading>Your free {title}</Heading>
      <P>{name ? `Hi ${name},` : "Hi,"} here are your downloads:</P>
      {files.map((f) => (
        <P key={f.file}>
          <Link href={`${site.url}${f.file}`} style={{ color: brand.brass, fontWeight: 600 }}>{f.label} →</Link>
        </P>
      ))}
      <Divider />
      <P>Two things that save planners the most time:</P>
      <P muted>
        1. Price every rental on one list (chairs, tables, linens, tents, dishes) with our{" "}
        <Link href={`${site.url}/quote`} style={{ color: brand.brass }}>quote builder</Link>.
        <br />
        2. Talk it through on a free {site.callLength} <Link href={`${site.url}/book`} style={{ color: brand.brass }}>planning call</Link>.
      </P>
      <CtaButton href={`${site.url}/downloads`}>More free kits</CtaButton>
    </EmailLayout>
  );
}

/** To a customer: we got your quote request. Only sent when CONFIRMATION_EMAILS=on. */
export function QuoteReceivedEmail({ lead, replyPromise }: { lead: Lead; replyPromise: string }) {
  return (
    <EmailLayout preview="We received your rental quote request" footerNote={unsubscribe}>
      <Heading>We have your quote request</Heading>
      <P>
        {lead.name ? `Hi ${lead.name},` : "Hi,"} thanks for planning with {site.name}. Our team {replyPromise} to confirm
        availability and pricing with a local rental company.
      </P>
      {lead.items?.length ? (
        <Section style={{ backgroundColor: brand.paper, borderRadius: 12, padding: "12px 16px", margin: "0 0 16px" }}>
          {lead.items.slice(0, 25).map((i) => (
            <Row key={i.id}>
              <Column style={{ fontSize: 13, padding: "3px 0" }}>{i.qty} × {i.name}</Column>
              <Column style={{ fontSize: 13, textAlign: "right" }}>{usd(i.line_total)}</Column>
            </Row>
          ))}
          <Row>
            <Column style={{ fontSize: 13, paddingTop: 8, fontWeight: 700 }}>Estimated total</Column>
            <Column style={{ fontSize: 13, paddingTop: 8, textAlign: "right", fontWeight: 700 }}>{usd(lead.quote_subtotal ?? 0)}</Column>
          </Row>
          <Text style={{ fontSize: 12, color: brand.muted, margin: "6px 0 0" }}>
            Estimate based on local rental companies&apos; published rates plus our booking fee. Your final quote is confirmed by the rental company.
          </Text>
        </Section>
      ) : null}
      {lead.event_date ? <P muted>Event date: {lead.event_date}{lead.city ? ` · ${lead.city}` : ""}</P> : null}
      <P>While you wait, these free tools help you finish the plan:</P>
      <P muted>
        <Link href={`${site.url}/tools/floor-plan`} style={{ color: brand.brass }}>Seating layout builder</Link> ·{" "}
        <Link href={`${site.url}/tools/event-date${lead.event_date ? `?date=${lead.event_date}` : ""}`} style={{ color: brand.brass }}>
          Weather &amp; sunset for your date
        </Link>
      </P>
      <CtaButton href={`${site.url}/book`}>Book a free planning call</CtaButton>
    </EmailLayout>
  );
}

/** To a past customer, sent by hand from /admin/reviews: asks for an honest review. */
export function ReviewRequestEmail({ name, link }: { name?: string; link: string }) {
  return (
    <EmailLayout preview="How did your event rentals go?" footerNote={unsubscribe}>
      <Heading>How did everything go?</Heading>
      <P>{name ? `Hi ${name},` : "Hi,"} thank you for booking your event rentals through {site.name}.</P>
      <P>
        Would you share an honest review? It takes two minutes, helps other Chicago planners, and tells us what to fix. Good
        or bad, we publish real reviews only, and we reply to every one.
      </P>
      <CtaButton href={link}>Write a review</CtaButton>
    </EmailLayout>
  );
}

/** To the owner: a review is waiting for approval. */
export function NewReviewEmail({ rating, name, body, verified }: { rating: number; name: string; body: string; verified?: boolean }) {
  return (
    <EmailLayout preview={`New ${rating}-star review from ${name}`}>
      <Heading>New {rating}-star review</Heading>
      <P>
        <strong>{name}</strong>
        {verified ? " · verified booking" : ""}
      </P>
      <P muted>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</P>
      <P>{body}</P>
      <Divider />
      <CtaButton href={`${site.url}/admin/reviews`}>Approve or hide</CtaButton>
    </EmailLayout>
  );
}
