"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin-auth";
import { getLead } from "@/lib/store";
import { vendorParts } from "@/lib/orders";
import { ensurePartLink, markPart, moveLine, type PartMark } from "@/lib/vendor-confirm";

// Server Actions can be POSTed to from any URL, so each one checks the admin password itself.
async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 80) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function refresh(id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/scheduled");
  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${id}`);
}

// Makes the confirmation link for one rental partner's part of an order.
export async function createPartLink(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead) return;
  await ensurePartLink(lead, text(formData.get("vendor")));
  refresh(id);
}

// Moves one item line to another rental partner ("Send to" on /admin/orders/<id>).
export async function movePartLine(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead) return;
  const index = Number(text(formData.get("index"), 6));
  if (!Number.isInteger(index) || index < 0) return;
  await moveLine(lead, index, text(formData.get("line"), 120), text(formData.get("to")));
  refresh(id);
}

const marks: PartMark[] = ["delivered", "picked_up", "paid"];

// Delivered, picked up and paid marks on one part. on=0 undoes the mark.
export async function markPartAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const mark = text(formData.get("mark"), 20) as PartMark;
  const vendor = text(formData.get("vendor"));
  if (!marks.includes(mark) || !vendor) return;
  const lead = await getLead(id);
  if (!lead || !vendorParts(lead).some((p) => p.vendorId === vendor)) return;
  await markPart(lead, vendor, mark, text(formData.get("on"), 1) !== "0");
  refresh(id);
}
