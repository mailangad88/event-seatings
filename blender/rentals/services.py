"""Concessions, restrooms and power, fencing and crowd control, AV and sound (catalog categories added Nov 2)."""

import math
import random

import bmesh

import lib
from catalog import item
from lib import add_beam, add_box, add_disc, add_rod, add_sphere, bevel, lathe, mat, mesh_object

FT = 0.3048
IN = 0.0254


def _wheels(bm, xs, y, r, z=None, axis_w=0.05):
    for x in xs:
        bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=r, radius2=r, depth=axis_w,
                              matrix=lib.Matrix.Translation((x, y, z if z is not None else r)) @ lib.Matrix.Rotation(math.pi / 2, 4, "X"))


# ---------------------------------------------------------------------------
# Concessions
# ---------------------------------------------------------------------------

def snow_cone_machine():
    blue = lib.plastic((0.08, 0.30, 0.70))
    base = bmesh.new()
    add_box(base, (0, 0, 0.06), (0.42, 0.36, 0.12))
    add_box(base, (0, 0.13, 0.42), (0.42, 0.10, 0.64))
    add_box(base, (0, 0.0, 0.70), (0.42, 0.36, 0.10))
    bevel(mesh_object("Body", base, blue), 0.012, 3)
    cab = bmesh.new()
    add_box(cab, (0, -0.03, 0.39), (0.40, 0.30, 0.52))
    mesh_object("Cabinet", cab, lib.acrylic(thin=True))
    ice = bmesh.new()
    rng = random.Random(4)
    for _ in range(260):
        x, y = rng.uniform(-0.17, 0.17), rng.uniform(-0.15, 0.09)
        add_sphere(ice, (x, y, 0.13 + rng.uniform(0, 0.09) * (1 - abs(x) / 0.25)), rng.uniform(0.012, 0.02), subdiv=1)
    mesh_object("Ice", ice, mat("Ice", (0.92, 0.95, 1.0), 0.0, 0.25, **{"Subsurface Weight": 0.4, "Transmission Weight": 0.3}))
    hopper = bmesh.new()
    lathe(hopper, [(0, 0.75), (0.09, 0.75), (0.11, 0.86), (0, 0.86)], 32)
    mesh_object("Hopper", hopper, lib.steel(0.25))
    # three cones of shaved ice in front
    for i, (col, x) in enumerate((((0.85, 0.06, 0.10), -0.32), ((0.10, 0.35, 0.85), 0.30), ((0.95, 0.75, 0.10), 0.40))):
        cone = bmesh.new()
        lathe(cone, [(0, 0), (0.035, 0.11)], 24, center=(x, -0.18 + 0.05 * i, 0.0008), cap=False)
        mesh_object(f"Cone{i}", cone, lib.plastic((0.97, 0.97, 0.95), 0.6))
        top = bmesh.new()
        add_sphere(top, (x, -0.18 + 0.05 * i, 0.12), 0.045, scale=(1, 1, 0.8))
        mesh_object(f"Shave{i}", top, mat(f"Syrup{i}", col, 0.0, 0.4, **{"Subsurface Weight": 0.5}))


def nacho_cheese_warmer():
    steel = lib.steel(0.25)
    body = bmesh.new()
    add_box(body, (0, 0, 0.14), (0.26, 0.32, 0.28))
    bevel(mesh_object("Warmer", body, steel), 0.01, 3)
    pump = bmesh.new()
    add_rod(pump, (0, 0.02, 0.28), (0, 0.02, 0.36), 0.03)
    add_rod(pump, (0, 0.02, 0.36), (0, -0.14, 0.36), 0.012)
    add_rod(pump, (0, -0.14, 0.36), (0, -0.14, 0.32), 0.008)
    add_rod(pump, (0, 0.02, 0.36), (0, 0.02, 0.44), 0.008)
    add_disc(pump, (0, 0.02, 0.45), 0.035, 0.015, 32)
    mesh_object("Pump", pump, lib.black_metal())
    panel = bmesh.new()
    add_box(panel, (0, -0.161, 0.17), (0.2, 0.004, 0.12))
    mesh_object("Label", panel, mat("CheeseLabel", (0.95, 0.62, 0.08), 0.0, 0.4))
    tray = bmesh.new()
    add_box(tray, (0.32, -0.05, 0.02), (0.24, 0.18, 0.04))
    mesh_object("Tray", tray, lib.plastic((0.12, 0.12, 0.12), 0.5))
    chips = bmesh.new()
    rng = random.Random(2)
    for _ in range(40):
        c = (0.32 + rng.uniform(-0.09, 0.09), -0.05 + rng.uniform(-0.06, 0.06), 0.045 + rng.uniform(0, 0.03))
        bmesh.ops.create_cone(chips, cap_ends=True, segments=3, radius1=0.03, radius2=0.03, depth=0.004,
                              matrix=lib.Matrix.Translation(c) @ lib.Matrix.Rotation(rng.uniform(-0.6, 0.6), 4, "X") @ lib.Matrix.Rotation(rng.uniform(0, 6), 4, "Z"))
    mesh_object("Chips", chips, mat("Chip", (0.85, 0.62, 0.25), 0.0, 0.6))
    cheese = bmesh.new()
    add_sphere(cheese, (0.32, -0.05, 0.07), 0.05, scale=(1.2, 0.9, 0.35))
    mesh_object("Cheese", cheese, mat("Cheese", (0.95, 0.62, 0.05), 0.0, 0.3, **{"Subsurface Weight": 0.4}))


