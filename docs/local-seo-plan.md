# Local SEO Plan: Chicago & Fox Valley

_Last touched: 2026-10-31 · Owner: Angad · Status: ready to execute_

Goal: when anyone in Chicagoland searches for wedding or event chairs ("chair rental near me", "cross back chair rental chicago", "ghost chair rental naperville"), beyondchivary shows up in the Map Pack, in the organic results, and in AI answers (ChatGPT, Gemini, Perplexity, Google AI Overviews).

**Legend**
- 🔑 = needs Angad's own login, phone, ID or payment. Claude can't do these.
- 🤖 = Claude can do this in the repo (open a thread and ask).
- ⏳ = time-gated (see dates).

---

## 0. Decide these first (everything else depends on them)

Local rankings depend on **NAP consistency**: the same Name, Address/area and Phone everywhere. Fix these once, before creating any listing, or every directory will have to be edited later.

| Decision | Current state in code | Recommendation |
|---|---|---|
| Business name | Site says "Event Seatings" (`src/lib/site.ts`) | Pick the final legal/DBA name now. If it's **Beyond Chivary**, file the Illinois assumed-name (DBA) with Kane County 🔑 and rename the site 🤖. Google requires the profile name to match the real-world name; adding keywords ("Beyond Chivary Chair Rentals Chicago") can get the profile suspended. |
| Spelling | Brand "Chivary", industry term "Chiavari" | Keep the brand as you like it, but always spell the chair "Chiavari" in page copy. Far more people search "chiavari chair rental" than "chivary" (check exact volumes in Google Keyword Planner). The brand name doubles as a "did you mean" catch for misspellers. |
| Domain | `eventseatings.com` | Buy the matching domain 🔑 (e.g. beyondchivary.com) and 301-redirect any old one. |
| Phone | None on site | Get a dedicated local number 🔑 (Google Voice with a 630 or 312 area code is fine). A local number + click-to-call is a strong lead driver. Use it everywhere, never a personal cell. |
| Address | St. Charles, IL (no street) | Run as a **service-area business**: give Google the real address for verification but **hide it** on the profile. Never use a UPS Store/virtual office; that's a suspension trigger. |
| Email | hello@eventseatings.com | Move to hello@<final domain> 🔑. |

### Pre-launch timing ⏳
The site says first deliveries are **April 1, 2027**. Google lets a business create a profile with a future **opening date up to 90 days ahead**, so:
- **Now – Dec 2026:** do the website, content, social profiles, and non-Google directories that allow "coming soon" (Section 3).
- **~Jan 2, 2027:** create the Google Business Profile with opening date 2027-04-01.
- **Verification:** Google now usually asks for a **video verification** of a service-area business: show your branded vehicle or inventory, the tools of the trade, and proof you manage the business (e.g. a business document or a logged-in admin screen). Plan to have at least a few sample chairs, a logo sign or vehicle magnet, and your DBA paperwork by January. 🔑

---

## 1. Google Business Profile 🔑 (setup) 🤖 (copy below is ready)

Create at business.google.com with your Google account.

### Categories
- **Primary:** Party equipment rental service
- **Secondary (pick up to 4, only ones you actually do):**
  - Furniture rental service
  - Wedding service
  - Event planning service _(only if you offer layout/styling help)_
  - Chair rental service _(use if Google suggests it when you type "chair"; category lists change)_

Primary category is the single biggest Map Pack factor. Don't add "Wedding venue" or "Tent rental" unless you offer them.

### Service area (max 20)
St. Charles, Geneva, Batavia, Elgin, Naperville, Aurora, Wheaton, Oak Brook, Schaumburg, Chicago, plus: Downers Grove, Hinsdale, Lisle, Glen Ellyn, Oswego, South Elgin, Barrington, Arlington Heights, Kane County, DuPage County.
Keep it within about 2 hours' drive. Big service areas don't help ranking; proximity to the searcher does, which is why the city pages in Section 6 matter.

