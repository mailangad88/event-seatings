"""Convert rendered PNGs to web-ready WebP and write the image manifest the site reads.

    python blender/rentals/publish.py

Reads  out/rentals/<category>/<slug>.png (+ <slug>.json, the set the render used)
Writes public/rentals/<category>/<slug>.webp and src/data/rental-images.json

Each photoreal render gets the camera finish from photo_finish.py (grain, vignette, lens fringing) on the
way to WebP, and alt text that describes the item and the setting it was shot in.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402,F401  (must load before bmesh, which the registry imports)
from PIL import Image  # noqa: E402

from catalog import ITEMS  # noqa: E402
from photo_finish import finish  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "out", "rentals")
DST = os.path.join(ROOT, "public", "rentals")
MANIFEST = os.path.join(ROOT, "src", "data", "rental-images.json")


SETTINGS = {
    "room": "standing on a herringbone oak floor against a cream plaster wall",
    "table": "on a natural flax linen tablecloth",
    "park": "on a park lawn with trees on a sunny day",
    "park-dusk": "on a park lawn at sunset",
}


def photo_alt(alt, setting):
    """Registry alt text ("3D render of a gold Chiavari chair ...") rewritten for the photoreal image:
    what the item is, where it's pictured, and an honest note that it is a visualization."""
    text = alt
    for prefix in ("3D render of an ", "3D render of a ", "3D render of the ", "3D render of "):
        if text.startswith(prefix):
            text = text[len(prefix):]
            break
    text = text[0].upper() + text[1:]
    where = SETTINGS.get(setting)
    if where:
        text = f"{text}, {where}"
    return f"{text} (photorealistic visualization)"


def main():
    manifest = {}
    if os.path.exists(MANIFEST):
        manifest = json.load(open(MANIFEST))
    for slug, it in ITEMS.items():
        png = os.path.join(SRC, it["cat"], slug + ".png")
        out = os.path.join(DST, it["cat"], slug + ".webp")
        side = png.replace(".png", ".json")
        setting = json.load(open(side))["setting"] if os.path.exists(side) else manifest.get(slug, {}).get("setting", "classic")
        if os.path.exists(png) and os.path.getmtime(png) > (os.path.getmtime(out) if os.path.exists(out) else 0):
            os.makedirs(os.path.dirname(out), exist_ok=True)
            im = Image.open(png).convert("RGB")
            if setting != "classic":
                im = finish(im, seed=sum(map(ord, slug)))
            im.save(out, "WEBP", quality=84, method=6)
        if not os.path.exists(out):
            continue
        w, h = Image.open(out).size
        manifest[slug] = {
            "src": f"/rentals/{it['cat']}/{slug}.webp",
            "category": it["cat"],
            "alt": photo_alt(it["alt"], setting) if setting != "classic" else it["alt"],
            "setting": setting,
            "caption": it["caption"],
            "width": w,
            "height": h,
            "kind": "scene" if it["cat"] == "scenes" else "product",
        }
        if it.get("parent"):
            manifest[slug].update(parent=it["parent"], variant=it["variant"],
                                  kind="angle" if it["variant"] == "angle" else "variant")
    manifest = dict(sorted(manifest.items(), key=lambda kv: (kv[1]["category"], kv[0])))
    with open(MANIFEST, "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    print(f"{len(manifest)} images in manifest")


if __name__ == "__main__":
    main()
