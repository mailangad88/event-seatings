"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin-auth";
import { updateReview, type ReviewStatus } from "@/lib/reviews";

async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Approve, hide or reply to one review. Wording is never edited: only status and the public owner reply change.
export async function moderateReview(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const status = text(formData.get("status"), 16) as ReviewStatus;
  const reply = formData.has("owner_reply") ? text(formData.get("owner_reply")) : undefined;
  if (!id) throw new Error("Missing review");
  await updateReview(id, {
    ...(["pending", "approved", "hidden"].includes(status) ? { status } : {}),
    ...(status === "approved" ? { approved_at: new Date().toISOString() } : {}),
    ...(reply !== undefined ? { owner_reply: reply } : {}),
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}
