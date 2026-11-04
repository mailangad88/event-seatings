"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin-auth";
import { cleanReminderSettings, REMINDER_SETTINGS_KEY, reminderKinds } from "@/lib/reminders";
import { saveSetting } from "@/lib/store";

// Saves the reminder switches and the optional offer from /admin/reminders.
export async function saveReminderSettings(formData: FormData) {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
  const settings = cleanReminderSettings({
    enabled: Object.fromEntries(reminderKinds.map((k) => [k, formData.get(`on_${k}`) === "on"])),
    offer: {
      enabled: formData.get("offer_on") === "on",
      percent: formData.get("offer_percent"),
      days: formData.get("offer_days"),
      kinds: reminderKinds.filter((k) => formData.get(`offer_${k}`) === "on"),
    },
  });
  await saveSetting(REMINDER_SETTINGS_KEY, settings);
  revalidatePath("/admin/reminders");
}
