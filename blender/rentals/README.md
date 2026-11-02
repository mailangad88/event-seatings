# Rental catalog renders (Blender)

Every rental item on the site has a 3D render built in code with Blender's Python API, to real rental
dimensions. Nothing is a stock photo, so we own every image outright.

* **Product shots**: 1600 x 1600, item centred on a warm light seamless sweep (#EFE9DF), soft top-left key
  light and a contact shadow. Tents and outdoor games are shot on a lawn at golden hour or dusk.
* **Scenes and topic heroes**: 1920 x 1080 styled setups (ballroom reception, garden ceremony, cocktail hour,
  tent at twilight, farm-table dinner, corporate, floor plan from above, and line-ups per category).

## Files

| File | What it builds |
|---|---|
| `lib.py` | mesh helpers, materials, the studio sweep, the lawn, cameras, render settings |
| `catalog.py` | the registry: slug, category, builder, camera, **alt text and caption** (plus the original chairs) |
| `chairs.py`, `collection_chairs.py` | Chiavari, folding, crossback, ghost, throne, bar stool, chair cover/sash, and the 10 collection chairs |
| `tables.py` | round, banquet, highboy, farm, kids and sweetheart tables; tablecloths, runners, napkins |
| `tableware.py` | plates, charger, flatware, glassware, chafing dish, dispenser, urn, tray, cake stand, bar |
| `tents.py` | pop-up canopy, frame, pole, sailcloth and clear-top tents, sidewalls, bistro lights |
| `misc.py` | dance floors, stage, lighting, heaters, lounge, decor, photo booths, games |
| `scenes.py`, `heroes.py` | 16:9 event setups and category heroes |

Slugs match the catalog item ids, and categories match the image folders the site reads
(`chairs, tables, linens, tableware, catering, tents, floors, lighting, heating, lounge, decor, games, scenes`).

## Run it

Blender runs headless from PyPI (no desktop install needed):

```bash
python3.13 -m venv ~/bvenv && ~/bvenv/bin/pip install bpy==5.2.3 pillow
~/bvenv/bin/python blender/rentals/render.py --list
~/bvenv/bin/python blender/rentals/render.py gold-chiavari round-60 --scale 25 --samples 16   # quick preview
~/bvenv/bin/python blender/rentals/render.py --all --samples 40 --skip-existing               # final
~/bvenv/bin/python blender/rentals/publish.py                                                 # -> public/rentals + manifest
```

`publish.py` converts PNGs in `out/rentals/` to WebP in `public/rentals/<category>/<slug>.webp` and rewrites
`src/data/rental-images.json`, which `src/data/rental-images.ts` exposes as `rentalImage(slug)`,
`productImages` and `sceneImages`. Alt text and captions live in the registry, so edit them there and re-run
`publish.py`; never hand-edit the JSON.

A final 1600px product render takes 1-3 minutes on 2 CPU threads (40 samples + OpenImageDenoise).
Add `--save-blend` to keep a `.blend` next to each PNG for tweaking in the Blender app.

## Adding an item

1. Write a builder that adds geometry at the origin, front facing -Y.
2. Register it with `item(slug, category, builder, alt, caption, cam=dict(az, el, lens, pad))`.
3. Preview with `--scale 25`, render, publish, and add the item to `SITE_LOG.md`.

Alt text rule: start with "3D render of", say what it is, its size or capacity, its finish, and what event it
suits; mention Chicago where it reads naturally.
