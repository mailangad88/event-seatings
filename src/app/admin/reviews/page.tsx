import type { Metadata } from "next";
import Link from "@/components/Link";
import { render } from "@react-email/render";
import { createElement } from "react";
import { ReviewRequestEmail } from "@/emails/templates";
import { Stars } from "@/components/reviews/Stars";
import { displayName, listReviews, reviewToken, type Review } from "@/lib/reviews";
import { site } from "@/lib/site";
import { listLeads } from "@/lib/store";
import { moderateReview } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews", robots: { index: false } };

const tabs = [
  { id: "pending", label: "Waiting" },
  { id: "approved", label: "Published" },
  { id: "hidden", label: "Hidden" },
] as const;

function ReviewRow({ r }: { r: Review }) {
  return (
    <li className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Stars rating={r.rating} />
          <span className="font-medium">{r.name}</span>
          <span className="text-sm text-muted">shown as {displayName(r.name)}</span>
          {r.verified && <span className="badge">Verified booking</span>}
          {r.lead_id && !r.verified && <span className="badge">From review link</span>}
        </div>
        <span className="text-sm text-muted">{new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" })}</span>
      </div>
      {r.title && <p className="mt-3 font-heading font-semibold text-xl">{r.title}</p>}
      <p className="mt-2 leading-7 whitespace-pre-line">{r.body}</p>
      <p className="mt-2 text-sm text-muted">
        {[r.event_type, r.city, r.event_month, r.email].filter(Boolean).join(" · ")}
        {r.lead_id && <> · <Link href={`/admin/leads/${r.lead_id}`} className="text-accent">lead</Link></>}
      </p>
      <form action={moderateReview} className="mt-4 grid gap-3">
        <input type="hidden" name="id" value={r.id} />
        <label className="grid gap-1.5">
          <span className="label">Public reply (optional)</span>
          <textarea name="owner_reply" rows={2} defaultValue={r.owner_reply ?? ""} className="field" />
        </label>
        <div className="flex flex-wrap gap-2">
          <button name="status" value="approved" className="btn-primary btn-sm">{r.status === "approved" ? "Save reply" : "Publish"}</button>
          {r.status !== "hidden" && <button name="status" value="hidden" className="btn-ghost btn-sm">Hide</button>}
          {r.status !== "pending" && <button name="status" value="pending" className="btn-ghost btn-sm">Back to waiting</button>}
        </div>
      </form>
    </li>
  );
}

export default async function AdminReviewsPage(props: PageProps<"/admin/reviews">) {
  const sp = await props.searchParams;
  const tab = tabs.find((t) => t.id === sp.tab)?.id ?? "pending";
  const [reviews, leads] = await Promise.all([listReviews(), listLeads().catch(() => [])]);
  const shown = reviews.filter((r) => r.status === tab);
  const reviewed = new Set(reviews.map((r) => r.lead_id).filter(Boolean));
  // Customers to ask: booked or completed leads that haven't reviewed yet.
  const askable = leads.filter((l) => (l.status === "completed" || l.status === "booked") && !reviewed.has(l.id)).slice(0, 30);
  const sample = await render(createElement(ReviewRequestEmail, { name: "Sam", link: `${site.url}/reviews/write?t=…` }));

  return (
    <div className="container-x py-12">
      <p className="eyebrow">Grow</p>
      <h1 className="display-2 mt-1">Reviews</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Reviews from /reviews/write wait here until you publish them. Publish everything real, including critical reviews; hide only spam,
        abuse or other people&apos;s personal details. You can&apos;t edit wording, only reply.
      </p>

      <nav className="mt-8 flex gap-2">
        {tabs.map((t) => (
          <Link key={t.id} href={`/admin/reviews?tab=${t.id}`} className={t.id === tab ? "chip-active" : "chip"}>
            {t.label} ({reviews.filter((r) => r.status === t.id).length})
          </Link>
        ))}
      </nav>
      <ul className="mt-6 grid gap-4">
        {shown.length ? shown.map((r) => <ReviewRow key={r.id} r={r} />) : <li className="text-muted">Nothing here.</li>}
      </ul>

      <section className="mt-16">
        <h2 className="display-2">Ask a customer for a review</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Booked and completed leads without a review. Each link is personal: a review sent through it is tied to the lead and marked
          &quot;Verified booking&quot; when the lead is booked or completed. Nothing is emailed automatically; use the Email button to send it yourself.
        </p>
        {askable.length ? (
          <ul className="mt-6 grid gap-3">
            {askable.map((l) => {
              const t = reviewToken(l.id);
              const link = t ? `${site.url}/reviews/write?t=${t}` : "";
              const body = `Hi ${l.name?.split(" ")[0] ?? "there"},\n\nThank you for booking your event rentals through ${site.name}. Would you share an honest review? It takes two minutes and helps other Chicago planners:\n\n${link}\n\nGood or bad, we publish real reviews only and reply to every one.\n\nThank you,\n${site.name}`;
              return (
                <li key={l.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                  <span>
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name ?? l.email}</Link>
                    <span className="text-sm text-muted"> · {l.event_date ?? "no date"} · {l.status}</span>
                  </span>
                  {link ? (
                    <span className="flex flex-wrap gap-2">
                      <input readOnly value={link} className="field w-72 text-xs" aria-label="Review link" />
                      <a className="btn-ghost btn-sm" href={`mailto:${l.email}?subject=${encodeURIComponent("How did your event rentals go?")}&body=${encodeURIComponent(body)}`}>Email</a>
                    </span>
                  ) : (
                    <span className="text-sm text-rose">Set ADMIN_PASSWORD or REVIEW_LINK_SECRET to make review links.</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-6 text-muted">No booked or completed leads waiting for a review request.</p>
        )}
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-accent">Preview the branded review-request email</summary>
          <iframe title="Review request email preview" srcDoc={sample} className="mt-4 h-[640px] w-full max-w-2xl rounded-2xl border border-line bg-white" />
        </details>
      </section>
    </div>
  );
}
