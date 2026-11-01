# Site Log: beyondchiavari.com

A living record of every public route on the Beyond Chiavari site (formerly "Event Seatings"): what each page is for, when it was last touched, and how it scores on search, answer engines, local signals, visuals, FAQs and lead capture. Chicago is the primary market; the business is based in St. Charles, IL and serves Chicago and the suburbs.

**How to update this log**

1. Whenever you touch a page, bump its **Last touched** date (`git log -1 --format=%cs -- <file>`, or today's date for uncommitted work).
2. Re-score the affected columns and strike or edit its "Remaining to improve" bullets.
3. Add new routes as new rows (one row per blog post). Remove rows for deleted routes.
4. Log notable releases under a dated "Changes in this release" section.

**Legend:** ✅ done / strong · ⚠️ partial or generic · ❌ missing · n/a not applicable

**Columns:** SEO = title, description, canonical · AEO = answer-first copy, FAQ/HowTo schema · GEO = Chicago/local signals, areaServed, llms.txt · Visuals = imagery/3D/illustration (the owner wants no text-only pages) · FAQ = FAQs shown on page · CTA = quote / book-a-call / waitlist

---

## Sitewide

| Area | Status | Notes |
|---|---|---|
| schema.org | ✅ | LocalBusiness + WebSite graph in `layout.tsx` (Chicago-first areaServed, ReserveAction → /book). FAQPage on `/faq` and `/book`, BlogPosting on posts, Product (AggregateOffer) + BreadcrumbList on chair pages. No Review/AggregateRating (correct: no real reviews yet). |
| Sitemap | ✅ | `src/app/sitemap.ts`: static pages, all chair pages, all posts (posts carry `lastModified`). Add `/book` and future neighborhood/event pages when they land. Static pages lack `lastModified`. |
| robots | ✅ | `src/app/robots.ts`: allow `/`, disallow `/admin`, `/api`; points to sitemap. `/render/*` is `noindex` and 404s unless `ALLOW_RENDER=1`. |
| llms.txt | ✅ | `/llms.txt` route (`src/app/llms.txt/route.ts`) is generated from chairs, posts and `site.ts`, so it stays in sync. robots.txt explicitly welcomes GPTBot, PerplexityBot, ClaudeBot, Google-Extended and similar crawlers. |
| Canonical URLs | ✅ | `alternates.canonical` on every public page; `metadataBase` from `site.url`. |
| Brand | ✅ | Beyond Chiavari everywhere (copy, OG image, emails, admin realm, README). Name, domain, email and socials live in `src/lib/site.ts`. |
| Analytics | ❌ | None yet. Add Vercel Analytics or GA4 plus conversion events (quote submit, call booked, waitlist join). |
| Search Console | ❌ todo | Verify beyondchiavari.com, submit sitemap, monitor Chicago queries. |
| Google Business Profile | ❌ todo | Create a service-area business (St. Charles base, Chicago + suburbs). Use the same name/phone/area as the schema. |
| Email sequences | ❌ todo | Waitlist welcome, quote follow-up, post-call recap. Leads currently arrive via `/api/leads`. |
| Competitor analysis | ❌ todo | Handled in another workstream. |
| Reviews | ❌ by design | Add Review schema and testimonials only once real customer reviews exist. Never fabricate. |

**Parallel workstreams:** Chicago neighborhood landing pages (e.g. Chicago, Evanston, Oak Park, Naperville) and FAQ/blog content are being built separately. Add their rows here as they ship.

---

## Changes in this release (2026-10-31)

Shipped in this release:

- **Rebrand** from Event Seatings to **Beyond Chiavari** (beyondchiavari.com).
- **`/book`**: "Book a 15-minute seating call", Calendly/Cal.com embed via `NEXT_PUBLIC_BOOKING_URL`, with a call-request form fallback when unset.
- **Book-a-call CTAs** in the header, mobile menu, footer, home, chair pages, about, FAQ and blog posts (each tagged with `?from=` so leads show where they came from in /admin).
- **Product + BreadcrumbList schema** on `/chairs/[slug]`.
- **Richer LocalBusiness / WebSite schema** with Chicago-first `areaServed`.
- **Canonical URLs** on all public pages.
- **`/llms.txt`** summary for AI answer engines.

---

## Core pages

| Route | Purpose | Last touched | SEO | AEO | GEO | Visuals | FAQ | CTA |
|---|---|---|---|---|---|---|---|---|
| `/` | Home: hero 3D chair viewer, featured chairs, waitlist | 2026-10-31 | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ |
| `/chairs` | Browse/filter all chair styles | 2026-10-31 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ |
| `/chairs/[slug]` (13 chairs) | Chair detail, 3D viewer, votes, quote link | 2026-10-31 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ |
| `/quiz` | 4-question chair style quiz | 2026-10-31 | ✅ | ❌ | ❌ | ⚠️ | ❌ | ⚠️ |
| `/quote` | Quote request form | 2026-10-31 | ✅ | ⚠️ | ✅ | ❌ | ❌ | ✅ |
| `/book` | Book a 15-minute seating call | 2026-10-31 | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| `/about` | Our story, service area | 2026-10-31 | ✅ | ⚠️ | ✅ | ⚠️ | ❌ | ✅ |
| `/faq` | FAQ with FAQPage schema | 2026-10-31 | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| `/blog` | Journal index | 2026-10-31 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| `/privacy` | Privacy policy | 2026-10-31 | ⚠️ | n/a | n/a | ❌ | ❌ | n/a |
| `/terms` | Terms of use | 2026-10-31 | ⚠️ | n/a | n/a | ❌ | ❌ | n/a |
| 404 (`not-found.tsx`) | Not-found page | 2026-10-04 | n/a | n/a | n/a | ❌ | ❌ | ⚠️ |

## Blog posts (`content/blog/*.md` → `/blog/[slug]`)

All posts share the template in `src/app/blog/[slug]/page.tsx` (Article JSON-LD, quote CTA,  book-a-call CTA). Last touched is the `.md` file; template last touched 2026-10-04.

| Route | Purpose | Last touched | SEO | AEO | GEO | Visuals | FAQ | CTA |
|---|---|---|---|---|---|---|---|---|
| `/blog/chiavari-chair-alternatives` | 12 Chiavari alternatives (pillar) | 2026-10-03 | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ✅ |
| `/blog/cross-back-vs-chiavari` | Comparison | 2026-10-03 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| `/blog/how-many-chairs-do-i-need` | Quantity guide (HowTo candidate) | 2026-10-03 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| `/blog/ceremony-vs-reception-chairs` | Matching ceremony/reception | 2026-10-03 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| `/blog/ghost-chairs-wedding-styling` | Ghost chair styling | 2026-10-04 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| `/blog/boho-wedding-chairs` | Boho chair picks | 2026-10-04 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| `/blog/barn-wedding-seating-ideas` | Fox Valley barn weddings | 2026-10-04 | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ✅ |
| `/blog/winter-wedding-seating` | Winter seating | 2026-10-04 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| `/blog/sweetheart-table-chair-ideas` | Sweetheart table chairs | 2026-10-04 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| `/blog/wedding-chair-rental-cost` | Budget guide | 2026-10-04 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| `/blog/south-asian-wedding-seating` | South Asian weddings, large lists | 2026-10-04 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |

## Generated, metadata and API routes

| Route | Purpose | Last touched | Status / notes |
|---|---|---|---|
| `/sitemap.xml` (`sitemap.ts`) | XML sitemap | 2026-10-31 | ✅ Includes `/book` with priorities. Next: neighborhood pages, `lastModified` on static pages. |
| `/robots.txt` (`robots.ts`) | Crawl rules | 2026-10-31 | ✅ Explicitly allows AI crawlers; blocks /admin, /api, /render. |
| `/llms.txt` | AI engine summary | 2026-10-31 | ✅ Live. Generated from site data. |
| `/opengraph-image` | Sitewide OG image | 2026-10-04 | ⚠️ Single image; add per-chair and per-post OG images. Check it shows the new brand. |
| `/icon` | Favicon | 2026-10-04 | ✅ Check it reflects the new brand. |
| `/api/leads` | Quote/waitlist/call-request submissions | 2026-10-03 | ✅ Disallowed in robots. Wire to email sequences. |
| `/api/votes` | Chair "want this" votes | 2026-10-03 | ✅ Internal. |
| `/admin`, `/admin/export` | Lead admin + CSV export | 2026-10-03 | ✅ noindex + robots disallow. Not public. |
| `/render/[slug]` | Internal still renderer | 2026-10-04 | ✅ noindex, 404 unless `ALLOW_RENDER=1`. |

---

## Remaining to improve

**`/` Home**
- Add a short answer-first "What we do / where we deliver" block naming Chicago neighborhoods and suburbs.
- Add a 4–6 question FAQ section (reuse `/faq` data) with FAQPage schema.
- Link to upcoming Chicago neighborhood and event-type landing pages.

**`/chairs`**
- Add an intro paragraph answering "Which chair rentals are available in Chicago?"; add an FAQ block.
- Add a book-a-call CTA alongside the grid (currently relies on per-card links).

**`/chairs/[slug]`**
- Add 3–4 chair-specific FAQs (capacity per table, indoor/outdoor, cushion colors, pairing ideas).
- Add dimensions/specs and per-chair OG images (renders already exist in `public/chairs/render/`).
- Add `offers`/pricing to Product schema only once real prices are set.

**`/quiz`**
- Add chair illustrations/renders to quiz answers and results (currently mostly text).
- Add a short intro paragraph and a results CTA to quote or book a call.

**`/quote`**
- Add visuals (chair render collage or 3D thumbnail) beside the form; add a mini FAQ (lead times, minimums, delivery area).
- Make the 2027 founding-season note prominent for earlier dates.

**`/book`** 
- Set `NEXT_PUBLIC_BOOKING_URL` (Calendly/Cal.com) so visitors pick a slot instead of requesting a callback.
- Add a real founder photo and one or two genuine testimonials once they exist.
- Test the fallback form in production; leads appear in /admin as `call`.

**`/about`**
- Text only: add founder photo (real, when available), chair renders or a service-area map illustration.
- List Chicago neighborhoods and suburbs served (link to neighborhood pages when they land).

**`/faq`**
- Text only: add chair illustrations or icons per section.
- Add Chicago-specific questions (city venue loading docks, parking, COI requirements, delivery to downtown high-rises).
- ~~Add a book-a-call CTA at the end.~~ Done 2026-10-31.

**`/blog` index**
- Text only: add a cover image per post (chair renders are a quick win).
- Add tag filters and a CTA band; update description to new brand.

**`/privacy`, `/terms`**
- Text only: add a light decorative illustration or header art to meet the no-text-only rule.
- Add canonical () and a "last updated" date; review terms reference to Article/Product images.

**404**
- Add a chair illustration and links to chairs, quote and book.

**Blog posts (all 11)**
- No images in any post: add a hero image (chair render or styled illustration) and inline images; add per-post OG images.
- Add answer-first TL;DR at the top and an FAQ section with FAQPage schema per post.
- Add Chicago/local angle: venues, seasons, neighborhoods (only `chiavari-chair-alternatives` and `barn-wedding-seating-ideas` have any local signal).
- `how-many-chairs-do-i-need`: add HowTo schema and a calculator widget.
- `wedding-chair-rental-cost`: add a Chicago-area price range table once real pricing is set.
- Add internal links from each post to the relevant chair pages.

**New pages to add**
- Event-type landing pages: weddings, corporate events, galas, South Asian weddings, parties.
- Chicago neighborhood/suburb landing pages (in progress in another workstream).
- Venue guides for popular Chicago venues (with real details only).
- Reviews/testimonials page once real reviews exist. Never fake ones.

## Planning guides (generated, 2026-11-01)

Seven page families built from computed data (`src/lib/planning.ts`, `src/data/seating-events.ts`, `src/data/chairs.ts`) in `src/lib/guide-content.tsx`. Every page has an accessible SVG diagram or chair imagery with alt/title/desc, a quick-answer box, FAQPage + Article + BreadcrumbList JSON-LD, a per-page OG image, internal links and a book-a-call CTA. Each family has its own sitemap (`/sitemap/N.xml`, listed in robots.txt) and a hub in the footer and `/llms.txt`. Last touched 2026-11-01 for all rows. SEO ✅ AEO ✅ GEO ⚠️ (Chicago named, no venue facts) Visuals ✅ FAQ ✅ CTA ✅.

| Family | Route | Pages | What makes each page distinct |
|---|---|---|---|
| Seating layouts | `/seating-layouts/[event]-[n]-guests` | 126 | Computed chair, table and floor-space counts, to-scale floor plan, event-specific advice, cost range |
| Room size guides | `/room-size-guides/[w]x[l]-ft-room` | 29 | Real packing math per setup, to-scale layout, which events fit |
| Chair comparisons | `/chair-comparisons/[a]-vs-[b]` | 66 | Spec table and cost from catalog, decision reasons computed from differences |
| Chair rental cost | `/chair-rental-cost/[chair]-[n]-chairs` | 36 | Price ladder, events needing about that many chairs |
| Chair fit | `/chair-fit/[chair]-for-[event]` | 98 | 5-step fit flowchart; only pairings scoring 5+ are published |
| Table guides | `/table-seating-guides/[table]` | 12 | Capacity, footprint, tables needed per guest count |
| Chicago seasons | `/chicago-event-seasons/[month]` | 12 | Month-by-month weather, event and booking notes |

Plus 7 hub pages. Total: 379 guide pages + 7 hubs.

**Held back on purpose:** area x chair and area x event combinations (thin doorway pages), named venue guides (need verified facts), chair-fit pairings scoring under 5, near-duplicate room sizes and cost quantities.

**Remaining to improve:** add real photos/video per family (Remotion clips need VideoObject schema once added); verify cost estimates when pricing is final; add venue-type guides once facts are verified; submit the 8 sitemaps in Search Console.
