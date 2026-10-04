# Prompt to paste into Bolt (after importing this repo)

Work on a new branch, not `main`.

This is the pre-launch website for **Event Seatings**, a luxury wedding and event chair rental company in St. Charles, IL. The look is a **luxury hotel lobby**: warm near-black, aged brass, ivory text, marble-cream contrast sections, brass corner-bracket frames, Cormorant Garamond headlines with a gold italic accent word, small widely spaced caps for labels. Keep that mood. Never use bright or playful colors, rounded pill shapes, emoji or casual slang.

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript. Read `AGENTS.md` and `node_modules/next/dist/docs/` before writing Next.js code, because this version has breaking changes. Do **not** downgrade Next.js, React or Tailwind.

**Where things are**
- Colors, buttons and typography: `src/app/globals.css` (design tokens, plus the `.paper` class for marble-cream sections)
- Pages: `src/app/`. Components: `src/components/`
- Business settings: `src/lib/site.ts`. Chair catalog: `src/data/chairs.ts`
- Blog posts: `content/blog/*.md`

**Do not touch** (these need tooling Bolt doesn't have, or hold secrets):
- `src/components/three/**`, `scripts/**`, `src/remotion/**`, `public/chairs/render/**` (the 3D chairs and rendered images)
- `src/app/api/**`, `src/lib/store.ts`, `src/lib/notify.ts`, `src/proxy.ts`, `supabase/**` (data, email and admin login)
- `package.json` dependency versions. Do not add or remove packages without asking me.
- Never ask me for, or write in, any API keys or passwords.

**The business rules:** the site is honestly pre-launch. Quote requests say we are preparing a 2027 founding season, and nothing is charged. Do not add fake availability, fake reviews, fake counts or fake testimonials.

**What I want help with:** (describe your goal here, for example "try 3 alternative layouts for the home page hero", "improve the wording on the About page", "make the quote form feel more premium").

Run the build (`npm run build`) after changes and tell me what you changed.
