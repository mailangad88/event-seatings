"""Styled 16:9 event setups for category heroes and landing pages."""

import math
import random

import bmesh
from mathutils import Vector

import chairs as C
import lib
import misc as M
import tables as T
import tents as TN
from catalog import item
from lib import add_box, mesh_object

IN = 0.0254


def ballroom():
    rng = random.Random(2)
    bm = bmesh.new()
    add_box(bm, (0, 0, -0.01), (40, 40, 0.02))
    mesh_object("Floor", bm, lib.marble((0.42, 0.38, 0.34), (0.20, 0.17, 0.15)), smooth=False)
    # pleated drape wall
    dr = bmesh.new()
    nx, w, h, y0 = 700, 30.0, 8.0, 5.0
    rows = []
    for k in range(2):
        rows.append([dr.verts.new((-w / 2 + w * i / nx, y0 + 0.06 * math.sin((-w / 2 + w * i / nx) * 2 * math.pi / 0.3), h * k)) for i in range(nx + 1)])
    for i in range(nx):
        dr.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    mesh_object("Drape", dr, lib.fabric("Drape", (0.55, 0.45, 0.36), 0.9))
    fairy = bmesh.new()
    for i in range(140):
        x = -14 + 28 * i / 139
        for j in range(22):
            z = 7.0 - j * 0.3 - rng.uniform(0, 0.1)
            lib.add_sphere(fairy, (x + rng.uniform(-0.04, 0.04), y0 - 0.2, z), 0.012, subdiv=1)
    mesh_object("Fairy", fairy, lib.emission("Fairy", (1.0, 0.78, 0.5), 22))
    for x in (-6, -2, 2, 6):
        lib.bpy.ops.object.light_add(type="SPOT", location=(x, y0 - 0.5, 0.1))
        s = lib.bpy.context.object
        s.data.energy, s.data.spot_size, s.data.color = 500, math.radians(60), (1.0, 0.75, 0.5)
        s.rotation_euler = (math.radians(-20), 0, 0)
    lib.area_light((-3, -6, 5), (0, 0, 0.6), 380, 4, (1.0, 0.88, 0.72))
    lib.area_light((5, -2, 4), (0, 0, 0.6), 90, 3, (0.9, 0.92, 1.0))
    lib.world_color((0.03, 0.025, 0.02), 1.0)


def reception():
    ballroom()
    gold = lib.as_collection("Gold", lambda col: C.build_chiavari(col=col))
    pal = T.IVORY_BLUSH
    for i, (x, y) in enumerate(((-1.9, 0.6), (1.9, 0.6), (0.0, 2.8), (-3.8, 3.0), (3.8, 3.0))):
        objs_before = set(lib.bpy.context.scene.objects)
        T.dressed_round(chair_col=gold, palette=pal if i < 3 else None, seed=i + 1, settings=i < 3)
        for ob in set(lib.bpy.context.scene.objects) - objs_before:
            if ob.type != "LIGHT" and ob.parent is None:
                ob.location = (ob.location.x + x, ob.location.y + y, ob.location.z)
    lib.camera((-0.6, -4.4, 1.45), (0.0, 1.0, 0.75), lens=35, fstop=2.8, focus=(-1.9, 0.6, 0.8))


def ceremony():
    white = lib.as_collection("White", lambda col: C.build_folding(col=col))
    for row in range(10):
        for k in range(5):
            for side in (-1, 1):
                x = side * (0.9 + k * 0.5)
                lib.instance(white, (x, row * 0.95, 0), rot_z=math.pi)
    run = bmesh.new()
    add_box(run, (0, 5.0, 0.003), (1.1, 14, 0.006))
    mesh_object("Aisle", run, lib.fabric("Runner", (0.95, 0.94, 0.90), 0.5))
    pet = bmesh.new()
    rng = random.Random(3)
    for _ in range(260):
        lib.add_sphere(pet, (rng.uniform(-0.62, 0.62), rng.uniform(-1, 11), 0.01), 0.018, scale=(1, 0.7, 0.2), subdiv=1)
    mesh_object("Petals", pet, lib.mat("Petal", (0.95, 0.70, 0.72), 0.0, 0.6))
    arch_before = set(lib.bpy.context.scene.objects)
    M.ceremony_arch()
    for ob in set(lib.bpy.context.scene.objects) - arch_before:
        ob.location = (ob.location.x, ob.location.y + 11.5, ob.location.z)
        ob.scale = (1.4, 1.4, 1.4)
    lib.camera((0.0, -3.2, 1.6), (0.0, 11.5, 1.2), lens=35, fstop=4.0, focus=(0, 4, 0.8))


