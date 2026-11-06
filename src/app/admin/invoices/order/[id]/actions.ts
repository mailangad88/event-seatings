"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin-auth";
import { getInvoice } from "@/lib/invoices";
import { sendInvoiceEmail } from "@/lib/notify";
import { getLead, updateLead } from "@/lib/store";

async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 64) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Emails the customer their invoice (src/emails/InvoiceEmail.tsx). Needs RESEND_API_KEY + NOTIFY_FROM;
// without them this quietly does nothing but still note the attempt, so a retry is obvious from the lead's timeline.
export async function sendInvoice(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  const invoice = lead ? await getInvoice(id) : undefined;
  if (!lead || !invoice) redirect(`/admin/invoices/order/${id}?error=invoice`);

  const subject = await sendInvoiceEmail(lead, invoice);
  if (subject) {
    await updateLead(lead.id, {}, [{ type: "note", text: `Invoice ${invoice.number} emailed to ${lead.email}.` }]);
    revalidatePath(`/admin/invoices/order/${id}`);
    revalidatePath(`/admin/leads/${id}`);
    redirect(`/admin/invoices/order/${id}?sent=1`);
  }
  redirect(`/admin/invoices/order/${id}?error=send`);
}
