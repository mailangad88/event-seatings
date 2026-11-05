"""One-off: generate people-free event-scene photos for the home page, using the same Gemini image
pipeline as scripts/styled-scenes.py but with a prompt that asks for an empty, styled setup (no
guests at all).

Writes straight into public/rentals/styled/, overwriting the given filenames.

    GEMINI_API_KEY=... python3 scripts/no-people-scenes.py [slug ...]
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
MODELS = [m for m in [os.environ.get("GEMINI_IMAGE_MODEL"), "gemini-3.1-flash-image", "gemini-2.5-flash-image"] if m]
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

LOOK = (
    "The mood is lush, warm and luxurious: golden evening or late-afternoon light, abundant fresh florals "
    "(roses, garden roses, hydrangeas, hanging floral strands), candles in glass hurricanes, warm fairy lights, "
    "a rich warm palette of ivory, gold, blush and deep red. Editorial event photography: shot on a full-frame "
    "camera with a 35mm lens, natural depth of field, realistic fabric and reflections, true-to-life colour. "
    "The space is fully set up and styled but completely empty: no people, no guests, nobody in the frame at "
    "all, just before the party starts. No text, no logos, no watermarks, no signage."
)

JOBS = [
    (
        "event-birthday",
        "a backyard birthday party table set up for a milestone birthday: a two-tier cake with lit candles on a "
        "wooden table dressed with a striped runner and place settings, gold number-40 balloons tied to a chair, "
        "string lights overhead, a lush garden behind, nobody at the table yet",
        (1600, 1067),
    ),
    (
        "event-graduation",
        "a graduation open house buffet set up under a white pop-up canopy in a backyard: chafing trays of food, "
        "maroon and gold balloons, a house and lawn behind, warm evening light, completely empty of people",
        (1600, 1067),
    ),
    (
        "event-wedding",
        "an outdoor wedding ceremony aisle set up with rows of white folding chairs and a white petal-strewn "
        "aisle leading to a floral arch, a city skyline soft in the distance, golden light, no one seated yet",
        (1600, 1067),
    ),
    (
        "event-corporate",
        "a corporate gala stage set up in a hotel ballroom: a clear glass podium on a lit stage in front of a "
        "blue swirl backdrop, rows of empty chairs at navy-linen round tables set with white florals and "
        "glassware in the foreground, nobody in the room",
        (1600, 1067),
    ),
    (
        "event-indian-wedding",
        "a South Asian wedding mandap set up in a ballroom: a carved wooden mandap draped in marigold and "
        "orange-gold floral garlands, a cushioned loveseat on the platform underneath, crystal chandeliers and "
        "warm string lights above, round tables dressed in the background, completely empty of people",
        (1280, 853),
    ),
    (
        "cat-tents",
        "a white pole tent fully set up on a green lawn at golden hour, ringed by mature trees, round tables "
        "inside dressed in white linen with floral centrepieces and white folding chairs, string lights strung "
        "inside, nobody anywhere in the frame",
        (1024, 1024),
    ),
]


def ratio(w, h):
    r = w / h
    return min(["1:1", "16:9", "9:16", "4:3", "3:4"], key=lambda a: abs(r - eval(a.replace(":", "/"))))


class Quota(Exception):
    pass


def call_gemini(key, prompt, aspect):
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
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


def main():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise SystemExit("GEMINI_API_KEY not set")
    only = set(sys.argv[1:])
    for slug, scene, (w, h) in JOBS:
        if only and slug not in only:
            continue
        prompt = f"Create a photograph: {scene}. {LOOK}"
        print(f"generating {slug}...", flush=True)
        img, model = call_gemini(key, prompt, ratio(w, h))
        img = img.convert("RGB")
        scale = min(1.0, max(w, h) / max(img.size))
        if scale < 1:
            img = img.resize((round(img.width * scale), round(img.height * scale)))
        out = os.path.join(OUT_DIR, f"{slug}.webp")
        img.save(out, "WEBP", quality=82, method=6)
        print(f"  -> {out} ({model})", flush=True)


if __name__ == "__main__":
    main()
