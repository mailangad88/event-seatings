# CRM setup

**Last touched:** 2026-10-31
**Status:** Code ready. Needs the owner's HubSpot account, a booking page and four env vars in Vercel.

Every lead the site captures (quote request, style quiz, waitlist) is saved to our own database first, then sent to the CRM with everything we know about the person and how they found us. A slow or broken CRM never loses a lead.

## What the site sends

| Group | Fields |
|---|---|
| Contact | name (split into first/last), email, phone, city |
| Event | event date, event type, guest count, venue, chairs wanted, style quiz result |
| Form | which form (quote / quiz / waitlist), where on the site, page it was sent from |
| Consent | `sms_consent`: true only when the visitor ticked "Text me about my quote" next to their phone number |
| Season | `future_season`: true when the event date is before our first delivery day (`site.launch.firstEventDate`) |
| First touch | source, medium, campaign, landing page, referrer of the visit that **first** found us (kept 90 days) |
| Last touch | the same for the visit that converted, plus Google/Meta/Microsoft click IDs and search term when ads pass it |

Searches and social links don't carry UTM tags, so the site names them from the referrer (for example `google / organic`, `instagram.com / referral`). Direct visits show as `(direct)`.

**Quote requests also open a deal** named like `Priya Sharma · Wedding · Jun 12, 2027`, with guests, city, chairs, notes and source in the description, at the first stage of the pipeline.

## Data SEO: which pages earn leads

`/admin` now has a **Where leads come from** section: how leads first found us, which landing pages convert and which campaigns work. The CSV export has every attribution column. Use it weekly:

- A blog post or suburb page that shows up under "Landing pages that convert" is a topic to write more of (sister posts, a suburb variant, internal links to it).
- Pages with traffic in Search Console but no leads need a stronger call to action or a better match to search intent.
- In HubSpot, build a report on `first_landing_page` and `first_utm_source` against deals won to see which content produces bookings, not just form fills.

## Recommended stack

| Need | Tool | Cost |
|---|---|---|
| CRM: contacts, deals pipeline, tasks, owner | **HubSpot CRM (free)** | $0 |
| Consult booking | **HubSpot Meetings** (free, logs every booking on the contact and can move the deal) | $0 |
| Nurture emails (docs/email-nurture-sequence.md) | HubSpot Marketing Hub Starter, or any email tool via the webhook | about $20/mo, or the email tool's plan |
| SMS, missed-call text-back | OpenPhone/Quo, connected to HubSpot | about $15–20/mo |

The other option is an all-in-one like GoHighLevel (about $97/mo): CRM, SMS, email sequences, booking and missed-call text-back in one place. The site supports it too, through `CRM_WEBHOOK_URL` pointing at a GoHighLevel inbound webhook. Choose it if you want the playbook's SMS automations live from day one.

## Pipeline stages

Use the stages from the customer success playbook (`docs/customer-success-playbook.md`, section 9) so sales and service share one list. In HubSpot, go to **Settings → Objects → Deals → Pipelines** and rename the default pipeline's stages:

New lead → Contacted → Consult booked → Quote sent → Date held → Booked → Pre-event → Delivered → Completed → Advocate, plus Lost / Future season.

The site drops new quote requests into the first stage. If you build a separate pipeline instead, put its IDs in `HUBSPOT_PIPELINE_ID` and `HUBSPOT_DEAL_STAGE_ID` (`npm run crm:setup` prints them).

Playbook fields map to HubSpot built-ins where they exist, so they don't need custom fields: `owner` → Contact/Deal owner, `stage` → Deal stage, `first_response_at` → "First outreach date" / "Last contacted", `quote_amount` → Deal amount, `lost_reason` → "Closed lost reason", `consult_at` → logged Meetings. Add the rest (`nps_score`, `referral_code`, `referred_by`, `setup_access_notes`, `onsite_contact`, `deposit_paid_at`) as custom deal properties when the post-booking flow goes live.

## Steps that need your accounts

1. **HubSpot:** sign up at hubspot.com (free CRM). Then **Settings → Integrations → Private Apps → Create a private app** named "Website leads" with scopes `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write`, `crm.schemas.contacts.read`, `crm.schemas.contacts.write`. Copy the token.
2. **Create the custom fields** once, from this repo:
   ```bash
   HUBSPOT_ACCESS_TOKEN=pat-na1-... npm run crm:setup
   ```
   It creates the "Event lead (website)" field group and lists your pipelines. Safe to re-run.
