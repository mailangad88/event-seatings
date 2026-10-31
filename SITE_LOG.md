# Site log

One row per page: when it was last touched, what it has, and what is still left to improve.
Update the row whenever you change a page.

| Page | Last touched | Visuals | FAQs | Schema | Lead capture | Remaining |
| --- | --- | --- | --- | --- | --- | --- |
| `/looks` The Look Book | 2026-10-31 | 8 styled scenes (chair renders in each look's light and palette), swipeable strip on mobile | 5 | CollectionPage + ItemList, FAQPage | Links into each look's form; book-a-call button | Swap scenes for Blender / Seedance clips; add real event photos once we have them |
| `/looks/[slug]` (8 looks) | 2026-10-31 | Scene (or video), palette swatches, chair cards | 4 per look, generated | BreadcrumbList, FAQPage | "Get this look" form (email, date, guests), sticky mobile button, then book-a-call | Per-look videos; downloadable PDF look board; Spanish versions for quinceañera and Royal looks |
| `/plan` Seating Planner | 2026-10-31 | Live chair-count graphic, chair picker with renders | 6 | WebApplication, FAQPage | "Email me this plan" form, then book-a-call | Add layout diagrams (rows vs. rounds); add delivery estimate by ZIP once pricing is set |

## Social traffic

- Every lead now stores first-touch `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, the landing page and the referrer. Without UTMs, Instagram, Facebook and YouTube are inferred from click ids or the referrer.
- Link-in-bio and Shorts descriptions: use `/looks?utm_source=instagram&utm_medium=bio` and, per reel, `/looks/<look>?utm_source=instagram&utm_medium=reel&utm_campaign=<look>`.
- Videos: put a 9:16 MP4 at `public/looks/<look>.mp4` (plus a `.jpg` poster) and set `video` / `poster` on the look in `src/data/looks.ts`.

## Before launch

- Run the new lines at the bottom of `supabase/schema.sql` on the live database, or look and planner leads will fail to save.
- Set `NEXT_PUBLIC_BOOKING_URL` to the scheduling link. Until then, "book a call" buttons go to the quote form.
- Brand is still "Event Seatings" in `src/lib/site.ts`; the requested name is beyondchivary.
