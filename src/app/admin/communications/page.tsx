import type { Metadata } from "next";
import Link from "@/components/Link";
import { ActivityEntryBody } from "@/components/admin/ActivityEntry";
import { AdminHeader, Empty, Panel } from "@/components/admin/AdminUi";
import { allCommunications, communicationKinds, type CommunicationKind } from "@/lib/communications";
import { listLeads } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Communications · Admin", robots: { index: false, follow: false } };

const kindLabel: Record<CommunicationKind, string> = { call: "Calls", email: "Emails & quotes", text: "Texts", note: "Notes", vendor: "Vendor updates" };

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

// Every call, voicemail, text, note and email (manual or automatic) across every lead, newest first.
// A single place to see "what did we tell this person" without opening each lead one by one.
export default async function AdminCommunications(props: PageProps<"/admin/communications">) {
  const sp = await props.searchParams;
  const kind = typeof sp.kind === "string" && (communicationKinds as string[]).includes(sp.kind) ? (sp.kind as CommunicationKind) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";

  const leads = await listLeads();
  let rows = allCommunications(leads, kind ? [kind] : communicationKinds);
  if (q) rows = rows.filter((r) => r.entry.text.toLowerCase().includes(q) || (r.lead.name ?? "").toLowerCase().includes(q) || r.lead.email.toLowerCase().includes(q));
  rows = rows.slice(0, 300);

  return (
    <div className="container-x space-y-6 py-10">
      <AdminHeader
        group="Customers"
        title="Communications"
        intro="Every call, voicemail, text, note and email across every lead — exactly what was said and when, newest first."
      />
      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="kind" className="label">Type</label>
          <select id="kind" name="kind" defaultValue={kind ?? ""} className="field">
            <option value="">All types</option>
            {communicationKinds.map((k) => <option key={k} value={k}>{kindLabel[k]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="q" className="label">Search</label>
          <input id="q" name="q" defaultValue={sp.q as string | undefined} className="field" placeholder="Name, email or what was said…" />
        </div>
        <button className="btn-ghost">Filter</button>
      </form>
      <Panel title={`${rows.length}${rows.length === 300 ? "+" : ""} entries`}>
        {rows.length ? (
          <ol className="space-y-4">
            {rows.map((r, i) => (
              <li key={i} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span>
                    <Link href={`/admin/leads/${r.lead.id}`} className="font-semibold text-accent">{r.lead.name || r.lead.email}</Link>
                    <span className="chip ml-2">{r.entry.type.replace("_", "-")}</span>
                  </span>
                  <span className="text-muted">{time(r.entry.at)}</span>
                </div>
                <div className="mt-2">
                  <ActivityEntryBody entry={r.entry} />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <Empty>Nothing logged yet{kind ? ` for ${kindLabel[kind].toLowerCase()}` : ""}.</Empty>
        )}
      </Panel>
    </div>
  );
}
