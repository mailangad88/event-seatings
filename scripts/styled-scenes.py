"""Styled event-scene photos with Google's Gemini image model, anchored on our own renders.

Angad wants every image on the site to look like his reference: a lush, warm, photo-real evening celebration
(abundant florals, candlelight, chandeliers, fairy lights, happy guests in their best clothes) with the rentals
in use. Free photo libraries don't have those shots and Blender can't do crowds convincingly, so this asks
Gemini to compose the scene, sending our Blender render as the reference so the item stays accurate.

Every image in src/data/rental-images.json gets a styled version with the SAME slug, so it replaces the render
everywhere on the site (item pages, cards, quote picker, category heroes, guides, blog). The tablescapes in
public/images/scenes/ are restyled too (keyed by file stem), and --new-heroes makes category heroes that
have no render yet. Pages label all of them "AI-generated example" and mark them in the image schema.

    python3 scripts/styled-scenes.py gold-chiavari crossback       # some slugs
    python3 scripts/styled-scenes.py --all --skip-existing          # everything still missing
    python3 scripts/styled-scenes.py --kind scene --kind tablescape # just the event scenes
    python3 scripts/styled-scenes.py --new-heroes

Needs GEMINI_API_KEY (a key on a billed Google AI Studio project: the free tier allows 0 image requests) and
Pillow. GEMINI_IMAGE_MODEL overrides the model. Review outputs: if an item came out wrong, delete its file and
entry, or re-run that slug.
"""

import argparse
import base64
import concurrent.futures as cf
import io
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RENTAL_JSON = os.path.join(ROOT, "src", "data", "rental-images.json")
OUT_JSON = os.path.join(ROOT, "src", "data", "styled-images.json")
OUT_DIR = os.path.join(ROOT, "public", "rentals", "styled")
TABLESCAPES = os.path.join(ROOT, "public", "images", "scenes")
MODELS = [m for m in [os.environ.get("GEMINI_IMAGE_MODEL"), "gemini-3.1-flash-image", "gemini-2.5-flash-image"] if m]
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
# Image models return no text, so a vision text model writes each alt text from the finished image.
ALT_MODELS = [m for m in [os.environ.get("GEMINI_TEXT_MODEL"), "gemini-3.8-flash", "gemini-3-flash"] if m]
LOCK = threading.Lock()

# The look, taken from Angad's reference image.
LOOK = (
    "The mood is lush, warm and luxurious: golden evening light, abundant fresh florals (roses, garden roses, "
    "hydrangeas, hanging floral strands), candles in glass hurricanes, crystal chandeliers and warm fairy lights, "
    "a rich warm palette of ivory, gold, blush and deep red, guests in elegant attire laughing and celebrating "
    "naturally. Editorial event photography: shot on a full-frame camera with a 35mm lens, natural depth of field "
    "with soft bokeh in the background, realistic skin, fabric and reflections, true-to-life colour. "
    "No text, no logos, no watermarks, no signage."
)

# Chicago is diverse; rotate the celebration so the site isn't one wedding over and over. Picked per slug.
CELEBRATIONS = [
    "a South Asian wedding reception",
    "a classic black-tie wedding reception",
    "a Mexican-American quinceañera",
    "a Black-owned family's anniversary gala",
    "a Chinese-American wedding banquet",
    "a Polish-American wedding reception",
    "a Jewish wedding reception",
    "a Filipino debut celebration",
    "a Greek-American wedding reception",
    "a Nigerian-American engagement party",
]

# Where each category is best pictured. {event} is filled from CELEBRATIONS for formal categories.
SCENES = {
    "chairs": "rows of these exact chairs in use at {event} in a grand Chicago ballroom, guests seated at dressed tables",
    "tables": "this exact table dressed and set for {event}, guests mingling around it",
    "linens": "these exact linens on the reception tables at {event}, tall floral centrepieces and candles",
    "tableware": "this exact tableware in a full place setting on a dressed table at {event}, close-up, guests softly blurred behind",
    "catering": "this exact catering piece in use on a lavish buffet at {event}, food being served",
    "tents": "this exact tent lit up for {event} on a Chicago-area lawn at dusk, draped and filled with florals, guests inside",
    "floors": "this exact dance floor full of guests dancing at {event}, warm uplighting",
    "lighting": "this exact lighting glowing over guests dining at {event}",
    "heating": "this exact heater warming guests at an autumn evening celebration on a Chicago patio strung with lights",
    "lounge": "this exact lounge furniture in a cocktail-hour lounge at {event}, guests chatting with drinks",
    "decor": "this exact decor piece styled at {event}, florals and candles around it, guests nearby",
    "games": "this exact game being played by laughing guests at a lush backyard summer party near Chicago, golden hour, string lights",
    "concessions": "this exact machine serving smiling guests at a festive backyard celebration strung with lights",
    "av": "this exact equipment in use at {event} in a Chicago hotel ballroom, guests watching a toast",
    "restrooms-power": "this exact unit placed discreetly at the edge of a lush outdoor wedding on a lawn, guests celebrating in the distance",
    "fencing": "this exact equipment guiding guests into a lantern-lit outdoor celebration in Chicago",
    "photo-booths": "this exact photo booth with guests in elegant attire posing at {event}",
}

