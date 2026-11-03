"""Download the real-world lighting and textures the photoreal renders use.

Every asset here is CC0 (public domain) from Poly Haven (polyhaven.com) or ambientCG (ambientcg.com).
Those sites are blocked from some build sandboxes, so we pull byte-identical copies that open-source
projects commit to GitHub (found with GitHub code search on the original file names). The licence follows
the asset, not the mirror: CC0 means no attribution is required, but we list the source anyway.

    python blender/rentals/assets.py          # downloads into out/assets/ (git-ignored)

HDRIs are photographs of real rooms and skies taken with bracketed exposures. Lighting a scene with one
gives real-world light, colour and reflections, which is the single biggest step from "3D render" to
"photo". The textures are photo-scanned surfaces (oak planks, painted plaster, lawn).
"""

import os
import sys
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DEST = os.path.join(ROOT, "out", "assets")
M = "https://media.githubusercontent.com/media"
R = "https://raw.githubusercontent.com"

# name -> (url, original source page)
ASSETS = {
    # HDRIs (Poly Haven, CC0)
    "studio_small_08_1k.hdr": (f"{M}/meekmachine/loomlarge-example/HEAD/public/skyboxes/studio_small_08_1k.hdr", "https://polyhaven.com/a/studio_small_08"),
    "studio_small_09_1k.hdr": (f"{M}/WonderlandEngine/wonderland-engine-examples/HEAD/material-physical/studio_small_09_1k.hdr", "https://polyhaven.com/a/studio_small_09"),
    "brown_photostudio_02_1k.hdr": (f"{M}/matttidridge/armodelviewer-web/HEAD/public/assets/brown_photostudio_02_1k.hdr", "https://polyhaven.com/a/brown_photostudio_02"),
    "photo_studio_01_1k.hdr": (f"{M}/alinsavix/blender-fbxregroup/HEAD/hdris/photo_studio_01_1k.hdr", "https://polyhaven.com/a/photo_studio_01"),
    "lebombo_1k.hdr": (f"{M}/eclipse-oniro-mirrors/graphic_graphic_3d/HEAD/lume/LumeEngine/test/unittest/assets/test_data/image/lebombo_1k.hdr", "https://polyhaven.com/a/lebombo"),
    "decor_shop_1k.hdr": (f"{R}/ezEngine/store-sample/HEAD/PolyHaven-Textures/decor_shop_1k.hdr", "https://polyhaven.com/a/decor_shop"),
    "noon_grass_2k.hdr": (f"{M}/sergcpp/DummyEngine/HEAD/assets/textures/env/noon_grass_2k.hdr", "https://polyhaven.com/a/noon_grass"),
    "green_point_park_2k.hdr": (f"{M}/alinsavix/blender-fbxregroup/HEAD/hdris/green_point_park_2k.hdr", "https://polyhaven.com/a/green_point_park"),
    "rosendal_park_sunset_2k.hdr": (f"{M}/assetfs/polyhaven-hdri/HEAD/rosendal_park_sunset_2k.hdr", "https://polyhaven.com/a/rosendal_park_sunset"),
    # Oak plank floor (ambientCG WoodFloor041, CC0)
    "WoodFloor041_Color.jpg": (f"{M}/achrefelouafi/ProceduralBuildingsThreeJS/HEAD/blender/textures/WoodFloor041/WoodFloor041_1K-JPG_Color.jpg", "https://ambientcg.com/view?id=WoodFloor041"),
    "WoodFloor041_Roughness.jpg": (f"{M}/achrefelouafi/ProceduralBuildingsThreeJS/HEAD/blender/textures/WoodFloor041/WoodFloor041_1K-JPG_Roughness.jpg", "https://ambientcg.com/view?id=WoodFloor041"),
    "WoodFloor041_NormalGL.jpg": (f"{M}/achrefelouafi/ProceduralBuildingsThreeJS/HEAD/blender/textures/WoodFloor041/WoodFloor041_1K-JPG_NormalGL.jpg", "https://ambientcg.com/view?id=WoodFloor041"),
    # Herringbone parquet (Poly Haven, CC0)
    "herringbone_parquet_diff_1k.jpg": (f"{M}/i-machine-think/grasp/HEAD/GRASP/Assets/Resources/Textures/Parquet/herringbone_parquet_diff_1k.jpg", "https://polyhaven.com/a/herringbone_parquet"),
    # Light oak veneer for tabletops (Poly Haven, CC0)
    "oak_veneer_01_diff_1k.jpg": (f"{M}/alhnesn/2025bootcamp-g40/HEAD/Assets/Materials/Oak%20Veneer/oak_veneer_01_diff_1k.jpg", "https://polyhaven.com/a/oak_veneer_01"),
    # Painted plaster wall (Poly Haven, CC0)
    "painted_plaster_wall_diff_1k.jpg": (f"{R}/ezEngine/store-sample/HEAD/PolyHaven-Textures/painted_plaster_wall_1k/painted_plaster_wall_diff_1k.jpg", "https://polyhaven.com/a/painted_plaster_wall"),
    "painted_plaster_wall_arm_1k.jpg": (f"{R}/ezEngine/store-sample/HEAD/PolyHaven-Textures/painted_plaster_wall_1k/painted_plaster_wall_arm_1k.jpg", "https://polyhaven.com/a/painted_plaster_wall"),
    "painted_plaster_wall_nor_dx_1k.jpg": (f"{R}/ezEngine/store-sample/HEAD/PolyHaven-Textures/painted_plaster_wall_1k/painted_plaster_wall_nor_dx_1k.jpg", "https://polyhaven.com/a/painted_plaster_wall"),
    # Lawn (ambientCG Grass004, CC0)
    "Grass004_Color.jpg": (f"{M}/king-numsgil/project-encke-cpp/HEAD/assets/textures/Grass004/Grass004_1K-JPG_Color.jpg", "https://ambientcg.com/view?id=Grass004"),
    "Grass004_NormalGL.jpg": (f"{M}/king-numsgil/project-encke-cpp/HEAD/assets/textures/Grass004/Grass004_1K-JPG_NormalGL.jpg", "https://ambientcg.com/view?id=Grass004"),
    "Grass004_Roughness.jpg": (f"{M}/king-numsgil/project-encke-cpp/HEAD/assets/textures/Grass004/Grass004_1K-JPG_Roughness.jpg", "https://ambientcg.com/view?id=Grass004"),
}


def path(name):
    """Local path of an asset, or None if it hasn't been downloaded (renders then fall back to procedural)."""
    p = os.path.join(DEST, name)
    return p if os.path.exists(p) else None


def fetch(force=False):
    os.makedirs(DEST, exist_ok=True)
    for name, (url, _src) in ASSETS.items():
        p = os.path.join(DEST, name)
        if os.path.exists(p) and not force:
            continue
        data = b""
        # Git LFS files only download from media.githubusercontent.com; plain files only from raw.
        for u in (url, url.replace(M, R)) if url.startswith(M) else (url, url.replace(R, M)):
            try:
                data = urllib.request.urlopen(u, timeout=120).read()
            except OSError:
                continue
            if len(data) > 20000 and not data.startswith(b"version https://git-lfs"):
                break
        if len(data) < 20000 or data.startswith(b"version https://git-lfs"):
            print(f"!! {name}: got {len(data)} bytes, skipped", file=sys.stderr)
            continue
        with open(p, "wb") as f:
            f.write(data)
        print(f"{name}  {len(data) // 1024} KB")


if __name__ == "__main__":
    fetch("--force" in sys.argv)
