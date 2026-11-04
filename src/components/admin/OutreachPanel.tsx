"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

// "Ask what's missing" on the call script: the call opener, an email and a text built from what the lead
// already told us, and their own details link. Everything can be edited before it's sent.

function SendButton() {
  const { pending } = useFormStatus();
  return <button className="btn-primary btn-sm" disabled={pending}>{pending ? "Sending..." : "Send email"}</button>;
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost btn-sm"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }, () => undefined);
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}

export function OutreachPanel({
  leadId,
  opener,
  subject: subject0,
  email: email0,
  text: text0,
  to,
  phone,
  smsOk,
  link,
  canSend,
  asks,
  action,
}: {
  leadId: string;
  opener: string;
  subject: string;
  email: string;
  text: string;
  to?: string;
  phone?: string;
  smsOk: boolean;
  link?: string;
  canSend: boolean;
  asks: string[];
  action: (fd: FormData) => void | Promise<void>;
}) {
  const [tab, setTab] = useState<"call" | "email" | "text">("call");
  const [subject, setSubject] = useState(subject0);
  const [email, setEmail] = useState(email0);
  const [text, setText] = useState(text0);
  const tabs = [
    { id: "call", label: "Call them" },
    { id: "email", label: "Email them" },
    { id: "text", label: "Text them" },
  ] as const;

  return (
    <section id="ask" className="office-card mt-6 scroll-mt-24 p-5 sm:p-6" aria-labelledby="ask-title">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="ask-title" className="text-lg font-semibold">Ask what&apos;s missing</h2>
        <p className="text-xs text-muted">
          {asks.length ? `Asks only: ${asks.join(", ")}` : "Nothing must-have is missing. Use these to confirm and keep in touch."}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`office-tab ${tab === t.id ? "office-tab-on" : ""}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "call" && (
        <div className="mt-4">
          <p className="well p-4 text-sm leading-6"><span className="mr-1 font-semibold">Open with:</span>{opener}</p>
          <p className="mt-2 text-xs text-muted">Then work down the script below. It starts with what&apos;s missing marked in amber.</p>
          {phone && <a href={`tel:${phone}`} className="btn-primary btn-sm mt-3">Call {phone}</a>}
        </div>
      )}

      {tab === "email" && (
        <form action={action} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={leadId} />
          {!to && <p className="rounded-lg bg-amber-soft px-3 py-2 text-sm text-amber">No email on this lead yet. Ask for it on the call, or text them instead.</p>}
          <div>
            <label className="label" htmlFor="ask-subject">Subject</label>
            <input id="ask-subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="ask-body">Email{to ? ` to ${to}` : ""}</label>
            <textarea id="ask-body" name="body" rows={14} value={email} onChange={(e) => setEmail(e.target.value)} className="field resize-y font-mono text-sm" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {to && canSend && <SendButton />}
            {to && (
              <a className={canSend ? "btn-ghost btn-sm" : "btn-primary btn-sm"} href={`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(email)}`}>
                Open in my email app
              </a>
            )}
            <CopyButton text={email} />
          </div>
          <p className="text-xs text-muted">
            {canSend ? "Send email goes out from the site and is logged on the timeline." : "Sending from the site needs RESEND_API_KEY and NOTIFY_FROM in Vercel, so this opens your email app instead. Log it on the lead after."}
          </p>
        </form>
      )}

      {tab === "text" && (
        <div className="mt-4 space-y-3">
          {!smsOk && <p className="rounded-lg bg-amber-soft px-3 py-2 text-sm text-amber">They didn&apos;t tick OK to text. Text only if they asked you to on a call.</p>}
          <textarea aria-label="Text message" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="field resize-y text-sm" />
          <div className="flex flex-wrap gap-2">
            {phone && <a className="btn-primary btn-sm" href={`sms:${phone}?&body=${encodeURIComponent(text)}`}>Open texts</a>}
            <CopyButton text={text} />
          </div>
        </div>
      )}

      {link && (
        <div className="mt-5 border-t border-line pt-4 text-sm">
          <p className="font-medium">Their details link</p>
          <p className="mt-1 text-xs text-muted">Only shows the questions still open. What they send lands on this lead and its timeline, and you get an email.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="max-w-full rounded-lg bg-surface-2 px-2 py-1 text-xs break-all">{link}</code>
            <CopyButton text={link} label="Copy link" />
            <a href={link.replace(/^https?:\/\/[^/]+/, "")} target="_blank" rel="noopener" className="btn-ghost btn-sm">Preview</a>
          </div>
        </div>
      )}
    </section>
  );
}
