"""Dance floors, staging, lighting, heating, lounge furniture, decor and games."""

import math
import random

import bmesh
from mathutils import Matrix, Vector

import lib
import tables as T
from catalog import item
from lib import (
    add_beam, add_box, add_disc, add_polyline, add_ring, add_rod, add_sphere, bevel, fabric, lathe, mat, mesh_object,
    subsurf,
)

FT = 0.3048
IN = 0.0254


# --- Floors & staging -------------------------------------------------------

def dance_floor(led=False):
    n = 8  # 16x16 ft of 2x2 ft panels
    p = 2 * FT
    tiles_a, tiles_b, trim = bmesh.new(), bmesh.new(), bmesh.new()
    for i in range(n):
        for j in range(n):
            x, y = (i - n / 2 + 0.5) * p, (j - n / 2 + 0.5) * p
            add_box(tiles_a if (i + j) % 2 == 0 else tiles_b, (x, y, 0.02), (p - 0.006, p - 0.006, 0.04))
    half = n * p / 2
    for sx, sy, w, d in ((0, -half - 0.05, 2 * half + 0.2, 0.1), (0, half + 0.05, 2 * half + 0.2, 0.1), (-half - 0.05, 0, 0.1, 2 * half), (half + 0.05, 0, 0.1, 2 * half)):
        add_box(trim, (sx, sy, 0.012), (w, d, 0.024))
    if led:
        mesh_object("TilesA", tiles_a, mat("LEDTop", (0.02, 0.02, 0.025), 0.0, 0.05, **{"Coat Weight": 1.0}))
        mesh_object("TilesB", tiles_b, mat("LEDTop2", (0.02, 0.02, 0.025), 0.0, 0.05, **{"Coat Weight": 1.0}))
        stars = bmesh.new()
        rng = random.Random(3)
        for _ in range(900):
            add_sphere(stars, (rng.uniform(-half, half), rng.uniform(-half, half), 0.041), 0.006, scale=(1, 1, 0.2), subdiv=1)
        mesh_object("Stars", stars, lib.emission("Starlight", (1.0, 0.95, 0.85), 25))
        mesh_object("Trim", trim, lib.silver_metal(0.2))
    else:
        mesh_object("TilesA", tiles_a, mat("FloorBlack", (0.015, 0.015, 0.015), 0.0, 0.5))
        mesh_object("TilesB", tiles_b, mat("FloorWhite", (0.88, 0.87, 0.85), 0.0, 0.5))
        mesh_object("Trim", trim, lib.silver_metal(0.25))


def stage_deck():
    w, d, h = 16 * FT, 8 * FT, 24 * IN
    bm = bmesh.new()
    add_box(bm, (0, 0, h - 0.02), (w, d, 0.04))
    mesh_object("Deck", bm, mat("Carpet", (0.02, 0.02, 0.02), 0.0, 0.95))
    sk = bmesh.new()
    for i in range(240):
        x = -w / 2 + w * i / 239
        add_box(sk, (x, -d / 2 - 0.015 - 0.01 * math.sin(i * 1.3), (h - 0.04) / 2), (w / 239 + 0.004, 0.02, h - 0.04))
    for i in range(120):
        y = -d / 2 + d * i / 119
        for sx in (-1, 1):
            add_box(sk, (sx * (w / 2 + 0.015 + 0.01 * math.sin(i * 1.3)), y, (h - 0.04) / 2), (0.02, d / 119 + 0.004, h - 0.04))
    mesh_object("Skirt", sk, fabric("StageSkirt", (0.03, 0.03, 0.035), 0.8), smooth=False)
    st = bmesh.new()
    for k in range(2):
        add_box(st, (w / 2 - 0.6, -d / 2 - 0.2 - k * 0.28, (k + 1) * h / 3 - 0.02), (1.0, 0.3, 0.04))
        add_box(st, (w / 2 - 0.6, -d / 2 - 0.2 - k * 0.28, ((k + 1) * h / 3) / 2), (1.0, 0.28, (k + 1) * h / 3 - 0.04))
    mesh_object("Steps", st, mat("Carpet", (0.02, 0.02, 0.02), 0.0, 0.95))


# --- Lighting ----------------------------------------------------------------

def string_lights_studio():
    pole = bmesh.new()
    for x in (-2.2, 2.2):
        add_rod(pole, (x, 0, 0), (x, 0, 2.6), 0.03)
        add_disc(pole, (x, 0, 0.03), 0.18, 0.06, 32)
    mesh_object("Poles", pole, lib.black_metal())
    import tents
    tents.string_lights(None, 0.55, through=[((-2.2, 0, 2.55), (2.2, 0, 2.55)), ((-2.2, 0, 2.2), (2.2, 0, 2.2))], strength=45, bulbs_per_m=3)


def uplight():
    bm = bmesh.new()
    add_box(bm, (0, 0, 0.09), (0.16, 0.12, 0.18))
    ob = mesh_object("Can", bm, lib.black_metal())
    bevel(ob, 0.01, 3)
    lens = bmesh.new()
    add_box(lens, (0, -0.061, 0.10), (0.12, 0.004, 0.12))
    mesh_object("Lens", lens, lib.emission("LED", (1.0, 0.55, 0.85), 12))
    yoke = bmesh.new()
    add_polyline(yoke, [(-0.095, 0, 0.09), (-0.095, 0, 0.0), (0.095, 0, 0.0), (0.095, 0, 0.09)], 0.008)
    mesh_object("Yoke", yoke, lib.black_metal())
    lib.bpy.ops.object.light_add(type="SPOT", location=(0, 0.07, 0.2))
    s = lib.bpy.context.object
    s.data.energy, s.data.spot_size, s.data.color = 1500, math.radians(40), (1.0, 0.45, 0.8)
    s.rotation_euler = (math.radians(160), 0, 0)


