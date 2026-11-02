# Rental catalog renders (Blender)

Every rental item on the site has a 3D render built in code with Blender's Python API, to real rental
dimensions. Nothing is a stock photo, so we own every image outright.

* **Product shots (photoreal, default)**: 1400 x 1400. Furniture stands in a room corner (photo-scanned
  herringbone oak floor, cream plaster wall), tableware sits on a natural flax linen tablecloth, and tents and lawn
  games stand on a real park lawn whose trees and sky are the HDRI photograph itself. Every set is lit by a
  real HDRI, every material gets roughness variation, hard edges get a 1.5 mm bevel, the camera has depth of
  field, and `publish.py` adds a camera finish (grain, vignette, lens fringing). See `photoreal.py`,
  `photo_finish.py` and `assets.py`. `--classic` gives the old flat-sweep look.
* **Scenes and topic heroes**: 1920 x 1080 styled setups (ballroom reception, garden ceremony, cocktail hour,
  tent at twilight, farm-table dinner, corporate, floor plan from above, and line-ups per category).

## Files

| File | What it builds |
|---|---|
| `assets.py` | downloads the CC0 HDRIs and scanned textures (Poly Haven / ambientCG, via GitHub mirrors) into `out/assets/` |
| `photoreal.py` | room, tabletop and park sets, HDRI worlds, the realism pass (bevels, roughness variation), depth of field |
| `photo_finish.py` | post-render camera finish: film grain (port of MIT-licensed filmgrainer), vignette, chromatic aberration, bloom |
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
python3.13 -m venv ~/bvenv && ~/bvenv/bin/pip install bpy==5.2.3 pillow numpy
python3 blender/rentals/assets.py                                                         # real HDRIs + textures
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

Alt text rule (registry): start with "3D render of", say what it is, its size or capacity, its finish, and what
event it suits; mention Chicago where it reads naturally. `publish.py` rewrites it for photoreal images: drops
the prefix, adds the setting ("on a natural flax linen tablecloth") and ends with "(photorealistic visualization)" so
the alt stays honest. Filenames are the catalog slug (`/rentals/chairs/gold-chiavari.webp`).
