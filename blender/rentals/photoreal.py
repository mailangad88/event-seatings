"""Photoreal sets, lighting and camera for the rental renders.

The original pipeline lit everything with flat colour worlds and area lights on a plain sweep, with
procedural (noise) textures, perfectly sharp edges and a pin-sharp pinhole camera. Those are the tell-tales
that make an image read as "3D render". This module swaps each of them for the real-world equivalent:

* Light: real HDRI photographs of rooms, photo studios and a park (Poly Haven, CC0) light every set, so
  metal, glass and lacquer reflect a real environment.
* Surfaces: photo-scanned oak floor, painted plaster and lawn textures (ambientCG / Poly Haven, CC0).
* Sets: a room corner (oak floor + plaster wall) for furniture, a tabletop for tableware, and a real park
  photographed at sunset for tents and lawn games. The HDRI itself is the visible background outdoors.
* Imperfection: every material gets a little roughness variation and every hard edge a 1-2 mm bevel, so
  highlights roll off edges the way they do on manufactured objects.
* Lens: depth of field focused on the item, so the background softens like a real photo.

Film grain, vignetting and lateral chromatic aberration are added after the render in photo_finish.py.
Assets download with `python blender/rentals/assets.py`; anything missing falls back to the old procedural look.
"""

import math

import bpy  # noqa: F401
import bmesh
from mathutils import Vector

import assets
import lib

SET_OBJECTS = ("SetFloor", "SetWall", "Ground", "Sweep", "Lawn", "Tree", "Trunks")


# ---------------------------------------------------------------------------
# Textures
# ---------------------------------------------------------------------------


def _img(nt, name, non_color=False):
    p = assets.path(name)
    if not p:
        return None
    node = nt.nodes.new("ShaderNodeTexImage")
    node.image = bpy.data.images.load(p, check_existing=True)
    if non_color:
        node.image.colorspace_settings.name = "Non-Color"
    node.interpolation = "Cubic"
    return node


def _mapping(nt, tile, rot=0.0, offset=(0, 0, 0)):
    """Object-space coordinates scaled so one texture tile covers `tile` metres."""
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / tile, 1 / tile, 1 / tile)
    mp.inputs["Rotation"].default_value = (0, 0, rot)
    mp.inputs["Location"].default_value = offset
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    return mp


