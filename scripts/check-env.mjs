#!/usr/bin/env node
// Lists which settings are on and which are missing, most important first.
//   npm run check:env                          (checks this shell's environment)
//   vercel env pull .env.check && npm run check:env -- --file .env.check   (checks the live site's settings)
// Prints names only, never values.
import { readFileSync } from "fs";

const env = { ...process.env };
const fileArg = process.argv.indexOf("--file");
if (fileArg > 0) {
  for (const line of readFileSync(process.argv[fileArg + 1], "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && m[2]) env[m[1]] = m[2];
  }
}
const has = (k) => Boolean(env[k] && String(env[k]).trim());

const groups = [
  {
    title: "1. Keep every lead (do this first)",
    items: [
      ["BLOB_READ_WRITE_TOKEN", "Private backup store for leads. Vercel adds it when you connect a Blob store (Storage tab, access: Private)."],
      ["SUPABASE_URL", "Database for leads, page views and the admin pages."],
      ["SUPABASE_SERVICE_ROLE_KEY", "Database key (Supabase > Project settings > API > service_role)."],
      ["ADMIN_PASSWORD", "Password for /admin."],
    ],
    ok: () => has("BLOB_READ_WRITE_TOKEN") || has("BLOB_STORE_ID") || (has("SUPABASE_URL") && has("SUPABASE_SERVICE_ROLE_KEY")),
    okText: "Leads are being kept.",
    badText: "Leads are NOT being kept. They only reach the function log until one of these stores is set up.",
  },
  {
    title: "2. Lead alerts to you",
    items: [
      ["RESEND_API_KEY", "Sends email (resend.com, free up to 3,000 a month)."],
      ["NOTIFY_EMAIL", "Your inbox for lead alerts."],
    ],
    ok: () => has("RESEND_API_KEY") && has("NOTIFY_EMAIL"),
    okText: "You get an email for every new lead.",
    badText: "No lead alerts are sent.",
  },
  {
    title: "3. Emails to visitors (confirmations, download links)",
    items: [["NOTIFY_FROM", "Sender on your verified domain, e.g. Beyond Chiavari <hello@beyondchiavari.com>."]],
    ok: () => has("RESEND_API_KEY") && has("NOTIFY_FROM"),
    okText: "Visitors get their confirmation and download emails.",
    badText: "Visitors get no email (they still see everything on screen).",
  },
  {
    title: "4. Daily jobs (missed-alert check, backup clean-up, follow-ups)",
    items: [
      ["CRON_SECRET", "Any long random text. Vercel sends it to the daily jobs in vercel.json."],
      ["FOLLOWUPS_ENABLED", "Set to true to send the follow-up emails. Leave unset until you've read a dry run."],
      ["EVENT_EMAILS_ENABLED", "Set to true to send the two-weeks-out, day-before and thank-you emails."],
      ["REMINDERS_ENABLED", "Set to true to send reminder emails (unfinished quote list, viewed item, event coming up)."],
      ["UNSUBSCRIBE_SECRET", "Signs unsubscribe links (falls back to ADMIN_PASSWORD)."],
    ],
    ok: () => has("CRON_SECRET"),
    okText: "Daily jobs can run.",
    badText: "Daily jobs are refused (no CRON_SECRET).",
  },
  {
    title: "5. Renter accounts (/account)",
    items: [
      ["ACCOUNT_SECRET", "Any long random string (e.g. `openssl rand -base64 32`). Switches on real sign-in."],
    ],
    ok: () => has("ACCOUNT_SECRET") && has("RESEND_API_KEY") && has("NOTIFY_FROM"),
    okText: "Renters can sign in with a real emailed link and see their real events.",
    badText: "The sample account works, but real sign-in needs ACCOUNT_SECRET plus email sending (RESEND_API_KEY, NOTIFY_FROM) above.",
  },
  {
    title: "6. Nice to have",
    items: [
      ["NEXT_PUBLIC_BOOKING_URL", "Your Calendly / Cal.com link, shown after forms and in emails."],
      ["NEXT_PUBLIC_PHONE", "Business phone for the call buttons."],
      ["HUBSPOT_ACCESS_TOKEN", "Copies each lead into HubSpot."],
      ["CRM_WEBHOOK_URL", "Copies each lead to Zapier, Make or a Google Sheet."],
      ["NEXT_PUBLIC_SITE_URL", "The main web address, used in links and emails."],
    ],
  },
];

let missingCore = false;
for (const g of groups) {
  console.log(`\n${g.title}`);
  for (const [k, why] of g.items) console.log(`  ${has(k) ? "[x]" : "[ ]"} ${k.padEnd(28)} ${why}`);
  if (g.ok) {
    const ok = g.ok();
    console.log(`  ${ok ? "OK:" : "MISSING:"} ${ok ? g.okText : g.badText}`);
    if (!ok && g.title.startsWith("1.")) missingCore = true;
  }
}
if (has("SUPABASE_URL") !== has("SUPABASE_SERVICE_ROLE_KEY")) console.log("\nWARNING: set both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or neither.");
if (has("NOTIFY_FROM") && /resend\.dev/.test(env.NOTIFY_FROM)) console.log("\nWARNING: NOTIFY_FROM uses resend.dev, which can only send to your own address. Use your own domain.");
console.log("");
process.exitCode = process.argv.includes("--strict") && missingCore ? 1 : 0;
