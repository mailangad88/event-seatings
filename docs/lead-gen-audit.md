# Beyond Chiavari lead-generation audit (2 Nov 2026)

How it was checked: read the code on `main`, built it and crawled all 3,746 sitemap URLs locally (the sandbox can't reach the live site directly), fetched the live /book page through Vercel, and read the live Vercel project settings.

**Proposed target (Angad to confirm):** 20 qualified leads a month within 60 days of the domain going live, 50 a month by day 120. A qualified lead = a quote request or call request with an event date and guest count, or a download from someone with an event date. These are proposals, not forecasts: there is no traffic data yet because analytics is not switched on.

## The audit

| # | Area | What we found | Severity |
|---|------|---------------|----------|
| 1 | **Lead capture points** | 9 forms: quote builder `/quote` (guests, items, date, event type, city, venue, name, email, phone optional, SMS tick box, message); call request `/book` (name, phone, email, best time, event type, date); 20 gated downloads (email required, name, event type, date optional); style quiz `/quiz`; "Get this look" on 11 `/looks`; chat dock quick message on every page; waitlist; vendor sign-up `/partners`. Good coverage. Missing: disposable-email blocking, separate consent for email / SMS / calls (only SMS is recorded), a lead score. | Medium |
| 2 | **Where search visitors land, next step** | Search will land on 2,584 item pages, 661 guides, ~420 chair/seating guide pages. Only 3 pages have no CTA at all (`/downloads` hub, `/tools/seating-readiness`, `/privacy`). But on phones there is no sitewide sticky CTA: only item pages, `/looks` and `/quote` have one. The header "Get a quote" scrolls away. | Medium |
| 3 | **After the form** | **This is the biggest problem.** The live Vercel project has only `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL` set. No Supabase, no Resend, no booking link, no phone. So today a lead on the live site: is not saved to the database (only written to the Vercel log as `LEAD_SAVE_FAILED`), sends no owner alert, sends no confirmation email, shows no booking calendar ("Book a free call" falls back to a request form), and starts no follow-up. `/admin` shows nothing. Time to first human contact: unknown, possibly never. | **Critical** |
| 4 | **Tracking** | Code is good: every lead carries page, first and last touch UTM, referrer, landing page and click IDs. But GA4, Search Console and Vercel Web Analytics are all off, and page views go to Supabase which is not connected. So right now we can't tell visits, sources or conversion for anything. No "form started" event, no pages-visited trail on the lead. | **Critical** |
| 5 | **SEO basics** | All 3,746 URLs return 200, exactly one H1 each, canonical + JSON-LD everywhere, FAQ schema on 3,660 pages, BreadcrumbList present, sitemap and llms.txt exist, 0 broken internal links (Nov 2 review). Weak spots: 3,400+ titles over 60 characters, ~2,800 descriptions outside 70-160 characters (mostly item pages), heavy `/quote` (1.3 MB HTML) and `/gallery` pages on phones, no IndexNow. The domain beyondchiavari.com still shows a Squarespace parking page while every canonical points at it, so Google has nothing to index yet. | High (domain), Low (rest) |
| 6 | **Missing pages (from the playbook)** | Have: tools (seating planner, readiness score, quiz), 20 gated templates, 640 guides, `/how-it-works`, `/booking-promise`, event-type pages, chair vs chair comparisons. Missing: "best event rental companies in Chicago" and "Beyond Chiavari vs [company]" pages, one landing page per buyer problem (minimums, last-minute, comparing quotes, delivery windows, deposits), a glossary of rental terms, rental quantity calculators beyond chairs, and real proof (no reviews, case studies, founder story or photo). | High |

## Ranked plan (impact vs effort)

| Rank | What | Impact | Effort | Who |
|------|------|--------|--------|-----|
| 1 | Set the env vars so leads are saved, alerted and bookable: Supabase (+ run `supabase/schema.sql`), Resend + `NOTIFY_EMAIL`, booking link, phone, GA4. Point the domain DNS. | Huge: without it every lead is lost | 1 hour | **Angad** |
| 2 | Capture fixes: sitewide sticky mobile CTA, disposable-email block, separate email/SMS/call consent, A/B/C lead score | High | Small | Claude |
| 3 | Owner alert rebuilt: who, event, size, quote, score, source, landing page, pages visited, visitor's local time, suggested first reply. Instant confirmation email to the visitor with booking link and what to prepare | High | Small | Claude |
| 4 | Follow-up sequence days 0 to 14 (switched off until Angad turns it on), auto-stop on booking, reply or unsubscribe; booking webhook; unsubscribe link and opt-out log | High | Medium | Claude |
| 5 | Buyer pages: best-of and vs pages built only from our sourced vendor research, problem pages, glossary linked into money pages | Medium-high | Medium | Claude |
| 6 | Measurement: form-start events, pages-visited trail, weekly lead report in /admin, IndexNow script | Medium | Small | Claude |
| 7 | Real proof: founder photo + story, first Google reviews, named partner houses (with permission), first case study | High | Needs real events | Angad |
| 8 | Shorter titles and descriptions on item pages; lighter /quote and /gallery on phones | Low-medium | Small | Later |

**Proof we need to collect (none is invented on the site):** a founder photo and two lines of story, permission to name partner rental houses, the first 5 Google reviews after real events, one written-up event (with the host's OK) with photos and numbers.
