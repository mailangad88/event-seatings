"""Chair models, built to real rental dimensions (meters). Each build_* adds geometry at the origin,
front of the chair facing -Y (toward a default camera)."""

import math

import bmesh
from mathutils import Vector

from lib import (
    BLACK, GOLD, IVORY, WHITE, acrylic, add_bamboo_rod, add_beam, add_box, add_disc, add_polyline, add_ring, add_rod,
    add_sphere, bevel, black_metal, fabric, gold_metal, lathe, mat, mesh_object, plastic, silver_metal, subsurf, wood,
    woven,
)


def _seat_cushion(z, size=(0.40, 0.42), color=IVORY, col=None, y=-0.005, thick=0.05):
    c = bmesh.new()
    add_box(c, (0.0, y, z + thick * 0.6), (size[0], size[1], thick))
    ob = mesh_object("Cushion", c, fabric("Cushion", color, 0.8), collection=col)
    bevel(ob, 0.018, 4)
    subsurf(ob, 1)
    return ob


def build_chiavari(col=None, frame_mat=None, cushion=IVORY, r=0.0115, sash=None):
    """Classic Chiavari. Front faces -Y."""
    frame = bmesh.new()
    seat_z = 0.445
    fl, fr = (-0.195, -0.19, 0.0), (0.195, -0.19, 0.0)
    rl_floor, rr_floor = (-0.18, 0.20, 0.0), (0.18, 0.20, 0.0)
    rl_top, rr_top = (-0.175, 0.27, 0.92), (0.175, 0.27, 0.92)

    def rear(x_sign, z):
        a = Vector(rl_floor if x_sign < 0 else rr_floor)
        b = Vector(rl_top if x_sign < 0 else rr_top)
        return a.lerp(b, z / 0.92)

    add_bamboo_rod(frame, fl, (fl[0] * 0.97, fl[1] * 0.96, seat_z), r, (0.35, 0.7))
    add_bamboo_rod(frame, fr, (fr[0] * 0.97, fr[1] * 0.96, seat_z), r, (0.35, 0.7))
    add_bamboo_rod(frame, rl_floor, rl_top, r, (0.18, 0.38, 0.62, 0.82))
    add_bamboo_rod(frame, rr_floor, rr_top, r, (0.18, 0.38, 0.62, 0.82))
    for p in (rl_top, rr_top):
        add_sphere(frame, Vector(p) + Vector((0, 0, 0.008)), 0.014)
    fls, frs = Vector((fl[0] * 0.97, fl[1] * 0.96, seat_z)), Vector((fr[0] * 0.97, fr[1] * 0.96, seat_z))
    rls, rrs = rear(-1, seat_z), rear(1, seat_z)
    for a, b in ((fls, frs), (frs, rrs), (rrs, rls), (rls, fls)):
        add_rod(frame, a, b, r * 0.9)
    for z in (0.17, 0.30):
        lf = Vector(fl).lerp(fls, z / seat_z)
        rf = Vector(fr).lerp(frs, z / seat_z)
        add_bamboo_rod(frame, lf, rear(-1, z), r * 0.7, (0.5,))
        add_bamboo_rod(frame, rf, rear(1, z), r * 0.7, (0.5,))
    add_bamboo_rod(frame, Vector(fl).lerp(fls, 0.42), Vector(fr).lerp(frs, 0.42), r * 0.7, (0.5,))
    rails = (0.885, 0.80, 0.64)
    for z in rails:
        add_bamboo_rod(frame, rear(-1, z), rear(1, z), r * 0.85, (0.25, 0.5, 0.75))
    for i in range(1, 5):
        t = i / 5
        add_bamboo_rod(frame, rear(-1, rails[1]).lerp(rear(1, rails[1]), t), rear(-1, rails[2]).lerp(rear(1, rails[2]), t), r * 0.6, (0.5,))
    mesh_object("Chiavari", frame, frame_mat or gold_metal(), collection=col)
    if cushion:
        _seat_cushion(seat_z, col=col, color=cushion, y=0.005)
    if sash:
        _sash(rear, sash, col)


