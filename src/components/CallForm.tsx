"use client";

import { trackLead } from "@/lib/analytics";
import { OwnerCard } from "./OwnerCard";
import { attributionFields } from "@/lib/attribution";
import { useState } from "react";
import { site } from "@/lib/site";
import { postLead } from "@/lib/lead-client";

const times = ["Weekday morning", "Weekday afternoon", "Weekday evening", "Weekend", "Any time"];
// Guest count as a dropdown (a qualifying question); the value is the band's midpoint, used for lead scoring.
const guestBands: [string, string][] = [
  ["Under 50", "35"],
  ["50 to 99", "75"],
  ["100 to 199", "150"],
  ["200 to 299", "250"],
  ["300 or more", "350"],
];
const eventTypes = ["Wedding", "Corporate event", "Gala or fundraiser", "Party or celebration", "Cultural or religious event", "Other"];

export function CallForm({ source = "book-page" }: { source?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const { best_time, ...rest } = data;
    setStatus("sending");
    const res = await postLead({
      ...attributionFields(),
      ...rest,
      message: [best_time && `Best time to call: ${best_time}`, rest.message].filter(Boolean).join("\n"),
      kind: "call",
      source,
    }).catch(() => null);
    if (res?.ok) {
      trackLead("call", source);
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="border border-line bg-surface px-6 py-14 text-center sm:px-12">
        <p className="eyebrow justify-center">Call requested</p>
        <h2 className="display-2 mt-6">
          Talk <em className="text-gold">soon</em>.
        </h2>
        <p className="mx-auto mt-5 max-w-md leading-8 text-muted">
          We&apos;ll reach out within one business day to set a time that suits you. Questions before then?{" "}
          <a href={`mailto:${site.email}`} className="underline decoration-gold underline-offset-4">{site.email}</a>
        </p>
        <OwnerCard source="call-thanks" compact className="mx-auto mt-8 max-w-md" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label className="label" htmlFor="call_name">Full name</label>
        <input id="call_name" name="name" required autoComplete="name" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="call_phone">Phone</label>
        <input id="call_phone" name="phone" type="tel" required autoComplete="tel" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="call_email">Email</label>
        <input id="call_email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="call_time">Best time to call</label>
        <select id="call_time" name="best_time" className="field" defaultValue="Any time">
          {times.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="call_type">Occasion</label>
        <select id="call_type" name="event_type" className="field" defaultValue="">
          <option value="" disabled>Select</option>
          {eventTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="call_date">Event date, if known</label>
        <input id="call_date" name="event_date" type="date" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="call_guests">Guest count</label>
        <select id="call_guests" name="guest_count" className="field" defaultValue="">
          <option value="">Not sure yet</option>
          {guestBands.map(([label, value]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted">
          <input type="checkbox" name="sms_consent" value="yes" className="mt-0.5 accent-[var(--gold)]" />
          <span>You can text me to set the time. Message and data rates may apply; reply STOP to opt out.</span>
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="call_msg">What would you like to talk through?</label>
        <textarea
          id="call_msg"
          name="message"
          rows={3}
          className="field resize-none"
          placeholder="Guest count, venue, ceremony and reception flip, a look you're after…"
        />
      </div>
      <div className="sm:col-span-2">
        {status === "error" && <p className="mb-4 text-sm text-rose">{error}</p>}
        <button className="btn-primary w-full sm:w-auto" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Request my call"}
        </button>
        <p className="mt-4 text-sm text-muted">Free, no obligation, and we never share your number.</p>
      </div>
    </form>
  );
}
