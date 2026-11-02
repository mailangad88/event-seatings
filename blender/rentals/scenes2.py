"""More 16:9 event setups, so every event type and home section gets its own image."""

import math
import random

import chairs as C
import collection_chairs as CC
import lib
import misc as M
import tables as T
import tableware as TW
import tents as TN
from catalog import item
from heroes import placed
from scenes import ballroom

IN = 0.0254
FT = 0.3048
SC = dict(aspect="16:9")


def _round_set(x, y, chair_col, cloth=None, palette=None, seed=1, settings=True):
    placed(lambda: T.dressed_round(cloth_mat=cloth, chair_col=chair_col, palette=palette, seed=seed, settings=settings), x, y)


def baby_shower():
    blush = T.linen(lib.BLUSH)
    ghost = lib.as_collection("GhostC", lambda col: C.build_ghost(col=col))
    _round_set(-1.3, 0.2, ghost, cloth=blush, palette=T.IVORY_BLUSH, seed=2)
    placed(M.flower_wall, 1.6, 2.2)
    placed(lambda: (T.build_round(15 * IN, h=30 * IN), T.round_cloth(15 * IN, 30 * IN, 30 * IN, T.linen(lib.IVORY), segs=160)), 1.6, 0.9)
    placed(TW.cake_stand, 1.6, 0.9, z=30 * IN + 0.012)
    placed(lambda: M.lounge_sofa(0.9), 3.1, 0.6, -0.6)


def backyard_birthday():
    placed(TN.canopy, -2.2, 1.0)
    placed(M.bounce_house, 4.2, 4.5, 0.3)
    placed(M.popcorn_machine, 0.8, -0.2, -0.4)
    kids = lib.as_collection("KidsC", lambda col: C.build_kids_chair(col=col))
    placed(lambda: T.build_banquet(6 * FT, h=22 * IN, top=lib.plastic(lib.WHITE, 0.4)), -2.2, 1.0)
    for i in range(3):
        for side in (-1, 1):
            lib.instance(kids, (-2.2 - 0.6 + i * 0.6, 1.0 + side * 0.55, 0), rot_z=0 if side < 0 else math.pi)


def graduation():
    TN.frame_tent(20, 20, furnish_it=False, lights=True)
    white = lib.as_collection("WhiteF", lambda col: C.build_folding(col=col))
    for y in (-1.2, 1.2):
        placed(lambda: (T.build_banquet(8 * FT), T.rect_cloth(8 * FT, 30 * IN, 30 * IN, 30 * IN, T.linen(lib.WHITE))), 0, y)
        for i in range(4):
            for side in (-1, 1):
                lib.instance(white, (-1.0 + i * 0.66, y + side * 0.62, 0), rot_z=0 if side < 0 else math.pi)
    placed(M.yard_games, 5.2, -1.5)


def corporate_gala():
    ballroom()
    silver = lib.as_collection("SilverC", lambda col: C.build_chiavari(col=col, frame_mat=lib.silver_metal()))
    navy = T.linen((0.06, 0.08, 0.18))
    for i, (x, y) in enumerate(((-2.0, 0.4), (2.0, 0.4), (0, 2.6), (-4.0, 2.8), (4.0, 2.8))):
        _round_set(x, y, silver, cloth=navy, palette=[(0.97, 0.97, 0.98), (0.85, 0.88, 0.95)], seed=i + 3, settings=i < 3)
    placed(M.stage_deck, 0, 4.6)
    lib.camera((0.4, -4.6, 1.6), (0.0, 2.0, 0.8), lens=32, fstop=3.5, focus=(-2.0, 0.4, 0.8))


def winter_tent():
    TN.frame_tent(20, 40, sidewalls=True, lights=True)
    for x, y in ((-5.0, -2.2), (5.0, -2.2)):
        placed(M.patio_heater, x, y)
    placed(M.tent_heater, -7.6, 1.5)


