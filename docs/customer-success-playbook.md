# Customer Success Playbook

**Goal:** every person who gives us a phone number or email feels looked after within minutes, books with confidence, has a flawless event day, and comes back or sends a friend.
**Last touched:** 2026-10-31
**Status:** v1, ready to run by hand on day one and to automate in the CRM.

> **Brand note:** the site code says "Event Seatings" (`src/lib/site.ts`); the marketing drafts use "Beyond Chivary". Scripts below use `{{brand}}`. Swap in the winner everywhere at once.

> **Pre-launch note:** our first delivery season starts **April 1, 2027** (`site.launch.firstEventDate`). Until then, the "booking" stage means a **date hold** with a founding-season deposit, and leads with dates before April 2027 get the honest "not delivering yet" path in section 3.4.

**How this fits with the other work**

| Piece | Owns | Lives in |
|---|---|---|
| This playbook | The human journey: SLAs, every touchpoint, scripts, recovery, metrics | `docs/customer-success-playbook.md` |
| Lead nurture email sequence | The 5 marketing emails for leads who haven't booked a call | `marketing/email-nurture-sequence.md` (PR #1) |
| CRM setup | Pipeline stages, automation wiring, booking tool | CRM thread / its PR |

This playbook defines **what** happens and **when**. Section 9 lists the stages and triggers for the CRM to automate. The nurture emails are referenced, not repeated.

---

## 1. Service promises (what we tell customers and hold ourselves to)

1. **You'll hear from a human within 5 minutes during business hours.** After hours you get an instant text and email, and a call by 9 a.m. next day.
2. **A written quote within 2 business hours of the consult** (same day if the consult ends before 3 p.m.).
3. **Your chairs arrive in the delivery window we confirm, set up exactly to your floor plan,** or we credit you (section 7).
4. **One named person owns your event** from first call to pickup. Their cell is in every message.
5. **No surprise fees.** Delivery, setup, stairs and late-night pickup are on the quote or they're free.

Publish promises 1, 3 and 5 on `/quote` and the FAQ. They are the reason people choose us over a warehouse rental company.

## 2. Response-time SLAs

| Event | Target | Hard limit | Owner |
|---|---|---|---|
| New web lead (quote, quiz, waitlist) | Auto text + email instantly; human call in **5 min** (8 a.m. to 8 p.m. CT) | 1 hour; after hours by 9 a.m. | Lead owner |
| Inbound call | Answer live | Missed call gets a text back in **2 min**, callback in 15 min | Whoever is on phones |
| Inbound text or DM (IG, FB, Google) | **15 min** in hours | 2 hours | Lead owner |
| Inbound email | **1 hour** in hours | Same business day | Lead owner |
| Quote after consult | **2 business hours** | End of next business day | Lead owner |
| Change request from a booked client | Acknowledge **1 hour**, confirm **same day** | 24 hours | Event owner |
| Event-day issue | Call back in **5 min**, solution plan in **15 min** | n/a | On-call lead |
| Complaint or bad review | Personal call **same day** | 24 hours | Founder |

**Why 5 minutes:** leads contacted within 5 minutes are many times more likely to convert than those contacted after 30. For a wedding couple comparing three vendors, the first one who calls usually wins.

**Business hours:** Mon to Sat, 8 a.m. to 8 p.m. CT. Sunday 10 a.m. to 4 p.m. for texts only during peak season (May to Oct).

---

## 3. Stage 1: First contact and speed to lead

### 3.1 Instant auto-replies (within 60 seconds, every channel)

**SMS (sent the moment a form with a phone number comes in):**
> Hi {{first_name}}, it's {{owner_name}} from {{brand}} 🪑 Got your request for {{event_date}}. I'll call you in the next few minutes from this number. Rather text? Just reply here. Want to pick a time instead? {{booking_link}}

**SMS after hours:**
> Hi {{first_name}}, {{owner_name}} from {{brand}}. Got your request for {{event_date}}! We're closed for the night, so I'll call you by 9 a.m. If it's easier, grab a 15-min slot that suits you: {{booking_link}}

