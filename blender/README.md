# Blender decor scenes for social video

Code-built Blender scenes that hero our chairs in styled, elegant tablescapes.
They produce:

- **Reference stills** (1080×1920, 9:16): a start frame and an end frame for every theme and camera move. These feed image-to-video AI (Seedance, Kling, Veo) and work as Instagram/Facebook posts.
- **Vertical clips** (1080×1920 MP4): Reels, Facebook Reels and YouTube Shorts, ready to post or to drop into Remotion for captions and a call to action.

Everything is procedural, so there are no model files to download. The Chiavari chair is built to real rental dimensions (seat 45 cm, overall 92 cm) with bamboo-node frame, three back rails and a spindle gallery.

## Setup

Blender runs as a Python module, so no GUI install is needed (it runs on a laptop or a cloud box):

```bash
python3.13 -m venv .venv-blender
.venv-blender/bin/pip install bpy==5.2.3
```

If you have desktop Blender 5.x installed, you can run the script with it instead:
`blender -b -P blender/beyondchiavari_scene.py -- --theme gilded-ivory --shot hero --still --out out/test`

## Render one thing

```bash
PY=.venv-blender/bin/python
# A still
$PY blender/beyondchiavari_scene.py --theme midnight-gold --shot hero --still --out out/blender/test
# A clip (frames, then encode)
$PY blender/beyondchiavari_scene.py --theme blush-garden --shot dolly --frames 96 --width 720 --height 1280 --samples 24 --out out/blender/frames/test/f
# Open it in Blender to tweak by hand
$PY blender/beyondchiavari_scene.py --theme gilded-ivory --shot hero --still --save-blend --out out/blender/gilded
```

| Option | Values |
| --- | --- |
| `--theme` | `gilded-ivory`, `midnight-gold`, `blush-garden` |
| `--shot` | `hero` (slow arc around one chair), `dolly` (glide down the aisle), `reveal` (rise from chair legs to full table) |
| `--still` / `--still-frame N` | render one JPG at frame N of the move |
| `--frames`, `--fps` | clip length (default 120 frames at 24 fps) |
| `--samples` | Cycles samples; 24 for clips, 128 for stills |
| `--width`, `--height` | default 1080×1920 |
| `--gpu` | use a GPU if your machine has one (much faster) |

## Render the whole pack

```bash
PY=.venv-blender/bin/python blender/render_all.sh
```

Writes `out/blender/stills/<theme>-<shot>-start.jpg|end.jpg` and `out/blender/clips/<theme>-<shot>.mp4`. On a 4-core CPU a still takes about 2 minutes and a 4-second clip about an hour. A GPU cuts that roughly tenfold. The chosen outputs are copied to `public/social/` so the site and the lead pages can use them.

## Captioned reels

`src/remotion/DecorReel.tsx` turns each theme's dolly clip and two stills into a 9-second reel with a hook, a detail line and a CTA:

```bash
npm run remotion:reels   # writes out/reels/<theme>-reel.mp4
```

To use an AI-animated clip, save it over `public/social/clips/<theme>-dolly.mp4` and render again.

Clip renders resume where they stopped: frames that already exist are skipped.

## Add a theme

Copy an entry in `THEMES` at the top of `beyondchiavari_scene.py` and change the colors: chair finish, cushion, linen, drape, floor, four flower colors, greenery, charger, and light tints. Ideas next: Ivory & Sage Garden, Champagne Cross-Back Barn, Black Tie Silver.

## Next step: animate with AI

See [`ai-video-prompts.md`](./ai-video-prompts.md) for model choice, settings and copy-paste prompts per theme.