def _sash(rear, color, col):
    """Chiffon sash tied around the back posts with a bow and two tails."""
    m = fabric("Sash", color, 0.9, 0.7)
    m.node_tree.nodes["Principled BSDF"].inputs["Subsurface Weight"].default_value = 0.3
    z = 0.70
    a, b = rear(-1, z), rear(1, z)
    mid = (a + b) / 2
    band = bmesh.new()
    add_ring(band, mid, (0, 0, 1), 0.205, 0.035, segs=40, ring=10, scale=(1.0, 0.22))
    sb = mesh_object("SashBand", band, m, collection=col)
    sb.scale = (1, 1, 1.6)
    bow = bmesh.new()
    c = mid + Vector((0, 0.06, 0))
    for sx in (-1, 1):
        add_sphere(bow, c + Vector((sx * 0.06, 0.01, 0.0)), 0.06, scale=(1.0, 0.35, 0.6), subdiv=2)
    add_sphere(bow, c + Vector((0, 0.02, 0)), 0.025, subdiv=2)
    # tails: tapered ribbons falling to just above the floor
    for sx, ang in ((-1, 0.10), (1, -0.08)):
        top = c + Vector((sx * 0.02, 0.02, -0.01))
        bot = top + Vector((sx * 0.05 + ang, 0.05, -0.52))
        add_beam(bow, top, bot, 0.07, 0.008)
    ob = mesh_object("Bow", bow, m, collection=col)
    subsurf(ob, 1)


def build_folding(col=None, frame=None, seat=None, padded=False, pad_color=WHITE):
    """Classic event folding chair: X-crossing legs seen from the side, contoured seat and back."""
    fm = frame or plastic(WHITE, 0.3)
    sm = seat or fm
    fr = bmesh.new()
    r = 0.011
    for sx in (-1, 1):
        x = sx * 0.205
        add_polyline(fr, [(x, -0.21, 0.0), (x, 0.10, 0.44), (x, 0.15, 0.84)], r)
        add_rod(fr, (x * 0.97, 0.22, 0.0), (x * 0.97, -0.13, 0.43), r)
        add_sphere(fr, (x, 0.15, 0.845), r, subdiv=1)
        for p in ((x, -0.21, 0.0), (x * 0.97, 0.22, 0.0)):
            add_sphere(fr, p, r * 1.5, scale=(1, 1, 0.5), subdiv=1)
    add_rod(fr, (-0.205, -0.17, 0.06), (0.205, -0.17, 0.06), r * 0.8)
    add_rod(fr, (-0.2, 0.19, 0.05), (0.2, 0.19, 0.05), r * 0.8)
    add_rod(fr, (-0.205, 0.12, 0.48), (0.205, 0.12, 0.48), r * 0.8)
    mesh_object("FoldFrame", fr, fm, collection=col)
    s = bmesh.new()
    add_box(s, (0, -0.04, 0.455), (0.40, 0.38, 0.025))
    so = mesh_object("FoldSeat", s, sm, collection=col)
    bevel(so, 0.01, 3)
    b = bmesh.new()
    # slightly curved back panel
    n = 12
    rows = []
    for k in range(2):
        z = 0.66 + 0.15 * k
        row = []
        for i in range(n + 1):
            x = -0.2 + 0.4 * i / n
            y = 0.135 + 0.03 * (1 - (x / 0.2) ** 2) + (z - 0.63) * 0.12
            row.append(b.verts.new((x, y, z)))
        rows.append(row)
    for i in range(n):
        b.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    bo = mesh_object("FoldBack", b, sm, collection=col)
    sol = bo.modifiers.new("Solid", "SOLIDIFY")
    sol.thickness = 0.02
    bevel(bo, 0.006, 3)
    if padded:
        p = bmesh.new()
        add_box(p, (0, -0.045, 0.485), (0.39, 0.37, 0.04))
        po = mesh_object("Pad", p, mat("Vinyl", pad_color, 0.0, 0.35, **{"Coat Weight": 0.3}), collection=col)
        bevel(po, 0.015, 4)
        subsurf(po, 1)


def build_crossback(col=None, w=None):
    wm = w or wood("Walnut", (0.26, 0.14, 0.07), (0.17, 0.085, 0.04), stretch=(8.0, 8.0, 1.0))
    fr = bmesh.new()
    leg = 0.036
    seat_z = 0.45
    for sx in (-1, 1):
        add_beam(fr, (sx * 0.205, -0.205, 0), (sx * 0.205, -0.205, seat_z), leg)
        add_beam(fr, (sx * 0.20, 0.22, 0), (sx * 0.20, 0.24, 0.90), leg)
        add_beam(fr, (sx * 0.205, -0.2, 0.12), (sx * 0.2, 0.22, 0.12), 0.018, 0.024)
    add_beam(fr, (-0.2, 0.235, 0.88), (0.2, 0.235, 0.88), 0.03, 0.06)  # top rail
    add_beam(fr, (-0.2, 0.23, 0.56), (0.2, 0.23, 0.56), 0.022, 0.035)  # lower rail
    add_beam(fr, (-0.19, 0.232, 0.58), (0.19, 0.235, 0.855), 0.02, 0.025)  # the X
    add_beam(fr, (0.19, 0.232, 0.58), (-0.19, 0.235, 0.855), 0.02, 0.025)
    for y in (-0.205, 0.215):  # aprons
        add_beam(fr, (-0.2, y, seat_z - 0.04), (0.2, y, seat_z - 0.04), 0.022, 0.06)
    for sx in (-1, 1):
        add_beam(fr, (sx * 0.205, -0.2, seat_z - 0.04), (sx * 0.2, 0.215, seat_z - 0.04), 0.022, 0.06)
    add_beam(fr, (-0.2, 0.0, 0.16), (0.2, 0.0, 0.16), 0.018, 0.024)
    ob = mesh_object("Crossback", fr, wm, smooth=False, collection=col)
    bevel(ob, 0.003, 2)
    s = bmesh.new()
    add_box(s, (0, 0.005, seat_z), (0.40, 0.42, 0.03))
    so = mesh_object("RattanSeat", s, woven((0.72, 0.58, 0.38)), collection=col)
    bevel(so, 0.006, 2)


