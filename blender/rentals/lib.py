"""Shared helpers for the Beyond Chiavari rental catalog renders.

Geometry helpers build meshes with bmesh; materials are Principled BSDF presets;
`studio()` and `lawn()` set up the two photo environments; `shoot()` frames a
camera on whatever is in the scene.
"""

import math
import random

import bpy  # noqa: F401  (must import before bmesh/mathutils)
import bmesh
from mathutils import Matrix, Vector

# ---------------------------------------------------------------------------
# Scene + mesh plumbing
# ---------------------------------------------------------------------------


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mesh_object(name, bm, material=None, smooth=True, collection=None, loc=(0, 0, 0), rot_z=0.0):
    me = bpy.data.meshes.new(name)
    if id(bm) not in LATHED:  # lathe() winds its faces outward already; recalc can flip thin shells
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    LATHED.discard(id(bm))
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for poly in me.polygons:
            poly.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    (collection or bpy.context.scene.collection).objects.link(ob)
    if material is not None:
        me.materials.append(material)
    ob.location = loc
    ob.rotation_euler = (0, 0, rot_z)
    return ob


def bevel(ob, width=0.004, segments=2):
    m = ob.modifiers.new("Bevel", "BEVEL")
    m.width, m.segments = width, segments
    m.limit_method = "ANGLE"
    return ob


def subsurf(ob, levels=1):
    m = ob.modifiers.new("Subsurf", "SUBSURF")
    m.levels = m.render_levels = levels
    return ob


def add_rod(bm, p1, p2, r1, r2=None, segments=16):
    p1, p2 = Vector(p1), Vector(p2)
    d = p2 - p1
    if d.length < 1e-6:
        return
    rot = d.to_track_quat("Z", "Y").to_matrix().to_4x4()
    mat = Matrix.Translation((p1 + p2) / 2) @ rot
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=r1, radius2=r1 if r2 is None else r2, depth=d.length, matrix=mat)


def add_polyline(bm, pts, r, segments=12, joints=True):
    for a, b in zip(pts, pts[1:]):
        add_rod(bm, a, b, r, segments=segments)
    if len(pts) > 6:
        # dense curve: extend each rod slightly instead of beading the joints
        for a, b in zip(pts, pts[1:]):
            d = (Vector(b) - Vector(a))
            add_rod(bm, Vector(a) - d * 0.15, Vector(b) + d * 0.15, r, segments=segments)
        return
    if joints:
        for p in pts[1:-1]:
            add_sphere(bm, p, r, subdiv=1)


def add_beam(bm, p1, p2, w, h=None):
    """Square-section beam from p1 to p2 (w x h)."""
    p1, p2 = Vector(p1), Vector(p2)
    d = p2 - p1
    rot = d.to_track_quat("Z", "Y").to_matrix().to_4x4()
    mat = Matrix.Translation((p1 + p2) / 2) @ rot @ Matrix.Diagonal((w, h or w, d.length, 1))
    bmesh.ops.create_cube(bm, size=1.0, matrix=mat)


def add_ring(bm, center, direction, major, minor, segs=24, ring=8, scale=(1, 1)):
    center = Vector(center)
    rot = Vector(direction).to_track_quat("Z", "Y").to_matrix().to_4x4()
    verts = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        row = []
        for j in range(ring):
            b = 2 * math.pi * j / ring
            x = (major + minor * math.cos(b)) * math.cos(a) * scale[0]
            y = (major + minor * math.cos(b)) * math.sin(a) * scale[1]
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
        add_ring(bm, p1.lerp(p2, t), p2 - p1, r * 1.05, r * 0.45, segs=16, ring=6)


def add_sphere(bm, center, radius, scale=(1, 1, 1), subdiv=2):
    mat = Matrix.Translation(center) @ Matrix.Diagonal((*scale, 1.0))
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=radius, matrix=mat)


def add_box(bm, center, size, rot_z=0.0):
    mat = Matrix.Translation(center) @ Matrix.Rotation(rot_z, 4, "Z") @ Matrix.Diagonal((*size, 1.0))
    bmesh.ops.create_cube(bm, size=1.0, matrix=mat)


