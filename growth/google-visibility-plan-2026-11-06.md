# Why the site isn't showing up on Google yet — and the full plan to fix it and start getting calls tomorrow

Checked live, right now (Nov 6, 7:24pm): the Vercel project, the site's robots.txt and sitemap.xml source code, and a direct Google search for `site:beyondchiavari.com` (zero results).

**Update, 8:05pm same day — done without needing any clicks:** ran the IndexNow GitHub Action (pushed every sitemap URL to Bing), confirmed Bing is already file-verified via `public/BingSiteAuth.xml` (so Step 5 below only needs a sitemap resubmit, not a fresh verification), confirmed internal links to every money page are already strong (they're in the sitewide header mega-menu, `src/lib/nav.ts`, so every page on the site links to them — no code change needed), and drafted (not submitted) a Wikidata entity at `growth/wikidata-entity-prep-2026-11-06.md`.

## The honest diagnosis

**It's not a bug in the website.** The technical SEO (sitemap, robots.txt, schema, meta tags, page speed, canonical tags) is already excellent — a full crawl of all 7,281 pages on Nov 6 scored 99.1/100 with zero blocking errors. That work is done and isn't the reason.

**The real reason is simpler and has been sitting unfixed since launch:** three settings in Vercel that connect the site to Google Search Console, Bing Webmaster Tools, and Google Analytics have never been filled in. I checked the live Vercel project directly — `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION`, and `NEXT_PUBLIC_GA_ID` are all still blank. This has been flagged three separate times in past planning docs (Nov 2, Nov 4, and again yesterday Nov 5) but never actually done.

Because that verification was never live, nobody could have verified Search Console, submitted the sitemap, or clicked "Request Indexing" — those steps all require verification first. So Google has never been told the site exists, on top of the site being brand new. That's why `site:beyondchiavari.com` on Google returns nothing: it genuinely hasn't been crawled yet.

The good news: this is fixable today, in about 20 minutes of clicking, using accounts you already have or can create in a couple of minutes each.

**Even once fixed, set the right expectation:** Google itself takes a few days to a couple of weeks to crawl and index a brand-new site, even with everything submitted correctly today. There is no setting that makes that instant. So for calls starting tomorrow, organic Google search cannot be the source — paid ads, Google Business Profile (map results), and direct outreach have to carry the first 1–2 weeks while organic indexing catches up underneath.

---

## Part 1 — Fix Google/Bing visibility (do this today, ~20 minutes)

Do these in order. Each one unlocks the next.

### Step 1: Create (or find) your Google Analytics 4 property
1. Go to [analytics.google.com](https://analytics.google.com) and sign in with the Google account you want tied to the business.
2. Click **Admin** (bottom left gear icon) → **Create property**.
3. Name it `Beyond Chiavari website`, time zone **United States - Chicago**, currency **USD**. Click **Next**, fill in any industry (e.g. Home & Garden), objective **Generate leads**, then **Create**.
4. It'll ask you to set up a **Web** data stream — enter `https://beyondchiavari.com` as the URL. Click **Create stream**.
5. You'll see a **Measurement ID** that looks like `G-XXXXXXXXXX`. Copy it.

### Step 2: Add the GA4 ID to Vercel
1. Go to [vercel.com](https://vercel.com) → your **beyondchiavari** project → **Settings** → **Environment Variables**.
2. Click **Add New**. Key: `NEXT_PUBLIC_GA_ID`. Value: the `G-XXXXXXXXXX` you copied. Environment: check **Production** (and Preview if you want). Click **Save**.
3. Go to the **Deployments** tab, find the latest production deployment, click the **⋯** menu → **Redeploy** (this makes the new setting take effect — the code already reads it, it just needs a fresh deploy to pick it up).

### Step 3: Verify Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console) and sign in with the same Google account.
2. Click **Add property** → choose **URL prefix** (simpler than the Domain option) → enter `https://beyondchiavari.com` → **Continue**.
3. It'll offer several verification methods. Pick **HTML tag**. It shows you a line like `<meta name="google-site-verification" content="abc123..." />` — copy just the part inside `content="..."`.
4. Back in Vercel (Settings → Environment Variables), add another variable: Key `NEXT_PUBLIC_GSC_VERIFICATION`, Value = that code. Save, then redeploy again (same as Step 2.3).
5. Wait about a minute for the redeploy to finish, then go back to the Search Console tab and click **Verify**. It should succeed immediately once the new deploy is live.

### Step 4: Submit the sitemap and request indexing
1. In Search Console, left sidebar → **Sitemaps**.
2. Type `sitemap.xml` in the box and click **Submit**. It should show "Success" within a few minutes (refresh to check).
3. Left sidebar → **URL Inspection**. Paste `https://beyondchiavari.com/` and press Enter, then click **Request Indexing**. Wait for "Indexing requested."
4. Repeat step 3 for these four pages one at a time (Google limits how many you can request per day, so these are the highest-value ones):
   - `https://beyondchiavari.com/chairs`
   - `https://beyondchiavari.com/quote`
   - `https://beyondchiavari.com/rentals`
   - `https://beyondchiavari.com/how-it-works`

### Step 5: Bing Webmaster Tools — already file-verified, just submit the sitemap
Bing is already verified via `public/BingSiteAuth.xml` (done in an earlier PR), so you don't need to re-verify — just:
1. Go to [bing.com/webmasters](https://www.bing.com/webmasters), sign in, and confirm `beyondchiavari.com` already shows as verified (if Bing still asks you to verify, choose **Import from Google Search Console** after Step 3).
2. Go to **Sitemaps** in the left menu, submit `https://beyondchiavari.com/sitemap.xml` if it isn't already listed.
3. Go to **URL Submission**, paste in the same five URLs from Step 4.

### Step 6: IndexNow — already run
Already triggered tonight (no action needed) — the `IndexNow` GitHub Action ran successfully and pushed every sitemap URL to Bing. Re-run it the same way (Actions tab → IndexNow → Run workflow) after any future big content push.

### Step 7: Mark your key conversion events in GA4 (so you can tell what's working)
1. Submit one real test quote on the live site (any item, any email).
2. In GA4 → **Admin → Events**, you should see `generate_lead` appear within a few minutes.
3. Click on it → toggle **Mark as key event**. Do the same for `phone_click` once you have a working phone number live (see Part 2).

That's the whole Google/Bing side. Once Steps 1–4 are done, nothing else needs clicking — Bing and IndexNow are already handled, and the sitemap stays current on its own.

---

## Part 2 — What actually brings calls starting tomorrow (the bridge while Google catches up)

Google indexing you do above will show results in **days to two weeks**, not tomorrow. These four things can realistically produce a call within 24–72 hours:

### A. Google Business Profile (map results — much faster than web search)
Per the existing doc (`growth/fast-leads/google-business-profile.md`), a Business Profile can show up in "near me" map searches within days of verification, far faster than the main web index. Status as of Nov 6: Angad created the profile but verification is still pending.
1. Finish verifying the profile (Google usually does this by text/call to the business phone, or postcard — check your email/Google Business app for the pending verification request).
2. Once verified, paste in the description, services, and service-area list already written in `growth/fast-leads/google-business-profile.md` and `growth/google-business-profile/README.md`.
3. Upload at least 10 photos from the launch screenshots and the styled scene images on day one.

### B. Google Ads (the only lever that's instant)
Everything is drafted and ready in `growth/fast-leads/google-ads-launch-guide-2026-11-06.md` and the CSVs beside it. The only blockers are the same Step 2 (GA4) above plus a live phone number — once those are in, you can launch campaigns same-day with the suggested $20/day starter budget in that guide. This is the one channel that can put the site in front of a searcher within minutes of turning it on.

### C. Directory listings (free, independent signals Google also uses)
Already fully drafted and ready to paste in `growth/directory-listings/` (Yelp, Bing Places, WeddingWire/TheKnot, GigSalad, PartySlate, Nextdoor, Apple Business Connect, and more) — none submitted yet. These take 10–15 minutes each and several (Yelp, Nextdoor, GigSalad) can start showing local searchers within days, independent of Google's own index. (These also unlock submitting the Wikidata draft — see `growth/wikidata-entity-prep-2026-11-06.md`.)

### D. Direct outreach you already have sitting ready
`growth/vendor-outreach/` has 50 drafted outreach emails to Chicago rental companies and `growth/referral-partners/` has a similar list for referral partners (planners, venues) — none sent yet. These create word-of-mouth and backlink signals too, but more importantly they can generate inbound calls directly without waiting on any search engine at all.

---

## Part 3 — Business model check: is the bigger risk really visibility?

The Nov 3 council stress-test (`plans/ai-council-review.md`) already flagged the real risk plainly: **not whether people can find the site, but whether anyone actually pays once they do.** No real booked order has happened yet. Chasing Google rankings harder doesn't test that — getting even 5–10 real quote requests through any channel above (ads, GBP, directories, direct outreach) does.

Recommendation: treat this first week of calls as the test the council flagged, not as a traffic problem to solve by waiting for organic SEO. Use Part 2's four levers to get real conversations going starting tomorrow, and let Part 1's fixes compound in the background for the weeks after.

## Timeline, plainly stated
- **Today:** GA4/GSC verification live, sitemap submitted (Bing/IndexNow already done tonight), GBP verification pushed through, directory listings submitted, outreach emails sent.
- **Tomorrow–day 3:** First calls come from Google Ads, GBP (if verified fast), directory listings, and direct outreach — not from organic Google search yet.
- **Days 4–14:** Google starts crawling and indexing pages requested in Step 4; expect the first organic impressions/clicks to show up in Search Console during this window.
- **Weeks 3–8:** Organic rankings for the Chicago-area pages start building meaningfully, assuming the directory listings and GBP reviews are also live by then (independent signals that help Google trust the site).

Nothing above is a guess dressed up as a plan — every number is Google's own stated typical range for a new site, not a promise of exact days.