def hot_dog_roller():
    """Steamer-style hot dog warmer: stainless base, glass display hood with hot dogs, bun drawer."""
    steel = lib.steel(0.2)
    body = bmesh.new()
    add_box(body, (0, 0, 0.12), (0.5, 0.36, 0.24))
    add_box(body, (0, 0, 0.535), (0.5, 0.36, 0.03))
    for sx in (-1, 1):
        add_box(body, (sx * 0.24, 0, 0.385), (0.02, 0.36, 0.27))
    bevel(mesh_object("Base", body, steel), 0.006, 2)
    hood = bmesh.new()
    add_box(hood, (0, -0.17, 0.385), (0.46, 0.006, 0.27))
    add_box(hood, (0, 0.17, 0.385), (0.46, 0.006, 0.27))
    mesh_object("GlassHood", hood, lib.acrylic(thin=True))
    tray = bmesh.new()
    add_box(tray, (0, 0, 0.26), (0.44, 0.32, 0.02))
    mesh_object("SteamTray", tray, lib.silver_metal(0.3))
    dogs = bmesh.new()
    rng = random.Random(3)
    for i in range(10):
        x0, y = rng.uniform(-0.12, 0.12), -0.12 + 0.24 * (i % 5) / 4
        z = 0.285 + 0.03 * (i // 5)
        a = rng.uniform(-0.25, 0.25)
        dx, dy = 0.075 * math.cos(a), 0.075 * math.sin(a)
        add_rod(dogs, (x0 - dx, y - dy, z), (x0 + dx, y + dy, z), 0.013, segments=16)
        add_sphere(dogs, (x0 - dx, y - dy, z), 0.013, subdiv=2)
        add_sphere(dogs, (x0 + dx, y + dy, z), 0.013, subdiv=2)
    mesh_object("HotDogs", dogs, mat("HotDog", (0.55, 0.18, 0.07), 0.0, 0.35, **{"Subsurface Weight": 0.3}))
    drawer = bmesh.new()
    add_box(drawer, (0, -0.181, 0.12), (0.42, 0.006, 0.16))
    mesh_object("BunDrawer", drawer, lib.steel(0.35))
    handle = bmesh.new()
    add_rod(handle, (-0.1, -0.2, 0.15), (0.1, -0.2, 0.15), 0.008)
    add_rod(handle, (-0.25, 0, 0.56), (0.25, 0, 0.56), 0.01)
    mesh_object("Handles", handle, lib.black_metal())
    dial = bmesh.new()
    bmesh.ops.create_cone(dial, cap_ends=True, segments=24, radius1=0.018, radius2=0.018, depth=0.02,
                          matrix=lib.Matrix.Translation((0.17, -0.19, 0.06)) @ lib.Matrix.Rotation(math.pi / 2, 4, "X"))
    mesh_object("Dial", dial, lib.black_metal())
    buns = bmesh.new()
    for x in (-0.36, -0.3):
        add_sphere(buns, (x, -0.1, 0.03), 0.03, scale=(1, 3.2, 0.8))
    mesh_object("Buns", buns, mat("Bun", (0.78, 0.52, 0.25), 0.0, 0.6, **{"Subsurface Weight": 0.2}))


# ---------------------------------------------------------------------------
# AV and sound
# ---------------------------------------------------------------------------

def _speaker(bm_box, bm_cone, x, y, z):
    add_box(bm_box, (x, y, z + 0.33), (0.36, 0.32, 0.66))
    for zz, r in ((z + 0.22, 0.13), (z + 0.53, 0.05)):
        bmesh.ops.create_cone(bm_cone, cap_ends=True, segments=32, radius1=r, radius2=r * 0.6, depth=0.03,
                              matrix=lib.Matrix.Translation((x, y - 0.16, zz)) @ lib.Matrix.Rotation(math.pi / 2, 4, "X"))


def pa_system():
    box, cone, stand = bmesh.new(), bmesh.new(), bmesh.new()
    for x in (-0.9, 0.9):
        for k in range(3):
            a = 2 * math.pi * k / 3 + 0.5
            add_rod(stand, (x, 0, 1.05), (x + 0.45 * math.cos(a), 0.45 * math.sin(a), 0.0008), 0.014)
        add_rod(stand, (x, 0, 0.6), (x, 0, 1.3), 0.02)
        _speaker(box, cone, x, 0, 1.3)
    bevel(mesh_object("Cabinets", box, mat("SpeakerBlack", (0.03, 0.03, 0.035), 0.0, 0.7)), 0.02, 3)
    mesh_object("Drivers", cone, mat("Grille", (0.08, 0.08, 0.09), 0.3, 0.5))
    mesh_object("Stands", stand, lib.black_metal())
    mic = bmesh.new()
    add_rod(mic, (0, 0, 0.0008), (0, 0, 1.45), 0.012)
    add_disc(mic, (0, 0, 0.012), 0.14, 0.02, 32)
    add_rod(mic, (0, 0, 1.45), (0, -0.25, 1.55), 0.009)
    mesh_object("MicStand", mic, lib.black_metal())
    head = bmesh.new()
    add_rod(head, (0, -0.25, 1.55), (0, -0.38, 1.6), 0.018, 0.022)
    add_sphere(head, (0, -0.4, 1.61), 0.027)
    mesh_object("Mic", head, lib.steel(0.3))
    mixer = bmesh.new()
    add_box(mixer, (0.35, -0.1, 0.05), (0.32, 0.24, 0.1))
    mesh_object("Mixer", mixer, mat("MixerGrey", (0.12, 0.12, 0.13), 0.3, 0.4))


def wireless_microphone():
    mic = bmesh.new()
    lathe(mic, [(0, 0), (0.016, 0.0), (0.019, 0.05), (0.024, 0.17), (0.026, 0.2), (0, 0.2)], 48, center=(0, 0, 0))
    ob = mesh_object("Handle", mic, mat("MicBody", (0.04, 0.04, 0.045), 0.4, 0.35))
    head = bmesh.new()
    add_sphere(head, (0, 0, 0.235), 0.033, subdiv=3)
    hob = mesh_object("Grille", head, lib.silver_metal(0.35))
    ring = bmesh.new()
    add_disc(ring, (0, 0, 0.2), 0.028, 0.012, 48)
    rob = mesh_object("Ring", ring, lib.steel(0.25))
    for o in (ob, hob, rob):  # lay it at an angle on a small stand
        o.rotation_euler = (math.radians(-60), 0, 0)
        o.location = (0, 0.05, 0.03)
    rx = bmesh.new()
    add_box(rx, (0.2, 0.05, 0.03), (0.2, 0.15, 0.05))
    add_rod(rx, (0.13, 0.11, 0.05), (0.13, 0.11, 0.2), 0.004)
    add_rod(rx, (0.27, 0.11, 0.05), (0.27, 0.11, 0.2), 0.004)
    mesh_object("Receiver", rx, mat("MixerGrey", (0.12, 0.12, 0.13), 0.3, 0.4))
    cradle = bmesh.new()
    add_box(cradle, (0, -0.02, 0.02), (0.08, 0.12, 0.04))
    mesh_object("Cradle", cradle, lib.black_metal())


def projector():
    body = bmesh.new()
    add_box(body, (0, 0, 0.06), (0.34, 0.26, 0.11))
    bevel(mesh_object("Projector", body, mat("ProjWhite", (0.88, 0.88, 0.87), 0.0, 0.35)), 0.02, 4)
    lens = bmesh.new()
    bmesh.ops.create_cone(lens, cap_ends=True, segments=32, radius1=0.045, radius2=0.045, depth=0.03,
                          matrix=lib.Matrix.Translation((0.08, -0.135, 0.06)) @ lib.Matrix.Rotation(math.pi / 2, 4, "X"))
    mesh_object("LensBarrel", lens, lib.black_metal())
    glassb = bmesh.new()
    add_disc(glassb, (0, 0, 0), 0.035, 0.004, 32)
    g = mesh_object("Lens", glassb, mat("LensGlass", (0.05, 0.08, 0.12), 0.0, 0.05, **{"Coat Weight": 1.0}))
    g.rotation_euler = (math.pi / 2, 0, 0)
    g.location = (0.08, -0.152, 0.06)
    vent = bmesh.new()
    for i in range(8):
        add_box(vent, (-0.12 + i * 0.012, -0.131, 0.06), (0.005, 0.004, 0.06))
    mesh_object("Vent", vent, lib.black_metal())


def projection_screen():
    W, H = 8 * FT, 6 * FT
    scr = bmesh.new()
    add_box(scr, (0, 0, 0.75 + H / 2), (W, 0.01, H))
    mesh_object("Screen", scr, mat("ScreenWhite", (0.93, 0.93, 0.92), 0.0, 0.85))
    border = bmesh.new()
    for z in (0.75, 0.75 + H):
        add_box(border, (0, -0.006, z), (W, 0.005, 0.05))
    for sx in (-1, 1):
        add_box(border, (sx * W / 2, -0.006, 0.75 + H / 2), (0.05, 0.005, H))
    mesh_object("Border", border, mat("SpeakerBlack", (0.03, 0.03, 0.035), 0.0, 0.7))
    st = bmesh.new()
    add_rod(st, (0, 0.05, 0.6), (0, 0.05, 0.75 + H + 0.05), 0.022)
    add_beam(st, (-W / 2, 0.05, 0.75 + H + 0.03), (W / 2, 0.05, 0.75 + H + 0.03), 0.04)
    add_rod(st, (-W / 2, 0.05, 0.72), (W / 2, 0.05, 0.72), 0.03)
    for k in range(3):
        a = math.pi / 2 + 2 * math.pi * k / 3
        add_rod(st, (0, 0.05, 0.6), (0.7 * math.cos(a), 0.05 + 0.7 * math.sin(a), 0.0008), 0.016)
    mesh_object("Tripod", st, lib.black_metal())


def podium():
    wood = lib.wood("PodiumWood", (0.42, 0.25, 0.12), (0.26, 0.14, 0.06), stretch=(1, 1, 6))
    b = bmesh.new()
    add_box(b, (0, 0, 0.03), (0.62, 0.52, 0.06))
    add_box(b, (0, 0, 0.6), (0.52, 0.42, 1.08))
    bevel(mesh_object("Lectern", b, wood), 0.01, 2)
    top = bmesh.new()
    v = [top.verts.new(p) for p in ((-0.33, -0.3, 1.14), (0.33, -0.3, 1.14), (0.33, 0.25, 1.26), (-0.33, 0.25, 1.26),
                                    (-0.33, -0.3, 1.12), (0.33, -0.3, 1.12), (0.33, 0.25, 1.12), (-0.33, 0.25, 1.12))]
    for f in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)):
        top.faces.new([v[i] for i in f])
    bevel(mesh_object("Top", top, wood, smooth=False), 0.008, 2)
    lip = bmesh.new()
    add_box(lip, (0, -0.29, 1.16), (0.6, 0.02, 0.03))
    mesh_object("Lip", lip, wood)
    gn = bmesh.new()
    add_rod(gn, (0.2, 0.15, 1.22), (0.2, -0.05, 1.45), 0.005)
    add_rod(gn, (0.2, -0.05, 1.45), (0.2, -0.1, 1.45), 0.009)
    mesh_object("Gooseneck", gn, lib.black_metal())
    panel = bmesh.new()
    add_box(panel, (0, -0.211, 0.75), (0.36, 0.004, 0.36))
    mesh_object("Inset", panel, mat("PodiumInset", (0.30, 0.18, 0.09), 0.0, 0.4))


