"""Tables and table linens."""

import math
import random

import bmesh
from mathutils import Matrix, Vector

import chairs as C
import lib
from catalog import item
from lib import (
    IVORY, add_beam, add_box, add_disc, add_rod, add_sphere, bevel, fabric, lathe, mat, mesh_object, plank_wood, steel,
    subsurf,
)

IN = 0.0254
FT = 0.3048


def plywood_top():
    return lib.wood("Ply", (0.70, 0.55, 0.38), (0.55, 0.40, 0.26), 0.55)


def folding_legs_round(bm, r_top, h):
    """Two folding U-legs under a round banquet top."""
    for sx in (-1, 1):
        x = sx * r_top * 0.45
        foot_y = r_top * 0.55
        add_rod(bm, (x, -foot_y, 0.02), (x * 0.9, -r_top * 0.25, h - 0.03), 0.012)
        add_rod(bm, (x, foot_y, 0.02), (x * 0.9, r_top * 0.25, h - 0.03), 0.012)
        add_rod(bm, (x, -foot_y, 0.02), (x, foot_y, 0.02), 0.012)
        add_rod(bm, (x * 0.95, -r_top * 0.4, h * 0.45), (x * 0.95, r_top * 0.4, h * 0.45), 0.009)


def build_round(r, h=30 * IN, col=None):
    t = bmesh.new()
    add_disc(t, (0, 0, h - 0.02), r, 0.04, 96)
    ob = mesh_object("RoundTop", t, plywood_top(), collection=col)
    bevel(ob, 0.006, 3)
    edge = bmesh.new()
    lib.add_ring(edge, (0, 0, h - 0.02), (0, 0, 1), r, 0.021, segs=96, ring=8)
    mesh_object("Edge", edge, mat("EdgeVinyl", (0.18, 0.18, 0.18), 0.0, 0.4), collection=col)
    legs = bmesh.new()
    folding_legs_round(legs, r, h)
    mesh_object("Legs", legs, steel(), collection=col)


def build_banquet(length, width=30 * IN, h=30 * IN, col=None, top=None):
    t = bmesh.new()
    add_box(t, (0, 0, h - 0.02), (length, width, 0.04))
    ob = mesh_object("BanquetTop", t, top or plywood_top(), smooth=False, collection=col)
    bevel(ob, 0.008, 3)
    legs = bmesh.new()
    for sx in (-1, 1):
        x = sx * (length / 2 - 0.15)
        for sy in (-1, 1):
            add_rod(legs, (x, sy * (width / 2 - 0.06), 0.02), (x - sx * 0.04, sy * (width / 2 - 0.08), h - 0.04), 0.013)
        add_rod(legs, (x, -(width / 2 - 0.06), 0.02), (x, width / 2 - 0.06, 0.02), 0.013)
        add_rod(legs, (x - sx * 0.02, -(width / 2 - 0.07), h * 0.5), (x - sx * 0.02, width / 2 - 0.07, h * 0.5), 0.009)
        add_rod(legs, (x - sx * 0.02, 0, h * 0.5), (0 + sx * 0.25, 0, h - 0.04), 0.008)
    mesh_object("Legs", legs, steel(), collection=col)


def build_highboy(top_r=15 * IN, h=42 * IN, col=None, top_mat=None):
    t = bmesh.new()
    add_disc(t, (0, 0, h - 0.015), top_r, 0.03, 96)
    ob = mesh_object("HighboyTop", t, top_mat or plywood_top(), collection=col)
    bevel(ob, 0.005, 3)
    p = bmesh.new()
    add_rod(p, (0, 0, 0.03), (0, 0, h - 0.03), 0.032, segments=24)
    for a in range(4):
        ang = math.pi / 4 + a * math.pi / 2
        add_rod(p, (0, 0, 0.03), (math.cos(ang) * 0.30, math.sin(ang) * 0.30, 0.02), 0.018)
        add_sphere(p, (math.cos(ang) * 0.30, math.sin(ang) * 0.30, 0.012), 0.022, scale=(1, 1, 0.5))
    add_rod(p, (0, 0, h - 0.04), (0, 0, h - 0.10), 0.06, 0.035, segments=24)
    mesh_object("Pedestal", p, steel(0.3), collection=col)