3. **Rename the pipeline stages** as above.
4. **Booking page:** in HubSpot go to **Library → Meetings → Create scheduling page**, a 15-minute "Seating consult" with three questions (event date, venue, guest count). Copy the link. Calendly or Cal.com links work too.
5. **Vercel → Project → Settings → Environment Variables:** set `HUBSPOT_ACCESS_TOKEN` and `NEXT_PUBLIC_BOOKING_URL`, plus `HUBSPOT_PIPELINE_ID` / `HUBSPOT_DEAL_STAGE_ID` only if you made a new pipeline. Redeploy (the booking URL is built into the page).
6. **Supabase:** re-run `supabase/schema.sql` in the SQL editor. It only adds the new attribution and consent columns; existing leads are untouched.
7. **Test:** open the live site with `?utm_source=test&utm_medium=manual`, send a quote, and check the contact, its fields and the deal in HubSpot.
8. **Nurture sequence:** in HubSpot (Starter) create a workflow "Contact created with `lead_form` known → enroll in the 5-email sequence, unenroll when a meeting is booked or they reply". Without Starter, set `CRM_WEBHOOK_URL` to your email tool's or Zapier's webhook and build the sequence there.
9. **SMS (later):** before any automated text, register the business number for A2P 10DLC and only text contacts with `sms_consent` = Yes.

## Env vars

| Var | Required | What |
|---|---|---|
| `HUBSPOT_ACCESS_TOKEN` | for HubSpot | Private app token |
| `HUBSPOT_PIPELINE_ID`, `HUBSPOT_DEAL_STAGE_ID` | no | Where quote deals land. Defaults: standard pipeline, first stage |
| `CRM_WEBHOOK_URL` | no | Also POST every lead as JSON (`{ event: "lead.created", brand, form, lead }`) to Zapier, Make, n8n, GoHighLevel, an email tool… |
| `CRM_WEBHOOK_SECRET` | no | Sent as the `X-Webhook-Secret` header so the receiver can reject fakes |
| `NEXT_PUBLIC_BOOKING_URL` | for booking buttons | The consult page. The buttons stay hidden until it's set |

## Where it lives in code

- `src/lib/attribution.ts`, `src/components/AttributionTracker.tsx`: remember first and last touch in the visitor's browser
- `src/app/api/leads/route.ts`: validates the form, saves the lead, then syncs to the CRM after responding
- `src/lib/crm.ts`: HubSpot contact upsert, deal for quotes, generic webhook
- `src/lib/booking.ts`, `src/components/BookingCta.tsx`: pre-filled booking button on the quote and quiz thank-you screens
- `scripts/hubspot-setup.mjs`: one-time HubSpot field setup

## Remaining to improve

- [ ] Owner: steps 1–7 above
- [ ] Embed the booking page directly on the quote thank-you screen instead of linking out
- [ ] Add the booking button to the nurture emails (`{{booking_link}}` = `NEXT_PUBLIC_BOOKING_URL` with `utm_source=email`)
- [ ] Phone field and SMS consent on the waitlist form, if SMS goes live for waitlist leads
- [ ] Send Google Ads offline conversions from won deals using the saved `gclid`
- [ ] Custom deal properties for the post-booking playbook fields (NPS, referral code, deposit date)

## Built-in lead pipeline (/admin/leads)

Every lead is saved in our own database first, then copied to HubSpot and the webhook. The site has its own CRM at `/admin/leads` (same `ADMIN_PASSWORD` as `/admin`), so you can work leads before HubSpot is set up:

- **Pipeline:** New lead → Contacted → Consult booked → Quote sent → Vendor confirmed → Booked → Completed, plus Future season and Lost. Counts and open quote value per stage.
- **Lead page:** contact and event details, the exact items and quantities the customer priced, our price, vendor cost and margin per line, a copy-ready order for each rental partner, and where the lead came from (UTMs, referrer, landing page).
- **Working a lead:** change the stage, assign a rental partner, set the next follow-up date, note why a lead was lost, and log calls, emails, texts and vendor updates. Every change lands on the lead's timeline.
- **Follow-ups due** show at the top of the pipeline, overdue ones in red.

Database: re-run `supabase/schema.sql` in the Supabase SQL editor (it only adds missing columns) to get `items`, `quote_subtotal`, `quote_cost`, `status`, `assigned_vendor`, `follow_up_at`, `lost_reason`, `activity` and `updated_at`.

Pricing: the quote builder reads `src/data/catalog.ts`. Store each vendor's own price in `vendorPrice`; the customer sees vendor price + 10% (`MARKUP` in `src/lib/catalog-types.ts`). HubSpot deals get the quote total as their amount. Vendor costs are never sent to the browser, HubSpot or the webhook.
