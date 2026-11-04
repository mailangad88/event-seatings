# Pre-launch audit: what gets the most bookings

**Date:** 2026-11-04 · **Asked by:** Angad Singh · **How:** built `main` locally (same code as the live site), walked the visitor path on an iPhone-size screen and a laptop (home, rentals, item page, quote planner, quote builder, pricing, book a call, about), and read the quote, planner, lead and admin code.

## The short version

The site is big and mostly in good shape: every page loads, the quote planner is clear, prices show everywhere, and leads have a safety net. What holds back bookings now is not more pages. It is four things:

1. **Leads are still not saved or sent to you on the live site** (no database, email, phone or booking link). Everything else is wasted until this is fixed. Another thread owns it.
2. **There is no shopping list that follows the visitor.** "Add to quote" on an item page opens the quote builder with only that one item. If someone adds chairs, goes back and adds tables, the chairs are gone. Every add starts over.
3. **The home page sells "everything for any event"**, but the offer that people said yes to is the flat-fee coordinator for big celebrations (150+ guests, several rental companies). That offer only appears on /pricing and inside two event pages.
4. **Nobody can see who they will be dealing with.** A brand-new company with no reviews needs a real person's name and a reason to trust them. Your name is on /pricing and /press, but not on the home page, the call page or the thank-you screens.

## Ranked list

Impact = how much it should move booked events. Effort is rough build time. ✅ = built in this thread today. 👤 = needs you. 🔧 = another thread has it.

| # | What | Why it matters | Impact | Effort | Status |
|---|---|---|---|---|---|
| 1 | Save every lead and alert you (Blob/Supabase, Resend, NOTIFY_EMAIL) | Today a filled form goes to a log file. One lost family = one lost booking | Very high | 30 min of your time | 👤🔧 "Connect lead saving and emails" thread |
| 2 | Point beyondchiavari.com at the site | Google, ads and every shared link point at a parking page | Very high | 20 min + wait | 👤🔧 same thread |
| 3 | Phone number and booking link (NEXT_PUBLIC_PHONE, NEXT_PUBLIC_BOOKING_URL, optional NEXT_PUBLIC_WHATSAPP) | Big-celebration families want to talk. Without a number the "Call" button falls back to a form, and WhatsApp is how many South Asian families plan | High | 10 min | 👤 |
| 4 | **A quote list that follows the visitor** (add from any item page, keep browsing, count in the header, list kept on this device until sent) | Bigger lists and fewer lost lists. This is how every rental and shopping site works, and its absence quietly loses multi-item orders | High | 2-3 h | ✅ PR below |
| 5 | **Big celebrations page and home section** (`/big-celebrations`): 150 to 400 guests, several rental companies, one flat fee after every company confirms, backup up to $500, a short "tell us about your celebration" form that saves a lead | Puts the one offer that tested well in front of the right families, with its own page for ads, community boards and venue referrals | High | 2 h | ✅ PR below |
| 6 | **"Who you'll talk to" block with your name** on the home page, /book, /pricing, /about and the thank-you screens | The biggest objection in every panel was "brand new, no reviews". A named owner who takes every call is the one honest trust signal we have today | High | 1 h | ✅ PR below (add a real photo when you have one: `public/brand/angad.jpg`) |
| 7 | **"Email me this list"** on the quote builder: save the list with just an email, before the full form | Catches people who are not ready to give a date and address yet. The list link brings them back | Medium-high | 1-2 h | ✅ PR below |
| 8 | Google Business Profile (Chicago, service-area business) and your first 3 Google reviews from friends' past events or vendor partners | Local map results drive most "chair rental near me" calls. Plan is in growth/fast-leads/google-business-profile.md | High | 1 h of your time | 👤 |
| 9 | Two rental companies agreeing in writing, then named on the site with permission | "Which companies?" is the next trust question after "who are you" | High | your calls | 👤 (pricing/vendor terms thread has the agreement) |
| 10 | GA4 + Search Console (NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_GSC_VERIFICATION) | Without it nobody can tell which pages bring quotes, so we can't double down | Medium | 15 min | 👤 |
| 11 | Speed-to-lead: answer every new lead within 15 minutes in business hours | Leads called within minutes book far more often than leads called next day. The call script thread built the script; turn on phone alerts in the email app for lead emails | High | habit | 👤 |
| 12 | Quick-add buttons on category pages (add without opening the item) | Fewer taps for people building a big list | Medium | 1 h | next, after #4 is live |
| 13 | Venue and planner partner page with a referral link (banquet halls without furniture, mandap/decor companies, DJs) | Cheapest source of big-celebration families; success plan week 1-3 | Medium | 2 h | next (/refer exists for customers; needs a partner version) |
| 14 | Trim item page titles and descriptions (3,000+ titles over 60 characters) | Google cuts off the price | Low-medium | 1 h | later |
| 15 | Admin "waiting on you" timer on new leads (minutes since it came in, red after 1 hour) | Helps #11 | Medium | 1 h | later (admin threads) |

## What we checked and found fine

- Mobile: sticky "Get a free quote / Call" bar, item pages keep price and "Add to quote" in reach, no sideways scroll on the pages walked.
- Quote planner: 8 short steps, saves progress on the device, the free plan (checklist, floor plan, budget PDF) is a good reason to give an email.
- Prices: vendor's own price and the flat fee are explained the same way on home, pricing, about and FAQ.
- Leads: every form uses the shared sender with retries, spam check and an outbox, so nothing is lost in the browser.

## Not touched here (other threads own them)

Call script and follow-up links, lead saving / domains / env setup, Gemini product photos, pricing and vendor terms, and the parked vendor app.