def build_farm(col=None):
    L, W, H = 8 * FT, 40 * IN, 30 * IN
    wm = plank_wood()
    top = bmesh.new()
    n = 6
    for i in range(n):
        y = -W / 2 + W * (i + 0.5) / n
        add_box(top, (0, y, H - 0.025), (L, W / n - 0.004, 0.05))
    ob = mesh_object("Planks", top, wm, smooth=False, collection=col)
    bevel(ob, 0.006, 2)
    fr = bmesh.new()
    for sx in (-1, 1):
        for sy in (-1, 1):
            add_box(fr, (sx * (L / 2 - 0.12), sy * (W / 2 - 0.08), (H - 0.05) / 2), (0.09, 0.09, H - 0.05))
        add_box(fr, (sx * (L / 2 - 0.12), 0, H - 0.11), (0.05, W - 0.16, 0.10))
    for sy in (-1, 1):
        add_box(fr, (0, sy * (W / 2 - 0.08), H - 0.11), (L - 0.24, 0.04, 0.10))
    add_box(fr, (0, 0, 0.18), (L - 0.3, 0.06, 0.06))
    fo = mesh_object("FarmFrame", fr, wm, smooth=False, collection=col)
    bevel(fo, 0.004, 2)


# ---------------------------------------------------------------------------
# Linens
# ---------------------------------------------------------------------------


def round_cloth(r, h, drop, material, segs=420, seed=1):
    """Round tablecloth: flat top + skirt with soft gathered folds. drop = length of skirt."""
    bm = bmesh.new()
    rng = random.Random(seed)
    add_disc(bm, (0, 0, h + 0.004), r + 0.012, 0.01, 128)
    rows = []
    n_down = 18
    phases = [rng.uniform(0, 6.28) for _ in range(3)]
    for k in range(n_down + 1):
        t = k / n_down
        z = h + 0.002 - t * drop
        row = []
        for i in range(segs):
            a = 2 * math.pi * i / segs
            amp = (t ** 0.9)
            fold = (0.035 * math.sin(a * 26 + phases[0]) + 0.015 * math.sin(a * 9 + phases[1]) + 0.01 * math.sin(a * 47 + phases[2])) * amp
            rr = r + 0.012 + fold + 0.05 * t
            if z < 0.02:
                z = 0.005
                rr += 0.02
            row.append(bm.verts.new((rr * math.cos(a), rr * math.sin(a), z)))
        rows.append(row)
    for k in range(n_down):
        for i in range(segs):
            j = (i + 1) % segs
            bm.faces.new((rows[k][i], rows[k][j], rows[k + 1][j], rows[k + 1][i]))
    ob = mesh_object("RoundCloth", bm, material)
    s = ob.modifiers.new("Solid", "SOLIDIFY")
    s.thickness = 0.003
    return ob


def rect_cloth(length, width, h, drop, material, folds=0.012, name="Cloth"):
    bm = bmesh.new()
    add_box(bm, (0, 0, h + 0.005), (length + 0.03, width + 0.03, 0.01))
    hx, hy = length / 2 + 0.015, width / 2 + 0.015
    perim = 2 * (2 * hx + 2 * hy)
    n_around, n_down = 480, 16
    rows = []
    for k in range(n_down + 1):
        t = k / n_down
        z = max(h + 0.004 - t * drop, 0.005)
        row = []
        for i in range(n_around):
            s = perim * i / n_around
            if s < 2 * hx:
                p, n = Vector((-hx + s, -hy, 0)), Vector((0, -1, 0))
            elif s < 2 * hx + 2 * hy:
                p, n = Vector((hx, -hy + (s - 2 * hx), 0)), Vector((1, 0, 0))
            elif s < 4 * hx + 2 * hy:
                p, n = Vector((hx - (s - 2 * hx - 2 * hy), hy, 0)), Vector((0, 1, 0))
            else:
                p, n = Vector((-hx, hy - (s - 4 * hx - 2 * hy), 0)), Vector((-1, 0, 0))
            fold = math.sin(s * 2 * math.pi / 0.16) * folds * (t ** 1.2) + math.sin(s * 2 * math.pi / 0.53 + 1.3) * folds * 0.5 * t
            q = p + n * (fold + 0.004 + 0.012 * t)
            q.z = z
            row.append(bm.verts.new(q))
        rows.append(row)
    for k in range(n_down):
        for i in range(n_around):
            j = (i + 1) % n_around
            bm.faces.new((rows[k][i], rows[k][j], rows[k + 1][j], rows[k + 1][i]))
    ob = mesh_object(name, bm, material)
    s = ob.modifiers.new("Solid", "SOLIDIFY")
    s.thickness = 0.003
    return ob


