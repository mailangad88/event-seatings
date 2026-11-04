import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Panel } from "@/components/admin/AdminUi";
import { BOOKING_FEE_FULL } from "@/lib/catalog-types";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Site settings", robots: { index: false } };

const on = (...keys: string[]) => keys.every((k) => !!process.env[k]);

// What is switched on. Only on/off is shown here, never the values.
const groups: { title: string; rows: { name: string; what: string; ok: boolean; keys: string }[] }[] = [
  {
    title: "Saving and alerts",
    rows: [
      { name: "Lead backup", what: "Private Vercel Blob store. Keeps every lead even with no database, and catches any the database misses.", ok: on("BLOB_READ_WRITE_TOKEN"), keys: "BLOB_READ_WRITE_TOKEN (Vercel > Storage > Blob, Private)" },
      { name: "Database", what: "Keeps leads, vendors and blocked dates between deploys.", ok: on("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"), keys: "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY" },
      { name: "Daily lead check", what: "Sends any lead alert that didn't go out and moves backup leads into the database.", ok: on("CRON_SECRET"), keys: "CRON_SECRET" },
      { name: "Email sending", what: "Confirmations to customers and new-lead alerts to you.", ok: on("RESEND_API_KEY", "NOTIFY_FROM"), keys: "RESEND_API_KEY, NOTIFY_FROM" },
      { name: "Your alert inbox", what: "Where new requests and paid fees are sent.", ok: on("NOTIFY_EMAIL"), keys: "NOTIFY_EMAIL" },
      { name: "Automatic follow-ups", what: "Daily follow-up emails after someone sends a form.", ok: process.env.FOLLOWUPS_ENABLED === "true" && on("CRON_SECRET"), keys: "FOLLOWUPS_ENABLED=true, CRON_SECRET" },
      { name: "Automatic event emails", what: "Two-weeks-out, day-before and thank-you emails to customers, and order details to rental partners.", ok: process.env.EVENT_EMAILS_ENABLED === "true" && on("CRON_SECRET"), keys: "EVENT_EMAILS_ENABLED=true, CRON_SECRET" },
      { name: "Reminder emails", what: "Daily reminders from what people click after sending a form: unfinished quote list, an item they keep viewing, an event date coming up.", ok: process.env.REMINDERS_ENABLED === "true" && on("CRON_SECRET"), keys: "REMINDERS_ENABLED=true, CRON_SECRET" },
      { name: "Admin password", what: "Locks this back office.", ok: on("ADMIN_PASSWORD"), keys: "ADMIN_PASSWORD" },
    ],
  },
  {
    title: "Money",
    rows: [
      { name: "Card payments (Stripe)", what: "Customers pay the booking fee on their proposal.", ok: on("STRIPE_SECRET_KEY"), keys: "STRIPE_SECRET_KEY" },
      { name: "Stripe payment alerts", what: "Marks a fee paid even if the customer closes the tab.", ok: on("STRIPE_WEBHOOK_SECRET"), keys: "STRIPE_WEBHOOK_SECRET" },
    ],
  },
  {
    title: "Calls and contact",
    rows: [
      { name: "Booking link", what: "The 15-minute call scheduler on /book and in emails.", ok: on("NEXT_PUBLIC_BOOKING_URL"), keys: "NEXT_PUBLIC_BOOKING_URL" },
      { name: "Phone number", what: "Shown in the header, footer and emails.", ok: on("NEXT_PUBLIC_PHONE"), keys: "NEXT_PUBLIC_PHONE" },
      { name: "Business hours", what: "Lets the site promise a reply within an hour during those hours.", ok: on("NEXT_PUBLIC_BUSINESS_HOURS"), keys: "NEXT_PUBLIC_BUSINESS_HOURS" },
      { name: "HubSpot", what: "Copies each lead into HubSpot.", ok: on("HUBSPOT_ACCESS_TOKEN"), keys: "HUBSPOT_ACCESS_TOKEN" },
    ],
  },
  {
    title: "Search and tracking",
    rows: [
      { name: "Google Analytics", what: "Visitor numbers and form sends in GA4.", ok: on("NEXT_PUBLIC_GA_ID"), keys: "NEXT_PUBLIC_GA_ID" },
      { name: "Google Search Console", what: "Proves you own the site to Google.", ok: on("NEXT_PUBLIC_GSC_VERIFICATION"), keys: "NEXT_PUBLIC_GSC_VERIFICATION" },
      { name: "Bing Webmaster", what: "Proves you own the site to Bing.", ok: on("NEXT_PUBLIC_BING_VERIFICATION"), keys: "NEXT_PUBLIC_BING_VERIFICATION" },
      { name: "Planning assistant", what: "The AI chat helper on the planning pages.", ok: process.env.NEXT_PUBLIC_PLANNING_ASSISTANT === "on", keys: "NEXT_PUBLIC_PLANNING_ASSISTANT=on" },
    ],
  },
];

export default function SettingsPage() {
  const all = groups.flatMap((g) => g.rows);
  const ready = all.filter((r) => r.ok).length;
  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Setup"
        title="Site settings"
        intro={
          <>
            {ready} of {all.length} switched on. To change one, open Vercel, go to the project&apos;s Settings, then Environment Variables, add the
            name shown, and redeploy.
          </>
        }
        actions={<a href="https://vercel.com/dashboard" target="_blank" rel="noopener" className="btn-ghost btn-sm">Open Vercel</a>}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {groups.map((g) => (
          <Panel key={g.title} title={g.title}>
            <ul className="divide-y divide-line">
              {g.rows.map((r) => (
                <li key={r.name} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted">{r.what}</p>
                    {!r.ok && <p className="mt-1 font-mono text-xs text-muted [overflow-wrap:anywhere]">{r.keys}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${r.ok ? "bg-sage text-white" : "bg-surface-2 text-muted"}`}>{r.ok ? "On" : "Off"}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ))}

        <Panel title="Business details">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">Name</dt><dd>{site.name}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Website</dt><dd className="[overflow-wrap:anywhere]">{site.url}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Our fee</dt><dd className="text-right">{BOOKING_FEE_FULL} per event, no markup on items</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted">Name, address and service area live in src/lib/site.ts. Ask Claude to change them.</p>
        </Panel>

        <Panel title="Shortcuts">
          <ul className="space-y-2 text-sm">
            <li><a href="/admin/export" className="text-accent">Download every lead (CSV)</a></li>
            <li><Link href="/admin/emails" className="text-accent">See how emails look</Link></li>
            <li><Link href="/booking-promise" className="text-accent">Booking Promise page</Link></li>
            <li><Link href="/how-it-works" className="text-accent">How it works page</Link></li>
            <li><Link href="/partners" className="text-accent">Rental partner sign-up page</Link></li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