**Email:** Email 1 (Welcome) of the nurture sequence handles this. Make sure it sends instantly and includes the owner's name and cell.

**Missed inbound call text-back (within 2 min):**
> Hi, this is {{brand}}, sorry we missed you! Are you planning an event? Reply with the date and roughly how many guests and I'll get you a quote. Or call back anytime at {{phone}}.

**Voicemail greeting:**
> You've reached {{brand}}, chair rentals across Chicagoland. Leave your name, event date and guest count and we'll call back within 15 minutes during business hours. Faster still: text this number.

### 3.2 The first call (target: 5 minutes after the lead)

Call attempt cadence if they don't pick up:

| Attempt | When | Channel | What |
|---|---|---|---|
| 1 | 0 to 5 min | Call + voicemail | Short voicemail (below) |
| 2 | +1 min | SMS | "Just tried you, here's my booking link" |
| 3 | +3 hours | Call | No voicemail |
| 4 | Next day, opposite time of day | Call + SMS | Different value hook (free floor-plan sketch) |
| 5 | Day 3 | Email (personal, not the nurture email) | "Should I hold {{event_date}} for you?" |
| 6 | Day 6 | Call + SMS | Last personal try, then nurture sequence carries on |

**Voicemail script (under 20 seconds):**
> Hi {{first_name}}, {{owner_name}} from {{brand}}, calling about chairs for your {{event_type}} on {{event_date}}. I've got a couple of ideas for {{venue_or_city}}. Call or text me back at {{phone}}. I'll also text you my booking link.

**Discovery call script (10 to 15 min).** Goal: understand the event, solve one problem on the spot, and leave with a quote and a date hold.

1. **Open (30 sec):** "Thanks for reaching out! Congratulations on the {{event_type}}. I've got about 10 minutes to make sure we get your seating exactly right. Sound good?"
2. **Event basics:** date, venue (indoor/outdoor, stairs, freight elevator, load-in rules), guest count, ceremony and reception or just one, timeline (when the venue opens for setup, when you must be out).
3. **The look:** "How do you want the room to feel?" Share 2 chair pairings from the catalog by text while on the call. Mention the quiz results if they took it.
4. **Pain probe (pick what fits):**
   - "Have you rented chairs before? What went wrong?" (Common answers: late delivery, dirty or wobbly chairs, they had to set up themselves, surprise fees.)
   - "Who is setting the chairs up? Is your planner handling vendors or are you?"
   - "Any worries about weather, grass, or flipping the room between ceremony and reception?"
5. **Solve one thing now:** e.g. "For 140 guests outdoors on grass I'd do the teak folding chair for the ceremony and cross-back for dinner, and we flip the room for you during cocktail hour."
6. **Budget and decision:** "Do you have a seating budget in mind?" and "Who else weighs in on this?"
7. **Close:** "I'll send your quote within two hours with photos of each chair. Want me to put a free 7-day hold on {{event_date}} so nobody else takes those chairs?"
8. **Confirm channel:** "Is text the best way to reach you?"

Log in the CRM right after: venue, setup access, decision makers, budget, chairs discussed, pain points, preferred channel.

### 3.3 Lead types and how the path changes

| Lead type | Difference |
|---|---|
| **Couple (wedding)** | Evenings and weekends work better for calls. Expect a partner or parent to weigh in; offer a short video call to show chairs. |
| **Planner / designer** | They want speed, a reliable vendor and trade terms. Offer a planner account (section 8.3), a PDF line sheet, and COI on request. Keep calls to 5 minutes. |
| **Corporate** | Needs invoice, W-9, COI, net terms and loading-dock details. Ask for the venue's event manager contact. |
| **Venue** | Partnership path: preferred-vendor listing, referral fee, and a standing stock of chairs nearby. |
| **Quiz or waitlist only (no date)** | No call. Nurture sequence plus one personal text if a phone was given: "Saw you took the chair quiz, you got {{chair_name}}! Planning something?" |

