"""Dinnerware, flatware, glassware and catering equipment."""

import math

import bmesh
from mathutils import Matrix, Vector

import lib
from catalog import item
from lib import add_beam, add_box, add_disc, add_rod, add_sphere, bevel, lathe, mat, mesh_object, subsurf

IN = 0.0254


def china():
    return lib.china()


def plate(r, rim=0.02, well=0.012, x=0, y=0, z=0, m=None, name="Plate"):
    bm = bmesh.new()
    inner = r * 0.62
    lathe(bm, [(0.0, 0.0), (inner * 0.9, 0.0), (inner, 0.002), (inner * 1.05, well), (r - rim, well + 0.006), (r, well + 0.010)],
          96, center=(x, y, z), thickness=0.004)
    ob = mesh_object(name, bm, m or china())
    subsurf(ob, 1)
    return ob


def charger(x=0, y=0, z=0, m=None):
    bm = bmesh.new()
    lathe(bm, [(0.0, 0.0), (0.15, 0.0), (0.165, 0.008), (0.167, 0.012)], 96, center=(x, y, z), thickness=0.003)
    rim = bmesh.new()
    for i in range(96):  # beaded rim
        a = 2 * math.pi * i / 96
        add_sphere(rim, (x + 0.160 * math.cos(a), y + 0.160 * math.sin(a), z + 0.012), 0.0045, subdiv=1)
    g = m or lib.gold_metal(0.25)
    mesh_object("Charger", bm, g)
    mesh_object("Beads", rim, g)


def bowl(r=0.11, h=0.06, x=0, y=0, z=0):
    bm = bmesh.new()
    lathe(bm, [(0, 0), (r * 0.42, 0), (r * 0.45, 0.008), (r * 0.8, h * 0.45), (r, h)], 96, center=(x, y, z), thickness=0.004)
    ob = mesh_object("Bowl", bm, china())
    subsurf(ob, 1)


def cup_saucer():
    plate(0.075, rim=0.012, well=0.006, name="Saucer")
    bm = bmesh.new()
    lathe(bm, [(0, 0.008), (0.025, 0.008), (0.03, 0.012), (0.04, 0.035), (0.046, 0.07)], 64, thickness=0.003)
    mesh_object("Cup", bm, china())
    h = bmesh.new()
    lib.add_ring(h, (0.052, 0, 0.043), (0, 1, 0), 0.016, 0.004, segs=24, ring=8)
    mesh_object("Handle", h, china())


def _flat_profile(bm, pts, width_fn, thick, z=0.0):
    """Extrude a flat utensil outline: pts along X, width_fn(t) gives half-width, slight arch in Z."""
    n = len(pts)
    top, bot = [], []
    for i, (x, zz) in enumerate(pts):
        w = width_fn(i / (n - 1))
        top.append((bm.verts.new((x, -w, z + zz + thick)), bm.verts.new((x, w, z + zz + thick))))
        bot.append((bm.verts.new((x, -w, z + zz)), bm.verts.new((x, w, z + zz))))
    for i in range(n - 1):
        bm.faces.new((top[i][0], top[i][1], top[i + 1][1], top[i + 1][0]))
        bm.faces.new((bot[i][0], bot[i + 1][0], bot[i + 1][1], bot[i][1]))
        bm.faces.new((top[i][0], top[i + 1][0], bot[i + 1][0], bot[i][0]))
        bm.faces.new((top[i][1], bot[i][1], bot[i + 1][1], top[i + 1][1]))
    bm.faces.new((top[0][0], bot[0][0], bot[0][1], top[0][1]))
    bm.faces.new((top[-1][0], top[-1][1], bot[-1][1], bot[-1][0]))