def build_ghost(col=None):
    """Louis-style ghost chair in clear polycarbonate with an oval medallion back."""
    m = acrylic()
    g = bmesh.new()
    seat_z = 0.46
    add_box(g, (0, 0, seat_z - 0.02), (0.44, 0.42, 0.04))
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        top = (sx * 0.19, sy * 0.18, seat_z - 0.04)
        bot = (sx * 0.20, sy * 0.19 + (0.02 * sy if sy > 0 else 0), 0.0)
        add_rod(g, top, bot, 0.022, 0.012, segments=20)
    # oval medallion: a solid elliptical disc lying in the XZ plane
    ring = bmesh.new()
    center = Vector((0, 0.215, 0.73))
    add_ring(ring, center, (0, 1, 0), 0.19, 0.018, segs=48, ring=10, scale=(1.0, 1.25))
    mesh_object("MedallionRing", ring, m, collection=col)
    disc = bmesh.new()
    from mathutils import Matrix
    bmesh.ops.create_cone(disc, cap_ends=True, segments=48, radius1=0.19, radius2=0.19, depth=0.012,
                          matrix=Matrix.Translation(center) @ Matrix.Rotation(math.pi / 2, 4, "X") @ Matrix.Diagonal((1.0, 1.25, 1.0, 1)))
    mesh_object("Medallion", disc, acrylic(thin=True), collection=col)
    for sx in (-1, 1):  # posts joining back to seat
        add_rod(g, (sx * 0.14, 0.2, seat_z), (sx * 0.17, 0.215, 0.62), 0.02)
    ob = mesh_object("Ghost", g, m, collection=col)
    bevel(ob, 0.012, 3)


def build_kids_chair(col=None):
    """Child-size white resin folding chair (~0.30 m seat height)."""
    from lib import Matrix  # noqa
    import bpy
    build_folding(col=col)
    for ob in list((col.objects if col else bpy.context.scene.collection.objects)):
        ob.scale = (0.72, 0.72, 0.68)


def build_throne(col=None):
    """Tall-back royal throne chair: gold carved frame, ivory tufted velvet."""
    gm = gold_metal(0.3)
    vel = fabric("Velvet", (0.90, 0.86, 0.78), 1.0, 0.9)
    fr = bmesh.new()
    for sx in (-1, 1):
        add_rod(fr, (sx * 0.30, -0.27, 0), (sx * 0.31, -0.28, 0.48), 0.03, 0.025, segments=20)
        add_rod(fr, (sx * 0.30, 0.25, 0), (sx * 0.31, 0.28, 0.48), 0.03, 0.025, segments=20)
        add_sphere(fr, (sx * 0.30, -0.27, 0.02), 0.04, subdiv=2)
        # armrests
        add_polyline(fr, [(sx * 0.33, -0.30, 0.48), (sx * 0.34, -0.30, 0.68), (sx * 0.34, 0.20, 0.72)], 0.028)
        add_sphere(fr, (sx * 0.34, -0.31, 0.69), 0.045, subdiv=2)
    add_box(fr, (0, -0.005, 0.44), (0.64, 0.56, 0.08))
    # tall arched back frame
    pts = []
    for i in range(25):
        t = i / 24
        a = math.pi * t
        pts.append((-0.30 * math.cos(a), 0.30, 0.50 + 0.85 + 0.30 * math.sin(a) * 0.9 - 0.10))
    add_polyline(fr, [(-0.30, 0.30, 0.48)] + pts + [(0.30, 0.30, 0.48)], 0.035, segments=12)
    add_sphere(fr, (0, 0.30, 1.56), 0.06, subdiv=2)
    ob = mesh_object("ThroneFrame", fr, gm, collection=col)
    back = bmesh.new()
    add_box(back, (0, 0.31, 1.0), (0.52, 0.06, 0.95))
    bo = mesh_object("ThroneBack", back, vel, collection=col)
    bevel(bo, 0.03, 4)
    subsurf(bo, 2)
    # tufting buttons
    bt = bmesh.new()
    for row in range(5):
        for colx in range(3 + (row % 2)):
            x = (colx - (2 + (row % 2)) / 2) * 0.13
            add_sphere(bt, (x, 0.275, 0.62 + row * 0.17), 0.012, subdiv=1)
    mesh_object("Buttons", bt, gm, collection=col)
    s = bmesh.new()
    add_box(s, (0, -0.02, 0.52), (0.56, 0.50, 0.10))
    so = mesh_object("ThroneSeat", s, vel, collection=col)
    bevel(so, 0.035, 4)
    subsurf(so, 1)


