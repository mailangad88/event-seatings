"""One-off: regenerate every "scene" / "tablescape" / "hero" entry in src/data/styled-images.json
as a people-free, fully styled setup (same warm photoreal look, nobody in frame), using the same
reference image each one was originally built from so the rentals stay accurate.

These are the banner/hero images reused across many pages (home, /quote, /book, /reviews/write,
/tools/event-date, category pages, blog, guides...), as opposed to the ~2,800 individual catalog
item photos, which already show no people.

    GEMINI_API_KEY=... python3 scripts/no-people-styled.py [slug ...]
"""

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
OUT_DIR = os.path.join(ROOT, "public", "rentals", "styled")
STYLED_JSON = os.path.join(ROOT, "src", "data", "styled-images.json")
RENTAL_JSON = os.path.join(ROOT, "src", "data", "rental-images.json")
TABLESCAPES = os.path.join(ROOT, "public", "images", "scenes")
MODELS = [m for m in [os.environ.get("GEMINI_IMAGE_MODEL"), "gemini-3.1-flash-image", "gemini-2.5-flash-image"] if m]
ALT_MODELS = [m for m in [os.environ.get("GEMINI_TEXT_MODEL"), "gemini-3.8-flash", "gemini-3-flash"] if m]
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

LOOK = (
    "The mood is lush, warm and luxurious: golden evening or late-afternoon light, abundant fresh florals "
    "(roses, garden roses, hydrangeas, hanging floral strands), candles in glass hurricanes, crystal "
    "chandeliers and warm fairy lights, a rich warm palette of ivory, gold, blush and deep red. Editorial "
    "event photography: shot on a full-frame camera with a 35mm lens, natural depth of field with soft "
    "bokeh, realistic skin, fabric and reflections, true-to-life colour. The space is fully set up and "
    "styled but completely empty: no people, no guests, nobody in the frame at all, just before the party "
    "starts. No text, no logos, no watermarks, no signage."
)

# Reference images for the 5 heroes that have no base Blender scene render (built from item photos instead).
SPECIAL_REFS = {
    "hero-av": (["pa-system"], "a speaker on a tripod and a microphone stand set up beside an empty stage in an elegant, chandelier-lit ballroom, ready for a wedding toast, nobody in the room"),
    "hero-concessions": (["popcorn-machine", "cotton-candy-machine", "snow-cone-machine"], "a festive dessert and concessions corner at a wedding reception: popcorn, cotton candy and snow cone machines lined up and ready, completely empty of people"),
    "hero-photo-booths": ([], "an empty ring-light photo booth set up in front of a lush flower-wall backdrop at a warmly lit wedding reception, nobody posing, nobody in frame"),
    "hero-restrooms-power": ([], "an elegant luxury restroom trailer with a lit entrance and potted florals at the edge of an outdoor wedding lawn at dusk, nobody around"),
    "hero-fencing": ([], "polished gold stanchions with velvet ropes guiding the way along a floral, candlelit stone entrance walkway into an evening reception, completely empty"),
}


def ratio(w, h):
    r = w / h
    return min(["1:1", "16:9", "9:16", "4:3", "3:4"], key=lambda a: abs(r - eval(a.replace(":", "/"))))


def encode(path):
    img = Image.open(path).convert("RGB")
    img.thumbnail((1024, 1024))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=90)
    return {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}}