def cocktail():
    for x, y in ((-1.6, 1.0), (0.6, 0.2), (2.2, 2.0), (-0.6, 3.2)):
        before = set(lib.bpy.context.scene.objects)
        T.build_spandex_highboy()
        T.bud_vase(0, 0, 42 * IN + 0.012)
        for ob in set(lib.bpy.context.scene.objects) - before:
            ob.location = (ob.location.x + x, ob.location.y + y, ob.location.z)
    before = set(lib.bpy.context.scene.objects)
    M.lounge_sofa(2.0)
    for ob in set(lib.bpy.context.scene.objects) - before:
        ob.location = (ob.location.x - 3.6, ob.location.y + 2.6, ob.location.z)
        ob.rotation_euler = (0, 0, 0.4)
    poles = bmesh.new()
    anchors = [(-5, -1, 3.2), (-5, 6, 3.2), (5, 6, 3.2), (5, -1, 3.2)]
    for x, y, z in anchors:
        lib.add_rod(poles, (x, y, 0), (x, y, z), 0.04)
    mesh_object("Poles", poles, lib.black_metal())
    pairs = [(anchors[0], anchors[2]), (anchors[1], anchors[3]), (anchors[0], anchors[1]), (anchors[2], anchors[3]), (anchors[1], anchors[2])]
    TN.string_lights(None, 0.7, through=pairs, strength=70, bulbs_per_m=1.8)
    lib.camera((0.3, -4.8, 1.55), (0.0, 2.0, 1.0), lens=32, fstop=3.2, focus=(0.6, 0.2, 1.0))


def tent_dusk():
    TN.frame_tent(20, 40, clear=True)
    lib.camera((-11.5, -10.5, 2.4), (0.0, 0.0, 1.6), lens=35)


def farm_dinner():
    T.build_farm()
    cb = lib.as_collection("Cross", lambda col: C.build_crossback(col=col))
    L = 8 * 0.3048
    for side in (-1, 1):
        for i in range(4):
            x = -L / 2 + 0.35 + i * (L - 0.7) / 3
            lib.instance(cb, (x, side * 0.78, 0), rot_z=0 if side < 0 else math.pi)
    T.build_runner(L, 0.0, lib.SAGE)
    pos = []
    for side in (-1, 1):
        for i in range(4):
            x = -L / 2 + 0.35 + i * (L - 0.7) / 3
            pos.append((x, side * 0.30, math.pi / 2))
    T.place_settings(pos, 30 * IN, charger_mat=lib.mat("Rattan", (0.55, 0.40, 0.22), 0.0, 0.7))
    rng = random.Random(4)
    for x in (-0.7, 0.0, 0.7):
        T.centerpiece(x, 0, 30 * IN + 0.012, [(0.98, 0.95, 0.90), (0.95, 0.85, 0.70), (0.85, 0.70, 0.55)], rng, spread=0.15, n=14)
    poles = bmesh.new()
    anchors = [(-3, -2.2, 3.0), (3, -2.2, 3.0), (3, 2.2, 3.0), (-3, 2.2, 3.0)]
    for x, y, z in anchors:
        lib.add_rod(poles, (x, y, 0), (x, y, z), 0.04)
    mesh_object("Poles", poles, lib.wood("Post", (0.4, 0.3, 0.2), (0.3, 0.2, 0.12)))
    TN.string_lights(None, 0.6, through=[(anchors[0], anchors[2]), (anchors[1], anchors[3]), (anchors[0], anchors[1]), (anchors[2], anchors[3])], strength=60)
    lib.camera((-2.6, -3.4, 1.7), (0.1, 0.0, 0.75), lens=35, fstop=3.2, focus=(-0.4, 0, 0.8))


SC = dict(aspect="16:9")
item("wedding-reception", "scenes", reception,
     "3D render of a candlelit Chicago ballroom wedding reception with ivory floor-length linens, gold Chiavari chairs, gold chargers and blush rose centerpieces",
     "Ballroom wedding reception", env="none", **SC)
item("garden-ceremony", "scenes", ceremony,
     "3D render of an outdoor wedding ceremony with rows of white folding chairs, an ivory aisle runner with rose petals and a floral hexagon arch at golden hour",
     "Garden wedding ceremony", env="lawn", lawn=dict(sun_elev=12, sun_rot=250), **SC)
item("cocktail-hour", "scenes", cocktail,
     "3D render of an outdoor cocktail hour with white spandex highboy tables, an ivory velvet lounge sofa and bistro string lights at dusk",
     "Cocktail hour under string lights", env="lawn", lawn=dict(dusk=True, sun_rot=230), **SC)
item("tent-reception-dusk", "scenes", tent_dusk,
     "3D render of a clear-top frame tent glowing at twilight with string lights, round tables and gold Chiavari chairs on a lawn",
     "Clear-top tent reception at twilight", env="lawn", lawn=dict(dusk=True, sun_rot=230), **SC)
item("farm-table-dinner", "scenes", farm_dinner,
     "3D render of a rustic farm table dinner with walnut crossback chairs, a sage runner, rattan chargers and string lights",
     "Farm table dinner with crossback chairs", env="lawn", lawn=dict(sun_elev=8, sun_rot=240), **SC)
