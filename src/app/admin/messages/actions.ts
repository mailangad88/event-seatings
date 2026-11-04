"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/notify";
import { site } from "@/lib/site";
import { addLeadMessage, getLead } from "@/lib/store";

// Team reply to a renter's account conversation. Also emails the renter that a reply is waiting.
export async function replyToCustomer(formData: FormData) {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
  const id = String(formData.get("lead") ?? "").slice(0, 64);
  const text = String(formData.get("text") ?? "").trim().slice(0, 4000);
  const lead = await getLead(id);
  if (!lead) redirect("/admin/messages");
  if (text) {
    await addLeadMessage(lead.id, "team", text);
    if (process.env.NOTIFY_FROM) {
      await sendEmail({
        to: lead.email,
        subject: `New message about your ${lead.event_type ?? "event"}`,
        text: [
          `Hi${lead.name ? ` ${lead.name.split(" ")[0]}` : ""},`,
          "",
          "Your coordinator replied:",
          "",
          text,
          "",
          `Reply or see your order: ${site.url}/account/events/${lead.id}`,
        ].join("\n"),
      });
    }
  }
  redirect(`/admin/messages?lead=${lead.id}&sent=1`);
}
