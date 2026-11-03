# Plain writing rules

Every word on the site, in emails and in downloads should sound like a local Chicago rental business talking to a customer: short, plain and specific. No marketing jargon, and nothing that reads like it was written by AI. This applies to page copy, headings, buttons, FAQs, blog posts, guide data in `src/data/`, image alt text, emails and PDF kits.

Check your work before you open a PR:

```
node scripts/check-copy.mjs
```

It scans `src/` and `content/` for the banned phrases below and fails if it finds any. CI runs it on every pull request.

## The rules

1. **Say what happens, in plain words.** "We check your date with local rental companies" beats "We coordinate with our vetted vendor network."
2. **Headings describe the section.** "How booking works", "Planning guides", "Browse by category". Not slogans like "Plan smarter" or "Every rental, one place".
3. **No slogan tricks.** Avoid "X, not Y" taglines ("Plan in minutes, not phone calls"), three-beat fragments ("One list. One quote. Every rental handled."), "No X. No Y. Just Z.", and cute labels that need a second read ("Real humans").
4. **No hype adjectives.** Describe the thing instead: "padded velvet seat" instead of "a touch of luxury".
5. **No industry or marketing jargon** a host wouldn't use: leads, pre-qualified, acquisition cost, long-tail, answer engines, AEO/GEO, SKU, end-to-end, turnkey, solution, ecosystem.
6. **No made-up quotes or stories.** Don't put a quote in quotation marks unless a real person said it.
7. **Talk to people, not about them.** "You" and "we". Short sentences. One idea per sentence.
8. **Don't promise what isn't true** (see the business facts in `docs/journal-writing-guide.md`).

## Banned words and phrases

`scripts/check-copy.mjs` holds the list. Swap them like this:

| Don't write | Write instead |
| --- | --- |
| real humans, real people | talk to us, a person on our team |
| vetted vendors | established local rental companies |
| seamless, effortless, hassle-free, stress-free, worry-free | easy, simple, or say what we do for them |
| elevate, elevated | dress up, make it look finished |
| curated | picked, chosen |
| unforgettable, stunning, breathtaking, magical, wow factor | say what it looks like |
| vibrant, bustling | busy, colorful, large |
| tight-knit | close-knit |
| nestled, in the heart of | is in, sits on, is near |
| one-stop shop, turnkey, end-to-end, white-glove | one quote for everything, we handle delivery and setup |
| peace of mind, rest easy, sit back and relax | say what's covered |
| unlock (as in "unlock your event") | get, see |
| journey | the plan, the day, the order things happen in |
| look no further, say goodbye to, we've got you covered | (cut it) |
| delve, dive in, deep dive, tapestry, testament, game-changer | (cut it) |
| leads, pre-qualified, acquisition cost, long-tail, answer engines | customers, orders, people searching |

When something really needs one of these words (a vendor named "Curated Rentals", "unlock" in code), it is fine in code and comments. Add a narrow exception to the allow list in the script only for visible copy you can't reword.