def chandelier():
    gm = lib.gold_metal(0.25)
    fr, crys, bulbs = bmesh.new(), bmesh.new(), bmesh.new()
    top = 1.2
    add_rod(fr, (0, 0, top + 0.5), (0, 0, top - 0.3), 0.012)
    lathe(fr, [(0, top - 0.3), (0.05, top - 0.32), (0.06, top - 0.45), (0.02, top - 0.6), (0, top - 0.62)], 32)
    for tier, (r, z, n) in enumerate(((0.42, top - 0.42, 10), (0.26, top - 0.20, 6))):
        add_ring(fr, (0, 0, z), (0, 0, 1), r, 0.008, segs=64, ring=6)
        for i in range(n):
            a = 2 * math.pi * i / n
            x, y = r * math.cos(a), r * math.sin(a)
            add_polyline(fr, [(0, 0, z - 0.12 - 0.02 * tier), (x * 0.5, y * 0.5, z - 0.14), (x, y, z - 0.04), (x, y, z)], 0.006, segments=8)
            lathe(fr, [(0, z), (0.025, z), (0.03, z + 0.02)], 16, center=(x, y, 0))
            add_rod(bulbs, (x, y, z + 0.02), (x, y, z + 0.10), 0.011)
            add_sphere(bulbs, (x, y, z + 0.12), 0.012, (1, 1, 1.8))
            for k in range(3):
                add_sphere(crys, (x, y, z - 0.07 - k * 0.05), 0.012 - k * 0.002, (1, 1, 1.8), subdiv=1)
        for i in range(n * 3):
            a = 2 * math.pi * (i + 0.5) / (n * 3)
            add_sphere(crys, (r * math.cos(a), r * math.sin(a), z - 0.03 - 0.05 * (i % 2)), 0.008, (1, 1, 1.4), subdiv=1)
    mesh_object("Frame", fr, gm)
    mesh_object("Crystals", crys, lib.glass(rough=0.0))
    mesh_object("CandleBulbs", bulbs, lib.emission("Candle", (1.0, 0.78, 0.5), 15))


def pipe_and_drape():
    bm = bmesh.new()
    W, H = 3.05, 2.44
    for x in (-W, 0, W):
        add_rod(bm, (x, 0, 0), (x, 0, H), 0.018)
        add_box(bm, (x, 0, 0.008), (0.45, 0.45, 0.016))
    add_rod(bm, (-W, 0, H - 0.02), (W, 0, H - 0.02), 0.015)
    mesh_object("Pipe", bm, lib.silver_metal(0.3))
    dr = bmesh.new()
    nx = 400
    rows = []
    for k in range(2):
        z = H - 0.03 if k == 0 else 0.0
        row = []
        for i in range(nx + 1):
            x = -W + 2 * W * i / nx
            y = 0.05 + 0.05 * math.sin(x * 2 * math.pi / 0.22) + 0.02 * math.sin(x * 3.1)
            row.append(dr.verts.new((x, y * (0.5 if k == 0 else 1.0), z)))
        rows.append(row)
    for i in range(nx):
        dr.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    ob = mesh_object("Drape", dr, fabric("Drape", (0.93, 0.90, 0.85), 0.9, 0.7))
    s = ob.modifiers.new("Solid", "SOLIDIFY")
    s.thickness = 0.004


# --- Heating -----------------------------------------------------------------

def patio_heater():
    st = lib.steel(0.25)
    bm = bmesh.new()
    lathe(bm, [(0, 0), (0.24, 0), (0.24, 0.05), (0.2, 0.08), (0.06, 0.12), (0.06, 0.16)], 48)
    add_rod(bm, (0, 0, 0.16), (0, 0, 2.05), 0.045)
    lathe(bm, [(0, 2.05), (0.09, 2.05), (0.09, 2.18), (0, 2.18)], 32)
    mesh_object("Body", bm, st)
    hood = bmesh.new()
    lathe(hood, [(0.04, 2.30), (0.40, 2.22), (0.41, 2.21)], 64, thickness=0.004)
    add_sphere(hood, (0, 0, 2.33), 0.04)
    mesh_object("Hood", hood, st)
    g = bmesh.new()
    lathe(g, [(0.09, 2.08), (0.11, 2.12), (0.11, 2.2)], 48)
    mesh_object("Glow", g, lib.emission("Heat", (1.0, 0.35, 0.08), 8))
    tank = bmesh.new()
    lathe(tank, [(0, 0.13), (0.15, 0.13), (0.16, 0.18), (0.16, 0.65), (0, 0.66)], 48)
    mesh_object("Tank", tank, mat("TankCover", (0.25, 0.25, 0.26), 0.7, 0.35))


def tent_heater():
    bm = bmesh.new()
    add_box(bm, (0, 0, 0.55), (0.65, 1.3, 0.8))
    ob = mesh_object("Box", bm, mat("HeaterPaint", (0.82, 0.80, 0.76), 0.3, 0.45))
    bevel(ob, 0.02, 3)
    fr = bmesh.new()
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        add_rod(fr, (sx * 0.28, sy * 0.55, 0), (sx * 0.28, sy * 0.55, 0.16), 0.02)
    for sy in (-1, 1):
        add_rod(fr, (-0.3, sy * 0.55, 0.03), (0.3, sy * 0.55, 0.03), 0.02)
    mesh_object("Skid", fr, lib.black_metal())
    duct = bmesh.new()
    pts = [(0, -0.66, 0.7), (0, -1.1, 0.75), (0.3, -1.6, 0.9), (0.9, -2.0, 1.0)]
    for a, b in zip(pts, pts[1:]):
        add_rod(duct, a, b, 0.15, segments=32)
        for t in range(1, 8):
            add_ring(duct, Vector(a).lerp(Vector(b), t / 8), Vector(b) - Vector(a), 0.152, 0.012, segs=32, ring=6)
    for p in pts[1:-1]:
        add_sphere(duct, p, 0.15, subdiv=3)
    mesh_object("Duct", duct, mat("Duct", (0.85, 0.85, 0.86), 1.0, 0.35))
    vent = bmesh.new()
    for i in range(10):
        add_box(vent, (0.33, -0.3 + i * 0.065, 0.55), (0.01, 0.03, 0.5))
    mesh_object("Vent", vent, lib.black_metal())


