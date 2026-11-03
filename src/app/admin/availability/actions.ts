"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin-auth";
import { setDateBlocked } from "@/lib/availability";

// Server Actions can be POSTed to from any URL, so each one checks the admin password itself.
async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

// One tap on a calendar day: block it, or open it again.
export async function toggleDate(formData: FormData) {
  await requireAdmin();
  const date = text(formData.get("date"), 10);
  if (!isDay(date)) return;
  await setDateBlocked(date, formData.get("blocked") === "1", text(formData.get("reason")));
  revalidatePath("/admin/availability");
  revalidatePath("/admin/calendar");
}

// Blocks (or opens) every day from `from` to `to`, at most a year at a time.
export async function blockRange(formData: FormData) {
  await requireAdmin();
  const from = text(formData.get("from"), 10);
  const to = text(formData.get("to"), 10) || from;
  if (!isDay(from) || !isDay(to) || to < from) return;
  const reason = text(formData.get("reason"));
  const block = formData.get("mode") !== "open";
  const start = new Date(`${from}T12:00:00Z`);
  for (let i = 0; i < 366; i++) {
    const d = new Date(start.getTime() + i * 864e5).toISOString().slice(0, 10);
    if (d > to) break;
    await setDateBlocked(d, block, reason);
  }
  revalidatePath("/admin/availability");
  revalidatePath("/admin/calendar");
}
