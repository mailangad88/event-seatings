import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui";
import { site } from "@/lib/site";
import { getVendorApplicationByToken, vendorFacingStatus } from "@/lib/vendor-applications";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your partner application",
  robots: { index: false, follow: false },
};

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" });

// A vendor's own view of their application. The random token in the link is the key, so nothing private is listed
// beyond what they sent us.
export default async function ApplicationStatusPage(props: PageProps<"/partners/status/[token]">) {
  const { token } = await props.params;
  const app = await getVendorApplicationByToken(token);
  if (!app) notFound();

  const now = vendorFacingStatus[app.status];
  const path = ["submitted", "reviewing", "approved"] as const;
  const reached = app.status === "approved" ? 2 : app.status === "submitted" ? 0 : 1;

  return (
    <div className="container-x section-y max-w-3xl">
      <p className="eyebrow">Partner application</p>
      <h1 className="display-2 mt-2">{app.company}</h1>
      <p className="mt-2 text-sm text-muted">Sent {day(app.created_at)} by {app.contact_name}</p>

      <section className="card mt-8 p-6 sm:p-8" aria-labelledby="now">
        <h2 id="now" className="display-3">{now.title}</h2>
        <p className="mt-3 leading-7 text-muted">{now.text}</p>
        {app.status !== "declined" && (
          <ol className="mt-8 grid grid-cols-3 gap-2" aria-label="Application progress">
            {path.map((s, i) => (
              <li key={s}>
                <span className={`block h-1.5 rounded-full ${i <= reached ? "bg-gold" : "bg-surface-2"}`} />
                <span className={`mt-2 block text-xs ${i === reached ? "font-medium text-ink" : "text-muted"}`}>
                  {s === "submitted" ? "Received" : s === "reviewing" ? "Checking details" : "Approved"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="card mt-6 p-6 sm:p-8" aria-labelledby="sent">
        <h2 id="sent" className="display-3">What you sent us</h2>
        <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[180px_1fr]">
          <dt className="text-muted">Rents</dt>
          <dd>{app.categories.join(", ")}</dd>
          <dt className="text-muted">Delivers to</dt>
          <dd>{app.areas.join(", ")}</dd>
          {app.lead_time && (<><dt className="text-muted">Notice needed</dt><dd>{app.lead_time}</dd></>)}
          {!!app.open_days?.length && (<><dt className="text-muted">Delivery days</dt><dd>{app.open_days.join(", ")}</dd></>)}
          <dt className="text-muted">Price list</dt>
          <dd>{app.price_items?.length ? `${app.price_items.length} items uploaded` : app.price_list_url ? "Link sent" : "Not sent yet"}</dd>
          <dt className="text-muted">Photos</dt>
          <dd>{app.photo_permission === "yes" ? "OK to use with credit" : "Use site images"}</dd>
        </dl>
        <p className="mt-6 text-sm text-muted">
          Need to change something? Reply to our email or write to <a href={`mailto:${site.email}`} className="link">{site.email}</a>.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/how-we-work" className="btn-ghost btn-sm">How we work <Icon name="arrow" size={16} /></Link>
        <Link href="/partners/faq" className="btn-ghost btn-sm">Partner questions</Link>
      </div>
    </div>
  );
}