# --- Lounge ------------------------------------------------------------------

def _tufted_block(center, size, m, buttons=None):
    bm = bmesh.new()
    add_box(bm, center, size)
    ob = mesh_object("Upholstery", bm, m)
    bevel(ob, min(size) * 0.25, 4)
    subsurf(ob, 2)
    return ob


def lounge_sofa(width=2.0):
    vel = fabric("IvoryVelvet", (0.93, 0.90, 0.84), 1.0, 0.9)
    _tufted_block((0, 0, 0.30), (width, 0.85, 0.22), vel)
    _tufted_block((0, 0.36, 0.62), (width, 0.18, 0.55), vel)
    for sx in (-1, 1):
        _tufted_block((sx * (width / 2 - 0.08), 0.0, 0.52), (0.18, 0.85, 0.30), vel)
    n = max(1, round(width / 0.65))
    for i in range(n):
        x = -width / 2 + 0.17 + (width - 0.34) * (i + 0.5) / n
        _tufted_block((x, -0.05, 0.47), ((width - 0.36) / n - 0.01, 0.65, 0.14), vel)
    bt = bmesh.new()
    for row in range(2):
        for k in range(int(width / 0.18)):
            x = -width / 2 + 0.2 + k * 0.18 + (0.09 if row else 0)
            if x < width / 2 - 0.2:
                add_sphere(bt, (x, 0.265, 0.66 + row * 0.16), 0.012, subdiv=1)
    mesh_object("Buttons", bt, vel)
    legs = bmesh.new()
    for sx in (-1, 1):
        for sy in (-1, 1):
            add_rod(legs, (sx * (width / 2 - 0.08), sy * 0.35, 0), (sx * (width / 2 - 0.06), sy * 0.33, 0.2), 0.012, 0.02)
    mesh_object("Legs", legs, lib.gold_metal(0.2))


def coffee_table():
    bm = bmesh.new()
    L, W, H = 1.2, 0.6, 0.45
    for z in (H - 0.01, 0.04):
        for sy in (-1, 1):
            add_rod(bm, (-L / 2, sy * W / 2, z), (L / 2, sy * W / 2, z), 0.009, segments=4)
        for sx in (-1, 1):
            add_rod(bm, (sx * L / 2, -W / 2, z), (sx * L / 2, W / 2, z), 0.009, segments=4)
    for sx in (-1, 1):
        for sy in (-1, 1):
            add_rod(bm, (sx * L / 2, sy * W / 2, 0.0), (sx * L / 2, sy * W / 2, H), 0.009, segments=4)
    mesh_object("Frame", bm, lib.gold_metal(0.2))
    g = bmesh.new()
    add_box(g, (0, 0, H + 0.006), (L - 0.01, W - 0.01, 0.012))
    mesh_object("Glass", g, lib.glass((0.95, 0.98, 0.97)))
    m = bmesh.new()
    add_box(m, (0, 0, 0.055), (L - 0.02, W - 0.02, 0.012))
    mesh_object("Shelf", m, lib.marble())
    b = bmesh.new()
    lathe(b, [(0, 0), (0.05, 0), (0.08, 0.05), (0.05, 0.14), (0.035, 0.18)], 32, center=(0.2, 0.05, H + 0.012), thickness=0.004)
    mesh_object("Vase", b, lib.china())


# --- Decor -------------------------------------------------------------------

def ceremony_arch():
    w = lib.wood("ArchWood", (0.55, 0.40, 0.26), (0.40, 0.28, 0.17), stretch=(8, 8, 0.5))
    bm = bmesh.new()
    # hexagonal arch
    R = 1.25
    pts = [(R * math.cos(a), 0, 1.25 + R * math.sin(a)) for a in [math.radians(d) for d in (-90 - 0, -30, 30, 90, 150, 210, 270)]]
    hexp = [(R * math.cos(math.radians(a)), 0, 1.3 + R * math.sin(math.radians(a))) for a in (270, 330, 30, 90, 150, 210, 270)]
    for a, b in zip(hexp, hexp[1:]):
        add_beam(bm, a, b, 0.09, 0.09)
    for p in hexp[:-1]:
        add_box(bm, p, (0.1, 0.1, 0.1))
    add_box(bm, (0, 0, 0.03), (0.8, 0.3, 0.06))
    ob = mesh_object("Arch", bm, w, smooth=False)
    bevel(ob, 0.005, 2)
    rng = random.Random(9)
    # chiffon drape over the top-left and down the right side
    ch = mat("ArchChiffon", (0.97, 0.95, 0.92), 0.0, 0.6, **{"Sheen Weight": 0.8, "Transmission Weight": 0.3, "Thin Wall": True})
    dr = bmesh.new()
    path = [hexp[3], hexp[2], (R * 1.05, -0.02, 1.0), (R * 1.15, -0.1, 0.3), (R * 1.3, -0.3, 0.0)]
    for a, b in zip(path, path[1:]):
        add_beam(dr, a, b, 0.35, 0.02)
    do = mesh_object("Chiffon", dr, ch)
    subsurf(do, 2)
    palette = [(0.98, 0.95, 0.92), (0.97, 0.82, 0.80), (0.95, 0.90, 0.80), (0.90, 0.70, 0.66)]
    blooms = [bmesh.new() for _ in palette]
    leaves = bmesh.new()
    for anchor, n in ((hexp[4], 55), (hexp[3], 35), (hexp[1], 45), (hexp[0], 30)):
        for _ in range(n):
            p = Vector(anchor) + Vector((rng.gauss(0, 0.13), rng.gauss(-0.05, 0.06), rng.gauss(0, 0.13)))
            lib.bloom(blooms[rng.randrange(len(palette))], p, rng.uniform(0.06, 0.09), rng)
        for _ in range(n * 2):
            p = Vector(anchor) + Vector((rng.gauss(0, 0.2), rng.gauss(-0.03, 0.07), rng.gauss(0, 0.18)))
            m = Matrix.Translation(p) @ Matrix.Rotation(rng.uniform(0, 6.3), 4, "Y") @ Matrix.Rotation(rng.uniform(0, 6.3), 4, "Z") @ Matrix.Diagonal((0.09, 0.03, 0.006, 1))
            bmesh.ops.create_icosphere(leaves, subdivisions=1, radius=1.0, matrix=m)
    for b, c in zip(blooms, palette):
        mesh_object("Blooms", b, mat("Bloom", c, 0.0, 0.55, **{"Subsurface Weight": 0.25, "Sheen Weight": 0.4}))
    mesh_object("Leaves", leaves, mat("Leaf", (0.16, 0.26, 0.14), 0.0, 0.45))


