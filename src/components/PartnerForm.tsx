"use client";

import { useState } from "react";
import { attributionFields } from "@/lib/attribution";
import { track } from "@/lib/analytics";

export const partnerCategories = [
  "Chairs",
  "Tables",
  "Linens",
  "Dinnerware & glassware",
  "Tents",
  "Lounge furniture",
  "Lighting & decor",
  "Dance floors & staging",
  "Concessions & games",
  "Photo booths",
  "AV & sound",
  "Restrooms & power",
  "Fencing & crowd control",
];

// Vendor sign-up on /partners. Saved as a "partner" lead so it shows in /admin/leads as a vendor application.
// Not counted as a customer lead in analytics (it fires its own event, not generate_lead).
export function PartnerForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const picked = form.getAll("categories").map(String);
    const message = [
      `Company: ${form.get("company") ?? ""}`,
      form.get("role") ? `Role: ${form.get("role")}` : "",
      form.get("site") ? `Website: ${form.get("site")}` : "",
      picked.length ? `Categories: ${picked.join(", ")}` : "",
      form.get("area") ? `Service area: ${form.get("area")}` : "",
      form.get("notes") ? `Notes: ${form.get("notes")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...attributionFields(),
        kind: "partner",
        source: "partners",
        event_type: "Vendor application",
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        venue: form.get("company"),
        city: form.get("area"),
        message,
        website: form.get("website"),
      }),
    }).catch(() => null);
    if (res?.ok) {
      track("partner_application", { categories: picked.join(",") });
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="card p-8" role="status">
        <p className="display-3">Thanks, we&apos;ve got your details.</p>
        <p className="mt-3 leading-7 text-muted">
          Angad will call you within one business day to confirm your service area and price sheet, and send the
          one-page Founding Partner agreement. If a customer enquiry fits your inventory before then, we&apos;ll send it
          straight over.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label className="label" htmlFor="p-company">Company name</label>
        <input id="p-company" name="company" required className="field" autoComplete="organization" />
      </div>
      <div>
        <label className="label" htmlFor="p-site">Website, optional</label>
        <input id="p-site" name="site" className="field" placeholder="yourcompany.com" />
      </div>
      <div>
        <label className="label" htmlFor="p-name">Your name</label>
        <input id="p-name" name="name" required className="field" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="p-role">Role, optional</label>
        <input id="p-role" name="role" className="field" placeholder="Owner, sales manager…" />
      </div>
      <div>
        <label className="label" htmlFor="p-email">Email for new leads</label>
        <input id="p-email" name="email" type="email" required className="field" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="p-phone">Phone</label>
        <input id="p-phone" name="phone" type="tel" required className="field" autoComplete="tel" />
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="label">What do you rent?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {partnerCategories.map((c) => (
            <label key={c} className="chip cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold-soft">
              <input type="checkbox" name="categories" value={c} className="sr-only" />
              {c}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="p-area">Where do you deliver?</label>
        <input id="p-area" name="area" className="field" placeholder="Chicago, North Shore, western suburbs…" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="p-notes">Anything else, optional</label>
        <textarea
          id="p-notes"
          name="notes"
          rows={3}
          className="field resize-none"
          placeholder="Dates you'd like filled, order minimums, specialty items…"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
        <p className="hint max-w-md">Free to join. No monthly fee, no exclusivity, cancel any time.</p>
        <button className="btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Apply as a partner"}
        </button>
      </div>
      {status === "error" && <p className="text-sm text-rose sm:col-span-2">{error}</p>}
    </form>
  );
}
