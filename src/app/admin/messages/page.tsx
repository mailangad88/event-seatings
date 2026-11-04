import Link from "@/components/Link";
import { AdminHeader, Empty, Panel } from "@/components/admin/AdminUi";
import { listLeads } from "@/lib/store";
import { replyToCustomer } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages · Admin", robots: { index: false, follow: false } };

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

// Conversations from renters' accounts (/account/events/<id>). Newest activity first; unanswered ones on top.
export default async function AdminMessages(props: PageProps<"/admin/messages">) {
  const sp = await props.searchParams;
  const leads = (await listLeads()).filter((l) => l.messages?.length);
  const waiting = (l: (typeof leads)[number]) => l.messages!.at(-1)!.from === "customer";
  leads.sort((a, b) => Number(waiting(b)) - Number(waiting(a)) || b.messages!.at(-1)!.at.localeCompare(a.messages!.at(-1)!.at));
  const open = leads.find((l) => l.id === sp.lead) ?? leads[0];

  return (
    <div className="container-x space-y-6 py-10">
      <AdminHeader group="Customers" title="Messages" intro="Messages renters send from their account. Your reply shows in their account and they get an email saying it's there." />
      {leads.length ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <Panel title={`Conversations (${leads.length})`} className="lg:col-span-2">
            <ul className="divide-y divide-line">
              {leads.map((l) => {
                const last = l.messages!.at(-1)!;
                return (
                  <li key={l.id}>
                    <Link href={`/admin/messages?lead=${l.id}`} className={`block rounded-lg px-2 py-3 ${open?.id === l.id ? "bg-accent-soft" : "hover:bg-surface-2"}`}>
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{l.name ?? l.email}</span>
                        {waiting(l) ? <span className="badge-amber">Needs reply</span> : <span className="text-xs text-muted">{time(last.at)}</span>}
                      </span>
                      <span className="block truncate text-xs text-muted">{[l.event_type, l.event_date].filter(Boolean).join(" · ")}</span>
                      <span className="mt-1 block truncate text-sm text-muted">{last.from === "team" ? "You: " : ""}{last.text}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
          {open && (
            <Panel title={open.name ?? open.email} more={{ href: `/admin/leads/${open.id}`, label: "Open lead" }} className="lg:col-span-3">
              {sp.sent && <p className="mb-3 rounded-lg bg-green-soft px-3 py-2 text-sm text-green">Reply sent.</p>}
              <ol className="max-h-[32rem] space-y-3 overflow-y-auto">
                {open.messages!.map((m, i) => (
                  <li key={i} className={`flex ${m.from === "team" ? "justify-end" : ""}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "team" ? "bg-accent text-accent-ink" : "bg-surface-2"}`}>
                      <p className="whitespace-pre-line">{m.text}</p>
                      <p className={`mt-1 text-xs ${m.from === "team" ? "opacity-80" : "text-muted"}`}>{m.from === "team" ? "Team" : "Customer"} · {time(m.at)}{m.from === "team" && m.read_at ? " · Read" : ""}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <form action={replyToCustomer} className="mt-4">
                <input type="hidden" name="lead" value={open.id} />
                <label htmlFor="reply" className="sr-only">Reply</label>
                <textarea id="reply" name="text" rows={3} required className="field" placeholder="Write a reply" />
                <button className="btn-primary btn-sm mt-2">Send reply</button>
              </form>
            </Panel>
          )}
        </div>
      ) : (
        <Panel title="No messages yet"><Empty>When a renter writes from their account, the conversation shows up here.</Empty></Panel>
      )}
    </div>
  );
}