def dance_party():
    ballroom()
    placed(lambda: M.dance_floor(True), 0, 1.2)
    placed(M.marquee_letters, 0, 4.2)
    for x in (-3.5, -1.2, 1.2, 3.5):
        lib.bpy.ops.object.light_add(type="SPOT", location=(x, 4.4, 0.1))
        s = lib.bpy.context.object
        s.data.energy, s.data.spot_size, s.data.color = 900, math.radians(50), (0.85, 0.35, 1.0)
        s.rotation_euler = (math.radians(-15), 0, 0)
    gold = lib.as_collection("GoldD", lambda col: C.build_chiavari(col=col))
    for x in (-4.4, 4.4):
        _round_set(x, 0.2, gold, palette=T.IVORY_BLUSH, seed=5, settings=False)
    lib.camera((0.0, -5.2, 1.7), (0.0, 1.8, 0.6), lens=30, fstop=4.0, focus=(0, 1.0, 0.2))


def buffet():
    L = 8 * FT
    placed(lambda: (T.build_banquet(L), T.rect_cloth(L, 30 * IN, 30 * IN, 30 * IN, T.linen())), 0, 0)
    for x in (-0.75, 0.0, 0.75):
        placed(TW.chafing_dish, x, 0, z=30 * IN + 0.012)
    placed(lambda: (T.build_banquet(6 * FT), T.rect_cloth(6 * FT, 30 * IN, 30 * IN, 30 * IN, T.linen())), 2.9, 0.4, 0.3)
    placed(TW.beverage_dispenser, 2.5, 0.3, z=30 * IN + 0.012)
    placed(TW.coffee_urn, 3.2, 0.5, z=30 * IN + 0.012)
    placed(TW.cake_stand, -2.2, 0.5, z=30 * IN + 0.012)
    placed(lambda: (T.build_round(15 * IN, h=30 * IN), T.round_cloth(15 * IN, 30 * IN, 30 * IN, T.linen(), segs=160)), -2.2, 0.5)


def bar_setup():
    placed(TW.portable_bar, 0, 0.8)
    placed(M.champagne_wall, -2.0, 1.2, 0.25)
    for x, y in ((1.8, -0.6), (0.2, -1.4)):
        placed(T.build_spandex_highboy, x, y)
    stool = lib.as_collection("Stool", lambda col: C.build_bar_stool(col=col))
    for x in (-0.5, 0.0, 0.5):
        lib.instance(stool, (x, 0.0, 0), rot_z=0)


def kids_party():
    placed(M.soft_play, -1.8, 0.8)
    kids = lib.as_collection("KidsP", lambda col: C.build_kids_chair(col=col))
    placed(lambda: (T.build_banquet(6 * FT, h=22 * IN, top=lib.plastic(lib.WHITE, 0.4)),), 1.6, 0.2)
    for i in range(3):
        for side in (-1, 1):
            lib.instance(kids, (1.6 - 0.6 + i * 0.6, 0.2 + side * 0.55, 0), rot_z=0 if side < 0 else math.pi)
    placed(M.cotton_candy, 3.4, 1.4)


def sweetheart_stage():
    ballroom()
    placed(M.stage_deck, 0, 2.6)
    placed(M.flower_wall, 0, 3.3, z=24 * IN)
    placed(lambda: (T.rect_cloth(4 * FT, 30 * IN, 30 * IN, 30 * IN, lib.sequin(), folds=0.008),
                    T.centerpiece(0, -0.05, 30 * IN + 0.012, T.IVORY_BLUSH, random.Random(5), spread=0.3, n=40)), 0, 2.2, z=24 * IN)
    placed(C.build_throne, -0.45, 2.75, math.pi, z=24 * IN)
    placed(C.build_throne, 0.45, 2.75, math.pi, z=24 * IN)
    gold = lib.as_collection("GoldS", lambda col: C.build_chiavari(col=col))
    for x in (-2.6, 2.6):
        _round_set(x, -0.6, gold, palette=T.IVORY_BLUSH, seed=7)
    lib.camera((0.0, -4.4, 1.55), (0.0, 2.4, 1.2), lens=35, fstop=3.2, focus=(0, 2.2, 1.0))