def tv_with_stand():
    W, H = 1.34, 0.77
    scr = bmesh.new()
    add_box(scr, (0, 0, 1.15 + H / 2), (W, 0.05, H))
    bevel(mesh_object("TV", scr, mat("TVBezel", (0.02, 0.02, 0.022), 0.3, 0.3)), 0.006, 2)
    pic = bmesh.new()
    add_box(pic, (0, -0.026, 1.15 + H / 2), (W - 0.03, 0.002, H - 0.03))
    p = mesh_object("Picture", pic, lib.emission("TVScreen", (0.55, 0.62, 0.75), 1.2))
    st = bmesh.new()
    for sx in (-1, 1):
        add_rod(st, (sx * 0.2, 0.06, 0.12), (sx * 0.2, 0.06, 1.75), 0.025)
    add_beam(st, (-0.3, 0.05, 1.4), (0.3, 0.05, 1.4), 0.04)
    add_beam(st, (-0.35, 0.06, 0.12), (0.35, 0.06, 0.12), 0.05)
    for sx in (-1, 1):
        add_beam(st, (sx * 0.38, -0.35, 0.1), (sx * 0.38, 0.45, 0.1), 0.06, 0.04)
    add_box(st, (0, 0.06, 0.7), (0.55, 0.32, 0.02))
    mesh_object("Stand", st, lib.black_metal())
    wh = bmesh.new()
    for sx in (-1, 1):
        for y in (-0.33, 0.43):
            add_sphere(wh, (sx * 0.38, y, 0.04), 0.04)
    mesh_object("Casters", wh, mat("Rubber", (0.03, 0.03, 0.03), 0.0, 0.8))