def linen(color=IVORY):
    return fabric("Linen", color, 0.5, 0.8)


def build_spandex_highboy(color=(0.92, 0.91, 0.88)):
    h = 42 * IN
    prof = [(0.0, h + 0.012), (0.38, h + 0.012), (0.405, h - 0.01), (0.39, h - 0.05), (0.25, h - 0.18), (0.10, h - 0.38),
            (0.055, 0.55), (0.065, 0.40), (0.14, 0.18), (0.26, 0.05), (0.31, 0.0)]
    bm = bmesh.new()
    lathe(bm, prof, segments=96)
    ob = mesh_object("Spandex", bm, mat("Spandex", color, 0.0, 0.35, **{"Sheen Weight": 0.5, "Coat Weight": 0.1}))
    subsurf(ob, 1)


def bud_vase(x, y, z, flower=(0.98, 0.94, 0.92)):
    bm = bmesh.new()
    lathe(bm, [(0.0, 0), (0.03, 0), (0.035, 0.04), (0.022, 0.10), (0.012, 0.14), (0.016, 0.15)], 32, center=(x, y, z + 0.001), cap=False)
    mesh_object("Vase", bm, lib.thin_glass())
    st = bmesh.new()
    add_rod(st, (x, y, z + 0.02), (x + 0.01, y, z + 0.24), 0.003, segments=6)
    mesh_object("Stem", st, mat("Stem", (0.15, 0.3, 0.12), 0.0, 0.6))
    fl = bmesh.new()
    rng = random.Random(4)
    lib.bloom(fl, Vector((x + 0.01, y, z + 0.26)), 0.035, rng)
    mesh_object("Bloom", fl, mat("Bloom", flower, 0.0, 0.55, **{"Subsurface Weight": 0.3}))


def build_runner(length, drop, color, h=30 * IN):
    m = mat("Chiffon", color, 0.0, 0.6, **{"Sheen Weight": 0.8, "Subsurface Weight": 0.2})
    bm = bmesh.new()
    w = 0.36
    nx, ny = 160, 10
    hx = length / 2 + 0.02
    total = length + 2 * drop
    grid = []
    for i in range(nx + 1):
        s = -total / 2 + total * i / nx
        row = []
        for j in range(ny + 1):
            y = -w / 2 + w * j / ny
            wav = 0.004 * math.sin(s * 9 + y * 20)
            if abs(s) <= hx:
                p = (s, y * (1 + 0.05 * math.sin(s * 3)), h + 0.016 + wav)
            else:
                d = abs(s) - hx
                p = (math.copysign(hx + 0.01 + 0.03 * d, s), y * (1 + 0.15 * d), h + 0.012 - d)
            row.append(bm.verts.new(p))
        grid.append(row)
    for i in range(nx):
        for j in range(ny):
            bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    ob = mesh_object("Runner", bm, m)
    s = ob.modifiers.new("Solid", "SOLIDIFY")
    s.thickness = 0.002
    subsurf(ob, 1)


