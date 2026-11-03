"use client";

import { useState } from "react";
import Link from "next/link";
import { trackLead } from "@/lib/analytics";
import { attributionFields } from "@/lib/attribution";

// "Get this look": collects an email (plus optional date and guest count) and
// hands the visitor straight to the styling call.
export function LookLeadForm({
  lookSlug,
  lookName,
  chairs,
}: {
  lookSlug: string;
  lookName: string;
  chairs: string[];
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const today = new Date().toLocaleDateString("en-CA");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...attributionFields(),
        ...data,
        // Saved as a waitlist lead; the source marks which look it came from.
        kind: "waitlist",
        chairs,
        message: `Get this look: ${lookName}`,
        source: `look:${lookSlug}`,
      }),
    }).catch(() => null);
    if (res?.ok) {
      trackLead("waitlist", `look:${lookSlug}`);
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="text-center">
        <p className="eyebrow justify-center">It&apos;s on its way</p>
        <p className="headline mt-5 text-4xl leading-tight">
          Your <em className="text-gold">{lookName}</em> look board
        </p>
        <p className="mx-auto mt-4 max-w-sm leading-7 text-muted">
          We&apos;ll email the chairs, linens and florals for this look with pricing for your date. Want it tailored to
          your venue? Grab 15 minutes with us.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href={`/book?from=look-${lookSlug}`} className="btn-primary">
            Book a free 15-min call
          </Link>
        </div>
      </div>
    );
  }

  const id = (n: string) => `${lookSlug}-${n}`;

  return (
    <form onSubmit={submit} className="space-y-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={id("name")}>First name</label>
          <input id={id("name")} name="name" autoComplete="given-name" className="field" placeholder="Your name" />
        </div>
        <div>
          <label className="label" htmlFor={id("email")}>Email</label>
          <input
            id={id("email")}
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="label" htmlFor={id("date")}>Event date (if you have one)</label>
          <input id={id("date")} name="event_date" type="date" min={today} className="field" />
        </div>
        <div>
          <label className="label" htmlFor={id("guests")}>Guests</label>
          <input
            id={id("guests")}
            name="guest_count"
            type="number"
            inputMode="numeric"
            min={1}
            max={5000}
            className="field"
            placeholder="About how many?"
          />
        </div>
      </div>
      <button className="btn-primary w-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send me this look"}
      </button>
      {status === "error" && <p className="text-sm text-rose">{error}</p>}
      <p className="text-center text-xs leading-5 text-muted">
        Free, no obligation. We&apos;ll only email you about your event.
      </p>
    </form>
  );
}