def build_bar_stool(col=None):
    """Gold Chiavari-style bar stool, 30 in seat height."""
    gm = gold_metal()
    fr = bmesh.new()
    seat_z = 0.76
    r = 0.012
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        add_bamboo_rod(fr, (sx * 0.22, sy * 0.22, 0), (sx * 0.17, sy * 0.17, seat_z), r, (0.3, 0.6, 0.85))
    for z in (0.28,):
        k = 1 - z / seat_z * (0.05 / 0.22)
        pts = [(sx * 0.22 * k, sy * 0.22 * k, z) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1), (-1, -1))]
        for a, b in zip(pts, pts[1:]):
            add_bamboo_rod(fr, a, b, r * 0.8, (0.5,))
    for sx, sy in ((-1, 1), (1, 1)):
        add_bamboo_rod(fr, (sx * 0.17, sy * 0.17, seat_z), (sx * 0.17, 0.19, seat_z + 0.32), r, (0.4, 0.8))
    for z in (seat_z + 0.31, seat_z + 0.20):
        add_bamboo_rod(fr, (-0.17, 0.19, z), (0.17, 0.19, z), r * 0.85, (0.33, 0.66))
    add_rod(fr, (-0.17, -0.17, seat_z), (0.17, -0.17, seat_z), r)
    add_rod(fr, (-0.17, 0.17, seat_z), (0.17, 0.17, seat_z), r)
    mesh_object("Stool", fr, gm, collection=col)
    _seat_cushion(seat_z, size=(0.36, 0.36), col=col, color=IVORY, y=0.0)


def build_chair_cover(col=None):
    """Banquet chair in a fitted ivory polyester cover with a champagne satin sash."""
    cm = fabric("Cover", (0.93, 0.91, 0.86), 0.7, 0.6)
    bm = bmesh.new()
    # back: tall rounded slab
    add_box(bm, (0, 0.20, 0.72), (0.44, 0.08, 0.56))
    # seat block, skirt flares to the floor
    add_box(bm, (0, -0.01, 0.46), (0.46, 0.46, 0.06))
    ob = mesh_object("CoverTop", bm, cm, collection=col)
    bevel(ob, 0.03, 4)
    subsurf(ob, 2)
    sk = bmesh.new()
    prof = []
    rows = []
    n = 64
    for k in range(10):
        t = k / 9
        z = 0.45 - t * 0.45
        row = []
        for i in range(n):
            a = 2 * math.pi * i / n
            # rounded-square footprint, flaring toward the floor
            rx = 0.235 + 0.035 * t
            ca, sa = math.cos(a), math.sin(a)
            sq = 1 / max(abs(ca), abs(sa)) ** 0.85
            fold = 0.008 * t * math.sin(a * 22)
            row.append(sk.verts.new(((rx + fold) * ca * sq * 0.92, (rx + fold) * sa * sq * 0.92 + 0.01, z)))
        rows.append(row)
    for k in range(len(rows) - 1):
        for i in range(n):
            j = (i + 1) % n
            sk.faces.new((rows[k][i], rows[k][j], rows[k + 1][j], rows[k + 1][i]))
    so = mesh_object("Skirt", sk, cm, collection=col)
    sol = so.modifiers.new("Solid", "SOLIDIFY")
    sol.thickness = 0.004
    band = bmesh.new()
    add_ring(band, (0, 0.20, 0.66), (0, 0, 1), 0.235, 0.03, segs=40, ring=8, scale=(1.0, 0.25))
    satin = mat("Satin", (0.86, 0.76, 0.58), 0.0, 0.25, **{"Sheen Weight": 0.6, "Anisotropic": 0.5})
    b = mesh_object("Band", band, satin, collection=col)
    b.scale = (1, 1, 2.4)
    bow = bmesh.new()
    for sx in (-1, 1):
        add_sphere(bow, (sx * 0.06, 0.275, 0.66), 0.06, scale=(1.0, 0.35, 0.6))
        add_beam(bow, (sx * 0.02, 0.28, 0.64), (sx * 0.07, 0.31, 0.18), 0.07, 0.008)
    mesh_object("CoverBow", bow, satin, collection=col)
