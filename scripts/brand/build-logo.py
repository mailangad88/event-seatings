"""Build the Beyond Chiavari logo files.

Writes SVGs to public/brand/ and the React logo paths to src/components/brand/logo-paths.ts.
The wordmark is drawn from the site's own font files (Cormorant Garamond 500 for the name,
Inter 600 for the line under it) and turned into outlines, so the logo looks the same
everywhere and never waits for a web font.

Run:  pip install fonttools brotli && python3 scripts/brand/build-logo.py
Then: node scripts/brand/render-logo-png.mjs   (PNG + favicon.ico exports)
"""
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[2]
FONTS = ROOT / "src/app/fonts"
OUT = ROOT / "public/brand"
TS_OUT = ROOT / "src/components/brand/logo-paths.ts"

# Brand colours (match src/app/globals.css)
WINE = "#7a1f2e"
WINE_DEEP = "#5c1521"
GOLD = "#835a12"
GOLD_BRIGHT = "#d9b26a"
ESPRESSO = "#2a1519"
CREAM = "#f6efe4"
CREAM_INK = "#f6ece2"

NAME = "BEYOND CHIAVARI"
TAGLINE = "EVENT RENTALS · CHICAGO"


# ---------------------------------------------------------------- type → paths
def load(name, wght=None):
    f = TTFont(FONTS / name)
    if wght is not None and "fvar" in f:
        f = instancer.instantiateVariableFont(f, {"wght": wght})
    return f


SERIF = load("cormorant-garamond-latin-500-normal.woff2")
SANS = load("inter-latin-wght-normal.woff2", 600)


def text_path(font, text, size, track_em=0.0, x0=0.0, baseline=0.0):
    scale = size / font["head"].unitsPerEm
    cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]
    pen = SVGPathPen(gs, ntos=lambda v: f"{round(v, 2):g}")
    x = x0
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        x += hmtx[g][0] * scale + (track_em * size if i < len(text) - 1 else 0)
    return pen.getCommands(), x - x0


def cap(font, size):
    return font["OS/2"].sCapHeight * size / font["head"].unitsPerEm


# ---------------------------------------------------------------- the mark
# A front view of a Chiavari chair (ladder back with spindles, slim seat, splayed legs)
# standing inside an arched doorway: the classic chair, and the "beyond" past it.
ARCH = "M8 60V29a24 24 0 0 1 48 0v31z"
ARCH_LINE = "M12.5 60V29a19.5 19.5 0 0 1 39 0v31"


# Full-detail chair: heavy strokes (posts, legs, top and first rails) and light strokes
# (second rail, spindles in two ladder bands, leg stretcher), plus the seat and post finials.
CHAIR_THICK = "M24 18.5V41.5L22.6 54.5M40 18.5V41.5L41.4 54.5M24 20.2Q32 17.4 40 20.2M24 26.6H40"
CHAIR_THIN = "M24 32.6H40M28 19.6V26.6M32 19V26.6M36 19.6V26.6M28 26.6V32.6M32 26.6V32.6M36 26.6V32.6M23.2 49H40.8"
# Favicon chair: one ladder band and two spindles so it still reads at 16px.
FAV_THICK = "M24 18.5V41.5L22.6 54.5M40 18.5V41.5L41.4 54.5M24 20.2Q32 17.4 40 20.2M24 27.5H40M23.2 49H40.8"
FAV_THIN = "M29.3 19.4V27.5M34.7 19.4V27.5"
SEAT = dict(x=20.5, y=39.4, width=23, height=3.6, rx=1.8)
FINIALS = [(24, 17.6), (40, 17.6)]
FINIAL_R = 1.6
THIN_RATIO = 0.62


def chair(color, w=2.0, detail=True):
    """Chair drawn as strokes on a 64x64 grid."""
    thick, thin, tw = (CHAIR_THICK, CHAIR_THIN, w * THIN_RATIO) if detail else (FAV_THICK, FAV_THIN, w * 0.8)
    cap_ = 'stroke-linecap="round" stroke-linejoin="round" fill="none"'
    seat = " ".join(f'{k}="{v:g}"' for k, v in SEAT.items())
    out = (
        f'<path stroke="{color}" stroke-width="{w:g}" {cap_} d="{thick}"/>'
        f'<path stroke="{color}" stroke-width="{tw:.2f}" {cap_} d="{thin}"/>'
        f'<rect {seat} fill="{color}"/>'
    )
    if detail:
        out += "".join(f'<circle cx="{x}" cy="{y}" r="{FINIAL_R}" fill="{color}"/>' for x, y in FINIALS)
    return out


def mark(bg, fg, line=None, detail=True, w=2.0):
    out = f'<path d="{ARCH}" fill="{bg}"/>'
    if line and detail:
        out += f'<path d="{ARCH_LINE}" fill="none" stroke="{line}" stroke-width="0.9" opacity="0.55"/>'
    return out + chair(fg, w, detail)


def svg(w, h, body, title, vb=None):
    vb = vb or f"0 0 {w:g} {h:g}"
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w:g}" height="{h:g}" role="img" aria-label="{title}">'
        f"<title>{title}</title>{body}</svg>\n"
    )


# ---------------------------------------------------------------- lockups
NAME_SIZE, TAG_SIZE = 36, 10.5
name_d, name_w = text_path(SERIF, NAME, NAME_SIZE, 0.08)
tag_d, tag_w = text_path(SANS, TAGLINE, TAG_SIZE, 0.24)
NAME_CAP, TAG_CAP = cap(SERIF, NAME_SIZE), cap(SANS, TAG_SIZE)
GAP_LINES = 11