def add_disc(bm, center, r, depth, segments=64):
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=r, radius2=r, depth=depth, matrix=Matrix.Translation(center))


LATHED = set()


def lathe(bm, profile, segments=64, center=(0, 0, 0), cap=True, thickness=0.0):
    """Revolve a list of (radius, z) points around Z. thickness>0 makes a hollow shell
    by walking the profile back inward (good for glasses, bowls, cups)."""
    pts = list(profile)
    if thickness > 0:
        inner = []
        for i, (r, z) in enumerate(pts):
            a = pts[max(i - 1, 0)]
            b = pts[min(i + 1, len(pts) - 1)]
            dr, dz = b[0] - a[0], b[1] - a[1]
            ln = math.hypot(dr, dz) or 1.0
            nr, nz = -dz / ln, dr / ln
            inner.append((max(r + nr * thickness, 0.0), z + nz * thickness))
        inner = list(reversed(inner))
        # lift the inner floor so the vessel has a base
        pts = pts + inner
        cap = False
    cx, cy, cz = center
    LATHED.add(id(bm))
    rings = []
    for r, z in pts:
        ring = []
        for i in range(segments):
            a = 2 * math.pi * i / segments
            ring.append(bm.verts.new((cx + r * math.cos(a), cy + r * math.sin(a), cz + z)))
        rings.append(ring)
    for k in range(len(rings) - 1):
        for i in range(segments):
            j = (i + 1) % segments
            try:
                bm.faces.new((rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]))
            except ValueError:
                pass
    if thickness > 0:
        for i in range(segments):  # close the rim
            j = (i + 1) % segments
            try:
                bm.faces.new((rings[-1][i], rings[-1][j], rings[0][j], rings[0][i]))
            except ValueError:
                pass
    elif cap:
        if pts[0][0] > 1e-5:
            bm.faces.new(list(reversed(rings[0])))
        if pts[-1][0] > 1e-5:
            bm.faces.new(rings[-1])
    bmesh.ops.remove_doubles(bm, verts=[v for r in rings for v in r], dist=1e-6)


def instance(collection, loc, rot_z=0.0, scale=1.0):
    inst = bpy.data.objects.new("Inst", None)
    inst.instance_type = "COLLECTION"
    inst.instance_collection = collection
    inst.location = loc
    inst.rotation_euler = (0, 0, rot_z)
    inst.scale = (scale, scale, scale)
    bpy.context.scene.collection.objects.link(inst)
    return inst


def as_collection(name, build):
    """Build geometry into a hidden source collection so it can be instanced many times."""
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    build(col)
    bpy.context.view_layer.layer_collection.children[name].exclude = True
    return col


# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

_mat_cache = {}


def mat(name, color, metallic=0.0, roughness=0.5, **extra):
    key = (name, tuple(color), metallic, roughness, tuple(sorted((k, str(v)) for k, v in extra.items())))
    if key in _mat_cache and _mat_cache[key].name in bpy.data.materials:
        return _mat_cache[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1.0)
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = roughness
    for k, v in extra.items():
        sock = p.inputs[k]
        sock.default_value = (*v, 1.0) if isinstance(v, tuple) and len(v) == 3 else v
    _mat_cache[key] = m
    return m


def emission(name, color, strength):
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


def fabric(name, color, sheen=0.6, roughness=0.85):
    return mat(name, color, 0.0, roughness, **{"Sheen Weight": sheen, "Sheen Tint": (1.0, 1.0, 1.0)})


