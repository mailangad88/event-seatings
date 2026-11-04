import type { Metadata } from "next";
import Link from "next/link";
import { vendors } from "@/data/catalog";
import { Empty, FeePill, StagePill } from "@/components/admin/AdminUi";
import { TaskList } from "@/components/admin/TaskList";
import { Bars, Ring, Trend } from "@/components/office/Charts";
import { OfficeTabs, pickTab } from "@/components/office/OfficeTabs";
import { Icon } from "@/components/ui/Icon";
import { levelBadge, levelLabel, type AdminAlert, type AlertLevel } from "@/lib/admin-alerts";
import { adminSnapshot } from "@/lib/admin-snapshot";
import { addDays, ago, chicagoDay, eventLine, isClosed, isConfirmed, isoDaysAgo, money0, prettyDay, stage, TZ } from "@/lib/admin-view";
import { allTasks } from "@/lib/event-tasks";
import type { Lead } from "@/lib/store";
import { markContacted } from "./leads/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Today", robots: { index: false } };

const vendorName = (id?: string) => vendors.find((v) => v.id === id)?.name;
const scoreRank = (l: Lead) => ({ A: 0, B: 1, C: 2 })[l.lead_score as "A" | "B" | "C"] ?? 3;

function greeting() {
  const h = Number(new Date().toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function LeadRow({ l, right, action }: { l: Lead; right?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <Link href={`/admin/leads/${l.id}`} className="font-medium text-ink hover:text-accent">{l.name || l.email}</Link>
        {l.lead_score && <span className="ml-2 text-xs text-muted" title={l.lead_score_reasons}>{l.lead_score}</span>}
        <p className="text-xs text-muted">{[eventLine(l), l.event_date && prettyDay(l.event_date)].filter(Boolean).join(" · ") || l.kind}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        {right}
        {action}
      </div>
    </li>
  );
}

const levelIcon: Record<AlertLevel, "alert" | "help" | "info" | "check"> = { urgent: "alert", decision: "help", info: "info", done: "check" };
const levelWell: Record<AlertLevel, string> = { urgent: "bg-rose-soft text-rose", decision: "bg-amber-soft text-amber", info: "bg-blue-soft text-blue", done: "bg-green-soft text-green" };

function DecisionRow({ a }: { a: AdminAlert }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${levelWell[a.level]}`}>
        <Icon name={levelIcon[a.level]} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{a.title}</p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span className="truncate">{a.detail}</span>
          <span className={levelBadge[a.level]}>{levelLabel[a.level]}</span>
        </p>
      </div>
      <span className="hidden shrink-0 text-xs text-muted sm:inline">{ago(a.at)}</span>
      <Link href={a.href} className={`${a.level === "urgent" ? "btn-primary" : "btn-ghost"} btn-sm shrink-0`}>{a.action ?? "Open"}</Link>
    </li>
  );
}

function NoteRow({ a }: { a: AdminAlert }) {
  return (
    <li className="flex gap-3 py-2.5">
      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${levelWell[a.level]}`}>
        <Icon name={levelIcon[a.level]} size={14} />
      </span>
      <Link href={a.href} className="min-w-0 flex-1 hover:text-accent">
        <p className="text-sm leading-snug">{a.title}</p>
        <p className="truncate text-xs text-muted">{a.detail}</p>
        <p className="text-xs text-muted">{ago(a.at)}</p>
      </Link>
    </li>
  );
}

const workTabs = ["todo", "new", "followups", "events", "unpaid"] as const;
const noteTabs = ["all", "urgent", "decision", "done"] as const;