def utensil(kind, y=0.0, m=None, rot=0.0):
    bm = bmesh.new()
    L = {"dinner-fork": 0.20, "salad-fork": 0.17, "dinner-knife": 0.235, "teaspoon": 0.15}[kind]
    n = 40
    xs = [(-L / 2 + L * i / n) for i in range(n + 1)]
    if kind == "dinner-knife":
        prof = [(x, 0.006 * math.sin(math.pi * (i / n))) for i, x in enumerate(xs)]
        wf = lambda t: 0.0075 if t < 0.55 else 0.0115 * (1 - ((t - 0.55) / 0.45) ** 3) + 0.0015  # noqa: E731
    elif kind == "teaspoon":
        prof = [(x, 0.008 * math.sin(math.pi * i / n) + (0.006 if i / n > 0.7 else 0)) for i, x in enumerate(xs)]
        wf = lambda t: 0.0065 if t < 0.65 else 0.019 * math.sin(math.pi * min((t - 0.6) / 0.42, 1.0)) + 0.004  # noqa: E731
    else:
        prof = [(x, 0.007 * math.sin(math.pi * i / n) + (0.004 if i / n > 0.75 else 0)) for i, x in enumerate(xs)]
        wf = lambda t: 0.0068 if t < 0.62 else 0.006 + 0.0062 * min((t - 0.62) / 0.12, 1.0)  # noqa: E731
    _flat_profile(bm, prof, wf, 0.0022)
    if kind.endswith("fork"):
        # cut tines: add 3 thin slots by placing dark gaps is costly; instead model tines as separate beams
        bm2 = bm
        x0 = xs[int(n * 0.86)]
        for k in range(4):
            yy = -0.0102 + k * 0.0068
            add_beam(bm2, (x0, yy, prof[int(n * 0.86)][1] + 0.001), (L / 2 + 0.012, yy, prof[-1][1] + 0.003), 0.0028, 0.0022)
        # shorten the solid head so tines show
    ob = mesh_object(kind, bm, m or lib.silver_metal(0.15))
    ob.location = (0, y, 0.0)
    ob.rotation_euler = (0, 0, rot)
    bevel(ob, 0.0008, 1)
    return ob


def place_flatware(m=None):
    for kind, x in (("salad-fork", -0.066), ("dinner-fork", -0.03), ("dinner-knife", 0.03), ("teaspoon", 0.066)):
        ob = utensil(kind, 0.0, m, math.pi / 2)
        ob.location = (x, 0, 0)


def stemware(profile, name="Glass"):
    bm = bmesh.new()
    # Single-surface shell with a thin-walled glass shader: renders clean, bright crystal in Cycles
    # (a modelled double wall goes dark from total internal reflection at the rim).
    lathe(bm, profile, 96, cap=False)
    return mesh_object(name, bm, lib.mat("ThinGlass", (1, 1, 1), 0.0, 0.02, **{"Transmission Weight": 1.0, "IOR": 1.5, "Thin Wall": True}))


GLASSES = {
    "water-goblet": [(0, 0), (0.042, 0), (0.042, 0.003), (0.006, 0.008), (0.005, 0.07), (0.03, 0.085), (0.045, 0.12), (0.044, 0.175)],
    "wine-glass": [(0, 0), (0.038, 0), (0.038, 0.003), (0.004, 0.008), (0.0035, 0.09), (0.03, 0.105), (0.043, 0.15), (0.034, 0.215)],
    "champagne-flute": [(0, 0), (0.034, 0), (0.034, 0.003), (0.0035, 0.008), (0.003, 0.10), (0.018, 0.115), (0.025, 0.17), (0.023, 0.235)],
    "rocks-glass": [(0, 0), (0.042, 0), (0.044, 0.012), (0.044, 0.09)],
    "highball-glass": [(0, 0), (0.033, 0), (0.034, 0.012), (0.036, 0.15)],
    "pilsner-glass": [(0, 0), (0.028, 0), (0.03, 0.014), (0.033, 0.06), (0.042, 0.19), (0.043, 0.21)],
}


def black_cards(spread=0.42, h=0.4):
    """Product-photography flags: matte black cards just out of frame give clear glass its dark edge lines."""
    bm = bmesh.new()
    for sx in (-1, 1):
        add_box(bm, (sx * spread, 0.02, h / 2), (0.02, 0.3, h), rot_z=sx * 0.3)
    mesh_object("Flags", bm, mat("Flag", (0.01, 0.01, 0.01), 0.0, 0.9))


def glass_shot(slug):
    stemware(GLASSES[slug], slug).location.z = 0.0008
    black_cards()


# ---------------------------------------------------------------------------
# Catering equipment
# ---------------------------------------------------------------------------