### Business description (750 chars max)
> Beyond Chivary rents statement wedding and event chairs across Chicago, the Fox Valley and the western suburbs. Go beyond the standard Chiavari: cross-back vineyard chairs, ghost chairs, rattan garden chairs, bentwood bistro, wishbone, velvet dining, gold infinity and cane-back styles, in multiple finishes. We deliver, set up and pick up for weddings, ceremonies, receptions, sangeets and mandaps, quinceañeras, showers, rehearsal dinners, galas and corporate events. Not sure which chair fits your venue? Take our 60-second style quiz or book a free 15-minute seating consult and we'll recommend styles, quantities and a layout for your guest count. Now booking our 2027 founding season.

(No URLs, phone numbers or ALL-CAPS in the description; Google rejects them.)

### Services (add each with a short description and "starting at" price once known)
| Service | Description |
|---|---|
| Wedding chair rental | Ceremony and reception chairs in 8+ styles, delivered and set up. |
| Cross-back chair rental | Rustic vineyard-style chairs in walnut, natural oak or black. |
| Ghost chair rental | Clear or smoke acrylic chairs for modern and black-tie events. |
| Chiavari chair alternatives | Bentwood, wishbone, cane-back and infinity chairs. |
| Velvet & sweetheart chairs | Emerald, blush, navy or champagne velvet for head and sweetheart tables. |
| Ceremony seating setup | Aisle, spiral and in-the-round layouts. |
| South Asian wedding seating | Mandap, sangeet and reception seating. |
| Corporate & gala chair rental | Upgrade from banquet chairs for galas and launches. |
| Delivery, setup & pickup | Included across the service area. |
| Free seating consult | 15-minute call to choose styles, counts and layout. |

### Products (one per chair, with photo, link to its `/chairs/<slug>` page)
Cross-Back Vineyard, Ghost, Rattan Garden, Bentwood Bistro, Wishbone, Velvet Dining, Gold Infinity, Cane-Back. Use real photos as soon as you have them; renders are fine to start.

### Attributes
Online appointments ✔, Online estimates ✔, Women-owned / Asian-owned / veteran-owned etc. if true ✔, Language assistance (Hindi/Punjabi/Spanish) if true.

### Booking & links
- Website: `https://<domain>/?utm_source=google&utm_medium=gbp&utm_campaign=profile`
- Appointment link: `/quote?utm_source=google&utm_medium=gbp&utm_campaign=book` (or a Calendly/Cal.com link 🔑 for the 15-min consult)
- Enable **Messages** and answer within 24 h (response time is shown publicly).

### Photos (upload 20+ before launch, then 3–5 a week)
Logo (square), cover (16:9 styled table), each chair close-up, each chair in a setup, delivery vehicle/team, a short 3D-spin video of each chair (render from `npm run remotion:render` 🤖). Name files descriptively, e.g. `cross-back-chair-rental-st-charles.jpg`.

### Posts (weekly; ready-to-paste first 8)
1. **Now booking 2027** – "Founding-season dates are limited. Request a quote and lock in founding pricing." → /quote
2. **Which chair fits your venue?** – "Take the 60-second style quiz." → /quiz
3. **Cross-back vs Chiavari** – link the blog post.
4. **How many chairs do you really need?** – link the blog post.
5. **Ghost chairs, 10 ways** – carousel of renders.
6. **Sangeet & mandap seating** – link South Asian post.
7. **Barn weddings in the Fox Valley** – link barn post.
8. **Free 15-min seating consult** – "Send your floor plan and guest count; we'll send back a layout." → booking link
Then: one post per new blog article (the content calendar already schedules these), plus seasonal offers (engagement season Dec–Feb is the biggest booking window).

### Q&A seeds
Google has been phasing out public Q&A on Maps in favor of AI answers drawn from your profile, website and reviews. If Q&A is still offered on your profile, post these yourself; either way, put these answers **on the website FAQ** (🤖 `src/app/faq/page.tsx`, with FAQPage schema) and in the GBP description/services, where Google and AI assistants will pick them up:
1. Do you deliver and set up? → Yes, delivery, setup and pickup are included within our service area.
2. What areas do you serve? → Chicago, the Fox Valley and the western suburbs (list cities).
3. Is there a minimum order? → (fill in, e.g. 50 chairs)
4. How far ahead should I book? → 6–12 months for May–October Saturdays; 4–8 weeks for off-season.
5. Can I see the chairs before booking? → Yes, book a showroom/sample visit or a video walk-through.
6. Do you offer Chiavari chairs? → We specialize in alternatives (list); tell us your vision.
7. Are your chairs safe on grass? → Which styles work best outdoors.
8. What's your cancellation / weather policy? → (fill in)
9. Do you do cultural weddings (sangeet, mandap, quinceañera)? → Yes, examples.
10. How much does wedding chair rental cost in Chicago? → Range + link to cost post.

