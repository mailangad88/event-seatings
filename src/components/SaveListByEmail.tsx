"use client";

import { useState } from "react";
import { attributionFields } from "@/lib/attribution";
import { postLead } from "@/lib/lead-client";
import { trackLead } from "@/lib/analytics";
import { Icon } from "./ui/Icon";

// "Not ready yet? Email me this list": saves the list with just an email, for visitors who aren't ready
// to give a date and address. It is a plain div (not a form) because it sits inside the quote form.
export function SaveListByEmail({ lines, guests }: { lines: { id: string; qty: number }[]; guests: number }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [tips, setTips] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  if (status === "done") {
    return (
      <p className="mt-4 flex gap-2 rounded-xl bg-gold-soft p-3 text-sm" role="status">
        <Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold" />
        <span>Saved. We&apos;ll email the list to {email} with a link to open it again. It also stays on this device.</span>
      </p>
    );
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="link mt-3 block w-full text-center text-sm">
        Not ready yet? Email me this list
      </button>
    );
  }

  async function save() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const res = await postLead({
      ...attributionFields(),
      kind: "quiz",
      email: email.trim(),
      guest_count: guests || undefined,
      items: lines,
      email_consent: tips ? "yes" : undefined,
      message: "Saved their list by email from the quote builder (no date yet).",
      source: "saved-list:quote-builder",
    }).catch(() => null);
    if (res?.ok) {
      trackLead("quiz", "saved-list", { item_count: lines.length, guest_count: guests || undefined });
      setStatus("done");
      return;
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  return (
    <div className="mt-4 space-y-2 rounded-xl border border-line p-3">
      <label className="label !mb-0 text-sm" htmlFor="save-list-email">Email me this list</label>
      <div className="flex gap-2">
        <input
          id="save-list-email"
          type="email"
          autoComplete="email"
          className="field min-w-0 flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            }
          }}
        />
        <button type="button" onClick={save} className="btn-ghost shrink-0" disabled={status === "sending"}>
          {status === "sending" ? "Saving…" : "Save"}
        </button>
      </div>
      <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted">
        <input type="checkbox" checked={tips} onChange={(e) => setTips(e.target.checked)} className="mt-0.5 accent-[var(--gold)]" />
        Also email me planning tips. Unsubscribe anytime.
      </label>
      {error && <p className="text-sm text-rose" role="alert">{error}</p>}
      <p className="text-xs text-muted">No date needed. We only use your email to send the list and answer questions about it.</p>
    </div>
  );
}