def flower_wall():
    rng = random.Random(4)
    W, H = 2.44, 2.44
    bm = bmesh.new()
    add_box(bm, (0, 0.05, H / 2 + 0.05), (W, 0.06, H))
    mesh_object("Backer", bm, mat("Backer", (0.25, 0.30, 0.22), 0.0, 0.9))
    stand = bmesh.new()
    for x in (-W / 2, W / 2):
        add_rod(stand, (x, 0.1, 0), (x, 0.1, H + 0.1), 0.02)
        add_box(stand, (x, 0.1, 0.01), (0.1, 0.5, 0.02))
    mesh_object("Stand", stand, lib.gold_metal())
    palette = [(0.98, 0.95, 0.92), (0.97, 0.80, 0.80), (0.95, 0.70, 0.74), (0.99, 0.90, 0.84), (0.92, 0.60, 0.64)]
    blooms = [bmesh.new() for _ in palette]
    step = 0.085
    for i in range(int(W / step)):
        for j in range(int(H / step)):
            x = -W / 2 + (i + 0.5) * step + rng.uniform(-0.02, 0.02) + (step / 2 if j % 2 else 0)
            z = 0.05 + (j + 0.5) * step + rng.uniform(-0.02, 0.02)
            if abs(x) > W / 2 - 0.03:
                continue
            c = Vector((x, 0.0, z))
            rad = rng.uniform(0.045, 0.06)
            m = Matrix.Translation(c) @ Matrix.Rotation(math.pi / 2, 4, "X")
            # front-facing rose
            b = blooms[rng.randrange(len(palette))]
            sub = bmesh.new()
            lib.bloom(sub, Vector((0, 0, 0)), rad, rng)
            bmesh.ops.transform(sub, matrix=m, verts=sub.verts[:])
            me = lib.bpy.data.meshes.new("tmp")
            sub.to_mesh(me)
            sub.free()
            b.from_mesh(me)
            lib.bpy.data.meshes.remove(me)
    for b, c in zip(blooms, palette):
        mesh_object("Wall", b, mat("Rose", c, 0.0, 0.55, **{"Subsurface Weight": 0.25, "Sheen Weight": 0.4}))


LETTERS = {
    "L": [((0, 0), (0, 1)), ((0, 0), (0.6, 0))],
    "O": "ring",
    "V": [((0, 1), (0.35, 0)), ((0.35, 0), (0.7, 1))],
    "E": [((0, 0), (0, 1)), ((0, 1), (0.6, 1)), ((0, 0.5), (0.5, 0.5)), ((0, 0), (0.6, 0))],
}


def marquee_letters(word="LOVE"):
    H = 1.22  # 4 ft letters
    body, bulbs = bmesh.new(), bmesh.new()
    x0 = -len(word) * 0.45 * H / 2
    for idx, ch in enumerate(word):
        ox = x0 + idx * 0.88 * H
        if LETTERS[ch] == "ring":
            add_ring(body, (ox + 0.35 * H, 0, H / 2), (0, 1, 0), 0.30 * H, 0.08 * H, segs=48, ring=4, scale=(1.0, 1.6))
            for i in range(14):
                a = 2 * math.pi * i / 14
                add_sphere(bulbs, (ox + 0.35 * H + 0.30 * H * math.cos(a), -0.11 * H, H / 2 + 0.48 * H * math.sin(a)), 0.03, subdiv=2)
            continue
        for (ax, az), (bx, bz) in LETTERS[ch]:
            a = Vector((ox + ax * H, 0, az * H))
            b = Vector((ox + bx * H, 0, bz * H))
            add_beam(body, a, b, 0.16 * H, 0.2 * H)
            L = (b - a).length
            n = max(2, int(L / 0.16))
            for i in range(n + 1):
                p = a.lerp(b, i / n)
                add_sphere(bulbs, (p.x, -0.11 * H, p.z), 0.03, subdiv=2)
    ob = mesh_object("Letters", body, mat("MarqueeWhite", (0.92, 0.91, 0.88), 0.2, 0.35), smooth=False)
    bevel(ob, 0.01, 2)
    mesh_object("Bulbs", bulbs, lib.emission("MarqueeBulb", (1.0, 0.80, 0.55), 12))


def candle_holder():
    gm = lib.gold_metal(0.22)
    bm = bmesh.new()
    lathe(bm, [(0, 0), (0.09, 0), (0.09, 0.015), (0.03, 0.04), (0.015, 0.1), (0.022, 0.12), (0.012, 0.14), (0.012, 0.55)], 48)
    arms = [(0, 0), (0.17, 0), (-0.17, 0)]
    for x, _ in arms[1:]:
        add_polyline(bm, [(0, 0, 0.5), (x * 0.6, 0, 0.47), (x, 0, 0.55), (x, 0, 0.6)], 0.008)
    wax, flames = bmesh.new(), bmesh.new()
    for x, z in ((0, 0.62), (0.17, 0.62), (-0.17, 0.62)):
        lathe(bm, [(0, z - 0.05), (0.03, z - 0.03), (0.035, z), (0.02, z + 0.005)], 32, center=(x, 0, 0))
        add_rod(wax, (x, 0, z), (x, 0, z + 0.25), 0.011, 0.01)
        add_sphere(flames, (x, 0, z + 0.27), 0.007, (1, 1, 2.3))
    mesh_object("Candelabra", bm, gm)
    mesh_object("Tapers", wax, mat("Wax", (0.96, 0.94, 0.88), 0.0, 0.4, **{"Subsurface Weight": 0.6}))
    mesh_object("Flames", flames, lib.emission("Flame", (1.0, 0.62, 0.25), 40.0))


