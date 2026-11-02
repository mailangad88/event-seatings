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

## Changes in this release (2026-11-02): marketplace redesign

- **New design system** for the event rental marketplace pivot: light ivory/ink/brass tokens with dark and sand tone scopes, restyled utilities (pill buttons, rounded cards, boxed form fields) and a UI kit in `src/components/ui` (ProductCard, PriceTag, CategoryTile, PageHero, Section, Breadcrumbs with JSON-LD, FaqList with FAQPage JSON-LD, StepFlow flowchart, Figure, ArticleLayout with TOC, QuoteCard, QuoteCta, Callout, TrustBar, StatRow, Icon). Guide: `docs/DESIGN_SYSTEM.md`.
- **Header**: rentals mega menu (14 categories, `src/lib/nav.ts`), Book a call + Get a quote; mobile menu with category grid. **Footer**: rentals, plan and service-area columns.
- **Home** rebuilt as a marketplace: hero with Blender tablescape collage, trust bar, category grid, "Shop the look" (3 priced tablescapes), StepFlow, DIY vs us comparison, event types, service area, FAQ (FAQPage schema), guides, quote CTA.
- **New page** `/how-it-works` (StepFlow, step cards, tip, FAQ, CTA).
- **Restyled**: `/faq` (grouped topics, 16 marketplace answers), `/about` (marketplace story), `/blog` (scene-image cards), blog posts (ArticleLayout with breadcrumbs, TOC, quote sidebar, hero scene image added to BlogPosting schema), `/book` (scene image, broadened to all rentals), chair pages and cards.
- **3D**: chair studio re-lit as a light gallery (pale marble floor, light walls), all 13 chair stills re-rendered; Blender tablescape stills added under `public/images/scenes/` with alt text and captions (`src/lib/scenes.ts`).
- **Completion audit (2026-11-02 PM)**: FAQs with FAQPage schema added to `/chairs` (5) and every `/chairs/[slug]` page (5, generated from the chair data). `/quiz` rebuilt answer-first with breadcrumbs, Chicago venue and season signals, a how-it-works flowchart, 4 FAQs and a book-a-call ending; results now offer "Book a free call". Home already carries 6 FAQs with FAQPage schema. Chair style guide, quiz, 404, privacy and terms moved onto the kit; CTA bands rotate scene images per page.
- **Remaining**: `/rentals` routes come from the catalog thread; `/quote` builder from the quote thread (header and CTAs already point to both). Legal pages inherit the new styles but still have no hero visual.

## Changes in this release (2026-10-31)

Shipped in this release:

- **Rebrand** from Event Seatings to **Beyond Chiavari** (beyondchiavari.com).
- **`/book`**: "Book a 15-minute seating call", Calendly/Cal.com embed via `NEXT_PUBLIC_BOOKING_URL`, with a call-request form fallback when unset.
- **Book-a-call CTAs** in the header, mobile menu, footer, home, chair pages, about, FAQ and blog posts (each tagged with `?from=` so leads show where they came from in /admin).
- **Product + BreadcrumbList schema** on `/chairs/[slug]`.
- **Richer LocalBusiness / WebSite schema** with Chicago-first `areaServed`.
- **Canonical URLs** on all public pages.
- **`/llms.txt`** summary for AI answer engines.

## Visuals and searchable media (rule from 2026-11-01)

No page may be text-only: every page needs a chair image, a flowchart or another visual. Every image and video must be readable by Google and AI search.

- **Chair images:** `ChairArt` uses `chairAlt()` in `src/data/chairs.ts` for descriptive alt text (name, look, finishes, Chicago). Chair pages also put the image in Product schema and Open Graph.
- **3D viewers:** the live canvas has an `aria-label`, and the still render with alt text is always in the HTML for crawlers.
- **Blog posts:** each post has a `chair:` line in its header, which sets the hero image, OG image, BlogPosting `image` and sitemap image. Posts without one get a chair picked automatically, so new posts are never text-only.
- **Flowchart:** `ProcessFlow` (choose → talk → proposal → delivered → collected) is an ordered list, so search engines read every step. It's used on /about, /faq and /quote.
- **Chair strips:** `ChairStrip` adds captioned, linked chair images to /about, /quiz, /privacy and /terms.
- **Sitemap:** chair pages and posts list their images (`image:loc`) for Google Images.
- **Videos (Remotion/Blender):** none are on the site yet. When one is added, render it with `VideoFeature` (`src/components/VideoFeature.tsx`). It requires a poster, title and description, takes an optional `.vtt` captions file, and outputs VideoObject schema. Put files in `public/videos/`.

---

## Core pages

| Route | Purpose | Last touched | SEO | AEO | GEO | Visuals | FAQ | CTA |
|---|---|---|---|---|---|---|---|---|
| `/` | Home: hero 3D chair viewer, featured chairs, waitlist | 2026-10-31 | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ |
| `/chairs` | Browse/filter all chair styles | 2026-10-31 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ |
| `/chairs/[slug]` (13 chairs) | Chair detail, 3D viewer, votes, quote link | 2026-10-31 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ |
| `/quiz` | 4-question chair style quiz | 2026-11-01 | ✅ | ❌ | ❌ | ✅ | ❌ | ⚠️ |
| `/quote` | Quote request form | 2026-11-01 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ |
| `/book` | Book a 15-minute seating call | 2026-10-31 | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| `/about` | Our story, service area | 2026-11-01 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ |
| `/faq` | FAQ with FAQPage schema | 2026-11-01 | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| `/blog` | Journal index | 2026-11-01 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ❌ |
| `/privacy` | Privacy policy | 2026-11-01 | ⚠️ | n/a | n/a | ✅ | ❌ | n/a |
| `/terms` | Terms of use | 2026-11-01 | ⚠️ | n/a | n/a | ✅ | ❌ | n/a |
| 404 (`not-found.tsx`) | Not-found page | 2026-11-01 | n/a | n/a | n/a | ✅ | ❌ | ⚠️ |

