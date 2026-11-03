# Journal writing guide

How every post in `content/blog/` is written. The bar: each post fully answers one real question a Chicago-area event planner, couple or office manager types into Google or asks an AI assistant, and it is visual, not a wall of words.

Model post: [`content/blog/tablecloth-size-chart.md`](../content/blog/tablecloth-size-chart.md). Copy its structure.

Voice: plain words, no jargon and nothing that sounds AI-written. Follow [`docs/plain-writing-rules.md`](plain-writing-rules.md) and run `node scripts/check-copy.mjs`.

Check your work: `node scripts/check-posts.mjs content/blog/<slug>.md` (no arguments checks every post). A post must pass before it ships.

## How posts render

Posts are Markdown, but `src/components/PostBody.tsx` maps the special blocks onto the UI kit (`docs/DESIGN_SYSTEM.md`): the answer box becomes a `Callout`, `ol.flow` a vertical `StepFlow`, `div.stat-grid` a `StatRow`, a `<figure>` with an inline SVG a `Figure`, and the FAQ section a `FaqList` (which emits FAQPage schema). The page itself is an `ArticleLayout` with a scene render hero, a table of contents built from `##` headings, a `QuoteCard` aside and a `QuoteCta` at the end. Keep the block shapes below exactly so the mapping works.

## The business (what we can and can't say)

- **Beyond Chiavari** (beyondchiavari.com) rents event chairs and helps clients plan the full rental list (tables, linens, dinnerware, glassware, tents, lighting and more) for events in **Chicago and the suburbs**. Base: St. Charles, IL. Primary market: Chicago.
- Pre-launch. First deliveries begin with the **2027 Founding Season (April 2027)**. Don't claim past events, clients, reviews, years in business, awards, venue partnerships, or a warehouse of non-chair items.
- Prices: the only prices we publish are the chair estimates in `src/data/chairs.ts` (e.g. cross-back $8–11, ghost $10–14, garden folding $5–7, velvet $18–25, Louis $20–30, throne $75–150/pair). Never invent prices, percentages or statistics for anything else. For other items say what drives the cost and point to a quote.
- Facts about Chicago and suburbs (permits, park districts, ordinances, weather, sunset times, venue types, events like the Chicago Marathon) must come from a source you checked. If you can't verify something, say "check with your village / park district / venue" rather than guessing. No invented venue names or rules. Naming well-known public places (Millennium Park, the Riverwalk, Naperville Riverwalk, Morton Arboretum) is fine; don't claim they allow or require specific rentals unless you verified it.
- Measurements and industry conventions (table sizes, tablecloth sizes, seats per table, square feet per guest, tent sizing rules of thumb) are fine when they're the widely published standard. Phrase rules of thumb as rules of thumb.

## File and header

File: `content/blog/<slug>.md`, slug = lowercase words with dashes, built from the target phrase (e.g. `how-many-tables-for-100-guests`).

```
---
title: "Title With the Target Phrase, 70 Characters or Fewer"
description: One or two sentences, 120-160 characters, that promise the answer.
date: 2026-11-02
tags: <Topic>, <Secondary tag>, <Another tag>
keyword: the main search phrase
image: /blog/art/<topic-slug>.svg      (or)   chair: <chair-slug>
imageAlt: One sentence describing the hero image (only with image:)
---
```

- The **first tag must be the topic** exactly as written: Chairs, Tables, Linens & Napkins, Dinnerware, Glassware & Bar, Tents, Lighting & Power, Dance Floors & Decor, Catering Equipment, Lounge & Specialty, Weddings, Cultural Celebrations, Parties, Corporate & Nonprofit, Chicago Planning, Suburb Guides, Budget & Booking, Layouts & Floor Plans, Seasons & Venues.
- Hero: use `chair: <slug>` when a chair is the subject (slugs: cross-back, ghost, rattan-garden, bentwood, wishbone, velvet-dining, infinity, cane-back, windsor, louis-medallion, shell, garden-folding, royal-throne). Otherwise `image: /blog/art/<topic-slug>.svg` with an `imageAlt:`. Topic slugs: chairs, tables, linens-and-napkins, dinnerware, glassware-and-bar, tents, lighting-and-power, dance-floors-and-decor, catering-equipment, lounge-and-specialty, weddings, cultural-celebrations, parties, corporate-and-nonprofit, chicago-planning, suburb-guides, budget-and-booking, layouts-and-floor-plans, seasons-and-venues.
- Date: `2026-11-02` (posts dated in the future stay hidden).

