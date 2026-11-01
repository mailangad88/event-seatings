"""Beyond Chiavari decor scenes, built entirely in code with Blender (bpy).

Builds an elegant banquet scene that heroes our chairs, then renders a still
or a vertical 9:16 clip for Instagram Reels, Facebook Reels and YouTube Shorts.

Run with the pip-installed Blender module (no GUI needed):

    python blender/beyondchiavari_scene.py --theme gilded-ivory --shot dolly --out out/blender/gilded-ivory-dolly

or with a desktop Blender install:

    blender -b -P blender/beyondchiavari_scene.py -- --theme gilded-ivory --shot hero --still

Add --save-blend to also write a .blend file you can open and tweak in Blender.
See blender/README.md for every option.
"""

import argparse
import math
import random
import sys

import bpy  # must come first: the pip bpy module provides bmesh/mathutils
import bmesh
from mathutils import Matrix, Vector

# ---------------------------------------------------------------------------
# Themes. Each one is a look we can sell: chair finish, linen, florals, light.
# ---------------------------------------------------------------------------

THEMES = {
    "gilded-ivory": {
        "label": "Gilded Ivory Ballroom",
        "chair": {"color": (0.95, 0.70, 0.34), "metallic": 1.0, "roughness": 0.22},
        "cushion": (0.93, 0.90, 0.84),
        "linen": (0.92, 0.89, 0.83),
        "drape": (0.85, 0.78, 0.68),
        "floor": ((0.55, 0.52, 0.48), (0.30, 0.27, 0.24)),
        "flowers": [(0.95, 0.93, 0.90), (0.98, 0.84, 0.80), (0.96, 0.90, 0.80), (0.90, 0.70, 0.66)],
        "greens": (0.18, 0.28, 0.16),
        "charger": (0.95, 0.72, 0.38),
        "world": (0.035, 0.028, 0.022),
        "key": (1.0, 0.86, 0.70),
        "fairy": (1.0, 0.78, 0.50),
    },
    "midnight-gold": {
        "label": "Midnight Gold Gala",
        "chair": {"color": (0.95, 0.68, 0.30), "metallic": 1.0, "roughness": 0.18},
        "cushion": (0.05, 0.05, 0.055),
        "linen": (0.025, 0.025, 0.03),
        "drape": (0.06, 0.05, 0.06),
        "floor": ((0.06, 0.06, 0.065), (0.015, 0.015, 0.02)),
        "flowers": [(0.35, 0.02, 0.05), (0.55, 0.05, 0.08), (0.20, 0.01, 0.04), (0.92, 0.88, 0.82)],
        "greens": (0.08, 0.14, 0.08),
        "charger": (0.95, 0.70, 0.32),
        "world": (0.010, 0.008, 0.010),
        "key": (1.0, 0.80, 0.58),
        "fairy": (1.0, 0.72, 0.42),
    },
    "blush-garden": {
        "label": "Blush Garden Romance",
        "chair": {"color": (0.90, 0.66, 0.58), "metallic": 1.0, "roughness": 0.28},
        "cushion": (0.97, 0.93, 0.92),
        "linen": (0.93, 0.80, 0.78),
        "drape": (0.95, 0.88, 0.86),
        "floor": ((0.50, 0.44, 0.40), (0.30, 0.25, 0.22)),
        "flowers": [(0.98, 0.80, 0.80), (0.99, 0.95, 0.94), (0.92, 0.62, 0.66), (0.98, 0.88, 0.76)],
        "greens": (0.22, 0.34, 0.20),
        "charger": (0.88, 0.70, 0.62),
        "world": (0.05, 0.045, 0.045),
        "key": (1.0, 0.90, 0.82),
        "fairy": (1.0, 0.82, 0.60),
    },
}

TABLE_LEN = 6.0
TABLE_W = 1.0
TABLE_H = 0.76
SEAT_SPACING = 0.66


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat_principled(name, color, metallic=0.0, roughness=0.5, **extra):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1.0)
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = roughness
    for key, value in extra.items():
        sock = p.inputs[key]
        sock.default_value = (*value, 1.0) if isinstance(value, tuple) else value
    return m


