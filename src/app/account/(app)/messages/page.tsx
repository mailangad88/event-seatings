import Link from "next/link";
import { Card, PageTitle } from "@/components/account/AccountUi";
import { currentAccount, fmtDay } from "@/lib/account";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

// One conversation per event. Opening it shows the full thread and a reply box.
export default async function AccountMessages() {
  const { events } = (await currentAccount())!;
  return (
    <div className="space-y-6">
      <PageTitle title="Messages" intro="Each event has its own conversation with your coordinator. We pass anything a rental company needs on to them." />
      <Card>
        {events.length ? (
          <ul className="divide-y divide-line">
            {events.map((e) => {
              const last = e.messages.at(-1);
              return (
                <li key={e.id}>
                  <Link href={`/account/events/${e.id}#messages`} className="flex items-center gap-4 py-4 hover:text-accent">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold ${e.unread ? "bg-accent text-accent-ink" : "bg-surface-2 text-ink"}`}>{e.unread || e.messages.length}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-3">
                        <span className={`text-sm ${e.unread ? "font-semibold" : "font-medium"}`}>{e.title}{e.date ? ` · ${fmtDay(e.date)}` : ""}</span>
                        {last && <span className="shrink-0 text-xs text-muted">{fmtDay(last.at.slice(0, 10))}</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted">
                        {last ? `${last.from === "team" ? "Coordinator" : "You"}: ${last.text}` : "No messages yet. Start the conversation."}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Once you send a quote, you can message us about it here.</p>
        )}
      </Card>
    </div>
  );
}