export default async function TodayPage(props: PageProps<"/admin">) {
  const sp = await props.searchParams;
  const tab = pickTab(sp.tab, workTabs);
  const nTab = pickTab(sp.n, noteTabs);
  const { leads, partners, alerts, counts } = await adminSnapshot();
  const today = chicagoDay();
  const weekEnd = addDays(today, 7);
  const people = leads.filter((l) => l.kind !== "partner");

  const fresh = people.filter((l) => stage(l) === "new").sort((a, b) => scoreRank(a) - scoreRank(b) || a.created_at.localeCompare(b.created_at));
  const due = people.filter((l) => !isClosed(l) && l.follow_up_at && l.follow_up_at <= today).sort((a, b) => a.follow_up_at!.localeCompare(b.follow_up_at!));
  const thisWeek = people.filter((l) => l.event_date && l.event_date >= today && l.event_date <= weekEnd && stage(l) !== "lost").sort((a, b) => a.event_date!.localeCompare(b.event_date!));
  const unpaid = people.filter((l) => l.proposal_token && (l.fee_status ?? "unpaid") === "unpaid");
  const tasksDue = allTasks(people, partners, today).filter((t) => t.due <= today);

  const dayAgo = isoDaysAgo(1);
  // Briefing: what went through on its own in the last day, and what needs the owner.
  const handled = alerts.filter((a) => a.level === "done" && a.at >= dayAgo);
  const decisions = alerts.filter((a) => a.level === "urgent" || a.level === "decision");
  const notes = nTab === "all" ? alerts : alerts.filter((a) => a.level === nTab || (nTab === "done" && a.level === "info"));

  // Charts.
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const perDay = days.map((d) => ({ label: i18nDay(d, d === today), value: people.filter((l) => chicagoDay(l.created_at) === d).length }));
  const open = people.filter((l) => !["lost", "completed", "future_season"].includes(stage(l)));
  const pipe = [
    { label: "New", value: open.filter((l) => stage(l) === "new").length, tone: "amber" as const },
    { label: "Talking", value: open.filter((l) => ["contacted", "consult_booked"].includes(stage(l))).length, tone: "blue" as const },
    { label: "Quote sent", value: open.filter((l) => stage(l) === "quote_sent").length, tone: "wine" as const },
    { label: "Booked", value: open.filter((l) => isConfirmed(l) || l.fee_status === "paid").length, tone: "green" as const },
  ];
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(today, (i - 7) * 7));
  const feesByWeek = weeks.map((start) => {
    const end = addDays(start, 7);
    return people.filter((l) => l.fee_status === "paid" && l.fee_paid_at && chicagoDay(l.fee_paid_at) > start && chicagoDay(l.fee_paid_at) <= end).reduce((s, l) => s + (l.fee_amount ?? 0), 0);
  });
  const month = today.slice(0, 7);
  const feesMonth = people.filter((l) => l.fee_status === "paid" && l.fee_paid_at && chicagoDay(l.fee_paid_at).startsWith(month)).reduce((s, l) => s + (l.fee_amount ?? 0), 0);
  const quoteValueOpen = open.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0);

  const tabs = [
    { id: "todo", label: "Calls, emails and checks", count: tasksDue.length, tone: "amber" as const },
    { id: "new", label: "New people", count: fresh.length, tone: "rose" as const },
    { id: "followups", label: "Follow-ups", count: due.length, tone: "amber" as const },
    { id: "events", label: "Next 7 days", count: thisWeek.length },
    { id: "unpaid", label: "Waiting on payment", count: unpaid.length },
  ];

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold tracking-widest text-muted uppercase">{prettyDay(today, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{greeting()}, {(process.env.ADMIN_NAME ?? "Angad").split(" ")[0]}</h1>
      </div>

      <section className="briefing-band tone-dark rounded-2xl p-6 text-ink shadow-lift sm:p-8" aria-label="Briefing">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gold uppercase">
          <Icon name="spark" size={14} /> Last 24 hours
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {handled.length} thing{handled.length === 1 ? "" : "s"} went through on their own.{" "}
          <span className="text-gold-bright">{counts.needYou} need{counts.needYou === 1 ? "s" : ""} you.</span>
        </p>
        {handled.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-3">
            {handled.slice(0, 3).map((a) => (
              <li key={a.id}>
                <Link href={a.href} className="flex max-w-xs items-center gap-2 rounded-xl bg-surface/60 px-3 py-2 text-sm hover:bg-surface">
                  <Icon name="check" size={16} className="shrink-0 text-green" />
                  <span className="truncate">{a.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="office-card min-w-0 p-5 xl:col-span-2" aria-labelledby="decide">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="decide" className="text-lg font-semibold">
              Needs your decision <span className="ml-1 rounded-full bg-surface-2 px-2 text-sm tabular-nums">{decisions.length}</span>
            </h2>
            <Link href="/admin/alerts" className="text-sm text-accent">View all →</Link>
          </div>
          <p className="text-xs text-muted">Problems first, then the calls only you can make. Each one clears itself once it&apos;s done.</p>
          {decisions.length === 0 ? (
            <div className="mt-6"><Empty>Nothing waiting on you. Enjoy the quiet.</Empty></div>
          ) : (
            <ul className="mt-2 divide-y divide-line">{decisions.slice(0, 6).map((a) => <DecisionRow key={a.id} a={a} />)}</ul>
          )}
        </section>

        <section className="office-card min-w-0 p-5" aria-labelledby="notes">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="notes" className="text-lg font-semibold">Notifications</h2>
            <Link href="/admin/alerts" className="text-sm text-accent">All →</Link>
          </div>
          <div className="mt-3">
            <OfficeTabs
              base="/admin"
              param="n"
              current={nTab}
              keep={{ tab: tab === "todo" ? undefined : tab }}
              label="Notification filter"
              tabs={[
                { id: "all", label: "All", count: alerts.length },
                { id: "urgent", label: "Fix now", count: counts.urgent, tone: "rose" },
                { id: "decision", label: "Your call", count: counts.decision, tone: "amber" },
                { id: "done", label: "Updates" },
              ]}
            />
          </div>
          {notes.length === 0 ? (
            <div className="mt-4"><Empty>Nothing here.</Empty></div>
          ) : (
            <ul className="mt-2 max-h-96 divide-y divide-line overflow-y-auto">{notes.slice(0, 12).map((a) => <NoteRow key={a.id} a={a} />)}</ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <section className="office-card p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">New requests · last 7 days</h2>
            <Link href="/admin/reports" className="text-xs text-accent">Report →</Link>
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{perDay.reduce((s, d) => s + d.value, 0)}</p>
          <div className="mt-3"><Bars data={perDay} label="New requests per day, last 7 days" /></div>
        </section>
        <section className="office-card p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Open pipeline</h2>
            <Link href="/admin/pipeline" className="text-xs text-accent">Board →</Link>
          </div>
          <div className="mt-4"><Ring parts={pipe} center={String(open.length)} sub="open" label="Open customers by stage" /></div>
          <p className="mt-3 text-xs text-muted">{money0(quoteValueOpen)} in open quotes</p>
        </section>
        <section className="office-card p-5 md:col-span-2 xl:col-span-1">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Booking fees · this month</h2>
            <Link href="/admin/payments" className="text-xs text-accent">Payments →</Link>
          </div>
          <p className="mt-2 text-3xl font-semibold text-green tabular-nums">{money0(feesMonth)}</p>
          <div className="mt-4"><Trend values={feesByWeek} tone="green" label="Booking fees per week, last 8 weeks" /></div>
          <p className="mt-2 text-xs text-muted">Weekly fees, last 8 weeks</p>
        </section>
      </div>

      <section className="office-card min-w-0 p-5" aria-labelledby="work">
        <h2 id="work" className="text-lg font-semibold">Today&apos;s work</h2>
        <div className="mt-3">
          <OfficeTabs base="/admin" current={tab} tabs={tabs} keep={{ n: nTab === "all" ? undefined : nTab }} label="Today's work" />
        </div>
        <div className="mt-4">
          {tab === "todo" &&
            (tasksDue.length === 0 ? (
              <Empty>Nothing due today. Booked events get reminder calls, emails and vendor checks here as their dates get close.</Empty>
            ) : (
              <TaskList tasks={tasksDue} today={today} />
            ))}

          {tab === "new" &&
            (fresh.length === 0 ? (
              <Empty>Everyone has had a reply.</Empty>
            ) : (
              <ul className="divide-y divide-line">
                {fresh.slice(0, 20).map((l) => (
                  <LeadRow
                    key={l.id}
                    l={l}
                    right={<span className="text-xs text-muted">{ago(l.created_at)}{l.quote_subtotal ? ` · ${money0(l.quote_subtotal)}` : ""}</span>}
                    action={
                      <form action={markContacted}>
                        <input type="hidden" name="id" value={l.id} />
                        <button type="submit" className="btn-ghost btn-sm">Mark contacted</button>
                      </form>
                    }
                  />
                ))}
              </ul>
            ))}

          {tab === "followups" &&
            (due.length === 0 ? (
              <Empty>No follow-ups due. Set a follow-up date on any lead and it shows up here on that day.</Empty>
            ) : (
              <ul className="divide-y divide-line">
                {due.slice(0, 20).map((l) => (
                  <LeadRow
                    key={l.id}
                    l={l}
                    right={
                      <>
                        <span className={`text-xs ${l.follow_up_at! < today ? "text-rose" : "text-muted"}`}>{l.follow_up_at! < today ? `Overdue since ${prettyDay(l.follow_up_at)}` : "Today"}</span>
                        <StagePill status={l.status} />
                      </>
                    }
                  />
                ))}
              </ul>
            ))}

          {tab === "events" &&
            (thisWeek.length === 0 ? (
              <Empty>No events in the next week.</Empty>
            ) : (
              <ul className="divide-y divide-line">
                {thisWeek.map((l) => {
                  const partner = vendorName(l.assigned_vendor);
                  return (
                    <li key={l.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold tracking-wider text-blue uppercase">{prettyDay(l.event_date)}</p>
                        <Link href={`/admin/leads/${l.id}`} className="font-medium hover:text-accent">{l.name || l.email}</Link>
                        <p className="text-xs text-muted">{[eventLine(l), l.venue].filter(Boolean).join(" · ")}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs">
                        <StagePill status={l.status} />
                        <span className={partner ? "text-muted" : "text-rose"}>{partner ?? "No rental partner yet"}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ))}

          {tab === "unpaid" &&
            (unpaid.length === 0 ? (
              <Empty>No proposals waiting. Create one from a lead with a priced quote.</Empty>
            ) : (
              <ul className="divide-y divide-line">
                {unpaid
                  .sort((a, b) => (a.proposal_created_at ?? "").localeCompare(b.proposal_created_at ?? ""))
                  .slice(0, 20)
                  .map((l) => (
                    <LeadRow
                      key={l.id}
                      l={l}
                      right={
                        <>
                          <span className="text-xs text-muted">sent {ago(l.proposal_created_at)}</span>
                          <span className="tabular-nums">{money0(l.fee_amount)}</span>
                          <FeePill status={l.fee_status} />
                        </>
                      }
                    />
                  ))}
              </ul>
            ))}
        </div>
      </section>
    </div>
  );
}

function i18nDay(d: string, isToday: boolean) {
  return isToday ? "Today" : prettyDay(d, { weekday: "short" });
}