def place_settings(positions, h, charger_mat=None, napkin=IVORY, glassware=True):
    gold = charger_mat or lib.gold_metal(0.28)
    b_gold, b_china, b_nap, b_glass = bmesh.new(), bmesh.new(), bmesh.new(), bmesh.new()
    z = h + 0.012
    for (x, y, ang) in positions:
        cx, cy = x, y
        add_disc(b_gold, (cx, cy, z + 0.004), 0.165, 0.008, 64)
        lathe(b_china, [(0, 0), (0.07, 0), (0.10, 0.008), (0.13, 0.016), (0.135, 0.018)], 48, center=(cx, cy, z + 0.008), thickness=0.004)
        add_box(b_nap, (cx, cy, z + 0.032), (0.18, 0.10, 0.02), rot_z=ang)
        if glassware:
            gx, gy = cx + 0.18 * math.cos(ang + 0.9), cy + 0.18 * math.sin(ang + 0.9)
            lathe(b_glass, [(0, 0), (0.035, 0), (0.035, 0.003), (0.005, 0.006), (0.004, 0.09), (0.02, 0.10), (0.04, 0.14), (0.036, 0.19)],
                  32, center=(gx, gy, z + 0.001), cap=False)
    mesh_object("Chargers", b_gold, gold)
    mesh_object("Plates", b_china, lib.china())
    nb = mesh_object("Napkins", b_nap, fabric("Napkin", napkin, 0.6))
    bevel(nb, 0.006, 3)
    if glassware:
        mesh_object("Glasses", b_glass, lib.thin_glass())


def centerpiece(x, y, z, palette, rng, spread=0.22, n=26, candles=True):
    mats = [mat(f"Bloom{i}", c, 0.0, 0.55, **{"Subsurface Weight": 0.25, "Sheen Weight": 0.4}) for i, c in enumerate(palette)]
    bms = [bmesh.new() for _ in mats]
    leaves = bmesh.new()
    for _ in range(n):
        a = rng.uniform(0, 6.28)
        d = rng.uniform(0, spread) ** 0.8 * spread ** 0.2
        rad = rng.uniform(0.035, 0.06)
        p = Vector((x + math.cos(a) * d, y + math.sin(a) * d, z + rad * 0.8 + (spread - d) * 0.35))
        lib.bloom(bms[rng.randrange(len(bms))], p, rad, rng)
    for _ in range(int(n * 1.3)):
        a = rng.uniform(0, 6.28)
        d = rng.uniform(0.05, spread * 1.25)
        m = Matrix.Translation((x + math.cos(a) * d, y + math.sin(a) * d, z + 0.03 + rng.random() * 0.06)) @ Matrix.Rotation(a, 4, "Z") @ Matrix.Rotation(rng.uniform(-0.5, 0.5), 4, "Y") @ Matrix.Diagonal((0.07, 0.025, 0.006, 1))
        bmesh.ops.create_icosphere(leaves, subdivisions=1, radius=1.0, matrix=m)
    for b, m in zip(bms, mats):
        mesh_object("Blooms", b, m)
    mesh_object("Leaves", leaves, mat("Leaf", (0.16, 0.26, 0.14), 0.0, 0.45))
    if candles:
        hold, wax, flame = bmesh.new(), bmesh.new(), bmesh.new()
        for i in range(3):
            a = 2 * math.pi * i / 3 + 0.5
            cx, cy = x + math.cos(a) * spread * 1.15, y + math.sin(a) * spread * 1.15
            lathe(hold, [(0, 0), (0.03, 0), (0.032, 0.06), (0.03, 0.065)], 24, center=(cx, cy, z + 0.001), cap=False)
            add_rod(wax, (cx, cy, z + 0.005), (cx, cy, z + 0.055), 0.024)
            add_sphere(flame, (cx, cy, z + 0.072), 0.006, (1, 1, 2.2))
        mesh_object("Votives", hold, lib.thin_glass((1.0, 0.95, 0.85)))
        mesh_object("Wax", wax, mat("Wax", (0.96, 0.93, 0.86), 0.0, 0.4, **{"Subsurface Weight": 0.6}))
        mesh_object("Flames", flame, lib.emission("Flame", (1.0, 0.62, 0.25), 40.0))