def _noise_mix(m, scale, c1, c2, lo=0.35, hi=0.65, bump=0.0, detail=6.0, stretch=None, kind="noise"):
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    if kind == "wave":
        tex = nt.nodes.new("ShaderNodeTexWave")
        tex.inputs["Scale"].default_value = scale
        tex.inputs["Distortion"].default_value = 6.0
        tex.inputs["Detail"].default_value = detail
    else:
        tex = nt.nodes.new("ShaderNodeTexNoise")
        tex.inputs["Scale"].default_value = scale
        tex.inputs["Detail"].default_value = detail
    if stretch:
        coord = nt.nodes.new("ShaderNodeTexCoord")
        mapn = nt.nodes.new("ShaderNodeMapping")
        mapn.inputs["Scale"].default_value = stretch
        nt.links.new(coord.outputs["Object"], mapn.inputs["Vector"])
        nt.links.new(mapn.outputs["Vector"], tex.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = lo
    ramp.color_ramp.elements[0].color = (*c1, 1.0)
    ramp.color_ramp.elements[1].position = hi
    ramp.color_ramp.elements[1].color = (*c2, 1.0)
    nt.links.new(tex.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    if bump:
        b = nt.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = bump
        nt.links.new(tex.outputs["Fac"], b.inputs["Height"])
        nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return m


def wood(name="Wood", light=(0.55, 0.36, 0.20), dark=(0.30, 0.17, 0.08), roughness=0.45, stretch=(1.0, 6.0, 6.0)):
    light = tuple(c * 0.62 for c in light)
    dark = tuple(c * 0.62 for c in dark)
    m = mat(name + "_w", light, 0.0, roughness)
    return _noise_mix(m, 2.5, dark, light, 0.3, 0.7, bump=0.03, detail=8, stretch=stretch)


def plank_wood(name="Plank"):
    """Weathered farm-table pine, grain running along X."""
    m = mat(name, (0.55, 0.40, 0.26), 0.0, 0.6)
    return _noise_mix(m, 2.0, (0.30, 0.19, 0.10), (0.58, 0.43, 0.28), 0.3, 0.75, bump=0.2, detail=10, stretch=(0.6, 14.0, 14.0))


def grass():
    m = mat("Grass", (0.12, 0.26, 0.06), 0.0, 0.9)
    return _noise_mix(m, 60.0, (0.06, 0.16, 0.03), (0.20, 0.34, 0.08), 0.3, 0.7, bump=0.6, detail=12)


def marble(light=(0.86, 0.84, 0.80), dark=(0.55, 0.52, 0.48)):
    m = mat("Marble", light, 0.0, 0.12, **{"Coat Weight": 0.4})
    return _noise_mix(m, 1.6, dark, light, 0.42, 0.62, detail=10)


def sequin(color=(0.85, 0.62, 0.30)):
    m = mat("Sequin", color, 1.0, 0.22)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 420.0
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.6
    nt.links.new(vor.outputs["Distance"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return m


def woven(color=(0.70, 0.55, 0.34)):
    """Rattan/wicker weave: a checker texture as bump."""
    color = tuple(c * 0.7 for c in color)
    m = mat("Woven", color, 0.0, 0.7)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    br = nt.nodes.new("ShaderNodeTexChecker")
    br.inputs["Scale"].default_value = 160.0
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.5
    nt.links.new(br.outputs["Fac"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return m


# Common finishes
GOLD = (0.95, 0.70, 0.34)
SILVER = (0.90, 0.90, 0.92)
IVORY = (0.92, 0.89, 0.83)
WHITE = (0.90, 0.90, 0.88)
BLACK = (0.02, 0.02, 0.022)
BLUSH = (0.93, 0.76, 0.74)
SAGE = (0.36, 0.46, 0.34)
CHAMPAGNE = (0.88, 0.80, 0.66)


def gold_metal(rough=0.22):
    return mat("Gold", GOLD, 1.0, rough)


def silver_metal(rough=0.18):
    return mat("Silver", SILVER, 1.0, rough)


def steel(rough=0.35):
    return mat("Steel", (0.62, 0.62, 0.64), 1.0, rough)


def black_metal():
    return mat("BlackMetal", (0.03, 0.03, 0.03), 0.6, 0.4)


def glass(tint=(1, 1, 1), rough=0.02):
    return mat("Glass", tint, 0.0, rough, **{"Transmission Weight": 1.0, "IOR": 1.45})


def thin_glass(tint=(1, 1, 1)):
    """Single-surface glass (use with lathe(..., cap=False)); avoids dark total-internal-reflection bands."""
    return mat("ThinGlass", tint, 0.0, 0.02, **{"Transmission Weight": 1.0, "IOR": 1.5, "Thin Wall": True})


def acrylic(tint=(0.95, 0.97, 1.0), thin=False):
    return mat("Acrylic", tint, 0.0, 0.05, **{"Transmission Weight": 1.0, "IOR": 1.49, "Thin Wall": thin})


def china():
    return mat("China", (0.95, 0.94, 0.92), 0.0, 0.08, **{"Coat Weight": 0.6})


def plastic(color, rough=0.35):
    return mat("Plastic", color, 0.0, rough, **{"Coat Weight": 0.2})


# ---------------------------------------------------------------------------
# Environments
# ---------------------------------------------------------------------------

BACKDROP = (0.90, 0.84, 0.74)  # ~ #EFE9DF after AgX


def world_color(color, strength=1.0):
    w = bpy.data.worlds.new("World")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*color, 1.0)
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w


def area_light(loc, aim, energy, size, color=(1, 1, 1)):
    bpy.ops.object.light_add(type="AREA", location=loc)
    lt = bpy.context.object
    lt.data.energy, lt.data.size, lt.data.color = energy, size, color
    d = Vector(aim) - Vector(loc)
    lt.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return lt


def studio(scale=1.0, color=BACKDROP):
    """Warm light seamless sweep: floor curves into a back wall. Soft top-left key."""
    bm = bmesh.new()
    w, depth, radius, wall = 30.0 * scale, 12.0 * scale, 2.5 * scale, 12.0 * scale
    ys = []
    n_floor, n_curve, n_wall = 6, 16, 4
    pts = []
    for i in range(n_floor + 1):
        pts.append((-depth + depth * i / n_floor, 0.0))
    for i in range(1, n_curve + 1):
        a = (math.pi / 2) * i / n_curve
        pts.append((radius * math.sin(a), radius * (1 - math.cos(a))))
    for i in range(1, n_wall + 1):
        pts.append((radius, radius + (wall - radius) * i / n_wall))
    nx = 8
    grid = []
    for y, z in pts:
        grid.append([bm.verts.new((-w / 2 + w * i / nx, y + 2.0 * scale, z)) for i in range(nx + 1)])
    for k in range(len(grid) - 1):
        for i in range(nx):
            bm.faces.new((grid[k][i], grid[k][i + 1], grid[k + 1][i + 1], grid[k + 1][i]))
    mesh_object("Sweep", bm, mat("Backdrop", color, 0.0, 0.75))
    s = scale
    area_light((-3.2 * s, -3.4 * s, 4.6 * s), (0, 0, 0.5 * s), 520 * s * s, 2.2 * s, (1.0, 0.95, 0.88))
    area_light((3.8 * s, -2.6 * s, 1.8 * s), (0, 0, 0.6 * s), 90 * s * s, 3.5 * s, (0.95, 0.97, 1.0))
    area_light((1.5 * s, 2.5 * s, 3.5 * s), (0, 0, 0.6 * s), 220 * s * s, 1.6 * s, (1.0, 0.96, 0.9))
    world_color((0.9, 0.87, 0.82), 0.12)


def sky_world(sun_elev_deg=18, sun_rot_deg=200, strength=0.25, kind="MULTIPLE_SCATTERING"):
    w = bpy.data.worlds.new("Sky")
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = kind
    sky.sun_elevation = math.radians(sun_elev_deg)
    sky.sun_rotation = math.radians(sun_rot_deg)
    nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w


def sun(elev_deg, rot_deg, energy=3.5, color=(1.0, 0.86, 0.68), angle=1.5):
    bpy.ops.object.light_add(type="SUN")
    s = bpy.context.object
    s.data.energy, s.data.color = energy, color
    s.data.angle = math.radians(angle)
    s.rotation_euler = (math.radians(90 - elev_deg), 0, math.radians(rot_deg))
    return s


def add_tree(bm_leaf, bm_trunk, x, y, h, rng):
    add_rod(bm_trunk, (x, y, 0), (x, y, h * 0.55), h * 0.03, h * 0.02, segments=8)
    for _ in range(9):
        c = Vector((x + rng.uniform(-1, 1) * h * 0.18, y + rng.uniform(-1, 1) * h * 0.18, h * rng.uniform(0.55, 0.95)))
        add_sphere(bm_leaf, c, h * rng.uniform(0.16, 0.26), subdiv=2)


def lawn(sun_elev=16, sun_rot=215, dusk=False, trees=True, seed=3):
    """Manicured lawn with a soft tree line, lit by a low warm sun (golden hour) or dusk."""
    rng = random.Random(seed)
    bm = bmesh.new()
    add_box(bm, (0, 0, -0.05), (400, 400, 0.1))
    mesh_object("Lawn", bm, grass(), smooth=False)
    if trees:
        leaf, trunk = bmesh.new(), bmesh.new()
        for i in range(140):
            a = math.radians(rng.uniform(15, 165))
            d = rng.uniform(75, 120)
            add_tree(leaf, trunk, math.cos(a) * d, math.sin(a) * d, rng.uniform(11, 20), rng)
        lo = mesh_object("TreeLeaves", leaf, mat("Leaf", (0.045, 0.085, 0.03), 0.0, 0.85))
        tex = bpy.data.textures.new("LeafNoise", "CLOUDS")
        tex.noise_scale = 0.6
        tex.noise_depth = 2
        d = lo.modifiers.new("Leafy", "DISPLACE")
        d.texture, d.strength = tex, 1.6
        mesh_object("Trunks", trunk, mat("Bark", (0.05, 0.04, 0.03), 0.0, 0.9))
    if dusk:
        sky_world(2.5, sun_rot, 0.35)
        sun(2.5, sun_rot, 0.6, (1.0, 0.55, 0.35))
    else:
        sky_world(sun_elev, sun_rot, 0.3)
        sun(sun_elev, sun_rot, 3.2)


# ---------------------------------------------------------------------------
# Camera + render
# ---------------------------------------------------------------------------


def camera(loc, target, lens=50, fstop=None, focus=None):
    cd = bpy.data.cameras.new("Cam")
    cd.lens = lens
    cd.clip_end = 1000
    cam = bpy.data.objects.new("Cam", cd)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    cam.location = loc
    d = Vector(target) - Vector(loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = (Vector(focus or target) - Vector(loc)).length
    return cam


def visible_bounds():
    """World-space bounding box of everything renderable (mesh objects + instances)."""
    lo = Vector((1e9, 1e9, 1e9))
    hi = -lo
    deps = bpy.context.evaluated_depsgraph_get()
    for inst in deps.object_instances:
        ob = inst.object
        if ob.type != "MESH" or ob.name.startswith(("Sweep", "Lawn", "Tree", "Trunks", "Ground", "Flags")):
            continue
        for c in ob.bound_box:
            w = inst.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    return lo, hi


def shoot(az=-35, el=18, lens=70, pad=1.12, aim_z=None, fstop=None, aspect=1.0):
    """Frame the product: camera on a sphere around the bounds, distance fitted to fill the frame."""
    lo, hi = visible_bounds()
    c = (lo + hi) / 2
    size = hi - lo
    if aim_z is not None:
        c.z = aim_z
    radius = 0.5 * size.length
    sensor = 36.0
    fov = 2 * math.atan(sensor / 2 / lens)
    if aspect < 1:
        fov = 2 * math.atan(math.tan(fov / 2) * aspect)
    dist = radius * pad / math.sin(fov / 2)
    a, e = math.radians(az), math.radians(el)
    loc = (c.x + dist * math.sin(a), c.y - dist * math.cos(a), c.z + dist * math.sin(e))
    loc = (c.x + dist * math.cos(e) * math.sin(a), c.y - dist * math.cos(e) * math.cos(a), c.z + dist * math.sin(e))
    return camera(loc, c, lens, fstop)


def configure_render(width, height, samples, out):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.03
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.cycles.max_bounces = 8
    sc.cycles.transmission_bounces = 12
    sc.cycles.transparent_max_bounces = 8
    sc.cycles.caustics_reflective = sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.0
    sc.render.resolution_x, sc.render.resolution_y = width, height
    sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Base Contrast"
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = out


def bloom(bm, center, rad, rng):
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