def call_gemini(key, prompt, refs, aspect):
    body = {
        "contents": [{"parts": [{"text": prompt}, *[encode(r) for r in refs]]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"], "imageConfig": {"aspectRatio": aspect}},
    }
    for model in MODELS:
        req = urllib.request.Request(API.format(model=model), data=json.dumps(body).encode(),
                                      headers={"Content-Type": "application/json", "x-goog-api-key": key})
        for attempt in range(5):
            try:
                res = json.load(urllib.request.urlopen(req, timeout=240))
                break
            except urllib.error.HTTPError as e:
                msg = e.read().decode()[:600]
                if e.code == 404:
                    res = None
                    break
                if e.code in (429, 500, 503) and attempt < 4:
                    time.sleep(2 ** (attempt + 2))
                    continue
                raise RuntimeError(f"Gemini error {e.code}: {msg}")
            except (urllib.error.URLError, TimeoutError) as e:
                if attempt < 4:
                    time.sleep(2 ** (attempt + 2))
                    continue
                raise RuntimeError(f"network: {e}")
        if res is None:
            continue
        image = None
        for cand in res.get("candidates", []):
            for part in cand.get("content", {}).get("parts", []):
                data = part.get("inline_data") or part.get("inlineData")
                if data:
                    image = Image.open(io.BytesIO(base64.b64decode(data["data"])))
        if image is None:
            raise RuntimeError(f"no image in response: {json.dumps(res)[:300]}")
        return image, model
    raise RuntimeError("no image model available for this key")


def describe(key, img, caption):
    buf = io.BytesIO()
    small = img.copy()
    small.thumbnail((768, 768))
    small.save(buf, "JPEG", quality=85)
    prompt = (f"Write alt text for this event photo in one sentence of 20 to 35 words. Name the rental setup "
              f"({caption}) and the setting. It shows no people, so do not mention guests or anyone in it. "
              "Do not start with 'image of' or 'photo of'. Plain text only.")
    body = {"contents": [{"parts": [{"text": prompt}, {"inline_data": {"mime_type": "image/jpeg",
                                                                       "data": base64.b64encode(buf.getvalue()).decode()}}]}]}
    for model in ALT_MODELS:
        req = urllib.request.Request(API.format(model=model), data=json.dumps(body).encode(),
                                     headers={"Content-Type": "application/json", "x-goog-api-key": key})
        for attempt in range(3):
            try:
                res = json.load(urllib.request.urlopen(req, timeout=120))
                text = "".join(p.get("text", "") for c in res.get("candidates", []) for p in c.get("content", {}).get("parts", []))
                text = text.replace("*", "").strip().strip('"')
                if 20 <= len(text) <= 260:
                    return text.rstrip(".")
                return ""
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    break
                time.sleep(2 ** (attempt + 2))
            except (urllib.error.URLError, TimeoutError):
                time.sleep(2 ** (attempt + 2))
    return ""


def main():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise SystemExit("GEMINI_API_KEY not set")
    styled = json.load(open(STYLED_JSON))
    rentals = json.load(open(RENTAL_JSON))
    only = set(sys.argv[1:])

    jobs = []
    for slug, v in sorted(styled.items()):
        if v.get("kind") not in ("scene", "tablescape", "hero"):
            continue
        if only and slug not in only:
            continue
        caption = v.get("caption", slug.replace("-", " "))
        w, h = v.get("width", 1920), v.get("height", 1080)
        if slug in SPECIAL_REFS:
            ref_slugs, scene = SPECIAL_REFS[slug]
            refs = [os.path.join(ROOT, "public", rentals[s]["src"].lstrip("/")) for s in ref_slugs if s in rentals]
        elif v["kind"] == "tablescape":
            refs = [os.path.join(TABLESCAPES, f"{slug}.webp")]
            scene = f"{caption.lower()}, a dressed reception table fully set with its florals and candles, nobody seated, nobody in frame"
        elif slug in rentals:
            refs = [os.path.join(ROOT, "public", rentals[slug]["src"].lstrip("/"))]
            scene = f"{caption.lower()}, fully set up and styled for a Chicago-area event, completely empty with no people, no guests, nobody anywhere in the frame"
        else:
            print(f"skip {slug}: no reference found", file=sys.stderr)
            continue
        refs = [r for r in refs if os.path.exists(r)]
        jobs.append((slug, caption, scene, refs, (w, h)))

    for slug, caption, scene, refs, (w, h) in jobs:
        prompt = f"Create a photograph: {scene}. {LOOK}"
        print(f"generating {slug} (refs={len(refs)})...", flush=True)
        img, model = call_gemini(key, prompt, refs, ratio(w, h))
        img = img.convert("RGB")
        scale = min(1.0, max(w, h) / max(img.size))
        if scale < 1:
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        out = os.path.join(OUT_DIR, f"{slug}.webp")
        img.save(out, "WEBP", quality=82, method=6)
        alt = describe(key, img, caption) or f"{caption}, fully set up with no one in the frame"
        styled[slug]["alt"] = alt
        styled[slug]["caption"] = caption
        with open(STYLED_JSON, "w") as f:
            json.dump(dict(sorted(styled.items())), f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"  -> {out} ({model}) alt: {alt}", flush=True)


if __name__ == "__main__":
    main()
