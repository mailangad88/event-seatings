import type { Metadata } from "next";
import Link from "@/components/Link";
import { AdminHeader, Empty } from "@/components/admin/AdminUi";
import { OfficeTabs, pickTab } from "@/components/office/OfficeTabs";
import { Icon } from "@/components/ui/Icon";
import { levelBadge, levelLabel, type AdminAlert } from "@/lib/admin-alerts";
import { adminSnapshot } from "@/lib/admin-snapshot";
import { ago } from "@/lib/admin-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

const levels = ["needs", "urgent", "decision", "info", "done"] as const;
const areas = ["", "customers", "vendors", "money", "events", "site"] as const;
const areaLabel: Record<string, string> = { "": "Everything", customers: "Customers", vendors: "Rental partners", money: "Money", events: "Events", site: "Website" };

export default async function AlertsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const tab = pickTab(sp.tab, levels);
  const area = pickTab(sp.area, areas);
  const { alerts, counts } = await adminSnapshot();
  const inArea = area ? alerts.filter((a) => a.area === area) : alerts;
  const shown = inArea.filter((a) => (tab === "needs" ? a.level === "urgent" || a.level === "decision" : a.level === tab));

  return (
    <div className="container-x space-y-6 py-8">
      <AdminHeader
        group="Daily"
        title="Notifications"
        intro="Everything the site noticed: problems to fix, calls only you can make, heads-ups, and things that went through on their own. Each one clears itself once the job is done."
      />
      <OfficeTabs
        base="/admin/alerts"
        current={tab}
        keep={{ area: area || undefined }}
        tabs={[
          { id: "needs", label: "Needs you", count: counts.needYou, tone: counts.urgent ? "rose" : "amber" },
          { id: "urgent", label: "Fix now", count: counts.urgent, tone: "rose" },
          { id: "decision", label: "Your call", count: counts.decision, tone: "amber" },
          { id: "info", label: "Heads-ups", count: counts.info },
          { id: "done", label: "Handled", count: counts.done },
        ]}
      />
      <div className="flex flex-wrap gap-2 text-sm">
        {areas.map((a) => {
          const q = new URLSearchParams();
          if (tab !== "needs") q.set("tab", tab);
          if (a) q.set("area", a);
          const s = q.toString();
          return (
            <Link key={a || "all"} href={s ? `/admin/alerts?${s}` : "/admin/alerts"} className={a === area ? "chip-active" : "chip"}>
              {areaLabel[a]}
            </Link>
          );
        })}
      </div>
      <section className="office-card p-2 sm:p-4">
        {shown.length === 0 ? (
          <div className="p-4"><Empty>Nothing here right now.</Empty></div>
        ) : (
          <ul className="divide-y divide-line">{shown.map((a) => <Row key={a.id} a={a} />)}</ul>
        )}
      </section>
    </div>
  );
}

function Row({ a }: { a: AdminAlert }) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-2 py-3">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className={levelBadge[a.level]}>{levelLabel[a.level]}</span>
          <span className="font-medium">{a.title}</span>
        </p>
        <p className="mt-1 text-sm text-muted">{a.detail}</p>
      </div>
      <span className="flex items-center gap-1 text-xs text-muted"><Icon name="clock" size={14} />{ago(a.at)}</span>
      <Link href={a.href} className="btn-ghost btn-sm">{a.action ?? "Open"}</Link>
    </li>
  );
}
