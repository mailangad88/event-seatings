"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

// Makes a personal share link (/?ref=<code>) and offers one-tap ways to send it.
export function ReferForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    }).catch(() => null);
    const json = await res?.json().catch(() => null);
    if (res?.ok && json?.url) {
      setUrl(json.url);
      track("referral_link_created");
      return setStatus("done");
    }
    setError(json?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    const message = `Planning an event? I found Beyond Chiavari: every Chicago event rental (chairs, tables, linens, tents) on one quote. ${url}`;
    const enc = encodeURIComponent(message);
    return (
      <div className="card grid gap-5 p-6 sm:p-8">
        <p className="display-3">Your share link</p>
        <div className="flex flex-wrap gap-2">
          <input readOnly value={url} className="field min-w-0 flex-1 font-mono text-sm" aria-label="Your referral link" onFocus={(e) => e.currentTarget.select()} />
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigator.clipboard?.writeText(url).then(() => setCopied(true)).catch(() => {})}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="btn-ghost btn-sm" href={`sms:?&body=${enc}`}>Text it</a>
          <a className="btn-ghost btn-sm" href={`https://wa.me/?text=${enc}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a className="btn-ghost btn-sm" href={`mailto:?subject=${encodeURIComponent("Event rentals in Chicago")}&body=${enc}`}>Email</a>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button type="button" className="btn-ghost btn-sm" onClick={() => navigator.share({ text: message, url }).catch(() => {})}>
              More…
            </button>
          )}
        </div>
        <p className="hint">Anyone who opens your link in the next 90 days and asks for a quote is credited to you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card grid gap-5 p-6 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="label">Your name</span>
          <input name="name" required maxLength={80} className="field" autoComplete="name" />
        </label>
        <label className="grid gap-1.5">
          <span className="label">Your email</span>
          <input name="email" type="email" required maxLength={254} className="field" autoComplete="email" />
        </label>
      </div>
      {status === "error" && <p className="text-sm text-rose">{error}</p>}
      <div>
        <button className="btn-primary" disabled={status === "sending"}>{status === "sending" ? "Making your link…" : "Get my share link"}</button>
      </div>
      <p className="hint">Same email, same link: you can come back for it any time.</p>
    </form>
  );
}
