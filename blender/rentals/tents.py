"""Tents: frame, pole, sailcloth, clear-top, pop-up canopy, sidewalls. Rendered outdoors on a lawn."""

import math
import random

import bmesh
from mathutils import Vector

import chairs as C
import lib
import tables as T
from catalog import item
from lib import add_box, add_disc, add_rod, add_sphere, mat, mesh_object

FT = 0.3048


def vinyl():
    return mat("TentVinyl", (0.94, 0.94, 0.92), 0.0, 0.45, **{"Sheen Weight": 0.2, "Coat Weight": 0.1})


def sailcloth_fabric():
    return mat("Sailcloth", (0.96, 0.93, 0.86), 0.0, 0.7, **{"Transmission Weight": 0.35, "Thin Wall": True})


def clear_vinyl():
    return mat("ClearVinyl", (0.97, 0.98, 1.0), 0.0, 0.03, **{"Transmission Weight": 1.0, "IOR": 1.3, "Thin Wall": True})


def rect_perimeter(hx, hy, n):
    per = 4 * (hx + hy)
    pts = []
    for i in range(n):
        s = per * i / n
        if s < 2 * hx:
            pts.append((Vector((-hx + s, -hy)), s))
        elif s < 2 * hx + 2 * hy:
            pts.append((Vector((hx, -hy + s - 2 * hx)), s))
        elif s < 4 * hx + 2 * hy:
            pts.append((Vector((hx - (s - 2 * hx - 2 * hy), hy)), s))
        else:
            pts.append((Vector((-hx, hy - (s - 4 * hx - 2 * hy))), s))
    return pts, per


def stadium_perimeter(a, r, n):
    """Straight sides of half-length a, semicircular ends of radius r."""
    per = 4 * a + 2 * math.pi * r
    pts = []
    for i in range(n):
        s = per * i / n
        if s < 2 * a:
            pts.append((Vector((-a + s, -r)), s))
        elif s < 2 * a + math.pi * r:
            t = (s - 2 * a) / r - math.pi / 2
            pts.append((Vector((a + r * math.cos(t), r * math.sin(t))), s))
        elif s < 4 * a + math.pi * r:
            pts.append((Vector((a - (s - 2 * a - math.pi * r), r)), s))
        else:
            t = (s - 4 * a - math.pi * r) / r + math.pi / 2
            pts.append((Vector((-a + r * math.cos(t), r * math.sin(t))), s))
    return pts, per


def roof(perim, per, spine_a, side_h, peak_h, power=1.0, dip=0.0, scallop=0.0, spacing=3.0, material=None, valance=0.0,
         valance_scallop=0.0, rows=36):
    bm = bmesh.new()
    grid = []
    edge = []
    for P, s in perim:
        S = Vector((max(-spine_a, min(spine_a, P.x)), 0.0))
        sz = peak_h - (dip * (1 - (S.x / spine_a) ** 2) if spine_a > 0 else 0.0)
        ez = side_h - scallop * abs(math.sin(math.pi * s / spacing))
        col = []
        for k in range(rows + 1):
            v = k / rows
            q = S + (P - S) * v
            z = ez + (sz - ez) * (1 - v) ** power
            col.append(bm.verts.new((q.x, q.y, z)))
        grid.append(col)
        edge.append((P, ez, s))
    n = len(grid)
    for i in range(n):
        j = (i + 1) % n
        for k in range(rows):
            try:
                bm.faces.new((grid[i][k], grid[j][k], grid[j][k + 1], grid[i][k + 1]))
            except ValueError:
                pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
    ob = mesh_object("Roof", bm, material or vinyl())
    s = ob.modifiers.new("Solid", "SOLIDIFY")
    s.thickness = 0.01
    if valance:
        vb = bmesh.new()
        top, bot = [], []
        for P, ez, s_ in edge:
            d = valance - valance_scallop * (1 - abs(math.sin(math.pi * s_ / (spacing / 2)))) if valance_scallop else valance
            top.append(vb.verts.new((P.x * 1.002, P.y * 1.002, ez + 0.01)))
            bot.append(vb.verts.new((P.x * 1.002, P.y * 1.002, ez - d)))
        for i in range(n):
            j = (i + 1) % n
            vb.faces.new((top[i], top[j], bot[j], bot[i]))
        vo = mesh_object("Valance", vb, material or vinyl())
        vs = vo.modifiers.new("Solid", "SOLIDIFY")
        vs.thickness = 0.008
    return edge


