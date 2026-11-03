# Beyond Chiavari design system

The site is a premium, highly visual **event rental marketplace** for Chicago and the suburbs: light, gallery-like
pages (warm cream paper, ink type, deep wine actions, gold accents and clear status colours), white product cards, rounded imagery and dark espresso bands
for conversion moments. Everything is built from tokens and a small UI kit so that every thread's pages look like one
site.

**Rule of thumb:** build pages from `@/components/ui` and the utility classes below. Do not hard-code colours or
invent new card/button styles. If you need something new, add it to the kit.

## 1. Tokens (`src/app/globals.css`)

| Token | Light (default) | Use |
|---|---|---|
| `bg` | `#f6efe4` cream | page background |
| `surface` | `#ffffff` | cards, inputs |
| `surface-2` | `#ede3d2` sand | image wells, sand bands |
| `ink` | `#1f1916` | text |
| `muted` | `#5c5247` | secondary text (AA) |
| `line` | `#dccfbb` | borders, dividers |
| `wine` / `wine-deep` / `wine-soft` | `#7a1f2e` / `#5c1521` / `#f7e4e4` | **primary**: main buttons, eyebrows, links, selected states, prices |
| `accent` / `accent-deep` / `accent-soft` | wine on light pages, gold on dark bands | use these in shared components so they flip inside `tone-dark` |
| `gold` / `gold-soft` | `#835a12` / `#f6e8cc` | gold accents, ornaments, icon wells, tips |
| `espresso` | `#2a1519` | dark bands (deep wine-black) |
| `green` / `green-soft` | `#2d6a3e` / `#e2efe0` | money in, paid, booked, done (`sage` is an alias) |
| `amber` / `amber-soft` | `#9a4f0a` / `#fbeacd` | waiting, balance owed, needs a reply |
| `rose` / `rose-soft` | `#a3302b` / `#f9e1dd` | problems, overdue, form errors |
| `blue` / `blue-soft` | `#2b5878` / `#e1ebf3` | info, dates, events |

**Colour means the same thing everywhere** (public site and admin): wine = the main action, green = money in or done,
amber = waiting, rose = problem, blue = dates and info, gold = accent. Every text colour passes WCAG AA on `bg`,
`surface`, `surface-2` and its own `-soft` tint.

Use them as Tailwind colours: `bg-surface`, `text-muted`, `border-line`, `text-gold`, `bg-gold-soft`…

**Tone scopes** re-theme everything inside them, no extra classes needed:

- `tone-dark` (or any `bg-espresso…` class): dark wine-black band, light text, gold buttons.
- `tone-sand` (alias `.paper`): sand band.

Fonts: Cormorant Garamond (`font-serif`, display; 400 for the page H1, 500 for `display-2`/`display-3` so smaller
headings don't look faint) and Jost (`font-sans`, UI and body; 300/400/500/600 loaded, so `font-semibold` is real, not
faked), self-hosted in `src/app/fonts`.

## 2. Utility classes

| Class | What |
|---|---|
| `container-x` / `container-narrow` | page width (7xl) / reading width (3xl) |
| `section-y` | standard vertical section padding |
| `display-1` / `display-2` / `display-3` | serif headings: page H1 / section H2 / card H3 |
| `headline` | serif heading base (custom sizes) |
| `lede` | large muted intro paragraph |
| `eyebrow` | small brass uppercase label above headings |
| `cta-row` | wrapper for hero/section buttons: full-width stacked buttons on phones, inline from `sm` |
| `btn-primary` | wine pill (gold on dark bands), main action ("Build your quote") |
| `btn-accent` | gold pill, secondary highlight action |
| `btn-ghost` | outline pill, secondary action |
| `btn-light` | white pill on images |
| `btn-sm` / `btn-lg` | size modifiers |
| `link-line` / `link` | underlined text links |
| `card` + `card-hover` | white rounded card with soft shadow, lift on hover |
| `well` | sand rounded panel |
| `media` | rounded image frame with sand fill |
| `field` / `label` / `hint` | form inputs, labels, helper text |
| `chip` / `chip-active` / `badge` | filter chips, tags, small labels |
| `badge-wine` / `badge-green` / `badge-amber` / `badge-rose` / `badge-blue` | status pills, colour = meaning (see above) |
| `stat-card` + `stat-label` + `stat-value` | white card with a coloured 4px top border and a big coloured number (dashboards, admin) |
| `stat-wine` / `stat-green` / `stat-gold` / `stat-amber` / `stat-blue` / `stat-rose` | pick a stat card's colour (also used by `StatRow`) |
| `prose-post` | long-form article typography (markdown output) |

## 3. Components (`import { … } from "@/components/ui"`)

