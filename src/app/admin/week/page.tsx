import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Empty, StagePill } from "@/components/admin/AdminUi";
import { TaskList } from "@/components/admin/TaskList";
import { addDays, chicagoDay, eventLine, isClosed, prettyDay, stage } from "@/lib/admin-view";
import { listBlockedDates } from "@/lib/availability";
import { allTasks } from "@/lib/event-tasks";
import { listLeads, listPartners } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "This week", robots: { index: false } };

export default async function WeekPage(props: PageProps<"/admin/week">) {
  const sp = await props.searchParams;
  const today = chicagoDay();
  const span = sp.days === "14" ? 14 : 7;
  const end = addDays(today, span - 1);
  const [leads, partners, blocked] = await Promise.all([listLeads(), listPartners(), listBlockedDates(today)]);
  const people = leads.filter((l) => l.kind !== "partner");
  const tasks = allTasks(people, partners, today);
  const overdue = tasks.filter((t) => t.due < today);
  const followUps = people.filter((l) => !isClosed(l) && l.follow_up_at && l.follow_up_at <= end);

  const days = Array.from({ length: span }, (_, i) => addDays(today, i)).map((d) => ({
    day: d,
    events: people.filter((l) => l.event_date === d && stage(l) !== "lost"),
    tasks: tasks.filter((t) => t.due === d),
    followUps: followUps.filter((l) => (d === today ? l.follow_up_at! <= d : l.follow_up_at === d)),
    blocked: blocked.find((b) => b.date === d),
  }));
  const total = overdue.length + days.reduce((s, d) => s + d.tasks.length + d.followUps.length, 0);

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Daily"
        title="This week"
        intro={`Everything to cover from ${prettyDay(today)} to ${prettyDay(end)}: events, reminder calls, emails, rental partner checks and follow-ups. ${total} to-do${total === 1 ? "" : "s"} in all.`}
        actions={
          <>
            <Link href="/admin/week" className={span === 7 ? "chip-active" : "chip"}>7 days</Link>
            <Link href="/admin/week?days=14" className={span === 14 ? "chip-active" : "chip"}>14 days</Link>
          </>
        }
      />

      {overdue.length > 0 && (
        <section className="card mt-8 border-rose/40 p-6">
          <h2 className="font-serif text-2xl text-rose">Overdue</h2>
          <TaskList tasks={overdue} today={today} />
        </section>
      )}

      <div className="mt-8 space-y-6">
        {days.map((d) => {
          const empty = !d.events.length && !d.tasks.length && !d.followUps.length && !d.blocked;
          return (
            <section key={d.day} className={`card p-6 ${empty ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-2xl">
                  {d.day === today ? "Today" : d.day === addDays(today, 1) ? "Tomorrow" : prettyDay(d.day, { weekday: "long" })}
                  <span className="ml-2 text-base text-muted">{prettyDay(d.day, { month: "short", day: "numeric" })}</span>
                </h2>
                {d.blocked && <span className="rounded bg-rose px-2 py-0.5 text-xs text-white">Blocked{d.blocked.reason ? `: ${d.blocked.reason}` : ""}</span>}
              </div>
              {empty && <div className="mt-2"><Empty>Nothing planned.</Empty></div>}
              {d.events.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-xs tracking-wider text-muted uppercase">Events</h3>
                  <ul className="mt-1 divide-y divide-line">
                    {d.events.map((l) => (
                      <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                        <span>
                          <Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link>
                          <span className="text-muted"> · {[eventLine(l), l.venue].filter(Boolean).join(" · ")}</span>
                        </span>
                        <StagePill status={l.status} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {d.tasks.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-xs tracking-wider text-muted uppercase">To-dos</h3>
                  <TaskList tasks={d.tasks} today={today} showDue={false} />
                </div>
              )}
              {d.followUps.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-xs tracking-wider text-muted uppercase">Follow-ups you set</h3>
                  <ul className="mt-1 space-y-1 text-sm">
                    {d.followUps.map((l) => (
                      <li key={l.id}>
                        <Link href={`/admin/leads/${l.id}`} className="text-accent">{l.name || l.email}</Link>
                        <span className="text-muted"> · {[eventLine(l), l.follow_up_at! < today && `was due ${prettyDay(l.follow_up_at)}`].filter(Boolean).join(" · ")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