def chafing_dish():
    st = lib.steel(0.12)
    bm = bmesh.new()
    # rectangular stand
    for sx in (-1, 1):
        lib.add_polyline(bm, [(sx * 0.30, -0.18, 0), (sx * 0.30, -0.18, 0.22), (sx * 0.30, 0.18, 0.22), (sx * 0.30, 0.18, 0)], 0.008)
    for sy in (-1, 1):
        add_rod(bm, (-0.30, sy * 0.18, 0.22), (0.30, sy * 0.18, 0.22), 0.008)
    mesh_object("Stand", bm, st)
    pan = bmesh.new()
    add_box(pan, (0, 0, 0.19), (0.56, 0.32, 0.07))
    po = mesh_object("Pan", pan, st)
    bevel(po, 0.015, 3)
    # roll-top style domed lid
    lid = bmesh.new()
    rows = []
    for k in range(25):
        a = math.pi * k / 24
        y, z = -0.165 * math.cos(a), 0.225 + 0.10 * math.sin(a)
        rows.append((lid.verts.new((-0.28, y, z)), lid.verts.new((0.28, y, z))))
    for k in range(24):
        lid.faces.new((rows[k][0], rows[k][1], rows[k + 1][1], rows[k + 1][0]))
    for sx in (-0.28, 0.28):
        cap = [lid.verts.new((sx, -0.165 * math.cos(math.pi * k / 24), 0.225 + 0.10 * math.sin(math.pi * k / 24))) for k in range(25)]
        lid.faces.new(cap if sx > 0 else list(reversed(cap)))
    lo = mesh_object("Lid", lid, st)
    sol = lo.modifiers.new("Solid", "SOLIDIFY")
    sol.thickness = 0.003
    h = bmesh.new()
    add_rod(h, (-0.06, 0, 0.33), (0.06, 0, 0.33), 0.008)
    for sx in (-0.06, 0.06):
        add_rod(h, (sx, 0, 0.33), (sx, 0, 0.32), 0.006)
    mesh_object("Handle", h, lib.gold_metal())
    fuel = bmesh.new()
    for sx in (-0.12, 0.12):
        lathe(fuel, [(0, 0), (0.035, 0), (0.035, 0.06), (0, 0.06)], 24, center=(sx, 0, 0.02))
    mesh_object("Fuel", fuel, mat("Fuel", (0.05, 0.15, 0.35), 0.4, 0.3))


def beverage_dispenser():
    bm = bmesh.new()
    lathe(bm, [(0, 0), (0.08, 0), (0.085, 0.02), (0.06, 0.06), (0.06, 0.07)], 48)
    mesh_object("Base", bm, lib.silver_metal(0.2))
    jar = bmesh.new()
    lathe(jar, [(0, 0.07), (0.10, 0.07), (0.115, 0.12), (0.115, 0.40), (0.09, 0.44), (0.085, 0.45)], 64, cap=False)
    mesh_object("Jar", jar, lib.thin_glass())
    liq = bmesh.new()
    lathe(liq, [(0, 0.078), (0.10, 0.078), (0.11, 0.12), (0.11, 0.33), (0, 0.33)], 64)
    mesh_object("Lemonade", liq, mat("Lemonade", (0.98, 0.85, 0.45), 0.0, 0.05, **{"Transmission Weight": 1.0, "IOR": 1.33}))
    lid = bmesh.new()
    lathe(lid, [(0, 0.47), (0.09, 0.45), (0.092, 0.445)], 48)
    add_sphere(lid, (0, 0, 0.48), 0.015)
    mesh_object("Lid", lid, lib.silver_metal(0.2))
    sp = bmesh.new()
    add_rod(sp, (0, -0.11, 0.11), (0, -0.16, 0.11), 0.012)
    add_rod(sp, (0, -0.15, 0.11), (0, -0.15, 0.08), 0.008)
    add_box(sp, (0, -0.155, 0.135), (0.012, 0.03, 0.04))
    mesh_object("Spigot", sp, lib.silver_metal(0.15))
    fruit = bmesh.new()
    for i in range(7):
        a = i * 2.4
        add_disc(fruit, (0.05 * math.cos(a), 0.05 * math.sin(a), 0.12 + i * 0.03), 0.032, 0.006, 32)
    mesh_object("Lemons", fruit, mat("LemonSlice", (0.98, 0.90, 0.35), 0.0, 0.5, **{"Subsurface Weight": 0.5}))


