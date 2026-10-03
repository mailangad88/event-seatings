# Event Seatings

Pre-launch website for Event Seatings, a wedding and event chair rental company in St. Charles, IL.
It tests which chairs people want before any inventory is bought.

## What it does
- **Chair catalog** (`/chairs`) with style and use filters, plus anonymous ♡ "Want this" votes
- **Quote requests** (`/quote`) collecting date, event type, guest count, city and chairs. Copy is upfront that this is a pre-launch founding season
- **Style quiz** (`/quiz`) that matches couples to chairs and captures emails
- **Journal** (`/blog`) of Markdown posts that publish themselves on their date
- **Admin dashboard** (`/admin`) ranking chairs by demand, with event months, event types, cities, all leads and CSV export

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000, admin is open at /admin in dev
```
Votes and leads are saved to `.data/db.json` until Supabase is configured.

## Common edits
| To change… | Edit |
|---|---|
| Business name, email, service area, launch season | `src/lib/site.ts` |
| Add, remove or edit chairs | `src/data/chairs.ts` |
| Chair photos | Put files in `public/chairs/` and set `image: "/chairs/name.jpg"` on the chair |
| Blog posts | Add `content/blog/<slug>.md` (see `docs/content-calendar.md`) |
| FAQ | `src/app/faq/page.tsx` |

## Go live (Vercel + Supabase)
1. Push this repo to GitHub and import it at vercel.com.
2. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
3. In Vercel, set the env vars from `.env.example` (`ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`).
4. Point the `eventseatings.com` domain at Vercel.
5. Submit `https://eventseatings.com/sitemap.xml` in Google Search Console.
