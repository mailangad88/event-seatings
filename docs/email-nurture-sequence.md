# Lead Nurture Email Sequence

**Goal:** turn a new lead (quote request, quiz taker or waitlist signup) into a booked 15-minute seating consult.
**Audiences:** couples planning a wedding, professional event and wedding planners, and corporate event organizers across Chicagoland: the city, the western suburbs and the Fox Valley.
**Last touched:** 2026-10-31
**Status:** Draft, ready to load into an email tool (ConvertKit, Mailchimp, Klaviyo, Resend, etc.)

> **Brand note:** the site code still says "Event Seatings" (`src/lib/site.ts`). These emails use **Beyond Chivary**, the name you want to launch under. Swap in whichever name wins before sending, and keep it consistent with the site.

---

## How the sequence works

| # | Send | Job of the email | Main CTA |
|---|------|------------------|----------|
| 1 | Immediately after signup | Thank them, confirm what happens next, offer the call early | Book a 15-min seating consult |
| 2 | Day 2 | Solve a real problem: how many chairs, which styles, ceremony vs. reception | Book a consult to get a seating plan |
| 3 | Day 5 | Show the look: chair pairings by event style, with visuals | Take the quiz or book a consult |
| 4 | Day 9 | Remove risk: pricing, delivery, setup, founding-season perks | Lock founding-season pricing on a call |
| 5 | Day 14 | Honest last nudge with date scarcity, then hand off to monthly newsletter | Hold my date (book a consult) |

**Rules**

- **Stop the sequence the moment someone books a call or replies.** Move them to a "booked" tag and send a human follow-up instead.
- **Segment by `event_type`** from the lead form. Each email has one swap-in paragraph per segment (Wedding / Planner / Corporate). If the type is unknown, use the Wedding version.
- **Send time:** Tuesday to Thursday, 9:30 to 11 a.m. Central works best for planners and corporate. Couples open more in the evening (7 to 9 p.m.) and on Sunday. If your tool supports it, use per-subscriber send-time optimization.
- **Plain, personal format.** Light HTML with one hero image and one button beats a heavy template. Sign every email from a real person.
- **One CTA per email.** Repeat the same link as a button and as a text link near the end.

**Merge tags used**

| Tag | Source | Fallback |
|-----|--------|----------|
| `{{first_name}}` | Lead form `name` | "there" |
| `{{event_type}}` | Lead form `event_type` | "your event" |
| `{{event_date}}` | Lead form `event_date` | "your date" |
| `{{city}}` | Lead form `city` | "the Chicago area" |
| `{{guest_count}}` | Lead form `guest_count` | (hide the sentence) |
| `{{chair_name}}` | First chair picked on the quote form, or top quiz match | "Cross-Back Vineyard Chair" |
| `{{booking_link}}` | Your Calendly / Cal.com / Google booking page | required |
| `{{local_line}}` | Chosen from `city` (see Chicago-area localization) | "Chicago (other)" line |
| `{{sender_name}}` | You | required |

Add UTM tags to every link, for example `?utm_source=email&utm_medium=nurture&utm_campaign=welcome&utm_content=e1`, so the admin dashboard and analytics show which email drove each booking.

## Chicago-area localization

Every email has a `{{local_line}}` slot. Fill it from the lead's `city` using the table below. If the city isn't listed, use the "Chicago (other)" line.

| Lead city / area | `{{local_line}}` |
|------------------|------------------|
| St. Charles, Geneva, Batavia | "We're based right here in St. Charles, so Fox River venues are a short drive for our crew." |
| Elgin, Aurora | "Fox Valley barns and banquet halls are home turf for us, a 20-minute drive from our base." |
| Naperville, Wheaton, Oak Brook | "We deliver across DuPage every week of the season, from country clubs to backyard tents." |
| Schaumburg, NW suburbs | "Hotel ballrooms and conference venues near O'Hare are a regular run for us." |
| Chicago (city) | "We handle city deliveries, including loading docks, freight elevators and permit-street parking, so your West Loop loft or Gold Coast ballroom setup goes smoothly." |
| North Shore, Lake County | "We cover the North Shore too. Ask about lakefront and estate venues." |
| Chicago (other) | "We serve all of Chicagoland, and the city is a short drive from our St. Charles base." |