# Per-image fixes found in review: where the default scene got the item or the occasion wrong. For scenes and
# tablescapes this replaces the celebration; for items it replaces the whole scene sentence.
OVERRIDES = {
    "graduation-party": "a graduation party under a white frame tent in a Chicago-area backyard, graduates in caps and gowns with family, white folding chairs",
    "kids-party": "a children's birthday party in a backyard garden, toddlers playing in the soft-play pen while parents watch, balloons and florals",
    "corporate-gala": "a corporate awards gala dinner in a Chicago hotel ballroom, business attire, no signs or banners",
    "gilded-ivory-chair-detail": "a close-up detail shot at a wedding reception: one gold bamboo Chiavari chair with an ivory cushion beside a dressed table, florals and candles softly blurred behind",
    "bar-stool": "these exact bar stools lined up at a cocktail bar at {event}, guests perched on them with drinks",
    "bounce-house": "this exact bounce house with children jumping inside at a lush backyard birthday party near Chicago, golden hour, parents watching, string lights",
    "cloth-napkins": "this exact cloth napkin folded on a dinner plate with a gold napkin ring, in an ivory-and-blush place setting on a dressed table at {event}, close-up",
    "frame-tent-20x20": "this exact white frame tent (gable roof on a metal frame, no centre poles) seen from outside on a Chicago-area lawn at dusk, lit up inside for {event}, the whole tent in frame",
    "frame-tent-30x60": "this exact large white frame tent (gable roof on a metal frame, no centre poles) seen from outside on a Chicago-area lawn at dusk, lit up inside for {event}, the whole tent in frame",
    "led-dance-floor": "a flat LED dance floor of perfectly smooth, flat glass square panels glowing warm white with tiny starlight dots, flush with the ground (the bumps in the reference render are only reflections), lit up under guests dancing at {event}",
    "led-dance-floor--angle": "this exact flat LED dance floor (smooth square glowing panels, flush with the ground) lit up under guests dancing at {event}",
    "kids-table": "this exact small kids' table with young children seated around it colouring and eating cake at {event}, adults blurred behind",
    "kids-table--angle": "this exact small kids' table with young children seated around it colouring and eating cake at {event}, adults blurred behind",
    "ceremony-arch--angle": "this exact hexagonal wooden ceremony arch, intact and standing upright, framing a couple at the altar during {event}, guests seated",
}

# Category heroes that have no render yet: (caption, category, reference slugs, description).
NEW_HEROES = {
    "hero-concessions": ("Popcorn, cotton candy and snow cone machines serving guests", "concessions", ["popcorn-machine", "cotton-candy-machine", "snow-cone-machine"],
                         "a festive dessert and concessions corner at {event}: popcorn, cotton candy and snow cone machines serving guests"),
    "hero-photo-booths": ("Guests posing at a flower-wall photo booth", "photo-booths", [], "guests in elegant attire laughing at a flower-wall photo booth at {event}"),
    "hero-av": ("A speaker and microphone set up for wedding toasts", "av", ["pa-system"], "a toast at {event}: a speaker on a tripod and a microphone stand beside the head table, guests listening"),
    "hero-restrooms-power": ("A luxury restroom trailer at an outdoor wedding", "restrooms-power", [], "an elegant luxury restroom trailer with a lit entrance and potted florals at the edge of an outdoor wedding at dusk"),
    "hero-fencing": ("Stanchions and velvet ropes guiding guests into a reception", "fencing", [], "stanchions with velvet ropes guiding guests along a candlelit entrance into {event}"),
}

