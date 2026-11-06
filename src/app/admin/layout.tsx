import type { Metadata } from "next";
import { headers } from "next/headers";
import { adminNav } from "@/components/admin/AdminNav";
import { OfficeShell } from "@/components/office/OfficeShell";
import type { NavCounts } from "@/components/office/OfficeNav";
import { checkAdmin } from "@/lib/admin-auth";
import { adminSnapshot } from "@/lib/admin-snapshot";

// robots.txt already disallows /admin, but that's advisory only — a crawler that ignores it (or a stray
// inbound link) shouldn't be able to index these pages, so set noindex directly too.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Back office shell: dark sidebar, top bar with lead search and the notifications bell, light canvas.
// The password check lives in src/proxy.ts (pages) and in each Server Action. This layout checks it again
// (before loading any lead data) so a change to the proxy matcher can't quietly open the back office.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") {
    return <p className="mx-auto max-w-xl px-4 py-24 text-center text-muted">Please sign in with the admin password.</p>;
  }
  const snap = await adminSnapshot().catch(() => undefined);
  const counts: NavCounts = {};
  if (snap) {
    const c = snap.counts;
    counts["/admin/alerts"] = { n: c.needYou, tone: c.urgent ? "rose" : "amber" };
    counts["/admin/calls"] = { n: snap.calls, tone: "amber" };
    counts["/admin/leads"] = { n: snap.newLeads, tone: "amber" };
    counts["/admin/applications"] = { n: snap.pendingApplications, tone: "amber" };
    counts["/admin/reviews"] = { n: snap.pendingReviews };
  }
  return (
    <OfficeShell
      portal="Staff"
      root="/admin"
      nav={adminNav}
      counts={counts}
      person={{ name: process.env.ADMIN_NAME ?? "Angad Singh", role: "Owner" }}
      search={{ action: "/admin/leads", placeholder: "Search leads by name, email or phone" }}
      bell={snap ? { href: "/admin/alerts", count: snap.counts.needYou, urgent: snap.counts.urgent > 0 } : undefined}
    >
      {children}
    </OfficeShell>
  );
}
