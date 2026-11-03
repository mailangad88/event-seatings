"use client";

import { useEffect, useState } from "react";
import { trackLead } from "@/lib/analytics";
import { attributionFields } from "@/lib/attribution";

type File = { label: string; file: string; format: string; note: string };

const eventTypes = [
  "Wedding",
  "Birthday party",
  "Baby or bridal shower",
  "Graduation party",
  "Corporate event",
  "Gala or fundraiser",
  "Quinceañera",
  "Bar or bat mitzvah",
  "South Asian wedding",
  "Religious or cultural celebration",
  "Holiday party",
  "Backyard party",
  "Memorial or celebration of life",
  "Other",
];

const remembered = "dl-email";

/**
 * Email gate for a free download. The email is saved as a lead tagged `download:<slug>` (plus where the
 * visitor came from) before the links appear. Returning visitors get their email prefilled.
 */
export function DownloadGate({
  slug,
  title,
  files,
  compact = false,
  placement = "page",
}: {
  slug: string;
  title: string;
  files: File[];
  compact?: boolean;
  /** Where the form sits, added to the lead source so the CRM can tell landing pages from in-post offers. */
  placement?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(remembered);
      // Restoring a value from browser storage after mount is the intended effect here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setEmail(saved);
    } catch {
      // Storage blocked: the visitor just types their email.
    }
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const source = `download:${slug}${placement === "page" ? "" : `@${placement}`}`;
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...attributionFields(),
        ...data,
        kind: "waitlist",
        source,
        message: `Downloaded: ${title}`,
      }),
    }).catch(() => null);
    if (res?.ok) {
      try {
        localStorage.setItem(remembered, String(data.email ?? ""));
      } catch {
        // Not critical.
      }
      trackLead("waitlist", source, { download: slug });
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-gold/40 bg-surface p-6" role="status">
        <p className="eyebrow">Your download is ready</p>
        <p className="mt-2 font-serif text-2xl">{title}</p>
        <ul className="mt-5 space-y-3">
          {files.map((f) => (
            <li key={f.file}>
              <a href={f.file} download className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3 hover:border-gold">
                <span>
                  <span className="block font-medium">{f.label}</span>
                  <span className="block text-sm text-muted">{f.note}</span>
                </span>
                <span className="btn-accent btn-sm shrink-0">Download {f.format}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted">
          Save the files now. Ready to price your rentals? <a className="link" href="/quote">Build a quote</a> or{" "}
          <a className="link" href="/book">book a free planning call</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className="eyebrow">Free download</p>
      <p className="mt-2 font-serif text-2xl">Get the {title}</p>
      <p className="mt-1 text-sm text-muted">
        {files.map((f) => f.format).filter((v, i, a) => a.indexOf(v) === i).join(" + ")} · Instant access, no account needed.
      </p>
      <div className={`mt-5 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Email address</span>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2"
            autoComplete="email"
          />
        </label>
        {!compact && (
          <label className="block text-sm">
            <span className="mb-1 block text-muted">First name (optional)</span>
            <input name="name" type="text" className="w-full rounded-lg border border-line bg-bg px-3 py-2" autoComplete="given-name" />
          </label>
        )}
        <label className="block text-sm">
          <span className="mb-1 block text-muted">What are you planning?</span>
          <select name="event_type" className="w-full rounded-lg border border-line bg-bg px-3 py-2" defaultValue="">
            <option value="">Choose one (optional)</option>
            {eventTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        {!compact && (
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Event date (optional)</span>
            <input name="event_date" type="date" className="w-full rounded-lg border border-line bg-bg px-3 py-2" />
          </label>
        )}
      </div>
      <button className="btn-accent mt-5 w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send me the free download"}
      </button>
      {status === "error" && <p className="mt-2 text-sm text-rose">{error}</p>}
      <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted">
        <input type="checkbox" name="email_consent" value="yes" className="mt-0.5 accent-[var(--gold)]" />
        <span>
          Also send me occasional planning tips. Unsubscribe in one click. See our <a className="link" href="/privacy">privacy policy</a>.
        </span>
      </label>
    </form>
  );
}
