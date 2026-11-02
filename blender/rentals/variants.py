"""Extra views: a second camera angle for every rental item, plus colour/finish variants.

Variant slugs are '<parent>--<variant>' and live in the parent's folder, e.g.
public/rentals/chairs/velvet-dining--blush.webp. The manifest records `parent` and `variant`.
Rendered at 1200px (product) to keep render time reasonable.
"""

import chairs as C
import collection_chairs as CC
import lib
import tables as T
from catalog import ITEMS, item

IN = 0.0254
FT = 0.3048
EXTRA = dict(px=1200, samples=28)


def _variant(parent, key, build, alt, caption, cam=None, **kw):
    p = ITEMS[parent]
    opts = {k: v for k, v in p.items() if k in ("env", "lawn", "studio_scale", "aspect")}
    opts.update(EXTRA)
    opts.update(kw)
    item(f"{parent}--{key}", p["cat"], build, alt, caption, cam=cam or p.get("cam", {}), parent=parent, variant=key, **opts)


# --- Colour and finish variants -------------------------------------------------

def wood(name, light, dark, stretch=(6, 6, 1)):
    return lambda: lib.wood(name, light, dark, stretch=stretch)


VARIANTS = [
    ("gold-chiavari", "mahogany", lambda: C.build_chiavari(frame_mat=lib.wood("Mahogany", (0.30, 0.10, 0.06), (0.18, 0.06, 0.03), stretch=(6, 6, 1))),
     "3D render of a mahogany wood Chiavari chair with an ivory cushion for classic and fall weddings", "Mahogany Chiavari chair"),
    ("gold-chiavari", "fruitwood", lambda: C.build_chiavari(frame_mat=lib.wood("Fruitwood", (0.62, 0.38, 0.18), (0.45, 0.26, 0.12), stretch=(6, 6, 1))),
     "3D render of a fruitwood (honey) Chiavari chair with an ivory cushion for rustic and garden weddings", "Fruitwood Chiavari chair"),
    ("gold-chiavari", "black", lambda: C.build_chiavari(frame_mat=lib.mat("BlackLacquer", (0.02, 0.02, 0.02), 0.0, 0.2, **{"Coat Weight": 0.6}), cushion=lib.BLACK),
     "3D render of a black Chiavari chair with a black cushion for modern black-tie events", "Black Chiavari chair"),
    ("crossback", "natural", lambda: C.build_crossback(w=lib.wood("Oak", (0.70, 0.52, 0.32), (0.55, 0.40, 0.24), stretch=(8, 8, 1))),
     "3D render of a natural oak crossback chair with a rattan seat for barn and vineyard weddings", "Crossback chair in natural oak"),
    ("crossback", "black", lambda: C.build_crossback(w=lib.mat("MatteBlack", (0.03, 0.03, 0.03), 0.0, 0.5)),
     "3D render of a matte black crossback chair with a rattan seat for modern farmhouse events", "Crossback chair in matte black"),
    ("ghost", "smoke", lambda: C.build_ghost(tint=(0.45, 0.47, 0.50)),
     "3D render of a smoke grey Louis ghost chair with an oval medallion back for moody, modern receptions", "Smoke ghost chair"),
    ("velvet-dining", "blush", lambda: CC.velvet_dining(lib.mat("BlushVelvet", (0.75, 0.42, 0.40), 0.0, 0.8, **{"Sheen Weight": 0.6})),
     "3D render of a blush pink velvet dining chair with gold legs for romantic head tables and bridal showers", "Velvet dining chair in blush"),
    ("velvet-dining", "navy", lambda: CC.velvet_dining(lib.mat("NavyVelvet", (0.02, 0.03, 0.09), 0.0, 0.8, **{"Sheen Weight": 0.6, "Sheen Tint": (0.4, 0.5, 0.9)})),
     "3D render of a navy velvet dining chair with gold legs for winter weddings and galas", "Velvet dining chair in navy"),
    ("velvet-dining", "champagne", lambda: CC.velvet_dining(lib.mat("ChampVelvet", (0.62, 0.50, 0.34), 0.0, 0.8, **{"Sheen Weight": 0.6})),
     "3D render of a champagne velvet dining chair with gold legs for elegant receptions", "Velvet dining chair in champagne"),
    ("shell", "terracotta", lambda: CC.shell(lib.mat("Terracotta", (0.55, 0.18, 0.10), 0.0, 0.35, **{"Coat Weight": 0.3})),
     "3D render of a terracotta molded shell chair on maple legs for boho and desert-palette events", "Shell chair in terracotta"),
    ("shell", "sage", lambda: CC.shell(lib.mat("SageShell", (0.32, 0.42, 0.30), 0.0, 0.35, **{"Coat Weight": 0.3})),
     "3D render of a sage green molded shell chair on maple legs for garden parties and showers", "Shell chair in sage"),
    ("shell", "black", lambda: CC.shell(lib.mat("BlackShell", (0.02, 0.02, 0.02), 0.0, 0.3, **{"Coat Weight": 0.3})),
     "3D render of a black molded shell chair on maple legs for corporate events and launches", "Shell chair in black"),
    ("windsor", "walnut", lambda: CC.windsor(lib.wood("WalnutW", (0.30, 0.17, 0.09), (0.18, 0.10, 0.05), stretch=(6, 6, 1))),
     "3D render of a walnut Windsor spindle chair with a bow back for rustic dinners", "Windsor chair in walnut"),
    ("windsor", "sage", lambda: CC.windsor(lib.mat("SagePaint", (0.38, 0.46, 0.34), 0.0, 0.45)),
     "3D render of a sage painted Windsor spindle chair for garden and farmhouse weddings", "Windsor chair in sage"),
    ("wishbone", "black", lambda: CC.wishbone(lib.mat("BlackOak", (0.03, 0.03, 0.03), 0.0, 0.45)),
     "3D render of a black wishbone chair with a natural cord seat for modern dinners", "Wishbone chair in black"),
    ("cane-back", "black", lambda: CC.cane_back(lib.mat("BlackCane", (0.03, 0.03, 0.03), 0.0, 0.4)),
     "3D render of a black cane-back chair with a woven cane panel and linen cushion", "Cane-back chair in black"),
    ("bentwood", "natural", lambda: CC.bentwood(lib.wood("NaturalB", (0.62, 0.42, 0.24), (0.48, 0.32, 0.18))),
     "3D render of a natural wood bentwood bistro chair with a hoop back", "Bentwood chair in natural"),
    ("bentwood", "black", lambda: CC.bentwood(lib.mat("BlackBent", (0.03, 0.03, 0.03), 0.0, 0.4)),
     "3D render of a black bentwood bistro chair with a hoop back for Parisian-cafe themes", "Bentwood chair in black"),
    ("louis-medallion", "grey-silver", lambda: CC.louis_medallion(lib.mat("GreyFrame", (0.45, 0.46, 0.48), 0.3, 0.35)),
     "3D render of a grey and silver Louis medallion chair with an upholstered oval back", "Louis medallion chair in grey & silver"),
    ("infinity", "silver", lambda: CC.infinity(lib.silver_metal(0.2)),
     "3D render of a silver infinity chair with a looped back and ivory cushion", "Silver infinity chair"),
    ("infinity", "black", lambda: CC.infinity(lib.mat("BlackMetalI", (0.03, 0.03, 0.03), 0.7, 0.3)),
     "3D render of a black infinity chair with a looped back and ivory cushion", "Black infinity chair"),
]