def coffee_urn():
    st = lib.steel(0.15)
    bm = bmesh.new()
    lathe(bm, [(0, 0), (0.13, 0), (0.135, 0.02), (0.12, 0.06), (0.13, 0.08), (0.13, 0.52), (0.12, 0.55), (0, 0.56)], 64)
    mesh_object("Urn", bm, st)
    d = bmesh.new()
    add_rod(d, (0, -0.13, 0.12), (0, -0.19, 0.12), 0.012)
    add_box(d, (0, -0.19, 0.14), (0.02, 0.025, 0.05))
    add_sphere(d, (0, 0, 0.58), 0.025)
    for sx in (-1, 1):
        lib.add_ring(d, (sx * 0.14, 0, 0.45), (1, 0, 0), 0.03, 0.006, segs=16, ring=6, scale=(1, 1.6))
    mesh_object("Fittings", d, lib.black_metal())
    g = bmesh.new()
    add_rod(g, (0, -0.135, 0.18), (0, -0.135, 0.45), 0.01)
    mesh_object("Gauge", g, lib.glass())


def serving_tray():
    bm = bmesh.new()
    lathe(bm, [(0, 0), (0.18, 0), (0.19, 0.008), (0.20, 0.022), (0.205, 0.024)], 96, thickness=0.003)
    ob = mesh_object("Tray", bm, lib.silver_metal(0.12))
    subsurf(ob, 1)
    for x, y in ((-0.06, -0.03), (0.0, 0.05), (0.06, -0.03)):
        ob = stemware(GLASSES["champagne-flute"], "Flute")
        ob.location = (x, y, 0.004)
        liq = bmesh.new()
        lathe(liq, [(0, 0.12), (0.017, 0.118), (0.022, 0.17), (0.0, 0.17)], 32, center=(x, y, 0.004))
        mesh_object("Bubbly", liq, mat("Champagne", (0.98, 0.88, 0.55), 0.0, 0.05, **{"Transmission Weight": 1.0, "IOR": 1.33}))


def cake_stand():
    bm = bmesh.new()
    lathe(bm, [(0, 0), (0.10, 0), (0.10, 0.008), (0.03, 0.03), (0.02, 0.09), (0.04, 0.10), (0.16, 0.105), (0.165, 0.115), (0, 0.115)], 96)
    mesh_object("Stand", bm, lib.gold_metal(0.25))
    cake = bmesh.new()
    lathe(cake, [(0, 0.115), (0.13, 0.115), (0.13, 0.215), (0.0, 0.215)], 96)
    lathe(cake, [(0, 0.215), (0.09, 0.215), (0.09, 0.30), (0.0, 0.30)], 96)
    ob = mesh_object("Cake", cake, mat("Fondant", (0.96, 0.94, 0.90), 0.0, 0.5, **{"Subsurface Weight": 0.3}))
    bevel(ob, 0.006, 3)
    fl = bmesh.new()
    import random
    rng = random.Random(2)
    for i in range(7):
        a = rng.uniform(-0.6, 0.6) - 1.4
        lib.bloom(fl, Vector((0.09 * math.cos(a), 0.09 * math.sin(a), 0.3 + rng.uniform(0, 0.02))), 0.025, rng)
    mesh_object("Roses", fl, mat("Rose", (0.96, 0.78, 0.76), 0.0, 0.55, **{"Subsurface Weight": 0.3}))


def portable_bar():
    """Portable bar: white front panel with brass trim, black top, back shelf."""
    L, D, H = 1.8, 0.6, 1.07
    bm = bmesh.new()
    add_box(bm, (0, 0, H / 2), (L, D, H - 0.04))
    body = mesh_object("Body", bm, lib.plastic((0.92, 0.91, 0.88), 0.4))
    bevel(body, 0.01, 2)
    t = bmesh.new()
    add_box(t, (0, -0.03, H), (L + 0.08, D + 0.14, 0.04))
    to = mesh_object("Top", t, lib.marble((0.12, 0.12, 0.13), (0.30, 0.30, 0.31)))
    bevel(to, 0.006, 3)
    trim = bmesh.new()
    for z in (0.08, H - 0.06):
        add_box(trim, (0, -D / 2 - 0.002, z), (L, 0.006, 0.02))
    for i in range(7):
        x = -L / 2 + 0.15 + i * (L - 0.3) / 6
        add_box(trim, (x, -D / 2 - 0.004, H / 2), (0.012, 0.008, H - 0.2))
    mesh_object("Trim", trim, lib.gold_metal(0.2))
    gl = []
    for i, k in enumerate(("wine-glass", "champagne-flute", "rocks-glass", "wine-glass", "champagne-flute")):
        ob = stemware(GLASSES[k], k)
        ob.location = (-0.5 + i * 0.25, -0.15, H + 0.02)