PRODUCT_PROMPT = (
    "Create a photograph: {scene}. The item in the reference image ({caption}) must appear exactly as shown: "
    "same model, shape, colour, material, finish and proportions, clearly visible and in focus; do not redesign "
    "it or swap it for a different style. {look}"
)
SCENE_PROMPT = (
    "Turn the reference image into a real photograph of the same event setup ({caption}), as if shot at "
    "{event}. Keep the same rentals (chairs, tables, linens, tableware, tent, lighting) with the same styles, "
    "colours and arrangement, and fill the scene with life. {look}"
)
HERO_PROMPT = (
    "Create a photograph: {scene}. Any rental items shown in the reference images must keep their exact design "
    "and colour. {look}"
)


def pick(slug, options):
    n = 7
    for ch in slug:
        n = (n * 31 + ord(ch)) & 0xFFFFFFFF
    return options[n % len(options)]


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
                if e.code == 429 and "limit: 0" in msg:
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
        image, text = None, ""
        for cand in res.get("candidates", []):
            for part in cand.get("content", {}).get("parts", []):
                data = part.get("inline_data") or part.get("inlineData")
                if data:
                    image = Image.open(io.BytesIO(base64.b64decode(data["data"])))
                elif part.get("text"):
                    text += part["text"]
        if image is None:
            raise RuntimeError(f"no image in response: {json.dumps(res)[:300]}")
        return image, clean_alt(text), model
    raise RuntimeError("no image model available for this key")


def describe(key, img, caption):
    """One-sentence alt text for a finished image, naming the rental. Empty string if it fails."""
    buf = io.BytesIO()
    small = img.copy()
    small.thumbnail((768, 768))
    small.save(buf, "JPEG", quality=85)
    prompt = (f"Write alt text for this event photo in one sentence of 20 to 35 words. Name the rental item "
              f"({caption}), how it is being used, and the setting. Do not start with 'image of' or 'photo of'. "
              "Plain text only.")
    body = {"contents": [{"parts": [{"text": prompt}, {"inline_data": {"mime_type": "image/jpeg",
                                                                       "data": base64.b64encode(buf.getvalue()).decode()}}]}]}
    for model in ALT_MODELS:
        req = urllib.request.Request(API.format(model=model), data=json.dumps(body).encode(),
                                     headers={"Content-Type": "application/json", "x-goog-api-key": key})
        for attempt in range(3):
            try:
                res = json.load(urllib.request.urlopen(req, timeout=120))
                text = "".join(p.get("text", "") for c in res.get("candidates", []) for p in c.get("content", {}).get("parts", []))
                return clean_alt(text)
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    break
                time.sleep(2 ** (attempt + 2))
            except (urllib.error.URLError, TimeoutError):
                time.sleep(2 ** (attempt + 2))
    return ""


def clean_alt(text):
    text = re.sub(r"\s+", " ", text.replace("*", "")).strip().strip('"')
    text = re.sub(r"^(alt text|alt|description)\s*:\s*", "", text, flags=re.I)
    m = re.search(r"[^.!?]*[.!?]", text)
    text = (m.group(0) if m else text).strip()
    return text if 20 <= len(text) <= 260 else ""