def scanned_material(name, color, rough=None, normal=None, tile=2.0, tint=(1, 1, 1), rough_scale=1.0,
                     normal_strength=1.0, rot=0.0, fallback=None, rough_channel=None):
    """A Principled BSDF fed by photo-scanned maps. Falls back to `fallback` if the maps aren't downloaded."""
    if not assets.path(color):
        return fallback
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    mp = _mapping(nt, tile, rot)
    col = _img(nt, color)
    nt.links.new(mp.outputs["Vector"], col.inputs["Vector"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    nt.links.new(col.outputs["Color"], mix.inputs["A"])
    mix.inputs["B"].default_value = (*tint, 1)
    nt.links.new(mix.outputs["Result"], p.inputs["Base Color"])
    if rough and assets.path(rough):
        r = _img(nt, rough, non_color=True)
        nt.links.new(mp.outputs["Vector"], r.inputs["Vector"])
        out = r.outputs["Color"]
        if rough_channel is not None:
            sep = nt.nodes.new("ShaderNodeSeparateColor")
            nt.links.new(out, sep.inputs["Color"])
            out = sep.outputs[rough_channel]
        mr = nt.nodes.new("ShaderNodeMath")
        mr.operation = "MULTIPLY"
        mr.inputs[1].default_value = rough_scale
        mr.use_clamp = True
        nt.links.new(out, mr.inputs[0])
        nt.links.new(mr.outputs[0], p.inputs["Roughness"])
    else:
        p.inputs["Roughness"].default_value = 0.6 * rough_scale
    if normal and assets.path(normal):
        n = _img(nt, normal, non_color=True)
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = normal_strength
        nt.links.new(n.outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"], p.inputs["Normal"])
    else:
        bump = nt.nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.15 * normal_strength
        nt.links.new(col.outputs["Color"], bump.inputs["Height"])
        nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def oak_floor(tile=2.2, tint=(1.0, 1.0, 1.0)):
    return scanned_material("OakFloor", "WoodFloor041_Color.jpg", "WoodFloor041_Roughness.jpg", "WoodFloor041_NormalGL.jpg",
                            tile=tile, tint=tint, rough_scale=0.9, normal_strength=0.6, rot=math.radians(90),
                            fallback=lib.plank_wood())


def parquet(tile=1.6):
    return scanned_material("Parquet", "herringbone_parquet_diff_1k.jpg", None, None, tile=tile, tint=(1.0, 0.97, 0.94),
                            rough_scale=0.75, normal_strength=0.5, fallback=oak_floor())


def oak_table(tile=0.7):
    return scanned_material("OakTable", "oak_veneer_01_diff_1k.jpg", None, None, tile=tile, tint=(0.72, 0.6, 0.5),
                            rough_scale=0.6, normal_strength=0.25, fallback=oak_floor(tile=tile))


def linen(color=(0.50, 0.44, 0.35)):
    """Natural flax table linen: a fine plain weave with soft creases, as on a dressed event table."""
    m = bpy.data.materials.new("TableLinen")
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = 0.9
    p.inputs["Sheen Weight"].default_value = 0.5
    p.inputs["Sheen Roughness"].default_value = 0.4
    tc = nt.nodes.new("ShaderNodeTexCoord")
    weave = []
    for axis in ("X", "Y"):
        wv = nt.nodes.new("ShaderNodeTexWave")
        wv.bands_direction = axis
        wv.inputs["Scale"].default_value = 900.0
        wv.inputs["Distortion"].default_value = 1.5
        wv.inputs["Detail"].default_value = 2.0
        nt.links.new(tc.outputs["Object"], wv.inputs["Vector"])
        weave.append(wv)
    mx = nt.nodes.new("ShaderNodeMath")
    mx.operation = "MAXIMUM"
    nt.links.new(weave[0].outputs["Fac"], mx.inputs[0])
    nt.links.new(weave[1].outputs["Fac"], mx.inputs[1])
    crease = nt.nodes.new("ShaderNodeTexNoise")
    crease.inputs["Scale"].default_value = 3.0
    crease.inputs["Detail"].default_value = 3.0
    nt.links.new(tc.outputs["Object"], crease.inputs["Vector"])
    b1 = nt.nodes.new("ShaderNodeBump")
    b1.inputs["Strength"].default_value = 0.08
    b1.inputs["Distance"].default_value = 0.002
    nt.links.new(mx.outputs[0], b1.inputs["Height"])
    b2 = nt.nodes.new("ShaderNodeBump")
    b2.inputs["Strength"].default_value = 0.25
    b2.inputs["Distance"].default_value = 0.02
    nt.links.new(crease.outputs["Fac"], b2.inputs["Height"])
    nt.links.new(b1.outputs["Normal"], b2.inputs["Normal"])
    nt.links.new(b2.outputs["Normal"], p.inputs["Normal"])
    # faint tonal variation in the cloth
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = tuple(c * 0.93 for c in color) + (1,)
    ramp.color_ramp.elements[1].color = (*color, 1)
    nt.links.new(crease.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    return m


def plaster(tint=(1.25, 1.14, 0.98)):
    return scanned_material("Plaster", "painted_plaster_wall_diff_1k.jpg", "painted_plaster_wall_arm_1k.jpg", None,
                            tile=1.6, tint=tint, rough_scale=1.0, normal_strength=0.4, rough_channel=1,
                            fallback=lib.mat("Backdrop", lib.BACKDROP, 0.0, 0.75))


def lawn_material():
    m = scanned_material("Lawn", "Grass004_Color.jpg", None, "Grass004_NormalGL.jpg",
                         tile=1.6, tint=(0.95, 1.0, 0.85), rough_scale=1.6, normal_strength=1.0, fallback=lib.grass())
    if m.node_tree and "Principled BSDF" in m.node_tree.nodes:
        nt = m.node_tree
        nt.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.25
        # Large patches of lighter and darker grass, like a real mown lawn.
        mix = next(n for n in nt.nodes if n.type == "MIX")
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 0.12
        nz.inputs["Detail"].default_value = 4
        tc = nt.nodes.new("ShaderNodeTexCoord")
        nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].color = (0.55, 0.62, 0.42, 1)
        ramp.color_ramp.elements[1].color = (0.95, 1.0, 0.75, 1)
        nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], mix.inputs["B"])
    return m


# ---------------------------------------------------------------------------
# Worlds
# ---------------------------------------------------------------------------


def hdri_world(name, strength=1.0, rot_deg=0.0, visible=True, bg_strength=None):
    """Light the scene with a real HDRI photograph. `visible=False` keeps it for light and reflections only."""
    p = assets.path(name)
    if not p:
        return False
    w = bpy.data.worlds.new("HDRI")
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(p, check_existing=True)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0, 0, math.radians(rot_deg))
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
    nt.links.new(env.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    if bg_strength is not None and bg_strength != strength:
        # Camera rays see the HDRI at a different brightness from the light it casts.
        lp = nt.nodes.new("ShaderNodeLightPath")
        bg2 = nt.nodes.new("ShaderNodeBackground")
        nt.links.new(env.outputs["Color"], bg2.inputs["Color"])
        bg2.inputs["Strength"].default_value = bg_strength
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
        nt.links.new(bg.outputs[0], mix.inputs[1])
        nt.links.new(bg2.outputs[0], mix.inputs[2])
        nt.links.new(mix.outputs[0], nt.nodes["World Output"].inputs["Surface"])
    bpy.context.scene.world = w
    w.cycles_visibility.camera = visible
    return True


def hdri_sun_azimuth(name):
    """Azimuth (degrees, Blender world space before rotation) of the brightest spot in an HDRI: the sun."""
    p = assets.path(name)
    img = bpy.data.images.load(p, check_existing=True)
    w, h = img.size
    px = img.pixels[:]
    best, bi = -1.0, 0
    step = 4 * 3  # sample every 3rd pixel; plenty for finding the sun
    for i in range(0, len(px), step):
        v = px[i] + px[i + 1] + px[i + 2]
        if v > best:
            best, bi = v, i
    k = bi // 4
    u = (k % w) / w
    # Blender equirect: u = atan2(y, -x) / 2pi + 0.5
    phi = (u - 0.5) * 2 * math.pi
    return math.degrees(math.atan2(math.sin(phi), -math.cos(phi)))


# ---------------------------------------------------------------------------
# Sets
# ---------------------------------------------------------------------------


def _plane(name, size, material, loc=(0, 0, 0), rot=(0, 0, 0)):
    bm = bmesh.new()
    sx, sy = size
    vs = [bm.verts.new((x * sx / 2, y * sy / 2, 0)) for x, y in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    bm.faces.new(vs)
    ob = lib.mesh_object(name, bm, material, smooth=False, loc=loc)
    ob.rotation_euler = rot
    return ob


def room_set(lo, hi, tabletop=False, scale=None):
    """A sunlit room corner: oak floor and a warm plaster wall, lit by a real interior HDRI plus window light.

    Call after building the item (bounds lo/hi). Items face -Y; the wall stands behind them at +Y."""
    size = hi - lo
    big = max(size.x, size.y, size.z)
    s = scale or min(4.0, max(0.35, big))
    if tabletop:
        # A table dressed in natural flax linen, like a reception place setting (white china reads against it).
        _plane("SetFloor", (40 * s, 40 * s), linen())
        wd = hi.y + max(0.35, 1.4 * big)
    else:
        _plane("SetFloor", (60 * s, 60 * s), parquet(tile=1.6))
        wd = hi.y + max(0.9, 1.1 * big)
    _plane("SetWall", (60 * s, 30 * s), plaster(), loc=(0, wd, 15 * s - 0.01), rot=(math.radians(90), 0, 0))
    lit = hdri_world("brown_photostudio_02_1k.hdr", 0.9, rot_deg=25, visible=False)
    if not lit:
        lib.world_color((0.9, 0.87, 0.82), 0.35)
    cz = (lo.z + hi.z) / 2
    # Big soft window light from camera left, plus a fill bounce from the right.
    lib.area_light((-3.4 * s, -2.6 * s, 3.0 * s), (0, 0, cz), 420 * s * s, 2.6 * s, (1.0, 0.94, 0.86))
    lib.area_light((3.6 * s, -3.0 * s, 1.6 * s), (0, 0, cz), 40 * s * s, 4.0 * s, (0.96, 0.97, 1.0))


def park_set(dusk=False, sun_side=-50):
    """A real park at golden hour: Poly Haven's 'Rosendal Park Sunset' HDRI as sky, trees and sunlight,
    over a photo-scanned lawn. `sun_side` puts the sun that many degrees from the camera axis."""
    name = "rosendal_park_sunset_2k.hdr" if dusk else "noon_grass_2k.hdr"
    if not assets.path(name):
        lib.lawn(dusk=dusk)
        return
    # Rotate the world so the sun sits behind-left of the camera's default azimuth (-35 deg).
    az = hdri_sun_azimuth(name)
    rot = (180 + sun_side) - az
    if dusk:
        hdri_world(name, 0.35, rot, bg_strength=0.45)
    else:
        hdri_world(name, 1.0, rot, bg_strength=1.0)
    bm = bmesh.new()
    lib.add_disc(bm, (0, 0, -0.02), 400, 0.02, segments=96)
    m = lawn_material()
    if dusk:
        blend_into_hdri(m, name, rot, 0.45)
    else:
        blend_into_hdri(m, name, rot, 1.0)
    lib.mesh_object("Lawn", bm, m, smooth=False)


def blend_into_hdri(m, name, rot_deg, strength, near=18.0, far=70.0):
    """Fade the lawn into the HDRI's own photographed ground with distance, so there's no seam at the horizon.

    Far away the lawn shows exactly what the camera would see of the HDRI in that direction."""
    nt = m.node_tree
    out = nt.nodes["Material Output"]
    bsdf_out = out.inputs["Surface"].links[0].from_socket
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    neg = nt.nodes.new("ShaderNodeVectorMath")
    neg.operation = "SCALE"
    neg.inputs["Scale"].default_value = -1.0
    nt.links.new(geo.outputs["Incoming"], neg.inputs[0])
    rotn = nt.nodes.new("ShaderNodeVectorRotate")
    rotn.rotation_type = "Z_AXIS"
    rotn.inputs["Angle"].default_value = math.radians(rot_deg)
    rotn.invert = True
    nt.links.new(neg.outputs["Vector"], rotn.inputs["Vector"])
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(assets.path(name), check_existing=True)
    nt.links.new(rotn.outputs["Vector"], env.inputs["Vector"])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = strength
    nt.links.new(env.outputs["Color"], em.inputs["Color"])
    # distance from the set centre
    tc = nt.nodes.new("ShaderNodeTexCoord")
    ln = nt.nodes.new("ShaderNodeVectorMath")
    ln.operation = "LENGTH"
    nt.links.new(tc.outputs["Object"], ln.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.interpolation_type = "SMOOTHSTEP"
    mr.inputs["From Min"].default_value = near
    mr.inputs["From Max"].default_value = far
    nt.links.new(ln.outputs["Value"], mr.inputs["Value"])
    # only camera rays see the blend; light bounces still use the lawn
    lp = nt.nodes.new("ShaderNodeLightPath")
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(mr.outputs["Result"], mul.inputs[0])
    nt.links.new(lp.outputs["Is Camera Ray"], mul.inputs[1])
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(mul.outputs[0], mix.inputs["Fac"])
    nt.links.new(bsdf_out, mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])


# ---------------------------------------------------------------------------
# Realism pass: imperfect materials and softened edges
# ---------------------------------------------------------------------------


def _is_glassy(m):
    if not m or not m.use_nodes:
        return False
    for n in m.node_tree.nodes:
        if n.type == "BSDF_PRINCIPLED" and n.inputs["Transmission Weight"].default_value > 0.3:
            return True
        if n.type in ("BSDF_GLASS", "EMISSION"):
            return True
    return False


def roughen(m, amount=0.22, scale=35.0):
    """Vary roughness across the surface (handling marks, uneven finish) instead of one perfect value."""
    if not m or not m.use_nodes or m.get("roughened"):
        return
    nt = m.node_tree
    for p in [n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"]:
        sock = p.inputs["Roughness"]
        if sock.is_linked:
            continue
        r = sock.default_value
        tc = nt.nodes.new("ShaderNodeTexCoord")
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = scale
        nz.inputs["Detail"].default_value = 8.0
        nz.inputs["Roughness"].default_value = 0.6
        nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
        mr = nt.nodes.new("ShaderNodeMapRange")
        mr.inputs["From Min"].default_value = 0.3
        mr.inputs["From Max"].default_value = 0.7
        mr.inputs["To Min"].default_value = max(0.0, r * (1 - amount) - 0.01)
        mr.inputs["To Max"].default_value = min(1.0, r * (1 + amount) + 0.03)
        nt.links.new(nz.outputs["Fac"], mr.inputs["Value"])
        nt.links.new(mr.outputs["Result"], sock)
    m["roughened"] = True


def realism_pass(bevel_mm=1.5):
    for ob in list(bpy.context.scene.objects):
        if ob.type != "MESH" or ob.name.startswith(SET_OBJECTS):
            continue
        mats = [s.material for s in ob.material_slots if s.material]
        for m in mats:
            if not _is_glassy(m):
                roughen(m)
        if any(_is_glassy(m) for m in mats):
            continue
        if any(md.type == "BEVEL" for md in ob.modifiers) or len(ob.data.polygons) > 120000:
            continue
        md = ob.modifiers.new("EdgeSoften", "BEVEL")
        md.width = bevel_mm / 1000.0
        md.segments = 2
        md.limit_method = "ANGLE"
        md.angle_limit = math.radians(35)
        md.use_clamp_overlap = True
        md.harden_normals = False
    # Same material can be shared via instancing collections, which aren't scene objects.
    for coll in bpy.data.collections:
        for ob in coll.objects:
            for s in ob.material_slots:
                if s.material and not _is_glassy(s.material):
                    roughen(s.material)


# ---------------------------------------------------------------------------
# Camera
# ---------------------------------------------------------------------------


def add_depth_of_field(fstop, focus_point=None):
    cam = bpy.context.scene.camera
    if cam is None:
        return
    lo, hi = lib.visible_bounds()
    c = focus_point or (lo + hi) / 2
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = fstop
    # Focus on the front third of the item, where a photographer would.
    d = (Vector(c) - cam.location).length
    size = (hi - lo).length
    cam.data.dof.focus_distance = max(0.2, d - size * 0.12)
    cam.data.dof.aperture_blades = 7
