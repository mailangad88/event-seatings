import type { Metadata } from "next";
import Link from "next/link";
import { createElement } from "react";
import { render } from "@react-email/render";
import { DownloadEmail, NewReviewEmail, OwnerLeadEmail, QuoteReceivedEmail, ReviewRequestEmail } from "@/emails/templates";
import { replyPromise, site } from "@/lib/site";
import type { Lead } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Email previews", robots: { index: false } };

// Sample data, clearly fake, only for previewing layouts here. Never shown on the public site.
const sampleLead: Lead = {
  id: "00000000-0000-0000-0000-000000000000",
  kind: "quote",
  created_at: new Date().toISOString(),
  name: "Sample Customer",
  email: "sample@example.com",
  event_date: "2027-06-12",
  guest_count: 120,
  city: "Naperville",
  items: [
    { id: "sample-chair", name: "Sample chair", category: "chairs", unit: "each", qty: 120, unit_price: 9, line_total: 1080, vendor_id: "sample", vendor_price: 8 },
    { id: "sample-table", name: "Sample 72in round table", category: "tables", unit: "each", qty: 12, unit_price: 16.5, line_total: 198, vendor_id: "sample", vendor_price: 15 },
  ],
  quote_subtotal: 1278,
  quote_cost: 1158,
};

export default async function EmailPreviewsPage() {
  const emails = [
    { name: "New lead (to you)", when: "Every form submission, when RESEND_API_KEY and NOTIFY_EMAIL are set.", el: createElement(OwnerLeadEmail, { lead: sampleLead }) },
    { name: "Quote received (to customer)", when: "Only with CONFIRMATION_EMAILS=on, plus RESEND_API_KEY and a verified NOTIFY_FROM.", el: createElement(QuoteReceivedEmail, { lead: sampleLead, replyPromise }) },
    { name: "Free download (to visitor)", when: "When someone unlocks a kit on /downloads, with RESEND_API_KEY and NOTIFY_FROM.", el: createElement(DownloadEmail, { name: "Sample", title: "Wedding Seating Kit", files: [{ label: "Seating chart (PDF)", file: "/downloads/sample.pdf" }] }) },
    { name: "Review request (you send by hand)", when: "Never automatic. Copy from /admin/reviews.", el: createElement(ReviewRequestEmail, { name: "Sample", link: `${site.url}/reviews/write` }) },
    { name: "New review (to you)", when: "When a review is submitted, with RESEND_API_KEY and NOTIFY_EMAIL.", el: createElement(NewReviewEmail, { rating: 5, name: "Sample Customer", body: "Sample review text for layout only.", verified: true }) },
  ];
  const html = await Promise.all(emails.map((e) => render(e.el)));
  return (
    <div className="container-x py-12">
      <Link href="/admin" className="text-sm text-accent">← Dashboard</Link>
      <p className="eyebrow mt-3">Admin</p>
      <h1 className="mt-1 font-serif text-5xl">Email previews</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Branded emails built with React Email (src/emails). Sample data only. Customer emails need a verified sending domain in Resend.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {emails.map((e, i) => (
          <section key={e.name}>
            <h2 className="font-serif text-2xl">{e.name}</h2>
            <p className="mt-1 text-sm text-muted">{e.when}</p>
            <iframe title={`${e.name} preview`} srcDoc={html[i]} className="mt-4 h-[620px] w-full rounded-2xl border border-line bg-white" />
          </section>
        ))}
      </div>
    </div>
  );
}