# ---------------------------------------------------------------------------

DISH_CAM = dict(az=-20, el=42, lens=100, pad=1.12)
SMALL_CAM = dict(az=-25, el=22, lens=100, pad=1.25)


def silver_flatware(kind):
    return lambda: utensil(kind)


item("charger-plate", "tableware", lambda: charger(),
     "3D render of a 13-inch gold beaded charger plate for wedding place settings", "Gold beaded charger plate", cam=DISH_CAM)
item("dinner-plate", "tableware", lambda: plate(0.135),
     "3D render of a 10.5-inch white china dinner plate for weddings and catered events", "White china dinner plate", cam=DISH_CAM)
item("salad-plate", "tableware", lambda: plate(0.105, rim=0.016),
     "3D render of an 8-inch white china salad plate", "White china salad plate", cam=DISH_CAM)
item("bread-plate", "tableware", lambda: plate(0.08, rim=0.012, well=0.008),
     "3D render of a 6-inch white china bread and butter plate", "White china bread plate", cam=DISH_CAM)
item("soup-bowl", "tableware", lambda: bowl(),
     "3D render of a white china soup bowl for plated dinners", "White china soup bowl", cam=dict(az=-20, el=30, lens=100, pad=1.2))
item("coffee-cup-saucer", "tableware", cup_saucer,
     "3D render of a white china coffee cup and saucer for dessert and coffee service", "White coffee cup and saucer", cam=dict(az=-30, el=22, lens=100, pad=1.2))
for k, label in (("dinner-fork", "dinner fork"), ("salad-fork", "salad fork"), ("dinner-knife", "dinner knife"), ("teaspoon", "teaspoon")):
    item(k, "tableware", silver_flatware(k), f"3D render of a polished stainless steel {label} for event place settings",
         f"Stainless {label}", cam=dict(az=-15, el=50, lens=100, pad=1.15))
item("gold-flatware", "tableware", lambda: place_flatware(lib.gold_metal(0.18)),
     "3D render of a gold flatware set with salad fork, dinner fork, knife and teaspoon for glam wedding tables",
     "Gold flatware set", cam=dict(az=-10, el=55, lens=100, pad=1.15))
for k, label in (("water-goblet", "water goblet"), ("wine-glass", "wine glass"), ("champagne-flute", "champagne flute"),
                 ("rocks-glass", "rocks glass"), ("highball-glass", "highball glass"), ("pilsner-glass", "pilsner beer glass")):
    item(k, "tableware", (lambda kk: lambda: glass_shot(kk))(k), f"3D render of a clear crystal {label} for weddings, bars and catered events",
         label.capitalize(), cam=SMALL_CAM)

item("chafing-dish", "catering", chafing_dish,
     "3D render of a stainless steel roll-top chafing dish with fuel cans for keeping buffet food hot",
     "Roll-top chafing dish", cam=dict(az=-30, el=22, lens=85, pad=1.15))
item("beverage-dispenser", "catering", beverage_dispenser,
     "3D render of a glass beverage dispenser filled with lemonade on a silver stand", "Glass beverage dispenser", cam=SMALL_CAM)
item("coffee-urn", "catering", coffee_urn,
     "3D render of a stainless steel 100-cup coffee urn for catered events", "100-cup coffee urn", cam=SMALL_CAM)
item("serving-tray", "catering", serving_tray,
     "3D render of a round silver serving tray with three champagne flutes for passed drinks", "Silver serving tray", cam=dict(az=-25, el=28, lens=100, pad=1.2))
item("cake-stand", "catering", cake_stand,
     "3D render of a gold pedestal cake stand holding a two-tier white wedding cake with blush roses", "Gold cake stand", cam=SMALL_CAM)
item("portable-bar", "catering", portable_bar,
     "3D render of a 6-foot portable event bar with a white front, brass trim and black stone top", "6 ft portable bar", cam=dict(az=-28, el=14, lens=70, pad=1.12))
