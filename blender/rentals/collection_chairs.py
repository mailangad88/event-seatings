"""The ten chairs from the original Beyond Chiavari chair collection (src/data/chairs.ts)."""

import math

import bmesh
from mathutils import Matrix, Vector

import chairs as C
import lib
from catalog import CHAIR_CAM, item
from lib import add_beam, add_box, add_polyline, add_ring, add_rod, add_sphere, bevel, fabric, lathe, mat, mesh_object, subsurf


def _arc(cx, cz, r, a0, a1, y, n=24):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), y, cz + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def _round_seat(z, r, m, thick=0.04, y=0.0):
    bm = bmesh.new()
    lib.add_disc(bm, (0, y, z), r, thick, 64)
    ob = mesh_object("Seat", bm, m)
    bevel(ob, thick * 0.4, 3)
    return ob


def _splayed_legs(bm, seat_z, top=0.17, foot=0.21, r=0.016, r2=0.012):
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        add_rod(bm, (sx * top, sy * top, seat_z), (sx * foot, sy * foot, 0), r, r2)


def bentwood():
    w = lib.wood("Espresso", (0.16, 0.10, 0.07), (0.10, 0.06, 0.04), stretch=(6, 6, 1))
    fr = bmesh.new()
    seat_z = 0.45
    for sx, sy in ((-1, -1), (1, -1)):
        add_rod(fr, (sx * 0.17, sy * 0.17, seat_z - 0.03), (sx * 0.2, sy * 0.21, 0), 0.016, 0.012)
    # back legs sweep up into a hoop
    hoop = [(x, 0.20 + 0.02 * (z - seat_z), z) for x, _, z in _arc(0, 0.72, 0.17, 180, 360, 0, 18)]
    for sx in (-1, 1):
        add_polyline(fr, [(sx * 0.19, 0.24, 0), (sx * 0.17, 0.17, seat_z - 0.02), (sx * 0.17, 0.2, 0.72)], 0.015)
    top = [(p[0], 0.2 + 0.03, p[2]) for p in _arc(0, 0.72, 0.17, 0, 180, 0, 24)]
    add_polyline(fr, top, 0.015)
    inner = [(p[0] * 0.75, 0.21, p[2]) for p in _arc(0, 0.69, 0.13, 0, 180, 0, 20)]
    add_polyline(fr, [(0.0975, 0.2, 0.55)] + inner + [(-0.0975, 0.2, 0.55)], 0.011)
    add_ring(fr, (0, 0, 0.18), (0, 0, 1), 0.19, 0.01, segs=48, ring=8)
    mesh_object("Bentwood", fr, w)
    _round_seat(seat_z, 0.205, w)
    del hoop


def louis_medallion():
    frame = mat("WhiteFrame", (0.93, 0.91, 0.87), 0.0, 0.35, **{"Coat Weight": 0.3})
    gold = lib.gold_metal(0.25)
    up = fabric("Ivory", (0.94, 0.92, 0.86), 0.7)
    fr = bmesh.new()
    seat_z = 0.46
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        add_polyline(fr, [(sx * 0.2, sy * 0.19, seat_z - 0.06), (sx * 0.19, sy * 0.18, 0.2), (sx * 0.2, sy * 0.2, 0)], 0.018)
    add_ring(fr, (0, 0.22, 0.76), (0, 1, 0), 0.18, 0.022, segs=48, ring=10, scale=(1.0, 1.3))
    for sx in (-1, 1):
        add_rod(fr, (sx * 0.15, 0.2, seat_z), (sx * 0.15, 0.22, 0.58), 0.02)
    add_box(fr, (0, 0, seat_z - 0.05), (0.44, 0.42, 0.06))
    ob = mesh_object("LouisFrame", fr, frame)
    bevel(ob, 0.01, 3)
    gd = bmesh.new()
    add_ring(gd, (0, 0.205, 0.76), (0, 1, 0), 0.18, 0.006, segs=48, ring=6, scale=(1.0, 1.3))
    add_sphere(gd, (0, 0.2, 1.0), 0.02)
    mesh_object("GoldTrim", gd, gold)
    back = bmesh.new()
    bmesh.ops.create_cone(back, cap_ends=True, segments=48, radius1=0.165, radius2=0.165, depth=0.04,
                          matrix=Matrix.Translation((0, 0.22, 0.76)) @ Matrix.Rotation(math.pi / 2, 4, "X") @ Matrix.Diagonal((1.0, 1.3, 1, 1)))
    bo = mesh_object("Medallion", back, up)
    bevel(bo, 0.015, 3)
    C._seat_cushion(seat_z - 0.03, size=(0.42, 0.40), color=(0.94, 0.92, 0.86), thick=0.07)


