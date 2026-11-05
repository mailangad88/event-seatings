"""One-off: regenerate every "product" / "variant" / "angle" / "solo" entry in
src/data/styled-images.json as a people-free, fully styled in-context shot (same warm photoreal
look, nobody in frame), using the same reference image each one was originally built from.

These are per-item "in use at an event" shots (chairs with guests seated, a bar stool at a
cocktail bar, a chafing dish being served from, a bounce house with kids playing, etc.) used on
item cards and item pages across the whole catalog. The item's own first/"photo" image (the plain
catalog photo) is untouched — it was already people-free.

    GEMINI_API_KEY=... python3 scripts/no-people-catalog.py [slug ...]
    python3 scripts/no-people-catalog.py --list            # print remaining slugs, no generation
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
MODELS = [m for m in [os.environ.get("GEMINI_IMAGE_MODEL"), "gemini-3.1-flash-image", "gemini-2.5-flash-image"] if m]
ALT_MODELS = [m for m in [os.environ.get("GEMINI_TEXT_MODEL"), "gemini-3.8-flash", "gemini-3-flash"] if m]
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
PROGRESS = os.path.join(ROOT, "scripts", ".no-people-catalog-done.json")

LOOK = (
    "The mood is lush, warm and luxurious: golden evening or late-afternoon light, abundant fresh florals, "
    "candles in glass hurricanes, crystal chandeliers and warm fairy lights, a rich warm palette of ivory, "
    "gold, blush and deep red. Editorial event photography: shot on a full-frame camera with a 35mm lens, "
    "natural depth of field, realistic fabric and reflections, true-to-life colour. The space is fully set "
    "up and styled but completely empty: no people, no guests, nobody in the frame at all. "
    "No text, no logos, no watermarks, no signage."
)


def ratio(w, h):
    r = w / h
    return min(["1:1", "16:9", "9:16", "4:3", "3:4"], key=lambda a: abs(r - eval(a.replace(":", "/"))))


def encode(path):
    img = Image.open(path).convert("RGB")
    img.thumbnail((1024, 1024))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=90)
    return {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}}


class Quota(Exception):
    pass


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
                if (e.code == 429 and "limit: 0" in msg) or (e.code == 402 and "prepayment" in msg):
                    raise Quota(msg)
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
    prompt = (f"Write alt text for this event rental photo in one sentence of 15 to 30 words. Name the item "
              f"({caption}) and its setting. It shows no people, so do not mention guests or anyone in it. "
              "Do not start with 'image of' or 'photo of'. Use plain words (no vibrant, stunning, seamless, "
              "elegant). Plain text only.")
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
                if 15 <= len(text) <= 260:
                    return text.rstrip(".")
                return ""
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    break
                time.sleep(2 ** (attempt + 2))
            except (urllib.error.URLError, TimeoutError):
                time.sleep(2 ** (attempt + 2))
    return ""


def build_jobs(styled, rentals):
    jobs = []
    for slug, v in sorted(styled.items()):
        if v.get("kind") not in ("product", "variant", "angle", "solo"):
            continue
        ref_key = slug[: -len("--solo")] if slug.endswith("--solo") else slug
        if ref_key not in rentals:
            continue
        ref = os.path.join(ROOT, "public", rentals[ref_key]["src"].lstrip("/"))
        if not os.path.exists(ref):
            continue
        caption = v.get("caption", slug.replace("-", " "))
        w, h = v.get("width", 1024), v.get("height", 1024)
        scene = f"{caption}, fully styled in a lush Chicago-area event setting, completely empty with no people, nobody anywhere in the frame"
        jobs.append((slug, caption, scene, [ref], (w, h)))
    return jobs


def main():
    styled = json.load(open(STYLED_JSON))
    rentals = json.load(open(RENTAL_JSON))
    jobs = build_jobs(styled, rentals)

    if "--list" in sys.argv:
        for slug, *_ in jobs:
            print(slug)
        print(f"# {len(jobs)} total", file=sys.stderr)
        return

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise SystemExit("GEMINI_API_KEY not set")
    only = {a for a in sys.argv[1:] if not a.startswith("--")}
    if only:
        jobs = [j for j in jobs if j[0] in only]

    skipped = []
    for slug, caption, scene, refs, (w, h) in jobs:
        prompt = f"Create a photograph: {scene}. {LOOK}"
        print(f"generating {slug}...", flush=True)
        try:
            img, model = call_gemini(key, prompt, refs, ratio(w, h))
        except Quota as e:
            print(f"QUOTA HIT at {slug}: {e}", file=sys.stderr, flush=True)
            raise SystemExit(1)
        except RuntimeError as e:
            print(f"SKIP {slug}: {e}", file=sys.stderr, flush=True)
            skipped.append(slug)
            continue
        img = img.convert("RGB")
        scale = min(1.0, max(w, h) / max(img.size))
        if scale < 1:
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        out = os.path.join(OUT_DIR, f"{slug}.webp")
        img.save(out, "WEBP", quality=82, method=6)
        alt = describe(key, img, caption) or f"{caption}, styled with no one in the frame"
        styled[slug]["alt"] = alt
        styled[slug]["caption"] = caption
        with open(STYLED_JSON, "w") as f:
            json.dump(dict(sorted(styled.items())), f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"  -> {out} ({model}) alt: {alt}", flush=True)

    if skipped:
        print(f"\n{len(skipped)} skipped (refused or errored): {' '.join(skipped)}", file=sys.stderr, flush=True)


if __name__ == "__main__":
    main()
