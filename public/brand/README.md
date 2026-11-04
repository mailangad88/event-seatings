# Beyond Chiavari logo files

A Chiavari chair inside an arched doorway, with the name set in Cormorant Garamond and the line
"Event rentals · Chicago" in Inter. Colours: wine `#7a1f2e`, gold `#d9b26a`, wine-black `#2a1519`, cream `#f6efe4`.

| File | Use it for |
| --- | --- |
| `logo-horizontal-light.svg` / `.png` | Website header, invoices, emails on white or cream |
| `logo-horizontal-dark.svg` / `.png` | Dark backgrounds |
| `logo-stacked-light.svg` / `-dark` | Square-ish spaces: flyers, signs, social banners |
| `mark-light.svg` / `mark-dark.svg` / `mark-512.png` | The chair on its own: stickers, watermarks |
| `app-icon.svg` / `logo-512.png` | Social profile pictures (Instagram, Google Business Profile) |
| `favicon.svg`, `favicon-*.png` | Browser tab icon (simpler chair so it reads at 16px) |
| `wordmark-*.svg` | The name without the chair |
| `*-mono.svg` | One-colour printing (embroidery, stamps, engraving) |

Leave clear space around the logo at least as wide as the chair's seat, and don't stretch,
recolour or add effects. To rebuild: `python3 scripts/brand/build-logo.py && node scripts/brand/render-logo-png.mjs`.
