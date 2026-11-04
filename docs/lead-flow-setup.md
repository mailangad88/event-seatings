# Lead flow: what happens after a form, and how to switch it on

Every form posts to `/api/leads` through `postLead()` (`src/lib/lead-client.ts`). The lead is saved (Supabase, or the private Blob backup), scored A/B/C, the owner gets an alert, the visitor gets a confirmation, and the CRM webhook/HubSpot gets a copy. A daily cron sends follow-ups until the person books, replies (you move the lead out of "New lead"), or unsubscribes.

Nothing below sends email until the env vars are set in Vercel. The follow-up sequence also needs `FOLLOWUPS_ENABLED=true`, so it stays off until you turn it on.

## Keeping every lead

A lead is only lost if every one of these fails:

1. **The visitor's browser.** `postLead()` gives each form an id, tries 3 times, and if the site can't be reached it keeps the form on the device and sends it on their next page view (same id, so it is saved once).
2. **Supabase**, tried 3 times for network blips.
3. **The private Blob backup** (`BLOB_READ_WRITE_TOKEN`). With no Supabase it is the lead store and /admin reads from it. With Supabase, it only holds leads the database refused; /admin shows them anyway, and the daily recovery job moves them in.
4. **The function log.** If all stores fail, the full lead is logged as `LEAD_SAVE_FAILED` and still emailed to you.

Repeats are safe: a double click, a retry or the device copy all carry the same id, and the server saves it once and sends one alert. Resend gets a fixed idempotency key per email too (`lead-alert/<id>`, `confirm/<id>`, `followup/<id>/<step>`), so a retry never sends a second copy.

Spam: the hidden honeypot field, 8 forms per IP per 10 minutes, throwaway inboxes turned away, and `src/lib/lead-spam.ts` (sent under 1.5 seconds after the page opened, links in the name, 3+ links, SEO/crypto sales wording). Spam is saved as Lost with the reason "Spam check: ...", so you can find a real person caught by mistake, but it gets no alert, CRM copy or email.

**Daily recovery job** (`/api/cron/lead-recovery`, 13:00 UTC): moves backup leads into Supabase and sends any owner alert that didn't go out in the last 3 days (at most 25 a run). Try it with `curl -H "Authorization: Bearer $CRON_SECRET" "https://beyondchiavari.com/api/cron/lead-recovery?dry=1"`.

**Check your settings:** `vercel env pull .env.check && npm run check:env -- --file .env.check` lists what is on and what is missing (names only). Delete `.env.check` afterwards.

## Env vars (Vercel > Project > Settings > Environment Variables)

| Var | What it does | Needed for |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Private backup store for leads. Added by Vercel when you create a Blob store with **Private** access and connect it to the project. Works on its own until Supabase is set up | Keeping leads |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Saves leads and page views. Re-run `supabase/schema.sql` after each release that adds columns. | Everything |
| `RESEND_API_KEY` | Sends email | Alerts, confirmations, follow-ups |
| `NOTIFY_EMAIL` | Where owner alerts go; also the reply-to on every visitor email | Owner alert |
| `NOTIFY_FROM` | Sender on a verified Resend domain, e.g. `Beyond Chiavari <hello@beyondchiavari.com>` | Anything sent to visitors |
| `NEXT_PUBLIC_BOOKING_URL` | Calendly / Cal.com / HubSpot Meetings link; shown after forms and in emails | Booking |
| `CRON_SECRET` | Vercel sends it to the daily jobs (`vercel.json`): follow-ups, event emails and lead recovery | Daily jobs |
| `FOLLOWUPS_ENABLED` | `true` to actually send follow-ups. Test first with `GET /api/cron/followups?dry=1` and header `Authorization: Bearer $CRON_SECRET` | Follow-ups |
| `BOOKING_WEBHOOK_SECRET` | Point your calendar's "booking created" webhook at `/api/booking-webhook?key=<secret>`. Moves the lead to "Consult booked" and stops follow-ups | Auto-stop on booking |
| `UNSUBSCRIBE_SECRET` | Signs unsubscribe links (falls back to `ADMIN_PASSWORD`) | Opt-out |

## Lead score

`src/lib/lead-score.ts`. A = dated event within reach plus size/spend plus a phone number (call today). B = real request missing size, phone or urgency. C = research (download, quiz, no date). The reasons are listed in the alert and in /admin, so the rules can be tuned once real bookings show which leads close.

## Consent

Recorded per channel: `email_consent` (tips and follow-ups beyond the reply to their own request), `call_consent`, `sms_consent`, with `consent_at`. Boxes are never pre-ticked. The unsubscribe link sets `opted_out_at` on every lead with that email, and the cron never emails an opted-out address. Download nurture emails go only to people who ticked the tips box.

## Follow-up sequence (`src/lib/followups.ts`)

- Quote and call requests still in "New lead": day 1 (two questions), day 3 (what changes a quote), day 7 (still planning?), day 14 (close the request).
- Downloads with the tips box ticked: day 2, day 6, day 13.
- Stops on: unsubscribe, status moved past "New lead", a newer quote/call from the same email, or the event date passing.

## Reminders before the call and a recap after

Use the booking tool's own reminders (Calendly, Cal.com and HubSpot Meetings all send them). After each call, log it in /admin and send the recap from your inbox; the "Suggested first reply" in each alert is a starting point.