| Component | Use it for |
|---|---|
| `PageHero` | top of every inner page: breadcrumbs, eyebrow, H1, intro, actions and **media** (always pass a visual) |
| `Section` | standard section with eyebrow/title/intro/action; `tone="sand" \| "dark" \| "white"` |
| `Breadcrumbs` | trail + BreadcrumbList JSON-LD (Home is added for you) |
| `ProductCard` + `ProductGrid` | catalog items: 1:1 image, name, category, `price` (customer price, already marked up), unit, badges, `action` slot for "Add to quote" |
| `PriceTag` / `formatPrice` | any displayed price. Never pass vendor cost |
| `CategoryTile` | category entry points: photo tile (with `image`) or icon tile |
| `FaqList` | accordion FAQs + FAQPage JSON-LD (`schema={false}` if the page already emits FAQPage) |
| `StepFlow` | crawlable flowchart (ordered list) for processes, 3 to 5 steps |
| `Figure` | image + visible caption; `ratio="4/5"` to crop |
| `ArticleLayout` | guides, blog and SEO content pages: breadcrumbs, centred title, 16:9 hero, sticky TOC, sidebar |
| `QuoteCard` | sidebar CTA for content pages |
| `QuoteCta` | inset dark conversion card, near the end of a page |
| `Callout` | tips, notes and key takeaways inside content |
| `TrustBar` | four value props under a hero |
| `StatRow` | big numbers (real figures only) |
| `Icon` | 37 line icons (`chair`, `table`, `linen`, `plate`, `glass`, `flatware`, `tent`, `light`, `sofa`, `arch`, `floor`, `candle`, `chafer`, `heat`, `truck`, `quote`…) |
| `JsonLd` | any other schema.org block |

Older shared pieces still work and now match: `CallCta` (full-bleed dark band, wrap in `-mb-32` to sit on the
footer), `ProcessFlow`, `WaitlistForm`, `ChairArt`, `ChairCard`.

## 4. Page recipes

**Catalog category** (`/rentals/[category]`): `PageHero` (16:9 scene image from the render manifest) → chips for
filters → `ProductGrid` of `ProductCard` → `FaqList` → `QuoteCta`.

**Item page** (`/rentals/[category]/[item]`): `Breadcrumbs` → two columns: `media` 1:1 gallery | name (`display-2`),
`PriceTag size="lg"`, quantity + "Add to quote" (`btn-primary btn-lg`), spec list in a `well` → related
`ProductGrid` → `FaqList` → `QuoteCta`. Emit Product + Offer JSON-LD with the customer price.

**Content / SEO page**: `ArticleLayout` with `hero`, `toc` and `aside={<QuoteCard source="…" />}`; body in
`prose-post`, with at least one `Figure`, `StepFlow` or table, a `Callout`, and a `FaqList`. End with `QuoteCta`.

**Quote builder** (`/quote`): `field`/`label` inputs, `chip`/`chip-active` for selections, `ProductCard`-style
rows, a sticky `card` summary with `PriceTag` totals and a `btn-primary btn-lg` submit.

## 5. Imagery

- Product images: 1:1, warm light seamless backdrop (`#EFE9DF`), ~12% padding, under
  `public/rentals/<category>/<slug>.webp`, read through `src/data/rental-images.ts`.
- Scene images: 16:9 or 4:5 styled tablescapes. Current Blender scenes live in `src/lib/scenes.ts`
  (`scenes.blushGarden`, `scenes.midnightGold`, … and `sceneFor(slug)` for a stable fallback).
- Every image needs descriptive alt text that names what is in the frame and uses `site.name` where natural.
- The interactive 3D chair studio (`src/components/three`) uses the same light gallery look; re-render chair stills
  with `ALLOW_RENDER=1 npm run start` then `npm run render:chairs`.

## 6. UX checks (run before merging visual changes)

```bash
npm run build && npm run start          # in one shell
npm run audit:ux -- --out out/ux-audit  # screenshots at 390px + 1440px, axe-core, design lint
npx lighthouse http://localhost:3000/ --chrome-flags="--headless --no-sandbox"  # optional, CHROME_PATH=/opt/pw-browsers/...
```

Rules the audit enforces: zero serious axe violations (contrast, labels, focusable scroll regions), one H1, no
horizontal scroll at 390px, tap targets at least 24px (buttons are 44px via `btn`), body copy 16px+ on phones.
Sticky bottom bars on phones get `data-bottom-bar` so the chat button lifts above them.

## 7. Voice and honesty

Short, warm, specific. Lead with the answer. Prices are customer prices (vendor price + markup) and are labelled as
estimates until confirmed. No fake reviews, ratings or counts.