def perimeter_poles(edge, per, spacing, r, material, guy=0.0, base=True, top_beam=False, height_trim=0.0):
    n_poles = max(4, round(per / spacing))
    step = per / n_poles
    bm = bmesh.new()
    guys = bmesh.new()
    tops = []
    for k in range(n_poles):
        target = k * step
        P, ez, _ = min(edge, key=lambda e: abs(e[2] - target))
        top = (P.x, P.y, ez - height_trim)
        add_rod(bm, (P.x, P.y, 0), top, r, segments=12)
        tops.append(top)
        if base:
            add_box(bm, (P.x, P.y, 0.01), (0.25, 0.25, 0.02))
        if guy:
            d = Vector((P.x, P.y)).normalized()
            stake = (P.x + d.x * guy, P.y + d.y * guy, 0.0)
            add_rod(guys, (P.x, P.y, ez + 0.05), stake, 0.006, segments=6)
            add_rod(guys, stake, (stake[0], stake[1], 0.15), 0.015, segments=6)
    if top_beam:
        for a, b in zip(tops, tops[1:] + tops[:1]):
            add_rod(bm, a, b, r * 0.8, segments=8)
    mesh_object("Poles", bm, material)
    if guy:
        mesh_object("Guys", guys, mat("Rope", (0.85, 0.80, 0.70), 0.0, 0.8))
    return tops


def string_lights(tops, z_drop=0.6, bulbs_per_m=1.6, strength=30.0, through=None):
    """Bistro strands from each pair of anchor points with a catenary sag and glowing bulbs."""
    wire, bulbs = bmesh.new(), bmesh.new()
    pairs = through or list(zip(tops, tops[1:]))
    for a, b in pairs:
        a, b = Vector(a), Vector(b)
        L = (b - a).length
        n = max(4, int(L * bulbs_per_m))
        prev = None
        for i in range(n * 3 + 1):
            t = i / (n * 3)
            p = a.lerp(b, t)
            p.z -= z_drop * 4 * t * (1 - t)
            if prev is not None:
                add_rod(wire, prev, p, 0.003, segments=4)
            prev = p
            if i % 3 == 0 and 0 < i < n * 3:
                add_sphere(bulbs, p - Vector((0, 0, 0.05)), 0.03, subdiv=1)
    mesh_object("Wire", wire, mat("Wire", (0.02, 0.02, 0.02), 0.0, 0.5))
    mesh_object("Bulbs", bulbs, lib.emission("Bulb", (1.0, 0.72, 0.42), strength))


def round_set_collection(name="RoundSet", cloth=None, chair_mat=None):
    chair = lib.as_collection(name + "Chair", lambda col: C.build_chiavari(col=col, frame_mat=chair_mat))

    def build(col):
        h = 30 * T.IN
        ob = T.round_cloth(30 * T.IN, h, h, cloth or T.linen(), segs=180)
        lib.bpy.context.scene.collection.objects.unlink(ob)
        col.objects.link(ob)
        for i in range(8):
            a = 2 * math.pi * i / 8
            rr = 30 * T.IN + 0.18
            e = lib.bpy.data.objects.new("ChairInst", None)
            e.instance_type = "COLLECTION"
            e.instance_collection = chair
            e.location = (rr * math.cos(a), rr * math.sin(a), 0)
            e.rotation_euler = (0, 0, a + math.pi / 2)
            col.objects.link(e)
    return lib.as_collection(name, build)