# ---------------------------------------------------------------------------
# Restrooms and power
# ---------------------------------------------------------------------------

def _porta(width, depth, body_col, door_col, ada=False):
    h = 2.25
    shell = lib.plastic(body_col, 0.5)
    b = bmesh.new()
    add_box(b, (0, 0, 0.06), (width + 0.06, depth + 0.06, 0.12))
    add_box(b, (0, 0, h / 2 + 0.06), (width, depth, h))
    for sx in (-1, 1):  # moulded corner ribs
        for sy in (-1, 1):
            add_box(b, (sx * width / 2, sy * depth / 2, h / 2 + 0.06), (0.05, 0.05, h))
    bevel(mesh_object("Shell", b, shell), 0.01, 2)
    roof = bmesh.new()
    add_box(roof, (0, 0, h + 0.1), (width + 0.05, depth + 0.05, 0.08))
    add_box(roof, (0, 0, h + 0.2), (width - 0.04, depth - 0.04, 0.12))
    bevel(mesh_object("Roof", roof, mat("RoofWhite", (0.92, 0.93, 0.92), 0.0, 0.4, **{"Subsurface Weight": 0.3})), 0.05, 4)
    door_w = width * (0.82 if ada else 0.72)
    d = bmesh.new()
    add_box(d, (0, -depth / 2 - 0.012, 0.12 + (h - 0.2) / 2), (door_w, 0.025, h - 0.2))
    for z in (0.5, 1.0, 1.5, 1.9):
        add_box(d, (0, -depth / 2 - 0.028, z), (door_w * 0.86, 0.012, 0.03))
    bevel(mesh_object("Door", d, lib.plastic(door_col, 0.45)), 0.006, 2)
    hw = bmesh.new()
    add_box(hw, (door_w / 2 - 0.1, -depth / 2 - 0.04, 1.1), (0.04, 0.03, 0.14))
    add_box(hw, (door_w / 2 - 0.12, -depth / 2 - 0.035, 1.35), (0.09, 0.02, 0.04))
    mesh_object("Latch", hw, lib.steel())
    vent = bmesh.new()
    add_rod(vent, (width / 2 - 0.1, depth / 2 + 0.06, 0.4), (width / 2 - 0.1, depth / 2 + 0.06, h + 0.45), 0.055)
    add_disc(vent, (width / 2 - 0.1, depth / 2 + 0.06, h + 0.47), 0.08, 0.03, 24)
    mesh_object("VentPipe", vent, lib.plastic((0.15, 0.15, 0.15)))
    if ada:
        s = bmesh.new()
        add_box(s, (0, -depth / 2 - 0.03, 1.55), (0.22, 0.006, 0.22))
        mesh_object("AdaSign", s, mat("AdaBlue", (0.02, 0.18, 0.62), 0.0, 0.4))
        g = bmesh.new()  # ground-level ramp lip
        add_box(g, (0, -depth / 2 - 0.25, 0.03), (door_w, 0.5, 0.06))
        mesh_object("Ramp", g, lib.plastic((0.3, 0.3, 0.3), 0.7))


def portable_restroom():
    _porta(1.12, 1.18, (0.62, 0.55, 0.43), (0.62, 0.55, 0.43))


def ada_restroom():
    _porta(1.75, 1.75, (0.62, 0.55, 0.43), (0.08, 0.25, 0.55), ada=True)


