"use server";

import { redirect } from "next/navigation";
import { recordPartAnswer } from "@/lib/vendor-confirm";

// A rental partner's answer on /vendor/confirm/<token>. No login: the random token in the link is the key,
// and it only works once (an answered link can't be changed here).
const text = (v: FormDataEntryValue | null, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const day = (v: FormDataEntryValue | null) => {
  const d = text(v, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : undefined;
};

export async function answerOrder(formData: FormData) {
  const token = text(formData.get("token"), 64);
  if (!/^[a-f0-9]{32}$/.test(token)) redirect("/");
  const answer = text(formData.get("answer"), 3);

  if (answer === "yes") {
    const delivery_window = text(formData.get("delivery_window"), 120);
    const pickup_window = text(formData.get("pickup_window"), 120);
    const totalRaw = text(formData.get("vendor_total"), 20).replace(/[$,\s]/g, "");
    const total = totalRaw ? Number(totalRaw) : undefined;
    if (!delivery_window || !pickup_window || (total !== undefined && !(Number.isFinite(total) && total >= 0))) {
      redirect(`/vendor/confirm/${token}?error=missing`);
    }
    await recordPartAnswer(token, {
      answer: "yes",
      delivery_date: day(formData.get("delivery_date")),
      delivery_window,
      pickup_date: day(formData.get("pickup_date")),
      pickup_window,
      vendor_total: total === undefined ? undefined : Math.round(total * 100) / 100,
      note: text(formData.get("note"), 1000) || undefined,
    });
  } else if (answer === "no") {
    const reason = text(formData.get("reason"), 1000);
    if (!reason) redirect(`/vendor/confirm/${token}?error=reason`);
    await recordPartAnswer(token, { answer: "no", reason });
  }
  redirect(`/vendor/confirm/${token}`);
}
