# Live chat and instant contact

Every page has a **"Questions? Chat"** button (bottom right). It opens one panel with every fast way to reach us:

| Channel | Shows when | Where the lead lands |
| --- | --- | --- |
| **Live chat + chatbot** (HubSpot) | `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` is set | HubSpot inbox; HubSpot creates the contact itself |
| **Quick message form** (fallback when HubSpot chat is off) | always, until HubSpot is set | `/api/leads` as kind `chat` → Supabase, owner email, and HubSpot once the CRM sync (PR #7) is merged |
| **Text us** | `NEXT_PUBLIC_SMS_PHONE` or `NEXT_PUBLIC_PHONE` | your business texting app (pre-filled opener) |
| **WhatsApp** | `NEXT_PUBLIC_WHATSAPP` | WhatsApp Business app (pre-filled opener) |
| **Call** | `NEXT_PUBLIC_PHONE` | your phone; missed calls get an auto text (see below) |
| **Book a free seating call** | `NEXT_PUBLIC_BOOKING_URL` (otherwise "Request a free quote") | Calendly / Cal.com / HubSpot Meetings |

Extras:

- Any link with `?chat=1` opens the panel on arrival. Use it in emails, Instagram bio and ads: `https://beyondchiavari.com/?chat=1`.
- Any button can open it from code: `import { openChat } from "@/lib/contact"; openChat("Is my date still open?")`.
- If GA4 is installed (PR #4), the dock sends `contact_open`, `contact_click` (method: sms, whatsapp, call, booking) and `generate_lead` (method: chat).
- HubSpot's script only loads when someone opens the chat, so it never slows page loads or hurts SEO.
- Hidden on `/admin` and `/render`.

## Recommended stack and cost

| What | Tool | Cost |
| --- | --- | --- |
| Live chat, chatbot, shared inbox, mobile app alerts | HubSpot free (same account as the CRM) | $0 (HubSpot logo on the widget; removing it needs Starter, about $20/mo) |
| Business number with texting and missed-call auto-text | Quo (formerly OpenPhone), which logs calls and texts into HubSpot | about $15–25/mo per user |
| WhatsApp | WhatsApp Business app on the same number | $0 |
| All-in-one alternative | GoHighLevel (chat, SMS, missed-call text-back, CRM) | about $97/mo |
| Later: AI assistant that answers chair, pricing and date questions 24/7 | Built into the site with the Claude API | a few cents per conversation |

Prices change; check each vendor's pricing page before buying. Business texting in the US needs a one-time A2P 10DLC registration through your phone provider (small fee, can take a few days to approve), so start it early.

## Setup steps (needs your accounts)

1. **HubSpot live chat** (10 minutes)
   1. In HubSpot: Settings → Inbox & Help Desk → Inboxes → Connect a channel → Chat.
   2. Brand it: accent color `#c9a96a`, your photo and name ("Angad from Beyond Chiavari").
   3. Chatflow: turn on a welcome message ("Planning an event? Ask me anything about chairs, dates or pricing."), require email before chatting when you're away, set office hours, and add an away message that promises a reply time you can keep.
   4. Install the HubSpot mobile app and turn on chat notifications so you can answer within 5 minutes.
   5. Copy your account ID (the number in your HubSpot URL, also under Settings → Account). In Vercel → Project → Settings → Environment Variables add `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`, then redeploy.
2. **Phone and texting**
   1. Get a business number (Quo/OpenPhone or GoHighLevel). Start A2P 10DLC registration the same day.
   2. Turn on the missed-call auto reply with the text below, and connect the HubSpot integration.
   3. Add `NEXT_PUBLIC_PHONE=+1XXXXXXXXXX` (and `NEXT_PUBLIC_SMS_PHONE` if texts go to a different number) in Vercel, then redeploy.
3. **WhatsApp**: install WhatsApp Business on that number, add a greeting and away message, then set `NEXT_PUBLIC_WHATSAPP=1XXXXXXXXXX` (digits only).
4. **Booking link**: set `NEXT_PUBLIC_BOOKING_URL` (HubSpot Meetings recommended, so bookings land in the CRM).
5. **Supabase** (only if the leads table already exists): run the two `alter table` lines at the bottom of `supabase/schema.sql` so chat messages can be saved.

## Speed-to-lead: 5 minutes

- Chat and form leads alert you instantly (HubSpot app push, plus the owner email if `RESEND_API_KEY` is set).
- Reply first with one question that moves toward a call: "Congrats! What's the date and roughly how many guests? I can check availability on a quick 15-minute call."
- Outside office hours, the chatbot or auto-text sets the expectation and offers the booking link.

### Missed-call auto text

> Hi, this is Angad from Beyond Chiavari. Sorry I missed your call! I'm with a client and will call you back shortly. To save time, text me your event date, guest count and venue, or grab a free 15-minute seating call here: {booking link}

### Chat away message

> Thanks for reaching out! We're away right now but read every message. Leave your email or mobile and your event date, and we'll reply first thing. Want a time that works for you? Book a free 15-minute seating call: {booking link}