def furnish(hx, hy, spacing=3.0, seed=1, inside=None):
    s = round_set_collection()
    rng = random.Random(seed)
    nx, ny = max(1, int((2 * hx) // spacing)), max(1, int((2 * hy) // spacing))
    for i in range(nx):
        for j in range(ny):
            x = -hx + spacing * (i + 0.5) + (2 * hx - spacing * nx) / 2
            y = -hy + spacing * (j + 0.5) + (2 * hy - spacing * ny) / 2
            if inside and not inside(x, y):
                continue
            lib.instance(s, (x + rng.uniform(-0.1, 0.1), y + rng.uniform(-0.1, 0.1), 0), rot_z=rng.uniform(0, 1))


def frame_tent(w_ft, l_ft, clear=False, furnish_it=True, sidewalls=False, lights=False):
    hx, hy = l_ft * FT / 2, w_ft * FT / 2
    side, peak = 8 * FT, (8 + w_ft * 0.32) * FT
    perim, per = rect_perimeter(hx, hy, 480)
    spacing = 10 * FT
    edge = roof(perim, per, hx - hy, side, peak, power=1.0, scallop=0.0, spacing=spacing,
                material=clear_vinyl() if clear else vinyl(), valance=0.0 if clear else 0.28, valance_scallop=0.12, rows=24)
    alu = lib.mat("Aluminum", (0.80, 0.80, 0.82), 1.0, 0.3)
    tops = perimeter_poles(edge, per, spacing, 0.045, alu, base=True, top_beam=True, height_trim=0.02)
    # visible rafters (show through the clear top)
    rb = bmesh.new()
    for P, ez, s in edge[:: len(edge) // 16]:
        S = Vector((max(-(hx - hy), min(hx - hy, P.x)), 0))
        add_rod(rb, (P.x, P.y, ez - 0.05), (S.x, S.y, peak - 0.05), 0.035, segments=8)
    add_rod(rb, (-(hx - hy), 0, peak - 0.05), (hx - hy + 0.001, 0, peak - 0.05), 0.04, segments=8)
    mesh_object("Rafters", rb, alu)
    if furnish_it:
        furnish(hx - 0.6, hy - 0.6)
    if lights or clear:
        ridge = [((-(hx - hy), 0, peak - 0.25), (P.x, P.y, side - 0.15)) for P, ez, s in edge[:: len(edge) // 12]]
        string_lights(None, 0.5, through=ridge, strength=60)
    if sidewalls:
        walls(hx, hy, side)


def walls(hx, hy, side, open_front=True):
    m = vinyl()
    wb, win, frm = bmesh.new(), bmesh.new(), bmesh.new()
    sides = [((-hx, hy), (hx, hy)), ((hx, -hy), (hx, hy)), ((-hx, -hy), (-hx, hy))]
    if not open_front:
        sides.append(((-hx, -hy), (hx, -hy)))
    for (x0, y0), (x1, y1) in sides:
        a, b = Vector((x0, y0, 0)), Vector((x1, y1, 0))
        L = (b - a).length
        d = (b - a).normalized()
        nrm = Vector((d.y, -d.x, 0))
        out = 1 if (a + b).dot(nrm) > 0 else -1
        mid = (a + b) / 2
        rot = math.atan2(d.y, d.x)
        add_box(wb, (mid.x, mid.y, side / 2), (L, 0.01, side), rot_z=rot)
        n = max(1, int(L / 3.0))
        for k in range(n):
            c = a + d * (L * (k + 0.5) / n)
            c2 = c - nrm * out * 0.012
            add_box(win, (c2.x, c2.y, 1.45), (1.1, 0.012, 1.3), rot_z=rot)
            for dz in (0.8, 2.1):
                add_box(frm, (c2.x, c2.y, dz), (1.15, 0.02, 0.05), rot_z=rot)
            for dx in (-0.55, 0.0, 0.55):
                p = c2 + d * dx
                add_box(frm, (p.x, p.y, 1.45), (0.05, 0.02, 1.35), rot_z=rot)
    mesh_object("Walls", wb, m)
    mesh_object("Windows", win, mat("WindowPane", (0.75, 0.80, 0.85), 0.0, 0.05, **{"Coat Weight": 1.0}))
    mesh_object("Mullions", frm, m)


def pole_tent(w_ft=40, l_ft=60, sail=False, furnish_it=True, lights=False):
    hx, hy = l_ft * FT / 2, w_ft * FT / 2
    if sail:
        a, r = hx - hy, hy
        perim, per = stadium_perimeter(a, r, 520)
        side, peak, dip = 2.7, 9.0, 2.2
        fabric = sailcloth_fabric()
        pole_mat = lib.wood("Spruce", (0.62, 0.46, 0.30), (0.45, 0.32, 0.20), stretch=(8.0, 8.0, 0.5))
        spacing = 3.3
    else:
        a = hx - hy * 0.7
        perim, per = rect_perimeter(hx, hy, 520)
        side, peak, dip = 2.3, 7.0, 1.0
        fabric = vinyl()
        pole_mat = lib.mat("Aluminum", (0.80, 0.80, 0.82), 1.0, 0.3)
        spacing = 10 * FT
    edge = roof(perim, per, a, side, peak, power=1.9, dip=dip, scallop=0.22, spacing=spacing, material=fabric,
                valance=0.0 if sail else 0.3, rows=40)
    perimeter_poles(edge, per, spacing, 0.05 if sail else 0.04, pole_mat, guy=1.8, base=False)
    kb = bmesh.new()
    for x in (-a, a):
        add_rod(kb, (x, 0, 0), (x, 0, peak + (0.3 if sail else 0.0)), 0.09 if sail else 0.07, 0.07 if sail else 0.07, segments=16)
    mesh_object("KingPoles", kb, pole_mat)
    if sail:
        fl = bmesh.new()
        for x in (-a, a):
            add_rod(fl, (x, 0, peak + 0.3), (x, 0, peak + 1.4), 0.008)
        mesh_object("Finials", fl, mat("Rope", (0.85, 0.80, 0.70), 0.0, 0.8))
        flag = bmesh.new()
        for x in (-a, a):
            add_box(flag, (x + 0.35, 0, peak + 1.2), (0.7, 0.01, 0.35))
        mesh_object("Pennants", flag, mat("Pennant", (0.93, 0.90, 0.84), 0.0, 0.7))
    if furnish_it:
        inside = (lambda x, y: math.hypot(max(abs(x) - a, 0), y) < hy - 1.6) if sail else None
        furnish(hx - 1.0, hy - 1.2, spacing=3.4, inside=inside)
    if lights or sail:
        anchors = []
        for x in (-a, a):
            for P, ez, s in edge[:: len(edge) // 14]:
                if (x < 0) == (P.x < 0):
                    anchors.append(((x, 0, peak * 0.62), (P.x * 0.97, P.y * 0.97, side - 0.1)))
        string_lights(None, 0.4, through=anchors, strength=80, bulbs_per_m=1.2)
        if sail:
            for x in (-a, 0, a):
                lib.bpy.ops.object.light_add(type="POINT", location=(x, 0, 3.2))
                lt = lib.bpy.context.object
                lt.data.energy, lt.data.color, lt.data.shadow_soft_size = 2500, (1.0, 0.72, 0.45), 1.0


def canopy():
    hx = hy = 5 * FT
    perim, per = rect_perimeter(hx, hy, 240)
    edge = roof(perim, per, 0.0, 2.2, 3.1, power=1.0, material=vinyl(), valance=0.22, spacing=10 * FT, rows=16)
    steel = lib.mat("PowderSteel", (0.85, 0.85, 0.86), 0.6, 0.35)
    bm = bmesh.new()
    corners = [(-hx, -hy), (hx, -hy), (hx, hy), (-hx, hy)]
    for x, y in corners:
        add_rod(bm, (x, y, 0), (x, y, 2.2), 0.025, segments=4)
        add_box(bm, (x, y, 0.005), (0.15, 0.15, 0.01))
    for (x0, y0), (x1, y1) in zip(corners, corners[1:] + corners[:1]):
        # scissor truss
        add_rod(bm, (x0, y0, 2.15), (x1, y1, 1.85), 0.01)
        add_rod(bm, (x0, y0, 1.85), (x1, y1, 2.15), 0.01)
    mesh_object("Frame", bm, steel)
    wb = bmesh.new()
    for x, y in corners:
        add_disc(wb, (x, y, 0.08), 0.12, 0.16, 24)
    mesh_object("Weights", wb, mat("Weight", (0.05, 0.05, 0.05), 0.0, 0.6))


TENT_LAWN = dict(sun_elev=14, sun_rot=225)

item("canopy-10x10", "tents", canopy,
     "3D render of a white 10 by 10 foot pop-up canopy tent on a lawn for backyard parties, vendor booths and small gatherings",
     "10' x 10' pop-up canopy", env="lawn", lawn=TENT_LAWN, cam=dict(az=-35, el=14, lens=50, pad=1.1))
item("frame-tent-20x20", "tents", lambda: frame_tent(20, 20),
     "3D render of a white 20 by 20 foot frame tent on a lawn with round tables and gold Chiavari chairs, seating about 40 guests",
     "20' x 20' frame tent (seats ~40)", env="lawn", lawn=TENT_LAWN, cam=dict(az=-35, el=14, lens=40, pad=1.05))
item("frame-tent-20x40", "tents", lambda: frame_tent(20, 40),
     "3D render of a white 20 by 40 foot frame tent on a lawn set with round tables and gold Chiavari chairs, seating about 80 guests",
     "20' x 40' frame tent (seats ~80)", env="lawn", lawn=TENT_LAWN, cam=dict(az=-30, el=14, lens=40, pad=1.02))
item("frame-tent-30x60", "tents", lambda: frame_tent(30, 60),
     "3D render of a white 30 by 60 foot frame tent on a lawn for weddings of about 180 guests, no center poles",
     "30' x 60' frame tent (seats ~180)", env="lawn", lawn=TENT_LAWN, cam=dict(az=-30, el=16, lens=35, pad=1.02))
item("pole-tent-40x60", "tents", lambda: pole_tent(40, 60),
     "3D render of a white 40 by 60 foot high-peak pole tent with guy ropes on a lawn, seating about 240 guests for a backyard wedding",
     "40' x 60' pole tent (seats ~240)", env="lawn", lawn=TENT_LAWN, cam=dict(az=-30, el=14, lens=35, pad=1.0))
item("sailcloth-tent", "tents", lambda: pole_tent(44, 62, sail=True),
     "3D render of a glowing sailcloth tent with tall wooden poles and string lights at dusk, a luxury wedding tent near Chicago",
     "Sailcloth tent at dusk", env="lawn", lawn=dict(dusk=True, sun_rot=240), cam=dict(az=-28, el=10, lens=35, pad=1.0))
item("clear-top-tent", "tents", lambda: frame_tent(20, 40, clear=True),
     "3D render of a 20 by 40 foot clear-top frame tent with bistro string lights and dressed round tables at twilight",
     "Clear-top tent at twilight", env="lawn", lawn=dict(dusk=True, sun_rot=230), cam=dict(az=-30, el=14, lens=40, pad=1.02))
item("tent-sidewall", "tents", lambda: frame_tent(20, 20, sidewalls=True, furnish_it=True),
     "3D render of a 20 by 20 foot frame tent with white cathedral-window sidewalls on three sides for wind and cold-weather protection",
     "Tent sidewalls with cathedral windows", env="lawn", lawn=TENT_LAWN, cam=dict(az=-20, el=12, lens=40, pad=1.05))
