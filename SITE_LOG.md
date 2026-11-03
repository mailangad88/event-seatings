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

## Changes in this release (2026-11-03): photo-style product images

- All 117 product shots (`public/rentals/<category>/<id>.webp`) re-rendered with the photoreal pipeline (`blender/rentals/photoreal.py`): real HDRI light (Poly Haven, CC0), photo-scanned floors and lawn, edge bevels, depth of field, and a camera finish (grain, vignette, lens fringing) in `photo_finish.py`. Furniture is pictured in a room corner, tableware on a linen tablecloth, tents and lawn items in a real park photo.
- Alt text now describes the item and its setting and ends "(photorealistic visualization)"; manifest entries carry `setting`. These images are also the references the Gemini styled scenes are built from.
- Remaining: 141 colour variants and angles plus 28 setups are still the older studio renders (`setting: "classic"`); re-render with `render.py --all --skip-existing` after deleting their PNGs.

## Changes in this release (2026-11-03): launch-risk fixes from the AI Council review

- **Fee before vendor name.** New customer proposal page `/proposal/<token>` (noindex, disallowed in robots). It shows the items, the rental company's price and our fee as separate lines, and hides the rental company's name, phone and website until the booking fee (or a refundable hold, `BOOKING_CHARGE=hold`) is paid. Created from the new "Customer proposal" card on `/admin/leads/<id>`, with Mark paid / Mark refunded for payments outside Stripe.
- **Stripe Checkout, off by default.** `src/lib/payments.ts` + `/api/stripe/webhook` (signature-checked). Nothing changes until `STRIPE_SECRET_KEY` is set; until then the proposal says "we'll send a secure payment link". Needs `supabase/schema.sql` re-run (new lead columns).
- **Promises made true.** "Insured vendors" became "vetted vendors, asked for proof of insurance" on /booking-promise, /how-it-works, /terms, the trust bar and the quote form (no COI claims; includes PR #32's geo-page fixes). The one-business-hour reply promise now appears only when `NEXT_PUBLIC_BUSINESS_HOURS` is set; otherwise it says one business day. Terms and FAQs now say the vendor is named after the fee, with a 72-hour full refund if the customer rejects the vendor's agreement.
- **Price disclaimer.** `PriceDisclaimer` ("based on local rental companies' published rates plus our booking fee; final quote confirmed by the rental company") on /rentals, every category and item page, and the quote builder.
- **Vendor opt-out.** New `/vendor-listings` page (how listings work, no vendor names shown, listing ≠ partnership, correct/remove form saved as a `partner` lead with source `vendor-listings`), linked from the footer, /partners and every price disclaimer on rental pages.
- Owner setup steps: `/mnt/project-files/growth/go-live-checklist.md`.

## Changes in this release (2026-11-02): business model and payments

- Business model chosen (plan: `/mnt/project-files/plans/business-model.md`): the customer pays a 10% booking fee (already inside every price) to Beyond Chiavari when they approve a vendor-confirmed proposal; rentals are paid to the vendor under its own agreement; vendors pay 0% for 90 days, then 5%.
- **New pages:** `/booking-promise` (payments, deposits, damage, insurance, guarantee) and `/partners` (vendor sign-up; applications appear in `/admin/leads` as "Vendor application"). Re-run `supabase/schema.sql` so the `partner` form type is allowed.
- `/how-it-works`, `/terms`, quote form footer, trust bar, footer, sitemap and llms.txt updated for the model.
- **Booking opened now:** removed "first deliveries April 2027" notes (`site.launch` in `src/lib/site.ts`), guides, looks FAQ, OG image and geo copy.
- Remaining: attorney review of `/terms` and `/booking-promise`; Stripe payment link for the fee; geo pages still describe "our" chairs and a St. Charles home base in places.

## Changes in this release (2026-11-02): real event photos

- **74 real photos** (Unsplash License, free for commercial use) in `src/data/stock-photos.ts`, each checked on its Unsplash page for image id, photographer and free (not Unsplash+) status. Hotlinked from Unsplash's CDN with `auto=format`, so they skip Next's image optimizer.
- **Price-list items:** 2,318 of 2,447 items that only had a category icon now show a real photo of the same item type (bounce houses, glassware, chafing dishes, tents, linens, neon signs…), matched by name then vendor section. Every one carries an "Example photo" label. 41 items (generators, cords, fans, trash cans, game tables) keep their icon on purpose because no honest photo exists yet; 88 more show the icon in lists and category photos on their page.
- **Item pages:** new "Real event photos" gallery (3 photos + credits + disclaimer), ImageObject schema with creator, creditText, license and acquireLicensePage, and an OG image when there is no render.
- **Category pages:** "At real events" strip (4 photos), 44px photo thumbnails in the full price list, real photo instead of the icon in the header when a category has no scene render, ImageObject schema.
- **Quote builder:** non-rendered items show their photo (sent as a short key to keep the payload small).
- **New page `/photo-credits`:** every photo with credit, ImageGallery schema; linked from the footer and in the sitemap.
- 3D renders still win wherever they exist. Vendor product photos need written permission first: `marketing/vendor-photo-permission-request.md` in the shared folder.

## Changes in this release (2026-11-02): site review fixes

- Full crawl of 3,601 URLs: all 200, 0 broken internal links, 0 duplicate titles after this release. Review and prioritised list: project files `reviews/site-review-2026-11-02.md`.
- Home title, site description (LocalBusiness schema, llms.txt) and /events meta now describe the whole rental marketplace, not just chairs.
- Item pages: unique titles for same-name sizes, correct "a/an" and name casing, rotating related items (internal links reach every item), sticky price + "Add to quote" bar on phones, "Priced: each" row dropped.
- Mobile: chat button is icon-only on phones (it covered buttons), home categories in 2 columns, /quote hero image desktop-only so the builder starts on screen one.
- 7 guide hubs gained 3 FAQs each with FAQPage schema.
- /api/leads: if storage fails, the lead is logged in full (`LEAD_SAVE_FAILED`) and still emailed/synced instead of being lost.
- Remaining: FAQs on 38 pages (11 old posts, 20 blog topic pages, a few hubs), long titles/descriptions, real item photos, analytics + Supabase env vars on Vercel.

## Changes in this release (2026-11-02): marketplace redesign

- **New design system** for the event rental marketplace pivot: light ivory/ink/brass tokens with dark and sand tone scopes, restyled utilities (pill buttons, rounded cards, boxed form fields) and a UI kit in `src/components/ui` (ProductCard, PriceTag, CategoryTile, PageHero, Section, Breadcrumbs with JSON-LD, FaqList with FAQPage JSON-LD, StepFlow flowchart, Figure, ArticleLayout with TOC, QuoteCard, QuoteCta, Callout, TrustBar, StatRow, Icon). Guide: `docs/DESIGN_SYSTEM.md`.
- **Header**: rentals mega menu (19 categories derived from the catalog, `src/lib/nav.ts`), Book a call + Get a quote; mobile menu with category grid. **Footer**: rentals, plan and service-area columns.
- **Home** rebuilt as a marketplace: hero with Blender tablescape collage, trust bar, category grid, "Shop the look" (3 priced tablescapes), StepFlow, DIY vs us comparison, event types, service area, FAQ (FAQPage schema), guides, quote CTA.
- **New page** `/how-it-works` (StepFlow, step cards, tip, FAQ, CTA).
- **Restyled**: `/faq` (grouped topics, 16 marketplace answers), `/about` (marketplace story), `/blog` (scene-image cards), blog posts (ArticleLayout with breadcrumbs, TOC, quote sidebar, hero scene image added to BlogPosting schema), `/book` (scene image, broadened to all rentals), chair pages and cards.
- **3D**: chair studio re-lit as a light gallery (pale marble floor, light walls), all 13 chair stills re-rendered; Blender tablescape stills added under `public/images/scenes/` with alt text and captions (`src/lib/scenes.ts`).
- **Completion audit (2026-11-02 PM)**: FAQs with FAQPage schema added to `/chairs` (5) and every `/chairs/[slug]` page (5, generated from the chair data). `/quiz` rebuilt answer-first with breadcrumbs, Chicago venue and season signals, a how-it-works flowchart, 4 FAQs and a book-a-call ending; results now offer "Book a free call". Home already carries 6 FAQs with FAQPage schema. Chair style guide, quiz, 404, privacy and terms moved onto the kit; CTA bands rotate scene images per page.
- **Remaining**: `/rentals` routes come from the catalog thread; `/quote` builder from the quote thread (header and CTAs already point to both). Legal pages inherit the new styles but still have no hero visual.

## Changes in this release (2026-11-02): quote builder + lead CRM

- `/quote` is now a quote builder. Visitors enter a guest count, pick items from `src/data/catalog.ts` with quantities (chairs auto-fill to the guest count), and see a live estimate. Customer price = vendor price + 10%, computed only in `src/lib/catalog-types.ts`. The server re-prices every submission; vendor names and costs never reach the browser. FAQ section with FAQPage + OfferCatalog schema.
- `/admin/leads` is the CRM: pipeline stages with counts and quote value, follow-ups due/overdue, search and filters, one-click "Mark contacted". `/admin/leads/[id]` shows contact + event, priced line items with vendor cost and margin, a copy-ready order per vendor, attribution (UTM first/last touch), and a form to change stage, assign a rental partner, set the next follow-up, record a lost reason and log calls/emails/texts/notes to a timeline.
- Owner email and HubSpot deal now carry the quote total and items. CSV export includes stage, items, totals, vendor, follow-up and notes.
- Remaining: real vendor catalog (in progress in a parallel branch), automatic follow-up reminders (daily email of due follow-ups), customer-facing proposal PDF, vendor availability confirmation flow.

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
- **3D rental renders (Blender, 2026-11-02):** every curated catalog item (117 rentals, incl. concessions, AV, restrooms/power and fencing added Nov 2) has a 1600px studio render, plus 28 16:9 event setups and category heroes, 113 second-angle shots (`<id>--angle`) and 47 colour/finish variants (`<id>--<colour>`, e.g. `round-floor-length--navy`, `velvet-dining--blush`) at 1200px: 305 images in `public/rentals/<category>/<slug>.webp`. `imagesFor(id)` returns an item's main render, variants and angle (the quote picker uses the variants as colour swatches). Alt text and captions live in `blender/rentals/catalog.py` and are published to `src/data/rental-images.json` (`rentalImage(slug)`, `productImages`, `sceneImages`). The 13 collection chairs now show their Blender render first. `/gallery` lists every image with ImageGallery + ImageObject schema, and the sitemap lists them as `image:loc`. How to add or re-render: `blender/rentals/README.md`.
- **Videos (Remotion/Blender):** none are on the site yet. When one is added, render it with `VideoFeature` (`src/components/VideoFeature.tsx`). It requires a poster, title and description, takes an optional `.vtt` captions file, and outputs VideoObject schema. Put files in `public/videos/`.

---

## Core pages

| Route | Purpose | Last touched | SEO | AEO | GEO | Visuals | FAQ | CTA |
|---|---|---|---|---|---|---|---|---|
| `/` | Home: hero 3D chair viewer, featured chairs, waitlist | 2026-10-31 | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ |
| `/chairs` | Browse/filter all chair styles | 2026-10-31 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ |
| `/chairs/[slug]` (13 chairs) | Chair detail, 3D viewer, votes, quote link (image now the Blender studio render) | 2026-11-02 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ |
| `/gallery` | 3D rental gallery: 117 product renders, 28 setups/heroes, 160 extra colours and angles, by category | 2026-11-02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/quiz` | 4-question chair style quiz | 2026-11-01 | ✅ | ❌ | ❌ | ✅ | ❌ | ⚠️ |
| `/quote` | Quote builder: pick items + quantities, live estimate (vendor price + 10%), FAQ + OfferCatalog schema | 2026-11-02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/book` | Book a 15-minute seating call | 2026-10-31 | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| `/about` | Our story, service area | 2026-11-01 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ |
| `/faq` | FAQ with FAQPage schema | 2026-11-01 | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| `/blog` | Journal index: topic browser + latest 24 guides | 2026-11-02 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ |
| `/blog/topic/[topic]` | 20 topic hubs (CollectionPage + ItemList + BreadcrumbList) | 2026-11-02 | ✅ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ |
| `/privacy` | Privacy policy | 2026-11-01 | ⚠️ | n/a | n/a | ✅ | ❌ | n/a |
| `/terms` | Terms of use: broker model, 10% booking fee, who you pay, Booking Promise, damage, liability cap | 2026-11-02 | ✅ | n/a | n/a | ✅ | ❌ | n/a |
| `/how-it-works` | Four steps from quote to pickup, who you pay, Booking Promise summary, FAQ | 2026-11-02 | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| `/booking-promise` | Payments, deposits, damage waiver, insurance/COI, six-point Booking Promise, payment StepFlow + schedule table, 8 FAQs | 2026-11-02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/partners` | Vendor sign-up: why join, Founding Partner terms (0% for 90 days, then 5%), flow, application form (kind `partner`), 6 FAQs | 2026-11-02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 404 (`not-found.tsx`) | Not-found page | 2026-11-01 | n/a | n/a | n/a | ✅ | ❌ | ⚠️ |

## Rental catalog (`/rentals`, added 2026-11-02)

Everything-for-an-event catalog: about 2,570 items in 19 categories, each priced at partner vendor price + 10%. 111 curated "featured" products live in `src/data/catalog-products.ts` (items, category FAQs and planning steps) with offers in `src/data/catalog.ts`; about 2,450 more rows come from six vendors' complete public price lists, generated into `src/data/catalog-inventory.json` by `python3 scripts/build-inventory.py` from `docs/vendor-data/full-*.json`. Vendors: `src/data/vendors.ts` (24, back end only). Research and price sheet: `docs/vendor-research.md` and the shared folder `research/vendors/`.

| Route | Purpose | Last touched | SEO | AEO | GEO | Visuals | FAQ | CTA |
|---|---|---|---|---|---|---|---|---|
| `/rentals` | Hub: 19 category tiles, how it works, three priced sample budgets | 2026-11-02 | ✅ | ✅ FAQPage | ✅ | ✅ renders + budget charts | ✅ 6 | ✅ quote, call |
| `/rentals/[category]` (19) | Answer-first intro, featured item grid, full price-list tables by vendor section, planning steps, price bar chart, worked budget | 2026-11-02 | ✅ | ✅ FAQPage, ItemList | ✅ | ✅ renders (icons for the 5 new categories until rendered) | ✅ 2-4 | ✅ |
| `/rentals/[category]/[item]` (~2,570) | Price, specs, quantity-and-cost table by guest count, planning, related items | 2026-11-02 | ✅ | ✅ Product/Offer, FAQPage, Breadcrumb | ✅ areaServed | ⚠️ renders for featured items; inventory rows use category icons | ✅ 5-6 | ✅ "Add to my quote" → `/quote?items=` |

**Remaining to improve**
- Render the 13 new featured items and the 5 new category folders (concessions, photo-booths, av, restrooms-power, fencing).
- Inventory item pages share category FAQs and icons, so they are thinner than featured pages; promote the most-searched rows to featured with a render and custom copy.
- 21 items use estimated prices (marked "Est."). Replace with real quotes from the routed vendor.
- Missing from vendor lists: Playhouse obstacle courses and dry slides, TheJumperStore obstacle courses, House of Rental staging and dance floors (quote-only).
- Call each partner vendor to agree referral terms before routing real leads; none has been contacted.

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

## Journal guides (added 2026-11-02, PR #16)

501 new guides in 19 topic hubs (`/blog/topic/[topic]`). The tablecloth size chart is the model post. Every guide passed `node scripts/check-posts.mjs`: a quick-answer box, at least one custom inline SVG diagram (with `<title>`/`<desc>`) plus at least two more visual blocks, 5 or more FAQs (FAQPage schema), BlogPosting + BreadcrumbList schema, 900+ words, valid internal links and a /book or /quote CTA. Hero art: `public/blog/art/<topic>.svg` (generated by `scripts/journal-art.py`) or a chair photo. Writing rules: `docs/journal-writing-guide.md`.

Columns: SEO = title, description, keyword, canonical; AEO = answer box + FAQ schema; GEO = Chicago/suburb specifics; Visuals = SVG diagram + 2 more blocks. All new guides score ✅ on SEO, AEO, Visuals, FAQ and CTA, so the tables list only what varies.

**Remaining for all journal guides**
- Replace topic hero art with real photos or 3D renders of tables, linens, dinnerware and tents once they exist (chair posts already use chair renders).
- Re-link plain-text mentions once these planned posts ship: `outdoor-event-chairs-chicago-weather`, `when-to-book-event-chair-rentals-chicago`, `chicago-venue-rules-chair-rentals`, `chair-rental-delivery-chicago-suburbs`, `last-minute-chair-rental-chicago`, `quinceanera-chair-rental-chicago` (on other branches).
- Link to the catalog item pages (`/rentals/[category]/[item]`) once that branch merges.
- Posts under 1,000 words (shown below) are the first candidates for expansion.
- Facts that writers could not verify were left out and replaced with "check with your village / park district / venue". Owner review is worth it on permits, sunset times and park district names in the Chicago Planning and Suburb Guides topics.
- Prices: only chair estimates from `src/data/chairs.ts` appear. Add other item prices when the catalog pricing (with the 10% markup) is final.

### Chairs (25), hub `/blog/topic/chairs`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/bentwood-bistro-chairs-wedding` | bentwood bistro chairs wedding | 2026-11-02 | 945 | 7 | Expand past 1,000 words |
| `/blog/cane-back-chairs-wedding` | cane back chairs wedding | 2026-11-02 | 905 | 7 | Expand past 1,000 words |
| `/blog/chair-back-decor-florals-and-signs` | wedding chair decor ideas | 2026-11-02 | 941 | 7 | Expand past 1,000 words |
| `/blog/chair-setup-and-breakdown-who-does-what` | chair setup and breakdown who does what | 2026-11-02 | 994 | 7 | Expand past 1,000 words |
| `/blog/chair-weight-capacity-and-seat-sizes` | chair weight capacity event rental | 2026-11-02 | 1098 | 7 | Real photo hero; review after Search Console data |
| `/blog/chairs-on-grass-sand-gravel` | chairs on grass sand gravel | 2026-11-02 | 990 | 7 | Expand past 1,000 words |
| `/blog/chiavari-chair-rental-chicago` | Chiavari chair rental Chicago | 2026-11-02 | 1040 | 7 | Real photo hero; review after Search Console data |
| `/blog/comfortable-chairs-for-older-guests` | comfortable chairs for older guests | 2026-11-02 | 1000 | 7 | Real photo hero; review after Search Console data |
| `/blog/cross-back-chair-rental-chicago` | cross-back chair rental Chicago | 2026-11-02 | 1168 | 7 | Real photo hero; review after Search Console data |
| `/blog/do-you-need-chair-cushions` | do you need chair cushions | 2026-11-02 | 996 | 7 | Expand past 1,000 words |
| `/blog/garden-folding-chairs-vs-white-plastic` | garden folding chairs vs white folding chairs | 2026-11-02 | 1013 | 7 | Real photo hero; review after Search Console data |
| `/blog/ghost-chair-rental-chicago` | ghost chair rental Chicago | 2026-11-02 | 1101 | 7 | Real photo hero; review after Search Console data |
| `/blog/gold-infinity-chairs-galas` | gold infinity chairs gala | 2026-11-02 | 938 | 7 | Expand past 1,000 words |
| `/blog/how-to-spot-quality-rental-chair` | how to check rental chair quality | 2026-11-02 | 1028 | 7 | Real photo hero; review after Search Console data |
| `/blog/king-and-queen-chairs-wedding` | king and queen chairs wedding | 2026-11-02 | 1002 | 7 | Real photo hero; review after Search Console data |
| `/blog/louis-chairs-head-table` | louis chairs head table | 2026-11-02 | 926 | 7 | Expand past 1,000 words |
| `/blog/mixing-chair-styles-at-reception` | mixing chair styles at wedding reception | 2026-11-02 | 912 | 7 | Expand past 1,000 words |
| `/blog/mr-and-mrs-chair-signs` | mr and mrs chair signs | 2026-11-02 | 965 | 7 | Expand past 1,000 words |
| `/blog/rattan-chairs-garden-party` | rattan chairs garden party | 2026-11-02 | 1047 | 7 | Real photo hero; review after Search Console data |
| `/blog/shell-chairs-corporate-events` | shell chairs corporate events | 2026-11-02 | 1092 | 7 | Real photo hero; review after Search Console data |
| `/blog/stackable-vs-non-stackable-chairs` | stackable vs non-stackable chairs | 2026-11-02 | 1020 | 7 | Real photo hero; review after Search Console data |
| `/blog/throne-chair-rental-guide` | throne chair rental | 2026-11-02 | 987 | 7 | Expand past 1,000 words |
| `/blog/velvet-chairs-by-season-and-color` | velvet chairs wedding colors | 2026-11-02 | 910 | 7 | Expand past 1,000 words |
| `/blog/windsor-chairs-farmhouse-wedding` | windsor chairs farmhouse wedding | 2026-11-02 | 980 | 7 | Expand past 1,000 words |
| `/blog/wishbone-chairs-modern-wedding` | wishbone chairs wedding | 2026-11-02 | 982 | 7 | Expand past 1,000 words |

### Tables (25), hub `/blog/topic/tables`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/banquet-table-sizes-6-ft-vs-8-ft` | banquet table sizes 6 ft vs 8 ft | 2026-11-02 | 1007 | 6 | Real photo hero; review after Search Console data |
| `/blog/buffet-table-layouts` | buffet table layout | 2026-11-02 | 1128 | 6 | Real photo hero; review after Search Console data |
| `/blog/cake-gift-guest-book-table-checklist` | cake table gift table guest book table size | 2026-11-02 | 1041 | 6 | Real photo hero; review after Search Console data |
| `/blog/cocktail-highboy-vs-lowboy-tables` | highboy vs lowboy cocktail tables | 2026-11-02 | 1103 | 6 | Real photo hero; review after Search Console data |
| `/blog/dj-and-band-table-setup` | DJ table setup size | 2026-11-02 | 1097 | 6 | Real photo hero; review after Search Console data |
| `/blog/farm-tables-for-weddings` | farm tables for weddings | 2026-11-02 | 1029 | 6 | Real photo hero; review after Search Console data |
| `/blog/folding-vs-heavy-wood-tables` | folding tables vs wood tables rental | 2026-11-02 | 918 | 6 | Expand past 1,000 words |
| `/blog/head-table-setups-long-u-e-shape` | head table setups | 2026-11-02 | 1106 | 6 | Real photo hero; review after Search Console data |
| `/blog/how-many-cocktail-tables-for-standing-reception` | how many cocktail tables for a standing reception | 2026-11-02 | 987 | 6 | Expand past 1,000 words |
| `/blog/how-many-tables-for-50-100-150-200-guests` | how many tables for 100 guests | 2026-11-02 | 1378 | 7 | Real photo hero; review after Search Console data |
| `/blog/kids-table-wedding-ideas` | kids table at a wedding | 2026-11-02 | 1149 | 6 | Real photo hero; review after Search Console data |
| `/blog/long-tables-vs-round-tables-wedding` | long tables vs round tables wedding | 2026-11-02 | 947 | 6 | Expand past 1,000 words |
| `/blog/mix-round-and-long-tables` | mixing round and long tables | 2026-11-02 | 1077 | 6 | Real photo hero; review after Search Console data |
| `/blog/picnic-tables-for-casual-events` | picnic table rental for events | 2026-11-02 | 1035 | 6 | Real photo hero; review after Search Console data |
| `/blog/reception-table-names-and-seating-map` | wedding reception table names and seating chart | 2026-11-02 | 1015 | 6 | Real photo hero; review after Search Console data |
| `/blog/round-table-sizes-and-seating-48-60-66-72-inch` | round table sizes and seating | 2026-11-02 | 1107 | 7 | Real photo hero; review after Search Console data |
| `/blog/serpentine-and-crescent-tables` | serpentine and crescent tables | 2026-11-02 | 1159 | 6 | Real photo hero; review after Search Console data |
| `/blog/square-tables-for-dinner-parties` | square tables for dinner parties | 2026-11-02 | 1005 | 6 | Real photo hero; review after Search Console data |
| `/blog/sweetheart-table-sizes` | sweetheart table sizes | 2026-11-02 | 981 | 6 | Expand past 1,000 words |
| `/blog/table-heights-standard-counter-bar` | table heights standard counter bar | 2026-11-02 | 937 | 6 | Expand past 1,000 words |
| `/blog/table-numbers-and-placement` | table numbers for wedding placement | 2026-11-02 | 949 | 6 | Expand past 1,000 words |
| `/blog/table-rental-for-outdoor-events-level-ground` | outdoor table rental level ground | 2026-11-02 | 1001 | 6 | Real photo hero; review after Search Console data |
| `/blog/table-rental-for-small-spaces` | table rental for small spaces | 2026-11-02 | 985 | 6 | Expand past 1,000 words |
| `/blog/table-spacing-and-aisle-clearance` | how far apart should tables be at a wedding | 2026-11-02 | 1049 | 6 | Real photo hero; review after Search Console data |
| `/blog/what-fits-on-a-60-inch-round-table` | what fits on a 60 inch round table | 2026-11-02 | 1123 | 6 | Real photo hero; review after Search Console data |

### Linens & Napkins (26), hub `/blog/topic/linens-and-napkins`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/chair-sashes-and-covers-worth-it` | chair covers and sashes worth it | 2026-11-02 | 1209 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-fall-wedding-linen-colors` | fall wedding linen colors | 2026-11-02 | 1179 | 6 | Real photo hero; review after Search Console data |
| `/blog/cloth-napkin-sizes-and-colors` | cloth napkin sizes | 2026-11-02 | 1237 | 6 | Real photo hero; review after Search Console data |
| `/blog/do-you-wash-rental-linens` | do you wash rental linens | 2026-11-02 | 1143 | 6 | Real photo hero; review after Search Console data |
| `/blog/farm-table-linens-runner-only` | farm table linens | 2026-11-02 | 1223 | 6 | Real photo hero; review after Search Console data |
| `/blog/how-far-ahead-to-order-linens` | how far ahead to order linens | 2026-11-02 | 992 | 6 | Expand past 1,000 words |
| `/blog/how-many-napkins-per-guest` | how many napkins per guest | 2026-11-02 | 1023 | 6 | Real photo hero; review after Search Console data |
| `/blog/ivory-vs-white-linens` | ivory vs white linens | 2026-11-02 | 1218 | 6 | Real photo hero; review after Search Console data |
| `/blog/linen-budget-split` | linen budget for wedding | 2026-11-02 | 1112 | 6 | Real photo hero; review after Search Console data |
| `/blog/linen-colors-by-season` | linen colors by season | 2026-11-02 | 1068 | 6 | Real photo hero; review after Search Console data |
| `/blog/linen-fabrics-compared` | linen fabrics compared | 2026-11-02 | 1143 | 6 | Real photo hero; review after Search Console data |
| `/blog/linen-ordering-checklist` | linen ordering checklist | 2026-11-02 | 1034 | 6 | Real photo hero; review after Search Console data |
| `/blog/linen-stain-and-damage-policies` | linen rental damage policy | 2026-11-02 | 1230 | 6 | Real photo hero; review after Search Console data |
| `/blog/matching-linens-to-chairs` | matching linens to chairs | 2026-11-02 | 1113 | 6 | Real photo hero; review after Search Console data |
| `/blog/napkin-folds-for-events` | napkin folds for events | 2026-11-02 | 1252 | 6 | Real photo hero; review after Search Console data |
| `/blog/napkin-rings-and-placement` | napkin placement on table | 2026-11-02 | 1034 | 6 | Real photo hero; review after Search Console data |
| `/blog/overlays-and-layered-linens` | layered linens overlays | 2026-11-02 | 1202 | 6 | Real photo hero; review after Search Console data |
| `/blog/placemats-chargers-vs-tablecloths` | chargers vs placemats vs tablecloths | 2026-11-02 | 997 | 6 | Expand past 1,000 words |
| `/blog/pleated-table-skirting-head-table-buffet` | table skirting for buffet and head table | 2026-11-02 | 1034 | 6 | Real photo hero; review after Search Console data |
| `/blog/round-vs-rectangular-table-linens` | round vs rectangular table linens | 2026-11-02 | 1043 | 6 | Real photo hero; review after Search Console data |
| `/blog/sequin-linens-for-glam-events` | sequin linens | 2026-11-02 | 1168 | 6 | Real photo hero; review after Search Console data |
| `/blog/spandex-covers-cocktail-tables` | spandex cocktail table covers | 2026-11-02 | 1203 | 6 | Real photo hero; review after Search Console data |
| `/blog/table-runner-sizes-and-styles` | table runner sizes | 2026-11-02 | 1235 | 6 | Real photo hero; review after Search Console data |
| `/blog/tablecloth-colors-for-photos` | tablecloth colors for photos | 2026-11-02 | 940 | 6 | Expand past 1,000 words |
| `/blog/tablecloth-size-chart` | tablecloth size chart | 2026-11-02 | 1457 | 6 | Real photo hero; review after Search Console data |
| `/blog/textured-linens-for-events` | textured table linens | 2026-11-02 | 920 | 6 | Expand past 1,000 words |

### Dinnerware (25), hub `/blog/topic/dinnerware`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/appetizer-plates-cocktail-hour` | appetizer plates for cocktail hour | 2026-11-02 | 997 | 6 | Expand past 1,000 words |
| `/blog/are-charger-plates-worth-it` | are charger plates worth it | 2026-11-02 | 1042 | 6 | Real photo hero; review after Search Console data |
| `/blog/bread-and-butter-plates-do-you-need` | bread and butter plates | 2026-11-02 | 965 | 6 | Expand past 1,000 words |
| `/blog/casual-place-setting-diagram` | casual place setting diagram | 2026-11-02 | 1040 | 6 | Real photo hero; review after Search Console data |
| `/blog/china-for-100-guest-wedding` | china for 100 guest wedding | 2026-11-02 | 945 | 6 | Expand past 1,000 words |
| `/blog/china-rental-guide-what-pieces-exist` | china rental guide | 2026-11-02 | 1229 | 6 | Real photo hero; review after Search Console data |
| `/blog/colored-and-patterned-plates-trend` | colored and patterned plates for events | 2026-11-02 | 951 | 6 | Expand past 1,000 words |
| `/blog/compostable-vs-rented-china` | compostable vs rented china | 2026-11-02 | 994 | 6 | Expand past 1,000 words |
| `/blog/dessert-and-cake-plates-how-many` | how many dessert plates for cake | 2026-11-02 | 983 | 6 | Expand past 1,000 words |
| `/blog/dinnerware-delivery-and-packing-crates` | dinnerware delivery and packing crates | 2026-11-02 | 945 | 6 | Expand past 1,000 words |
| `/blog/dinnerware-for-brunch-events` | dinnerware for brunch events | 2026-11-02 | 956 | 6 | Expand past 1,000 words |
| `/blog/dinnerware-for-dinner-party-at-home` | dinnerware for dinner party at home | 2026-11-02 | 982 | 6 | Expand past 1,000 words |
| `/blog/dinnerware-for-kids-at-events` | dinnerware for kids at events | 2026-11-02 | 986 | 6 | Expand past 1,000 words |
| `/blog/dinnerware-sizes-buffet-plated-family-style` | dinnerware for buffet vs plated vs family style | 2026-11-02 | 992 | 6 | Expand past 1,000 words |
| `/blog/do-you-wash-rental-dishes` | do you wash rental dishes | 2026-11-02 | 998 | 6 | Expand past 1,000 words |
| `/blog/family-style-serving-ware` | family style serving ware | 2026-11-02 | 955 | 6 | Expand past 1,000 words |
| `/blog/friendsgiving-thanksgiving-dinnerware` | thanksgiving dinnerware rental | 2026-11-02 | 993 | 6 | Expand past 1,000 words |
| `/blog/gold-rim-vs-white-china` | gold rim vs white china | 2026-11-02 | 987 | 6 | Expand past 1,000 words |
| `/blog/how-many-plates-per-guest` | how many plates per guest | 2026-11-02 | 992 | 6 | Expand past 1,000 words |
| `/blog/how-to-set-tables-fast-with-a-crew` | how to set tables fast | 2026-11-02 | 942 | 6 | Expand past 1,000 words |
| `/blog/matching-dinnerware-to-linens` | matching dinnerware to linens | 2026-11-02 | 910 | 6 | Expand past 1,000 words |
| `/blog/multi-course-place-setting-etiquette` | multi course place setting | 2026-11-02 | 964 | 6 | Expand past 1,000 words |
| `/blog/place-setting-spacing-measurements` | place setting measurements | 2026-11-02 | 1013 | 6 | Real photo hero; review after Search Console data |
| `/blog/rental-breakage-and-loss-fees-explained` | rental breakage fees | 2026-11-02 | 961 | 6 | Expand past 1,000 words |
| `/blog/serving-platters-and-bowls-rental` | serving platters and bowls rental | 2026-11-02 | 961 | 6 | Expand past 1,000 words |

### Glassware & Bar (25), hub `/blog/topic/glassware-and-bar`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/bar-placement-floor-plan` | bar placement event floor plan | 2026-11-02 | 1067 | 6 | Real photo hero; review after Search Console data |
| `/blog/bar-setup-for-100-guests` | bar setup for 100 guests | 2026-11-02 | 1027 | 7 | Real photo hero; review after Search Console data |
| `/blog/bar-tools-and-cocktail-napkins-checklist` | bar tools checklist for events | 2026-11-02 | 910 | 6 | Expand past 1,000 words |
| `/blog/beer-and-wine-only-bar-setup` | beer and wine only bar setup | 2026-11-02 | 961 | 6 | Expand past 1,000 words |
| `/blog/champagne-flutes-vs-coupes` | champagne flutes vs coupes | 2026-11-02 | 999 | 6 | Expand past 1,000 words |
| `/blog/coffee-and-tea-service-rental` | coffee and tea service rental | 2026-11-02 | 971 | 6 | Expand past 1,000 words |
| `/blog/dry-hire-vs-full-service-bar` | dry hire vs full service bar | 2026-11-02 | 982 | 6 | Expand past 1,000 words |
| `/blog/glass-rack-logistics-rental-returns` | glassware rental return rack | 2026-11-02 | 974 | 6 | Expand past 1,000 words |
| `/blog/gold-flatware-wedding-trend` | gold flatware wedding | 2026-11-02 | 985 | 6 | Expand past 1,000 words |
| `/blog/hot-cocoa-bar-winter-event` | hot cocoa bar for winter event | 2026-11-02 | 957 | 6 | Expand past 1,000 words |
| `/blog/how-many-bartenders-for-wedding` | how many bartenders per guests | 2026-11-02 | 1046 | 7 | Real photo hero; review after Search Console data |
| `/blog/how-many-forks-knives-spoons-per-guest` | how much flatware per guest | 2026-11-02 | 984 | 6 | Expand past 1,000 words |
| `/blog/how-many-glasses-per-guest` | how many glasses per guest | 2026-11-02 | 1197 | 6 | Real photo hero; review after Search Console data |
| `/blog/how-much-ice-for-a-party` | how much ice for a party | 2026-11-02 | 969 | 6 | Expand past 1,000 words |
| `/blog/illinois-alcohol-rules-private-events` | Illinois alcohol rules private events | 2026-11-02 | 1133 | 6 | Real photo hero; review after Search Console data |
| `/blog/kids-glassware-and-toasts` | kids glassware for events | 2026-11-02 | 941 | 6 | Expand past 1,000 words |
| `/blog/late-night-coffee-bar` | late night coffee bar wedding | 2026-11-02 | 968 | 6 | Expand past 1,000 words |
| `/blog/mobile-bar-vs-back-bar-rental` | mobile bar rental vs back bar | 2026-11-02 | 1042 | 6 | Real photo hero; review after Search Console data |
| `/blog/mocktail-bar-ideas` | mocktail bar ideas | 2026-11-02 | 967 | 6 | Expand past 1,000 words |
| `/blog/place-setting-diagram-formal-dinner` | formal place setting diagram | 2026-11-02 | 1013 | 6 | Real photo hero; review after Search Console data |
| `/blog/plastic-vs-glass-outdoor-events-parks` | plastic vs glass outdoor events | 2026-11-02 | 1051 | 6 | Real photo hero; review after Search Console data |
| `/blog/signature-cocktail-station-ideas` | signature cocktail station | 2026-11-02 | 957 | 6 | Expand past 1,000 words |
| `/blog/water-station-infused-water-dispenser` | infused water dispenser event | 2026-11-02 | 929 | 6 | Expand past 1,000 words |
| `/blog/wedding-glassware-types-explained` | types of glassware for wedding | 2026-11-02 | 1060 | 6 | Real photo hero; review after Search Console data |
| `/blog/wine-service-tips-for-events` | wine service tips for events | 2026-11-02 | 949 | 6 | Expand past 1,000 words |

### Tents (25), hub `/blog/topic/tents`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/backyard-tent-for-50-guests` | backyard tent for 50 guests | 2026-11-02 | 994 | 6 | Expand past 1,000 words |
| `/blog/chicago-tent-permit` | chicago tent permit | 2026-11-02 | 1177 | 6 | Real photo hero; review after Search Console data |
| `/blog/clearspan-structure-tent-rental` | clearspan structure tent rental | 2026-11-02 | 986 | 6 | Expand past 1,000 words |
| `/blog/cooling-a-tent-in-summer` | cooling a tent in summer | 2026-11-02 | 1006 | 6 | Real photo hero; review after Search Console data |
| `/blog/frame-tent-vs-pole-tent` | frame tent vs pole tent | 2026-11-02 | 1147 | 6 | Real photo hero; review after Search Console data |
| `/blog/graduation-party-tent-rental` | graduation party tent rental | 2026-11-02 | 974 | 6 | Expand past 1,000 words |
| `/blog/heating-a-tent-in-fall` | heating a tent in fall | 2026-11-02 | 1155 | 6 | Real photo hero; review after Search Console data |
| `/blog/hoa-and-neighbors-tent-party` | hoa and neighbors tent party | 2026-11-02 | 938 | 6 | Expand past 1,000 words |
| `/blog/julie-utility-locate-tent-illinois` | julie utility locate tent illinois | 2026-11-02 | 952 | 6 | Expand past 1,000 words |
| `/blog/pop-up-canopy-vs-rented-tent` | pop-up canopy vs rented tent | 2026-11-02 | 991 | 6 | Expand past 1,000 words |
| `/blog/rain-plan-with-a-tent` | rain plan with a tent | 2026-11-02 | 1000 | 6 | Real photo hero; review after Search Console data |
| `/blog/sailcloth-tent-wedding` | sailcloth tent wedding | 2026-11-02 | 979 | 6 | Expand past 1,000 words |
| `/blog/space-around-a-tent` | how much space around a tent | 2026-11-02 | 931 | 6 | Expand past 1,000 words |
| `/blog/tent-anchoring-stakes-vs-ballast` | tent anchoring stakes vs ballast | 2026-11-02 | 1067 | 6 | Real photo hero; review after Search Console data |
| `/blog/tent-and-grass-damage` | tent and grass damage | 2026-11-02 | 957 | 6 | Expand past 1,000 words |
| `/blog/tent-decor-draping-and-florals` | tent decor draping and florals | 2026-11-02 | 924 | 6 | Expand past 1,000 words |
| `/blog/tent-flooring-and-subfloors` | tent flooring and subfloors | 2026-11-02 | 1040 | 6 | Real photo hero; review after Search Console data |
| `/blog/tent-layout-dance-floor-and-bar` | tent layout with dance floor and bar | 2026-11-02 | 1016 | 6 | Real photo hero; review after Search Console data |
| `/blog/tent-lighting-ideas` | tent lighting ideas | 2026-11-02 | 1056 | 6 | Real photo hero; review after Search Console data |
| `/blog/tent-on-driveway-or-parking-lot` | tent on driveway or parking lot | 2026-11-02 | 998 | 6 | Expand past 1,000 words |
| `/blog/tent-permit-chicago-suburbs` | tent permit chicago suburbs | 2026-11-02 | 1099 | 6 | Real photo hero; review after Search Console data |
| `/blog/tent-rental-setup-timeline` | tent rental timeline | 2026-11-02 | 988 | 6 | Expand past 1,000 words |
| `/blog/tent-sidewalls-clear-window-solid` | tent sidewalls clear window solid | 2026-11-02 | 1057 | 6 | Real photo hero; review after Search Console data |
| `/blog/tent-wind-ratings-weather-safety` | tent wind ratings weather safety | 2026-11-02 | 970 | 6 | Expand past 1,000 words |
| `/blog/what-size-tent-do-i-need` | what size tent do i need | 2026-11-02 | 1258 | 6 | Real photo hero; review after Search Console data |

### Lighting & Power (25), hub `/blog/topic/lighting-and-power`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/backyard-party-lighting-ideas` | backyard party lighting ideas | 2026-11-02 | 1034 | 6 | Real photo hero; review after Search Console data |
| `/blog/battery-powered-event-lighting` | battery powered event lighting | 2026-11-02 | 999 | 6 | Expand past 1,000 words |
| `/blog/candles-at-venues-fire-code-rules` | candles at venues fire code | 2026-11-02 | 1019 | 7 | Real photo hero; review after Search Console data |
| `/blog/cords-on-grass-outdoor-lighting-safety` | outdoor lighting safety cords on grass | 2026-11-02 | 1016 | 6 | Real photo hero; review after Search Console data |
| `/blog/corporate-stage-lighting-basics` | corporate stage lighting | 2026-11-02 | 954 | 6 | Expand past 1,000 words |
| `/blog/event-power-needs-checklist` | event power needs checklist | 2026-11-02 | 929 | 6 | Expand past 1,000 words |
| `/blog/fans-and-coolers-for-summer-events` | fans and coolers for summer events | 2026-11-02 | 1028 | 6 | Real photo hero; review after Search Console data |
| `/blog/generator-size-for-events` | what size generator for an event | 2026-11-02 | 951 | 7 | Expand past 1,000 words |
| `/blog/how-many-uplights-for-a-wedding` | how many uplights for a wedding | 2026-11-02 | 1019 | 7 | Real photo hero; review after Search Console data |
| `/blog/lanterns-and-luminaries-for-events` | lanterns and luminaries for events | 2026-11-02 | 1008 | 6 | Real photo hero; review after Search Console data |
| `/blog/led-dance-floor-lighting` | led dance floor lighting | 2026-11-02 | 955 | 6 | Expand past 1,000 words |
| `/blog/lighting-color-temperature-events` | lighting color temperature for events | 2026-11-02 | 1004 | 6 | Real photo hero; review after Search Console data |
| `/blog/lighting-for-night-event-photos` | lighting for night event photos | 2026-11-02 | 1025 | 6 | Real photo hero; review after Search Console data |
| `/blog/marquee-letters-for-events` | marquee letters for events | 2026-11-02 | 950 | 6 | Expand past 1,000 words |
| `/blog/microphone-types-for-events` | microphone types for events | 2026-11-02 | 1012 | 6 | Real photo hero; review after Search Console data |
| `/blog/monogram-gobo-projection` | monogram gobo projection | 2026-11-02 | 977 | 6 | Expand past 1,000 words |
| `/blog/outdoor-extension-cord-safety-events` | extension cord safety outdoor events | 2026-11-02 | 1011 | 7 | Real photo hero; review after Search Console data |
| `/blog/patio-heaters-how-many-per-guests` | how many patio heaters per guests | 2026-11-02 | 1005 | 6 | Real photo hero; review after Search Console data |
| `/blog/pin-spot-lighting-centerpieces` | pin spot lighting centerpieces | 2026-11-02 | 1033 | 7 | Real photo hero; review after Search Console data |
| `/blog/projector-and-screen-size-for-events` | projector screen size for events | 2026-11-02 | 932 | 6 | Expand past 1,000 words |
| `/blog/quiet-generator-placement-events` | quiet generator for events | 2026-11-02 | 1065 | 6 | Real photo hero; review after Search Console data |
| `/blog/sound-system-for-speeches` | sound system for speeches | 2026-11-02 | 1000 | 7 | Real photo hero; review after Search Console data |
| `/blog/string-light-layouts-for-events` | string light layouts | 2026-11-02 | 1138 | 7 | Real photo hero; review after Search Console data |
| `/blog/tent-heater-vs-patio-heater` | tent heater vs patio heater | 2026-11-02 | 992 | 6 | Expand past 1,000 words |
| `/blog/winter-event-lighting-chicago-sunset` | winter event lighting chicago sunset | 2026-11-02 | 914 | 7 | Expand past 1,000 words |

### Dance Floors & Decor (25), hub `/blog/topic/dance-floors-and-decor`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/aisle-runner-length-and-material-guide` | aisle runner length | 2026-11-02 | 968 | 6 | Expand past 1,000 words |
| `/blog/balloon-garland-rental-vs-diy` | balloon garland rental vs diy | 2026-11-02 | 924 | 6 | Expand past 1,000 words |
| `/blog/banquet-hall-room-transformation-ideas` | banquet hall room transformation | 2026-11-02 | 995 | 6 | Expand past 1,000 words |
| `/blog/ceiling-draping-for-weddings-and-banquet-halls` | ceiling draping for weddings | 2026-11-02 | 952 | 6 | Expand past 1,000 words |
| `/blog/centerpiece-risers-and-stands-guide` | centerpiece risers and stands | 2026-11-02 | 968 | 6 | Expand past 1,000 words |
| `/blog/chuppah-and-mandap-structure-decor-guide` | chuppah and mandap decor | 2026-11-02 | 939 | 6 | Expand past 1,000 words |
| `/blog/corporate-event-photo-backdrop-guide` | corporate event photo backdrop | 2026-11-02 | 1050 | 6 | Real photo hero; review after Search Console data |
| `/blog/dance-floor-placement-reception-layout` | dance floor placement | 2026-11-02 | 945 | 6 | Expand past 1,000 words |
| `/blog/dance-floor-size-by-guest-count` | dance floor size by guest count | 2026-11-02 | 1236 | 6 | Real photo hero; review after Search Console data |
| `/blog/dance-floor-types-parquet-white-black-led` | dance floor types | 2026-11-02 | 1067 | 6 | Real photo hero; review after Search Console data |
| `/blog/decor-for-church-wedding-receptions` | church reception decor | 2026-11-02 | 1046 | 6 | Real photo hero; review after Search Console data |
| `/blog/fall-and-holiday-decor-rentals-chicago` | fall and holiday decor rentals Chicago | 2026-11-02 | 957 | 6 | Expand past 1,000 words |
| `/blog/flower-wall-rental-guide` | flower wall rental | 2026-11-02 | 945 | 6 | Expand past 1,000 words |
| `/blog/gala-stage-decor-ideas` | gala stage decor | 2026-11-02 | 919 | 6 | Expand past 1,000 words |
| `/blog/lounge-decor-vignettes-for-receptions` | lounge vignettes wedding reception | 2026-11-02 | 991 | 6 | Expand past 1,000 words |
| `/blog/marquee-letters-and-neon-signs-rental` | marquee letters and neon signs rental | 2026-11-02 | 942 | 6 | Expand past 1,000 words |
| `/blog/mirror-seating-chart-display-guide` | mirror seating chart | 2026-11-02 | 1050 | 6 | Real photo hero; review after Search Console data |
| `/blog/outdoor-dance-floor-on-grass` | outdoor dance floor on grass | 2026-11-02 | 1037 | 6 | Real photo hero; review after Search Console data |
| `/blog/photo-backdrop-ideas-for-weddings-and-parties` | photo backdrop ideas | 2026-11-02 | 917 | 6 | Expand past 1,000 words |
| `/blog/pipe-and-drape-uses-and-sizes` | pipe and drape | 2026-11-02 | 981 | 6 | Expand past 1,000 words |
| `/blog/signage-and-easels-for-events` | event signage and easels | 2026-11-02 | 964 | 6 | Expand past 1,000 words |
| `/blog/small-backyard-party-decor-rentals` | small backyard party decor | 2026-11-02 | 903 | 6 | Expand past 1,000 words |
| `/blog/stage-and-riser-sizes-for-events` | stage and riser sizes | 2026-11-02 | 1093 | 6 | Real photo hero; review after Search Console data |
| `/blog/wedding-ceremony-arch-round-hexagon-square` | wedding ceremony arch | 2026-11-02 | 1059 | 6 | Real photo hero; review after Search Console data |
| `/blog/wedding-ceremony-decor-rentals-checklist` | ceremony decor rentals checklist | 2026-11-02 | 923 | 6 | Expand past 1,000 words |

### Catering Equipment (25), hub `/blog/topic/catering-equipment`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/backyard-bbq-equipment-for-100-guests` | backyard bbq for 100 guests | 2026-11-02 | 1017 | 6 | Real photo hero; review after Search Console data |
| `/blog/buffet-line-flow-and-serving-speed` | buffet line layout | 2026-11-02 | 1030 | 6 | Real photo hero; review after Search Console data |
| `/blog/cake-stand-sizes-for-wedding-cakes` | cake stand size for wedding cake | 2026-11-02 | 1033 | 6 | Real photo hero; review after Search Console data |
| `/blog/catering-prep-tent-and-back-of-house-space` | catering prep tent | 2026-11-02 | 994 | 6 | Expand past 1,000 words |
| `/blog/cotton-candy-machine-rental-guide` | cotton candy machine rental | 2026-11-02 | 948 | 6 | Expand past 1,000 words |
| `/blog/dessert-table-equipment-checklist` | dessert table equipment | 2026-11-02 | 1129 | 6 | Real photo hero; review after Search Console data |
| `/blog/drop-off-catering-equipment-checklist` | drop-off catering equipment checklist | 2026-11-02 | 964 | 6 | Expand past 1,000 words |
| `/blog/food-safety-at-home-parties` | food safety at home parties | 2026-11-02 | 953 | 7 | Expand past 1,000 words |
| `/blog/food-station-ideas-and-equipment` | food station ideas | 2026-11-02 | 1096 | 6 | Real photo hero; review after Search Console data |
| `/blog/grill-rental-for-events` | grill rental for events | 2026-11-02 | 1012 | 6 | Real photo hero; review after Search Console data |
| `/blog/how-many-beverage-dispensers-do-i-need` | how many beverage dispensers | 2026-11-02 | 938 | 6 | Expand past 1,000 words |
| `/blog/how-many-chafing-dishes-for-a-buffet` | how many chafing dishes for a buffet | 2026-11-02 | 1191 | 6 | Real photo hero; review after Search Console data |
| `/blog/how-many-coffee-urns-for-a-party` | how many cups of coffee per guest | 2026-11-02 | 977 | 6 | Expand past 1,000 words |
| `/blog/ice-cream-sundae-bar-setup` | ice cream sundae bar setup | 2026-11-02 | 1018 | 6 | Real photo hero; review after Search Console data |
| `/blog/keeping-food-cold-at-outdoor-events` | keeping food cold at outdoor events | 2026-11-02 | 957 | 6 | Expand past 1,000 words |
| `/blog/keeping-food-hot-outdoors` | keeping food hot outdoors | 2026-11-02 | 994 | 6 | Expand past 1,000 words |
| `/blog/nacho-cheese-and-hot-dog-roller-rental` | hot dog roller rental | 2026-11-02 | 943 | 6 | Expand past 1,000 words |
| `/blog/pizza-oven-rental-for-events` | pizza oven rental for events | 2026-11-02 | 1028 | 6 | Real photo hero; review after Search Console data |
| `/blog/plated-vs-buffet-vs-family-style-equipment` | plated vs buffet vs family style | 2026-11-02 | 1026 | 6 | Real photo hero; review after Search Console data |
| `/blog/popcorn-machine-rental-guide` | popcorn machine rental | 2026-11-02 | 981 | 6 | Expand past 1,000 words |
| `/blog/serving-utensils-checklist-for-catering` | serving utensils checklist | 2026-11-02 | 1016 | 6 | Real photo hero; review after Search Console data |
| `/blog/snow-cone-machine-rental-guide` | snow cone machine rental | 2026-11-02 | 938 | 6 | Expand past 1,000 words |
| `/blog/tables-and-linens-for-caterers` | tables and linens for catering | 2026-11-02 | 1004 | 6 | Real photo hero; review after Search Console data |
| `/blog/trash-recycling-composting-stations-for-events` | event trash and recycling stations | 2026-11-02 | 957 | 6 | Expand past 1,000 words |
| `/blog/working-with-caterer-and-rental-company` | caterer and rental company | 2026-11-02 | 985 | 6 | Expand past 1,000 words |

### Lounge & Specialty (25), hub `/blog/topic/lounge-and-specialty`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/ada-restroom-considerations-for-events` | ADA portable restroom requirements events | 2026-11-02 | 968 | 6 | Expand past 1,000 words |
| `/blog/bounce-house-rental-safety-and-space` | bounce house rental safety | 2026-11-02 | 1059 | 6 | Real photo hero; review after Search Console data |
| `/blog/card-box-and-gift-table-ideas` | wedding card box ideas | 2026-11-02 | 1023 | 6 | Real photo hero; review after Search Console data |
| `/blog/carnival-games-for-parties` | carnival games for parties | 2026-11-02 | 1076 | 6 | Real photo hero; review after Search Console data |
| `/blog/casino-night-tables-and-rentals` | casino night table rentals | 2026-11-02 | 1078 | 6 | Real photo hero; review after Search Console data |
| `/blog/coat-racks-for-winter-events-chicago` | coat rack rental for winter events | 2026-11-02 | 1013 | 6 | Real photo hero; review after Search Console data |
| `/blog/corporate-picnic-games-chicago` | games for corporate picnic | 2026-11-02 | 1019 | 6 | Real photo hero; review after Search Console data |
| `/blog/dog-friendly-event-rentals` | dog friendly event rentals | 2026-11-02 | 1041 | 6 | Real photo hero; review after Search Console data |
| `/blog/guest-book-alternatives-for-weddings` | wedding guest book alternatives | 2026-11-02 | 1114 | 6 | Real photo hero; review after Search Console data |
| `/blog/high-chairs-and-baby-station-at-events` | high chair rental for events | 2026-11-02 | 957 | 6 | Expand past 1,000 words |
| `/blog/how-many-portable-restrooms-per-guests` | how many portable restrooms per guests | 2026-11-02 | 1020 | 6 | Real photo hero; review after Search Console data |
| `/blog/kids-party-rentals-checklist` | kids party rentals checklist | 2026-11-02 | 1023 | 6 | Real photo hero; review after Search Console data |
| `/blog/kids-tables-and-chairs-for-events` | kids tables and chairs rental | 2026-11-02 | 1058 | 6 | Real photo hero; review after Search Console data |
| `/blog/lawn-games-for-weddings` | lawn games for wedding | 2026-11-02 | 1054 | 6 | Real photo hero; review after Search Console data |
| `/blog/lounge-furniture-for-cocktail-hour` | lounge furniture for cocktail hour | 2026-11-02 | 1215 | 6 | Real photo hero; review after Search Console data |
| `/blog/lounge-layout-by-guest-count` | lounge layout for wedding reception | 2026-11-02 | 1016 | 6 | Real photo hero; review after Search Console data |
| `/blog/market-umbrellas-for-shade` | market umbrella rental for events | 2026-11-02 | 959 | 6 | Expand past 1,000 words |
| `/blog/misting-and-shade-for-summer-events` | misting fans for outdoor events | 2026-11-02 | 1009 | 6 | Real photo hero; review after Search Console data |
| `/blog/outdoor-lounge-rentals-chicago` | outdoor lounge rentals Chicago | 2026-11-02 | 1061 | 6 | Real photo hero; review after Search Console data |
| `/blog/photo-booth-space-and-power-needs` | photo booth space requirements | 2026-11-02 | 997 | 6 | Expand past 1,000 words |
| `/blog/photo-booth-types-open-air-360-mirror` | photo booth types | 2026-11-02 | 1035 | 6 | Real photo hero; review after Search Console data |
| `/blog/restroom-trailer-when-you-need-one` | restroom trailer rental for events | 2026-11-02 | 1025 | 6 | Real photo hero; review after Search Console data |
| `/blog/selfie-station-ideas-for-events` | selfie station ideas | 2026-11-02 | 915 | 6 | Expand past 1,000 words |
| `/blog/umbrella-stands-and-rain-plans` | umbrella stands for events rain plan | 2026-11-02 | 1070 | 6 | Real photo hero; review after Search Console data |
| `/blog/velvet-sofas-and-settees-for-events` | velvet sofa rental for events | 2026-11-02 | 1023 | 6 | Real photo hero; review after Search Console data |

### Weddings (25), hub `/blog/topic/weddings`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/backyard-wedding-rental-checklist` | backyard wedding rental checklist | 2026-11-02 | 1050 | 6 | Real photo hero; review after Search Console data |
| `/blog/black-tie-wedding-rentals` | black tie wedding rentals | 2026-11-02 | 961 | 6 | Expand past 1,000 words |
| `/blog/ceremony-to-reception-flip` | ceremony to reception flip | 2026-11-02 | 1022 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-wedding-trends-2027` | wedding trends 2027 | 2026-11-02 | 1096 | 6 | Real photo hero; review after Search Console data |
| `/blog/cocktail-hour-rentals-wedding` | wedding cocktail hour rentals | 2026-11-02 | 991 | 6 | Expand past 1,000 words |
| `/blog/complete-wedding-rental-checklist` | wedding rental checklist | 2026-11-02 | 1062 | 6 | Real photo hero; review after Search Console data |
| `/blog/courthouse-wedding-reception-rentals` | courthouse wedding reception | 2026-11-02 | 947 | 6 | Expand past 1,000 words |
| `/blog/day-after-wedding-brunch-rentals` | day after wedding brunch rentals | 2026-11-02 | 1008 | 6 | Real photo hero; review after Search Console data |
| `/blog/engagement-party-rentals` | engagement party rentals | 2026-11-02 | 1021 | 6 | Real photo hero; review after Search Console data |
| `/blog/garden-wedding-chairs-and-decor` | garden wedding chairs | 2026-11-02 | 1001 | 6 | Real photo hero; review after Search Console data |
| `/blog/micro-wedding-rentals` | micro wedding rentals | 2026-11-02 | 1059 | 6 | Real photo hero; review after Search Console data |
| `/blog/modern-minimalist-wedding-rentals` | modern minimalist wedding | 2026-11-02 | 958 | 6 | Expand past 1,000 words |
| `/blog/outdoor-ceremony-on-grass` | outdoor ceremony on grass | 2026-11-02 | 1120 | 6 | Real photo hero; review after Search Console data |
| `/blog/outdoor-wedding-ceremony-rentals` | outdoor wedding ceremony rentals | 2026-11-02 | 1116 | 6 | Real photo hero; review after Search Console data |
| `/blog/questions-to-ask-venue-about-rentals` | questions to ask wedding venue about rentals | 2026-11-02 | 1105 | 6 | Real photo hero; review after Search Console data |
| `/blog/rehearsal-dinner-rentals` | rehearsal dinner rentals | 2026-11-02 | 1053 | 6 | Real photo hero; review after Search Console data |
| `/blog/tented-wedding-rentals` | tented wedding rentals | 2026-11-02 | 1104 | 6 | Real photo hero; review after Search Console data |
| `/blog/venue-chairs-vs-rented-chairs` | venue chairs vs rented chairs | 2026-11-02 | 974 | 6 | Expand past 1,000 words |
| `/blog/vow-renewal-rentals` | vow renewal rentals | 2026-11-02 | 1022 | 6 | Real photo hero; review after Search Console data |
| `/blog/wedding-after-party-late-night-rentals` | wedding after party rentals | 2026-11-02 | 1016 | 6 | Real photo hero; review after Search Console data |
| `/blog/wedding-ceremony-seating-layouts` | wedding ceremony seating layouts | 2026-11-02 | 1114 | 6 | Real photo hero; review after Search Console data |
| `/blog/wedding-reception-rentals-by-guest-count` | wedding reception rentals by guest count | 2026-11-02 | 1102 | 6 | Real photo hero; review after Search Console data |
| `/blog/wedding-rental-budget-breakdown` | wedding rental budget | 2026-11-02 | 1106 | 6 | Real photo hero; review after Search Console data |
| `/blog/wedding-rentals-timeline` | wedding rentals timeline | 2026-11-02 | 1062 | 6 | Real photo hero; review after Search Console data |
| `/blog/wedding-seating-chart-how-to` | wedding seating chart | 2026-11-02 | 1050 | 6 | Real photo hero; review after Search Console data |

### Cultural Celebrations (25), hub `/blog/topic/cultural-celebrations`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/baptism-christening-party-rentals` | baptism party rentals | 2026-11-02 | 1048 | 6 | Real photo hero; review after Search Console data |
| `/blog/bar-and-bat-mitzvah-seating` | bar mitzvah seating | 2026-11-02 | 972 | 6 | Expand past 1,000 words |
| `/blog/bris-baby-naming-party-seating` | bris seating | 2026-11-02 | 1034 | 6 | Real photo hero; review after Search Console data |
| `/blog/chinese-tea-ceremony-seating` | chinese tea ceremony seating | 2026-11-02 | 1183 | 6 | Real photo hero; review after Search Console data |
| `/blog/diwali-party-seating-and-rentals` | diwali party seating | 2026-11-02 | 995 | 6 | Expand past 1,000 words |
| `/blog/eid-celebration-seating-and-rentals` | eid celebration seating | 2026-11-02 | 991 | 6 | Expand past 1,000 words |
| `/blog/ethiopian-eritrean-wedding-seating` | ethiopian wedding seating | 2026-11-02 | 923 | 6 | Expand past 1,000 words |
| `/blog/filipino-debut-18th-birthday-seating` | filipino debut seating | 2026-11-02 | 1059 | 6 | Real photo hero; review after Search Console data |
| `/blog/first-communion-party-rentals` | first communion party rentals | 2026-11-02 | 1001 | 6 | Real photo hero; review after Search Console data |
| `/blog/greek-wedding-reception-seating` | greek wedding reception seating | 2026-11-02 | 1028 | 6 | Real photo hero; review after Search Console data |
| `/blog/jewish-wedding-seating-chicago` | jewish wedding seating | 2026-11-02 | 1014 | 6 | Real photo hero; review after Search Console data |
| `/blog/juneteenth-community-celebration-rentals` | juneteenth celebration rentals chicago | 2026-11-02 | 962 | 6 | Expand past 1,000 words |
| `/blog/korean-pyebaek-table-setup` | korean pyebaek table setup | 2026-11-02 | 1036 | 6 | Real photo hero; review after Search Console data |
| `/blog/lunar-new-year-banquet-tables` | lunar new year banquet tables | 2026-11-02 | 954 | 6 | Expand past 1,000 words |
| `/blog/mehndi-night-lounge-seating` | mehndi night lounge seating | 2026-11-02 | 959 | 6 | Expand past 1,000 words |
| `/blog/mexican-wedding-boda-seating-padrinos` | mexican wedding seating padrinos | 2026-11-02 | 1083 | 6 | Real photo hero; review after Search Console data |
| `/blog/nigerian-wedding-traditional-engagement-seating` | nigerian traditional wedding seating | 2026-11-02 | 1069 | 6 | Real photo hero; review after Search Console data |
| `/blog/nikah-ceremony-seating` | nikah ceremony seating | 2026-11-02 | 996 | 6 | Expand past 1,000 words |
| `/blog/persian-sofreh-aghd-setup` | sofreh aghd setup | 2026-11-02 | 1015 | 6 | Real photo hero; review after Search Console data |
| `/blog/polish-wedding-reception-chicago` | polish wedding reception chicago | 2026-11-02 | 1240 | 6 | Real photo hero; review after Search Console data |
| `/blog/puerto-rican-celebration-rentals` | puerto rican party rentals chicago | 2026-11-02 | 961 | 6 | Expand past 1,000 words |
| `/blog/sangeet-stage-and-seating` | sangeet stage and seating | 2026-11-02 | 1020 | 6 | Real photo hero; review after Search Console data |
| `/blog/sikh-anand-karaj-reception-rentals` | sikh wedding reception rentals | 2026-11-02 | 1039 | 6 | Real photo hero; review after Search Console data |
| `/blog/ukrainian-wedding-reception-chicago` | ukrainian wedding reception chicago | 2026-11-02 | 1003 | 6 | Real photo hero; review after Search Console data |
| `/blog/vietnamese-tea-ceremony-setup` | vietnamese tea ceremony setup | 2026-11-02 | 952 | 6 | Expand past 1,000 words |

### Parties (25), hub `/blog/topic/parties`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/anniversary-party-rentals-and-layout` | anniversary party rentals | 2026-11-02 | 902 | 6 | Expand past 1,000 words |
| `/blog/baby-shower-rentals-and-seating` | baby shower seating | 2026-11-02 | 921 | 6 | Expand past 1,000 words |
| `/blog/backyard-movie-night-seating` | backyard movie night seating | 2026-11-02 | 1023 | 6 | Real photo hero; review after Search Console data |
| `/blog/block-party-rentals-chicago` | block party rentals chicago | 2026-11-02 | 1007 | 6 | Real photo hero; review after Search Console data |
| `/blog/bridal-shower-table-setup` | bridal shower table setup | 2026-11-02 | 1054 | 6 | Real photo hero; review after Search Console data |
| `/blog/brunch-party-rentals-for-20-to-50` | brunch party rentals | 2026-11-02 | 1060 | 6 | Real photo hero; review after Search Console data |
| `/blog/celebration-of-life-reception-rentals` | celebration of life reception | 2026-11-02 | 1020 | 6 | Real photo hero; review after Search Console data |
| `/blog/dinner-party-for-12-to-24-rentals` | dinner party for 24 rentals | 2026-11-02 | 1051 | 6 | Real photo hero; review after Search Console data |
| `/blog/family-reunion-seating-and-rentals` | family reunion seating | 2026-11-02 | 1057 | 6 | Real photo hero; review after Search Console data |
| `/blog/first-birthday-party-rentals` | first birthday party rentals | 2026-11-02 | 1040 | 6 | Real photo hero; review after Search Console data |
| `/blog/fourth-of-july-backyard-party-rentals` | fourth of july backyard party rentals | 2026-11-02 | 1080 | 6 | Real photo hero; review after Search Console data |
| `/blog/friendsgiving-party-for-20-rentals` | friendsgiving party setup | 2026-11-02 | 995 | 6 | Expand past 1,000 words |
| `/blog/garden-party-rentals-layout` | garden party rentals | 2026-11-02 | 985 | 6 | Expand past 1,000 words |
| `/blog/gender-reveal-party-setup` | gender reveal party setup | 2026-11-02 | 1038 | 6 | Real photo hero; review after Search Console data |
| `/blog/graduation-party-rentals-checklist` | graduation party rentals checklist | 2026-11-02 | 1299 | 7 | Real photo hero; review after Search Console data |
| `/blog/holiday-party-at-home-rentals-chicago` | holiday party at home rentals | 2026-11-02 | 1019 | 6 | Real photo hero; review after Search Console data |
| `/blog/housewarming-party-seating` | housewarming party seating | 2026-11-02 | 941 | 6 | Expand past 1,000 words |
| `/blog/kids-birthday-party-seating-and-tables` | kids birthday party seating | 2026-11-02 | 1001 | 6 | Real photo hero; review after Search Console data |
| `/blog/milestone-birthday-party-ideas-30-40-50-60` | milestone birthday party ideas | 2026-11-02 | 940 | 6 | Expand past 1,000 words |
| `/blog/new-years-eve-party-at-home` | new years eve party at home | 2026-11-02 | 1047 | 6 | Real photo hero; review after Search Console data |
| `/blog/open-house-graduation-party-layout` | open house graduation party layout | 2026-11-02 | 1098 | 7 | Real photo hero; review after Search Console data |
| `/blog/retirement-party-rentals-and-layout` | retirement party rentals | 2026-11-02 | 910 | 6 | Expand past 1,000 words |
| `/blog/super-bowl-party-seating-for-a-crowd` | super bowl party seating | 2026-11-02 | 900 | 6 | Expand past 1,000 words |
| `/blog/surprise-party-planning-rentals` | surprise party planning | 2026-11-02 | 983 | 6 | Expand past 1,000 words |
| `/blog/sweet-16-party-rentals-chicago` | sweet 16 party rentals | 2026-11-02 | 956 | 6 | Expand past 1,000 words |

### Corporate & Nonprofit (25), hub `/blog/topic/corporate-and-nonprofit`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/board-retreat-seating-and-setup` | board retreat setup | 2026-11-02 | 1041 | 6 | Real photo hero; review after Search Console data |
| `/blog/business-open-house-rentals` | business open house ideas | 2026-11-02 | 1008 | 6 | Real photo hero; review after Search Console data |
| `/blog/charity-gala-rental-checklist` | charity gala rental checklist | 2026-11-02 | 1039 | 6 | Real photo hero; review after Search Console data |
| `/blog/church-event-and-festival-rentals-chicago` | church festival rentals | 2026-11-02 | 1036 | 6 | Real photo hero; review after Search Console data |
| `/blog/client-appreciation-event-rentals` | client appreciation event ideas | 2026-11-02 | 960 | 6 | Expand past 1,000 words |
| `/blog/company-picnic-rentals-chicago` | company picnic rentals | 2026-11-02 | 1038 | 6 | Real photo hero; review after Search Console data |
| `/blog/conference-seating-styles-theater-classroom-banquet-u-shape` | conference seating styles | 2026-11-02 | 907 | 6 | Expand past 1,000 words |
| `/blog/corporate-event-coi-and-vendor-requirements` | certificate of insurance for event vendors | 2026-11-02 | 979 | 6 | Expand past 1,000 words |
| `/blog/corporate-gala-seating-beyond-banquet-chair` | corporate gala seating | 2026-11-02 | 1092 | 6 | Real photo hero; review after Search Console data |
| `/blog/employee-awards-night-setup` | employee awards night setup | 2026-11-02 | 1075 | 6 | Real photo hero; review after Search Console data |
| `/blog/fundraiser-auction-setup-rentals` | silent auction setup | 2026-11-02 | 1058 | 6 | Real photo hero; review after Search Console data |
| `/blog/golf-outing-rentals-chicago` | golf outing rentals | 2026-11-02 | 1055 | 6 | Real photo hero; review after Search Console data |
| `/blog/grand-opening-ribbon-cutting-rentals` | grand opening rentals | 2026-11-02 | 1092 | 6 | Real photo hero; review after Search Console data |
| `/blog/holiday-office-party-rentals-chicago` | holiday office party rentals | 2026-11-02 | 1102 | 6 | Real photo hero; review after Search Console data |
| `/blog/how-many-chairs-fit-theater-seating` | how many chairs fit theater seating | 2026-11-02 | 1054 | 7 | Real photo hero; review after Search Console data |
| `/blog/hybrid-event-av-and-seating` | hybrid event setup | 2026-11-02 | 971 | 6 | Expand past 1,000 words |
| `/blog/networking-reception-layout` | networking event layout | 2026-11-02 | 1028 | 6 | Real photo hero; review after Search Console data |
| `/blog/nonprofit-rental-budget-tips` | nonprofit event budget | 2026-11-02 | 986 | 6 | Expand past 1,000 words |
| `/blog/office-move-in-or-anniversary-celebration` | office anniversary celebration ideas | 2026-11-02 | 1073 | 6 | Real photo hero; review after Search Console data |
| `/blog/outdoor-corporate-summer-party-chicago` | outdoor corporate summer party | 2026-11-02 | 1063 | 6 | Real photo hero; review after Search Console data |
| `/blog/panel-discussion-stage-seating` | panel discussion seating | 2026-11-02 | 1086 | 6 | Real photo hero; review after Search Console data |
| `/blog/product-launch-event-seating-and-layout` | product launch event layout | 2026-11-02 | 1074 | 6 | Real photo hero; review after Search Console data |
| `/blog/school-fundraiser-rentals-chicago` | school fundraiser rentals | 2026-11-02 | 1080 | 6 | Real photo hero; review after Search Console data |
| `/blog/team-building-outdoor-event-rentals` | team building outdoor event | 2026-11-02 | 994 | 6 | Expand past 1,000 words |
| `/blog/trade-show-booth-seating` | trade show booth seating | 2026-11-02 | 1136 | 6 | Real photo hero; review after Search Console data |

### Chicago Planning (25), hub `/blog/topic/chicago-planning`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/chicago-alley-deliveries-event-rentals` | chicago alley delivery event rentals | 2026-11-02 | 1000 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-block-party-permit` | chicago block party permit | 2026-11-02 | 1095 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-church-hall-reception-rentals` | church hall reception chicago | 2026-11-02 | 1056 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-event-delivery-parking-loading-zones` | chicago loading zone event delivery | 2026-11-02 | 1049 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-high-rise-party-freight-elevator-coi` | chicago high rise party rentals freight elevator | 2026-11-02 | 1095 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-lakefront-event-wind-planning` | chicago lakefront event planning | 2026-11-02 | 1009 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-loft-party-rentals` | chicago loft party rentals | 2026-11-02 | 1034 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-park-district-event-permit` | chicago park district event permit | 2026-11-02 | 1206 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-riverwalk-event-planning` | chicago riverwalk event planning | 2026-11-02 | 900 | 6 | Expand past 1,000 words |
| `/blog/chicago-rooftop-event-rentals` | chicago rooftop event rentals | 2026-11-02 | 958 | 6 | Expand past 1,000 words |
| `/blog/chicago-special-event-permit-guide` | chicago special event permit | 2026-11-02 | 1209 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-summer-event-season-planning` | chicago summer event planning | 2026-11-02 | 988 | 6 | Expand past 1,000 words |
| `/blog/chicago-two-flat-greystone-backyard-party` | chicago backyard party rentals | 2026-11-02 | 1063 | 6 | Real photo hero; review after Search Console data |
| `/blog/chicago-winter-event-planning` | chicago winter event planning | 2026-11-02 | 977 | 6 | Expand past 1,000 words |
| `/blog/forest-preserves-cook-county-picnic-permit` | forest preserves of cook county picnic permit | 2026-11-02 | 1186 | 6 | Real photo hero; review after Search Console data |
| `/blog/party-planning-andersonville-chicago` | party planning andersonville chicago | 2026-11-02 | 1026 | 6 | Real photo hero; review after Search Console data |
| `/blog/party-planning-hyde-park-chicago` | party planning hyde park chicago | 2026-11-02 | 962 | 6 | Expand past 1,000 words |
| `/blog/party-planning-lakeview-chicago` | party planning lakeview chicago | 2026-11-02 | 1055 | 6 | Real photo hero; review after Search Console data |
| `/blog/party-planning-lincoln-park-chicago` | party planning lincoln park chicago | 2026-11-02 | 961 | 6 | Expand past 1,000 words |
| `/blog/party-planning-logan-square-chicago` | party planning logan square chicago | 2026-11-02 | 1004 | 6 | Real photo hero; review after Search Console data |
| `/blog/party-planning-pilsen-chicago` | party planning pilsen chicago | 2026-11-02 | 974 | 6 | Expand past 1,000 words |
| `/blog/party-planning-west-loop-chicago` | party planning west loop chicago | 2026-11-02 | 1007 | 6 | Real photo hero; review after Search Console data |
| `/blog/party-planning-wicker-park-chicago` | party planning wicker park chicago | 2026-11-02 | 1000 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-around-chicago-marathon-weekend` | chicago marathon weekend event planning | 2026-11-02 | 979 | 6 | Expand past 1,000 words |
| `/blog/planning-around-lollapalooza-weekend` | lollapalooza weekend event planning chicago | 2026-11-02 | 984 | 6 | Expand past 1,000 words |

### Suburb Guides (50), hub `/blog/topic/suburb-guides`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/planning-an-event-in-arlington-heights-il` | wedding rentals Arlington Heights IL | 2026-11-02 | 1076 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-aurora-il` | planning an event in Aurora IL | 2026-11-02 | 1065 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-barrington-il` | event rentals Barrington IL | 2026-11-02 | 1060 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-batavia-il` | planning an event in Batavia IL | 2026-11-02 | 1142 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-bolingbrook-il` | planning an event in Bolingbrook IL | 2026-11-02 | 978 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-burr-ridge-il` | planning an event in Burr Ridge IL | 2026-11-02 | 1030 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-carol-stream-il` | planning an event in Carol Stream IL | 2026-11-02 | 938 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-crystal-lake-il` | wedding rentals Crystal Lake IL | 2026-11-02 | 1018 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-deerfield-il` | event rentals Deerfield IL | 2026-11-02 | 1157 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-des-plaines-il` | party rentals Des Plaines IL | 2026-11-02 | 1048 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-downers-grove-il` | planning an event in Downers Grove IL | 2026-11-02 | 1022 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-elgin-il` | planning an event in Elgin IL | 2026-11-02 | 976 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-elmhurst-il` | planning an event in Elmhurst IL | 2026-11-02 | 970 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-evanston-il` | event rentals Evanston IL | 2026-11-02 | 1486 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-frankfort-il` | wedding rentals Frankfort IL | 2026-11-02 | 1087 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-geneva-il` | planning an event in Geneva IL | 2026-11-02 | 1300 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-glen-ellyn-il` | planning an event in Glen Ellyn IL | 2026-11-02 | 987 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-glenview-il` | party rentals Glenview IL | 2026-11-02 | 1086 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-highland-park-il` | event rentals Highland Park IL | 2026-11-02 | 1084 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-hinsdale-il` | planning an event in Hinsdale IL | 2026-11-02 | 1012 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-hoffman-estates-il` | event rentals Hoffman Estates IL | 2026-11-02 | 1108 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-homer-glen-il` | party rentals Homer Glen IL | 2026-11-02 | 976 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-joliet-il` | wedding rentals Joliet IL | 2026-11-02 | 976 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-la-grange-il` | planning an event in La Grange IL | 2026-11-02 | 1040 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-lake-forest-il` | wedding chair rental Lake Forest IL | 2026-11-02 | 1070 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-lemont-il` | chair rental Lemont IL | 2026-11-02 | 924 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-libertyville-il` | party rentals Libertyville IL | 2026-11-02 | 1116 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-lisle-il` | planning an event in Lisle IL | 2026-11-02 | 990 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-lombard-il` | planning an event in Lombard IL | 2026-11-02 | 991 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-naperville-il` | planning an event in Naperville IL | 2026-11-02 | 1036 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-northbrook-il` | event rentals Northbrook IL | 2026-11-02 | 1094 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-oak-brook-il` | planning an event in Oak Brook IL | 2026-11-02 | 963 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-oak-park-il` | party rentals Oak Park IL | 2026-11-02 | 1099 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-orland-park-il` | event rentals Orland Park IL | 2026-11-02 | 1027 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-oswego-il` | planning an event in Oswego IL | 2026-11-02 | 993 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-palatine-il` | chair rental Palatine IL | 2026-11-02 | 1070 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-park-ridge-il` | chair rental Park Ridge IL | 2026-11-02 | 1104 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-plainfield-il` | planning an event in Plainfield IL | 2026-11-02 | 962 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-schaumburg-il` | event rentals Schaumburg IL | 2026-11-02 | 1130 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-skokie-il` | party rentals Skokie IL | 2026-11-02 | 1097 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-st-charles-il` | planning an event in St. Charles IL | 2026-11-02 | 1436 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-sugar-grove-il` | planning an event in Sugar Grove IL | 2026-11-02 | 931 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-tinley-park-il` | wedding rentals Tinley Park IL | 2026-11-02 | 1044 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-warrenville-il` | planning an event in Warrenville IL | 2026-11-02 | 933 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-west-chicago-il` | planning an event in West Chicago IL | 2026-11-02 | 977 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-western-springs-il` | planning an event in Western Springs IL | 2026-11-02 | 978 | 6 | Expand past 1,000 words |
| `/blog/planning-an-event-in-wheaton-il` | planning an event in Wheaton IL | 2026-11-02 | 1092 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-wilmette-il` | wedding rentals Wilmette IL | 2026-11-02 | 1032 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-winnetka-il` | event rentals Winnetka IL | 2026-11-02 | 1111 | 6 | Real photo hero; review after Search Console data |
| `/blog/planning-an-event-in-yorkville-il` | planning an event in Yorkville IL | 2026-11-02 | 917 | 6 | Expand past 1,000 words |

### Budget & Booking (25), hub `/blog/topic/budget-and-booking`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/certificate-of-insurance-event-rentals` | certificate of insurance event rentals | 2026-11-02 | 1020 | 6 | Real photo hero; review after Search Console data |
| `/blog/damage-waiver-event-rentals-explained` | damage waiver event rentals | 2026-11-02 | 943 | 6 | Expand past 1,000 words |
| `/blog/event-insurance-basics-for-private-events` | event insurance basics | 2026-11-02 | 919 | 6 | Expand past 1,000 words |
| `/blog/event-rental-budget-by-guest-count` | event rental budget 50 100 200 guests | 2026-11-02 | 973 | 6 | Expand past 1,000 words |
| `/blog/event-rental-cancellation-and-date-change-policy` | event rental cancellation policy | 2026-11-02 | 919 | 6 | Expand past 1,000 words |
| `/blog/event-rental-delivery-day-what-to-expect` | what happens on event rental delivery day | 2026-11-02 | 981 | 6 | Expand past 1,000 words |
| `/blog/event-rental-delivery-fees-explained` | event rental delivery fees | 2026-11-02 | 997 | 6 | Expand past 1,000 words |
| `/blog/event-rental-red-flags` | event rental red flags | 2026-11-02 | 937 | 6 | Expand past 1,000 words |
| `/blog/final-headcount-deadline-event-rentals` | final headcount event rentals when to lock | 2026-11-02 | 924 | 6 | Expand past 1,000 words |
| `/blog/full-service-vs-will-call-event-rentals` | will call vs delivery event rentals | 2026-11-02 | 993 | 6 | Expand past 1,000 words |
| `/blog/how-event-rental-quotes-work` | how event rental quotes work | 2026-11-02 | 1092 | 6 | Real photo hero; review after Search Console data |
| `/blog/how-to-compare-event-rental-quotes` | how to compare event rental quotes | 2026-11-02 | 1027 | 6 | Real photo hero; review after Search Console data |
| `/blog/how-to-read-an-event-rental-contract` | how to read an event rental contract | 2026-11-02 | 994 | 6 | Expand past 1,000 words |
| `/blog/how-to-save-money-on-event-rentals` | how to save money on event rentals | 2026-11-02 | 951 | 6 | Expand past 1,000 words |
| `/blog/late-night-and-early-pickup-fees-event-rentals` | late night pickup fee event rentals | 2026-11-02 | 947 | 6 | Expand past 1,000 words |
| `/blog/one-call-planning-vs-many-vendors` | one rental company vs multiple vendors | 2026-11-02 | 902 | 6 | Expand past 1,000 words |
| `/blog/paying-for-event-rentals` | how to pay for event rentals | 2026-11-02 | 990 | 6 | Expand past 1,000 words |
| `/blog/peak-season-event-rentals-chicago` | peak season event rentals Chicago | 2026-11-02 | 964 | 6 | Expand past 1,000 words |
| `/blog/questions-to-ask-an-event-rental-company` | questions to ask an event rental company | 2026-11-02 | 1009 | 6 | Real photo hero; review after Search Console data |
| `/blog/rain-clause-event-rental-contract` | event rental rain policy weather clause | 2026-11-02 | 969 | 6 | Expand past 1,000 words |
| `/blog/rent-vs-buy-event-chairs-and-tables` | rent vs buy event chairs and tables | 2026-11-02 | 1006 | 6 | Real photo hero; review after Search Console data |
| `/blog/rental-deposits-explained` | event rental deposit explained | 2026-11-02 | 998 | 6 | Expand past 1,000 words |
| `/blog/returning-event-rentals-condition-and-cleaning` | returning event rentals cleaning expectations | 2026-11-02 | 962 | 6 | Expand past 1,000 words |
| `/blog/setup-and-breakdown-fees-event-rentals` | event rental setup and breakdown fees | 2026-11-02 | 952 | 6 | Expand past 1,000 words |
| `/blog/tipping-event-rental-delivery-crew` | tipping event rental delivery crew | 2026-11-02 | 962 | 6 | Expand past 1,000 words |

### Layouts & Floor Plans (25), hub `/blog/topic/layouts-and-floor-plans`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/20x40-tent-seating-capacity-and-layout` | 20x40 tent seating capacity | 2026-11-02 | 1160 | 6 | Real photo hero; review after Search Console data |
| `/blog/30x60-tent-seating-capacity-and-layout` | 30x60 tent seating capacity | 2026-11-02 | 1079 | 6 | Real photo hero; review after Search Console data |
| `/blog/40x80-tent-seating-capacity-and-layout` | 40x80 tent seating capacity | 2026-11-02 | 1129 | 6 | Real photo hero; review after Search Console data |
| `/blog/ada-accessible-event-seating-and-pathways` | ada accessible event seating | 2026-11-02 | 1074 | 6 | Real photo hero; review after Search Console data |
| `/blog/backyard-party-layout-plan` | backyard party layout | 2026-11-02 | 1024 | 6 | Real photo hero; review after Search Console data |
| `/blog/ceremony-to-reception-room-flip-layout` | ceremony and reception in same room layout | 2026-11-02 | 1174 | 6 | Real photo hero; review after Search Console data |
| `/blog/classroom-vs-theater-seating-layout` | classroom vs theater seating | 2026-11-02 | 984 | 6 | Expand past 1,000 words |
| `/blog/cocktail-reception-layout-standing-ratio` | cocktail reception layout | 2026-11-02 | 1000 | 6 | Real photo hero; review after Search Console data |
| `/blog/dj-and-band-placement-floor-plan` | dj and band placement | 2026-11-02 | 1106 | 6 | Real photo hero; review after Search Console data |
| `/blog/floor-plan-for-100-guests` | floor plan for 100 guests | 2026-11-02 | 1009 | 7 | Real photo hero; review after Search Console data |
| `/blog/floor-plan-for-150-guests` | floor plan for 150 guests | 2026-11-02 | 1047 | 6 | Real photo hero; review after Search Console data |
| `/blog/floor-plan-for-200-guests` | floor plan for 200 guests | 2026-11-02 | 1060 | 6 | Real photo hero; review after Search Console data |
| `/blog/floor-plan-for-250-guests` | floor plan for 250 guests | 2026-11-02 | 1093 | 7 | Real photo hero; review after Search Console data |
| `/blog/floor-plan-for-300-guests` | floor plan for 300 guests | 2026-11-02 | 1069 | 6 | Real photo hero; review after Search Console data |
| `/blog/floor-plan-for-50-guests` | floor plan for 50 guests | 2026-11-02 | 1111 | 6 | Real photo hero; review after Search Console data |
| `/blog/floor-plan-for-75-guests` | floor plan for 75 guests | 2026-11-02 | 1064 | 6 | Real photo hero; review after Search Console data |
| `/blog/garage-party-layout-ideas` | garage party layout | 2026-11-02 | 1003 | 6 | Real photo hero; review after Search Console data |
| `/blog/head-table-vs-sweetheart-table-layout` | head table vs sweetheart table | 2026-11-02 | 1142 | 6 | Real photo hero; review after Search Console data |
| `/blog/long-table-layouts-in-a-narrow-room` | long table layout narrow room | 2026-11-02 | 1111 | 6 | Real photo hero; review after Search Console data |
| `/blog/photo-booth-placement-in-a-floor-plan` | photo booth placement | 2026-11-02 | 1129 | 6 | Real photo hero; review after Search Console data |
| `/blog/reception-layout-mistakes-to-avoid` | reception layout mistakes | 2026-11-02 | 1018 | 6 | Real photo hero; review after Search Console data |
| `/blog/reserved-seating-and-signage-layout` | reserved seating signs | 2026-11-02 | 964 | 6 | Expand past 1,000 words |
| `/blog/seating-chart-divorced-parents-blended-families` | seating chart divorced parents | 2026-11-02 | 1261 | 6 | Real photo hero; review after Search Console data |
| `/blog/square-feet-per-guest-by-event-style` | square feet per guest | 2026-11-02 | 1095 | 6 | Real photo hero; review after Search Console data |
| `/blog/wedding-ceremony-floor-plan-and-aisle-width` | wedding ceremony floor plan | 2026-11-02 | 1041 | 6 | Real photo hero; review after Search Console data |

### Seasons & Venues (25), hub `/blog/topic/seasons-and-venues`

| Route | Target phrase | Last touched | Words | FAQs | Remaining |
|---|---|---|---|---|---|
| `/blog/backyard-event-space-size-guide-chicago` | is my backyard big enough for a party | 2026-11-02 | 993 | 7 | Expand past 1,000 words |
| `/blog/beach-events-chicago-park-district` | beach events chicago park district rules | 2026-11-02 | 1158 | 7 | Real photo hero; review after Search Console data |
| `/blog/brewery-and-winery-event-venues-chicago` | brewery event venues chicago | 2026-11-02 | 979 | 7 | Expand past 1,000 words |
| `/blog/chicago-fall-wedding-rentals` | chicago fall wedding rentals | 2026-11-02 | 1022 | 7 | Real photo hero; review after Search Console data |
| `/blog/community-center-event-rentals-chicago-suburbs` | community center event rental chicago suburbs | 2026-11-02 | 1039 | 7 | Real photo hero; review after Search Console data |
| `/blog/december-holiday-party-rentals-chicago` | december holiday party rentals chicago | 2026-11-02 | 1044 | 7 | Real photo hero; review after Search Console data |
| `/blog/farm-venue-weddings-illinois` | farm wedding venue near chicago | 2026-11-02 | 1026 | 7 | Real photo hero; review after Search Console data |
| `/blog/forest-preserve-events-dupage-lake-will` | forest preserve picnic shelter rules chicago suburbs | 2026-11-02 | 1226 | 7 | Real photo hero; review after Search Console data |
| `/blog/golf-club-wedding-and-event-venues` | golf club wedding venues chicago | 2026-11-02 | 1000 | 7 | Real photo hero; review after Search Console data |
| `/blog/january-february-event-planning-chicago` | january february event planning chicago | 2026-11-02 | 1084 | 7 | Real photo hero; review after Search Console data |
| `/blog/mosquitoes-and-bugs-outdoor-events` | mosquitoes and bugs at outdoor events | 2026-11-02 | 1196 | 7 | Real photo hero; review after Search Console data |
| `/blog/museum-and-gallery-event-venues-chicago` | museum event venues chicago | 2026-11-02 | 1088 | 7 | Real photo hero; review after Search Console data |
| `/blog/outdoor-events-chicago-in-april` | outdoor events in chicago in april | 2026-11-02 | 1364 | 7 | Real photo hero; review after Search Console data |
| `/blog/outdoor-events-chicago-in-august` | outdoor events in chicago in august | 2026-11-02 | 1067 | 7 | Real photo hero; review after Search Console data |
| `/blog/outdoor-events-chicago-in-july` | outdoor events in chicago in july | 2026-11-02 | 1086 | 7 | Real photo hero; review after Search Console data |
| `/blog/outdoor-events-chicago-in-june` | outdoor events in chicago in june | 2026-11-02 | 1126 | 7 | Real photo hero; review after Search Console data |
| `/blog/outdoor-events-chicago-in-may` | outdoor events in chicago in may | 2026-11-02 | 1094 | 7 | Real photo hero; review after Search Console data |
| `/blog/outdoor-events-chicago-in-october` | outdoor events in chicago in october | 2026-11-02 | 1096 | 7 | Real photo hero; review after Search Console data |
| `/blog/outdoor-events-chicago-in-september` | outdoor events in chicago in september | 2026-11-02 | 1035 | 7 | Real photo hero; review after Search Console data |
| `/blog/planning-a-november-event-chicago` | planning a november event in chicago | 2026-11-02 | 1065 | 7 | Real photo hero; review after Search Console data |
| `/blog/rain-on-event-day-chicago` | rain on event day chicago | 2026-11-02 | 1065 | 7 | Real photo hero; review after Search Console data |
| `/blog/spring-wedding-rentals-chicago` | spring wedding rentals chicago | 2026-11-02 | 1125 | 7 | Real photo hero; review after Search Console data |
| `/blog/suburban-park-district-pavilion-rentals` | park pavilion rental chicago suburbs | 2026-11-02 | 1199 | 7 | Real photo hero; review after Search Console data |
| `/blog/summer-event-heat-plan-chicago` | summer event heat plan chicago | 2026-11-02 | 1088 | 7 | Real photo hero; review after Search Console data |
| `/blog/warehouse-and-raw-space-event-venues` | warehouse event venue rental checklist | 2026-11-02 | 1071 | 7 | Real photo hero; review after Search Console data |

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

- **3D renders (2026-11-02):** colour variants and second angles are done; still open: angle shots for clear stemware (flags show from that side) and a darker set so glassware reads better; add 360-degree turntable clips for the top 10 items via `VideoFeature`; swap any render for a real photo once stock is photographed (set `image` on the chair or replace the WebP, keep the alt text accurate).

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
- Thumbnails added 2026-11-01. Topic browser and hub pages added 2026-11-02 (replaces tag filters). Next: a CTA band and pagination or search once the journal passes ~600 guides.
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

---

## Local pages: Local landing pages (Chicago neighborhoods + suburbs)

Template: `src/app/chair-rentals/[slug]/page.tsx` · Content: `src/data/geo/{chicago,west-suburbs,north-suburbs}.ts`

Every page has: unique local copy, stylised area map, 3 chair picks with renders, venue settings, delivery notes, links to popular event pages, 5 local FAQs, Service + FAQPage + BreadcrumbList schema, geo meta tags, a per-page social card, a "schedule a planning call" CTA, and links to nearby areas.

| Page | URL | Last touched | Remaining |
|---|---|---|---|
| Areas hub | /chair-rentals | 2026-10-31 | Add real venue photos; add a short video |
| Chicago | /chair-rentals/chicago | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| The Loop | /chair-rentals/the-loop | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| River North | /chair-rentals/river-north | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| West Loop | /chair-rentals/west-loop | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Gold Coast | /chair-rentals/gold-coast | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Lincoln Park | /chair-rentals/lincoln-park | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Lakeview | /chair-rentals/lakeview | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Wicker Park & Bucktown | /chair-rentals/wicker-park-bucktown | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Logan Square | /chair-rentals/logan-square | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| South Loop | /chair-rentals/south-loop | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Hyde Park | /chair-rentals/hyde-park | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Pilsen | /chair-rentals/pilsen | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Andersonville | /chair-rentals/andersonville | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| St. Charles | /chair-rentals/st-charles | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Geneva | /chair-rentals/geneva | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Batavia | /chair-rentals/batavia | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Aurora | /chair-rentals/aurora | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Naperville | /chair-rentals/naperville | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Wheaton | /chair-rentals/wheaton | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Glen Ellyn | /chair-rentals/glen-ellyn | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Downers Grove | /chair-rentals/downers-grove | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Oak Brook | /chair-rentals/oak-brook | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Hinsdale | /chair-rentals/hinsdale | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Oak Park | /chair-rentals/oak-park | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Orland Park | /chair-rentals/orland-park | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Joliet | /chair-rentals/joliet | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Elgin | /chair-rentals/elgin | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Evanston | /chair-rentals/evanston | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Schaumburg | /chair-rentals/schaumburg | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Arlington Heights | /chair-rentals/arlington-heights | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Highland Park | /chair-rentals/highland-park | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Lake Forest | /chair-rentals/lake-forest | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Barrington | /chair-rentals/barrington | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Skokie | /chair-rentals/skokie | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |
| Wilmette | /chair-rentals/wilmette | 2026-10-31 | Real local photo; owner review of local facts; add a reviews block after first events |

## Local pages: Event-type pages

Template: `src/app/events/[slug]/page.tsx` · Content: `src/data/geo/events.ts`

Every page has: chair-trio visual, seating-math tiles, 4 pain points with solutions, 3 chair picks, planning notes, a 6-step checklist (HowTo schema), links to every area page, related journal posts, 6 FAQs (FAQPage schema), a social card and the call CTA.

| Page | URL | Last touched | Remaining |
|---|---|---|---|
| Events hub | /events | 2026-10-31 | Add real event photos |
| Weddings | /events/weddings | 2026-10-31 | Real event photo; more related journal posts |
| Corporate Events | /events/corporate-events | 2026-10-31 | Real event photo; more related journal posts |
| Quinceañeras | /events/quinceaneras | 2026-10-31 | Real event photo; more related journal posts |
| Graduation Parties | /events/graduation-parties | 2026-10-31 | Real event photo; more related journal posts |
| South Asian Weddings | /events/south-asian-weddings | 2026-10-31 | Real event photo; more related journal posts |
| Showers | /events/showers | 2026-10-31 | Real event photo; more related journal posts |
| Galas & Fundraisers | /events/galas-fundraisers | 2026-10-31 | Real event photo; more related journal posts |
| Birthday Parties | /events/birthday-parties | 2026-10-31 | Real event photo; write related journal posts |
| Religious Events | /events/religious-events | 2026-10-31 | Real event photo; more related journal posts |
| Backyard Parties | /events/backyard-parties | 2026-10-31 | Real event photo; more related journal posts |
| Holiday Parties | /events/holiday-parties | 2026-10-31 | Real event photo; more related journal posts |
| Rehearsal Dinners | /events/rehearsal-dinners | 2026-10-31 | Real event photo; more related journal posts |
| Bar & Bat Mitzvahs | /events/bar-bat-mitzvahs | 2026-10-31 | Real event photo; more related journal posts |
| Memorials | /events/memorials | 2026-10-31 | Real event photo; write related journal posts |
| School Events | /events/school-events | 2026-10-31 | Real event photo; more related journal posts |

## Local pages: Open items across these pages

- **COI (2026-11-02):** owner confirmed we don't issue certificates of insurance yet. Area pages, event pages and /booking-promise now say so plainly and tell hosts to check venue rules first. Revisit once we can offer COIs.
- **Confirm before launch:** a few FAQ answers describe services the owner should confirm are offered: separate deliveries for multi-day events, wiping chairs down and protecting floors on winter deliveries, and setup by our team. Edit `src/data/geo/*.ts` if any of these aren't offered.
- **Booking link:** set `NEXT_PUBLIC_BOOKING_URL` (Calendly or Cal.com) so "Schedule a planning call" opens a calendar. Until then it goes to /quote.
- **Brand name:** pages use `site.name` from `src/lib/site.ts`, so the rename to beyondchivary carries through automatically.
- **Next pages to add:** more suburbs (Lombard, Elmhurst, Western Springs, Tinley Park, Plainfield, Oswego, Libertyville, Northbrook, Deerfield, Palatine) and more neighborhoods (Bridgeport, Uptown, Rogers Park, Bronzeville, Little Italy, Old Town).
- **Event + area combos** (for example "quinceañera chairs in Aurora"): only add once each can carry genuinely unique content, to avoid thin pages.
- **Proof:** add real photos, reviews and Google Business Profile embeds after the first events. No testimonials or stats are used yet, because the business is pre-launch.



## Event planning guides and free downloads (added 2026-11-02)

Goal: answer every planning question for any event type, then capture the email with a matching free download. Every guide on the site (640+) now shows a download offer that matches its topic (`downloadForPost` in `src/data/downloads.ts`, or `download:` in the post header).

How the files are built: `python3 scripts/build-spreadsheets.py` (xlsx + csv with live formulas), `node scripts/build-kit-pdfs.mjs` (PDF kits + covers from `src/data/kits/*.json`), `bash scripts/build-previews.sh` (spreadsheet previews). Leads: kind `waitlist`, source `download:<slug>` or `download:<slug>@blog:<post>`. Emails the links when `RESEND_API_KEY` and `NOTIFY_FROM` are set.

### Download pages (20 + hub `/downloads`)

| Page | Asset | Last touched | Visuals / schema | Capture | Remaining |
|---|---|---|---|---|---|
| `/downloads/event-planning-kit` | Ultimate Event Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:event-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/event-budget-spreadsheet` | Event Budget Spreadsheet | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:event-budget-spreadsheet` | Add a short preview video; A/B test the form fields |
| `/downloads/guest-list-rsvp-tracker` | Guest List and RSVP Tracker | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:guest-list-rsvp-tracker` | Add a short preview video; A/B test the form fields |
| `/downloads/seating-chart-planner` | Seating Chart Planner | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:seating-chart-planner` | Add a short preview video; A/B test the form fields |
| `/downloads/rental-order-calculator` | Rental Order Calculator | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:rental-order-calculator` | Add a short preview video; A/B test the form fields |
| `/downloads/vendor-tracker` | Vendor Comparison and Contact Tracker | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:vendor-tracker` | Add a short preview video; A/B test the form fields |
| `/downloads/run-of-show-template` | Day-of Timeline and Run of Show | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:run-of-show-template` | Add a short preview video; A/B test the form fields |
| `/downloads/wedding-planning-kit` | Wedding Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:wedding-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/birthday-party-planning-kit` | Birthday Party Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:birthday-party-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/shower-planning-kit` | Baby and Bridal Shower Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:shower-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/corporate-event-planning-kit` | Corporate Event Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:corporate-event-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/gala-fundraiser-planning-kit` | Gala and Fundraiser Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:gala-fundraiser-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/graduation-party-planning-kit` | Graduation Party Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:graduation-party-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/quinceanera-planning-kit` | Quinceañera Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:quinceanera-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/south-asian-wedding-planner` | South Asian Wedding Multi-Event Planner | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:south-asian-wedding-planner` | Add a short preview video; A/B test the form fields |
| `/downloads/mitzvah-planning-kit` | Bar and Bat Mitzvah Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:mitzvah-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/holiday-party-planning-kit` | Holiday Party Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:holiday-party-planning-kit` | Add a short preview video; A/B test the form fields |
| `/downloads/outdoor-event-weather-plan` | Outdoor Event Weather Plan | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:outdoor-event-weather-plan` | Add a short preview video; A/B test the form fields |
| `/downloads/celebration-of-life-planning-checklist` | Celebration of Life Planning Checklist | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:celebration-of-life-planning-checklist` | Add a short preview video; A/B test the form fields |
| `/downloads/backyard-party-planning-kit` | Backyard Party Planning Kit | 2026-11-02 | Cover preview image, DigitalDocument + FAQPage + BreadcrumbList schema | Email gate, source `download:backyard-party-planning-kit` | Add a short preview video; A/B test the form fields |

### New planning guides (120)

| Page | Title | Last touched | Visuals / schema | Download offered | Remaining |
|---|---|---|---|---|---|
| `/blog/wedding-planning-timeline-12-months` | Wedding Planning Timeline: A 12-Month Checklist for Chicago | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-much-does-a-wedding-cost-in-chicago` | How Much Does a Wedding Cost in Chicago? Typical Ranges | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-set-a-wedding-budget` | How to Set a Wedding Budget You Can Actually Stick To | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-cut-a-wedding-guest-list` | How to Cut a Wedding Guest List Without Hurting Feelings | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `guest-list-rsvp-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/when-to-send-save-the-dates-and-invitations` | When to Send Save the Dates and Wedding Invitations | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `guest-list-rsvp-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/wedding-rsvp-deadline-and-follow-up` | Wedding RSVP Deadline: What to Set and How to Follow Up | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `guest-list-rsvp-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-choose-a-wedding-venue-chicago` | How to Choose a Wedding Venue in Chicago: 12 Questions | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `vendor-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/wedding-day-timeline-template` | Wedding Day Timeline Template: Hour by Hour Schedule | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `run-of-show-template` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-plan-a-wedding-in-6-months` | How to Plan a Wedding in 6 Months: A Realistic Schedule | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/wedding-vendor-booking-order` | Wedding Vendor Booking Order: Who to Hire First and When | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `vendor-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/bachelorette-party-planning-chicago` | Bachelorette Party Planning in Chicago: Timeline and Budget | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/bachelor-party-planning-chicago` | Bachelor Party Planning in Chicago: Budget, Dates and Ideas | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/wedding-welcome-party-planning` | Wedding Welcome Party Planning: Ideas, Timeline and Costs | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/wedding-weekend-itinerary-out-of-town-guests` | Wedding Weekend Itinerary for Out-of-Town Guests: A Plan | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/hotel-room-blocks-for-wedding-guests` | Hotel Room Blocks for Wedding Guests: How They Work | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/wedding-planner-vs-day-of-coordinator` | Wedding Planner vs Day-of Coordinator: Which Do You Need? | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/wedding-vendor-tipping-guide` | Wedding Vendor Tipping Guide: Who to Tip and How Much | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/elopement-planning-chicago` | Elopement Planning in Chicago: Permits, Timeline and Costs | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/small-wedding-planning-under-50-guests` | Small Wedding Planning for Under 50 Guests: A Full Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/wedding-planning-mistakes-to-avoid` | Wedding Planning Mistakes to Avoid: 12 Costly Errors | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-plan-a-birthday-party-checklist` | How to Plan a Birthday Party: A Step-by-Step Checklist | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `birthday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/adult-birthday-party-ideas-chicago` | Adult Birthday Party Ideas in Chicago for Any Budget | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `birthday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/kids-birthday-party-timeline-and-games` | Kids Birthday Party Timeline and Games That Keep It Fun | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `birthday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/21st-birthday-party-planning` | 21st Birthday Party Planning: Ideas, Budget and Timeline | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `birthday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/50th-birthday-party-planning` | 50th Birthday Party Planning: Ideas, Timeline and Budget | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `birthday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/80th-and-90th-birthday-party-planning` | 80th and 90th Birthday Party Planning: A Comfort-First Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `birthday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-plan-a-baby-shower-checklist` | How to Plan a Baby Shower: A Checklist From Start to Finish | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `shower-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/baby-shower-games-and-timeline` | Baby Shower Games and Timeline: A Simple Two-Hour Plan | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `shower-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/bridal-shower-planning-who-hosts-and-when` | Bridal Shower Planning: Who Hosts, When and What to Do | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `shower-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/sip-and-see-party-planning` | Sip and See Party Planning: Timing, Guest List and Layout | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `shower-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/anniversary-party-planning-25th-50th` | Anniversary Party Planning for 25th and 50th Celebrations | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/class-reunion-planning-guide` | Class Reunion Planning Guide: Timeline, Budget and Tips | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `guest-list-rsvp-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/going-away-farewell-party-planning` | Going Away and Farewell Party Planning: A Simple Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/post-prom-party-planning` | Post-Prom Party Planning: A Guide for Parents and Schools | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/halloween-party-planning-guide` | Halloween Party Planning Guide: Ideas, Food and Layout | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `holiday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/easter-brunch-and-egg-hunt-planning` | Easter Brunch and Egg Hunt Planning for Chicago Families | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `holiday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/mothers-day-and-fathers-day-gatherings` | Mother's Day and Father's Day Gatherings: Plan a Great Day | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `backyard-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/thanksgiving-dinner-for-a-crowd` | Thanksgiving Dinner for a Crowd: Plan, Seat and Serve 20+ | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `holiday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-plan-a-party-on-a-budget` | How to Plan a Party on a Budget Without Cutting the Fun | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-much-food-per-person-for-a-party` | How Much Food Per Person for a Party: Amounts by Event Type | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `rental-order-calculator` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/corporate-event-planning-checklist` | Corporate Event Planning Checklist: 12 Weeks to Event Day | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `corporate-event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/company-holiday-party-planning-timeline` | Company Holiday Party Planning Timeline: Month by Month | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `holiday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/corporate-event-budget-per-person` | Corporate Event Budget Per Person: How to Plan the Split | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-choose-a-corporate-event-venue-chicago` | How to Choose a Corporate Event Venue in Chicago: 7 Checks | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `vendor-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/conference-planning-timeline` | Conference Planning Timeline: 6 Months from Idea to Day One | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `corporate-event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/company-offsite-retreat-planning-chicago` | Company Offsite Retreat Planning in Chicago: A Full Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `corporate-event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/team-building-event-ideas-chicago` | Team Building Event Ideas in Chicago for Every Group Size | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `corporate-event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/employee-appreciation-event-ideas` | Employee Appreciation Event Ideas That Feel Genuine | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `corporate-event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/sales-kickoff-event-planning` | Sales Kickoff Event Planning: Agenda, Space and Timeline | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `corporate-event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/fundraising-gala-planning-timeline` | Fundraising Gala Planning Timeline: A 9 Month Plan | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `gala-fundraiser-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/silent-auction-planning-guide` | Silent Auction Planning Guide: Items, Bidding and Setup | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `gala-fundraiser-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/charity-walk-or-5k-event-planning` | Charity Walk or 5K Event Planning: Course, Permits, Setup | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `gala-fundraiser-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-sponsorship-packages-guide` | Event Sponsorship Packages Guide: Tiers, Pricing and Pitch | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `gala-fundraiser-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-run-of-show-how-to-write-one` | Event Run of Show: How to Write One That Actually Works | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `run-of-show-template` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-increase-event-attendance` | How to Increase Event Attendance: 10 Practical Steps | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-registration-and-check-in-setup` | Event Registration and Check-In Setup: Tables, Staff, Flow | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `corporate-event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/dietary-restrictions-planning-for-events` | Dietary Restrictions Planning for Events: A Simple Method | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-measure-event-roi` | How to Measure Event ROI: Goals, Costs and Simple Math | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/volunteer-coordination-for-nonprofit-events` | Volunteer Coordination for Nonprofit Events, Step by Step | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `gala-fundraiser-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/awards-ceremony-planning-guide` | Awards Ceremony Planning Guide: Program, Stage and Seating | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `corporate-event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/quinceanera-planning-checklist-and-timeline` | Quinceañera Planning Checklist and Timeline: 12 Months Out | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `quinceanera-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-much-does-a-quinceanera-cost-chicago` | How Much Does a Quinceañera Cost in Chicago? Real Ranges | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/bar-mitzvah-planning-timeline` | Bar Mitzvah Planning Timeline: What to Do and When | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `mitzvah-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/bat-mitzvah-party-planning-ideas` | Bat Mitzvah Party Planning Ideas: Themes, Layouts, Budget | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `mitzvah-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/indian-wedding-planning-timeline` | Indian Wedding Planning Timeline: 12 to 18 Months Out | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `south-asian-wedding-planner` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/haldi-ceremony-setup-and-planning` | Haldi Ceremony Setup and Planning: A Practical Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `south-asian-wedding-planner` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/navratri-garba-night-planning-chicago` | Navratri Garba Night Planning in Chicago: Hall to Dance | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/holi-celebration-event-planning` | Holi Celebration Event Planning: Colors, Cleanup, Safety | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/iftar-dinner-planning-for-a-crowd` | Iftar Dinner Planning for a Crowd: Timing, Food, Seating | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/passover-seder-for-a-crowd` | Passover Seder for a Crowd: Seating, Tables, Timing | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/hanukkah-party-planning` | Hanukkah Party Planning: Menu, Candles, Games, Seating | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `holiday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/confirmation-party-planning` | Confirmation Party Planning: Ideas, Budget, and Timeline | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `graduation-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/chinese-wedding-banquet-planning` | Chinese Wedding Banquet Planning: Tables, Courses, Timing | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/korean-doljanchi-first-birthday-planning` | Korean Doljanchi First Birthday Planning: Table and Guests | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `birthday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/funeral-repast-planning-guide` | Funeral Repast Planning Guide: Food, Seating, and Timing | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `celebration-of-life-planning-checklist` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/shiva-house-setup-and-meals` | Shiva House Setup and Meals: A Practical Family Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `celebration-of-life-planning-checklist` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/kwanzaa-celebration-planning` | Kwanzaa Celebration Planning: Karamu, Kinara, and Seating | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `holiday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/dia-de-muertos-gathering-planning` | Dia de Muertos Gathering Planning: Ofrenda, Food, Seating | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/church-anniversary-celebration-planning` | Church Anniversary Celebration Planning: Service to Dinner | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `gala-fundraiser-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/african-wedding-reception-planning-chicago` | African Wedding Reception Planning in Chicago: A Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 8 FAQs (FAQPage), BlogPosting | `wedding-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-plan-an-event-step-by-step` | How to Plan an Event Step by Step, From Idea to Day Of | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-planning-timeline-by-event-type` | Event Planning Timeline by Event Type: When to Do What | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-make-an-event-budget` | How to Make an Event Budget: A Simple Plan With Splits | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-make-a-guest-list-for-any-event` | How to Make a Guest List for Any Event Without Hurt Feelings | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `guest-list-rsvp-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-make-a-seating-chart-for-any-event` | How to Make a Seating Chart for Any Event, Step by Step | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `seating-chart-planner` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-track-rsvps` | How to Track RSVPs Without Chasing Every Guest by Text | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `guest-list-rsvp-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-choose-an-event-date` | How to Choose an Event Date That Works for Most Guests | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-pick-an-event-theme` | How to Pick an Event Theme That Fits Your Budget and Guests | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-day-of-emergency-kit-checklist` | Event Day-of Emergency Kit Checklist: What to Pack and Why | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `run-of-show-template` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-hire-event-vendors` | How to Hire Event Vendors: Vetting, Quotes and Contracts | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `vendor-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-much-alcohol-for-a-party` | How Much Alcohol for a Party? A Simple Guide by Guest Count | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `rental-order-calculator` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-plan-an-event-in-4-weeks` | How to Plan an Event in 4 Weeks: A Week-by-Week Rush Plan | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/hosting-a-party-at-home-checklist` | Hosting a Party at Home Checklist: Space, Seats, Food, Cleanup | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `backyard-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/inclusive-event-planning-checklist` | Inclusive Event Planning Checklist for Guests of All Needs | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-cleanup-plan` | Event Cleanup Plan: Teardown, Trash and Rental Returns Made Easy | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `run-of-show-template` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/four-hour-party-timeline` | Four Hour Party Timeline: A Run of Show You Can Copy | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `run-of-show-template` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-photography-shot-list` | Event Photography Shot List: 25 Moments to Capture at Any Event | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `run-of-show-template` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/digital-vs-paper-invitations` | Digital vs Paper Invitations: Which Is Right for Your Event? | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `guest-list-rsvp-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-planning-mistakes-to-avoid` | Event Planning Mistakes to Avoid: 12 Costly Errors and Fixes | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-delegate-event-tasks-to-family-and-volunteers` | How to Delegate Event Tasks to Family and Volunteers | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `run-of-show-template` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/best-month-to-host-an-event-in-chicago` | Best Month to Host an Event in Chicago: A Season Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/types-of-event-venues-chicago-compared` | Types of Event Venues in Chicago Compared: How to Choose | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `vendor-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/backyard-party-vs-venue-cost` | Backyard Party vs Venue Cost: A Fair Chicago Comparison | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-venue-rental-cost-chicago` | Event Venue Rental Cost in Chicago: What Drives the Price | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/catering-cost-per-person-chicago` | Catering Cost Per Person in Chicago: What Drives the Price | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-budget-spreadsheet` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/dj-vs-band-cost-and-choice` | DJ vs Band: Cost and How to Choose for Your Chicago Event | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `vendor-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-photographer-cost-and-hiring` | Event Photographer Cost and Hiring Guide for Chicago | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `vendor-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/guest-parking-and-transit-plan-chicago` | Guest Parking and Transit Plan for Your Chicago Event | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/planning-an-event-around-chicago-sports-games` | Planning an Event Around Chicago Sports Games and Schedules | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/chicago-winter-holiday-party-season-booking` | Chicago Winter Holiday Party Season: When to Book Everything | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `holiday-party-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/indoor-backup-plan-for-outdoor-events` | Indoor Backup Plan for Outdoor Events: A Rain Plan That Works | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `outdoor-event-weather-plan` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/how-to-plan-a-progressive-or-multi-location-party` | How to Plan a Progressive or Multi-Location Party Route | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-guest-welcome-bags-and-hotel-logistics` | Guest Welcome Bags and Hotel Logistics for Out-of-Town Guests | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `guest-list-rsvp-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/kid-friendly-event-planning` | Kid-Friendly Event Planning: Making Space for Children | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/multi-day-event-planning` | Multi-Day Event Planning: Schedules, Budgets and Guests | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `run-of-show-template` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/neighborhood-festival-planning` | Neighborhood Festival Planning: A Chicago Organizer's Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/church-hall-and-community-center-event-planning` | Church Hall and Community Center Event Planning Guide | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `vendor-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/restaurant-private-room-vs-full-venue` | Restaurant Private Room vs Full Venue: Which Is Right | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `vendor-tracker` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/event-signage-wording-guide` | Event Signage Wording Guide: What to Say and Where | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `event-planning-kit` | Add a real photo or render; check rankings in Search Console after 30 days |
| `/blog/planning-an-event-for-older-guests` | Planning an Event for Older Guests: Comfort and Access | 2026-11-02 | SVG figure, stat grid, table, steps, 7 FAQs (FAQPage), BlogPosting | `seating-chart-planner` | Add a real photo or render; check rankings in Search Console after 30 days |

## 2026-11-03: Step-by-step event planner on /quote
- /quote now opens a guided planner. It asks for the occasion, guests, style (simple, classic or lavish), setting (venue, backyard, tent or park), extras, date or month, and rental budget.
- Each answer builds a picture-first recommended list with tap-to-adjust steppers and a reason for every line. Style cards show the live price for that guest count. A budget meter offers a one-tap "switch style and save".
- The free personalised plan unlocks with name and email. It includes an assessment (lead time, Chicago weather, peak Saturdays, permits), a dated checklist with tick boxes, a floor plan sketch and a budget breakdown.
- Unlocking saves the lead with all items: kind "quote" when a date or month is given, otherwise "quiz". The source is `planner:<event>-<style>`.
- Logic lives in src/lib/event-plan.ts and the UI in src/components/planner/. The full catalog builder is still at /quote?browse=1, and ?items=, ?chairs= and ?look= links still open it. ?event=<id> starts the planner at that occasion.

## 2026-11-03: Planner v2, downloadable plan, availability calendar
- New planner order on /quote:
  1. Occasion
  2. Guests
  3. Where: backyard, indoors, outdoor venue or tent, or park
  4. Package: Simple, Signature or Lavish, each priced for the guest count and setting
  5. Essentials: seating, tables, linens, tableware, glass
  6. Add-ons: each shows its price for the guest count, and setting-specific needs are recommended
  7. Date and details
  8. Your plan
- The plan downloads as a PDF (jsPDF, built in the browser). It has the list and prices, an assessment, space needs and a dated checklist. A "Book a free call" button and the next steps sit on the plan page.
- /admin/availability: tap a day to block or open it, block a range with a private reason, and see enquiry and booked counts on each day. Blocked dates are stored in the `blocked_dates` table (or .data/availability.json locally) and served by /api/availability. The planner and quote form date pickers refuse blocked dates.
- Owner: re-run supabase/schema.sql to create `blocked_dates`. Until then every date shows as open.

## 2026-11-03: Party ideas, setups and activities in the quote flow

Angad asked for researched party ideas per party type, including activities, games, props and setup ideas, with matching add-ons selectable during quoting.

- Data: `src/data/party-ideas/` (12 party types in `party-types.ts`, 34 themes in `ideas-*.ts`). Every rental is a featured catalog id; props and crafts are marked DIY (not rentals). Validate with `npx tsx scripts/check-party-ideas.ts`.
- New routes (last touched 2026-11-03):

| Route | SEO | AEO | GEO | Visuals | FAQ | CTA | Remaining to improve |
|---|---|---|---|---|---|---|---|
| `/party-ideas` | ✅ | ✅ CollectionPage + ItemList, FAQPage | ⚠️ Chicago in copy | ✅ scene images, palette bars | ✅ | ✅ planner + QuoteCta | Dedicated styled images per theme (most themes reuse 14 event scenes) |
| `/party-ideas/[type]` (12) | ✅ | ✅ CollectionPage, FAQPage, breadcrumbs | ⚠️ Chicago-specific tips in FAQs | ✅ hero scene, theme cards | ✅ | ✅ "Plan your …" → `/quote?event=` | Link from matching `/events/[slug]` pages; more themes per type |
| `/party-ideas/[type]/[idea]` (34) | ✅ | ✅ HowTo (supplies, tools, steps), FAQPage | ⚠️ | ✅ scene, palette SVG, setup sketches, rental renders | ✅ | ✅ "Plan this party" → `/quote?event=&idea=` | Own Gemini scene per theme; real event photos once we have them |

- Planner (`/quote`): the Add-ons step now shows "Party ideas for your <occasion>" tiles with the price each adds for the guest count. Picking one adds its rentals under "From your party ideas" (an item already on the list keeps the larger quantity). The plan page and PDF show each picked idea's setup (indoor or backyard text by setting), activities and props. The CRM message gets "Party ideas: …". `?idea=<slug>` preselects a theme and its occasion.
- Linked from the header ("Party ideas"), footer, sitemap and llms.txt.
