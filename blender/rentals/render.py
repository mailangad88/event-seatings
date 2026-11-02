"""Render Beyond Chiavari rental catalog images with Blender (Cycles).

    python blender/rentals/render.py --list
    python blender/rentals/render.py gold-chiavari round-60      # specific items
    python blender/rentals/render.py --category chairs            # one category
    python blender/rentals/render.py --all --samples 96

Writes PNGs to out/rentals/<category>/<slug>.png. Then run
`python blender/rentals/publish.py` to convert to WebP under public/rentals/ and
regenerate src/data/rental-images.json (alt text, captions, sizes).
See blender/rentals/README.md.
"""

import argparse
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

import lib  # noqa: E402
from catalog import ITEMS  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def render_item(slug, args):
    item = ITEMS[slug]
    lib.reset_scene()
    lib._mat_cache.clear()
    env = item.get("env", "studio")
    if env == "studio":
        lib.studio(item.get("studio_scale", 1.0))
    elif env == "lawn":
        lib.lawn(**item.get("lawn", {}))
    elif env == "none":
        pass
    item["build"]()
    cam = item.get("cam", {})
    w, h = (1600, 1600) if item.get("aspect", "1:1") == "1:1" else (1920, 1080)
    if bpy.context.scene.camera is not None:
        pass  # the builder placed its own camera (styled scenes)
    elif "camera" in item:
        lib.camera(**item["camera"])
    else:
        lib.shoot(aspect=w / h, **cam)
    if args.scale != 100:
        w, h = w * args.scale // 100, h * args.scale // 100
    out = os.path.join(args.out, item["cat"], slug + ".png")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    lib.configure_render(w, h, item.get("samples", args.samples), out)
    if args.threads:
        bpy.context.scene.render.threads_mode = "FIXED"
        bpy.context.scene.render.threads = args.threads
    if args.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=out.replace(".png", ".blend"))
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"rendered {slug} in {time.time() - t:.0f}s -> {out}", flush=True)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--category")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--samples", type=int, default=96)
    ap.add_argument("--scale", type=int, default=100, help="Resolution percentage (use 25 for quick previews)")
    ap.add_argument("--threads", type=int, default=0)
    ap.add_argument("--skip-existing", action="store_true")
    ap.add_argument("--save-blend", action="store_true")
    ap.add_argument("--out", default=os.path.join(ROOT, "out", "rentals"))
    args = ap.parse_args(argv)
    if args.list:
        for s, it in ITEMS.items():
            print(f"{it['cat']:10} {s}")
        return
    slugs = list(ITEMS) if args.all else [s for s, it in ITEMS.items() if it["cat"] == args.category] if args.category else args.slugs
    for s in slugs:
        if s not in ITEMS:
            raise SystemExit(f"unknown item {s}")
        if args.skip_existing and os.path.exists(os.path.join(args.out, ITEMS[s]["cat"], s + ".png")):
            continue
        render_item(s, args)


if __name__ == "__main__":
    main()
