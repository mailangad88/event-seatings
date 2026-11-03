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
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

import lib  # noqa: E402
import photoreal  # noqa: E402
from catalog import ITEMS  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def render_item(slug, args):
    item = ITEMS[slug]
    lib.reset_scene()
    lib._mat_cache.clear()
    env = item.get("env", "studio")
    photo = not args.classic
    if not photo:
        if env == "studio":
            lib.studio(item.get("studio_scale", 1.0))
        elif env == "lawn":
            lib.lawn(**item.get("lawn", {}))
    elif env == "lawn":
        photoreal.park_set(dusk=item.get("lawn", {}).get("dusk", False))
    item["build"]()
    if photo and item.get("photo_drop_top"):
        # Builders that model a bare floating tabletop: drop the top and lower everything onto the set's table.
        z = item["photo_drop_top"]
        for ob in list(bpy.context.scene.objects):
            if ob.name == "Top":
                bpy.data.objects.remove(ob)
            elif ob.parent is None and ob.type == "MESH":
                ob.location.z -= z
    lo, hi = lib.visible_bounds()
    big = max(hi - lo)
    if photo:
        if env == "studio":
            # Tableware and other small pieces sit on a linen-dressed table; furniture stands in a room corner.
            table = item.get("photo_set") == "table" or (big < 0.75 and item.get("studio_scale", 1.0) == 1.0)
            photoreal.room_set(lo, hi, tabletop=table,
                               scale=None if item.get("studio_scale", 1.0) == 1.0 else 3.0)
        photoreal.realism_pass()
    cam = item.get("cam", {})
    w, h = (args.px, args.px) if item.get("aspect", "1:1") == "1:1" else (1920, 1080)
    if item.get("px"):  # smaller extras (angles, colour variants)
        w, h = item["px"], item["px"] * h // w
    if bpy.context.scene.camera is not None:
        pass  # the builder placed its own camera (styled scenes)
    elif "camera" in item:
        lib.camera(**item["camera"])
    else:
        lib.shoot(aspect=w / h, **cam)
    if photo and not (bpy.context.scene.camera.data.dof.use_dof):
        fstop = 8.0 if env == "lawn" else 4.0 if big < 0.75 else 5.6 if big < 2.5 else 8.0
        if item["cat"] == "scenes":
            fstop = 6.3
        photoreal.add_depth_of_field(fstop)
    if args.scale != 100:
        w, h = w * args.scale // 100, h * args.scale // 100
    out = os.path.join(args.out, item["cat"], slug + ".png")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    lib.configure_render(w, h, item.get("samples", args.samples), out)
    if photo:
        vs = bpy.context.scene.view_settings
        vs.look = "AgX - Medium High Contrast"
        vs.exposure = -0.7 if env == "studio" else -0.2
    if args.threads:
        bpy.context.scene.render.threads_mode = "FIXED"
        bpy.context.scene.render.threads = args.threads
    if args.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=out.replace(".png", ".blend"))
    setting = "classic"
    if photo:
        if env == "lawn":
            setting = "park-dusk" if item.get("lawn", {}).get("dusk") else "park"
        elif env == "studio":
            setting = "scene" if item.get("studio_scale", 1.0) != 1.0 else "table" if table else "room"
        else:
            setting = "scene"
    with open(out.replace(".png", ".json"), "w") as f:
        json.dump({"setting": setting}, f)
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"rendered {slug} in {time.time() - t:.0f}s -> {out}", flush=True)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--products", action="store_true", help="Main product shots only (no scenes, angles or colour variants)")
    ap.add_argument("--category")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--samples", type=int, default=96)
    ap.add_argument("--scale", type=int, default=100, help="Resolution percentage (use 25 for quick previews)")
    ap.add_argument("--threads", type=int, default=0)
    ap.add_argument("--skip-existing", action="store_true")
    ap.add_argument("--classic", action="store_true", help="Old look: flat sweep, procedural lawn, no DOF")
    ap.add_argument("--px", type=int, default=1400, help="Square product image size")
    ap.add_argument("--save-blend", action="store_true")
    ap.add_argument("--out", default=os.path.join(ROOT, "out", "rentals"))
    args = ap.parse_args(argv)
    if args.list:
        for s, it in ITEMS.items():
            print(f"{it['cat']:10} {s}")
        return
    slugs = list(ITEMS) if args.all else [s for s, it in ITEMS.items() if it["cat"] != "scenes" and not it.get("parent")] if args.products else [s for s, it in ITEMS.items() if it["cat"] == args.category] if args.category else args.slugs
    for s in slugs:
        if s not in ITEMS:
            raise SystemExit(f"unknown item {s}")
        if args.skip_existing and os.path.exists(os.path.join(args.out, ITEMS[s]["cat"], s + ".png")):
            continue
        render_item(s, args)


if __name__ == "__main__":
    main()
