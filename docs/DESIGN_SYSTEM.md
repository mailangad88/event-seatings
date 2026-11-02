# Beyond Chiavari design system

The site is a premium, highly visual **event rental marketplace** for Chicago and the suburbs: light, gallery-like
pages (warm ivory paper, ink type, aged-brass accents), white product cards, rounded imagery and dark espresso bands
for conversion moments. Everything is built from tokens and a small UI kit so that every thread's pages look like one
site.

**Rule of thumb:** build pages from `@/components/ui` and the utility classes below. Do not hard-code colours or
invent new card/button styles. If you need something new, add it to the kit.

## 1. Tokens (`src/app/globals.css`)

| Token | Light (default) | Use |
|---|---|---|
| `bg` | `#faf7f2` ivory | page background |
| `surface` | `#ffffff` | cards, inputs |
| `surface-2` | `#f2ece3` sand | image wells, sand bands |
| `ink` | `#1d1a16` | text, primary buttons |
| `muted` | `#655d52` | secondary text (AA) |
| `line` | `#e4dbcd` | borders, dividers |
| `gold` | `#8a6628` | eyebrows, accents, links (AA on ivory) |
| `gold-soft` | `#f3eadb` | icon wells, badges, selected states |
| `espresso` | `#1b1814` | dark bands |
| `sage` / `rose` | `#55704f` / `#a4473b` | success / alert |

Use them as Tailwind colours: `bg-surface`, `text-muted`, `border-line`, `text-gold`, `bg-gold-soft`…

**Tone scopes** re-theme everything inside them, no extra classes needed:

- `tone-dark` (or any `bg-espresso…` class): dark band, ivory text, brighter brass.
- `tone-sand` (alias `.paper`): sand band.

Fonts: Cormorant Garamond (`font-serif`, display) and Jost (`font-sans`, UI and body), self-hosted.

## 2. Utility classes

| Class | What |
|---|---|
| `container-x` / `container-narrow` | page width (7xl) / reading width (3xl) |
| `section-y` | standard vertical section padding |
| `display-1` / `display-2` / `display-3` | serif headings: page H1 / section H2 / card H3 |
| `headline` | serif heading base (custom sizes) |
| `lede` | large muted intro paragraph |
| `eyebrow` | small brass uppercase label above headings |
| `btn-primary` | ink pill, main action ("Build your quote") |
| `btn-accent` | brass pill, main action on dark bands |
| `btn-ghost` | outline pill, secondary action |
| `btn-light` | white pill on images |
| `btn-sm` / `btn-lg` | size modifiers |
| `link-line` / `link` | underlined text links |
| `card` + `card-hover` | white rounded card with soft shadow, lift on hover |
| `well` | sand rounded panel |
| `media` | rounded image frame with sand fill |
| `field` / `label` / `hint` | form inputs, labels, helper text |
| `chip` / `chip-active` / `badge` | filter chips, tags, small labels |
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

## 6. Voice and honesty

Short, warm, specific. Lead with the answer. Prices are customer prices (vendor price + markup) and are labelled as
estimates until confirmed. No fake reviews, ratings or counts.