def jobs(args, rentals):
    """(slug, kind, category, caption, reference paths, size, prompt) for everything requested."""
    out = []
    for slug, r in rentals.items():
        ref = os.path.join(ROOT, "public", r["src"].lstrip("/"))
        if not os.path.exists(ref):
            continue
        event = pick(slug, CELEBRATIONS)
        if r["kind"] == "scene":
            prompt = SCENE_PROMPT.format(caption=r["caption"], event=OVERRIDES.get(slug, event), look=LOOK)
        else:
            scene = OVERRIDES.get(slug) or SCENES.get(r["category"], "this exact item styled at {event}, guests nearby")
            scene = scene.format(event=event)
            prompt = PRODUCT_PROMPT.format(scene=scene, caption=r["caption"], look=LOOK)
        out.append((slug, r["kind"], r["category"], r["caption"], [ref], (r["width"], r["height"]), prompt))
    for f in sorted(os.listdir(TABLESCAPES)) if os.path.isdir(TABLESCAPES) else []:
        if not f.endswith(".webp"):
            continue
        slug = f[:-5]
        ref = os.path.join(TABLESCAPES, f)
        w, h = Image.open(ref).size
        caption = slug.replace("-", " ").capitalize() + " tablescape"
        prompt = SCENE_PROMPT.format(caption=caption, event=OVERRIDES.get(slug, pick(slug, CELEBRATIONS)), look=LOOK)
        out.append((slug, "tablescape", "chairs", caption, [ref], (w, h), prompt))
    if args.new_heroes:
        for slug, (caption, cat, refs, desc) in NEW_HEROES.items():
            paths = [os.path.join(ROOT, "public", rentals[s]["src"].lstrip("/")) for s in refs if s in rentals]
            scene = desc.format(event=pick(slug, CELEBRATIONS))
            out.append((slug, "hero", cat, caption, paths, (1920, 1080), HERO_PROMPT.format(scene=scene, look=LOOK)))
    order = {"scene": 0, "tablescape": 0, "hero": 0, "product": 1, "variant": 2, "angle": 3}
    out.sort(key=lambda j: (order.get(j[1], 4), j[0]))
    if args.slugs:
        out = [j for j in out if j[0] in args.slugs]
    elif args.kind:
        out = [j for j in out if j[1] in args.kind]
    elif not (args.all or args.new_heroes):
        raise SystemExit("Name slugs, or pass --all, --kind or --new-heroes.")
    if args.new_heroes and not args.all and not args.slugs:
        out = [j for j in out if j[1] == "hero" or (args.kind and j[1] in args.kind)]
    return out


def save(styled):
    with open(OUT_JSON, "w") as f:
        json.dump(dict(sorted(styled.items())), f, indent=2, ensure_ascii=False)
        f.write("\n")


def run_one(key, job, styled):
    slug, kind, category, caption, refs, (w, h), prompt = job
    img, _, model = call_gemini(key, prompt, refs, ratio(w, h))
    img = img.convert("RGB")
    alt = describe(key, img, caption)
    # Same aspect as the image it replaces, no bigger than the original.
    scale = min(1.0, max(w, h) / max(img.size))
    if scale < 1:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    out = os.path.join(OUT_DIR, f"{slug}.webp")
    img.save(out, "WEBP", quality=82, method=6)
    what = caption[0].lower() + caption[1:]
    alt = alt.rstrip(".") if alt else f"{caption} at a lush, candlelit evening celebration with florals and guests"
    entry = {
        "src": f"/rentals/styled/{slug}.webp",
        "category": category,
        "kind": kind,
        "alt": f"{alt} (AI-generated example image of {what})",
        "caption": f"{caption}, styled at an event (AI-generated example)",
        "width": img.width,
        "height": img.height,
        "model": model,
        "prompt": prompt,
    }
    with LOCK:
        styled[slug] = entry
        save(styled)
    return f"styled {slug} {img.width}x{img.height} [{model}]"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--kind", action="append", choices=["scene", "tablescape", "product", "variant", "angle", "hero"])
    ap.add_argument("--new-heroes", action="store_true")
    ap.add_argument("--skip-existing", action="store_true")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    key = os.environ.get("GEMINI_API_KEY")
    if not key and not args.dry_run:
        raise SystemExit("Set GEMINI_API_KEY (Project settings > Cloud environment > environment variables).")
    rentals = json.load(open(RENTAL_JSON))
    styled = json.load(open(OUT_JSON)) if os.path.exists(OUT_JSON) else {}
    todo = jobs(args, rentals)
    if args.skip_existing:
        todo = [j for j in todo if not os.path.exists(os.path.join(OUT_DIR, f"{j[0]}.webp"))]
    print(f"{len(todo)} images to make", flush=True)
    if args.dry_run:
        for j in todo:
            print(j[1], j[0], j[5])
        return
    os.makedirs(OUT_DIR, exist_ok=True)
    failed = []
    with cf.ThreadPoolExecutor(args.workers) as pool:
        futs = {pool.submit(run_one, key, j, styled): j[0] for j in todo}
        for fut in cf.as_completed(futs):
            try:
                print(fut.result(), flush=True)
            except Quota as e:
                pool.shutdown(cancel_futures=True)
                raise SystemExit(f"Quota: this key has no image quota (enable billing on its project).\n{e}")
            except Exception as e:  # keep going; re-run with --skip-existing
                failed.append(futs[fut])
                print(f"FAILED {futs[fut]}: {e}", file=sys.stderr, flush=True)
    if failed:
        print(f"{len(failed)} failed: {' '.join(failed)}", file=sys.stderr)


if __name__ == "__main__":
    main()
