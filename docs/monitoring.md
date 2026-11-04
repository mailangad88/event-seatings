# Error alerts and logs

This note explains how you find out when something on the site breaks, and where to look.

## What sends you an alert

When `ALERT_WEBHOOK_URL` is set, a short message goes to your Slack or Discord channel when:

- **A page or form on the server fails.** For example the quote form can't save, a page crashes, or the Stripe webhook throws. The message gives the page path, the kind of request (page, API route, form action), the method and an error code (the "digest"). You can search the logs for that code.
- **A visitor's browser hits an error.** Each page view sends at most 3 of these. Errors caused by browser extensions, cancelled page loads and a harmless browser warning ("ResizeObserver loop") are dropped, so they don't wake you up.

The same error on the same page sends one alert every 10 minutes at most, so a bad minute doesn't fill your channel.

Alerts never include a customer's full email or phone number. Emails show as `a***@gmail.com`, phone numbers show only the last two digits, and anything that looks like a password, key or cookie is removed.

Separately, the **Uptime** GitHub workflow checks the home page, `/quote`, `/rentals`, `/tools`, `/book` and `/api/health` every 15 minutes. If one fails, GitHub emails you, and the same `ALERT_WEBHOOK_URL` repository secret sends a chat message too.

## Where the logs are

Open the project on Vercel, then **Logs** (runtime logs). Each line from the site is one JSON record with:

- `level`: `error`, `warn` or `info`
- `event`: a short name you can search for, such as `request_error`, `alert`, `assistant_gemini_failed` or `weather_forecast_failed`
- `reqId`: the Vercel request id, when there is one
- `err`: the error name, message and the first few lines of where it happened

Type the event name or the digest from an alert into the log search box to find the full record.

One exception on purpose: if a quote request can't be saved to the database, the whole request is written to the log so you can add it by hand. Search for `LEAD_SAVE_FAILED`.

## Health check

`/api/health` answers right away with `ok: true`, the time, and the deployed version (short commit id) for everyone. The list of which services are set up (true or false, never the values) only shows when you open it signed in with the admin password, or call it with the cron secret. Add `?deep=1` to also check that the Supabase database answers (it gives up after 2 seconds).

## Settings that turn things on

Set these in Vercel under **Settings → Environment Variables**:

| Variable | What it does |
| --- | --- |
| `ALERT_WEBHOOK_URL` | Slack or Discord incoming webhook. Without it, errors are only written to the logs. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | The database. Shown as `supabase` in the health check. |
| `RESEND_API_KEY`, `NOTIFY_EMAIL` | Emails to you and to customers. Shown as `resend`. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Card payments and the "paid" update from Stripe. |
| `CRON_SECRET` | Lets the daily follow-up and event email jobs run. |
| `ADMIN_PASSWORD` | Protects `/admin`. |

For the GitHub uptime check, add `ALERT_WEBHOOK_URL` as a repository secret and set the `SITE_URL` repository variable to the live address.
