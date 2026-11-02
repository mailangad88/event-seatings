"""16:9 topic heroes: line-ups of related rentals in one studio, plus a corporate setup and an overhead floor plan."""

import math

import bmesh

import chairs as C
import collection_chairs as CC
import lib
import misc as M
import tables as T
import tableware as TW
from catalog import item
from lib import add_box, mesh_object

IN = 0.0254


def placed(build, x, y=0.0, rot=0.0, z=0.0):
    """Run a builder, then move only the top-level objects it created (not hidden instance sources)."""
    sc = lib.bpy.context.scene
    before = set(sc.collection.objects)
    build()
    for ob in set(sc.collection.objects) - before:
        if ob.parent is None:
            ob.location = (ob.location.x + x, ob.location.y + y, ob.location.z + z)
            if rot:
                ob.rotation_euler = (ob.rotation_euler.x, ob.rotation_euler.y, ob.rotation_euler.z + rot)
                # rotate position around the placement point too
                dx, dy = ob.location.x - x, ob.location.y - y
                c, s = math.cos(rot), math.sin(rot)
                ob.location = (x + c * dx - s * dy, y + s * dx + c * dy, ob.location.z)


def lineup(builders, spacing, cam=None):
    n = len(builders)
    for i, b in enumerate(builders):
        x = (i - (n - 1) / 2) * spacing
        if isinstance(b, tuple):
            b, dy, rot = b
        else:
            dy, rot = 0.0, 0.0
        placed(b, x, dy, rot)


HERO = dict(aspect="16:9")
WIDE = dict(az=-18, el=12, lens=50, pad=1.02)


BIG = {"hero-tables", "hero-linens", "hero-dance-decor", "hero-corporate", "hero-layouts", "hero-lounge", "hero-parties", "hero-celebrations"}


def hero(slug, alt, caption, fn, cam=WIDE, **kw):
    if slug in BIG:
        kw.setdefault("studio_scale", 3.0)
    item(slug, "scenes", fn, alt, caption, cam=cam, **{**HERO, **kw})


hero("hero-chairs",
     "3D render of five rental chairs side by side: gold Chiavari, walnut crossback, clear ghost, emerald velvet and white folding",
     "Chair styles for Chicago events",
     lambda: lineup([C.build_chiavari, C.build_crossback, C.build_ghost, CC.velvet_dining, C.build_folding], 0.62))
hero("hero-tables",
     "3D render of a 60-inch round table, a 6-foot banquet table and a cocktail highboy, the three most rented event tables",
     "Round, banquet and cocktail tables",
     lambda: lineup([lambda: T.build_round(30 * IN), lambda: T.build_banquet(6 * 0.3048), T.build_highboy], 2.2), cam=dict(az=-20, el=20, lens=50, pad=1.0))
hero("hero-linens",
     "3D render of an ivory floor-length round tablecloth, a gold sequin round tablecloth and a white spandex highboy cover",
     "Tablecloths, sequin overlays and spandex covers",
     lambda: lineup([lambda: (T.build_round(30 * IN), T.round_cloth(30 * IN, 30 * IN, 30 * IN, T.linen())),
                     lambda: (T.build_round(30 * IN), T.round_cloth(30 * IN, 30 * IN, 30 * IN, lib.sequin(), seed=7)),
                     T.build_spandex_highboy], 2.1), cam=dict(az=-15, el=14, lens=50, pad=1.0))


def _place_setting():
    TW.charger()
    TW.plate(0.135).location = (0, 0, 0.013)
    TW.plate(0.105, rim=0.016).location = (0, 0, 0.03)
    for kind, x in (("salad-fork", -0.215), ("dinner-fork", -0.185), ("dinner-knife", 0.185), ("teaspoon", 0.215)):
        TW.utensil(kind, 0, None, math.pi / 2).location = (x, 0, 0)
    for k, (x, y) in (("water-goblet", (0.20, 0.20)), ("wine-glass", (0.27, 0.14)), ("champagne-flute", (0.13, 0.25))):
        TW.stemware(TW.GLASSES[k], k).location = (x, y, 0)
    TW.plate(0.08, rim=0.012, well=0.008).location = (-0.2, 0.2, 0)


def _linen_board():
    bm = bmesh.new()
    add_box(bm, (0, 0, 0.01), (1.6, 0.9, 0.02))
    mesh_object("TableLinen", bm, T.linen())


hero("hero-dinnerware",
     "3D render of a complete wedding place setting: gold beaded charger, white china dinner and salad plates, stainless flatware and crystal stemware on ivory linen",
     "A full place setting, ready to rent",
     lambda: (_linen_board(), placed(_place_setting, 0, 0, z=0.02)), cam=dict(az=-8, el=40, lens=70, pad=0.85))
