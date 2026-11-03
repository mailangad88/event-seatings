"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { attributionFields } from "@/lib/attribution";
import { track } from "@/lib/analytics";
import {
  commissionPayOptions,
  depositOptions,
  insuranceOptions,
  leadTimes,
  parsePriceCsv,
  paymentMethods,
  setupOptions,
  vendorAreas,
  vendorCategories,
  weekDays,
  weekendOptions,
  type PriceItem,
} from "@/lib/vendor-application-types";

// Step-by-step vendor sign-up on /partners/onboard. Answers are kept in this browser as a draft until sent,
// then saved by /api/vendor-applications for review in /admin/applications.

const steps = ["Company", "Rentals and area", "Schedule", "Price list", "Payments", "Photos and terms"];
const DRAFT_KEY = "bc-vendor-onboard-v1";

type Data = Record<string, string | string[]>;
const empty: Data = { categories: [], areas: [], open_days: ["Fri", "Sat", "Sun"], payment_methods: [] };
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function VendorOnboarding({ templateHref }: { templateHref: string }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(empty);
  const [items, setItems] = useState<PriceItem[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [statusUrl, setStatusUrl] = useState("");
  const loaded = useRef(false);
  const top = useRef<HTMLFormElement>(null);

  // Restore a draft from this browser, then keep saving it as they type.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of a saved draft after mount
      if (saved?.data) setData({ ...empty, ...saved.data });
      if (Array.isArray(saved?.items)) setItems(saved.items);
      if (typeof saved?.fileName === "string") setFileName(saved.fileName);
      if (typeof saved?.step === "number") setStep(Math.min(saved.step, steps.length - 1));
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current || status === "done") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, items, fileName, step }));
    } catch {}
  }, [data, items, fileName, step, status]);

  const v = (k: string) => (typeof data[k] === "string" ? (data[k] as string) : "");
  const list = (k: string) => (Array.isArray(data[k]) ? (data[k] as string[]) : []);
  const set = (k: string, val: string | string[]) => setData((d) => ({ ...d, [k]: val }));
  const toggle = (k: string, item: string) => set(k, list(k).includes(item) ? list(k).filter((x) => x !== item) : [...list(k), item]);

  const valid = [
    () => !!(v("company") && v("contact_name") && isEmail(v("email")) && v("phone").replace(/\D/g, "").length >= 7),
    () => list("categories").length > 0 && list("areas").length > 0,
    () => !!v("lead_time"),
    () => true,
    () => !v("billing_email") || isEmail(v("billing_email")),
    () => v("agree") === "yes" && !!v("photo_permission"),
  ];

  async function readFile(file: File) {
    setFileError("");
    if (file.size > 2_000_000) return setFileError("That file is over 2 MB. Please send a smaller CSV, or paste a link instead.");
    if (!/\.(csv|txt)$/i.test(file.name)) {
      return setFileError("Please upload a CSV file. In Excel or Google Sheets, use File > Download > CSV. For a PDF, paste a link below or email it to us.");
    }
    const rows = parsePriceCsv(await file.text());
    if (!rows.length) return setFileError("We couldn't find any items in that file. It needs a header row with an item name column, like our template.");
    setItems(rows);
    setFileName(file.name);
  }

  function go(to: number) {
    setStep(to);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit() {
    setStatus("sending");
    const res = await fetch("/api/vendor-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        max_events_per_day: Number(v("max_events_per_day")) || undefined,
        price_items: items,
        agree: v("agree") === "yes",
        source: "partner-onboard",
        page_path: attributionFields().page_path ?? location.pathname,
      }),
    }).catch(() => null);
    if (res?.ok) {
      const json = await res.json().catch(() => ({}));
      track("partner_application", { categories: list("categories").join(","), source: "onboard", price_rows: items.length });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setStatusUrl(json.status_url ?? "");
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="card p-8" role="status">
        <p className="display-3">Thanks. We have your application.</p>
        <p className="mt-3 leading-7 text-muted">
          We&apos;ll call within one business day to go over your service area and prices, then send the one-page partner agreement and a preview of your listing. Nothing goes live until you&apos;ve checked it.
        </p>
        {statusUrl && (
          <p className="mt-4">
            <Link href={statusUrl} className="btn-ghost btn-sm">See your application status</Link>
            <span className="hint mt-2 block">Bookmark that page. We&apos;ve also emailed you the link.</span>
          </p>
        )}
        {!items.length && (
          <p className="mt-4 text-sm">
            Didn&apos;t send prices yet? <a href={templateHref} className="link" download>Download the price list template</a> and email it back to us.
          </p>
        )}
      </div>
    );
  }

  const field = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={`vo-${k}`}>{label}</label>
      <input id={`vo-${k}`} className="field" value={v(k)} onChange={(e) => set(k, e.target.value)} {...props} />
    </div>
  );
  const radios = (k: string, label: string, options: readonly (string | { id: string; label: string })[]) => (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const id = typeof o === "string" ? o : o.id;
          const text = typeof o === "string" ? o : o.label;
          return (
            <button key={id} type="button" aria-pressed={v(k) === id} onClick={() => set(k, id)} className={`rounded-full border px-4 py-2 text-sm ${v(k) === id ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-gold"}`}>
              {text}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
  const chips = (k: string, label: string, options: readonly string[]) => (
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
  const full = "sm:col-span-2";

  return (
    <form
      ref={top}
      className="card scroll-mt-28 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid[step]()) return;
        if (step < steps.length - 1) go(step + 1);
        else submit();
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value={v("hp")} onChange={(e) => set("hp", e.target.value)} />
      <ol className="mb-8 grid grid-cols-6 gap-1.5" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <button type="button" disabled={i > step} onClick={() => go(i)} className="block w-full text-left disabled:cursor-default">
              <span className={`block h-1.5 rounded-full ${i <= step ? "bg-gold" : "bg-surface-2"}`} />
              <span className={`mt-2 hidden text-xs sm:block ${i === step ? "font-medium text-ink" : "text-muted"}`}>{i + 1}. {s}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mb-5 text-sm font-medium sm:hidden">Step {step + 1} of {steps.length}: {steps[step]}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        {step === 0 && (
          <>
            {field("company", "Company name", { required: true, autoComplete: "organization" })}
            {field("website", "Website", { placeholder: "yourcompany.com" })}
            {field("contact_name", "Your name", { required: true, autoComplete: "name" })}
            {field("contact_role", "Your role", { placeholder: "Owner, sales manager…" })}
            {field("email", "Email for new orders", { required: true, type: "email", autoComplete: "email" })}
            {field("phone", "Phone", { required: true, type: "tel", autoComplete: "tel" })}
            {field("years_in_business", "Years in business", { inputMode: "numeric" })}
          </>
        )}
        {step === 1 && (
          <>
            <div className={full}>{chips("categories", "What do you rent? Pick all that apply.", vendorCategories)}</div>
            <div className={full}>{chips("areas", "Where do you deliver?", vendorAreas)}</div>
            <div className={full}>{field("area_notes", "Any limits on distance or towns?", { placeholder: "Within 40 miles of Elgin, extra delivery fee beyond…" })}</div>
          </>
        )}
        {step === 2 && (
          <>
            <div className={full}>{radios("lead_time", "How much notice do you usually need?", leadTimes)}</div>
            <div className={full}>{chips("open_days", "Which days do you deliver?", weekDays)}</div>
            {field("max_events_per_day", "Most events you can handle in one day", { type: "number", min: 1, inputMode: "numeric", placeholder: "e.g. 6" })}
            {field("order_minimum", "Order minimum, if any", { placeholder: "$250, or none" })}
            <div className={full}>{radios("setup", "Do you set up and take down?", setupOptions)}</div>
            <div className={full}>{radios("weekends", "Weekend and holiday deliveries?", weekendOptions)}</div>
            <div className={full}>
              <label className="label" htmlFor="vo-blackout">Dates you&apos;re already full or closed</label>
              <textarea id="vo-blackout" rows={2} className="field resize-none" value={v("blackout_dates")} onChange={(e) => set("blackout_dates", e.target.value)} placeholder="Dec 24-26, every Saturday in June, closed January…" />
              <p className="hint">We won&apos;t send you orders on these dates. You can change them any time.</p>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className={full}>
              <p className="label">Upload your price list (CSV)</p>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-surface-2/40 px-6 py-8 text-center hover:border-gold">
                <span className="font-medium">{fileName ? `Loaded ${fileName}` : "Choose a CSV file"}</span>
                <span className="hint">Columns like our template: category, item name, size, colors, unit, price</span>
                <input type="file" accept=".csv,text/csv,.txt" className="sr-only" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
              </label>
              <p className="hint mt-2">
                <a href={templateHref} className="link" download>Download our template</a>. Fill it in with Excel or Google Sheets and save it as CSV.
              </p>
              {fileError && <p className="mt-2 text-sm text-rose">{fileError}</p>}
            </div>
            {items.length > 0 && (
              <div className={`${full} overflow-x-auto rounded-xl border border-line`}>
                <table className="w-full min-w-[480px] text-sm">
                  <caption className="px-4 pt-3 text-left text-sm font-medium">
                    {items.length} item{items.length === 1 ? "" : "s"} found{items.length > 8 ? ", first 8 shown" : ""}
                  </caption>
                  <thead className="text-left text-muted">
                    <tr><th className="px-4 py-2 font-medium">Item</th><th className="px-4 py-2 font-medium">Category</th><th className="px-4 py-2 font-medium">Unit</th><th className="px-4 py-2 text-right font-medium">Price</th></tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 8).map((r, i) => (
                      <tr key={i} className="border-t border-line">
                        <td className="px-4 py-2">{r.name}</td>
                        <td className="px-4 py-2 text-muted">{r.category ?? ""}</td>
                        <td className="px-4 py-2 text-muted">{r.unit ?? ""}</td>
                        <td className="px-4 py-2 text-right">{r.price !== undefined ? r.price.toLocaleString("en-US", { style: "currency", currency: "USD" }) : <span className="text-muted">missing</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end px-4 py-2">
                  <button type="button" className="text-sm text-muted underline" onClick={() => { setItems([]); setFileName(""); }}>Remove this file</button>
                </div>
              </div>
            )}
            <div className={full}>{field("price_list_url", "Or a link to your prices", { placeholder: "A web page, Google Sheet or PDF link" })}</div>
            <p className={`${full} hint`}>
              No price list ready? Skip this step. We can go through prices on the call. Your prices are never shown to customers until you&apos;ve checked your listing.
            </p>
          </>
        )}
        {step === 4 && (
          <>
            <div className={full}>{radios("deposit_policy", "What deposit do you take at booking?", depositOptions)}</div>
            <div className={full}>{chips("payment_methods", "How can customers pay you?", paymentMethods)}</div>
            <div className={full}>{field("damage_waiver", "Damage waiver, if you charge one", { placeholder: "10% of rental, optional" })}</div>
            {field("billing_name", "Who handles your bills?", { placeholder: "Name" })}
            {field("billing_email", "Their email", { type: "email" })}
            <div className={full}>{radios("commission_pay", "How would you like to pay our monthly statement?", commissionPayOptions)}</div>
            <div className={full}>{radios("insurance", "Do you carry general liability insurance?", insuranceOptions)}</div>
            <p className={`${full} hint`}>
              Customers pay you directly under your own agreement. We never ask for bank account numbers on this form. If we ever need them, we set that up with you by phone through a secure payment provider.
            </p>
          </>
        )}
        {step === 5 && (
          <>
            <div className={full}>{radios("photo_permission", "Can we show your product photos on your listing, with credit?", [{ id: "yes", label: "Yes, with credit" }, { id: "no", label: "No, use your own images" }])}</div>
            {v("photo_permission") === "yes" && (
              <div className={full}>{field("photo_link", "Where can we get your photos?", { placeholder: "Website gallery, Google Drive or Dropbox link" })}</div>
            )}
            <div className={full}>
              <label className="label" htmlFor="vo-notes">Anything else we should know</label>
              <textarea id="vo-notes" rows={3} className="field resize-none" value={v("notes")} onChange={(e) => set("notes", e.target.value)} placeholder="Specialty items, dates you'd like filled, how you like to get orders…" />
            </div>
            <label className={`${full} flex gap-3 text-sm leading-6`}>
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--gold)]" checked={v("agree") === "yes"} onChange={(e) => set("agree", e.target.checked ? "yes" : "")} />
              <span>
                I&apos;ve read the <Link href="/partners#terms" className="link">Founding Partner terms</Link> and <Link href="/how-we-work" className="link">how you work</Link>, and I&apos;m happy to receive orders. Nothing is binding until we both sign the one-page agreement.
              </span>
            </label>
          </>
        )}
      </div>

      {status === "error" && <p className="mt-4 text-sm text-rose">{error}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" className="btn-ghost" onClick={() => go(step - 1)}>Back</button>
        ) : (
          <span className="hint">About five minutes. Your answers save in this browser as you go.</span>
        )}
        <button className="btn-primary" disabled={!valid[step]() || status === "sending"}>
          {step === 3 && !items.length && !v("price_list_url") ? "Skip for now" : step < steps.length - 1 ? "Next" : status === "sending" ? "Sending…" : "Send my application"}
        </button>
      </div>
    </form>
  );
}
