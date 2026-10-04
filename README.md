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

## Animations and social videos (Remotion)
Animated chair illustrations live in `src/remotion/` and are used in two ways:
- **On the site:** the home page hero plays `ChairShowcase` live (`src/components/HeroPlayer.tsx`). Visitors who prefer reduced motion see a still image.
- **As videos:** render MP4s for Instagram, TikTok and Pinterest.

```bash
npm run remotion:studio    # preview and edit animations in the browser
npm run remotion:render    # writes out/chair-showcase.mp4 (4:5) and out/launch-story.mp4 (9:16)
```
Chairs, names and colors come from `src/data/chairs.ts` and `src/lib/site.ts`, so renaming the brand or adding a chair updates the videos too. Fonts are bundled in `public/fonts`, so renders work offline. Keep all `remotion` and `@remotion/*` packages pinned to the same exact version.

**Licensing:** Remotion is free for individuals and small teams, but companies with more than three people need a paid license. Check remotion.pro/license before you scale.

## 3D chairs
Every chair is a real-time 3D model (`src/components/three/`): wood grain, woven cane, velvet, brushed gold and acrylic materials, soft studio lighting and contact shadows. They show up three ways:
- **Chair pages and the home hero:** live and interactive. Visitors drag to rotate and tap a finish swatch to recolor the chair. A still image shows instantly while the 3D loads, and is the fallback when WebGL isn't available.
- **Grids and cards:** pre-rendered stills in `public/chairs/render/`, so pages with many chairs stay fast.

When you add or change a chair in `src/data/chairs.ts`, regenerate its still:
```bash
npm run build
ALLOW_RENDER=1 npm run start          # terminal 1
npm run render:chairs                 # terminal 2 (or: npm run render:chairs -- <slug>)
npm run build                         # include the new images
```
Set `CHROME_PATH` if Chromium isn't found. Real photography always wins: set `image: "/chairs/your-photo.jpg"` on a chair and the 3D still is replaced everywhere (the live 3D viewer still appears on that chair's page; remove it there if you prefer photos only).