def restroom_trailer():
    L, W, H, floor = 5.2, 2.3, 2.4, 0.75
    white = mat("TrailerWhite", (0.90, 0.90, 0.88), 0.0, 0.3, **{"Coat Weight": 0.5})
    t = bmesh.new()
    add_box(t, (0, 0, floor + H / 2), (L, W, H))
    bevel(mesh_object("Trailer", t, white), 0.06, 4)
    trim = bmesh.new()
    add_box(trim, (0, 0, floor + 0.08), (L + 0.02, W + 0.02, 0.16))
    add_box(trim, (0, 0, floor + H + 0.05), (L - 0.1, W - 0.1, 0.1))
    mesh_object("Trim", trim, mat("TrailerTrim", (0.20, 0.22, 0.25), 0.3, 0.4))
    doors = bmesh.new()
    wins = bmesh.new()
    for x in (-1.3, 1.3):
        add_box(doors, (x, -W / 2 - 0.01, floor + 0.18 + 1.0), (0.85, 0.03, 2.0))
        add_box(wins, (x + 0.85, -W / 2 - 0.012, floor + 1.7), (0.55, 0.02, 0.35))
    mesh_object("Doors", doors, lib.wood("TrailerDoor", (0.42, 0.26, 0.14), (0.28, 0.16, 0.08), stretch=(1, 1, 8)))
    mesh_object("Windows", wins, mat("Frosted", (0.75, 0.8, 0.82), 0.0, 0.25, **{"Transmission Weight": 0.6}))
    signs = bmesh.new()
    for x in (-1.3, 1.3):
        add_box(signs, (x, -W / 2 - 0.03, floor + 2.05), (0.5, 0.01, 0.1))
    mesh_object("Signs", signs, lib.gold_metal(0.3))
    st = bmesh.new()  # two sets of stairs with a landing and rails
    rail = bmesh.new()
    for x in (-1.3, 1.3):
        for k in range(3):
            add_box(st, (x, -W / 2 - 0.35 - k * 0.28, floor - 0.08 - k * 0.22), (1.0, 0.3, 0.05))
        add_box(st, (x, -W / 2 - 0.2, floor + 0.12), (1.1, 0.4, 0.05))
        for sx in (-1, 1):
            add_rod(rail, (x + sx * 0.55, -W / 2 - 0.05, floor + 1.05), (x + sx * 0.55, -W / 2 - 1.0, floor + 0.35), 0.02)
            add_rod(rail, (x + sx * 0.55, -W / 2 - 1.0, floor + 0.35), (x + sx * 0.55, -W / 2 - 1.0, 0.0), 0.02)
            add_rod(rail, (x + sx * 0.55, -W / 2 - 0.05, floor + 0.15), (x + sx * 0.55, -W / 2 - 0.05, floor + 1.05), 0.02)
    mesh_object("Stairs", st, lib.plank_wood())
    mesh_object("Rails", rail, lib.silver_metal(0.25))
    wh = bmesh.new()
    _wheels(wh, (-0.45, 0.45), -W / 2 + 0.25, 0.36, axis_w=0.22)
    _wheels(wh, (-0.45, 0.45), W / 2 - 0.25, 0.36, axis_w=0.22)
    mesh_object("Tyres", wh, mat("Rubber", (0.03, 0.03, 0.03), 0.0, 0.8))
    sk = bmesh.new()
    add_box(sk, (0, 0, floor / 2), (L - 1.6, W - 0.1, floor - 0.1))
    mesh_object("Skirt", sk, mat("TrailerTrim", (0.20, 0.22, 0.25), 0.3, 0.4))
    ac = bmesh.new()
    add_box(ac, (1.5, 0, floor + H + 0.2), (0.7, 0.6, 0.25))
    bevel(mesh_object("RoofAC", ac, white), 0.03, 2)


def hand_wash_station():
    body = lib.plastic((0.88, 0.88, 0.86), 0.45)
    b = bmesh.new()
    add_box(b, (0, 0, 0.42), (0.62, 0.55, 0.84))
    add_box(b, (0, 0.18, 1.2), (0.62, 0.18, 0.72))
    bevel(mesh_object("Station", b, body), 0.03, 3)
    basin = bmesh.new()
    for x in (-0.15, 0.15):
        lathe(basin, [(0, 0.80), (0.10, 0.80), (0.13, 0.9), (0.12, 0.9)], 32, center=(x, -0.06, 0.0), cap=True, thickness=0.006)
    mesh_object("Basins", basin, lib.plastic((0.95, 0.95, 0.95), 0.25))
    tap = bmesh.new()
    for x in (-0.15, 0.15):
        add_rod(tap, (x, 0.09, 1.05), (x, -0.02, 1.05), 0.012)
        add_rod(tap, (x, -0.02, 1.05), (x, -0.04, 1.0), 0.01)
    mesh_object("Taps", tap, lib.silver_metal(0.15))
    misc = bmesh.new()
    add_box(misc, (-0.18, 0.08, 1.35), (0.14, 0.06, 0.2))
    add_box(misc, (0.18, 0.08, 1.35), (0.14, 0.06, 0.2))
    mesh_object("Dispensers", misc, lib.plastic((0.12, 0.35, 0.65), 0.4))
    pedal = bmesh.new()
    for x in (-0.15, 0.15):
        add_box(pedal, (x, -0.31, 0.04), (0.1, 0.12, 0.03))
    mesh_object("Pedals", pedal, lib.black_metal())