SASH = [("sage", lib.SAGE), ("navy", (0.05, 0.08, 0.22)), ("champagne", (0.82, 0.70, 0.50)), ("burgundy", (0.35, 0.03, 0.07)), ("dusty-blue", (0.45, 0.56, 0.68))]
for key, col in SASH:
    VARIANTS.append(("chair-sash", key, (lambda c: lambda: C.build_chiavari(sash=c))(col),
                     f"3D render of a gold Chiavari chair dressed with a {key.replace('-', ' ')} chiffon sash tied in a bow",
                     f"{key.replace('-', ' ').capitalize()} chiffon chair sash"))

LINEN_COLOURS = [("black", (0.02, 0.02, 0.022)), ("navy", (0.04, 0.06, 0.16)), ("blush", lib.BLUSH), ("sage", lib.SAGE),
                 ("burgundy", (0.32, 0.03, 0.06)), ("champagne", (0.82, 0.72, 0.55)), ("white", lib.WHITE), ("dusty-blue", (0.45, 0.56, 0.68))]
for key, col in LINEN_COLOURS:
    label = key.replace("-", " ")
    VARIANTS.append(("round-floor-length", key, (lambda c: lambda: (T.build_round(30 * IN), T.round_cloth(30 * IN, 30 * IN, 30 * IN, T.linen(c))))(col),
                     f"3D render of a {label} 120-inch round tablecloth draped floor-length over a 60-inch round table",
                     f"120\" round tablecloth in {label}"))