def rattan_garden():
    rat = lib.woven((0.55, 0.36, 0.16))
    bm = bmesh.new()
    # tub armchair: lathe a bowl and cut the front by scaling
    prof = [(0.0, 0.18), (0.30, 0.18), (0.34, 0.30), (0.36, 0.5), (0.35, 0.72), (0.33, 0.78)]
    lathe(bm, prof, 64, thickness=0.03)
    # remove front half above seat to open the chair
    cut = [v for v in bm.verts if v.co.y < -0.05 and v.co.z > 0.45]
    for v in cut:
        v.co.z = 0.45 + (v.co.z - 0.45) * max(0.0, (v.co.y + 0.36) / 0.31) ** 1.5
    ob = mesh_object("Tub", bm, rat)
    subsurf(ob, 1)
    legs = bmesh.new()
    _splayed_legs(legs, 0.2, top=0.2, foot=0.24, r=0.018)
    mesh_object("Legs", legs, lib.wood("Teak", (0.45, 0.30, 0.18), (0.32, 0.2, 0.11)))
    cu = bmesh.new()
    lib.add_disc(cu, (0, 0, 0.27), 0.28, 0.09, 48)
    co = mesh_object("Cushion", cu, fabric("CushionW", (0.95, 0.93, 0.88), 0.8))
    bevel(co, 0.035, 4)


def wishbone():
    oak = lib.wood("Oak", (0.74, 0.56, 0.36), (0.60, 0.43, 0.26), stretch=(6, 6, 1))
    fr = bmesh.new()
    seat_z = 0.45
    for sx in (-1, 1):
        add_rod(fr, (sx * 0.2, -0.2, 0), (sx * 0.2, -0.2, seat_z), 0.017, 0.015)
        add_polyline(fr, [(sx * 0.2, 0.2, 0), (sx * 0.21, 0.18, seat_z), (sx * 0.24, 0.12, 0.70)], 0.017)
    rail = [(0.24 * math.cos(a), 0.12 + 0.12 * math.sin(a), 0.71) for a in [math.pi * i / 30 for i in range(31)]]
    add_polyline(fr, rail, 0.022)
    add_polyline(fr, [(-0.04, 0.24, 0.70), (0, 0.22, 0.56), (0.04, 0.24, 0.70)], 0.012)  # the wishbone Y
    add_rod(fr, (0, 0.22, 0.56), (0, 0.2, seat_z), 0.014)
    for y in (-0.2, 0.2):
        add_rod(fr, (-0.2, y, seat_z - 0.01), (0.2, y, seat_z - 0.01), 0.014)
    for sx in (-1, 1):
        add_rod(fr, (sx * 0.2, -0.2, seat_z - 0.01), (sx * 0.2, 0.2, seat_z - 0.01), 0.014)
    mesh_object("Wishbone", fr, oak)
    s = bmesh.new()
    add_box(s, (0, 0, seat_z + 0.005), (0.40, 0.40, 0.03))
    so = mesh_object("CordSeat", s, lib.woven((0.80, 0.68, 0.48)))
    bevel(so, 0.01, 2)


def velvet_dining():
    vel = lib.mat("Emerald", (0.012, 0.09, 0.05), 0.0, 0.8, **{"Sheen Weight": 0.6, "Sheen Tint": (0.2, 0.6, 0.4)})
    s = bmesh.new()
    add_box(s, (0, 0, 0.44), (0.46, 0.46, 0.11))
    so = mesh_object("Seat", s, vel)
    bevel(so, 0.04, 4)
    subsurf(so, 1)
    b = bmesh.new()
    add_box(b, (0, 0.21, 0.78), (0.44, 0.09, 0.56))
    bo = mesh_object("Back", b, vel)
    bevel(bo, 0.04, 4)
    subsurf(bo, 2)
    bo.rotation_euler = (math.radians(-8), 0, 0)
    bo.location = (0, 0.06, -0.06)
    legs = bmesh.new()
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        add_rod(legs, (sx * 0.19, sy * 0.19, 0.39), (sx * 0.21, sy * 0.22, 0), 0.016, 0.01)
    mesh_object("Legs", legs, lib.gold_metal(0.2))