def generator_7kw():
    frame = bmesh.new()
    L, W, H = 0.72, 0.56, 0.58
    for sx in (-1, 1):
        add_rod(frame, (sx * L / 2, -W / 2, 0.12), (sx * L / 2, -W / 2, H), 0.016)
        add_rod(frame, (sx * L / 2, W / 2, 0.12), (sx * L / 2, W / 2, H), 0.016)
        add_rod(frame, (sx * L / 2, -W / 2, H), (sx * L / 2, W / 2, H), 0.016)
        add_rod(frame, (sx * L / 2, -W / 2, 0.12), (sx * L / 2, W / 2, 0.12), 0.016)
    for sy in (-1, 1):
        add_rod(frame, (-L / 2, sy * W / 2, 0.12), (L / 2, sy * W / 2, 0.12), 0.016)
    add_rod(frame, (-L / 2, -W / 2, H), (-L / 2 - 0.25, -W / 2, H + 0.18), 0.014)  # handle
    add_rod(frame, (-L / 2, W / 2, H), (-L / 2 - 0.25, W / 2, H + 0.18), 0.014)
    add_rod(frame, (-L / 2 - 0.25, -W / 2, H + 0.18), (-L / 2 - 0.25, W / 2, H + 0.18), 0.016)
    mesh_object("Frame", frame, lib.black_metal())
    tank = bmesh.new()
    add_box(tank, (0.02, 0, H - 0.06), (0.62, 0.42, 0.16))
    bevel(mesh_object("Tank", tank, mat("GenRed", (0.70, 0.08, 0.05), 0.1, 0.35, **{"Coat Weight": 0.5})), 0.04, 4)
    cap = bmesh.new()
    add_disc(cap, (0.15, 0, H + 0.03), 0.04, 0.03, 24)
    mesh_object("Cap", cap, lib.black_metal())
    eng = bmesh.new()
    add_box(eng, (-0.12, 0, 0.3), (0.3, 0.38, 0.3))
    add_rod(eng, (0.1, 0, 0.32), (0.32, 0, 0.32), 0.13)
    mesh_object("Engine", eng, lib.steel(0.45))
    panel = bmesh.new()
    add_box(panel, (0.14, -W / 2 + 0.03, 0.34), (0.3, 0.02, 0.2))
    mesh_object("Panel", panel, mat("GenPanel", (0.15, 0.15, 0.16), 0.2, 0.5))
    outs = bmesh.new()
    for x in (0.06, 0.14, 0.22):
        add_box(outs, (x, -W / 2 + 0.015, 0.32), (0.04, 0.012, 0.05))
    mesh_object("Outlets", outs, mat("Outlet", (0.85, 0.75, 0.15), 0.0, 0.4))
    wh = bmesh.new()
    _wheels(wh, (L / 2 - 0.05,), -W / 2 - 0.05, 0.12, axis_w=0.06)
    _wheels(wh, (L / 2 - 0.05,), W / 2 + 0.05, 0.12, axis_w=0.06)
    mesh_object("Wheels", wh, mat("Rubber", (0.03, 0.03, 0.03), 0.0, 0.8))


def generator_20kw():
    L, W, H = 2.0, 0.95, 1.2
    green = mat("GenGreen", (0.10, 0.22, 0.14), 0.2, 0.45, **{"Coat Weight": 0.3})
    enc = bmesh.new()
    add_box(enc, (0, 0, 0.55 + H / 2), (L, W, H))
    bevel(mesh_object("Enclosure", enc, green), 0.03, 3)
    louv = bmesh.new()
    for i in range(10):
        add_box(louv, (-0.6 + i * 0.03, -W / 2 - 0.005, 1.1), (0.012, 0.01, 0.6))
    for i in range(10):
        add_box(louv, (0.35 + i * 0.03, -W / 2 - 0.005, 1.1), (0.012, 0.01, 0.6))
    mesh_object("Louvers", louv, lib.black_metal())
    door = bmesh.new()
    add_box(door, (-0.05, -W / 2 - 0.006, 1.15), (0.5, 0.01, 0.75))
    mesh_object("PanelDoor", door, mat("GenGreenDark", (0.07, 0.16, 0.10), 0.2, 0.45))
    tr = bmesh.new()
    add_box(tr, (0, 0, 0.5), (L + 0.1, W + 0.1, 0.1))
    add_beam(tr, (L / 2, 0.0, 0.5), (L / 2 + 1.0, 0.0, 0.45), 0.08)
    add_rod(tr, (L / 2 + 1.0, 0, 0.45), (L / 2 + 1.0, 0, 0.0008), 0.025)
    add_disc(tr, (L / 2 + 1.0, 0, 0.03), 0.06, 0.04, 20)
    mesh_object("Trailer", tr, lib.black_metal())
    ex = bmesh.new()
    add_rod(ex, (-0.7, 0.25, 0.55 + H), (-0.7, 0.25, 0.55 + H + 0.3), 0.05)
    mesh_object("Exhaust", ex, lib.steel(0.5))
    wh = bmesh.new()
    _wheels(wh, (-0.1,), -W / 2 - 0.12, 0.3, axis_w=0.18)
    _wheels(wh, (-0.1,), W / 2 + 0.12, 0.3, axis_w=0.18)
    mesh_object("Tyres", wh, mat("Rubber", (0.03, 0.03, 0.03), 0.0, 0.8))
    fend = bmesh.new()
    for sy in (-1, 1):
        add_box(fend, (-0.1, sy * (W / 2 + 0.12), 0.68), (0.8, 0.22, 0.03))
    mesh_object("Fenders", fend, lib.black_metal())


