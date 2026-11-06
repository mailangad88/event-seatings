# Wikidata entity prep — Beyond Chiavari

Drafted, **not submitted**. Per the Nov 6 indexing plan, Wikidata wants independent sources (a press mention, a directory listing with editorial review, etc.) before an entry will stick — submitting with zero outside sources right now risks the entry being flagged and removed, which would hurt more than help. Submit this once at least 2-3 of the directory listings (`growth/directory-listings/`) or a press mention (`growth/backlinks-and-brand-plan.md`) are live.

## Why this helps AI/Google recognition
A Wikidata item is a structured, machine-readable record ("Beyond Chiavari is an instance of: business; located in: Chicago; industry: event rental services"). It's one of the signals large language models and Google's Knowledge Graph use to answer "what is Beyond Chiavari" with a real answer instead of treating the name as just words on a page — the exact gap flagged in `growth/ai-indexing-steps-2026-11-06.md`.

## Draft item content (all facts taken from the live site, nothing invented)

| Property | Value |
|---|---|
| Label (en) | Beyond Chiavari |
| Description (en) | Event rental marketplace based in St. Charles, Illinois |
| instance of (P31) | business (Q4830453) |
| industry (P452) | event management / party and event rental services |
| headquarters location (P159) | St. Charles, Illinois |
| country (P17) | United States of America |
| official website (P856) | https://beyondchiavari.com |
| inception (P571) | 2026 |
| founder (P112) | Isha Kaur (per `src/lib/site.ts` — confirm legal name before submitting) |
| social media followers (P8687) / sameAs | link once Instagram/Pinterest profiles have meaningful followings — thin profiles can also get an entry flagged |

## What's needed before submitting (in order)
1. At least one of: a live directory listing with any editorial review (Yelp, Bing Places), or a press/blog mention — see `growth/directory-listings/` (drafted, not yet submitted) and `growth/backlinks-and-brand-plan.md` Part 3A-E.
2. A citation for "founder" — Wikidata wants a reference, not just the website (a press mention naming Isha Kaur works; the website alone is treated as a primary/self-published source and often gets rejected for biographical claims).
3. Once ready: create the item at wikidata.org/wiki/Special:NewItem, fill the table above, and add each source as a "reference" on its claim (not just a general note) — items without per-claim references get flagged for review fastest.

## Not doing without Angad's review first
Do not submit this without a human reading it — a Wikidata item is public and editable by anyone, and a submission that gets flagged/reverted for lacking sources is worse than not having one yet (it can make the brand look less credible if someone checks edit history).
