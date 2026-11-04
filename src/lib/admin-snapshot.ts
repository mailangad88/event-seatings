import "server-only";
import { cache } from "react";
import { buildAlerts, countAlerts } from "./admin-alerts";
import { chicagoDay, stage } from "./admin-view";
import { buildCallList } from "./call-list";
import { listReviews } from "./reviews";
import { listLeads, listPartners } from "./store";
import { listVendorApplications } from "./vendor-applications";

// One read of everything the back office needs for its sidebar counts, the bell and the Today page.
// Wrapped in React cache(), so the layout and the page share one database round per request.
export const adminSnapshot = cache(async () => {
  const today = chicagoDay();
  const [leads, partners, applications, reviews] = await Promise.all([
    listLeads(),
    listPartners(),
    listVendorApplications().catch(() => []),
    listReviews().catch(() => []),
  ]);
  const alerts = buildAlerts({ leads, partners, applications, reviews, today });
  return {
    today,
    leads,
    partners,
    applications,
    reviews,
    alerts,
    counts: countAlerts(alerts),
    calls: buildCallList(leads, partners, today).length,
    newLeads: leads.filter((l) => l.kind !== "partner" && stage(l) === "new").length,
    pendingApplications: applications.filter((a) => a.status === "submitted").length,
    pendingReviews: reviews.filter((r) => r.status === "pending").length,
  };
});
