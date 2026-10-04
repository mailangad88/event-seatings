"use client";

import { useState } from "react";

export function WaitlistForm({ source, dark = false }: { source: string; dark?: boolean }) {
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
    return (
      <p className={`font-serif text-xl italic ${dark ? "text-ink" : "text-ink"}`}>
        Thank you. You&apos;ll hear from us before launch.
      </p>
    );
  }

  return (
    <form onSubmit={submit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className={`flex items-end gap-4 border-b ${dark ? "border-ink/30 focus-within:border-gold" : "border-ink/30 focus-within:border-gold"}`}>
        <label className="sr-only" htmlFor={`wl-${source}`}>Email address</label>
        <input
          id={`wl-${source}`}
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className={`min-w-0 flex-1 border-0 bg-transparent px-0 py-3 text-base focus:ring-0 focus:outline-none ${
            dark ? "text-ink placeholder:text-ink/40" : "text-ink placeholder:text-muted/60"
          }`}
        />
        <button
          className={`shrink-0 py-3 text-[11px] font-medium tracking-[0.25em] uppercase transition-colors ${
            dark ? "text-ink hover:text-gold" : "text-ink hover:text-gold"
          }`}
          disabled={status === "sending"}
        >
          {status === "sending" ? "Joining…" : "Join →"}
        </button>
      </div>
      {status === "error" && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}
