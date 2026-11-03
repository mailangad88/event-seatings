import Link from "next/link";
import type { LeadAlert, Row } from "@/lib/lead-alert";

// The full picture of one enquiry on /admin/leads/[id]: what to do first, what they care about, every page they
// visited and button they clicked, consent, and earlier enquiries from the same email. Same data as the alert email.

const toneClass = { good: "text-green-700 dark:text-green-400", bad: "font-semibold text-red-700 dark:text-red-400", note: "text-muted" };

function Rows({ rows }: { rows: Row[] }) {
  return (
    <dl className="text-sm">
      {rows.map((r) => (
        <div key={r.label + r.value} className="grid grid-cols-[9rem_1fr] gap-3 border-b border-line py-2 last:border-0">
          <dt className="text-muted">{r.label}</dt>
          <dd className={`min-w-0 [overflow-wrap:anywhere] whitespace-pre-line ${r.tone ? toneClass[r.tone] : ""}`}>
            {r.href ? <a href={r.href} className="text-accent">{r.value}</a> : r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function LeadOutreach({ alert: a }: { alert: LeadAlert }) {
  return (
    <section className="card p-6" aria-labelledby="outreach">
      <h2 id="outreach" className="font-serif text-2xl">What to do first</h2>
      <p className="mt-3 text-sm leading-6"><strong>Next step:</strong> {a.outreach.nextStep}</p>
      {a.outreach.warning && <p className="mt-3 rounded-lg bg-gold/15 px-3 py-2 text-sm">{a.outreach.warning}</p>}
      <p className="mt-3 border-l-2 border-gold bg-bg px-4 py-3 text-sm leading-6">
        <span className="text-muted">Opener to adapt: </span>
        {a.outreach.opener}
      </p>
      <div className="mt-4"><Rows rows={a.outreach.rows} /></div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="eyebrow">Consent</h3>
          <div className="mt-2"><Rows rows={a.consent} /></div>
        </div>
        <div>
          <h3 className="eyebrow">Qualifying</h3>
          <div className="mt-2"><Rows rows={a.qualifying} /></div>
        </div>
      </div>
      {a.interests.length > 0 && (
        <div className="mt-6">
          <h3 className="eyebrow">What they seem most interested in</h3>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {a.interests.slice(0, 10).map((i) => (
              <li key={i.kind + i.key} className="chip" title={`${i.kind}, ${i.score} points`}>
                {i.href ? <Link href={i.href} target="_blank">{i.label}</Link> : i.label}
                <span className="ml-1 text-muted">{i.kind === "category" ? "rentals" : i.kind}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {a.earlier.length > 0 && (
        <div className="mt-6">
          <h3 className="eyebrow">Earlier enquiries from this email</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {a.earlier.map((e) => (
              <li key={e.id}>
                <span className="text-muted">{e.when} · </span>
                <Link href={`/admin/leads/${e.id}`} className="text-accent">{e.what}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function LeadJourney({ alert: a }: { alert: LeadAlert }) {
  const j = a.journey;
  return (
    <section className="card p-6" aria-labelledby="pages-visited">
      <h2 id="pages-visited" className="font-serif text-2xl">Pages they visited</h2>
      {!j ? (
        <p className="mt-2 text-sm text-muted">
          No page history for this one. They either said no in the privacy notice, their browser asks sites not to track,
          or they sent the form before this was added.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[["First visit", j.firstVisit], ["Came from", j.cameFrom], ["Visits", j.visits], ["Campaign", j.campaign]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-bg p-3">
                <p className="text-[0.65rem] tracking-widest text-muted uppercase">{k}</p>
                <p className="mt-1 text-sm">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Oldest first · US Central time</p>
          <ol className="mt-2 text-sm">
            {j.steps.map((s) => (
              <li key={s.n} className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 border-b border-line py-2.5 last:border-0">
                <span className={`grid size-6 place-items-center rounded-full text-xs font-bold ${s.submitted ? "bg-gold text-ink" : "bg-ink text-bg"}`}>{s.n}</span>
                <span className="min-w-0">
                  <a href={s.path} target="_blank" rel="noreferrer" className="font-semibold underline">{s.title}</a>
                  {s.landed && <span className="chip ml-2">Landed here</span>}
                  {s.submitted && <span className="chip ml-2 bg-gold/20">Sent the form here</span>}
                  <span className="block text-xs text-muted [overflow-wrap:anywhere]">{s.path}{s.visit > 1 ? ` · visit ${s.visit}` : ""}</span>
                </span>
                <span className="text-xs whitespace-nowrap text-muted">{s.at}</span>
              </li>
            ))}
          </ol>
          {j.clicks.length > 0 && (
            <>
              <h3 className="eyebrow mt-6">What they clicked</h3>
              <ol className="mt-2 space-y-1.5 text-sm">
                {j.clicks.map((c, i) => (
                  <li key={i} className="[overflow-wrap:anywhere]">
                    <span className="text-muted">{c.when} · </span>&ldquo;{c.label}&rdquo;
                    {c.href && <span className="text-muted"> → {c.href}</span>}
                    <span className="text-muted"> on {c.path}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      )}
    </section>
  );
}

export function LeadSource({ alert: a }: { alert: LeadAlert }) {
  return <Rows rows={a.source} />;
}
