import Link from "next/link";
import { completeTask } from "@/app/admin/actions";
import { eventLine, prettyDay } from "@/lib/admin-view";
import { kindLabel, mailto, type EventTask } from "@/lib/event-tasks";

const kindTone: Record<EventTask["kind"], string> = {
  call: "bg-accent text-accent-ink",
  email: "bg-gold-soft text-ink ring-1 ring-gold/40",
  vendor: "bg-sage text-white",
  check: "bg-surface-2 text-ink",
};

// Event to-dos with one-tap actions: call, open the email draft, mark done.
export function TaskList({ tasks, today, showDue = true }: { tasks: EventTask[]; today: string; showDue?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {tasks.map((t) => (
        <li key={`${t.lead.id}-${t.key}`} className="flex flex-wrap items-start justify-between gap-3 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${kindTone[t.kind]}`}>{kindLabel[t.kind]}</span>
              <span className="font-medium">{t.title}</span>
              {showDue && t.due < today && <span className="text-xs text-rose">overdue since {prettyDay(t.due)}</span>}
            </div>
            <p className="mt-1 text-sm">
              <Link href={`/admin/leads/${t.lead.id}`} className="text-accent">{t.lead.name || t.lead.email}</Link>
              <span className="text-muted"> · {[eventLine(t.lead), t.lead.event_date && `event ${prettyDay(t.lead.event_date)}`].filter(Boolean).join(" · ")}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted">{t.detail}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {t.phone && <a href={`tel:${t.phone}`} className="btn-ghost btn-sm">Call</a>}
            {t.email && <a href={mailto(t.email)} className="btn-ghost btn-sm">Email draft</a>}
            <form action={completeTask}>
              <input type="hidden" name="id" value={t.lead.id} />
              <input type="hidden" name="key" value={t.key} />
              <input type="hidden" name="title" value={t.title} />
              <button type="submit" className="btn-primary btn-sm">Done</button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
