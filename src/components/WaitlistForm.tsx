"use client";

import { useState } from "react";

export function WaitlistForm({ source, compact = false }: { source: string; compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, kind: "waitlist", source }),
    }).catch(() => null);
    if (res?.ok) return setStatus("done");
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return <p className="text-sm text-sage">You&apos;re on the list. We&apos;ll be in touch before launch.</p>;
  }

  return (
    <form onSubmit={submit} className={compact ? "flex gap-2" : "flex flex-col gap-3 sm:flex-row"}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="sr-only" htmlFor={`wl-${source}`}>Email</label>
      <input
        id={`wl-${source}`}
        name="email"
        type="email"
        required
        placeholder="you@email.com"
        className="field min-w-0 flex-1"
      />
      <button className="btn-primary shrink-0" disabled={status === "sending"}>
        {status === "sending" ? "Joining…" : "Join"}
      </button>
      {status === "error" && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