---

## 2. Bing Places & Apple Business Connect 🔑

- **Bing Places** (bingplaces.com): use "Import from Google" once GBP is verified; it copies everything. Bing powers ChatGPT search and Copilot results, so this matters for AI visibility too.
- **Apple Business Connect** (businessconnect.apple.com): create a place card for Apple Maps and Siri. Same categories (closest: "Party Supply Rental" / "Event Services"), hide address, add photos and a "Book" action link to /quote.
- Also claim **Waze** (via Google) and **Yahoo/Yext-fed** listings come via the data aggregators below.

---

## 3. Citations & directories

Do the top tier by hand 🔑 (each needs your email/phone verification). Use exactly the NAP from Section 0. Track every listing in the table at the bottom.

### Tier 1: must-have (do first)
| Directory | Why | Notes |
|---|---|---|
| Google Business Profile | Map Pack | Section 1 |
| Bing Places | Bing, ChatGPT, Copilot | Section 2 |
| Apple Business Connect | Apple Maps, Siri | Section 2 |
| Yelp for Business | Heavily used by Apple Maps & AI answers | Category: Party Equipment Rentals. Don't ask for Yelp reviews (against Yelp rules); just link to it. |
| The Knot Marketplace | #1 wedding vendor search | Category: Rentals. Free listing first; paid tiers later if leads justify. |
| WeddingWire | Same company as The Knot; separate listing | Category: Event Rentals |
| Zola Vendors | Growing; strong for St. Charles venue pages | Free |
| Facebook Page | Reviews, local trust | Business category: Party Equipment Rental |
| Instagram (business) | Discovery; link in bio → /quiz | Handle matches brand |
| Pinterest (business) | Huge for wedding decor; pin every chair & blog image | Claim the website for rich pins |
| Nextdoor Business | Neighborhood recommendations | |
| BBB (Chicago & Northern IL) | Trust signal; free profile | Accreditation optional (paid) |

### Tier 2: wedding & event platforms
Here Comes The Guide (vendor), Chicago Style Weddings vendor directory, Junebug Weddings (if photo quality allows), Carats & Cake, Wedding Spot, Peerspace / Tagvenue (as vendor), Thumbtack, Bark, GigSalad, Party Slate (Chicago is a core market), Eventective, Brides of Color / South Asian directories (Shaadi Bazaar, Maharani Weddings vendor list, WedMeGood US), Quinceañera directories (Quinceanera.com vendors).

### Tier 3: data aggregators & general (feed hundreds of smaller sites)
- **Data Axle** (formerly Infogroup), **Neustar Localeze**, **Foursquare** (powers many apps & some AI). Submitting to these 🔑 or via a paid service (BrightLocal Citation Builder ~$2–3/citation, or Whitespark) is the cheapest way to get 50+ consistent citations. Recommend BrightLocal one-time build after GBP is verified.
- Manta, Hotfrog, Chamber of Commerce.com, Superpages/Yellow Pages (YP), MapQuest (via Yext or Foursquare), Alignable, LinkedIn Company Page.

### Tier 4: local & chamber (also great backlinks)
- **St. Charles Area Chamber of Commerce** (membership 🔑, includes directory listing + link)
- **Geneva Chamber**, **Batavia Chamber**, **Naperville Area Chamber**, **Choose DuPage**
- **Go St. Charles** (visitstcharles.com) / **Visit Aurora & Elgin** tourism partner listings
- **Choose Chicago** partner directory (paid membership; worth it once revenue starts)
- **Kane County / DuPage County** wedding & event guides

---

## 4. Reviews