hero("hero-glassware",
     "3D render of six rental glasses in a row: water goblet, wine glass, champagne flute, rocks, highball and pilsner glasses",
     "Glassware for bars and dinners",
     lambda: lineup([(lambda k=k: TW.glass_shot(k)) for k in ("water-goblet", "wine-glass", "champagne-flute", "rocks-glass", "highball-glass", "pilsner-glass")], 0.13),
     cam=dict(az=-10, el=10, lens=85, pad=1.0))
hero("hero-catering",
     "3D render of catering rentals: a roll-top chafing dish, a glass lemonade dispenser, a coffee urn and a gold cake stand",
     "Catering and buffet equipment",
     lambda: lineup([TW.chafing_dish, TW.beverage_dispenser, TW.coffee_urn, TW.cake_stand], 0.62), cam=dict(az=-15, el=14, lens=70, pad=1.0))
hero("hero-lounge",
     "3D render of an event lounge vignette: ivory velvet sofa, matching armchair and gold glass coffee table",
     "Lounge furniture for cocktail hour",
     lambda: (placed(lambda: M.lounge_sofa(2.0), 0, 0.9), placed(lambda: M.lounge_sofa(0.9), 1.7, -0.2, math.radians(-60)),
              placed(M.coffee_table, 0, -0.2)), cam=dict(az=-22, el=16, lens=50, pad=0.95))
hero("hero-dance-decor",
     "3D render of a black and white dance floor with light-up LOVE marquee letters and a floral hexagon ceremony arch",
     "Dance floors and decor",
     lambda: (placed(lambda: M.dance_floor(False), 0, 0), placed(M.marquee_letters, 0, 3.2), placed(M.ceremony_arch, -3.6, 2.2)),
     cam=dict(az=-14, el=20, lens=40, pad=0.9))
hero("hero-parties",
     "3D render of party rentals: a red popcorn machine, a pink cotton candy cart, a neon sign and giant tumble tower blocks",
     "Party and kids' rentals",
     lambda: lineup([M.popcorn_machine, M.cotton_candy, M.neon_sign, M.yard_games], 1.2), cam=dict(az=-12, el=12, lens=50, pad=1.0))
hero("hero-celebrations",
     "3D render of a gold and ivory throne chair pair in front of a blush and ivory rose flower wall for quinceaneras, sweet sixteens and showers",
     "Throne chairs and flower walls for celebrations",
     lambda: (placed(M.flower_wall, 0, 0.8), placed(C.build_throne, -0.45, 0, 0.12), placed(C.build_throne, 0.45, 0, -0.12)),
     cam=dict(az=-6, el=8, lens=50, pad=0.95))


def corporate():
    placed(M.stage_deck, 0, 4.0)
    black = lib.as_collection("BlackChair", lambda col: C.build_folding(col=col, frame=lib.black_metal(), seat=lib.plastic(lib.BLACK, 0.4), padded=True, pad_color=lib.BLACK))
    for row in range(6):
        for k in range(6):
            for side in (-1, 1):
                lib.instance(black, (side * (0.9 + k * 0.52), row * 0.95 - 3.4, 0), rot_z=math.pi)
    for x in (-5.5, 5.5):
        placed(T.build_spandex_highboy, x, 1.5)
    placed(M.pipe_and_drape, 0, 5.6)
    lib.camera((5.2, -7.2, 2.6), (0.0, 1.5, 0.8), lens=32, fstop=5.6, focus=(1, -1, 0.6))


hero("hero-corporate",
     "3D render of a corporate event setup with rows of black padded chairs facing a skirted stage, ivory pipe and drape and cocktail highboys",
     "Corporate and conference seating", corporate)


def overhead():
    gold = lib.as_collection("GoldChair", lambda col: C.build_chiavari(col=col))
    for i, (x, y) in enumerate([(-3.4, -1.8), (0, -1.8), (3.4, -1.8), (-3.4, 1.8), (3.4, 1.8)]):
        placed(lambda: T.dressed_round(chair_col=gold, palette=T.IVORY_BLUSH, seed=i + 1), x, y)
    placed(lambda: M.dance_floor(False), 0, 2.2)
    lib.camera((0.0, -0.8, 13.0), (0.0, 0.2, 0.0), lens=28)


hero("hero-layouts",
     "Overhead 3D render of a reception floor plan: five 60-inch round tables with gold Chiavari chairs around a 16 by 16 foot dance floor",
     "Reception floor plan from above", overhead)