def cable_ramp():
    yellow = lib.plastic((0.85, 0.62, 0.02), 0.45)
    black = lib.plastic((0.04, 0.04, 0.04), 0.6)
    L, W, H = 0.9, 0.52, 0.07
    for k in range(2):  # two linked sections
        x0 = (k - 0.5) * L
        b = bmesh.new()
        prof = [(-W / 2, 0), (-0.13, H), (0.13, H), (W / 2, 0)]
        vs = []
        for x in (x0 - L / 2 + 0.005, x0 + L / 2 - 0.005):
            vs.append([b.verts.new((x, y, z)) for y, z in prof])
        b.faces.new(vs[0][::-1])
        b.faces.new(vs[1])
        for i in range(3):
            b.faces.new((vs[0][i], vs[0][i + 1], vs[1][i + 1], vs[1][i]))
        b.faces.new((vs[0][3], vs[0][0], vs[1][0], vs[1][3]))
        mesh_object(f"Ramp{k}", b, black, smooth=False).location.z = 0.0008
        lid = bmesh.new()
        add_box(lid, (x0, 0, H + 0.004), (L - 0.03, 0.25, 0.008))
        for i in range(10):
            add_box(lid, (x0 - L / 2 + 0.06 + i * 0.087, 0, H + 0.01), (0.03, 0.24, 0.004))
        mesh_object(f"Lid{k}", lid, yellow)
    cab = bmesh.new()
    for c in (-1, 0, 1):  # cables entering and leaving the ramp channels
        add_rod(cab, (-1.25, c * 0.05, 0.013), (-0.9, c * 0.05, 0.013), 0.012)
        add_rod(cab, (0.9, c * 0.05, 0.013), (1.25, c * 0.05, 0.013), 0.012)
    mesh_object("Cables", cab, black)


def stanchion():
    gold = lib.gold_metal(0.2)
    posts = bmesh.new()
    xs = (-0.75, 0.75)
    for x in xs:
        lathe(posts, [(0, 0.0008), (0.16, 0.0008), (0.165, 0.015), (0.04, 0.04), (0.03, 0.06), (0.03, 0.92), (0.04, 0.94), (0.045, 0.97), (0, 1.0)], 48,
              center=(x, 0, 0))
    mesh_object("Posts", posts, gold)
    rope = bmesh.new()
    pts = []
    for i in range(41):
        t = i / 40
        x = xs[0] + 0.05 + (xs[1] - xs[0] - 0.1) * t
        pts.append((x, -0.0, 0.9 - 0.22 * 4 * t * (1 - t)))
    lib.add_tube(rope, pts, 0.022, segments=16)
    mesh_object("Rope", rope, mat("RedVelvet", (0.42, 0.02, 0.04), 0.0, 0.8, **{"Sheen Weight": 0.6}))
    hooks = bmesh.new()
    for x in (xs[0] + 0.05, xs[1] - 0.05):
        add_rod(hooks, (x, 0, 0.9), (x - math.copysign(0.03, x), 0, 0.9), 0.024)
    mesh_object("Hooks", hooks, gold)


def barricade():
    steel = lib.steel(0.3)
    L, H = 2.4, 1.1
    b = bmesh.new()
    z0 = 0.12
    add_rod(b, (-L / 2, 0, z0), (L / 2, 0, z0), 0.02)
    add_rod(b, (-L / 2, 0, H), (L / 2, 0, H), 0.02)
    for sx in (-1, 1):
        add_rod(b, (sx * L / 2, 0, z0), (sx * L / 2, 0, H), 0.02)
    n = 15
    for i in range(1, n):
        x = -L / 2 + L * i / n
        add_rod(b, (x, 0, z0), (x, 0, H), 0.009)
    for x in (-L / 2 + 0.15, L / 2 - 0.15):  # flat bridge feet
        add_rod(b, (x, 0, z0), (x - 0.06, -0.3, 0.012), 0.018)
        add_rod(b, (x, 0, z0), (x - 0.06, 0.3, 0.012), 0.018)
        add_box(b, (x - 0.06, 0, 0.008), (0.06, 0.62, 0.016))
    mesh_object("Barricade", b, steel)


def temporary_fence():
    L, H = 3.0, 1.8
    steel = lib.steel(0.35)
    fr = bmesh.new()
    z0 = 0.15
    add_rod(fr, (-L / 2, 0, z0), (L / 2, 0, z0), 0.02)
    add_rod(fr, (-L / 2, 0, z0 + H), (L / 2, 0, z0 + H), 0.02)
    for sx in (-1, 1):
        add_rod(fr, (sx * L / 2, 0, 0.1), (sx * L / 2, 0, z0 + H + 0.05), 0.022)
    mesh_object("FenceFrame", fr, steel)
    mesh = bmesh.new()  # welded wire mesh
    step = 0.075
    nx, nz = int(L / step), int(H / step)
    for i in range(nx + 1):
        x = -L / 2 + i * step
        add_beam(mesh, (x, 0, z0), (x, 0, z0 + H), 0.004)
    for j in range(nz + 1):
        z = z0 + j * step
        add_beam(mesh, (-L / 2, 0, z), (L / 2, 0, z), 0.004)
    mesh_object("WireMesh", mesh, steel, smooth=False)
    feet = bmesh.new()
    for sx in (-1, 1):
        add_box(feet, (sx * L / 2, 0, 0.075), (0.25, 0.6, 0.15))
    bevel(mesh_object("Feet", feet, lib.plastic((0.15, 0.15, 0.15), 0.6)), 0.02, 2)
    clamp = bmesh.new()
    for sx in (-1, 1):
        add_box(clamp, (sx * L / 2, 0, 1.0), (0.06, 0.05, 0.08))
    mesh_object("Clamps", clamp, lib.steel(0.25))
    for sx in (-1, 1):  # a sandbag on each foot
        sb = bmesh.new()
        add_sphere(sb, (sx * L / 2, 0.22, 0.2), 0.12, scale=(1.4, 0.8, 0.45))
        mesh_object("Sandbag", sb, mat("Sandbag", (0.45, 0.42, 0.30), 0.0, 0.9))


