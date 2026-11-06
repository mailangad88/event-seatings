import type { Metadata } from "next";
import Link from "@/components/Link";
import { createElement } from "react";
import { render } from "@react-email/render";
import { GoogleReviewEmail, NewReviewEmail, ReviewRequestEmail, TextEmail } from "@/emails/templates";
import { InvoiceEmail } from "@/emails/InvoiceEmail";
import { LeadAlertEmail } from "@/emails/LeadAlertEmail";
import { QuoteConfirmationEmail } from "@/emails/QuoteConfirmationEmail";
import { UnfinishedQuoteEmail } from "@/emails/UnfinishedQuoteEmail";
import { buildInvoice } from "@/lib/invoices";
import { buildLeadAlert } from "@/lib/lead-alert";
import { site } from "@/lib/site";
import type { Lead } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Email previews", robots: { index: false } };

// Sample text only, for previewing the layout. The real wording lives in src/lib/notify.ts.
const sampleText = [
  "Hi Sam,",
  "",
  "Thanks, we have your quote request for Sat, Jun 12, 2027 (estimate $1,278).",
  "",
  "What happens next:",
  "1. We check your date with our Chicago-area rental partners.",
  "2. You get a confirmed proposal by email.",
  "",
  `While you wait, draw your floor plan: ${site.url}/tools/floor-plan`,
  "",
  `The ${site.name} team`,
].join("\n");

// Made-up enquiry for previewing the owner alert layout.
const t = (minAgo: number) => new Date(Date.now() - minAgo * 60_000).toISOString();
const sampleLead: Lead = {
  id: "sample",
  kind: "quote",
  created_at: t(0),
  name: "Sample Person",
  email: "sample@example.com",
  phone: "(312) 555-0100",
  event_date: new Date(Date.now() + 75 * 864e5).toISOString().slice(0, 10),
  event_type: "Wedding",
  guest_count: 120,
  city: "Naperville",
  venue: "Backyard",
  source: "planner:wedding-classic",
  call_consent: true,
  email_consent: true,
  visitor_tz: "America/Chicago",
  utm_source: "chatgpt.com",
  utm_medium: "referral",
  page_path: "/quote",
  ip_location: "Naperville, IL, US",
  quote_subtotal: 2180,
  quote_cost: 1982,
  items: [
    { id: "white-resin-folding-chair", name: "White resin folding chair", category: "Chairs", unit: "each", qty: 125, unit_price: 4.4, line_total: 550, vendor_id: "arlington-rental", vendor_price: 4 },
    { id: "frame-tent-30x40", name: "30' x 40' frame tent", category: "Tents", unit: "each", qty: 1, unit_price: 1630, line_total: 1630, vendor_id: "arlington-rental", vendor_price: 1482 },
  ],
  journey: {
    first_seen: t(26),
    visits: 1,
    page_views: 4,
    device: "Phone (iOS)",
    location: "Naperville, IL, US",
    pages: [
      { path: "/events/weddings", title: "Wedding rentals in Chicago", at: t(26), visit: 1 },
      { path: "/rentals/tents", title: "Tent rentals", at: t(22), visit: 1 },
      { path: "/tools/tent-size", title: "Tent size calculator", at: t(17), visit: 1 },
      { path: "/quote", title: "Plan your event", at: t(9), visit: 1 },
    ],
    clicks: [
      { label: "Work out my tent size", href: "/tools/tent-size", path: "/rentals/tents", at: t(18) },
      { label: "Price my whole list", href: "/quote", path: "/tools/tent-size", at: t(10) },
    ],
  },
};

export default async function EmailPreviewsPage() {
  const emails = [
    { name: "New enquiry alert (to you)", when: "Every form, within seconds, with RESEND_API_KEY and NOTIFY_EMAIL. Made-up enquiry.", el: createElement(LeadAlertEmail, { alert: buildLeadAlert(sampleLead, { siteUrl: site.url }), siteUrl: site.url }) },
    {
      name: "Quote confirmation (to the customer)",
      when: "Right after the quote form, with RESEND_API_KEY and NOTIFY_FROM. Made-up quote.",
      el: createElement(QuoteConfirmationEmail, {
        name: sampleLead.name,
        items: sampleLead.items ?? [],
        subtotal: sampleLead.quote_subtotal,
        eventDateLabel: "Fri, Jun 12, 2027",
        guestCount: sampleLead.guest_count,
        viewUrl: `${site.url}/account`,
        unsubscribe: `${site.url}/unsubscribe`,
      }),
    },
    {
      name: "Unfinished quote reminder (to the customer)",
      when: "Daily reminders cron (/admin/reminders), 20 hours to 7 days after they build a list on /quote and don't send it.",
      el: createElement(UnfinishedQuoteEmail, {
        name: sampleLead.name,
        items: (sampleLead.items ?? []).map((l) => ({ id: l.id, name: l.name })),
        link: `${site.url}/quote?items=${(sampleLead.items ?? []).map((l) => l.id).join(",")}&from=reminder`,
        unsubscribe: `${site.url}/unsubscribe`,
      }),
    },
    { name: "Any email (branded wrapper)", when: "Every email sendEmail sends (confirmations, downloads, follow-ups, owner alerts) gets this HTML around its plain text.", el: createElement(TextEmail, { subject: "We got your quote request", text: sampleText, unsubscribe: `${site.url}/unsubscribe` }) },
    { name: "Review request (you send by hand)", when: "Never automatic. Copy from /admin/reviews.", el: createElement(ReviewRequestEmail, { name: "Sample", link: `${site.url}/reviews/write` }) },
    { name: "Google review request (automatic)", when: "5 days after the event, with EVENT_EMAILS_ENABLED=true and NEXT_PUBLIC_GOOGLE_REVIEW_URL set. See /admin/scheduled and /admin/settings.", el: createElement(GoogleReviewEmail, { name: sampleLead.name, link: site.googleReviewUrl || `${site.url}/reviews/write` }) },
    { name: "New review (to you)", when: "When a review is submitted, with RESEND_API_KEY and NOTIFY_EMAIL.", el: createElement(NewReviewEmail, { rating: 5, name: "Sample Customer", body: "Sample review text for layout only.", verified: true }) },
    {
      name: "Invoice (to the customer)",
      when: "Sent by hand from /admin/invoices/order/<id>. Made-up order, deposit already paid.",
      el: createElement(InvoiceEmail, {
        number: "BC-INV-20261106-SAMPLE",
        invoice: buildInvoice({ ...sampleLead, fee_status: "paid", fee_amount: 436 }, 436),
        name: sampleLead.name,
        eventLabel: "Wedding · Fri, Jun 12, 2027",
        viewUrl: `${site.url}/proposal/sample`,
      }),
    },
  ];
  const html = await Promise.all(emails.map((e) => render(e.el)));
  return (
    <div className="container-x py-12">
      <Link href="/admin" className="text-sm text-accent">← Dashboard</Link>
      <p className="eyebrow mt-3">Admin</p>
      <h1 className="display-2 mt-1">Email previews</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Branded emails built with React Email (src/emails). Sample data only. Customer emails need a verified sending domain in Resend.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {emails.map((e, i) => (
          <section key={e.name}>
            <h2 className="display-3">{e.name}</h2>
            <p className="mt-1 text-sm text-muted">{e.when}</p>
            <iframe title={`${e.name} preview`} srcDoc={html[i]} className="mt-4 h-[620px] w-full rounded-2xl border border-line bg-white" />
          </section>
        ))}
      </div>
    </div>
  );
}
