"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin-auth";
import { getLead, updateLead } from "@/lib/store";

// Server Actions can be POSTed to from any URL, so each one checks the admin password itself.
async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Ticks an event to-do off (lib/event-tasks.ts) so it leaves Today and This week, and logs it on the lead.
export async function completeTask(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const key = text(formData.get("key"), 80);
  const title = text(formData.get("title"), 160);
  // Rental partner tasks are per part of an order: "vendor-confirm:<vendor id>".
  if (!/^[a-z0-9+:-]+$/.test(key)) return;
  const lead = await getLead(id);
  if (!lead) return;
  await updateLead(id, { tasks_done: { ...(lead.tasks_done ?? {}), [key]: new Date().toISOString() } }, [
    { type: "note", text: `Done: ${title || key}` },
  ]);
  revalidatePath("/admin");
  revalidatePath("/admin/week");
  revalidatePath(`/admin/leads/${id}`);
}