def mat_emission(name, color, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1.0)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], out.inputs[0])
    return m


def mat_marble(name, light, dark):
    """Polished stone floor: noise-driven veining with a glossy finish."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = 1.6
    tex.inputs["Detail"].default_value = 10.0
    tex.inputs["Distortion"].default_value = 3.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.42
    ramp.color_ramp.elements[0].color = (*dark, 1.0)
    ramp.color_ramp.elements[1].position = 0.62
    ramp.color_ramp.elements[1].color = (*light, 1.0)
    nt.links.new(tex.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.12
    p.inputs["Coat Weight"].default_value = 0.4
    return m


def mat_fabric(name, color, sheen=0.6):
    return mat_principled(name, color, roughness=0.85, **{"Sheen Weight": sheen, "Sheen Tint": (1.0, 1.0, 1.0)})


def mesh_object(name, bm, material=None, smooth=True, collection=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for poly in me.polygons:
            poly.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    (collection or bpy.context.scene.collection).objects.link(ob)
    if material:
        me.materials.append(material)
    return ob


def add_rod(bm, p1, p2, r1, r2=None, segments=16):
    """A tapered cylinder from p1 to p2."""
    p1, p2 = Vector(p1), Vector(p2)
    d = p2 - p1
    length = d.length
    rot = d.to_track_quat("Z", "Y").to_matrix().to_4x4()
    mat = Matrix.Translation((p1 + p2) / 2) @ rot
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=r1, radius2=r2 or r1, depth=length, matrix=mat)


def add_ring(bm, center, direction, major, minor):
    """A thin torus band, used for the bamboo 'nodes' on a Chiavari frame."""
    center = Vector(center)
    rot = Vector(direction).to_track_quat("Z", "Y").to_matrix().to_4x4()
    segs, ring = 20, 8
    verts = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        row = []
        for j in range(ring):
            b = 2 * math.pi * j / ring
            x = (major + minor * math.cos(b)) * math.cos(a)
            y = (major + minor * math.cos(b)) * math.sin(a)
            z = minor * math.sin(b)
            row.append(bm.verts.new(center + (rot @ Vector((x, y, z, 1.0))).to_3d()))
        verts.append(row)
    for i in range(segs):
        for j in range(ring):
            bm.faces.new((verts[i][j], verts[(i + 1) % segs][j], verts[(i + 1) % segs][(j + 1) % ring], verts[i][(j + 1) % ring]))


def add_bamboo_rod(bm, p1, p2, r, nodes):
    add_rod(bm, p1, p2, r)
    p1, p2 = Vector(p1), Vector(p2)
    for t in nodes:
        add_ring(bm, p1.lerp(p2, t), p2 - p1, r * 1.05, r * 0.45)


def add_sphere(bm, center, radius, scale=(1, 1, 1), subdiv=2):
    mat = Matrix.Translation(center) @ Matrix.Diagonal((*scale, 1.0))
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=radius, matrix=mat)


def add_box(bm, center, size):
    mat = Matrix.Translation(center) @ Matrix.Diagonal((*size, 1.0))
    bmesh.ops.create_cube(bm, size=1.0, matrix=mat)


# ---------------------------------------------------------------------------
# The chair: a classic Chiavari, modelled to real rental dimensions (meters)
# ---------------------------------------------------------------------------

def build_chiavari(theme, collection):
    frame = bmesh.new()
    r = 0.0115
    seat_z = 0.445
    fl, fr = (-0.195, 0.19, 0.0), (0.195, 0.19, 0.0)
    rl_floor, rr_floor = (-0.18, -0.20, 0.0), (0.18, -0.20, 0.0)
    rl_top, rr_top = (-0.175, -0.27, 0.92), (0.175, -0.27, 0.92)

    def rear(x_sign, z):
        a = Vector(rl_floor if x_sign < 0 else rr_floor)
        b = Vector(rl_top if x_sign < 0 else rr_top)
        return a.lerp(b, z / 0.92)

    # Legs and back posts, with bamboo nodes
    add_bamboo_rod(frame, fl, (fl[0] * 0.97, fl[1] * 0.96, seat_z), r, (0.35, 0.7))
    add_bamboo_rod(frame, fr, (fr[0] * 0.97, fr[1] * 0.96, seat_z), r, (0.35, 0.7))
    add_bamboo_rod(frame, rl_floor, rl_top, r, (0.18, 0.38, 0.62, 0.82))
    add_bamboo_rod(frame, rr_floor, rr_top, r, (0.18, 0.38, 0.62, 0.82))
    for p in (rl_top, rr_top):  # finials
        add_sphere(frame, Vector(p) + Vector((0, 0, 0.008)), 0.014)

    # Seat frame
    fls, frs = Vector((fl[0] * 0.97, fl[1] * 0.96, seat_z)), Vector((fr[0] * 0.97, fr[1] * 0.96, seat_z))
    rls, rrs = rear(-1, seat_z), rear(1, seat_z)
    for a, b in ((fls, frs), (frs, rrs), (rrs, rls), (rls, fls)):
        add_rod(frame, a, b, r * 0.9)

    # Stretchers between the legs
    for z in (0.17, 0.30):
        lf = Vector(fl).lerp(fls, z / seat_z)
        rf = Vector(fr).lerp(frs, z / seat_z)
        add_bamboo_rod(frame, lf, rear(-1, z), r * 0.7, (0.5,))
        add_bamboo_rod(frame, rf, rear(1, z), r * 0.7, (0.5,))
    add_bamboo_rod(frame, Vector(fl).lerp(fls, 0.42), Vector(fr).lerp(frs, 0.42), r * 0.7, (0.5,))

    # The signature back: three rails and a gallery of spindles
    rails = (0.885, 0.80, 0.64)
    for z in rails:
        add_bamboo_rod(frame, rear(-1, z), rear(1, z), r * 0.85, (0.25, 0.5, 0.75))
    for i in range(1, 5):
        t = i / 5
        top = rear(-1, rails[1]).lerp(rear(1, rails[1]), t)
        bot = rear(-1, rails[2]).lerp(rear(1, rails[2]), t)
        add_bamboo_rod(frame, top, bot, r * 0.6, (0.5,))

    c = theme["chair"]
    frame_mat = mat_principled("ChairFrame", c["color"], c["metallic"], c["roughness"])
    chair = mesh_object("Chiavari", frame, frame_mat, collection=collection)

    # Seat cushion: soft rounded pad
    cush = bmesh.new()
    add_box(cush, (0.0, -0.005, seat_z + 0.03), (0.40, 0.42, 0.05))
    cushion = mesh_object("Cushion", cush, mat_fabric("Cushion", theme["cushion"], 0.8), collection=collection)
    bev = cushion.modifiers.new("Bevel", "BEVEL")
    bev.width, bev.segments = 0.02, 4
    sub = cushion.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = sub.render_levels = 1
    cushion.parent = chair
    return chair


# ---------------------------------------------------------------------------
# Tables, linens and tablescape
# ---------------------------------------------------------------------------

def build_tablecloth(theme, length, width, height):
    """Top + a skirt with soft vertical folds that pools slightly at the floor."""
    bm = bmesh.new()
    add_box(bm, (0, 0, height + 0.005), (length + 0.06, width + 0.06, 0.012))
    hx, hy = length / 2 + 0.03, width / 2 + 0.03
    perim = 2 * (2 * hx + 2 * hy)
    n_around, n_down = 360, 14
    rows = []
    for k in range(n_down + 1):
        t = k / n_down
        z = height + 0.005 - t * (height + 0.005)
        row = []
        for i in range(n_around):
            s = perim * i / n_around
            # walk the rectangle perimeter
            if s < 2 * hx:
                p, n = Vector((-hx + s, -hy, 0)), Vector((0, -1, 0))
            elif s < 2 * hx + 2 * hy:
                p, n = Vector((hx, -hy + (s - 2 * hx), 0)), Vector((1, 0, 0))
            elif s < 4 * hx + 2 * hy:
                p, n = Vector((hx - (s - 2 * hx - 2 * hy), hy, 0)), Vector((0, 1, 0))
            else:
                p, n = Vector((-hx, hy - (s - 4 * hx - 2 * hy), 0)), Vector((-1, 0, 0))
            fold = math.sin(s * 2 * math.pi / 0.16) * 0.012 * (t ** 1.2) + math.sin(s * 2 * math.pi / 0.53 + 1.3) * 0.006 * t
            pool = 0.03 * max(0.0, t - 0.9) / 0.1
            q = p + n * (fold + pool + 0.002 + 0.01 * t)
            q.z = z
            row.append(bm.verts.new(q))
        rows.append(row)
    for k in range(n_down):
        for i in range(n_around):
            j = (i + 1) % n_around
            bm.faces.new((rows[k][i], rows[k][j], rows[k + 1][j], rows[k + 1][i]))
    return mesh_object("Tablecloth", bm, mat_fabric("Linen", theme["linen"], 0.5))


def build_place_settings(theme, positions):
    gold = mat_principled("Charger", theme["charger"], 1.0, 0.25)
    china = mat_principled("China", (0.95, 0.94, 0.92), 0.0, 0.08, **{"Coat Weight": 0.6})
    napkin_mat = mat_fabric("Napkin", theme["cushion"] if sum(theme["cushion"]) > 1.5 else (0.93, 0.90, 0.84), 0.6)
    glass = mat_principled("Glass", (1, 1, 1), 0.0, 0.02, **{"Transmission Weight": 1.0, "IOR": 1.45, "Thin Wall": True})

    b_gold, b_china, b_napkin, b_glass = bmesh.new(), bmesh.new(), bmesh.new(), bmesh.new()
    z = TABLE_H + 0.012
    for (x, y, facing) in positions:
        inset = -facing * 0.28
        cx, cy = x, y + inset
        bmesh.ops.create_cone(b_gold, cap_ends=True, segments=48, radius1=0.165, radius2=0.165, depth=0.008, matrix=Matrix.Translation((cx, cy, z + 0.004)))
        bmesh.ops.create_cone(b_china, cap_ends=True, segments=48, radius1=0.10, radius2=0.135, depth=0.018, matrix=Matrix.Translation((cx, cy, z + 0.017)))
        add_box(b_napkin, (cx, cy, z + 0.035), (0.11, 0.18, 0.018))
        # Wine glass: bowl + stem + foot, as thin shells
        gx, gy = cx + 0.16, cy - facing * 0.14
        bmesh.ops.create_cone(b_glass, cap_ends=True, segments=24, radius1=0.035, radius2=0.035, depth=0.003, matrix=Matrix.Translation((gx, gy, z + 0.002)))
        add_rod(b_glass, (gx, gy, z), (gx, gy, z + 0.09), 0.004, segments=10)
        bmesh.ops.create_cone(b_glass, cap_ends=False, segments=24, radius1=0.022, radius2=0.04, depth=0.09, matrix=Matrix.Translation((gx, gy, z + 0.135)))
    mesh_object("Chargers", b_gold, gold)
    mesh_object("Plates", b_china, china)
    nap = mesh_object("Napkins", b_napkin, napkin_mat)
    bv = nap.modifiers.new("Bevel", "BEVEL")
    bv.width, bv.segments = 0.006, 3
    g = mesh_object("Glasses", b_glass, glass)


def add_bloom(bm, center, rad, rng):
    """A garden rose: a tight bud wrapped by two rings of cupped petals."""
    up = Matrix.Rotation(rng.uniform(-0.35, 0.35), 4, "X") @ Matrix.Rotation(rng.uniform(-0.35, 0.35), 4, "Y")
    base = Matrix.Translation(center) @ up
    for ring, (count, dist, tilt, size) in enumerate(((5, 0.45, 0.55, 0.55), (7, 0.72, 1.05, 0.62))):
        off = rng.uniform(0, math.pi)
        for i in range(count):
            a = off + 2 * math.pi * i / count
            m = base @ Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((rad * dist, 0, -rad * 0.1 * ring)) @ Matrix.Rotation(tilt, 4, "Y") @ Matrix.Diagonal((rad * size * 0.35, rad * size, rad * size * 1.1, 1))
            bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0, matrix=m)
    bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0, matrix=base @ Matrix.Diagonal((rad * 0.42, rad * 0.42, rad * 0.46, 1)))


def build_centerpieces(theme, xs, rng):
    """Low lush florals with taper candles, the look couples screenshot."""
    flower_mats = [mat_principled(f"Bloom{i}", c, 0.0, 0.55, **{"Subsurface Weight": 0.25, "Sheen Weight": 0.4}) for i, c in enumerate(theme["flowers"])]
    leaf = mat_principled("Leaf", theme["greens"], 0.0, 0.45)
    holder = mat_principled("CandleHolder", theme["charger"], 1.0, 0.2)
    wax = mat_principled("Wax", (0.96, 0.93, 0.86), 0.0, 0.4, **{"Subsurface Weight": 0.6})
    flame = mat_emission("Flame", (1.0, 0.62, 0.25), 60.0)

    blooms = [bmesh.new() for _ in flower_mats]
    leaves, holders, waxes, flames = bmesh.new(), bmesh.new(), bmesh.new(), bmesh.new()
    z0 = TABLE_H + 0.012
    for x in xs:
        # Garland of blooms running along the table center
        for _ in range(42):
            px = x + rng.uniform(-0.55, 0.55)
            py = rng.gauss(0, 0.09)
            rad = rng.uniform(0.04, 0.07)
            pz = z0 + rad * 0.7 + max(0.0, 0.10 - abs(px - x) * 0.12) * rng.random()
            add_bloom(blooms[rng.randrange(len(blooms))], Vector((px, py, pz)), rad, rng)
        for _ in range(55):
            px = x + rng.uniform(-0.75, 0.75)
            py = rng.gauss(0, 0.14)
            ang = rng.uniform(0, math.pi)
            m = Matrix.Translation((px, py, z0 + 0.03 + rng.random() * 0.05)) @ Matrix.Rotation(ang, 4, "Z") @ Matrix.Rotation(rng.uniform(-0.6, 0.6), 4, "X") @ Matrix.Diagonal((0.07, 0.025, 0.006, 1))
            bmesh.ops.create_icosphere(leaves, subdivisions=1, radius=1.0, matrix=m)
        # Candles at varied heights
        for dx, h in ((-0.32, 0.30), (-0.12, 0.40), (0.14, 0.34), (0.36, 0.26)):
            cx, cy = x + dx, rng.uniform(-0.05, 0.05)
            add_rod(holders, (cx, cy, z0), (cx, cy, z0 + 0.10), 0.018, 0.012)
            bmesh.ops.create_cone(holders, cap_ends=True, segments=24, radius1=0.04, radius2=0.03, depth=0.012, matrix=Matrix.Translation((cx, cy, z0 + 0.006)))
            add_rod(waxes, (cx, cy, z0 + 0.10), (cx, cy, z0 + 0.10 + h), 0.011, 0.009)
            add_sphere(flames, Vector((cx, cy, z0 + 0.10 + h + 0.018)), 0.008, (1, 1, 2.2))
    for bm, m in zip(blooms, flower_mats):
        ob = mesh_object("Blooms", bm, m)
        tex = bpy.data.textures.new("PetalNoise", "CLOUDS")
        tex.noise_scale = 0.012
        disp = ob.modifiers.new("Petals", "DISPLACE")
        disp.texture, disp.strength = tex, 0.012
    mesh_object("Leaves", leaves, leaf)
    mesh_object("Holders", holders, holder)
    mesh_object("Candles", waxes, wax)
    mesh_object("Flames", flames, flame)
    # A few real lights so candles actually glow on linen and the chairs
    for x in xs:
        bpy.ops.object.light_add(type="POINT", location=(x, 0, z0 + 0.45))
        bpy.context.object.data.energy = 6.0
        bpy.context.object.data.color = (1.0, 0.7, 0.4)
        bpy.context.object.data.shadow_soft_size = 0.05


# ---------------------------------------------------------------------------
# Room: floor, draped backdrop, fairy-light curtain, lighting, world
# ---------------------------------------------------------------------------

def build_room(theme, rng):
    fl = bmesh.new()
    add_box(fl, (0, 0, -0.01), (30, 30, 0.02))
    mesh_object("Floor", fl, mat_marble("Marble", *theme["floor"]), smooth=False)

    # Pleated drape wall behind the table
    bm = bmesh.new()
    nx, nz, w, h, y0 = 600, 2, 30.0, 9.0, 3.2
    grid = []
    for k in range(nz + 1):
        row = []
        for i in range(nx + 1):
            x = -w / 2 + w * i / nx
            y = y0 + math.sin(x * 2 * math.pi / 0.32) * 0.06 + math.sin(x * 1.7) * 0.05
            row.append(bm.verts.new((x, y, h * k / nz)))
        grid.append(row)
    for k in range(nz):
        for i in range(nx):
            bm.faces.new((grid[k][i], grid[k][i + 1], grid[k + 1][i + 1], grid[k + 1][i]))
    mesh_object("Drape", bm, mat_fabric("Drape", theme["drape"], 0.9))

    # Curtain of fairy lights in front of the drape: becomes soft bokeh
    fairy = bmesh.new()
    for i in range(130):
        x = -13.0 + 26.0 * i / 129 + rng.uniform(-0.04, 0.04)
        for j in range(26):
            z = 7.2 - j * 0.27 - rng.uniform(0, 0.08)
            if z > 0.4:
                add_sphere(fairy, Vector((x, 3.0 + rng.uniform(-0.03, 0.03), z)), 0.012, subdiv=1)
    mesh_object("FairyLights", fairy, mat_emission("Fairy", theme["fairy"], 25.0))

    # Warm key light and a cool-ish rim to sculpt the gold
    bpy.ops.object.light_add(type="AREA", location=(-3.0, -3.0, 3.6))
    key = bpy.context.object
    key.data.energy, key.data.size, key.data.color = 650, 2.5, theme["key"]
    key.rotation_euler = (math.radians(52), 0, math.radians(-45))
    bpy.ops.object.light_add(type="AREA", location=(3.5, 1.8, 2.4))
    rim = bpy.context.object
    rim.data.energy, rim.data.size, rim.data.color = 280, 1.5, (0.9, 0.92, 1.0)
    rim.rotation_euler = (math.radians(70), 0, math.radians(120))
    # Uplights washing the drape
    for x in (-4.5, -1.5, 1.5, 4.5):
        bpy.ops.object.light_add(type="SPOT", location=(x, 2.6, 0.1))
        s = bpy.context.object
        s.data.energy, s.data.spot_size, s.data.color = 180, math.radians(60), theme["fairy"]
        s.rotation_euler = (math.radians(-20), 0, 0)

    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (*theme["world"], 1.0)
    bpy.context.scene.world = world


def build_banquet(theme, seed=7):
    rng = random.Random(seed)
    build_room(theme, rng)
    build_tablecloth(theme, TABLE_LEN, TABLE_W, TABLE_H)

    chairs_col = bpy.data.collections.new("ChairSource")
    bpy.context.scene.collection.children.link(chairs_col)
    build_chiavari(theme, chairs_col)
    bpy.context.view_layer.layer_collection.children["ChairSource"].exclude = True

    n = int(TABLE_LEN / SEAT_SPACING)
    xs = [(-(n - 1) / 2 + i) * SEAT_SPACING for i in range(n)]
    seats = []
    for side in (-1, 1):
        for x in xs:
            inst = bpy.data.objects.new("Chair", None)
            inst.instance_type = "COLLECTION"
            inst.instance_collection = chairs_col
            # Chair front faces the table; near side (side=-1) faces +y.
            inst.location = (x + rng.uniform(-0.01, 0.01), side * (TABLE_W / 2 + 0.22), 0)
            inst.rotation_euler = (0, 0, (0 if side < 0 else math.pi) + rng.uniform(-0.02, 0.02))
            bpy.context.scene.collection.objects.link(inst)
            seats.append((x, side * TABLE_W / 2, side))
    build_place_settings(theme, [(x, y, -s) for (x, y, s) in seats])
    build_centerpieces(theme, [-2.0, 0.0, 2.0], rng)
    return xs


# ---------------------------------------------------------------------------
# Cameras: the shots we post
# ---------------------------------------------------------------------------

def setup_camera(shot, xs, frames):
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 40
    cam_data.dof.use_dof = True
    cam_data.dof.aperture_fstop = 2.2
    cam = bpy.data.objects.new("Cam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    target = bpy.data.objects.new("Focus", None)
    bpy.context.scene.collection.objects.link(target)
    track = cam.constraints.new("TRACK_TO")
    track.target = target
    track.track_axis, track.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"
    cam_data.dof.focus_object = target

    near_y = -(TABLE_W / 2 + 0.22)
    hero_x = xs[len(xs) // 2 - 1]
    if shot == "dolly":
        # Glide down the aisle beside the chairs, focus riding the chair backs.
        keys = [((-3.6, -1.75, 1.05), (-1.6, near_y, 0.75)), ((-1.2, -1.75, 1.0), (0.9, near_y, 0.72))]
    elif shot == "hero":
        # Slow arc around one chair: the money shot of the frame and cushion.
        c = Vector((hero_x, near_y, 0.0))
        keys = []
        for t, ang in ((0, -2.25), (1, -1.45)):
            keys.append(((c.x + math.cos(ang) * 1.35, c.y + math.sin(ang) * 1.35, 0.85 - 0.12 * t), (c.x, c.y, 0.58)))
        cam_data.lens = 55
        cam_data.dof.aperture_fstop = 1.8
    elif shot == "reveal":
        # Rise from chair-leg level up to reveal the full tablescape.
        keys = [((-0.4, -2.3, 0.35), (-0.4, near_y, 0.35)), ((-0.9, -3.1, 1.75), (0.2, 0.0, 0.70))]
        cam_data.lens = 32
        cam_data.dof.aperture_fstop = 2.8
    else:
        raise SystemExit(f"Unknown shot {shot}")

    for frame, (loc, aim) in zip((1, frames), keys):
        cam.location, target.location = loc, aim
        cam.keyframe_insert("location", frame=frame)
        target.keyframe_insert("location", frame=frame)
    # Two Bezier keys with auto-clamped handles already ease in and out.
    return cam


# ---------------------------------------------------------------------------
# Render settings and entry point
# ---------------------------------------------------------------------------

def configure_render(args):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "GPU" if args.gpu else "CPU"
    sc.cycles.samples = args.samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.03
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.cycles.max_bounces = 10
    sc.cycles.transmission_bounces = 10
    sc.cycles.transparent_max_bounces = 8
    sc.cycles.caustics_reflective = sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.0
    sc.render.use_persistent_data = True
    # Resume: skip frames that already exist, so an interrupted clip render picks up where it stopped
    sc.render.use_overwrite = False
    sc.render.resolution_x, sc.render.resolution_y = args.width, args.height
    sc.render.resolution_percentage = 100
    sc.render.fps = args.fps
    sc.frame_start, sc.frame_end = 1, args.frames
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.render.image_settings.file_format = "JPEG" if args.still else "PNG"
    sc.render.image_settings.quality = 94


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--theme", default="gilded-ivory", choices=sorted(THEMES))
    ap.add_argument("--shot", default="dolly", choices=["dolly", "hero", "reveal"])
    ap.add_argument("--out", required=True, help="Output path prefix (frames get _0001.png etc.)")
    ap.add_argument("--still", action="store_true", help="Render one still instead of a clip")
    ap.add_argument("--still-frame", type=int, default=0, help="Which frame of the move to render as the still (default: first)")
    ap.add_argument("--width", type=int, default=1080)
    ap.add_argument("--height", type=int, default=1920)
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--frames", type=int, default=120)
    ap.add_argument("--samples", type=int, default=64)
    ap.add_argument("--gpu", action="store_true")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--save-blend", action="store_true")
    return ap.parse_args(argv)


def main():
    args = parse_args()
    theme = THEMES[args.theme]
    reset_scene()
    xs = build_banquet(theme, args.seed)
    setup_camera(args.shot, xs, args.frames)
    configure_render(args)
    sc = bpy.context.scene
    if args.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=bpy.path.abspath(args.out + ".blend"))
    if args.still:
        sc.frame_set(args.still_frame or 1)
        sc.render.filepath = args.out + ".jpg"
        bpy.ops.render.render(write_still=True)
    else:
        sc.render.filepath = args.out + "_"
        bpy.ops.render.render(animation=True)


if __name__ == "__main__":
    main()
