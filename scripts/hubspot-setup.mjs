// One-time HubSpot setup: creates the custom contact fields the site sends with every lead,
// then prints your deal pipelines and stage IDs so you can pick where new quote requests land.
// Safe to run again: fields that already exist are skipped.
//
//   HUBSPOT_ACCESS_TOKEN=pat-na1-... npm run crm:setup
//
// The token comes from a HubSpot private app (Settings → Integrations → Private Apps) with scopes:
// crm.objects.contacts.read/write, crm.objects.deals.read/write, crm.schemas.contacts.read/write.

const token = process.env.HUBSPOT_ACCESS_TOKEN;
if (!token) {
  console.error("Set HUBSPOT_ACCESS_TOKEN first (see docs/crm-setup.md).");
  process.exit(1);
}

const api = async (method, path, body) => {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
};

const group = { name: "event_lead", label: "Event lead (website)", displayOrder: -1 };

const text = (name, label, description) => ({ name, label, description, type: "string", fieldType: "text" });

const bool = (name, label, description) => ({
  name,
  label,
  description,
  type: "enumeration",
  fieldType: "booleancheckbox",
  options: [
    { label: "Yes", value: "true", displayOrder: 0 },
    { label: "No", value: "false", displayOrder: 1 },
  ],
});

// Must match contactProperties() in src/lib/crm.ts.
const properties = [
  { name: "event_date", label: "Event date", type: "date", fieldType: "date", description: "Date of the event from the website form" },
  { name: "guest_count", label: "Guest count", type: "number", fieldType: "number", description: "Approximate guests" },
  text("event_type", "Event type", "Wedding, shower, corporate…"),
  text("event_venue", "Event venue", "Venue, if booked"),
  text("chairs_wanted", "Chairs wanted", "Chair styles picked on the website"),
  text("style_quiz_result", "Style quiz result", "Top styles from the style quiz"),
  text("lead_form", "Lead form", "quote, waitlist or quiz"),
  bool("future_season", "Future season", "Event date is before our first delivery day"),
  bool("sms_consent", "SMS consent", "Ticked \"Text me about my quote\" on the website"),
  text("lead_form_location", "Lead form location", "Which form on the site (quote-form, home-footer…)"),
  text("lead_page", "Lead page", "Page the form was submitted from"),
  text("utm_source", "UTM source (last touch)", "Source of the visit that converted"),
  text("utm_medium", "UTM medium (last touch)", ""),
  text("utm_campaign", "UTM campaign (last touch)", ""),
  text("utm_term", "UTM term (last touch)", "Search keyword, when ads pass it"),
  text("utm_content", "UTM content (last touch)", ""),
  text("gclid", "Google Ads click ID", "For offline conversion import"),
  text("landing_page", "Landing page (last touch)", ""),
  text("referrer_url", "Referrer (last touch)", ""),
  text("first_utm_source", "UTM source (first touch)", "How they first found us"),
  text("first_utm_medium", "UTM medium (first touch)", ""),
  text("first_utm_campaign", "UTM campaign (first touch)", ""),
  text("first_landing_page", "Landing page (first touch)", "First page they ever saw: the SEO page that earned the lead"),
  text("first_referrer_url", "Referrer (first touch)", ""),
];

const g = await api("POST", "/crm/v3/properties/contacts/groups", group);
if (g.status >= 400 && g.status !== 409) {
  console.error("Could not create the property group:", g.status, JSON.stringify(g.json));
  process.exit(1);
}

let created = 0;
for (const p of properties) {
  const r = await api("POST", "/crm/v3/properties/contacts", { ...p, groupName: group.name });
  if (r.status === 201) {
    created++;
    console.log(`  + ${p.name}`);
  } else if (r.status === 409) {
    console.log(`  = ${p.name} (already exists)`);
  } else {
    console.error(`  ! ${p.name}: ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`);
    process.exitCode = 1;
  }
}
console.log(`\nContact fields ready (${created} new).`);

const pipes = await api("GET", "/crm/v3/pipelines/deals");
if (pipes.status === 200) {
  console.log("\nDeal pipelines. Quote requests go to HUBSPOT_PIPELINE_ID / HUBSPOT_DEAL_STAGE_ID");
  console.log('(defaults: "default" / "appointmentscheduled", the first stage of the standard pipeline):\n');
  for (const p of pipes.json.results ?? []) {
    console.log(`  ${p.label}  →  HUBSPOT_PIPELINE_ID=${p.id}`);
    for (const s of p.stages ?? []) console.log(`      ${s.label}  →  HUBSPOT_DEAL_STAGE_ID=${s.id}`);
  }
} else {
  console.log("\nCould not list deal pipelines (token needs crm.objects.deals.read).");
}
