# Site Log

One row per page: when it was last touched, what it has, and what's left to improve.
Update the row whenever you change a page. Several workstreams add to this file, so add your
rows to the right section rather than rewriting others.

Checks: **SEO** = title, description, canonical, internal links · **AEO/GEO** = answer-first copy and
structured data that Google and AI assistants can quote · **Visual** = at least one image or graphic ·
**FAQ** = FAQ section with FAQPage schema · **Lead** = a path to email capture or a call.

## Answer content and lead magnet

| Page | Last touched | SEO | AEO/GEO | Visual | FAQ | Lead | Remaining to improve |
|---|---|---|---|---|---|---|---|
| `/answers` Chicago chair rental answers hub | 2026-10-31 | ✅ | ✅ FAQPage (23 Q&As), Breadcrumb | ✅ 6 infographics + chair render | ✅ | ✅ planner + quote | Add a header nav link; add answers from real customer calls; add real photos; link neighborhood landing pages once live |
| `/seating-planner` free seating planner (lead magnet) | 2026-10-31 | ✅ | ✅ WebApplication + HowTo | ✅ chair renders, live chair icons, infographic | — | ✅ email unlocks full checklist, then "book a call" | Set `NEXT_PUBLIC_BOOKING_URL` to a real scheduling link; send the checklist by email (nurture sequence); add a PDF download; track conversions |
| `/blog/chiavari-vs-folding-chairs-cost-chicago` | 2026-10-31 | ✅ | ✅ quick answer, BlogPosting, FAQPage | ✅ hero, chair pair, cost chart | ✅ 3 | ✅ | Add real competitor price ranges once researched; real photos |
| `/blog/outdoor-event-chairs-chicago-weather` | 2026-10-31 | ✅ | ✅ | ✅ hero, seasons chart | ✅ 3 | ✅ | Link Chicago Park District permit page; real outdoor setup photos |
| `/blog/chicago-venue-rules-chair-rentals` | 2026-10-31 | ✅ | ✅ | ✅ hero, venue checklist graphic | ✅ 3 | ✅ | Add venue-specific notes once we've delivered to them (no guesses) |
| `/blog/when-to-book-event-chair-rentals-chicago` | 2026-10-31 | ✅ | ✅ | ✅ hero, booking timeline | ✅ 3 | ✅ | Add our own deposit/hold policy once final |
| `/blog/restaurant-buyout-chair-rental-chicago` | 2026-11-02 | ✅ | ✅ quick answer, BlogPosting, FAQPage | ✅ bentwood hero, chair pair, chair-swap timeline infographic, count table | ✅ 4 | ✅ seating call + planner | Add real restaurant partners once we've delivered to them (no guesses); link a rehearsal-dinner landing page; real swap photos |
| `/blog/quinceanera-chair-rental-chicago` | 2026-11-01 | ✅ | ✅ quick answer, BlogPosting, FAQPage | ✅ throne hero, chair pair, seating-plan infographic, count table | ✅ 4 | ✅ seating call + planner | Link the quinceañera event landing page once PR #5 lands; real stage photos after the first 2027 booking; Spanish-language version |
| `/blog/last-minute-chair-rental-chicago` | 2026-10-31 | ✅ | ✅ | ✅ hero, chair pair | ✅ 3 | ✅ | Update the "our availability" note after the April 2027 launch |
| `/blog/chair-rental-delivery-chicago-suburbs` | 2026-10-31 | ✅ | ✅ | ✅ hero, service-area graphic, table | ✅ 3 | ✅ | Publish delivery fee bands once final; link each suburb landing page |
| `/blog` journal index | 2026-10-31 | ✅ | — | ✅ post thumbnails | — | — | Add tag filters; feature the planner |
| `/blog/[slug]` all posts | 2026-10-31 | ✅ canonical, OG image | ✅ BlogPosting + Breadcrumb, auto FAQPage from "## Frequently asked questions" | ✅ hero image for all 17 posts | auto | ✅ planner + answers + quote CTA | Older posts still need FAQ sections and quick-answer boxes |
| `/faq` | 2026-10-31 | ✅ | ✅ FAQPage | ❌ text only | ✅ | partial | Add a visual; links to `/answers` and planner added |

## How to add to the answer content

- **New answer on the hub:** add it to a topic in `src/data/answers.ts`, lead with the direct answer, and bump `answersUpdated`.
- **New post:** add `content/blog/<slug>.md` with `image:` and `imageAlt:` in the header, a `<div class="answer-box">` quick answer at the top, and a `## Frequently asked questions` section with `### Question?` headings (turned into FAQPage schema automatically).
- **Infographics:** edit and rerun `python3 scripts/answer-graphics.py public/answers`.
- **Facts:** no invented statistics. Prices come only from our own estimates in `src/data/chairs.ts`.