def infinity():
    gold = lib.gold_metal(0.22)
    fr = bmesh.new()
    seat_z = 0.45
    for sx, sy in ((-1, -1), (1, -1)):
        add_rod(fr, (sx * 0.19, sy * 0.19, 0), (sx * 0.19, sy * 0.19, seat_z), 0.012)
    for sx in (-1, 1):
        add_rod(fr, (sx * 0.19, 0.2, 0), (sx * 0.18, 0.24, 0.95), 0.012)
    for z in (0.94, seat_z + 0.03):
        add_rod(fr, (-0.18, 0.24 - (0.95 - z) * 0.04, z), (0.18, 0.24 - (0.95 - z) * 0.04, z), 0.012)
    # the infinity loops: two interlocking vertical ovals in the back
    for sx in (-1, 1):
        add_ring(fr, (sx * 0.06, 0.225, 0.72), (0, 1, 0), 0.09, 0.008, segs=40, ring=6, scale=(0.8, 2.2))
    for y in (-0.19, 0.19):
        add_rod(fr, (-0.19, y, seat_z), (0.19, y, seat_z), 0.012)
    for sx in (-1, 1):
        add_rod(fr, (sx * 0.19, -0.19, seat_z), (sx * 0.19, 0.19, seat_z), 0.012)
        add_rod(fr, (sx * 0.19, -0.19, 0.16), (sx * 0.19, 0.2, 0.16), 0.009)
    mesh_object("Infinity", fr, gold)
    C._seat_cushion(seat_z, size=(0.40, 0.40), color=lib.IVORY)


def cane_back():
    w = lib.wood("Natural", (0.62, 0.44, 0.27), (0.48, 0.32, 0.18), stretch=(6, 6, 1))
    fr = bmesh.new()
    seat_z = 0.46
    for sx in (-1, 1):
        add_rod(fr, (sx * 0.2, -0.2, 0), (sx * 0.2, -0.2, seat_z), 0.018, 0.014)
        add_polyline(fr, [(sx * 0.19, 0.21, 0), (sx * 0.2, 0.2, seat_z), (sx * 0.19, 0.25, 0.88)], 0.018)
    add_polyline(fr, [(x, 0.25 + 0.03 * (1 - (x / 0.19) ** 2), 0.88) for x in [(-0.19 + 0.38 * i / 20) for i in range(21)]], 0.02)
    add_rod(fr, (-0.19, 0.22, 0.56), (0.19, 0.22, 0.56), 0.015)
    for y in (-0.2, 0.2):
        add_rod(fr, (-0.2, y, seat_z - 0.02), (0.2, y, seat_z - 0.02), 0.02)
    mesh_object("CaneFrame", fr, w)
    cane = mat("Cane", (0.82, 0.68, 0.45), 0.0, 0.6)
    nt = cane.node_tree
    p = nt.nodes["Principled BSDF"]
    br = nt.nodes.new("ShaderNodeTexVoronoi")
    br.inputs["Scale"].default_value = 200.0
    nt.links.new(br.outputs["Distance"], p.inputs["Alpha"])
    pane = bmesh.new()
    add_box(pane, (0, 0.235, 0.72), (0.36, 0.008, 0.30))
    mesh_object("CanePanel", pane, cane)
    C._seat_cushion(seat_z - 0.02, size=(0.40, 0.40), color=(0.92, 0.89, 0.82), thick=0.045)


def windsor():
    paint = mat("AntiqueWhite", (0.90, 0.87, 0.80), 0.0, 0.45)
    fr = bmesh.new()
    seat_z = 0.45
    _splayed_legs(fr, seat_z - 0.03, top=0.15, foot=0.22, r=0.02, r2=0.014)
    add_rod(fr, (-0.2, 0, 0.17), (0.2, 0, 0.17), 0.012)
    bow = [(0.21 * math.cos(a), 0.17 + 0.05 * math.sin(a), seat_z + 0.07 + 0.42 * math.sin(a)) for a in [math.pi * i / 30 for i in range(31)]]
    add_polyline(fr, bow, 0.018)
    for i in range(7):
        x = -0.15 + 0.05 * i
        top_z = seat_z + 0.07 + 0.42 * math.sqrt(max(0, 1 - (x / 0.21) ** 2))
        add_rod(fr, (x, 0.16, seat_z), (x, 0.2, top_z - 0.01), 0.008)
    mesh_object("Windsor", fr, paint)
    s = bmesh.new()
    add_box(s, (0, 0, seat_z), (0.44, 0.42, 0.045))
    so = mesh_object("Saddle", s, paint)
    bevel(so, 0.02, 4)
    subsurf(so, 1)


