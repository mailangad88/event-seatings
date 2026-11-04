"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin-auth";
import { nextStage, prevStage } from "@/lib/pipeline";
import { getLead, statusLabel, updateLead } from "@/lib/store";

// Server Actions can be POSTed to from any URL, so each one checks the admin password itself.
async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 64) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Move back / Move forward on a pipeline card. Logs the stage change on the timeline, the same way saveLead does.
export async function moveStage(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  const dir = text(formData.get("dir"), 8);
  const lead = await getLead(id);
  if (!lead || lead.kind === "partner") return;
  const from = lead.status ?? "new";
  // Only move if the card was still in the stage the board showed (a second click on a stale page does nothing).
  if (text(formData.get("from"), 32) !== from) return;
  const to = dir === "back" ? prevStage(from) : dir === "forward" ? nextStage(from) : undefined;
  if (!to) return;
  await updateLead(id, { status: to }, [{ type: "status", text: `Stage: ${statusLabel(from)} → ${statusLabel(to)}` }]);
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}