def wordmark(x, top, name_fill, tag_fill, center_w=None):
    """Name over tagline. If center_w is given both lines are centred in that width."""
    nx = x + ((center_w - name_w) / 2 if center_w else 0)
    tx = x + ((center_w - tag_w) / 2 if center_w else 0)
    nb = top + NAME_CAP
    tb = nb + GAP_LINES + TAG_CAP
    return (
        f'<path fill="{name_fill}" transform="translate({nx:.2f} {nb:.2f})" d="{name_d}"/>'
        f'<path fill="{tag_fill}" transform="translate({tx:.2f} {tb:.2f})" d="{tag_d}"/>'
    )


TEXT_H = NAME_CAP + GAP_LINES + TAG_CAP

THEMES = {
    "light": dict(bg=WINE, fg=GOLD_BRIGHT, line=GOLD_BRIGHT, name=ESPRESSO, tag=GOLD),
    "dark": dict(bg=GOLD_BRIGHT, fg=ESPRESSO, line=ESPRESSO, name=CREAM_INK, tag=GOLD_BRIGHT),
    "mono": dict(bg=ESPRESSO, fg=CREAM, line=CREAM, name=ESPRESSO, tag=ESPRESSO),
}


def horizontal(t):
    W = 64 + 18 + max(name_w, tag_w) + 2
    top = (64 - TEXT_H) / 2 + 2  # optical: arch is top-light
    body = mark(t["bg"], t["fg"], t["line"]) + wordmark(82, top, t["name"], t["tag"])
    return svg(round(W, 1), 64, body, "Beyond Chiavari")


def stacked(t):
    W = max(name_w, tag_w) + 8
    m = 96
    body = (
        f'<g transform="translate({(W - m) / 2:.2f} 0) scale(1.5)">{mark(t["bg"], t["fg"], t["line"])}</g>'
        + wordmark(4, m + 18, t["name"], t["tag"], center_w=W - 8)
    )
    return svg(round(W, 1), round(m + 18 + TEXT_H + 2, 1), body, "Beyond Chiavari")


def wordmark_only(t):
    W = max(name_w, tag_w) + 2
    return svg(round(W, 1), round(TEXT_H + 2, 1), wordmark(0, 1, t["name"], t["tag"]), "Beyond Chiavari")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = {}
    for k, t in THEMES.items():
        files[f"logo-horizontal-{k}.svg"] = horizontal(t)
        files[f"logo-stacked-{k}.svg"] = stacked(t)
        files[f"wordmark-{k}.svg"] = wordmark_only(t)
        files[f"mark-{k}.svg"] = svg(64, 64, mark(t["bg"], t["fg"], t["line"]), "Beyond Chiavari")
    # Favicon: simplified chair (two spindles, no finials or hairline), heavier strokes, arch fills the square.
    fav = f'<g transform="translate(-6.4 -6.8) scale(1.2)">{mark(WINE, GOLD_BRIGHT, detail=False, w=2.6)}</g>'
    files["favicon.svg"] = svg(64, 64, fav, "Beyond Chiavari")
    # App icon: wine square, cream hairline arch, gold chair (iOS rounds the corners itself).
    app = (
        f'<rect width="64" height="64" fill="{WINE}"/>'
        f'<g transform="translate(4.8 5) scale(0.85)"><path d="{ARCH}" fill="{WINE_DEEP}"/>'
        f'<path d="{ARCH_LINE}" fill="none" stroke="{GOLD_BRIGHT}" stroke-width="1" opacity="0.6"/>{chair(GOLD_BRIGHT, 2.1)}</g>'
    )
    files["app-icon.svg"] = svg(64, 64, app, "Beyond Chiavari")
    for name, content in files.items():
        (OUT / name).write_text(content)

    # Next.js picks up src/app/icon.svg as the favicon.
    (ROOT / "src/app/icon.svg").write_text(files["favicon.svg"])

    # Paths for the React <Logo>, coloured with currentColor / CSS tokens at runtime.
    TS_OUT.parent.mkdir(parents=True, exist_ok=True)
    TS_OUT.write_text(
        "// Generated by scripts/brand/build-logo.py. Do not edit by hand.\n"
        f"export const ARCH = {ARCH!r};\n"
        f"export const ARCH_LINE = {ARCH_LINE!r};\n"
        f"export const NAME_PATH = {name_d!r};\n"
        f"export const NAME_WIDTH = {name_w:.2f};\n"
        f"export const NAME_CAP = {NAME_CAP:.2f};\n"
        f"export const TAG_PATH = {tag_d!r};\n"
        f"export const TAG_WIDTH = {tag_w:.2f};\n"
        f"export const TAG_CAP = {TAG_CAP:.2f};\n"
        f"export const LINE_GAP = {GAP_LINES};\n"
        f"export const CHAIR_THICK = {CHAIR_THICK!r};\n"
        f"export const CHAIR_THIN = {CHAIR_THIN!r};\n"
        f"export const THIN_RATIO = {THIN_RATIO};\n"
        f"export const SEAT = {{ x: {SEAT['x']}, y: {SEAT['y']}, width: {SEAT['width']}, height: {SEAT['height']}, rx: {SEAT['rx']} }};\n"
        f"export const FINIALS = {[list(f) for f in FINIALS]};\n"
        f"export const FINIAL_R = {FINIAL_R};\n".replace("'", '"')
    )
    print("wrote", len(files), "SVGs; name", round(name_w), "tag", round(tag_w))


if __name__ == "__main__":
    main()
