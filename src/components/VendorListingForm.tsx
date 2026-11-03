"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

const requests = [
  { id: "remove", label: "Remove my company's items" },
  { id: "correct", label: "Correct a price or item" },
  { id: "partner", label: "Keep the listing and talk about partnering" },
] as const;

// Rental companies asking us to correct or remove items priced from their published rates.
// Saved as a "partner" lead (source vendor-listings) so it lands in /admin/leads with the vendor applications.
export function VendorListingForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [choice, setChoice] = useState<string>("remove");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const label = requests.find((r) => r.id === choice)?.label ?? choice;
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "partner",
        source: "vendor-listings",
        event_type: `Listing request: ${label}`,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        venue: form.get("company"),
        message: [`Request: ${label}`, form.get("details") ? `Details: ${form.get("details")}` : ""].filter(Boolean).join("\n"),
        website: form.get("website"),
      }),
    }).catch(() => null);
    if (res?.ok) {
      track("vendor_listing_request", { request: choice });
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please email us instead.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="card p-8" role="status">
        <p className="display-3">Thanks, we&apos;ve got your request.</p>
        <p className="mt-3 leading-7 text-muted">
          Removals are made within 2 business days and we&apos;ll email you when it&apos;s done. For corrections or partnering,
          Angad will be in touch within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <fieldset className="sm:col-span-2">
        <legend className="label">What would you like us to do?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {requests.map((r) => (
            <label key={r.id} className="chip cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold-soft">
              <input type="radio" name="request" value={r.id} checked={choice === r.id} onChange={() => setChoice(r.id)} className="sr-only" />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="v-company">Company name</label>
        <input id="v-company" name="company" required className="field" autoComplete="organization" />
      </div>
      <div>
        <label className="label" htmlFor="v-name">Your name</label>
        <input id="v-name" name="name" required className="field" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="v-email">Email</label>
        <input id="v-email" name="email" type="email" required className="field" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="v-phone">Phone, optional</label>
        <input id="v-phone" name="phone" type="tel" className="field" autoComplete="tel" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="v-details">Details, optional</label>
        <textarea id="v-details" name="details" rows={3} className="field resize-none" placeholder="Which items or prices, and what's changed" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
        <p className="hint max-w-md">No questions asked. A removal request is all we need.</p>
        <button className="btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send request"}
        </button>
      </div>
      {status === "error" && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
    </form>
  );
}
