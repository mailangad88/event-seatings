"""Registry of every rendered rental item: category, builder, camera, alt text and caption.
Slugs match the catalog item ids used by the site."""

from functools import partial

import chairs as C
import lib

ITEMS = {}


def item(slug, cat, build, alt, caption, **kw):
    ITEMS[slug] = dict(cat=cat, build=build, alt=alt, caption=caption, **kw)


CHAIR_CAM = dict(az=-32, el=14, lens=85, pad=1.18)

# --- Chairs ---------------------------------------------------------------
item("gold-chiavari", "chairs", partial(C.build_chiavari, frame_mat=None),
     "3D render of a gold Chiavari chair with an ivory seat cushion, the classic wedding reception chair, available to rent in Chicago",
     "Gold Chiavari chair with ivory cushion", cam=CHAIR_CAM)
item("silver-chiavari", "chairs", lambda: C.build_chiavari(frame_mat=lib.silver_metal()),
     "3D render of a silver Chiavari chair with a white seat cushion for weddings and galas in the Chicago area",
     "Silver Chiavari chair with white cushion", cam=CHAIR_CAM)
item("clear-chiavari", "chairs", lambda: C.build_chiavari(frame_mat=lib.acrylic(), cushion=lib.WHITE, r=0.013),
     "3D render of a clear acrylic Chiavari chair (ice Chiavari) with a white cushion, a modern rental for Chicago weddings",
     "Clear (ice) Chiavari chair", cam=CHAIR_CAM)
item("white-chiavari", "chairs", lambda: C.build_chiavari(frame_mat=lib.plastic(lib.WHITE, 0.25), cushion=lib.IVORY),
     "3D render of a white Chiavari chair with an ivory cushion for garden weddings and ceremonies near Chicago",
     "White Chiavari chair", cam=CHAIR_CAM)
item("white-folding", "chairs", lambda: C.build_folding(),
     "3D render of a white resin folding chair, the standard ceremony and backyard party rental chair in Chicago",
     "White folding chair", cam=CHAIR_CAM)
item("white-resin-folding", "chairs", lambda: C.build_folding(padded=True),
     "3D render of a white resin folding chair with a padded white vinyl seat, a comfortable ceremony chair rental",
     "White padded resin folding chair", cam=CHAIR_CAM)
item("black-padded-folding", "chairs", lambda: C.build_folding(frame=lib.black_metal(), seat=lib.plastic(lib.BLACK, 0.4), padded=True, pad_color=lib.BLACK),
     "3D render of a black padded folding chair with a steel frame and black vinyl seat for corporate events and conferences",
     "Black padded folding chair", cam=CHAIR_CAM)
item("crossback", "chairs", C.build_crossback,
     "3D render of a walnut wood crossback chair with a woven rattan seat, a rustic farmhouse wedding rental in the Chicago area",
     "Crossback chair in walnut with rattan seat", cam=CHAIR_CAM)
item("ghost", "chairs", C.build_ghost,
     "3D render of a clear Louis ghost chair with an oval medallion back, a modern acrylic rental for Chicago events",
     "Clear Louis ghost chair", cam=CHAIR_CAM)
item("kids-chair", "chairs", lambda: C.build_kids_chair(),
     "3D render of a child-size white folding chair for kids' tables at weddings, birthdays and showers",
     "Kids' white folding chair", cam=CHAIR_CAM)
item("throne-chair", "chairs", C.build_throne,
     "3D render of a tall gold royal throne chair with ivory tufted velvet, a statement rental for bridal showers, sweet sixteens and quinceaneras",
     "Gold and ivory throne chair", cam=dict(az=-30, el=12, lens=85, pad=1.15))
item("bar-stool", "chairs", C.build_bar_stool,
     "3D render of a gold Chiavari bar stool with an ivory cushion for cocktail hours and bar seating",
     "Gold Chiavari bar stool", cam=CHAIR_CAM)
def _turned(build):
    """Build, then spin the item 180 degrees so its back faces the default front camera."""
    def run():
        sc = lib.bpy.context.scene
        before = set(sc.collection.objects)
        build()
        for ob in set(sc.collection.objects) - before:
            if ob.parent is None:
                ob.rotation_euler.z += 3.14159265
                ob.location.x, ob.location.y = -ob.location.x, -ob.location.y
    return run


item("chair-cover", "linens", _turned(C.build_chair_cover),
     "3D render of a banquet chair in a fitted ivory chair cover tied with a champagne satin sash and bow",
     "Ivory chair cover with champagne sash", cam=dict(az=-35, el=14, lens=85, pad=1.18))
item("chair-sash", "linens", _turned(lambda: C.build_chiavari(sash=lib.BLUSH)),
     "3D render of a gold Chiavari chair dressed with a blush chiffon sash tied in a bow on the chair back",
     "Blush chiffon chair sash on a gold Chiavari", cam=dict(az=-30, el=12, lens=85, pad=1.18))

for mod in ("collection_chairs", "tables", "tableware", "tents", "misc", "scenes", "heroes"):
    try:
        __import__(mod)
    except ImportError as e:
        if mod not in str(e):
            raise