def boho_lounge():
    placed(CC.rattan_garden, -1.2, 0.2, 0.5)
    placed(CC.rattan_garden, 1.2, 0.2, -0.5)
    placed(M.coffee_table, 0, -0.1)
    placed(M.ceremony_arch, 0, 1.6)
    placed(lambda: M.lounge_sofa(2.0), 0, 1.0)


S16 = dict(aspect="16:9")
for slug, fn, alt, cap, extra in (
    ("baby-shower", baby_shower, "3D render of a baby shower setup with blush linens, clear ghost chairs, a rose flower wall, a cake table and an ivory armchair", "Baby shower setup", dict(env="studio", studio_scale=3.0, cam=dict(az=-18, el=14, lens=40, pad=0.95))),
    ("backyard-birthday", backyard_birthday, "3D render of a backyard birthday party with a pop-up canopy over a kids' table, a castle bounce house and a popcorn machine", "Backyard birthday party", dict(env="lawn", lawn=dict(sun_elev=30, sun_rot=210), cam=dict(az=-20, el=14, lens=35, pad=0.95))),
    ("graduation-party", graduation, "3D render of a graduation party under a 20 by 20 foot frame tent with banquet tables, white folding chairs, string lights and yard games", "Graduation party tent", dict(env="lawn", lawn=dict(sun_elev=20, sun_rot=225), cam=dict(az=-30, el=14, lens=35, pad=0.95))),
    ("corporate-gala", corporate_gala, "3D render of a corporate gala with navy linens, silver Chiavari chairs, white florals and a skirted stage in a ballroom", "Corporate gala", dict(env="none")),
    ("winter-tent", winter_tent, "3D render of a winter-ready frame tent with cathedral-window sidewalls, patio heaters and a forced-air tent heater for cold-weather Chicago events", "Heated winter tent", dict(env="lawn", lawn=dict(dusk=True, sun_rot=230), cam=dict(az=-32, el=12, lens=35, pad=0.95))),
    ("dance-party", dance_party, "3D render of a reception dance floor: a starlit LED dance floor, LOVE marquee letters and purple uplighting in a ballroom", "Dance floor with LED and uplighting", dict(env="none")),
    ("buffet-setup", buffet, "3D render of a catered buffet line with chafing dishes on ivory linens, a beverage station with a lemonade dispenser and coffee urn, and a cake table", "Buffet and beverage station", dict(env="studio", studio_scale=3.0, cam=dict(az=-15, el=16, lens=40, pad=0.95))),
    ("bar-setup", bar_setup, "3D render of an event bar setup: a 6-foot portable bar with gold Chiavari bar stools, a champagne wall and spandex cocktail tables", "Bar and champagne wall", dict(env="studio", studio_scale=3.0, cam=dict(az=-15, el=12, lens=40, pad=0.95))),
    ("kids-party", kids_party, "3D render of a toddler party with a neutral soft play set, a kids' table with child-size chairs and a cotton candy cart", "Kids' party setup", dict(env="studio", studio_scale=3.0, cam=dict(az=-15, el=18, lens=40, pad=0.95))),
    ("sweetheart-stage", sweetheart_stage, "3D render of a sweetheart stage with two gold throne chairs, a gold sequin table and a rose flower wall, flanked by guest tables, for weddings, quinceaneras and sangeets", "Sweetheart stage with throne chairs", dict(env="none")),
    ("boho-lounge", boho_lounge, "3D render of a boho lounge with rattan chairs, an ivory velvet sofa, a gold coffee table and a floral hexagon arch", "Boho lounge vignette", dict(env="studio", studio_scale=3.0, cam=dict(az=-15, el=12, lens=40, pad=0.95))),
):
    item(slug, "scenes", fn, alt, cap, **S16, **extra)
