import "server-only";
import { chairs } from "@/data/chairs";
import { site } from "./site";
import type { Lead } from "./store";

// Sends every lead to the CRM. Two destinations, each switched on by its env vars:
// - HubSpot (HUBSPOT_ACCESS_TOKEN): creates or updates the contact by email, and opens a deal for quote requests.
//   Run `npm run crm:setup` once first so HubSpot has the custom fields (event date, guests, UTMs…).
// - Any webhook (CRM_WEBHOOK_URL): posts the lead as JSON, for Zapier, Make, n8n, Kit, Mailchimp, a Google Sheet…
// The lead is already saved in our own database before this runs, so a CRM outage never loses anyone.

const hubspot = process.env.HUBSPOT_API_URL ?? "https://api.hubapi.com";

const chairName = (slug: string) => chairs.find((c) => c.slug === slug)?.name ?? slug;

const formLabel: Record<Lead["kind"], string> = {
  quote: "Quote request",
  waitlist: "Waitlist",
  quiz: "Style quiz",
  call: "Call request",
};

function splitName(name?: string) {
  if (!name) return {};
  const [first, ...rest] = name.trim().split(/\s+/);
  return { firstname: first, lastname: rest.join(" ") || undefined };
}

// HubSpot contact fields. Names here must match scripts/hubspot-setup.mjs.
export function contactProperties(lead: Lead): Record<string, string> {
  const props: Record<string, string | number | undefined> = {
    email: lead.email,
    ...splitName(lead.name),
    phone: lead.phone,
    city: lead.city,
    event_date: lead.event_date,
    event_type: lead.event_type,
    guest_count: lead.guest_count,
    event_venue: lead.venue,
    chairs_wanted: lead.chairs?.map(chairName).join("; "),
    style_quiz_result: lead.quiz_styles?.join("; "),
    lead_form: lead.kind,
    // Pre-launch: dates before the first delivery day get the "future season" treatment in the playbook.
    future_season: lead.event_date ? String(lead.event_date < site.launch.firstEventDate) : undefined,
    sms_consent: lead.sms_consent ? "true" : undefined,
    lead_form_location: lead.source,
    lead_page: lead.page_path,
    utm_source: lead.utm_source,
    utm_medium: lead.utm_medium,
    utm_campaign: lead.utm_campaign,
    utm_term: lead.utm_term,
    utm_content: lead.utm_content,
    gclid: lead.gclid,
    landing_page: lead.landing_page,
    referrer_url: lead.referrer,
    first_utm_source: lead.first_utm_source,
    first_utm_medium: lead.first_utm_medium,
    first_utm_campaign: lead.first_utm_campaign,
    first_landing_page: lead.first_landing_page,
    first_referrer_url: lead.first_referrer,
  };
  // Leave out blanks so a later, shorter form (e.g. the waitlist) never wipes details from an earlier quote.
  return Object.fromEntries(
    Object.entries(props).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]),
  );
}

async function hs(path: string, body: unknown) {
  const res = await fetch(`${hubspot}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint = /PROPERTY_DOESNT_EXIST|does not exist/i.test(JSON.stringify(json))
      ? " (run `npm run crm:setup` to create the custom fields)"
      : "";
    throw new Error(`HubSpot ${path} ${res.status}${hint}: ${JSON.stringify(json).slice(0, 500)}`);
  }
  return json;
}

async function sendToHubSpot(lead: Lead) {
  const upsert = await hs("/crm/v3/objects/contacts/batch/upsert", {
    inputs: [{ idProperty: "email", id: lead.email, properties: contactProperties(lead) }],
  });
  const contactId: string | undefined = upsert.results?.[0]?.id;
  if (!contactId || lead.kind !== "quote") return;

  // A quote request is a real sales opportunity, so it gets a deal at the start of the pipeline.
  const when = lead.event_date
    ? new Date(`${lead.event_date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "date TBD";
  const description = [
    lead.event_type,
    lead.guest_count && `${lead.guest_count} guests`,
    lead.city,
    lead.venue && `Venue: ${lead.venue}`,
    lead.items?.length && `Items:\n${lead.items.map((i) => `${i.qty} x ${i.name}`).join("\n")}`,
    !lead.items?.length && lead.chairs?.length && `Chairs: ${lead.chairs.map(chairName).join(", ")}`,
    lead.message && `Notes: ${lead.message}`,
    lead.utm_source && `Source: ${[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  await hs("/crm/v3/objects/deals", {
    properties: {
      dealname: `${lead.name ?? lead.email} · ${lead.event_type ?? "Event"} · ${when}`,
      pipeline: process.env.HUBSPOT_PIPELINE_ID || "default",
      dealstage: process.env.HUBSPOT_DEAL_STAGE_ID || "appointmentscheduled",
      ...(lead.event_date && { closedate: lead.event_date }),
      ...(lead.quote_subtotal && { amount: String(lead.quote_subtotal) }),
      description,
    },
    // 3 = HubSpot's built-in "deal to contact" association.
    associations: [{ to: { id: contactId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }] }],
  });
}

async function sendToWebhook(lead: Lead) {
  const url = process.env.CRM_WEBHOOK_URL!;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(secret && { "X-Webhook-Secret": secret }) },
    body: JSON.stringify({
      event: "lead.created",
      brand: site.name,
      form: formLabel[lead.kind],
      // Vendor costs stay out of third-party tools; the full quote is in /admin/leads.
      lead: {
        ...lead,
        quote_cost: undefined,
        items: lead.items?.map(({ id, name, qty, unit, unit_price, line_total }) => ({ id, name, qty, unit, unit_price, line_total })),
        chair_names: lead.chairs?.map(chairName),
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`CRM webhook ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

export async function syncToCrm(lead: Lead) {
  const jobs: Promise<void>[] = [];
  if (process.env.HUBSPOT_ACCESS_TOKEN) jobs.push(sendToHubSpot(lead));
  if (process.env.CRM_WEBHOOK_URL) jobs.push(sendToWebhook(lead));
  for (const r of await Promise.allSettled(jobs)) {
    if (r.status === "rejected") console.error(`syncToCrm failed for lead ${lead.id}`, r.reason);
  }
}
