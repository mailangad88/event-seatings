#!/usr/bin/env python3
"""Builds src/data/catalog-inventory.json from vendor price-list extracts.

Input: docs/vendor-data/full-<vendorId>.json, one per vendor, each with
  {vendorId, sources, notes, items: [{section, name, specs, unit, vendorPrice, sourceUrl}]}
Output: every priced row as a catalog item with a customer-facing id (no vendor name),
a catalog category, and the raw vendor price (the site adds 10%).

Rows that duplicate a curated product's offer (src/data/catalog.ts) are skipped, and
packages, fees, installation and supplies are excluded.

Run: python3 scripts/build-inventory.py
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "vendor-data"
OUT = ROOT / "src" / "data" / "catalog-inventory.json"
CATALOG = (ROOT / "src" / "data" / "catalog.ts").read_text()
PRODUCTS = (ROOT / "src" / "data" / "catalog-products.ts").read_text()
VENDORS = (ROOT / "src" / "data" / "vendors.ts").read_text()

SKIP = re.compile(
    r"\b(package|installation|install|delivery|fee|deposit|damage waiver|supplies only|labor|setup charge|gift card|sale|insurance)\b",
    re.I,
)

# 1. Name patterns that win over the vendor's section (cross-cutting categories).
OVERRIDES = [
    ("decor", r"^screens?, .*wood|^easel"),
    ("restrooms-power", r"restroom|toilet|porta.?(potty|john)|hand ?wash|wash station|generator|extension cord|cable (protector|ramp)|gallon of gas|power (strip|distro|cord)"),
    ("fencing-crowd-control", r"stanchion|barricade|bike rack|fenc|crowd control|red carpet|black carpet|carpet runner|^carpet|velvet rope|velour rope"),
    ("photo-booths", r"photo ?booth|selfie|magic mirror|mirror booth|360 (photo|booth|video)|polaroid|guest ?book"),
    ("concessions", r"popcorn|cotton candy|sno.?cone|snow ?cone|shaved ice|nacho|hot ?dog|pretzel|slush|frozen drink|chocolate fountain|funnel cake|candy|ice cream|boba|charcuterie cart|concession"),
    ("heating-cooling", r"heater|heat lamp|patio heat|\bfans?\b|misting|air condition"),
    ("lighting", r"\blights?\b|lighting|uplight|chandelier|lantern|candelabra|gobo|cold spark|pipe (and|&) drape|ceiling drape"),
    ("lounge", r"sofa|loveseat|settee|ottoman|\bcube\b|lounge|chesterfield|daybed|coffee table|end table|side table"),
]

# 2. The vendor's own section heading.
SECTION_MAP = [
    ("decor", r"tabletop|coat"),
    ("catering-equipment", r"bar acc|busing|punch|champagne|coffee|sugar|grill|serving|buffet|chaf|kitchen|tray|melamine|bowls \("),
    ("chairs", r"chair|seating"),
    ("linens", r"linen|napkin|tablecloth"),
    # "inflatable" contains "table", so inflatables and table games are matched before tables.
    ("games-kids", r"inflat|table games"),
    ("tables", r"\btables?\b"),
    ("dinnerware", r"china|dinnerware|plate|dish"),
    ("flatware", r"flatware|silverware|cutlery"),
    ("glassware", r"glass"),
    ("tents", r"tent|canop"),
    ("dance-floors-staging", r"dance|stag"),
    ("av-sound", r"audio|visual|\bav\b|sound"),
    ("lighting", r"light|drap"),
    ("heating-cooling", r"heat|climate"),
    ("lounge", r"lounge|furniture"),
    ("photo-booths", r"photo"),
    ("games-kids", r"game|inflat|kid|bounce|amuse|slide|jumper|combo|dunk|interactive|experience|carnival|attraction|toddler|obstacle|soft play|laser|nerf|mechanical|rock wall|golf|foam"),
    ("concessions", r"concession"),
    ("decor", r"decor|backdrop|arch|accessor|neon|wedding"),
    ("catering-equipment", r"food|catering|serv|beverage|coffee|\bbar|buffet|chaf|equipment|melamine|platter|tray|stand|pedestal|carrier|propane|busing"),
]

# Serving utensils listed under flatware/dinnerware belong with catering equipment.
SERVING = r"ladle|tongs?\b|scoop|spatula|whisk|pie server|cake (knife|server)|salad server|slotted|long handle|gravy spoon|platter|serving|tray|basket|crock|caddy|carafe|pitcher|shaker|tea ?pot|coffee maker|cream (and|&) sugar|plate holder|\b\d{1,2} ?(qt|quart|gal)"

# 3. Keyword fallback when the section is generic.
RULES = [
    ("av-sound", r"micro?phone|\bmic\b|speakers?\b|karaoke|projector|projection|screen|\bpa system|mixer|podium|lectern|\btv\b|bull ?horn"),
    ("dance-floors-staging", r"dance ?floor|stage|riser"),
    ("tents", r"\btent|canopy|sidewall"),
    ("games-kids", r"fog machine|bubble machine|foam machine|air dancer|face paint|basketball|striker|bounce|inflatable|moon ?walk|bouncer|obstacle|game|toss|tug of war|limbo|dunk|bingo|jenga|cornhole|soft play|ball pit|laser tag|foam party|kids?'? party"),
    ("linens", r"linen|napkin|table ?cloth|runner|overlay|sash|chair (cover|tie)|skirt|spandex"),
    ("chairs", r"chair|stool|chiavari|throne|bench"),
    ("tables", r"\btables?\b|highboy|serpentine"),
    ("dinnerware", r"plate|charger|bowl|\bcups?\b|saucer|mug"),
    ("flatware", r"\bforks?\b|\bknife|knives|\bspoons?\b|flatware"),
    ("glassware", r"glass|goblet|flute|tumbler|snifter"),
    ("decor", r"chalkboard|dry erase|screens?, .*wood|easel|arch|backdrop|wall|neon|marquee|letter|vase|candle|centerpiece|easel|sign|barrel|chuppah|mandap|column|aisle|confetti|balloon|garland|flower|greenery|mirror|scissors"),
    ("catering-equipment", r"chaf|urn|coffee|dispenser|cambro|tray|\bbar\b|grill|griddle|burner|stove|warmer|hot ?box|cooler|trough|ice|cart|stand|pan\b|pot\b|blender|cake|trash can|bucket"),
]


def classify(name: str, specs: str, section: str):
    text = f"{name} {specs}".lower()
    sec = section.lower()
    for cat, pat in OVERRIDES:
        if re.search(pat, text):
            if cat == "lounge" and re.search(r"bowl|tray|plate|platter|ice|riser|polycarb|\d+ ?oz", text):
                continue
            if cat == "concessions" and re.search(r"backdrop|neon|\bwall\b|letter|bounce|inflat|slide|playland", text):
                continue
            return cat
    # Mixed vendor sections ("Tables and Chairs", "Tents, Tables & Chairs") say nothing about the
    # item, so those items are classified by name.
    mixed = re.search(r"tables? (and|&) chairs?|tents?, tables", sec)
    for cat, pat in [] if mixed else SECTION_MAP:
        if re.search(pat, sec):
            if cat in ("flatware", "dinnerware", "glassware") and re.search(SERVING, text):
                return "catering-equipment"
            return cat
    for cat, pat in RULES:
        if re.search(pat, text):
            return cat
    return None


def slug(s: str) -> str:
    s = s.lower().replace("&", " and ").replace('"', " in ").replace("”", " in ").replace("'", " ft ").replace("’", " ft ")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    s = re.sub(r"-+", "-", s)
    return s[:70].strip("-")


def clean(s: str) -> str:
    s = re.sub(r"\s+", " ", (s or "").strip())
    return s.replace("Burgandy", "Burgundy").replace("Bananna", "Banana").replace("Sherbert", "Sherbet")


def unit_of(u: str) -> str:
    u = (u or "each").strip().lower()
    u = re.sub(r"^/\s*", "", u)
    if u in ("", "ea", "each", "per item", "item", "per event", "per day", "day", "1 day", "per rental"):
        return "each"
    if re.match(r"per (linear )?(ft|foot)|ft$|/ft", u):
        return "per ft"
    if "sq" in u:
        return "per sq ft"
    return u


# Existing curated offers: (vendorId, vendorItem) and (vendorId, price, category) to skip duplicates.
curated_pairs = set(re.findall(r'o\("([a-z0-9-]+)",\s*([0-9.]+),\s*"((?:[^"\\]|\\.)*)"', CATALOG))
curated_by_vendor_price = {(v, float(p)) for v, p, _ in curated_pairs}
curated_names = {(v, re.sub(r"[^a-z0-9]", "", n.lower().replace('\\"', ""))) for v, _, n in curated_pairs}
curated_ids = set(re.findall(r'P\("([a-z0-9-]+)"', PRODUCTS))
known_vendors = set(re.findall(r'id: "([a-z0-9-]+)"', VENDORS))


def tokens(s):
    return {t for t in re.findall(r"[a-z0-9]+", s.lower()) if len(t) > 1}


def is_curated_dup(vendor, name, price):
    """Same vendor, same price, and one name contains the other (ignoring punctuation)."""
    n = re.sub(r"[^a-z0-9]", "", name.lower())
    if (vendor, n) in curated_names:
        return True
    for v, p, cn in curated_pairs:
        if v != vendor or float(p) != price:
            continue
        c = re.sub(r"[^a-z0-9]", "", cn.lower().replace('\\"', ""))
        if n in c or c in n:
            return True
    return False


def main():
    rows, report = [], {}
    seen_ids = set(curated_ids)
    for f in sorted(SRC.glob("full-*.json")):
        d = json.loads(f.read_text())
        vendor = d["vendorId"]
        if vendor not in known_vendors:
            print(f"! {f.name}: vendor {vendor} not in vendors.ts, skipped", file=sys.stderr)
            continue
        stats = report.setdefault(vendor, {"kept": 0, "duplicate": 0, "excluded": 0, "unclassified": []})
        prev_name = ""
        for it in d["items"]:
            name, specs, section = clean(it.get("name")), clean(it.get("specs")), clean(it.get("section"))
            price = it.get("vendorPrice")
            if not name or not isinstance(price, (int, float)) or price <= 0:
                stats["excluded"] += 1
                continue
            if name.lower().startswith("w/ "):  # continuation line on some price lists
                name = f"{prev_name} {name}"
            prev_name = name
            if SKIP.search(f"{name} {section}") or section.lower() in ("supplies", "packages"):
                stats["excluded"] += 1
                continue
            if is_curated_dup(vendor, name, float(price)):
                stats["duplicate"] += 1
                continue
            cat = classify(name, specs, section)
            if not cat:
                stats["unclassified"].append(f"{section} | {name}")
                continue
            base = slug(name if not specs or len(name) > 40 else f"{name} {specs[:30]}") or slug(name)
            iid, n = base, 2
            while iid in seen_ids:
                iid, n = f"{base}-{n}", n + 1
            seen_ids.add(iid)
            rows.append(
                {
                    "id": iid,
                    "categoryId": cat,
                    "name": name[0].upper() + name[1:],
                    "specs": specs,
                    "unit": unit_of(it.get("unit")),
                    "section": section or cat,
                    "vendorId": vendor,
                    "vendorPrice": round(float(price), 2),
                    "vendorItem": name,
                    "sourceUrl": it.get("sourceUrl") or (d.get("sources") or [""])[0],
                    "checkedAt": d.get("checkedAt") or date.today().isoformat(),
                }
            )
            stats["kept"] += 1
    OUT.write_text(json.dumps({"generatedAt": date.today().isoformat(), "items": rows}, indent=1, ensure_ascii=False) + "\n")
    for v, s in report.items():
        print(f"{v}: kept {s['kept']}, duplicate of curated {s['duplicate']}, excluded {s['excluded']}, unclassified {len(s['unclassified'])}")
        for u in s["unclassified"][:40]:
            print("   ?", u)
    print(f"total {len(rows)} inventory items -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