## Rental catalog (`/rentals`, added 2026-11-02)

Everything-for-an-event catalog: 98 items in 14 categories, each priced at partner vendor price + 10%. Data: `src/data/catalog-products.ts` (items, category FAQs and planning steps), `src/data/catalog.ts` (published vendor offers, routing, markup via `@/lib/catalog-types`), `src/data/vendors.ts` (23 partner vendors, back end only). Research and price sheet: `docs/vendor-research.md` and the shared folder `research/vendors/`.

| Route | Purpose | Last touched | SEO | AEO | GEO | Visuals | FAQ | CTA |
|---|---|---|---|---|---|---|---|---|
| `/rentals` | Hub: 14 category tiles, how it works, three priced sample budgets | 2026-11-02 | ✅ | ✅ FAQPage | ✅ | ⚠️ icons + budget charts; no renders yet | ✅ 6 | ✅ quote, call |
| `/rentals/[category]` (14) | Answer-first intro, item grid, planning steps, price bar chart, worked budget | 2026-11-02 | ✅ | ✅ FAQPage, ItemList | ✅ | ⚠️ renders pending (chair art for chairs) | ✅ 2-4 | ✅ |
| `/rentals/[category]/[item]` (98) | Price, specs, quantity-and-cost table by guest count, planning, related items | 2026-11-02 | ✅ | ✅ Product/Offer, FAQPage, Breadcrumb | ✅ areaServed | ⚠️ renders pending | ✅ 5-6 | ✅ "Add to my quote" → `/quote?items=` |

**Remaining to improve**
- Swap the category illustrations for 3D renders: `RentalVisual` picks up `public/rentals/<folder>/<id>.webp` automatically on the next build.
- 18 items use estimated prices (marked "Est."). Replace with real quotes from the routed vendor.
- Call each partner vendor to agree referral terms before routing real leads; none has been contacted.
- Add the rentals nav link and mega menu (design-system thread owns Header).
- Add `/rentals` lines to `llms.txt`.

## Blog posts (`content/blog/*.md` → `/blog/[slug]`)

All posts share the template in `src/app/blog/[slug]/page.tsx` (Article JSON-LD, quote CTA,  book-a-call CTA). Last touched is the `.md` file; template last touched 2026-10-04.

| Route | Purpose | Last touched | SEO | AEO | GEO | Visuals | FAQ | CTA |
|---|---|---|---|---|---|---|---|---|
| `/blog/chiavari-chair-alternatives` | 12 Chiavari alternatives (pillar) | 2026-10-03 | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ |
| `/blog/cross-back-vs-chiavari` | Comparison | 2026-10-03 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| `/blog/how-many-chairs-do-i-need` | Quantity guide (HowTo candidate) | 2026-10-03 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| `/blog/ceremony-vs-reception-chairs` | Matching ceremony/reception | 2026-10-03 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| `/blog/ghost-chairs-wedding-styling` | Ghost chair styling | 2026-10-04 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| `/blog/boho-wedding-chairs` | Boho chair picks | 2026-10-04 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| `/blog/barn-wedding-seating-ideas` | Fox Valley barn weddings | 2026-10-04 | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ |
| `/blog/winter-wedding-seating` | Winter seating | 2026-10-04 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| `/blog/sweetheart-table-chair-ideas` | Sweetheart table chairs | 2026-10-04 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| `/blog/wedding-chair-rental-cost` | Budget guide | 2026-10-04 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| `/blog/south-asian-wedding-seating` | South Asian weddings, large lists | 2026-10-04 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ✅ |

## Generated, metadata and API routes

| Route | Purpose | Last touched | Status / notes |
|---|---|---|---|
| `/sitemap.xml` (`sitemap.ts`) | XML sitemap | 2026-10-31 | ✅ Includes `/book` with priorities. Next: neighborhood pages, `lastModified` on static pages. |
| `/robots.txt` (`robots.ts`) | Crawl rules | 2026-10-31 | ✅ Explicitly allows AI crawlers; blocks /admin, /api, /render. |
| `/llms.txt` | AI engine summary | 2026-10-31 | ✅ Live. Generated from site data. |
| `/opengraph-image` | Sitewide OG image | 2026-10-04 | ✅ Sitewide default; chair pages and posts now set their own OG image (chair render). |
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
- Add dimensions/specs. (Per-chair OG images done 2026-11-01.)
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
- Chair strip and flowchart added 2026-11-01. Next: a real founder photo and a service-area map.
- List Chicago neighborhoods and suburbs served (link to neighborhood pages when they land).

**`/faq`**
- Flowchart added 2026-11-01. Next: a small chair image beside each FAQ group.
- Add Chicago-specific questions (city venue loading docks, parking, COI requirements, delivery to downtown high-rises).
- ~~Add a book-a-call CTA at the end.~~ Done 2026-10-31.

**`/blog` index**
- Thumbnails added 2026-11-01. Next: tag filters.
- Add tag filters and a CTA band; update description to new brand.

**`/privacy`, `/terms`**
- Chair strip added 2026-11-01.
- Canonical done; keep the "last updated" date current.

**404**
- Chair image and links to home and chairs added 2026-11-01.

**Blog posts (all 11)**
- Hero image, OG image and schema image added 2026-11-01 via the `chair:` header. Next: inline images or diagrams (e.g. a seating-count flowchart in the quantity guide) and real event photos.
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
