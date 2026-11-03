"use client";

import { useState } from "react";
import Link from "next/link";
import { partnerCategories } from "@/components/PartnerForm";
import { attributionFields } from "@/lib/attribution";
import { track } from "@/lib/analytics";

// Step-by-step vendor self-onboarding on /partners/onboard. Saved as a "partner" lead (source partner-onboard)
// with every answer in the message, so it shows in /admin/leads next to the short /partners application.

const areas = ["Chicago (city)", "North Shore", "Northwest suburbs", "Western suburbs (DuPage)", "Fox Valley (Kane)", "South suburbs", "Southwest suburbs (Will)", "Lake County", "McHenry County", "Northwest Indiana"];
const steps = ["Company", "What and where", "How you work", "Prices and terms"];

type Data = Record<string, string | string[]>;

export function VendorOnboarding({ templateHref }: { templateHref: string }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({ categories: [], areas: [] });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const v = (k: string) => (typeof data[k] === "string" ? (data[k] as string) : "");
  const list = (k: string) => (Array.isArray(data[k]) ? (data[k] as string[]) : []);
  const set = (k: string, val: string | string[]) => setData((d) => ({ ...d, [k]: val }));
  const toggle = (k: string, item: string) => set(k, list(k).includes(item) ? list(k).filter((x) => x !== item) : [...list(k), item]);

  const valid = [
    () => v("company") && v("name") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email")) && v("phone").replace(/\D/g, "").length >= 7,
    () => list("categories").length > 0 && list("areas").length > 0,
    () => !!v("leadTime"),
    () => v("agree") === "yes",
  ];

  async function submit() {
    setStatus("sending");
    const message = [
      `Company: ${v("company")}`,
      v("role") && `Role: ${v("role")}`,
      v("site") && `Website: ${v("site")}`,
      v("years") && `Years in business: ${v("years")}`,
      `Categories: ${list("categories").join(", ")}`,
      `Delivers to: ${list("areas").join(", ")}${v("areaNotes") ? ` (${v("areaNotes")})` : ""}`,
      v("minimum") && `Order minimum: ${v("minimum")}`,
      `Lead time: ${v("leadTime")}`,
      v("setup") && `Setup and teardown: ${v("setup")}`,
      v("weekends") && `Weekends and holidays: ${v("weekends")}`,
      v("priceList") && `Price list: ${v("priceList")}`,
      `Photos: ${v("photos") === "yes" ? "OK to use their product photos with credit" : "Use our renders only"}`,
      v("notes") && `Notes: ${v("notes")}`,
      "Agreed to Founding Partner terms on /partners#terms",
    ]
      .filter(Boolean)
      .join("\n");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...attributionFields(),
        kind: "partner",
        source: "partner-onboard",
        event_type: "Vendor onboarding",
        name: v("name"),
        email: v("email"),
        phone: v("phone"),
        venue: v("company"),
        city: list("areas").join(", ").slice(0, 100),
        message,
        website: v("hp"),
      }),
    }).catch(() => null);
    if (res?.ok) {
      track("partner_application", { categories: list("categories").join(","), source: "onboard" });
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="card p-8" role="status">
        <p className="display-3">You&apos;re in the queue. Thank you.</p>
        <p className="mt-3 leading-7 text-muted">
          We&apos;ll call within one business day to confirm your service area and price sheet and send the one-page Founding Partner agreement. Your listing goes live after you&apos;ve checked it.
        </p>
        <p className="mt-4 text-sm">
          Haven&apos;t sent a price list yet? <a href={templateHref} className="link" download>Download the template</a> and email it to us.
        </p>
      </div>
    );
  }

  const field = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={`vo-${k}`}>{label}</label>
      <input id={`vo-${k}`} className="field" value={v(k)} onChange={(e) => set(k, e.target.value)} {...props} />
    </div>
  );
  const radios = (k: string, label: string, options: string[]) => (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={v(k) === o} onClick={() => set(k, o)} className={`rounded-full border px-4 py-2 text-sm ${v(k) === o ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:border-gold"}`}>
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
  const chips = (k: string, label: string, options: string[]) => (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" role="checkbox" aria-checked={list(k).includes(o)} onClick={() => toggle(k, o)} className={`rounded-full border px-4 py-2 text-sm ${list(k).includes(o) ? "border-gold bg-gold-soft" : "border-line bg-surface hover:border-gold"}`}>
            {list(k).includes(o) ? "✓ " : "+ "}
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <form
      className="card p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid[step]()) return;
        if (step < steps.length - 1) setStep(step + 1);
        else submit();
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value={v("hp")} onChange={(e) => set("hp", e.target.value)} />
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <span className={`block h-1.5 rounded-full ${i <= step ? "bg-gold" : "bg-surface-2"}`} />
            <span className={`mt-2 block text-xs ${i === step ? "font-medium text-ink" : "text-muted"}`}>{i + 1}. {s}</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-5 sm:grid-cols-2">
        {step === 0 && (
          <>
            {field("company", "Company name", { required: true, autoComplete: "organization" })}
            {field("site", "Website", { placeholder: "yourcompany.com" })}
            {field("name", "Your name", { required: true, autoComplete: "name" })}
            {field("role", "Role", { placeholder: "Owner, sales manager…" })}
            {field("email", "Email for new leads", { required: true, type: "email", autoComplete: "email" })}
            {field("phone", "Phone", { required: true, type: "tel", autoComplete: "tel" })}
            {field("years", "Years in business", { inputMode: "numeric" })}
          </>
        )}
        {step === 1 && (
          <>
            <div className="sm:col-span-2">{chips("categories", "What do you rent? Pick all that apply.", partnerCategories)}</div>
            <div className="sm:col-span-2">{chips("areas", "Where do you deliver?", areas)}</div>
            <div className="sm:col-span-2">{field("areaNotes", "Any limits on distance or towns?", { placeholder: "Within 40 miles of Elgin, delivery fee beyond…" })}</div>
          </>
        )}
        {step === 2 && (
          <>
            {field("minimum", "Order minimum, if any", { placeholder: "$250, or none" })}
            <div className="sm:col-span-2">{radios("leadTime", "How much notice do you usually need?", ["Same week", "1-2 weeks", "2-4 weeks", "1 month or more", "Depends on the order"])}</div>
            <div className="sm:col-span-2">{radios("setup", "Do you set up and tear down?", ["Yes, always", "Yes, for a fee", "Delivery only", "Varies by item"])}</div>
            <div className="sm:col-span-2">{radios("weekends", "Weekend and holiday deliveries?", ["Yes", "Extra charge", "No"])}</div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="sm:col-span-2">
              {field("priceList", "Link to your price list or catalog", { placeholder: "A web page, Google Sheet or PDF link" })}
              <p className="hint">
                No public list? <a href={templateHref} className="link" download>Download our price list template</a> (CSV) and email it once you&apos;ve applied.
              </p>
            </div>
            <div className="sm:col-span-2">{radios("photos", "Can we show your product photos, with credit?", ["yes", "no"])}</div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="vo-notes">Anything else</label>
              <textarea id="vo-notes" rows={3} className="field resize-none" value={v("notes")} onChange={(e) => set("notes", e.target.value)} placeholder="Specialty items, dates you'd like filled, blackout dates…" />
            </div>
            <label className="flex gap-3 text-sm leading-6 sm:col-span-2">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--gold)]" checked={v("agree") === "yes"} onChange={(e) => set("agree", e.target.checked ? "yes" : "")} />
              <span>
                I&apos;ve read the <Link href="/partners#terms" className="link">Founding Partner terms</Link> and I&apos;m happy to receive leads. Nothing is binding until we both sign the one-page agreement.
              </span>
            </label>
          </>
        )}
      </div>

      {status === "error" && <p className="mt-4 text-sm text-rose">{error}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>Back</button>
        ) : (
          <span className="hint">Takes about three minutes.</span>
        )}
        <button className="btn-primary" disabled={!valid[step]() || status === "sending"}>
          {step < steps.length - 1 ? "Next" : status === "sending" ? "Sending…" : "Submit and join"}
        </button>
      </div>
    </form>
  );
}
