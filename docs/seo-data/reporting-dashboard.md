# SEO reporting dashboard spec

**Goal:** one page that answers "what should we write or fix next?" so the daily blog and weekly site-log routines pick work from data, not guesses.

**Tool:** Looker Studio (free) at [lookerstudio.google.com](https://lookerstudio.google.com). Data sources:

1. **GA4** property (traffic, key events, Web Vitals)
2. **Search Console**: *Site Impression* table (queries, impressions, CTR, position) and *URL Impression* table (by landing page)
3. **Google Sheet** imported from `docs/seo-data/chicago-keywords.csv` (target keyword → target page → priority)
4. Optional: CSV export from `/admin/export` uploaded to a Sheet weekly (lead details with source and landing page)

Default date range: **last 28 days, compared to previous period**. Filter control at the top: *Page path* and *Device*.

## Page 1: Scorecard (the "are we winning" view)

| Tile | Source | Metric | Target by Mar 2027 |
|---|---|---|---|
| Leads | GA4 | `generate_lead` count | 30 / month |
| Booked calls | GA4 | `book_call_click` count | 10 / month |
| Lead conversion rate | GA4 | key events ÷ sessions | ≥ 3% |
| Organic sessions | GA4 | Sessions where *Session default channel group* = Organic Search | +20% month over month |
| Search impressions | GSC | Impressions | +25% month over month |
| Avg. position, P1 keywords | GSC + Sheet | Blend on query, filter priority = P1 | Top 10 |
| Keywords in top 3 / top 10 | GSC | Count of queries with avg. position ≤ 3 / ≤ 10 | Up every week |

Under the tiles: a **time series** of daily organic sessions and leads (two lines), so a new post or page can be seen moving the needle.

## Page 2: Opportunities (what the routines read)

Each table is a ready-made to-do list. The weekly site-log review copies the top rows into `SITE_LOG.md` as "remaining" items.

**A. Striking distance** (rank 4–20, i.e. one push from page 1)
GSC query table, filter `average position between 4 and 20` and `impressions ≥ 20`. Columns: query, landing page, impressions, clicks, CTR, position. Sort by impressions.
*Action:* refresh that page: add the query to the H2/FAQ, add a section that answers it, add internal links from 2 related posts.

**B. Low CTR** (seen but not clicked)
GSC page table, filter `position ≤ 10` and `CTR < 2%`. Columns: page, top query, impressions, CTR.
*Action:* rewrite the title tag and meta description; add FAQ schema so the result takes more space.

**C. Content gaps** (people search, we have no page)
GSC queries with `impressions ≥ 10` whose landing page is the homepage or a loosely related post. Also: any P1/P2 keyword in the Sheet whose `page_status` = Planned.
*Action:* this is the daily blog's queue. Pick the highest-impression gap that isn't already in `docs/content-calendar.md`.

**D. Pages that convert vs. pages that attract**
GA4 table by *Landing page*: sessions, `generate_lead`, conversion rate, avg. engagement time.
*Action:* high traffic + low conversion → add a stronger CTA, quiz embed or quote widget. High conversion + low traffic → promote it (internal links, Pinterest, newsletter).

**E. Slow pages**
GA4 table of Web Vitals events by page: event name (LCP/INP/CLS), count where `metric_rating` = poor.
*Action:* any page with more than 10% "poor" LCP gets an image/3D-viewer performance pass.

## Page 3: Local and lead quality

- **Leads by city** (from admin CSV Sheet: `city`), shown as a bar chart. Compare to the city landing-page list to decide which city page to build next.
- **Leads by source** (`utm_source / utm_medium`, or referrer): shows whether Google Business Profile, Pinterest, Instagram, The Knot etc. are paying off.
- **Event type and guest count** of quote leads: confirms which segments (weddings, South Asian weddings, quinceañeras, corporate) to write for.
- **Map Pack**: manual weekly entry in the Sheet (tab `map_pack`) of position for the 10 local keywords, checked from a Chicago-area location or a free grid tool (Local Falcon free scan, or GBP → Performance).

## How the routines use it

**Daily SEO blog routine**
1. Open Page 2, table C (content gaps). Take the top query with no dedicated post.
2. If none, take the top table A row and write a supporting post that links to that page.
3. Map the new post into the keyword Sheet (`target_url`, `page_status` = Live).

**Weekly site-log review**
1. Record the Page 1 scorecard numbers in `SITE_LOG.md` (week, leads, booked calls, organic sessions, impressions, P1 avg. position).
2. Copy the top 3 rows from tables A, B, D and E into each affected page's "remaining" list.
3. Update `current_rank`, `gsc_impressions_28d`, `gsc_clicks_28d` and `last_checked` in the keyword Sheet for P1 rows.

Claude can run both steps automatically once it has read access to the GA4 and Search Console data (for example by sharing a Looker Studio report or exporting the Sheet into the project folder each week).

## UTM conventions

Use these so the Lead sources chart stays clean. All lowercase.

| Where | utm_source | utm_medium | utm_campaign |
|---|---|---|---|
| Google Business Profile website link | google | organic | gbp |
| Instagram bio / posts | instagram | social | bio or post-slug |
| Pinterest pins | pinterest | social | pin-board-name |
| Nurture emails | newsletter | email | nurture-1 … nurture-5 |
| Venue partner pages | venue-name | referral | partner |
| Directory listings (The Knot, WeddingWire, Yelp) | theknot / weddingwire / yelp | referral | listing |