### 3.4 Dates before our first delivery season

> Hi {{first_name}}, thank you for thinking of us! Honest answer: our first delivery season starts April 2027, so we can't cover {{event_date}}. I'd hate to leave you stuck, so here's what I'd look for in a rental company: [3 tips]. And if you have anything coming up from April on, founding-season clients get {{founding_perk}}. Can I keep you posted?

Tag as `future-season` and add to the waitlist. These people refer friends.

---

## 4. Stage 2: Quote and follow-up

### 4.1 The quote

Sent as a link or PDF within 2 business hours. It must include:

- A photo of each chair in their colors (pull the renders from `public/chairs/render/`)
- A simple layout sketch for their guest count (ceremony rows, reception tables)
- Line items: chairs, delivery, setup and breakdown, any stairs or late pickup, all with no hidden fees
- Good / Better / Best options (e.g. folding only; cross-back reception; full ceremony plus reception flip)
- Hold expiry date and deposit amount
- The named event owner and their cell
- 2 short reviews or a photo from a similar venue (once we have them)

**Quote delivery text:**
> {{first_name}}, your quote is ready! I put together 3 options for {{guest_count}} guests at {{venue}}, with photos: {{quote_link}}. Your date's held free until {{hold_expiry}}. Any questions, text me here.

### 4.2 Quote follow-up cadence (stops when they book, decline or reply)

| When | Channel | Message hook |
|---|---|---|
| Day 0 | SMS + email | Quote delivered (above) |
| Day 1 | SMS | "Did the quote come through OK? Happy to walk through it in 5 min." |
| Day 3 | Call | Answer objections (4.3). Offer to tweak an option. |
| Day 5 | Email | Visual: "Here's how {{chair_name}} looks at a {{venue_type}}" with 1 photo |
| Day 6 | SMS | "Your hold on {{event_date}} ends tomorrow. Want me to extend it or lock it in?" |
| Day 7 | Call | Last call before hold expires. Offer a 7-day extension once. |
| Day 14 | SMS | Breakup: "I'll release the hold so I'm not bugging you. If anything changes, I'm here." |
| Day 30, 60 | Email | Gentle check-in with new content or seasonal angle. Then monthly newsletter. |

A breakup text gets the most replies of any follow-up. Always send it.

### 4.3 Objection handling

| They say | We say |
|---|---|
| "It's more than the venue's chairs / a big rental company." | "Totally fair. Our price includes delivery, setup to your floor plan and pickup, so you or your planner aren't setting 150 chairs at 7 a.m. Want me to show the side-by-side?" |
| "We need to talk to our planner / partner." | "Of course. Want me to send a 1-page summary they can read in 30 seconds, or jump on a quick 3-way call?" |
| "We're still deciding on a style." | "Let me send 2 mockups with your colors. Your date stays held while you decide." |
| "We're not sure on guest count yet." | "Book on your best guess. You can change the count up to 14 days before at no charge." |
| "You're new, why trust you?" | "Fair question. You get a named person, a written delivery window with a credit if we miss it, and founding-season pricing. Here's our full policy." |
| "We found someone cheaper." | "I appreciate you telling me. Can I ask what's included? If it's apples to apples, I'll see what I can do, and if not, I'll tell you honestly what to check for." |

### 4.4 Booking (closing the deal)

1. Contract and deposit link (e-sign + card/ACH). Deposit: 25% to hold the date, rest due 14 days before.
2. **Within 5 minutes of payment:** personal thank-you text from the owner (not just an automated receipt).
   > {{first_name}}, you're officially booked! 🎉 {{event_date}} is yours. I'll check in about 30 days out to lock the final count and layout. Anything before then, text me anytime.
3. **Within 24 hours:** welcome email with: a booking summary, what happens next (timeline from section 5), how to change counts, and the planner/venue info we need.
4. Add to the client calendar. Stop all nurture and quote automations.

---

## 5. Stage 3: Pre-event (booked to event day)

