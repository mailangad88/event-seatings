# Search intent map (2026-11-03)

What people in the Chicago area type when they need event rentals, which page answers each pattern, and what was missing. Keyword rows with estimated volume bands live in `chicago-keywords.csv` (bands are estimates until real Keyword Planner and Search Console numbers replace them).

## Patterns and landing pages

| Search pattern | Example | Intent | Landing page | Status |
|---|---|---|---|---|
| `[chair style] rental chicago` | cross back chair rental chicago | Transactional | `/chairs/[slug]`, `/rentals/chairs/[item]` | Live before this audit |
| `chair rental [area]` | chair rental naperville | Transactional, local | `/chair-rentals/[area]` (35 areas) | Live before this audit |
| `[event] chair rentals chicago` | quinceanera chair rental chicago | Transactional | `/events/[type]` (15 types), blog posts | Live before this audit |
| `[item] rental chicago` | 60 inch round table rental chicago | Transactional | `/rentals/[category]/[item]` (about 2,500 items) | Live before this audit |
| **`[category] rental [area]`** | tent rental naperville, bounce house rental aurora, linen rental evanston | Transactional, local | **`/party-rentals/[area]/[category]`**: 35 areas x 10 categories = 350 pages | **New** |
| **`party rentals [area]`, `event rentals [area]`** | party rentals oak park, event rentals dupage county | Transactional, local | **`/party-rentals/[area]`** (35) + hub `/party-rentals` | **New** |
| **`how much does [category] rental cost`** | how much does it cost to rent a tent, bounce house rental cost | Informational, high intent | **`/rental-cost/[category]`** (19) + hub `/rental-cost` | **New** |
| `how many chairs / tables for [n] guests` | how many tables for 100 guests | Informational | `/seating-layouts/*`, `/table-seating-guides/*`, `/room-size-guides/*` | Live |
| `[chair] vs [chair]` | cross back vs chiavari | Commercial | `/chair-comparisons/*` | Live |
| `[chair] for [event]` | ghost chairs for a gala | Commercial | `/chair-fit/*` | Live |
| `[month] event chicago weather` | october outdoor wedding chicago | Informational | `/chicago-event-seasons/*` | Live |
| `[problem] party rentals` | last minute party rentals chicago, rental order minimums | Problem | `/solutions/*` (PR #31) | In PR #31 |
| `rent vs buy`, `party store vs rental company` | rent vs buy chairs | Comparison | `/compare/*` (PR #31) | In PR #31 |

## Why these gaps first

1. **Category + suburb** is how most people search once they know what they need ("tent rental naperville"), and before this audit only chairs had local pages. The catalog already carries prices for tents, tables, linens, dance floors, inflatables, photo booths, lighting, heaters, dinnerware and concessions, so each page can show real local prices instead of filler.
2. **Party rentals + town** is the broad local query. The area hubs list every category with "from" prices and link to the 10 category pages for that town.
3. **Cost questions** are the most common answer-engine queries. Each cost page opens with a 40 to 60 word answer computed from the live catalog (low, median, middle half and high), then example delivered orders with delivery, setup, damage waiver and tax.

## What makes these pages non-thin

Every number is computed from the catalog at build time. Each area x category page combines:

- a direct answer with that category's real price range and item count;
- six featured items and a price chart, rotated per area;
- a guest-count sizing table for the category (rules of thumb, labelled as such);
- the area's own venue settings, each with a category-specific tip (for example, "tents at riverfront parks" vs "tents on rooftops");
- two of the area's own delivery notes, rotated per category so sibling pages differ;
- five FAQs, three of them local (cost in the area, delivery to the area, a local question such as tent permits);
- an area map, a scene image and links to nearby areas and other categories.

The audit (`npm run seo-audit`) checks every one of them for near-duplicate content (simhash), word count, answer length, FAQ schema, alt text and internal links on every build.

## Next candidates

- `[event] rentals chicago` (wedding rentals chicago, graduation party rentals chicago): extend `/events/[type]` with the full rental list for that event rather than a new set of pages, to avoid two pages competing for one query.
- More areas: the 35 locations come from `src/data/geo/*.ts`. Adding a location there adds its chair page, its area hub and its 10 category pages.
- Spanish-language versions for quinceañera and Latino family events, once Angad confirms we can serve in Spanish.
