import type { Metadata } from "next";
import Link from "next/link";
import { createElement } from "react";
import { render } from "@react-email/render";
import { NewReviewEmail, ReviewRequestEmail, TextEmail } from "@/emails/templates";
import { site } from "@/lib/site";

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

export default async function EmailPreviewsPage() {
  const emails = [
    { name: "Any email (branded wrapper)", when: "Every email sendEmail sends (confirmations, downloads, follow-ups, owner alerts) gets this HTML around its plain text.", el: createElement(TextEmail, { subject: "We got your quote request", text: sampleText, unsubscribe: `${site.url}/unsubscribe` }) },
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
