# Lead flow: what happens after a form, and how to switch it on

Every form posts to `/api/leads`. The lead is saved (Supabase), scored A/B/C, the owner gets an alert, the visitor gets a confirmation, and the CRM webhook/HubSpot gets a copy. A daily cron sends follow-ups until the person books, replies (you move the lead out of "New lead"), or unsubscribes.

Nothing below sends email until the env vars are set in Vercel. The follow-up sequence also needs `FOLLOWUPS_ENABLED=true`, so it stays off until you turn it on.

## Env vars (Vercel > Project > Settings > Environment Variables)

| Var | What it does | Needed for |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Saves leads and page views. Re-run `supabase/schema.sql` after each release that adds columns. | Everything |
| `RESEND_API_KEY` | Sends email | Alerts, confirmations, follow-ups |
| `NOTIFY_EMAIL` | Where owner alerts go; also the reply-to on every visitor email | Owner alert |
| `NOTIFY_FROM` | Sender on a verified Resend domain, e.g. `Beyond Chiavari <hello@beyondchiavari.com>` | Anything sent to visitors |
| `NEXT_PUBLIC_BOOKING_URL` | Calendly / Cal.com / HubSpot Meetings link; shown after forms and in emails | Booking |
| `CRON_SECRET` | Vercel sends it to the daily follow-up cron (`vercel.json`) | Follow-ups |
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
