"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

const eventTypes = ["Wedding", "Corporate event", "Birthday or anniversary", "Shower", "Graduation", "Holiday party", "Religious or cultural celebration", "Other"];

// Review form for /reviews/write. Reviews are saved as pending and published only after the owner approves them.
export function ReviewForm({ token, defaultName }: { token?: string; defaultName?: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating) {
      setError("Please choose a star rating.");
      return setStatus("error");
    }
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, rating, token }),
    }).catch(() => null);
    if (res?.ok) {
      track("review_submitted", { rating });
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="card p-8 text-center">
        <p className="display-3">Thank you for your review.</p>
        <p className="mt-3 text-muted">We read every review before it appears on the site, usually within two business days.</p>
      </div>
    );
  }

  const shown = hover || rating;
  return (
    <form onSubmit={submit} className="card grid gap-5 p-6 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <fieldset>
        <legend className="label">Your rating</legend>
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={rating === n}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className="text-gold transition-transform hover:scale-110"
            >
              <svg width={34} height={34} viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
                  fill={n <= shown ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="label">Your name</span>
          <input name="name" required maxLength={80} defaultValue={defaultName} className="field" autoComplete="name" />
          <span className="hint">Shown as first name and last initial.</span>
        </label>
        <label className="grid gap-1.5">
          <span className="label">Email</span>
          <input name="email" type="email" required maxLength={254} className="field" autoComplete="email" />
          <span className="hint">Never shown. Only used if we need to reply.</span>
        </label>
        <label className="grid gap-1.5">
          <span className="label">Type of event</span>
          <select name="event_type" className="field" defaultValue="">
            <option value="">Choose one (optional)</option>
            {eventTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="label">Town or neighborhood</span>
          <input name="city" maxLength={80} className="field" placeholder="e.g. Naperville" />
        </label>
        <label className="grid gap-1.5">
          <span className="label">Month of your event</span>
          <input name="event_month" type="month" className="field" />
        </label>
        <label className="grid gap-1.5">
          <span className="label">Headline</span>
          <input name="title" maxLength={120} className="field" placeholder="Sum it up in a few words" />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="label">Your review</span>
        <textarea name="body" required minLength={20} maxLength={3000} rows={6} className="field" placeholder="What did you rent, how did delivery and setup go, and would you book again?" />
      </label>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input type="checkbox" name="consent" value="yes" required className="mt-1" />
        <span>I attended or planned this event, this review is my honest opinion, and Beyond Chiavari may publish it with my first name and last initial.</span>
      </label>
      {status === "error" && <p className="text-sm text-rose">{error}</p>}
      <div>
        <button className="btn-primary" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Submit review"}</button>
      </div>
    </form>
  );
}