def neon_sign(text_paths=None):
    """'Better Together' style script neon: tubes on a clear acrylic backer."""
    back = bmesh.new()
    add_box(back, (0, 0.02, 0.6), (1.4, 0.012, 0.7))
    mesh_object("Backer", back, lib.acrylic(thin=True))
    tube = bmesh.new()
    rng = random.Random(1)
    # a cursive-ish heart + underline swash
    pts = []
    for i in range(121):
        t = 2 * math.pi * i / 120
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((x * 0.014 - 0.3, 0, 0.62 + y * 0.014))
    add_polyline(tube, pts, 0.008, segments=8, joints=False)
    sw = [(-0.6 + 1.2 * i / 60, 0, 0.36 + 0.03 * math.sin(i / 60 * 2 * math.pi * 1.5)) for i in range(61)]
    add_polyline(tube, sw, 0.008, segments=8, joints=False)
    loops = []
    for i in range(161):  # cursive loops 'love'
        t = i / 160
        x = 0.05 + 0.5 * t
        loops.append((x + 0.05 * math.sin(t * 2 * math.pi * 4), 0, 0.6 + 0.09 * math.cos(t * 2 * math.pi * 4) * (0.6 + 0.4 * math.sin(t * 9))))
    add_polyline(tube, loops, 0.008, segments=8, joints=False)
    mesh_object("Neon", tube, lib.emission("NeonPink", (1.0, 0.25, 0.55), 18))
    lib.bpy.ops.object.light_add(type="POINT", location=(0, -0.2, 0.6))
    l = lib.bpy.context.object
    l.data.energy, l.data.color = 30, (1.0, 0.3, 0.6)


def photo_booth_360():
    bm = bmesh.new()
    add_disc(bm, (0, 0, 0.09), 0.6, 0.18, 96)
    mesh_object("Platform", bm, mat("PlatformTop", (0.92, 0.92, 0.92), 0.0, 0.25, **{"Coat Weight": 0.7}))
    rim = bmesh.new()
    add_ring(rim, (0, 0, 0.12), (0, 0, 1), 0.6, 0.012, segs=96, ring=6)
    mesh_object("LEDRing", rim, lib.emission("RingLED", (0.9, 0.95, 1.0), 10))
    arm = bmesh.new()
    add_rod(arm, (0.55, 0, 0.17), (0.55, 0, 0.25), 0.03)
    add_rod(arm, (0.55, 0, 0.25), (0.5, 0, 1.9), 0.018)
    add_rod(arm, (0.5, 0, 1.9), (0.2, 0, 2.4), 0.018)
    mesh_object("Arm", arm, lib.black_metal())
    ph = bmesh.new()
    add_box(ph, (0.5, -0.03, 1.4), (0.09, 0.012, 0.17))
    mesh_object("Phone", ph, mat("Phone", (0.02, 0.02, 0.02), 0.3, 0.1))
    st = bmesh.new()
    for x in (-0.9, 0.9):
        add_rod(st, (x, 0.7, 0), (x, 0.7, 1.0), 0.02)
        add_sphere(st, (x, 0.7, 1.0), 0.03)
    add_rod(st, (-0.9, 0.7, 0.95), (0.9, 0.7, 0.95), 0.012)
    mesh_object("Stanchions", st, lib.gold_metal())


def mirror_booth():
    bm = bmesh.new()
    add_box(bm, (0, 0, 0.93), (0.75, 0.25, 1.86))
    ob = mesh_object("Body", bm, lib.gold_metal(0.25))
    bevel(ob, 0.04, 4)
    m = bmesh.new()
    add_box(m, (0, -0.13, 1.05), (0.62, 0.01, 1.45))
    mesh_object("Mirror", m, mat("MirrorGlass", (0.95, 0.95, 0.96), 1.0, 0.02))
    t = bmesh.new()
    for i, line in enumerate((0.25, 0.18, 0.22)):
        add_box(t, (0, -0.136, 1.35 - i * 0.07), (line, 0.003, 0.025))
    for i in range(18):
        a = 2 * math.pi * i / 18
        add_sphere(t, (0.18 * math.cos(a), -0.137, 1.0 + 0.18 * math.sin(a)), 0.006, subdiv=1)
    mesh_object("Text", t, lib.emission("MirrorText", (1.0, 0.9, 0.75), 6))


def champagne_wall():
    w = bmesh.new()
    add_box(w, (0, 0.03, 1.05), (1.2, 0.06, 1.9))
    add_box(w, (0, 0.03, 0.05), (1.4, 0.4, 0.1))
    ob = mesh_object("Wall", w, mat("WallWhite", (0.93, 0.92, 0.89), 0.0, 0.5))
    bevel(ob, 0.01, 2)
    import tableware as TW
    pegs = bmesh.new()
    for r in range(6):
        for c in range(6):
            x, z = -0.45 + c * 0.18, 0.4 + r * 0.26
            add_rod(pegs, (x, -0.0, z), (x, -0.06, z), 0.03, segments=16)
            ob = TW.stemware(TW.GLASSES["champagne-flute"], "Flute")
            ob.location = (x, -0.04, z - 0.105)
            liq = bmesh.new()
            lathe(liq, [(0, 0.12), (0.017, 0.118), (0.022, 0.17), (0.0, 0.17)], 24, center=(x, -0.04, z - 0.105))
            mesh_object("Bubbly", liq, mat("Champagne", (0.98, 0.88, 0.55), 0.0, 0.05, **{"Transmission Weight": 1.0, "IOR": 1.33}))
    mesh_object("Holders", pegs, lib.gold_metal())
    sign = bmesh.new()
    add_box(sign, (0, -0.005, 1.88), (0.7, 0.01, 0.12))
    mesh_object("Sign", sign, lib.gold_metal(0.3))