def dressed_round(r=30 * IN, cloth_color=IVORY, cloth_mat=None, n_chairs=8, chair_col=None, palette=None, seed=3, settings=True):
    h = 30 * IN
    round_cloth(r, h, h, cloth_mat or linen(cloth_color), seed=seed)
    rng = random.Random(seed)
    if settings:
        pos = []
        for i in range(n_chairs):
            a = 2 * math.pi * i / n_chairs - math.pi / 2
            pos.append(((r - 0.22) * math.cos(a), (r - 0.22) * math.sin(a), a))
        place_settings(pos, h)
    if palette:
        centerpiece(0, 0, h + 0.012, palette, rng)
    if chair_col is not None:
        for i in range(n_chairs):
            a = 2 * math.pi * i / n_chairs - math.pi / 2
            rr = r + 0.18
            lib.instance(chair_col, (rr * math.cos(a), rr * math.sin(a), 0), rot_z=a + math.pi / 2)


IVORY_BLUSH = [(0.98, 0.95, 0.92), (0.97, 0.82, 0.80), (0.95, 0.90, 0.80), (0.90, 0.70, 0.66)]


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

TABLE_CAM = dict(az=-30, el=24, lens=70, pad=1.12)

item("round-48", "tables", lambda: build_round(24 * IN),
     "3D render of a 48-inch round banquet table with a wood top and folding steel legs that seats 4 to 6 guests",
     "48\" round table (seats 4-6)", cam=TABLE_CAM)
item("round-60", "tables", lambda: build_round(30 * IN),
     "3D render of a 60-inch round banquet table, the most popular wedding reception table, seating 8 to 10 guests",
     "60\" round table (seats 8-10)", cam=TABLE_CAM)
item("round-72", "tables", lambda: build_round(36 * IN),
     "3D render of a 72-inch round banquet table that seats 10 to 12 guests for weddings and galas in Chicago",
     "72\" round table (seats 10-12)", cam=TABLE_CAM)
item("banquet-6ft", "tables", lambda: build_banquet(6 * FT),
     "3D render of a 6-foot rectangular banquet table with folding legs, seats 6 guests or works as a buffet table",
     "6 ft banquet table (seats 6)", cam=TABLE_CAM)
item("banquet-8ft", "tables", lambda: build_banquet(8 * FT),
     "3D render of an 8-foot rectangular banquet table with folding legs, seats 8 to 10 guests for family-style dinners",
     "8 ft banquet table (seats 8-10)", cam=TABLE_CAM)
item("cocktail-highboy", "tables", lambda: build_highboy(),
     "3D render of a 30-inch round cocktail highboy table, 42 inches tall, for standing cocktail hours",
     "30\" cocktail highboy table (42\" tall)", cam=dict(az=-30, el=16, lens=70, pad=1.12))
item("cocktail-lowboy", "tables", lambda: build_highboy(h=30 * IN),
     "3D render of a 30-inch round cocktail lowboy table at seated height for lounges and small gatherings",
     "30\" cocktail lowboy table (30\" tall)", cam=dict(az=-30, el=18, lens=70, pad=1.12))
item("farm-table", "tables", build_farm,
     "3D render of an 8-foot rustic wood farm table with plank top for barn weddings and family-style dinners near Chicago",
     "8 ft wood farm table", cam=TABLE_CAM)
item("kids-table", "tables", lambda: build_banquet(6 * FT, h=22 * IN, top=lib.plastic(lib.WHITE, 0.4)),
     "3D render of a kids' height 6-foot white table, 22 inches tall, for children's parties and kids' tables at weddings",
     "Kids' 6 ft table (22\" tall)", cam=TABLE_CAM)


def _sweetheart():
    L, W, h = 4 * FT, 30 * IN, 30 * IN
    rect_cloth(L, W, h, h, lib.sequin(), folds=0.008)
    gold = lib.as_collection("SweetChair", lambda col: C.build_chiavari(col=col))
    for x in (-0.33, 0.33):
        lib.instance(gold, (x, W / 2 + 0.28, 0), rot_z=math.pi)
    centerpiece(0, -0.05, h + 0.012, IVORY_BLUSH, random.Random(5), spread=0.30, n=40, candles=True)


