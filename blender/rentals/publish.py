"""Convert rendered PNGs to web-ready WebP and write the image manifest the site reads.

    python blender/rentals/publish.py

Reads  out/rentals/<category>/<slug>.png
Writes public/rentals/<category>/<slug>.webp and src/data/rental-images.json
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402,F401  (must load before bmesh, which the registry imports)
from PIL import Image  # noqa: E402

from catalog import ITEMS  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "out", "rentals")
DST = os.path.join(ROOT, "public", "rentals")
MANIFEST = os.path.join(ROOT, "src", "data", "rental-images.json")


def main():
    manifest = {}
    if os.path.exists(MANIFEST):
        manifest = json.load(open(MANIFEST))
    for slug, it in ITEMS.items():
        png = os.path.join(SRC, it["cat"], slug + ".png")
        out = os.path.join(DST, it["cat"], slug + ".webp")
        if os.path.exists(png):
            os.makedirs(os.path.dirname(out), exist_ok=True)
            im = Image.open(png).convert("RGB")
            im.save(out, "WEBP", quality=82, method=6)
        if not os.path.exists(out):
            continue
        w, h = Image.open(out).size
        manifest[slug] = {
            "src": f"/rentals/{it['cat']}/{slug}.webp",
            "category": it["cat"],
            "alt": it["alt"],
            "caption": it["caption"],
            "width": w,
            "height": h,
            "kind": "scene" if it["cat"] == "scenes" else "product",
        }
    manifest = dict(sorted(manifest.items(), key=lambda kv: (kv[1]["category"], kv[0])))
    with open(MANIFEST, "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    print(f"{len(manifest)} images in manifest")


if __name__ == "__main__":
    main()