| When | Touchpoint | Channel | Content |
|---|---|---|---|
| Booking + 1 day | Welcome pack | Email | Summary, timeline, change policy, care tips |
| Monthly (if booked 3+ months out) | Light check-in | Email | Inspiration: chair styling ideas, a real setup photo. No asks. |
| 30 days out | Planning call | Call (10 min) | Confirm count, layout, ceremony/reception flip, venue access, contacts |
| 21 days out | Venue coordination | Email to venue | Load-in time, dock or entrance, elevator, parking, venue rules, COI if needed |
| 14 days out | Final details lock | Email + SMS | Final count, floor plan sign-off, balance due link |
| 14 days out | Balance due | Email (auto) | Invoice. Reminder at 10 and 7 days if unpaid. |
| 7 days out | Delivery confirmation | SMS + email | Delivery window, crew lead name, day-of contact, weather plan |
| 2 days out | Weather check | SMS (if outdoors) | "Rain forecast Saturday. Here's our plan: [...]" |
| 1 day out | Final confirmation | SMS | "We're all set for tomorrow. {{crew_lead}} arrives between {{window}}. Their number: {{crew_phone}}." |

**30-day planning call checklist:** final guest count; ceremony rows and aisle width; reception table count and chairs per table; cushions or sashes; flip between ceremony and reception (who, when); venue contact; load-in and load-out times; stairs or long carry; on-site contact (planner, coordinator, parent); pickup time (same night or next morning).

**7-day confirmation text:**
> Hi {{first_name}}! One week to go 🎉 Here's your delivery plan: {{delivery_date}}, between {{window}}, at {{venue_address}}. Your crew lead is {{crew_lead}}. Final setup: {{count}} {{chair_name}} in {{layout}}. Reply YES if it all looks right, or tell me what to change.

---

## 6. Stage 4: Event day (delivery, setup, pickup)

### 6.1 Crew standards

- Arrive in the window, in branded clothes. Text the client contact when **leaving the warehouse** and **10 minutes out**.
- Introduce themselves to the on-site contact before unloading.
- Every chair wiped and inspected on site. Any wobble, scuff or stain goes back on the truck; we bring **5% spares** (minimum 4).
- Set to the signed floor plan with measured aisles. Photograph the finished setup from 3 angles.
- Walkthrough with the on-site contact: "Anything you'd like moved?" Get a thumbs-up by text or signature.
- Leave the space cleaner than we found it.

### 6.2 Day-of messages

| When | Message |
|---|---|
| Leaving warehouse | "{{crew_lead}} and team are on the way, ETA {{eta}}." |
| 10 min out | "About 10 minutes away! We'll check in with {{onsite_contact}} on arrival." |
| Setup done | "All set! Here's a photo of the room 📸 [photo]. Enjoy every minute. We'll be back at {{pickup_time}}." |
| Pickup done | "Chairs are packed up and we're out. Thank you for letting us be part of your day!" |

The setup-complete photo is the most valuable message we send. Couples forward it to family, planners post it, and it becomes our marketing.

### 6.3 Pickup

- Confirm pickup time the day before. Late-night pickups (after 10 p.m.) are on the quote, never a surprise.
- Count and inspect on site. Damage is noted with photos and discussed **after** the event, never the same night.

---

## 7. Issue recovery

**Principle:** fix first, talk about whose fault it was later. Every recovery ends with the client better off than if nothing had gone wrong.

| Issue | Immediate action | Make-good |
|---|---|---|
| Crew running late | Call (not text) the on-site contact the moment we know, with a new ETA | Late past the window: 15% credit. Past ceremony start risk: 50% credit |
| Wrong count or wrong chair | Spares from the truck first; dispatch a runner within 15 min | Missing chairs free, plus a credit |
| Damaged or dirty chair on site | Swap from spares immediately | n/a if caught on site; refund those chairs if the client finds it |
| Weather (rain, wind) | Help move chairs to the backup space; cover stacked chairs | No charge for the extra move |
| Venue access problem | Crew lead calls venue manager and owner; never argue with venue staff | Absorb any long-carry cost |
| Client is unhappy afterward | Founder calls within 24 hours. Listen, apologize specifically, ask "What would make this right?" | Refund, credit for next event, or a handwritten note plus gift. Decide on the call. |
| Bad online review | Reply publicly within 24 hours (calm, specific, take it offline). Then call. | Same as above. Ask, never pressure, if they'd update the review. |