# --- Games & kids --------------------------------------------------------------

def bounce_house():
    cols = [(0.85, 0.12, 0.12), (0.10, 0.30, 0.80), (0.98, 0.80, 0.10)]
    red, blue, yel = [mat(f"Vinyl{i}", c, 0.0, 0.3, **{"Coat Weight": 0.5}) for i, c in enumerate(cols)]
    S = 4.6
    base = bmesh.new()
    add_box(base, (0, 0, 0.25), (S, S, 0.5))
    ob = mesh_object("Base", base, blue)
    bevel(ob, 0.2, 5)
    subsurf(ob, 1)
    walls = bmesh.new()
    for sx, sy, w, d in ((0, S / 2 - 0.15, S, 0.3), (0, -S / 2 + 0.15, S * 0.3, 0.3), (S / 2 - 0.15, 0, 0.3, S), (-S / 2 + 0.15, 0, 0.3, S)):
        add_box(walls, (sx, sy, 1.2), (w, d, 1.4))
    wo = mesh_object("Walls", walls, red)
    bevel(wo, 0.12, 4)
    subsurf(wo, 1)
    for sx in (-1, 1):
        add = bmesh.new()
        add_box(add, (sx * S * 0.32, -S / 2 + 0.15, 1.2), (S * 0.36, 0.3, 1.4))
        mo = mesh_object("Mesh", add, mat("Net", (0.05, 0.05, 0.05), 0.0, 0.8, **{"Alpha": 0.35}))
    towers = bmesh.new()
    for sx in (-1, 1):
        for sy in (-1, 1):
            add_rod(towers, (sx * S / 2, sy * S / 2, 0.3), (sx * S / 2, sy * S / 2, 2.6), 0.32, segments=32)
            add_sphere(towers, (sx * S / 2, sy * S / 2, 2.6), 0.32, subdiv=3)
    mesh_object("Towers", towers, yel)
    caps = bmesh.new()
    for sx in (-1, 1):
        for sy in (-1, 1):
            bmesh.ops.create_cone(caps, cap_ends=True, segments=32, radius1=0.38, radius2=0.0, depth=0.7, matrix=Matrix.Translation((sx * S / 2, sy * S / 2, 3.1)))
    mesh_object("Caps", caps, red)
    roof = bmesh.new()
    add_box(roof, (0, 0, 2.8), (S, S, 0.12))
    mesh_object("Roof", roof, blue)


def yard_games():
    w = lib.wood("Pine", (0.80, 0.65, 0.45), (0.68, 0.52, 0.34), stretch=(1, 8, 8))
    j = bmesh.new()
    bl = 0.38
    for lvl in range(14):
        for k in range(3):
            if lvl in (9, 11) and k == 1:
                continue
            if lvl % 2 == 0:
                add_box(j, (-0.6, -0.13 + k * 0.13, 0.04 + lvl * 0.078), (bl, 0.12, 0.074))
            else:
                add_box(j, (-0.6 - 0.13 + k * 0.13, 0, 0.04 + lvl * 0.078), (0.12, bl, 0.074))
    jo = mesh_object("Tumble", j, w, smooth=False)
    bevel(jo, 0.006, 2)
    c = bmesh.new()
    add_box(c, (0.55, 0.2, 0.18), (0.61, 1.22, 0.02), rot_z=0)
    co = mesh_object("Cornhole", c, mat("CornholeTop", (0.92, 0.90, 0.86), 0.0, 0.4))
    co.rotation_euler = (math.radians(-12), 0, 0)
    hole = bmesh.new()
    add_disc(hole, (0.55, 0.55, 0.255), 0.076, 0.022, 48)
    ho = mesh_object("Hole", hole, mat("Hole", (0.02, 0.02, 0.02), 0.0, 0.9))
    stripe = bmesh.new()
    add_box(stripe, (0.55, -0.05, 0.13), (0.62, 0.12, 0.022))
    so = mesh_object("Stripe", stripe, mat("Navy", (0.08, 0.12, 0.28), 0.0, 0.5))
    so.rotation_euler = (math.radians(-12), 0, 0)
    bags = bmesh.new()
    for i in range(4):
        add_box(bags, (0.25 + i * 0.12, -0.6, 0.02), (0.15, 0.15, 0.04), rot_z=i * 0.4)
    bo = mesh_object("Bags", bags, fabric("Bags", (0.70, 0.10, 0.12), 0.4))
    bevel(bo, 0.015, 3)
    subsurf(bo, 1)