## Body structure

1. **Quick answer box first** (this is what Google and AI assistants quote). Exactly this shape, blank lines included:

   ```
   <div class="answer-box">

   **Quick answer**

   Two to four sentences that fully answer the question, with the key numbers.

   </div>
   ```

2. A short intro paragraph that names the real problem and mentions Chicago or the suburb naturally.
3. `##` sections that go deep: how to decide, numbers, examples, mistakes to avoid, Chicago-specific notes (weather, buildings, parking, permits, seasons). 1,000 to 1,600 words of real substance. No filler, no repeating the question, no "In conclusion".
4. **Visuals (at least 3 blocks, at least one inline SVG figure).** Mix these:
   - **Inline SVG diagram** in a `<figure>` with a `<figcaption>`: floor plans, top-down table layouts, size comparisons, place-setting diagrams, timelines, bar charts of counts, tent footprints, decision trees. Rules:
     - `<svg role="img" aria-labelledby="<id>-t <id>-d" viewBox="0 0 W H" xmlns="http://www.w3.org/2000/svg">` with `<title id="<id>-t">` and `<desc id="<id>-d">` (a full sentence describing what it shows; this is the alt text Google and AI read). Use ids unique within the post.
     - Colors only from page variables so it works on dark and light pages: `fill="var(--surface)"` for the background rect, `var(--gold)` for highlights, `var(--line)` for lines/grid, `var(--muted)` for secondary, `currentColor` for text. Use `opacity` for tints. No hard-coded white/black.
     - Text in the SVG: with a viewBox about 720 wide, use `font-size` 22-28 for labels (minimum 20). The diagram is shown about 380px wide on phones, so smaller text becomes unreadable. Fewer, larger labels beat many tiny ones.
     - **No blank lines anywhere inside `<figure>`…`</figure>`** (Markdown breaks raw HTML at blank lines). Keep it compact: 15-60 elements. Draw something specific to the post, never a generic decoration.
   - **Markdown table** (wrap in `<div class="table-wrap">` + blank line + table + blank line + `</div>` if it has 4+ columns): size charts, comparisons, checklists with counts.
   - **Flowchart**: `<ol class="flow"><li><strong>Step</strong> detail</li>…</ol>` on one block with no blank lines.
   - **Key figures**: `<div class="stat-grid"><div><strong>120 in</strong><span>Label</span></div>…</div>` (3 or 6 items).
   - **Chair pair**: `<div class="chair-pair"><img src="/chairs/render/<slug>.jpg" alt="…descriptive…" loading="lazy" />…</div>` (two images) when comparing chairs.
5. **Internal links**: at least two, written naturally into sentences. Allowed targets: `/chairs`, `/chairs/<chair-slug>`, `/quote`, `/book`, `/quiz`, `/faq`, `/blog`, `/blog/topic/<topic-slug>`, and `/blog/<slug>` for posts that exist in `content/blog/` (the checker rejects links to posts that don't exist yet; link to posts in your own batch once they're written). Related guides are also added automatically under every post.
6. `## Frequently asked questions` with **5 to 8** `### Question?` entries, each answered in one self-contained paragraph of 2-4 sentences that starts with the direct answer. These become FAQPage schema. Use the questions people actually ask ("People also ask" style), not restatements of headings.
7. A closing `##` section with a call to action: [Book a free 15-minute seating call](/book) and/or [request a quote](/quote). We help plan the whole rental list in one call.

## Voice

Plain, warm, specific, confident. Short sentences. Second person. American spelling. No em dashes. No hype words (stunning, elevate, unforgettable, seamless, dive in). Numbers as digits. Write like an experienced Chicago planner explaining it to a friend.