**Seasonal swaps** (pick by `event_date` month):

| Event month | Season angle to use in Emails 2, 4 and 5 |
|-------------|------------------------------------------|
| May to October | Peak Chicago wedding season. Saturdays book 9 to 12 months out, so urge an early hold. Outdoor ceremonies: plan for wind off the lake and soft lawns after rain. |
| November to December | Holiday parties and corporate galas. Velvet, gold and Louis Medallion chairs for ballroom glam. Book before Thanksgiving. |
| January to March | Winter weddings and South Asian wedding season. Indoor venues, jewel tones, and warm statement seating. Off-peak dates often get better pricing. |
| April | Shoulder season. Mention a tent or indoor backup and chairs that handle damp grass (teak folding, cross-back). |

**Local event moments worth referencing:** spring and fall Saturdays at Fox Valley barns and vineyards, Chicago loft and rooftop weddings in summer, North Shore estate and garden parties, DuPage country-club receptions, sangeet and mandap seating for Chicagoland's large South Asian community, quinceañeras, and December corporate galas downtown.

---

## Email 1: Welcome (send immediately)

**Subject line options (A/B test the first two):**
- A: `Your chairs for {{event_date}}, next steps`
- B: `Got it, {{first_name}}. Here's what happens now`
- C: `Welcome to Beyond Chivary 🪑`

**Preview text:** `A 15-minute call gets you a seating plan, chair picks and real pricing.`

**Hero image:** the chair they picked (`/chairs/render/{{chair_slug}}.jpg`) or the home-page hero still.

**Body:**

> Hi {{first_name}},
>
> Thanks for reaching out about seating for {{event_type}} on {{event_date}}. I'm {{sender_name}}, and I started Beyond Chivary because every event seemed to get the same gold Chiavari chair, whether it suited the room or not.
>
> {{local_line}}
>
> Here's what happens next:
>
> 1. **We review your details** (date, guest count, venue, the chairs you liked).
> 2. **We hop on a quick 15-minute seating consult.** I'll suggest chairs that fit your venue and style, flag anything that will need extra planning (grass, stairs, a ceremony-to-reception flip), and talk through pricing.
> 3. **You get a written quote** with chairs, delivery, setup and pickup itemized. Nothing is charged until you confirm.
>
> **[ Book my 15-minute seating consult → ]({{booking_link}})**
>
> *[Segment swap-in]*
>
> - **Wedding:** Most couples tell me chairs are the decision they didn't know they'd have to make. A short call usually settles it, so you can get back to the fun parts.
> - **Planner:** If you're juggling several clients, I can quote multiple dates on one call and hold inventory while your clients decide.
> - **Corporate:** For galas, offsites and conferences downtown or in the suburbs, I can work from your floor plan and invoice your company directly.
>
> Prefer email? Just hit reply with any questions. A real person (me) reads every one.
>
> {{sender_name}}
> Beyond Chivary · Wedding and event chairs, St. Charles to Chicago

**CTA:** Book a 15-minute seating consult.

---

## Email 2: The chair math (Day 2)

**Subject line options:**
- A: `How many chairs do you actually need?`
- B: `The seating mistake we see at almost every {{event_type}}`
- C: `{{guest_count}} guests ≠ {{guest_count}} chairs`

**Preview text:** `Ceremony, reception, cocktail hour, vendors. Here's the real count.`

**Hero image:** a simple infographic: ceremony rows + reception tables + lounge + vendor meals = total chairs.

**Body:**