def popcorn_machine():
    red = mat("CartRed", (0.70, 0.04, 0.05), 0.2, 0.3, **{"Coat Weight": 0.6})
    cart = bmesh.new()
    add_box(cart, (0, 0, 0.5), (0.65, 0.5, 0.6))
    ob = mesh_object("Cart", cart, red)
    bevel(ob, 0.015, 3)
    wh = bmesh.new()
    for sx in (-1, 1):
        lib.add_ring(wh, (sx * 0.36, 0.0, 0.22), (1, 0, 0), 0.18, 0.025, segs=32, ring=8)
        for k in range(8):
            a = math.pi * k / 4
            add_rod(wh, (sx * 0.36, 0, 0.22), (sx * 0.36, 0.17 * math.cos(a), 0.22 + 0.17 * math.sin(a)), 0.006)
    add_rod(wh, (-0.37, 0, 0.22), (0.37, 0, 0.22), 0.012)
    mesh_object("Wheels", wh, lib.black_metal())
    lg = bmesh.new()
    add_rod(lg, (0, -0.2, 0.0), (0, -0.2, 0.2), 0.02)
    mesh_object("Leg", lg, lib.black_metal())
    box = bmesh.new()
    add_box(box, (0, 0, 1.12), (0.62, 0.45, 0.62))
    mesh_object("Cabinet", box, lib.glass())
    fr = bmesh.new()
    for sx in (-1, 1):
        for sy in (-1, 1):
            add_beam(fr, (sx * 0.31, sy * 0.225, 0.8), (sx * 0.31, sy * 0.225, 1.44), 0.03)
    add_box(fr, (0, 0, 1.46), (0.66, 0.49, 0.05))
    add_box(fr, (0, 0, 1.6), (0.6, 0.45, 0.22))
    fo = mesh_object("Frame", fr, red, smooth=False)
    bevel(fo, 0.006, 2)
    corn = bmesh.new()
    rng = random.Random(1)
    for _ in range(700):
        x, y = rng.uniform(-0.28, 0.28), rng.uniform(-0.2, 0.2)
        z = 0.83 + rng.uniform(0, 0.15) * (1 - abs(x) / 0.4)
        add_sphere(corn, (x, y, z), rng.uniform(0.012, 0.018), subdiv=1)
    mesh_object("Popcorn", corn, mat("Popcorn", (0.98, 0.92, 0.72), 0.0, 0.7, **{"Subsurface Weight": 0.3}))
    kettle = bmesh.new()
    lathe(kettle, [(0, 1.30), (0.1, 1.30), (0.11, 1.36), (0.1, 1.40), (0, 1.40)], 32)
    add_rod(kettle, (0, 0, 1.40), (0, 0, 1.44), 0.01)
    mesh_object("Kettle", kettle, lib.steel(0.2))


def cotton_candy():
    cart = bmesh.new()
    add_box(cart, (0, 0, 0.45), (0.7, 0.5, 0.9))
    ob = mesh_object("Cart", cart, mat("CartPink", (0.95, 0.55, 0.70), 0.0, 0.35, **{"Coat Weight": 0.5}))
    bevel(ob, 0.02, 3)
    pan = bmesh.new()
    lathe(pan, [(0, 0.9), (0.30, 0.9), (0.33, 1.05), (0.34, 1.12)], 64, thickness=0.004)
    mesh_object("Pan", pan, lib.steel(0.2))
    dome = bmesh.new()
    lathe(dome, [(0.34, 1.12), (0.30, 1.28), (0.2, 1.36), (0.0, 1.38)], 64, thickness=0.003)
    mesh_object("Dome", dome, lib.acrylic(thin=True))
    floss = bmesh.new()
    lathe(floss, [(0.08, 0.95), (0.28, 0.98), (0.31, 1.05), (0.25, 1.08), (0.08, 1.02)], 48)
    fo = mesh_object("Floss", floss, mat("Floss", (1.0, 0.70, 0.85), 0.0, 0.9, **{"Subsurface Weight": 0.6, "Sheen Weight": 1.0}))
    subsurf(fo, 2)
    cones = bmesh.new()
    for i, x in enumerate((-0.25, 0.25)):
        add_rod(cones, (x, -0.28, 0.92), (x, -0.28, 1.25), 0.008)
        add_sphere(cones, (x, -0.28, 1.28), 0.08, (1, 1, 1.3), subdiv=3)
    mesh_object("Cones", cones, mat("Floss2", (0.75, 0.82, 1.0), 0.0, 0.9, **{"Subsurface Weight": 0.6, "Sheen Weight": 1.0}))


def soft_play():
    cols = [(0.95, 0.93, 0.88), (0.85, 0.78, 0.70), (0.72, 0.80, 0.74), (0.93, 0.80, 0.78)]
    ms = [mat(f"Soft{i}", c, 0.0, 0.5, **{"Sheen Weight": 0.3}) for i, c in enumerate(cols)]
    mat_floor = bmesh.new()
    add_box(mat_floor, (0, 0, 0.02), (3.0, 3.0, 0.04))
    mesh_object("Mat", mat_floor, ms[1])
    fence = bmesh.new()
    for i in range(12):
        a = 2 * math.pi * i / 12
        add_rod(fence, (1.3 * math.cos(a), 1.3 * math.sin(a), 0.04), (1.3 * math.cos(a), 1.3 * math.sin(a), 0.65), 0.025)
    for z in (0.3, 0.62):
        add_ring(fence, (0, 0, z), (0, 0, 1), 1.3, 0.018, segs=72, ring=8)
    mesh_object("Fence", fence, ms[0])
    pieces = [(ms[2], "step", (-0.5, 0.3)), (ms[3], "arch", (0.4, 0.3)), (ms[0], "cube", (0.0, -0.4))]
    for m, kind, (x, y) in pieces:
        b = bmesh.new()
        if kind == "step":
            add_box(b, (x, y, 0.15), (0.6, 0.5, 0.25))
            add_box(b, (x + 0.15, y, 0.35), (0.3, 0.5, 0.2))
        elif kind == "arch":
            add_ring(b, (x, y, 0.06), (0, 1, 0), 0.32, 0.1, segs=32, ring=12, scale=(1, 1))
        else:
            add_box(b, (x, y, 0.2), (0.35, 0.35, 0.35))
        ob = mesh_object("Soft", b, m)
        bevel(ob, 0.04, 4)
    balls = bmesh.new()
    rng = random.Random(5)
    for _ in range(40):
        a, d = rng.uniform(0, 6.3), rng.uniform(0, 1.1)
        add_sphere(balls, (d * math.cos(a), d * math.sin(a), 0.08), 0.04, subdiv=2)
    mesh_object("Balls", balls, ms[3])


# ---------------------------------------------------------------------------

item("dance-floor", "floors", lambda: dance_floor(False),
     "3D render of a 16 by 16 foot black and white checkerboard dance floor with silver trim for wedding receptions",
     "16' x 16' black and white dance floor", cam=dict(az=-30, el=32, lens=50, pad=1.05))
item("led-dance-floor", "floors", lambda: dance_floor(True),
     "3D render of a 16 by 16 foot black starlit LED dance floor glowing with twinkling white lights",
     "16' x 16' starlit LED dance floor", cam=dict(az=-30, el=32, lens=50, pad=1.05))