Reviews are the #2 Map Pack factor and the #1 thing couples read. Goal: **10 Google reviews in the first 60 days after the first event, 50 in year one**, with replies to every one.

Pre-launch: you can't fake reviews, but you can collect them honestly from **anything real**: friends' events you've helped style, a free "founding" setup for a styled shoot, partner vendors who've seen the chairs. Reviews must describe a real experience.

### Get the link
GBP → "Ask for reviews" → copy the short link (g.page/r/...). 🔑 Put it in a QR code on a small card left with the setup.

### Scripts 🤖 (ready to paste)

**Text (send the morning after the event):**
> Hi {Name}! It was such a joy setting up the {chair} chairs for your {event}. If you have 2 minutes, a Google review would mean the world to a small local business: {link}. Congrats again! — Angad, Beyond Chivary

**Email (send day 3 if no review):**
> Subject: Your {event} seating, plus a tiny favor
>
> Hi {Name},
> Thank you for letting us be part of {event} at {venue}. We hope your guests loved the {chair} chairs.
> If you'd share a few words about your experience, it helps other couples in {city} find us: {link}
> A photo of your setup in the review is the best gift of all.
> Warmly, Angad

**Planner / venue partner:**
> Hi {Name}, great working with you at {venue} on {date}. If you were happy with the delivery and setup, would you leave a quick Google review from your business account? Happy to return the favor anytime. {link}

**Reply templates:**
- 5★: "Thank you, {Name}! The {chair} chairs looked stunning at {venue}. Wishing you both a lifetime of happiness." (Mention chair + venue + city naturally; it helps relevance.)
- ≤3★: "Thank you for the honest feedback, {Name}. I'm sorry {issue}. I'd like to make it right; please call me at {phone}." Then take it offline.

Rules: never offer discounts for reviews (Google and FTC rules), never review-gate (ask everyone, not just happy customers), and ask for The Knot/WeddingWire reviews in the same message as a second link.

---

## 5. Backlinks & partnerships

Local links from real Chicago wedding businesses are worth more than any directory. Approach: **give first** (free chairs for a styled shoot, a guest post, a referral).