CON = dict(az=-30, el=16, lens=70, pad=1.15)
for slug, cat, fn, alt, cap, cam, extra in (
    ("snow-cone-machine", "concessions", snow_cone_machine,
     "3D render of a blue snow cone machine with a clear ice cabinet and three cups of shaved ice in cherry, blue raspberry and lemon, for Chicago-area summer parties",
     "Snow cone machine", CON, {}),
    ("nacho-cheese-warmer", "concessions", nacho_cheese_warmer,
     "3D render of a stainless steel nacho cheese warmer with a pump dispenser and a tray of tortilla chips with cheese",
     "Nacho cheese warmer", CON, {}),
    ("hot-dog-roller", "concessions", hot_dog_roller,
     "3D render of a stainless steel steamer-style hot dog warmer with a glass display hood, hot dogs on the steam tray and a bun drawer",
     "Hot dog warmer", CON, {}),
    ("portable-restroom", "restrooms-power", portable_restroom,
     "3D render of a standard tan portable restroom with a white translucent roof and vent pipe, for outdoor events and construction-style sites",
     "Standard portable restroom", dict(az=-30, el=10, lens=60, pad=1.12), {}),
    ("ada-restroom", "restrooms-power", ada_restroom,
     "3D render of a wheelchair-accessible ADA portable restroom with a wide blue door, ground-level entry and accessibility sign",
     "ADA accessible portable restroom", dict(az=-30, el=10, lens=60, pad=1.12), {}),
    ("restroom-trailer", "restrooms-power", restroom_trailer,
     "3D render of a white luxury restroom trailer with wood doors, separate men's and women's entries, stairs with railings and frosted windows, for weddings on a Chicago-area lawn",
     "Luxury restroom trailer", dict(az=-28, el=10, lens=45, pad=1.12), dict(env="lawn", lawn=dict(sun_elev=28, sun_rot=210))),
    ("hand-wash-station", "restrooms-power", hand_wash_station,
     "3D render of a portable hand wash station with two basins, foot pumps and soap and towel dispensers",
     "Portable hand wash station", dict(az=-30, el=14, lens=70, pad=1.15), {}),
    ("generator-7kw", "restrooms-power", generator_7kw,
     "3D render of a portable 7,000-8,000 watt open-frame generator with a red fuel tank, wheels and fold-out handle, for tent lighting and catering power",
     "Portable generator, 7,000-8,000 watt", dict(az=-35, el=18, lens=70, pad=1.15), {}),
    ("generator-20kw", "restrooms-power", generator_20kw,
     "3D render of a towable 20 kW enclosed generator on a trailer, sized to power a full tent wedding with lighting, heaters and catering",
     "20 kW towable generator", dict(az=-35, el=14, lens=55, pad=1.12), {}),
    ("cable-ramp", "restrooms-power", cable_ramp,
     "3D render of two linked yellow and black cable protector ramps covering power cables, for safe walkways at events",
     "Cable protector ramp", dict(az=-32, el=24, lens=60, pad=1.15), {}),
    ("stanchion", "fencing", stanchion,
     "3D render of two gold stanchion posts with a red velvet rope for VIP lines, red carpets and entrances",
     "Stanchion with velvet rope", dict(az=-25, el=12, lens=60, pad=1.15), {}),
    ("barricade", "fencing", barricade,
     "3D render of a steel bike-rack crowd control barricade, 8 feet long with flat bridge feet, for festivals and street events",
     "Crowd control barricade", dict(az=-28, el=14, lens=60, pad=1.12), {}),
    ("temporary-fence", "fencing", temporary_fence,
     "3D render of a 6 by 10 foot temporary fence panel with welded wire mesh, clamps, weighted feet and sandbags, for outdoor event perimeters",
     "Temporary fence panel", dict(az=-28, el=12, lens=55, pad=1.12), {}),
    ("pa-system", "av", pa_system,
     "3D render of a portable PA system: two powered speakers on tripod stands, a small mixer and a microphone on a boom stand, for toasts, ceremonies and DJs",
     "Portable PA system", dict(az=-25, el=12, lens=45, pad=1.1), {}),
    ("wireless-microphone", "av", wireless_microphone,
     "3D render of a black handheld wireless microphone with its receiver, for wedding toasts and speeches",
     "Wireless microphone", dict(az=-30, el=24, lens=85, pad=1.25), {}),
    ("projector", "av", projector,
     "3D render of a white event projector with a front lens for slideshows and presentations",
     "Projector", dict(az=-30, el=20, lens=85, pad=1.25), {}),
    ("projection-screen", "av", projection_screen,
     "3D render of an 8-foot tripod projection screen with a black border for slideshows, ceremonies and corporate events",
     "8' tripod projection screen", dict(az=-25, el=10, lens=50, pad=1.1), {}),
    ("podium", "av", podium,
     "3D render of a wood floor lectern podium with a slanted top and gooseneck microphone, for speeches and ceremonies",
     "Podium (floor lectern)", dict(az=-30, el=12, lens=60, pad=1.15), {}),
    ("tv-with-stand", "av", tv_with_stand,
     "3D render of a 60-inch TV on a rolling stand with a shelf, for slideshows, sponsor loops and presentations",
     "60\" TV with rolling stand", dict(az=-28, el=10, lens=60, pad=1.12), {}),
):
    item(slug, cat, fn, alt, cap, cam=cam, **extra)