**Apology script:**
> {{first_name}}, I'm really sorry. {{specific thing}} shouldn't have happened, and on your day of all days. Here's what I've already done: {{action}}. And I'd like to {{make-good}}. Is there anything else that would make this right?

Log every issue in the CRM with cause and fix. Review all issues in the weekly ops review (section 10).

---

## 8. Stage 5: After the event (review, referral, repeat)

### 8.1 Post-event touchpoints

| When | Channel | Content |
|---|---|---|
| Next morning | SMS | Thank you + the setup photos as an album link |
| Day 2 | SMS | NPS question (below) |
| Day 2 (if 9 or 10) | SMS | Google review ask with a direct link |
| Day 2 (if 7 or 8) | SMS | "What would have made it a 10?" Owner reads every answer |
| Day 2 (if 0 to 6) | Call from founder same day | Recovery (section 7) |
| Day 7 | Email | Review reminder if not left; ask for their photographer's name so we can request photos and credit them |
| Day 10 | Email | Referral offer (8.2) |
| Day 30 | Email | Gift: a styled photo print or digital album of their setup |
| Event anniversary | Email or card | "Happy anniversary!" (weddings) or "Planning next year's?" (corporate, galas) |
| Every 3 months | Newsletter | New chairs, real events, seasonal ideas |

**NPS text:**
> Hi {{first_name}}! Hope you're still glowing from {{event_type}} ✨ Quick one: from 0 to 10, how likely are you to recommend {{brand}} to a friend? Just reply with a number.

**Review ask (9 or 10):**
> That means the world to us, thank you! Would you share a sentence or two on Google? It's the #1 way couples near you find us: {{google_review_link}}. Bonus points for a photo 📸

Ask for reviews on Google first (local search ranking), then The Knot, WeddingWire and Yelp for wedding clients. Rotate the second platform so each builds up.

### 8.2 Referral program

- **Give $50, get $50:** the friend gets $50 off their first booking, the client gets a $50 gift card when the friend's event is complete.
- Each client gets a personal link (`?ref={{code}}`) to share. Track in the CRM.
- Ask at the moments of peak happiness: the setup photo text, the NPS 9/10 reply, and the day-30 gift.
- Thank every referrer personally by text the day their friend books.

### 8.3 Planners and venues (the repeat engine)

One planner can send 15 to 30 events a year. Treat them as accounts, not leads.

- **Planner perks:** trade pricing (10%), priority holds on peak Saturdays, a dedicated text line, a COI on file with their venues, setup photos for their portfolio with credit.
- **Quarterly check-in:** coffee or a call. Bring a new chair sample.
- **Venue partners:** ask to be on the preferred vendor list, offer a commission or a free chair upgrade for their own events, keep a stock of chairs staged nearby on peak weekends.
- **Corporate repeat:** remind 10 months after an annual event: "Planning this year's gala? Want the same setup held?"

---

## 9. CRM pipeline and automation map

For the CRM thread to wire up. Names are tool-agnostic.

**Pipeline stages**

| Stage | Enters when | Exits when |
|---|---|---|
| New lead | Form submit, call, text, DM | First human contact logged |
| Contacted | Human conversation happened | Consult booked or quote sent |
| Consult booked | Booking link used | Consult held |
| Quote sent | Quote link sent | Deposit paid, declined, or hold expired |
| Date held | Free hold placed | Deposit paid or expired |
| Booked | Deposit paid | Event day |
| Pre-event | 30 days out | Delivery |
| Delivered | Setup photo sent | Pickup done |
| Completed | Pickup done | NPS answered |
| Advocate | NPS 9/10 or review left | (stays) |
| Lost / Future season | Declined, ghosted after breakup, or date before launch | Re-engages |