item("sweetheart-table", "tables", _sweetheart,
     "3D render of a 4-foot sweetheart table for the couple, dressed in gold sequin linen with ivory and blush roses and two gold Chiavari chairs",
     "Sweetheart table with gold sequin linen", cam=dict(az=-20, el=14, lens=70, pad=1.08))

LINEN_CAM = dict(az=-28, el=20, lens=70, pad=1.1)

item("round-floor-length", "linens", lambda: (build_round(30 * IN), round_cloth(30 * IN, 30 * IN, 30 * IN, linen())),
     "3D render of a 120-inch ivory round tablecloth draped floor-length over a 60-inch round table",
     "120\" round floor-length tablecloth (ivory)", cam=LINEN_CAM)
item("round-lap-length", "linens", lambda: (build_round(30 * IN), round_cloth(30 * IN, 30 * IN, 0.38, linen(lib.WHITE))),
     "3D render of a 90-inch white round tablecloth at lap length on a 60-inch round table",
     "90\" round lap-length tablecloth (white)", cam=LINEN_CAM)
item("banquet-floor-length", "linens", lambda: (build_banquet(8 * FT), rect_cloth(8 * FT, 30 * IN, 30 * IN, 30 * IN, linen())),
     "3D render of a 90 by 156 inch ivory rectangular tablecloth draped floor-length over an 8-foot banquet table",
     "90\" x 156\" banquet floor-length tablecloth", cam=LINEN_CAM)
item("banquet-lap-length", "linens", lambda: (build_banquet(8 * FT), rect_cloth(8 * FT, 30 * IN, 30 * IN, 0.38, linen(lib.WHITE))),
     "3D render of a 60 by 120 inch white rectangular tablecloth at lap length on an 8-foot banquet table",
     "60\" x 120\" banquet lap-length tablecloth", cam=LINEN_CAM)
item("spandex-highboy", "linens", build_spandex_highboy,
     "3D render of a white fitted spandex cover on a cocktail highboy table, cinched at the waist",
     "Spandex highboy cover (white)", cam=dict(az=-30, el=14, lens=70, pad=1.12))
item("sequin-overlay", "linens", lambda: (build_round(30 * IN), round_cloth(30 * IN, 30 * IN, 30 * IN, lib.sequin(), seed=7)),
     "3D render of a gold sequin round tablecloth draped floor-length over a 60-inch round table for glam receptions",
     "Gold sequin tablecloth", cam=LINEN_CAM)
item("table-runner", "linens", lambda: (build_banquet(8 * FT), rect_cloth(8 * FT, 30 * IN, 30 * IN, 30 * IN, linen()), build_runner(8 * FT, 0.35, lib.SAGE)),
     "3D render of a sage green chiffon table runner draped over an ivory floor-length linen on an 8-foot banquet table",
     "Sage chiffon table runner", cam=LINEN_CAM)


def _napkins():
    h = 30 * IN
    bm = bmesh.new()
    add_disc(bm, (0, 0, h - 0.02), 0.75, 0.04, 128)
    mesh_object("Top", bm, linen())
    place_settings([(0, 0, 0)], h, glassware=True)
    colors = [IVORY, lib.BLUSH, lib.SAGE, (0.20, 0.22, 0.35), (0.45, 0.10, 0.14)]
    st = bmesh.new()
    for i, c in enumerate(colors):
        nb = bmesh.new()
        add_box(nb, (0.33 + 0.012 * i, -0.10 - 0.01 * i, h + 0.012 + i * 0.021), (0.20, 0.20, 0.018), rot_z=0.15 * i - 0.3)
        ob = mesh_object(f"Napkin{i}", nb, fabric(f"Nap{i}", c, 0.6))
        bevel(ob, 0.008, 3)


item("cloth-napkins", "linens", _napkins,
     "3D render of a stack of folded cloth dinner napkins in ivory, blush, sage, navy and burgundy beside a place setting",
     "Cloth dinner napkins in five colors", cam=dict(az=-25, el=38, lens=85, pad=1.05))