item("stage-deck", "floors", stage_deck,
     "3D render of a 16 by 8 foot event stage deck, 24 inches high, with black carpet, pleated skirting and steps",
     "16' x 8' stage with skirt and steps", cam=dict(az=-30, el=18, lens=50, pad=1.08))
item("string-lights", "lighting", string_lights_studio,
     "3D render of warm white bistro string lights draped between two black poles for patios, tents and backyard weddings",
     "Bistro string lights", cam=dict(az=-15, el=8, lens=50, pad=1.08))
item("uplight", "lighting", uplight,
     "3D render of a wireless LED uplight casting a pink wash of light up a wall, used to color venue walls and drapes",
     "Wireless LED uplight", cam=dict(az=-25, el=18, lens=85, pad=2.6))
item("chandelier", "lighting", chandelier,
     "3D render of a two-tier gold and crystal chandelier with candle bulbs for tent and ballroom ceilings",
     "Gold crystal chandelier", cam=dict(az=-20, el=5, lens=85, pad=1.12))
item("pipe-and-drape", "lighting", pipe_and_drape,
     "3D render of an ivory pipe and drape backdrop, 8 feet tall and 20 feet wide, on silver uprights",
     "Ivory pipe and drape backdrop", cam=dict(az=-20, el=8, lens=50, pad=1.08))
item("patio-heater", "heating", patio_heater,
     "3D render of a stainless steel mushroom propane patio heater for fall and winter outdoor events in Chicago",
     "Propane patio heater", cam=dict(az=-30, el=10, lens=70, pad=1.12))
item("tent-heater", "heating", tent_heater,
     "3D render of a forced-air tent heater with flexible silver ducting for warming tents at cold-weather Chicago events",
     "Forced-air tent heater", cam=dict(az=-40, el=18, lens=50, pad=1.1))
item("lounge-sofa", "lounge", lambda: lounge_sofa(2.0),
     "3D render of an ivory tufted velvet lounge sofa with gold legs for cocktail hour and VIP lounges",
     "Ivory velvet lounge sofa", cam=dict(az=-30, el=14, lens=70, pad=1.1))
item("lounge-armchair", "lounge", lambda: lounge_sofa(0.9),
     "3D render of an ivory tufted velvet lounge armchair with gold legs",
     "Ivory velvet lounge armchair", cam=dict(az=-30, el=14, lens=70, pad=1.12))
item("coffee-table", "lounge", coffee_table,
     "3D render of a gold frame coffee table with a glass top and marble shelf for event lounge areas",
     "Gold and glass coffee table", cam=dict(az=-30, el=24, lens=70, pad=1.1))
item("ceremony-arch", "decor", ceremony_arch,
     "3D render of a wooden hexagon wedding ceremony arch draped with ivory chiffon and blush and ivory roses",
     "Hexagon ceremony arch with florals", cam=dict(az=-15, el=6, lens=50, pad=1.08))
item("flower-wall", "decor", flower_wall,
     "3D render of an 8 by 8 foot blush and ivory rose flower wall on a gold stand, a photo backdrop for weddings and showers",
     "8' x 8' rose flower wall", cam=dict(az=-12, el=6, lens=50, pad=1.08))
item("marquee-letters", "decor", marquee_letters,
     "3D render of 4-foot light-up marquee letters spelling LOVE with warm bulbs for weddings and engagement parties",
     "4 ft LOVE marquee letters", cam=dict(az=-12, el=8, lens=50, pad=1.1))
item("candle-holder", "decor", candle_holder,
     "3D render of a gold three-arm candelabra with ivory taper candles for reception centerpieces",
     "Gold candelabra", cam=dict(az=-20, el=10, lens=85, pad=1.15))
item("neon-sign", "decor", neon_sign,
     "3D render of a pink LED neon sign with a heart and script on a clear acrylic backer for weddings, showers and birthdays",
     "Custom-style LED neon sign", cam=dict(az=-10, el=4, lens=70, pad=1.1))
item("photo-booth-360", "photo-booths", photo_booth_360,
     "3D render of a 360 photo booth platform with a rotating camera arm, LED ring and gold stanchions",
     "360 photo booth", cam=dict(az=-30, el=14, lens=50, pad=1.12))
item("mirror-photo-booth", "photo-booths", mirror_booth,
     "3D render of a gold-framed interactive mirror photo booth with glowing animated text",
     "Mirror photo booth", cam=dict(az=-28, el=8, lens=70, pad=1.12))
item("champagne-wall", "catering", champagne_wall,
     "3D render of a white champagne wall holding 36 filled champagne flutes on gold holders for a welcome-drink display",
     "Champagne wall (36 flutes)", cam=dict(az=-20, el=6, lens=70, pad=1.08))
item("bounce-house", "games", bounce_house,
     "3D render of a red, blue and yellow inflatable castle bounce house for kids' birthday parties",
     "Castle bounce house", env="lawn", lawn=dict(sun_elev=35, sun_rot=210), cam=dict(az=-30, el=14, lens=50, pad=1.1))
item("yard-games", "games", yard_games,
     "3D render of giant wooden tumble tower blocks and a cornhole board with bean bags for outdoor parties",
     "Giant tumble tower and cornhole", env="lawn", lawn=dict(sun_elev=30, sun_rot=210), cam=dict(az=-25, el=18, lens=50, pad=1.15))
item("popcorn-machine", "concessions", popcorn_machine,
     "3D render of a red vintage popcorn machine cart filled with fresh popcorn for parties and school events",
     "Popcorn machine cart", cam=dict(az=-30, el=12, lens=70, pad=1.1))
item("cotton-candy-machine", "concessions", cotton_candy,
     "3D render of a pink cotton candy machine cart with spun pink and blue cotton candy",
     "Cotton candy machine", cam=dict(az=-30, el=12, lens=70, pad=1.12))
item("soft-play", "games", soft_play,
     "3D render of a neutral-toned toddler soft play set with padded fence, steps, arch and balls",
     "Toddler soft play set", cam=dict(az=-30, el=32, lens=50, pad=1.08))