**Automations**

| Trigger | Action |
|---|---|
| New lead with phone | Instant SMS (3.1) + task "Call in 5 min" assigned to owner + alert to owner's phone |
| New lead, email only | Nurture Email 1 instantly + task "Personal email in 1 hour" |
| Lead not contacted in 15 min | Escalation alert to backup person |
| Missed call | Text-back in 2 min |
| Event date before `firstEventDate` | Tag `future-season`, send 3.4 message as a draft for owner to send |
| Consult booked | Stop nurture sequence, send confirmation + reminder 24 h and 1 h before |
| Quote sent | Start quote follow-up cadence (4.2) |
| Any reply or booking | Stop all automated sequences for that contact |
| Deposit paid | Booking thank-you text, welcome email, schedule pre-event touchpoints (section 5) from event date |
| Balance unpaid at 10 days | Reminder email + SMS; at 7 days, owner task to call |
| Event completed | Schedule post-event touchpoints (8.1) |
| NPS 0 to 6 | Urgent task to founder, same day |
| NPS 9 to 10 | Review ask SMS + referral link |
| Referral code used | Tag referrer, task to thank them |

**Fields to add to the lead record** (beyond what `supabase/schema.sql` already has): `owner`, `stage`, `preferred_channel`, `first_response_at`, `consult_at`, `quote_sent_at`, `quote_amount`, `deposit_paid_at`, `setup_access_notes`, `onsite_contact`, `nps_score`, `review_left`, `referral_code`, `referred_by`, `utm_source`, `utm_campaign`, `lost_reason`.

---

## 10. Metrics and weekly ops review

| Metric | Target |
|---|---|
| Median time to first human contact | under 5 min (in hours) |
| Leads contacted within 1 hour | 95% |
| Lead to consult | 40% |
| Consult to booking | 50% |
| Quote to booking | 35% |
| On-time delivery (in window) | 98% |
| Issues per 100 events | under 3 |
| NPS | 70+ |
| Review rate (completed events) | 50% |
| Referral or repeat share of bookings | 30% by year 2 |

**Weekly ops review (30 min, Monday):** last week's response times, every lost lead with its reason, every issue and its fix, upcoming 14 days of events with any open details, reviews received, and one thing to improve this week. Add any change to this playbook and update **Last touched**.

---

## 11. Tool stack (lean starting point)

| Need | Suggested | Notes |
|---|---|---|
| Business phone + SMS | OpenPhone or Quo | Shared number, auto-reply, missed-call text-back, call recording |
| Booking consults | Cal.com or Calendly | Embed on `/quote` thank-you page |
| CRM + automation | Decided in the CRM thread | Needs SMS + email sequences, pipeline, tasks |
| Quotes, contracts, deposits | HoneyBook, or Stripe invoices + e-sign | HoneyBook is common with wedding vendors |
| Reviews | Google Business Profile direct review link | Short link in every ask |
| Day-of photos | Shared phone album per event | Crew uploads, owner forwards |

**SMS compliance:** add a consent checkbox to forms that collect a phone ("Text me about my quote"), include "Reply STOP to opt out" in the first automated text, and register the number for A2P 10DLC before sending automated SMS.

---

## Remaining to improve

- [ ] Pick the brand name and replace `{{brand}}` everywhere
- [ ] Add SMS consent checkbox to `QuoteForm` and `WaitlistForm`
- [ ] Publish service promises 1, 3 and 5 on `/quote` and `/faq`
- [ ] Decide deposit %, change policy and make-good credits with real numbers
- [ ] Build the quote template (Good / Better / Best with renders)
- [ ] Write the welcome pack email and the 7-day / 1-day confirmation templates in the CRM
- [ ] Crew setup checklist as a printable one-pager
- [ ] Set up Google Business Profile and get the review short link
