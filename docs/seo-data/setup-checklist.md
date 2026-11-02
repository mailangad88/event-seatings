# Measurement setup checklist

The code side is done: the site loads GA4, Search Console and Bing verification tags as soon as the environment variables below are set, and it sends conversion events and lead attribution with no further code changes. What remains needs **your own Google/Microsoft accounts** (🔑) and takes about 30 minutes in total.

Do these in order. Use one Google account you'll keep for the business (ideally a Google Workspace address on the final domain, not a personal Gmail).

## 1. Google Analytics 4 (10 min) 🔑

1. Go to [analytics.google.com](https://analytics.google.com) → **Admin → Create → Property**. Name: `Beyond Chivary website`. Time zone: **United States, Chicago**. Currency: USD.
2. Industry: *Home & Garden* or *Business & Industrial Markets*. Objective: **Generate leads**.
3. Create a **Web** data stream with the live domain. Leave *Enhanced measurement* **on** (it tracks page views on client-side navigation, scrolls and outbound clicks for free).
4. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
5. In Vercel → Project → Settings → Environment Variables, add `NEXT_PUBLIC_GA_ID` = that ID for **Production**. Redeploy.
6. Check it works: open the live site, then GA4 → **Reports → Realtime**. You should appear within a minute.
7. **Mark key events** (GA4's name for conversions): Admin → **Events**, wait until each event has fired once (submit a test lead), then toggle **Mark as key event** on:
   - `generate_lead` (every form: quote, waitlist, quiz)
   - `book_call_click` (any click to Calendly, Cal.com, etc. once a booking link exists)
   - `phone_click` (once a phone number is on the site)
8. **Register custom dimensions** so the event details show in reports: Admin → **Custom definitions → Create custom dimension** (scope: Event) for `lead_type`, `form_source`, `event_type`, `page`, `metric_rating`. Add `guest_count` and `chair_count` as **custom metrics**.
9. Admin → **Data retention** → set event data retention to **14 months** (default is 2).
10. Admin → **Data filters** → keep "Internal traffic" filter and define your home/office IP under *Data streams → Configure tag settings → Define internal traffic* so your own visits don't skew numbers.

## 2. Google Search Console (5 min) 🔑

1. Go to [search.google.com/search-console](https://search.google.com/search-console) → **Add property**.
2. Best option: **Domain** property (covers www, non-www, http/https). It needs a DNS TXT record; add it in Vercel → Domains (or your registrar) and click Verify.
3. Simpler option: **URL prefix** property → choose **HTML tag** → copy just the `content="..."` value → set `NEXT_PUBLIC_GSC_VERIFICATION` in Vercel → redeploy → Verify.
4. **Sitemaps** → submit `https://<domain>/sitemap.xml` (the site already generates it, including every blog post and chair page).
5. **Link to GA4**: GA4 Admin → **Product links → Search Console links** → link this property. This unlocks the *Search Console* reports inside GA4 (queries → landing page → leads in one place).
6. Use **URL Inspection → Request indexing** on the homepage, `/chairs`, `/quote` and the newest blog post after launch.

## 3. Bing Webmaster Tools (5 min) 🔑

Bing powers ChatGPT search, Copilot and DuckDuckGo results, so it matters for AI answers (GEO).

1. [bing.com/webmasters](https://www.bing.com/webmasters) → sign in → **Import from Google Search Console** (fastest: it copies the verified site and sitemap).
2. If import isn't available, choose **HTML meta tag**, copy the `msvalidate.01` code into `NEXT_PUBLIC_BING_VERIFICATION`, redeploy, verify, and submit the sitemap.
3. Turn on **IndexNow** under Settings if offered, so new blog posts are picked up within hours.

## 4. Google Business Profile 🔑

Covered in detail in the local SEO plan (`docs/local-seo-plan.md`). For tracking purposes, add UTM tags to the website link on the profile so Map Pack traffic is separated from organic:

```
https://<domain>/?utm_source=google&utm_medium=organic&utm_campaign=gbp
```

## 5. Looker Studio dashboard (10 min) 🔑

Follow `docs/seo-data/reporting-dashboard.md`. It connects GA4 + Search Console + the keyword sheet into one page.

## 6. Keyword sheet 🔑 (optional but recommended)

1. Upload `docs/seo-data/chicago-keywords.csv` to Google Sheets (File → Import).
2. Replace the `est_volume_band` guesses with real numbers from **Google Keyword Planner** (free inside a Google Ads account; no ad spend required). Set location to *Chicago-Naperville-Elgin metro*.
3. Fill `baseline_rank` once, the week after launch, from Search Console → Performance → filter by query.

## Supabase (one SQL line) 🔑

If the `leads` table already exists in Supabase, run this once in the SQL editor so lead attribution is saved:

```sql
alter table leads add column if not exists attribution jsonb;
```

(New installs get it automatically from `supabase/schema.sql`.)

## What gets tracked

| Event | When it fires | Key event? |
|---|---|---|
| `page_view` | Every page, including client-side navigation (GA4 enhanced measurement) | No |
| `generate_lead` | Successful quote, waitlist or quiz-email submit. Params: `lead_type`, `form_source`, plus `event_type`, `guest_count`, `chair_count` for quotes | **Yes** |
| `book_call_click` | Click on any Calendly/Cal.com/TidyCal/SavvyCal/HubSpot Meetings link, or any element with `data-track="book_call"` | **Yes** |
| `phone_click` / `email_click` | Click on a `tel:` / `mailto:` link | phone: Yes |
| `quote_cta_click` | Click on any link to `/quote` (which CTAs pull people into the funnel) | No |
| `quiz_complete` | Visitor answers the last style-quiz question | No |
| `LCP`, `INP`, `CLS`, `FCP`, `TTFB` | Core Web Vitals per page, with `metric_rating` good / needs-improvement / poor | No |

**Lead attribution.** On the first visit the site stores the visitor's UTM tags, `gclid`, referring site and landing page in their browser, and sends them with every lead. The admin dashboard (`/admin`) now shows **Lead sources** and **Landing pages that convert**, and the CSV export includes those columns, ready to import into a CRM.

**Adding tracking to new buttons.** Any element can be tracked without code changes elsewhere by adding `data-track="event_name"` (and optionally `data-track-label="..."`). Booking links are detected automatically.
