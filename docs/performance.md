# Keeping the site fast

Last checked: Nov 4, 2026 (Lighthouse, phone settings, production build).

| Page | Score before | Score after | Page weight before | After |
| --- | --- | --- | --- | --- |
| Home | 77 | 97 | 881 KB | 586 KB |
| Guides (/blog) | 74 | 92 | 4.3 MB | 473 KB |
| Area page (/party-rentals/naperville) | 94 | 95 | 7.5 MB | 606 KB |
| Quote form (/quote) | 79 | 89 | 691 KB | 550 KB |
| Rentals (/rentals) | 94 | 95 | 1.0 MB | 1.0 MB |
| Chairs (/rentals/chairs) | 89 | 92 | 529 KB | 471 KB |

## Rules that keep it that way

- Import links from `@/components/Link`, never `next/link` (lint enforces it). Our link loads the next page when
  someone points at it, taps it or tabs to it, not when it scrolls into view. Viewport loading pulled in up to
  5 MB of pages per visit on area pages.
- Use `next/image` for every local photo, with a `sizes` that matches how wide it shows. Plain `<img>` sends the
  full 200-300 KB file even for an 80 px thumbnail.
- Browser code (`"use client"`) must not reach a data file over 100 KB (tests/client-boundary.test.ts). The image
  list is 2.5 MB. Chair photos for browser code live in `src/data/chair-images.ts`.
- In browser code import kit pieces from their own files (`./ui/Icon`), not the `./ui` barrel, which also holds
  server cards that load the image list.

## Data as it grows

- Admin pages read leads once per request (`listLeads` and `listPartners` use React `cache()`), so the sidebar
  counts and the page share one read.
- Supabase reads come 1,000 rows at a time with the rest fetched four pages at once.
- With only the Blob store, each server keeps the lead files it already read and only downloads new or changed
  ones, so /admin doesn't re-download every lead each time.
- Look up one lead by its own key (email, token, id), never by loading every lead and filtering.
- Re-run `supabase/schema.sql` after this change: it adds indexes for email search, confirmation links and the
  newest-first lists.

## Load balancing

Vercel already does this. Every page is served from its worldwide cache when it can, and each request that needs
the server gets its own copy of the function, so 10 visitors or 10,000 are spread out automatically. There is no
single server to overload. What can slow down as data grows is the database and how much we read from it, which
the points above cover.