for key, col in LINEN_COLOURS[:4]:
    label = key.replace("-", " ")
    VARIANTS.append(("banquet-floor-length", key, (lambda c: lambda: (T.build_banquet(8 * FT), T.rect_cloth(8 * FT, 30 * IN, 30 * IN, 30 * IN, T.linen(c))))(col),
                     f"3D render of a {label} 90 by 156 inch tablecloth draped floor-length over an 8-foot banquet table",
                     f"Banquet tablecloth in {label}"))
for key, col in (("black", (0.02, 0.02, 0.022)), ("navy", (0.04, 0.06, 0.16)), ("blush", lib.BLUSH)):
    VARIANTS.append(("spandex-highboy", key, (lambda c: lambda: T.build_spandex_highboy(c))(col),
                     f"3D render of a {key} fitted spandex cover on a cocktail highboy table", f"Spandex highboy cover in {key}"))
for key, col in (("blush", (0.86, 0.56, 0.56)), ("burgundy", (0.35, 0.03, 0.07)), ("dusty-blue", (0.45, 0.56, 0.68)), ("champagne", (0.82, 0.70, 0.50))):
    label = key.replace("-", " ")
    VARIANTS.append(("table-runner", key, (lambda c: lambda: (T.build_banquet(8 * FT), T.rect_cloth(8 * FT, 30 * IN, 30 * IN, 30 * IN, T.linen()), T.build_runner(8 * FT, 0.35, c)))(col),
                     f"3D render of a {label} chiffon table runner over an ivory floor-length linen on an 8-foot banquet table",
                     f"{label.capitalize()} chiffon table runner"))
VARIANTS.append(("sequin-overlay", "silver", lambda: (T.build_round(30 * IN), T.round_cloth(30 * IN, 30 * IN, 30 * IN, lib.sequin((0.80, 0.80, 0.82)), seed=7)),
                 "3D render of a silver sequin round tablecloth draped floor-length over a 60-inch round table", "Silver sequin tablecloth"))
VARIANTS.append(("sequin-overlay", "rose-gold", lambda: (T.build_round(30 * IN), T.round_cloth(30 * IN, 30 * IN, 30 * IN, lib.sequin((0.88, 0.58, 0.48)), seed=7)),
                 "3D render of a rose gold sequin round tablecloth draped floor-length over a 60-inch round table", "Rose gold sequin tablecloth"))

for parent, key, build, alt, cap in VARIANTS:
    _variant(parent, key, build, alt, cap)


# --- A second camera angle for every product ----------------------------------------

for slug in [s for s, it in list(ITEMS.items()) if it["cat"] != "scenes" and "parent" not in it]:
    p = ITEMS[slug]
    cam = dict(p.get("cam", {}))
    az = cam.get("az", -35)
    cam["az"] = 40 if az < 0 else -40
    cam["el"] = min(cam.get("el", 18) + 12, 55)
    first = p["alt"].replace("3D render of ", "", 1)
    _variant(slug, "angle", p["build"], f"Another angle: 3D render of {first}", p["caption"] + " (side view)", cam=cam)
