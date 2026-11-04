import type { CategoryId } from "./catalog-products";
import { rentalImage, type RentalImage } from "./rental-images";

// Catalog rows that have no product photo of their own borrow the studio photo of the featured item they
// match (same category, matched by name), shown with an "Example" label. A studio photo of the same kind of
// piece shows the item far better than an event stock photo. Most specific patterns first.
const rules: [CategoryId, RegExp, string][] = [
  // Chairs
  ["chairs", /(chiavari|chivari).*(bar|counter) ?stool|(bar|counter) ?stool.*(chiavari|chivari)/, "bar-stool"],
  ["chairs", /(gold|champagne).*(chiavari|chivari)|(chiavari|chivari).*(gold|champagne)/, "gold-chiavari"],
  ["chairs", /silver.*(chiavari|chivari)|(chiavari|chivari).*silver/, "silver-chiavari"],
  ["chairs", /\\b(clear|crystal|ice)\\b.*(chiavari|chivari)|(chiavari|chivari).*\\b(clear|crystal|ice)\\b/, "clear-chiavari"],
  ["chairs", /white.*(chiavari|chivari)|(chiavari|chivari).*white/, "white-chiavari"],
  ["chairs", /(chiavari|chivari)/, "gold-chiavari"],
  ["chairs", /ghost|louis.*(clear|acrylic)/, "ghost"],
  ["chairs", /cross ?back|vineyard/, "crossback"],
  ["chairs", /bentwood|bistro chair/, "bentwood"],
  ["chairs", /louis|medallion|king louis/, "louis-medallion"],
  ["chairs", /rattan|wicker/, "rattan-garden"],
  ["chairs", /wishbone/, "wishbone"],
  ["chairs", /velvet/, "velvet-dining"],
  ["chairs", /cane/, "cane-back"],
  ["chairs", /windsor|spindle/, "windsor"],
  ["chairs", /throne|\\bking chair|\\bqueen chair/, "throne-chair"],
  ["chairs", /kid|child|youth|toddler/, "kids-chair"],
  ["chairs", /(bar|counter) ?stool|barstool/, "bar-stool"],
  ["chairs", /black.*(padded|folding)|padded.*black/, "black-padded-folding"],
  ["chairs", /padded|resin|garden|samsonite.*white|white.*samsonite/, "white-resin-folding"],
  ["chairs", /teak|wood(en)? folding|natural folding/, "garden-folding"],
  ["chairs", /folding/, "white-folding"],
  // Tables
  ["tables", /(highboy|hi ?boy|high boy|cocktail.*(42|4[0-6]"|bar height)|bistro.*high)/, "cocktail-highboy"],
  ["tables", /(lowboy|low boy|cocktail.*(30|29)"|cocktail table)/, "cocktail-lowboy"],
  ["tables", /farm|harvest|rustic|reclaimed|wood(en)? (banquet|table)|walnut/, "farm-table"],
  ["tables", /kid|child/, "kids-table"],
  ["tables", /\b(36|42|48)"? ?(inch|in\.?)?\s*round|round.*\b(36|42|48)\b/, "round-48"],
  ["tables", /\b(54|60|66)"? ?(inch|in\.?)?\s*round|round.*\b(54|60|66)\b/, "round-60"],
  ["tables", /\b(72|84|96)"? ?(inch|in\.?)?\s*round|round.*\b(72|84|96)\b/, "round-72"],
  ["tables", /\b(4|5|6)\s*('|ft|foot)|\b(48|60|72)\s*"?\s*x\s*(18|24|30)/, "banquet-6ft"],
  ["tables", /\b8\s*('|ft|foot)|\b96\s*"?\s*x\s*(18|24|30)|banquet|rectangular|serpentine/, "banquet-8ft"],
  ["tables", /round/, "round-60"],
  // Linens
  ["linens", /sequin/, "sequin-overlay"],
  ["linens", /spandex|stretch/, "spandex-highboy"],
  ["linens", /runner/, "table-runner"],
  ["linens", /napkin/, "cloth-napkins"],
  ["linens", /sash|bow\b/, "chair-sash"],
  ["linens", /chair cover|cover.*chair/, "chair-cover"],
  ["linens", /\b(108|120|132)\b.*round|round.*\b(108|120|132)\b/, "round-floor-length"],
  ["linens", /\b(85|90|96)\b.*round|round.*\b(85|90|96)\b/, "round-lap-length"],
  ["linens", /90\s*"?\s*x\s*(132|156)|floor.?length.*(banquet|rect)/, "banquet-floor-length"],
  ["linens", /(54|60|72|90)\s*"?\s*x\s*(54|60|72|90|108|120)|rectang|banquet/, "banquet-lap-length"],
  ["linens", /round|tablecloth/, "round-floor-length"],
  // Dinnerware
  ["dinnerware", /charger/, "charger-plate"],
  ["dinnerware", /cup|saucer|mug/, "coffee-cup-saucer"],
  ["dinnerware", /bowl/, "soup-bowl"],
  ["dinnerware", /bread|butter|\b6"|\b6 ?(inch|in)/, "bread-plate"],
  ["dinnerware", /salad|dessert|\b(7|7\.5|8|8\.5)"|\b(7|8) ?(inch|in)/, "salad-plate"],
  ["dinnerware", /plate|dinner/, "dinner-plate"],
  // Flatware
  ["flatware", /gold/, "gold-flatware"],
  ["flatware", /salad fork|dessert fork|cake fork|cocktail fork/, "salad-fork"],
  ["flatware", /fork/, "dinner-fork"],
  ["flatware", /knife|knives/, "dinner-knife"],
  ["flatware", /spoon/, "teaspoon"],
  // Glassware
  ["glassware", /champagne|flute/, "champagne-flute"],
  ["glassware", /pilsner|beer|pint/, "pilsner-glass"],
  ["glassware", /highball|collins|tumbler|water glass/, "highball-glass"],
  ["glassware", /rocks|old fashion|whiskey|lowball/, "rocks-glass"],
  ["glassware", /wine/, "wine-glass"],
  ["glassware", /goblet|water/, "water-goblet"],
  // Catering
  ["catering-equipment", /chafing|chafer/, "chafing-dish"],
  ["catering-equipment", /coffee (urn|maker|server)|\\burns?\\b|percolator/, "coffee-urn"],
  ["catering-equipment", /cake stand/, "cake-stand"],
  ["catering-equipment", /champagne wall/, "champagne-wall"],
  ["catering-equipment", /^(?!.*stool).*(portable|mobile|rolling) bar\b/, "portable-bar"],
  ["catering-equipment", /\\b(serving |oval |round )?(trays?|platters?)\\b/, "serving-tray"],
  // Tents
  ["tents", /sidewall|side wall|window wall/, "tent-sidewall"],
  ["tents", /sailcloth/, "sailcloth-tent"],
  ["tents", /clear/, "clear-top-tent"],
  ["tents", /pole/, "pole-tent-40x60"],
  ["tents", /canopy|pop.?up|10\s*'?\s*x\s*10/, "canopy-10x10"],
  ["tents", /\b(20|15)\s*'?\s*x\s*(20|15|10)\b/, "frame-tent-20x20"],
  ["tents", /\b20\s*'?\s*x\s*(30|40)\b/, "frame-tent-20x40"],
  ["tents", /\b(30|40)\s*'?\s*x\s*\d+/, "frame-tent-30x60"],
  ["tents", /frame tent|\btent\b/, "frame-tent-20x40"],
  // Floors, lighting, heating, lounge, decor
  ["dance-floors-staging", /led|light.?up/, "led-dance-floor"],
  ["dance-floors-staging", /stage|riser|platform/, "stage-deck"],
  ["dance-floors-staging", /dance ?floor/, "dance-floor"],
  ["lighting", /chandelier/, "chandelier"],
  ["lighting", /string|bistro|market|caf[eé]|edison/, "string-lights"],
  ["lighting", /drape|pipe/, "pipe-and-drape"],
  ["heating-cooling", /patio heater|propane heater|mushroom/, "patio-heater"],
  ["lounge", /^(?!.*throne).*(sofa|couch|loveseat)/, "lounge-sofa"],
  ["lounge", /armchair|club chair|lounge chair/, "lounge-armchair"],
  ["lounge", /coffee table/, "coffee-table"],
  ["decor", /marquee|light.?up letter/, "marquee-letters"],
  ["decor", /neon/, "neon-sign"],
  ["decor", /flower wall|floral wall|rose wall/, "flower-wall"],
  ["decor", /\barch|arbor/, "ceremony-arch"],
  ["decor", /candle|votive|candelabr/, "candle-holder"],
  // Booths, games, concessions, restrooms, AV, fencing
  ["photo-booths", /360/, "photo-booth-360"],
  ["photo-booths", /mirror/, "mirror-photo-booth"],
  ["games-kids", /cornhole|jenga|connect|yard game|giant (chess|checkers)/, "yard-games"],
  ["concessions", /popcorn/, "popcorn-machine"],
  ["concessions", /cotton candy/, "cotton-candy-machine"],
  ["concessions", /sno(w)? ?(cone|kone)|shaved ice/, "snow-cone-machine"],
  ["concessions", /nacho|cheese/, "nacho-cheese-warmer"],
  ["concessions", /hot dog/, "hot-dog-roller"],
  ["restrooms-power", /trailer/, "restroom-trailer"],
  ["restrooms-power", /ada|handicap|wheelchair/, "ada-restroom"],
  ["restrooms-power", /hand ?wash|sink/, "hand-wash-station"],
  ["restrooms-power", /restroom|toilet|porta.?(john|potty)/, "portable-restroom"],
  ["restrooms-power", /cable (ramp|cover)|cord cover/, "cable-ramp"],
  ["restrooms-power", /towable|\b(20|25|30|45|56|70)\s*kw/, "generator-20kw"],
  ["restrooms-power", /generator/, "generator-7kw"],
  ["av-sound", /speaker|\bspkr\b|loudspeaker|\bpa\b|sound system/, "pa-system"],
  ["av-sound", /microphone|\bmic\b/, "wireless-microphone"],
  ["av-sound", /projector/, "projector"],
  ["av-sound", /screen/, "projection-screen"],
  ["av-sound", /podium|lectern/, "podium"],
  ["av-sound", /\btv\b|television|monitor/, "tv-with-stand"],
  ["fencing-crowd-control", /stanchion|rope|post/, "stanchion"],
  ["fencing-crowd-control", /barricade|bike rack/, "barricade"],
  ["fencing-crowd-control", /fence|panel/, "temporary-fence"],
];

// Supplies and parts that only share a word with a featured item (tent weights, popcorn bags, mic stands).
const NOT_THE_ITEM = /\b(weights?|extra|servings?|supplies|refills?|kits?|bags?|cones?|straws?|pads?|cushions?|stair(s|way)?|steps?|mats?|caddy|tape|stands? for|ash ?tray|burners?|ropes?|doors?|stakes?|cords?|cases?|racks?|carts? only|handles?|tool|parts?|bulbs?|batteries|toppers?)\b|\bstand$|speaker stand|microphone stand|mic stand|chair pad|\binserts?\b|\bladles?\b|water pan|bullhorn|megaphone/;

// Finishes that change how a piece looks. A white cloth must not stand in for a red one, or a gold chair for a
// black one: use the matching colour variant's photo, the base photo when the finish matches it, and nothing otherwise.
const FINISHES = ["dusty blue", "rose gold", "black", "blush", "navy", "sage", "burgundy", "champagne", "white", "ivory", "cream", "silver", "gold", "red", "pink", "blue", "green", "purple", "lavender", "yellow", "orange", "grey", "gray", "gunmetal", "teal", "coral", "mint", "peach", "brown", "chocolate", "royal", "plum", "turquoise", "tiffany", "eggplant", "fuchsia", "copper", "taupe", "khaki", "latte", "mocha", "fruitwood", "mahogany", "natural", "walnut", "oak", "blonde", "whitewash", "smoke", "platinum", "amber", "amethyst", "cobalt", "frosted", "pearl", "bronze", "chrome", "clear", "crystal", "glass", "square", "rattan", "rosewood", "wood", "lilac", "onyx", "marble", "melamine", "coupe", "imperial", "sevre", "lucite"];
const BASE: Record<string, string[]> = {
  "gold-chiavari": ["gold", "ivory", "white", "champagne"],
  "silver-chiavari": ["silver", "white", "ivory"],
  "clear-chiavari": ["clear", "crystal", "white", "ivory"],
  "white-chiavari": ["white", "ivory", "wood"],
  "white-folding": ["white"],
  "white-resin-folding": ["white", "ivory"],
  "black-padded-folding": ["black"],
  "bar-stool": ["gold", "ivory", "white"],
  crossback: ["walnut", "wood", "natural", "brown", "rattan"],
  bentwood: ["walnut", "wood", "brown"],
  wishbone: ["natural", "oak", "wood"],
  windsor: ["white", "ivory", "wood"],
  "garden-folding": ["natural", "wood", "oak", "brown"],
  ghost: ["clear", "crystal"],
  "kids-chair": ["white"],
  "throne-chair": ["gold", "ivory", "white"],
  "farm-table": ["walnut", "wood", "natural", "brown", "blonde", "oak"],
  "round-48": ["wood"], "round-60": ["wood"], "round-72": ["wood"],
  "banquet-6ft": ["wood", "white"], "banquet-8ft": ["wood", "white"],
  "cocktail-highboy": ["wood", "silver", "chrome", "white"], "cocktail-lowboy": ["wood", "silver", "chrome", "white"],
  "kids-table": ["white"],
  "gold-flatware": ["gold"],
  "dinner-fork": ["silver", "chrome"], "salad-fork": ["silver", "chrome"], "dinner-knife": ["silver", "chrome"], teaspoon: ["silver", "chrome"],
  "chafing-dish": ["silver", "chrome"], "serving-tray": ["silver", "chrome"], "coffee-urn": ["silver", "chrome"],
  "cake-stand": ["gold"], "candle-holder": ["gold"], "stanchion": ["gold", "red"],
  "water-goblet": ["clear", "glass", "crystal"], "wine-glass": ["clear", "glass"], "champagne-flute": ["clear", "glass"],
  "rocks-glass": ["clear", "glass"], "highball-glass": ["clear", "glass"], "pilsner-glass": ["clear", "glass"],
  "lounge-sofa": ["white", "ivory", "cream"], "lounge-armchair": ["white", "ivory", "cream"], "coffee-table": ["gold", "glass", "clear"],
  "flower-wall": ["pink", "blush", "white"], "canopy-10x10": ["white"], "tent-sidewall": ["white", "clear"],
  "barricade": ["silver"], "temporary-fence": ["silver"],
};
const LINEN_BASE = ["white", "ivory", "cream"];
function finishMatch(id: string, name: string, cat: CategoryId): string | undefined {
  const found = FINISHES.filter((c) => new RegExp(`\\b${c}\\b`).test(name));
  if (!found.length) return id;
  for (const c of found) {
    const v = `${id}--${c.replace(/ /g, "-")}`;
    if (rentalImage(v)?.src.includes("--photo")) return v;
  }
  const base = cat === "linens" ? LINEN_BASE : BASE[id] ?? [];
  return found.every((c) => base.includes(c)) ? id : undefined;
}

/** The product photo of a similar featured item, for a catalog row that has none of its own. */
export function similarPhoto(item: { id: string; name: string; categoryId: CategoryId }): (RentalImage & { from: string }) | undefined {
  if (rentalImage(item.id)) return undefined;
  const name = item.name.toLowerCase().replace(/[”″“]/g, '"').replace(/[’′]/g, "'");
  if (NOT_THE_ITEM.test(name)) return undefined;
  for (const [cat, re, id] of rules) {
    if (cat !== item.categoryId || !re.test(name)) continue;
    const pick = finishMatch(id, name, cat);
    const img = pick ? rentalImage(pick) : undefined;
    if (img?.src.includes("--photo")) return { ...img, from: pick! };
    return undefined;
  }
  return undefined;
}