def shell():
    shellm = mat("ShellWhite", (0.92, 0.91, 0.88), 0.0, 0.3, **{"Coat Weight": 0.3})
    bm = bmesh.new()
    n, m = 40, 24
    grid = []
    for i in range(n + 1):
        u = -1 + 2 * i / n
        row = []
        for j in range(m + 1):
            v = j / m
            x = u * (0.24 + 0.04 * v)
            y = -0.22 + 0.42 * min(v * 1.8, 1.0) + 0.06 * (u ** 2) * v
            z = 0.44 + 0.02 * u ** 2 + max(0, v - 0.55) / 0.45 * 0.36
            y += 0.0
            row.append(bm.verts.new((x, y if v < 0.56 else 0.2 + 0.04 * (v - 0.55) / 0.45 + 0.05 * u ** 2, z + 0.06 * u ** 4)))
        grid.append(row)
    for i in range(n):
        for j in range(m):
            bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    ob = mesh_object("Shell", bm, shellm)
    sol = ob.modifiers.new("Solid", "SOLIDIFY")
    sol.thickness = 0.012
    subsurf(ob, 2)
    legs = bmesh.new()
    _splayed_legs(legs, 0.42, top=0.12, foot=0.22, r=0.017, r2=0.013)
    mesh_object("Dowels", legs, lib.wood("Maple", (0.80, 0.62, 0.42), (0.68, 0.50, 0.32)))
    wire = bmesh.new()
    for a, b in (((-0.17, -0.17, 0.22), (0.17, 0.17, 0.22)), ((0.17, -0.17, 0.22), (-0.17, 0.17, 0.22))):
        add_rod(wire, a, b, 0.004)
    mesh_object("Wire", wire, lib.black_metal())


def garden_folding():
    w = lib.wood("Teak", (0.64, 0.45, 0.28), (0.50, 0.34, 0.20), stretch=(1, 8, 8))
    fr = bmesh.new()
    for sx in (-1, 1):
        add_beam(fr, (sx * 0.21, -0.22, 0), (sx * 0.21, 0.18, 0.86), 0.03, 0.022)
        add_beam(fr, (sx * 0.19, 0.22, 0), (sx * 0.19, -0.15, 0.45), 0.03, 0.022)
    for i in range(5):
        add_box(fr, (0, -0.18 + i * 0.075, 0.45), (0.40, 0.06, 0.02))
    for i in range(3):
        z = 0.62 + i * 0.08
        y = -0.22 + 0.40 * z / 0.86
        add_box(fr, (0, y + 0.01, z), (0.42, 0.02, 0.06))
    add_box(fr, (0, 0.0, 0.12), (0.40, 0.03, 0.03))
    ob = mesh_object("Garden", fr, w, smooth=False)
    bevel(ob, 0.004, 2)
    hw = bmesh.new()
    for sx in (-1, 1):
        add_sphere(hw, (sx * 0.226, 0.0, 0.33), 0.012, scale=(0.5, 1, 1))
    mesh_object("Bolts", hw, lib.steel(0.3))


for slug, fn, alt, cap in (
    ("bentwood", bentwood, "3D render of an espresso bentwood bistro chair with a hoop back and round seat, a Parisian-cafe rental for Chicago weddings", "Bentwood bistro chair (espresso)"),
    ("louis-medallion", louis_medallion, "3D render of a white and gold Louis medallion chair with an upholstered ivory oval back for elegant receptions", "Louis medallion chair (white & gold)"),
    ("rattan-garden", rattan_garden, "3D render of a honey rattan garden tub chair with a white cushion for boho lounges and garden parties", "Rattan garden chair (honey)"),
    ("wishbone", wishbone, "3D render of a natural oak wishbone chair with a woven cord seat, a modern Scandinavian dinner chair rental", "Wishbone chair (natural oak)"),
    ("velvet-dining", velvet_dining, "3D render of an emerald green velvet dining chair with gold legs for glam head tables", "Velvet dining chair (emerald)"),
    ("infinity", infinity, "3D render of a gold infinity chair with looped back and ivory cushion, a modern alternative to the Chiavari", "Gold infinity chair"),
    ("cane-back", cane_back, "3D render of a natural wood cane-back chair with woven cane panel and linen seat cushion", "Cane-back chair (natural)"),
    ("windsor", windsor, "3D render of an antique white Windsor spindle chair with a bow back and saddle seat for farmhouse weddings", "Windsor spindle chair (antique white)"),
    ("shell", shell, "3D render of a white molded shell chair on maple dowel legs for modern corporate events and lounges", "Molded shell chair (white)"),
    ("garden-folding", garden_folding, "3D render of a slatted teak wood garden folding chair for outdoor ceremonies", "Wood garden folding chair"),
):
    item(slug, "chairs", fn, alt, cap, cam=CHAIR_CAM)