### Venues (ask to join their preferred vendor list; offer a free sample setup for their photos)
Fox Valley / St. Charles: Hotel Baker, Royal Fox Country Club, Cedar Fox Weddings & Events, Eden Events (riverfront), Arcada Theatre, Q Center, Pottawatomie Park & Pavilion, Herrington Inn & Spa (Geneva), Riverside Receptions (Geneva), Wildflower / barn venues in Elburn & Maple Park.
Western suburbs: Morton Arboretum (Lisle), Naper Settlement, Drury Lane (Oakbrook Terrace), Cantigny Park (Wheaton), Danada House, Chandelier Banquets / South Asian banquet halls in Schaumburg and Naperville.
Chicago: loft and raw-space venues that require outside rentals (Salvage One, Morgan Manufacturing, Loft on Lake, Ovation, Venue One, Prairie Production). These "bring your own rentals" venues are the hottest leads because the couple **must** rent chairs.
_(Verify each venue's current vendor policy before outreach.)_

### Planners & coordinators
Search The Knot/WeddingWire "Wedding Planners, St. Charles IL" and "Chicago". Target day-of coordinators and South Asian wedding planners first; they recommend rentals constantly. Offer a **10% referral fee or planner pricing** and a one-page chair lookbook (🤖 can generate a PDF).

### Caterers, florists, photographers
Caterers often bundle rentals; florists style chair backs; photographers need styled-shoot props. Ask each for a "rental partners" link and offer one back on a `/partners` page 🤖.

### Content/PR links
- **Styled shoot**: team up with a photographer, florist and venue; submit to Chicago Style Weddings, Junebug, Green Wedding Shoes, Style Me Pretty. Each feature = a high-authority link + credit.
- **Local press**: Kane County Chronicle, Daily Herald, Patch (St. Charles, Naperville, Geneva Patch take community submissions), Shaw Local. Angle: "St. Charles founder launches statement-chair rental, lets couples vote on inventory."
- **Data PR** 🤖: publish "Chicago Wedding Seating Report 2027" from your vote/quiz data (the admin dashboard already ranks demand). Reporters and blogs link to original data.
- **HARO-style** sources (Qwoted, Featured.com, Help a B2B Writer): answer wedding-planning journalist queries.
- **Competitor gap**: check who links to Chicago rental companies (e.g. Windy City Event Rentals, 4242 & Co.) in Ahrefs/Semrush free tools and ask the same sites.

---

## 6. On-site local SEO 🤖 (Claude can do all of this in the repo)

- [ ] Rename brand in `src/lib/site.ts` once Section 0 is decided; update `NOTIFY_FROM`, OG image, Remotion videos.
- [ ] Add phone, `telephone`, `priceRange`, `sameAs` (all profile URLs), `geo`, `openingHoursSpecification` and `hasOfferCatalog` to the LocalBusiness JSON-LD in `src/app/layout.tsx`. Keep `@type: LocalBusiness` (there's no specific party-rental type) and describe services via `hasOfferCatalog`.
- [ ] **City landing pages** `/chair-rental/<city>` for each service-area city: local venues, drive time, chair styles popular there, photos, FAQ, quote CTA. Unique content per city, not find-and-replace.
- [ ] **Chair × city** pages for the top searches only (e.g. "cross back chair rental chicago", "ghost chair rental naperville").
- [ ] **Venue guides** "Chairs that work at {Venue}" for the top 20 BYO-rental venues. These rank for venue-name searches and make perfect outreach gifts for venues.
- [ ] FAQPage schema on `/faq` with the Q&A seeds above; Product schema on chair pages; Article schema on blog.
- [ ] Embed a Google Map of the service area on `/about` or a `/service-area` page.
- [ ] `llms.txt` and a plain-language "About Beyond Chivary" summary for AI crawlers (AEO/GEO).
- [ ] Click-to-call and "Book a 15-min consult" in the header on mobile.
- [ ] UTM tags on all profile links so the admin dashboard shows which listing sends leads.

---

## 7. Execution timeline

| When | Task | Who |
|---|---|---|
| This week | Decide name, domain, phone, email (Section 0) | 🔑 |
| This week | Rename site, schema upgrades, FAQ schema | 🤖 |
| Nov 2026 | Yelp, The Knot, WeddingWire, Zola, Facebook, Instagram, Pinterest, Nextdoor, LinkedIn | 🔑 |
| Nov 2026 | City landing pages (first 5: St. Charles, Naperville, Geneva, Chicago, Schaumburg) | 🤖 |
| Nov–Dec 2026 | Venue and planner outreach (20/week), styled shoot | 🔑 |
| Dec 2026 | Chamber memberships, local press pitch | 🔑 |
| ~Jan 2, 2027 ⏳ | Create GBP with opening date 2027-04-01; video verification | 🔑 |
| After verification | Bing import, Apple Business Connect, BrightLocal citation build | 🔑 |
| Jan–Mar 2027 | Weekly GBP posts + photos, data-PR report | 🔑 / 🤖 |
| From first event | Review requests within 24 h of every event | 🔑 |

### KPIs to watch monthly
Map Pack position for 10 tracked keywords (free: Local Falcon grid scan or GBP Performance), GBP calls/website clicks/bookings, number of Google reviews and average rating, referring domains, quote requests by `utm_source`.

---

## 8. Listing tracker

| Listing | URL | Status | Date | Notes |
|---|---|---|---|---|
| Google Business Profile | | ⏳ Jan 2027 | | |
| Bing Places | | Not started | | |
| Apple Business Connect | | Not started | | |
| Yelp | | Not started | | |
| The Knot | | Not started | | |
| WeddingWire | | Not started | | |
| Zola | | Not started | | |
| Facebook | | Not started | | |
| Instagram | | Not started | | |
| Pinterest | | Not started | | |
| Nextdoor | | Not started | | |
| BBB | | Not started | | |
| St. Charles Chamber | | Not started | | |

## Remaining to improve
- Verify current GBP category names in the live dashboard (Google renames them).
- Fill in minimums, pricing, cancellation policy for Q&A answers.
- Full competitor teardown (Map Pack top 3 for "chair rental" in each city) is a separate task.
