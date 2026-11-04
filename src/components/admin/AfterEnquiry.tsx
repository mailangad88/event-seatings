import Link from "next/link";
import type { ActivityEvent } from "@/lib/activity";

// What a lead did on the site after sending their form (lib/activity.ts): pages, clicks, quote-list changes and
// planner steps, newest first. Shown on /admin/leads/[id] so a follow-up call can pick up where they left off.

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

function describe(e: ActivityEvent) {
  switch (e.t) {
    case "page":
      return { what: "Viewed", detail: e.title?.split(/ [|·–-] /)[0] || e.path, href: e.path };
    case "click":
      return { what: "Clicked", detail: `"${e.label}"${e.href ? ` (${e.href})` : ""}`, href: undefined };
    case "quote_list":
      return { what: "Quote list", detail: e.items.length ? `${e.items.length} item${e.items.length === 1 ? "" : "s"}: ${e.items.slice(0, 6).join(", ")}${e.items.length > 6 ? "…" : ""}` : "Cleared", href: e.items.length ? `/quote?items=${e.items.join(",")}` : undefined };
    case "planner":
      return { what: "Planner", detail: `Reached step ${e.step + 1}${e.occasion ? ` (${e.occasion})` : ""}`, href: undefined };
  }
}

export function AfterEnquiry({ events, since }: { events: ActivityEvent[]; since: string }) {
  const after = events.filter((e) => e.at >= since).reverse();
  return (
    <section className="card p-6" aria-labelledby="after-enquiry">
      <h2 id="after-enquiry" className="font-heading font-semibold text-2xl">Since they sent this</h2>
      {after.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Nothing yet. Visits after the form show here when they come back on the same device and didn&apos;t say no to tracking.
        </p>
      ) : (
        <ol className="mt-4 max-h-96 overflow-y-auto text-sm">
          {after.slice(0, 100).map((e, i) => {
            const d = describe(e);
            return (
              <li key={`${e.at}-${i}`} className="grid grid-cols-[7.5rem_5.5rem_1fr] gap-3 border-b border-line py-2 last:border-0">
                <span className="text-muted tabular-nums">{time(e.at)}</span>
                <span className="text-muted">{d.what}</span>
                <span className="min-w-0 [overflow-wrap:anywhere]">{d.href ? <Link href={d.href} className="text-accent">{d.detail}</Link> : d.detail}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
