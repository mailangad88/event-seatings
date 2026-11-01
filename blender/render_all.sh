#!/usr/bin/env bash
# Renders the full social pack: first/last-frame stills for every theme and shot
# (reference frames for image-to-video AI), then vertical 9:16 clips.
#
#   PY=python blender/render_all.sh            # pip bpy module
#   PY="blender -b -P" blender/render_all.sh   # not supported: use the pip module or edit below
#
# Env: THEMES, SHOTS, CLIP_SHOTS, SAMPLES_STILL, SAMPLES_CLIP, CLIP_W, CLIP_H, FRAMES, OUT
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${PY:-python}
OUT=${OUT:-out/blender}
THEMES=${THEMES:-"gilded-ivory midnight-gold blush-garden"}
SHOTS=${SHOTS:-"hero dolly reveal"}
CLIP_SHOTS=${CLIP_SHOTS:-"dolly"}
FRAMES=${FRAMES:-96}
SAMPLES_STILL=${SAMPLES_STILL:-128}
SAMPLES_CLIP=${SAMPLES_CLIP:-24}
CLIP_W=${CLIP_W:-720}
CLIP_H=${CLIP_H:-1280}
mkdir -p "$OUT/stills" "$OUT/frames" "$OUT/clips"

for t in $THEMES; do
  for s in $SHOTS; do
    for f in 1 "$FRAMES"; do
      tag=$([ "$f" = 1 ] && echo start || echo end)
      dst="$OUT/stills/$t-$s-$tag"
      [ -f "$dst.jpg" ] || $PY blender/beyondchiavari_scene.py --theme "$t" --shot "$s" --still \
        --still-frame "$f" --frames "$FRAMES" --samples "$SAMPLES_STILL" --out "$dst"
    done
  done
done

for t in $THEMES; do
  for s in $CLIP_SHOTS; do
    mp4="$OUT/clips/$t-$s.mp4"
    [ -f "$mp4" ] && continue
    mkdir -p "$OUT/frames/$t-$s"
    $PY blender/beyondchiavari_scene.py --theme "$t" --shot "$s" --frames "$FRAMES" \
      --samples "$SAMPLES_CLIP" --width "$CLIP_W" --height "$CLIP_H" --out "$OUT/frames/$t-$s/f"
    # Upscale to 1080x1920 for Reels/Shorts, H.264 high quality, web-friendly
    ffmpeg -loglevel error -y -framerate 24 -i "$OUT/frames/$t-$s/f_%04d.png" \
      -vf "scale=1080:1920:flags=lanczos,format=yuv420p" -c:v libx264 -crf 18 -preset slow \
      -movflags +faststart "$mp4"
  done
done
echo "Done: $OUT"
