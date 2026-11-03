"""Styled event-scene photos with Google's Gemini image model, anchored on our own product images.

Angad wants every rental pictured in a real, styled event (reference: a lush evening wedding with gold
Chiavari chairs, florals and candlelight), not only as an isolated product shot. Free photo libraries don't
have those shots and Blender can't do crowds convincingly, so this asks Gemini to compose the scene.

To keep the item accurate, each request sends our photoreal product image (public/rentals/...) as the
reference and tells the model to keep that exact item. Review every output before publishing: if the
item came out wrong (wrong chair model, wrong colour), delete it or re-run that slug.

    GEMINI_API_KEY=... python3 scripts/styled-scenes.py gold-chiavari crossback   # some items
    GEMINI_API_KEY=... python3 scripts/styled-scenes.py --all --skip-existing

Writes public/rentals/styled/<slug>.webp and src/data/styled-images.json (alt text, caption, the prompt).
Every image is labelled as AI-generated in its alt text and schema, so nobody mistakes it for a photo of
the vendor's actual stock. Needs Pillow. The model name can be overridden with GEMINI_IMAGE_MODEL.
"""

import argparse
import base64
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RENTAL_JSON = os.path.join(ROOT, "src", "data", "rental-images.json")
OUT_JSON = os.path.join(ROOT, "src", "data", "styled-images.json")
OUT_DIR = os.path.join(ROOT, "public", "rentals", "styled")
MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

# What kind of event each category is best pictured at. Chicago venues, real guests, evening or golden light.
SCENES = {
    "chairs": "rows of these exact chairs at an elegant evening wedding reception in a Chicago ballroom, guests seated, florals and candlelight on the tables",
    "tables": "this exact table dressed and set for a wedding reception, guests mingling nearby, warm candlelight, a Chicago loft venue",
    "linens": "these exact linens on reception tables at a romantic evening wedding, centrepieces with roses and candles, guests in the background",
    "tableware": "this exact tableware in a full place setting on a dressed reception table, close-up, candlelight bokeh, guests softly blurred behind",
    "catering": "this exact catering piece in use on a buffet at a wedding reception, food being served, warm light",
    "tents": "this exact tent set up for a summer wedding on a Chicago-area lawn at golden hour, guests arriving, string lights",
    "floors": "this exact dance floor full of guests dancing at an evening wedding reception, uplighting",
    "lighting": "this exact lighting at an evening wedding reception, guests dining beneath it, romantic glow",
    "heating": "this exact heater warming guests at an autumn evening party on a Chicago patio",
    "lounge": "this exact lounge furniture in a cocktail-hour lounge at a wedding, guests chatting with drinks",
    "decor": "this exact decor piece styled at an evening wedding, florals and candles around it, guests nearby",
    "games": "this exact game being played by guests at a backyard summer party near Chicago, golden hour",
    "concessions": "this exact machine serving guests at a backyard birthday party, kids and adults smiling",
    "av": "this exact equipment in use at a corporate event in a Chicago hotel ballroom, audience seated",
    "restrooms-power": "this exact unit placed discreetly at an outdoor wedding on a lawn, guests in the distance",
    "fencing": "this exact equipment guiding guests at an outdoor festival entrance in Chicago",
    "photo-booths": "this exact photo booth with guests posing at an evening wedding reception",
}

PROMPT = (
    "Create a photograph: {scene}. The item in the reference image ({caption}) must appear exactly as shown: "
    "same model, shape, colour, material and proportions; do not redesign it. Shot by a professional event "
    "photographer on a full-frame camera, natural light and practical light sources, shallow depth of field, "
    "realistic skin and fabric, no text, no logos, no watermarks."
)


def call_gemini(key, prompt, ref_path):
    img = Image.open(ref_path).convert("RGB")
    img.thumbnail((1024, 1024))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=90)
    body = {
        "contents": [{"parts": [
            {"text": prompt},
            {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}},
        ]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }
    req = urllib.request.Request(API.format(model=MODEL), data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    for attempt in range(4):
        try:
            res = json.load(urllib.request.urlopen(req, timeout=180))
            break
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(2 ** (attempt + 2))
                continue
            raise SystemExit(f"Gemini error {e.code}: {e.read().decode()[:400]}")
    for cand in res.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            data = part.get("inline_data") or part.get("inlineData")
            if data:
                return Image.open(io.BytesIO(base64.b64decode(data["data"])))
    raise RuntimeError(f"no image in response: {json.dumps(res)[:300]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--skip-existing", action="store_true")
    args = ap.parse_args()
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise SystemExit("Set GEMINI_API_KEY (Project settings > Cloud environment > environment variables).")
    rentals = json.load(open(RENTAL_JSON))
    products = {s: r for s, r in rentals.items() if r["kind"] == "product"}
    slugs = list(products) if args.all else args.slugs
    styled = json.load(open(OUT_JSON)) if os.path.exists(OUT_JSON) else {}
    os.makedirs(OUT_DIR, exist_ok=True)
    for slug in slugs:
        r = products.get(slug)
        if not r:
            print(f"skip {slug}: no product image", file=sys.stderr)
            continue
        out = os.path.join(OUT_DIR, f"{slug}.webp")
        if args.skip_existing and os.path.exists(out):
            continue
        scene = SCENES.get(r["category"], "this exact item styled at an elegant evening event, guests nearby")
        prompt = PROMPT.format(scene=scene, caption=r["caption"])
        img = call_gemini(key, prompt, os.path.join(ROOT, "public", r["src"].lstrip("/")))
        img = img.convert("RGB")
        img.save(out, "WEBP", quality=84, method=6)
        where = scene.replace("this exact ", "").replace("these exact ", "")
        styled[slug] = {
            "src": f"/rentals/styled/{slug}.webp",
            "category": r["category"],
            "parent": slug,
            "alt": f"{r['caption']} pictured as {where} (AI-generated example image)",
            "caption": f"{r['caption']} at an event (AI-generated example)",
            "width": img.width,
            "height": img.height,
            "kind": "styled",
            "model": MODEL,
            "prompt": prompt,
        }
        with open(OUT_JSON, "w") as f:
            json.dump(dict(sorted(styled.items())), f, indent=2)
            f.write("\n")
        print(f"styled {slug} {img.width}x{img.height}", flush=True)


if __name__ == "__main__":
    main()
