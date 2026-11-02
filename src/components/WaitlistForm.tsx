"use client";

import { useState } from "react";

// Email capture. Works on light and dark bands (it uses theme tokens); `dark` is kept for older call sites.
export function WaitlistForm({ source }: { source: string; dark?: boolean }) {
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
    return <p className="font-serif text-xl italic">Thank you. You&apos;re on the list.</p>;
  }

  return (
    <form onSubmit={submit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex gap-2 rounded-full border border-line bg-surface p-1.5 focus-within:border-gold">
        <label className="sr-only" htmlFor={`wl-${source}`}>Email address</label>
        <input
          id={`wl-${source}`}
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-ink placeholder:text-muted focus:ring-0 focus:outline-none"
        />
        <button className="btn-accent btn-sm shrink-0" disabled={status === "sending"}>
          {status === "sending" ? "Joining…" : "Join"}
        </button>
      </div>
      {status === "error" && <p className="mt-2 text-sm text-rose">{error}</p>}
    </form>
  );
}