> Hi {{first_name}},
>
> The most common surprise we see is a chair count that's 15 to 30% short on the day. Here's the quick way to get it right:
>
> - **Reception:** one chair per guest, plus 3 to 5% for late RSVPs.
> - **Ceremony:** if it's in a different spot, you need a second set or a "flip" (staff move chairs between ceremony and dinner). A flip saves money but needs 45 to 60 minutes and a plan.
> - **Outdoor in Chicagoland?** Wind off the lake and spring rain mean soft lawns. Chairs with wide feet (cross-back, teak folding) sink less, and a tent or indoor backup should have its own chair count.
> - **Cocktail hour and lounge:** seating for about a third of guests keeps older relatives comfortable.
> - **Vendors:** photographer, DJ and planner meals add 3 to 8 seats.
> - **Head or sweetheart table:** this is where a statement chair earns its keep.
>
> On a consult I'll build this count with you from your actual timeline and venue, so there are no last-minute rentals.
>
> **[ Get my seating plan on a 15-min call → ]({{booking_link}})**
>
> *[Segment swap-in]*
>
> - **Wedding:** Want the full breakdown first? Read [How many chairs do I need for a wedding?](https://eventseatings.com/blog/how-many-chairs-do-i-need)
> - **Planner:** I can send a reusable chair-count worksheet you can drop into your client timelines. Just ask on the call.
> - **Corporate:** For conferences we'll plan by session type (theater, classroom, banquet) and change-over time between them.
>
> {{sender_name}}

**CTA:** Book a call to get a seating plan.

---

## Email 3: See the look (Day 5)

**Subject line options:**
- A: `3 chair looks for {{event_type}} in {{city}}`
- A2: `Fox Valley barn or West Loop loft? The chair that fits`
- B: `Barn, ballroom or backyard? The chair that fits`
- C: `Your style, in chairs (take the 60-second quiz)`

**Preview text:** `Pairings that photograph well, by venue and vibe.`

**Visuals:** a 3-image row from `public/chairs/render/`, each linking to its chair page. Pick by segment.

**Body:**

> Hi {{first_name}},
>
> Chairs are in nearly every photo from your event, usually from behind. Here are three pairings we love:
>
> - **Rustic and vineyard (Fox Valley barns, Illinois vineyards):** Cross-Back Vineyard Chair in walnut with farm tables and greenery. ([see it](https://eventseatings.com/chairs/cross-back))
> - **Modern and glam (Chicago lofts, rooftops, hotel ballrooms):** Ghost Chair with mirrored tables or bold florals. It disappears so the décor can shine. ([see it](https://eventseatings.com/chairs/ghost))
> - **Garden and boho (North Shore estates, backyard tents, conservatories):** Rattan Garden Chair for tents, greenhouses and lawns. ([see it](https://eventseatings.com/chairs/rattan-garden))
>
> *[Segment swap-in: replace the three pairings]*
>
> - **Wedding:** keep the three above and add "Royal Sweetheart Throne for the couple." For South Asian weddings, link [Mandap and sangeet seating](https://eventseatings.com/blog/south-asian-wedding-seating) instead of the garden pairing.
> - **Planner:** lead with mix-and-match ideas: one ceremony chair, another for reception, a statement chair for the head table.
> - **Corporate:** Mid-Century Shell Chair for breakouts, Bentwood Bistro for receptions, Louis Medallion for an awards stage.
>
> Not sure yet? The [60-second style quiz](https://eventseatings.com/quiz) matches you to chairs. Or bring your venue photos to a call and I'll suggest a few options live.
>
> **[ Book a 15-min style consult → ]({{booking_link}})**
>
> {{sender_name}}

**CTA:** Book a style consult (the quiz is the secondary link).

---

## Email 4: Pricing, logistics and founding-season perks (Day 9)

**Subject line options:**
- A: `What chair rental really costs (no surprises)`
- B: `Delivery, setup, pickup. We handle all of it`
- C: `Founding-season pricing for {{event_date}}`

**Preview text:** `Real per-chair ranges, what's included, and a perk for early clients.`

**Hero image:** a simple "what's included" graphic: delivery truck, setup, pickup, damage-checked chairs.

**Body:**

> Hi {{first_name}},
>
> The two questions everyone asks before a call: *what does it cost* and *what's the catch?*
>
> **Typical per-chair ranges**
> - Classic and folding styles: $5 to $12
> - Designer styles (ghost, rattan, wishbone, cane-back): $9 to $16
> - Statement styles (velvet, gold infinity): $14 to $25
> - Sweetheart thrones: $75 to $150 a pair
>
> **What's included:** delivery, setup and pickup anywhere from the Fox Valley to downtown Chicago, itemized in your quote by distance and venue access. Commercial-grade, weight-rated chairs only, and nothing is charged until you confirm.
>
> **The founding-season perk:** we're launching with our 2027 Founding Season. Clients who book early get founding pricing and first pick of inventory, because we stock based on what our first clients ask for.
>
> **[ Lock founding-season pricing on a 15-min call → ]({{booking_link}})**
>
> *[Segment swap-in]*
>
> - **Wedding:** More detail in [Wedding chair rental cost: what to budget](https://eventseatings.com/blog/wedding-chair-rental-cost).
> - **Planner:** Ask about planner pricing and a referral credit for every client you send.
> - **Corporate:** We can provide a W-9 and certificate of insurance, and invoice on net terms.
>
> {{sender_name}}

**CTA:** Book a call to lock founding-season pricing.

> **Before sending:** confirm planner pricing, referral credit, COI and net terms are things you actually offer. Delete any line you can't stand behind.

---

## Email 5: Last nudge, then handoff (Day 14)

**Subject line options:**
- A: `Should I hold {{event_date}} for you?`
- B: `Closing your file (unless you say otherwise)`
- C: `{{first_name}}, one quick question`

**Preview text:** `Popular dates go first. Here's how to keep yours.`

**Hero image:** none. This one should look like a personal note.

**Body:**

> Hi {{first_name}},
>
> I don't want to crowd your inbox, so this is the last email in this series.
>
> In Chicagoland, May through October Saturdays are the first dates to book up (and December for corporate parties), and in our founding season we're stocking a limited number of each chair. If {{event_date}} is still on your list, a 15-minute call is the easiest way to hold it.
>
> **[ Hold my date, book a call → ]({{booking_link}})**
>
> Not ready? No problem. Just reply with one word:
>
> - **"Later"** and I'll check back in a month.
> - **"Booked"** if you've already sorted seating (congrats!).
> - **"Question"** and I'll answer by email, no call needed.
>
> Either way, you'll keep getting our monthly seating ideas, and you can unsubscribe anytime.
>
> {{sender_name}}

**CTA:** Book a call to hold the date (reply keywords as the low-friction fallback).

**After Email 5:** tag as `nurture-complete` and move to the monthly newsletter (new blog posts, styled setups, availability updates). Re-enter anyone who clicks a booking link but doesn't book into a single "Saw you checking dates" email 24 hours later.

---

## Setup checklist

- [ ] Pick final brand name (Beyond Chivary vs. Event Seatings) and update `src/lib/site.ts` to match
- [ ] Create the booking page (Calendly / Cal.com) with a 15-minute "Seating consult" event and 3 intake questions: date, venue, guest count
- [ ] Choose an email tool and connect it to `/api/leads` (webhook or Zapier from Supabase `leads` table)
- [ ] Tag leads by `kind` (quote / quiz / waitlist) and `event_type`, and enroll all three kinds in this sequence
- [ ] Set up SPF, DKIM and DMARC for the sending domain before the first send
- [ ] Add a physical mailing address and unsubscribe link to the footer (CAN-SPAM)
- [ ] Add UTM tags to every link
- [ ] Map lead `city` values to the `{{local_line}}` table (most email tools can do this with a conditional block)
- [ ] Replace the `eventseatings.com` links if the domain changes

## What to measure

| Metric | Target to start |
|--------|-----------------|
| Open rate | 45%+ (welcome email 60%+) |
| Click rate | 5 to 8% |
| Consult booking rate (whole sequence) | 10 to 15% of leads |
| Reply rate | 3%+ (replies are a win, treat them like bookings) |

## Remaining to improve

- Write subject-line A/B winners back into this doc after the first 200 sends
- Add a separate short sequence for planners (partner program, referral terms)
- Add a post-event sequence: thank you, review request, referral ask, photo sharing
- Add an SMS touch for leads who share a phone number and an event date within 90 days
- Build branded HTML templates with the gold and ivory site styling
