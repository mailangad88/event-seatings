// The rental catalog: every product with the vendor that fulfils it and that vendor's raw price.
// Customer-facing prices are vendor price + 10% (MARKUP in @/lib/catalog-types).
//
// - `offers` below are PUBLISHED vendor prices, checked 2026-11-02 (source URL on each).
// - Products with no published offer fall back to a Chicago-market estimate from
//   catalog-products.ts and are flagged priceSource: "estimated"; they are routed to a
//   quote-only vendor that carries the category.
// - Vendor names and vendor prices are back-end data. Never pass `catalogItems` or `vendors`
//   to a client component; map items through toPublicItem() from @/lib/catalog-types.

import { customerPrice, type CatalogItem as BaseItem } from "@/lib/catalog-types";
import { categories, products, type CategoryId, type Product } from "./catalog-products";
import inventory from "./catalog-inventory.json";
import { vendors, type Vendor } from "./vendors";

export { vendors, categories, products, customerPrice };
export type { Vendor, CategoryId, Product };

export const PRICES_CHECKED_AT = "2026-11-02";

export type Offer = { vendorId: string; vendorPrice: number; vendorItem: string; sourceUrl: string; note?: string };

/** A catalog item with the extra fields the /rentals pages use. Assignable to catalog-types' CatalogItem. */
export type CatalogItem = BaseItem & {
  categoryId: CategoryId;
  unit: string;
  specs: string;
  description: string;
  priceSource: "published" | "estimated";
  altOffers: Offer[];
  /** Quote-only vendors that also carry this category (for rerouting). */
  backupVendorIds: string[];
  priceCheckedAt: string;
  keywords: string[];
  /** Curated items (hand-written copy, sample budgets, renders). False for full vendor inventory rows. */
  featured: boolean;
  /** Vendor's own section heading, for grouping full-inventory items on category pages. */
  section?: string;
};

const AR = "https://www.arlingtonrental.com/pricing";
const HA = "https://www.hallsrental.com/price-guide-2026/";
const HR = "https://www.houseofrental.com/product/rentals/";
const PH = "https://www.playhousepartyrentals.com/category/luxury-wedding-rentals-chicago/";
const EB = "https://easybreezybashco.com/product-category/";

const o = (vendorId: string, vendorPrice: number, vendorItem: string, sourceUrl: string, note?: string): Offer => ({
  vendorId,
  vendorPrice,
  vendorItem,
  sourceUrl,
  ...(note && { note }),
});

/** Published vendor prices, keyed by product id. */
export const offers: Record<string, Offer[]> = {
  // Chairs
  "gold-chiavari": [
    o("arlington-rental", 6.75, "Chiavari chair, gold w/ ivory pad", AR),
    o("easy-breezy-bash-co", 7.85, "Gold Chiavari chair", `${EB}table-and-chair-rentals/`),
    o("playhouse-party-rentals", 8, "Gold Chiavari chair", PH, "Seat pad $2.50 extra"),
    o("house-of-rental", 10.5, "Chiavari chair, gold", `${HR}chiavari-chair-gold/37807`),
    o("halls-rental", 10.85, "Versailles Chiavari chair, gold", HA),
  ],
  "silver-chiavari": [
    o("easy-breezy-bash-co", 7.85, "Silver Chiavari chair", `${EB}table-and-chair-rentals/`),
    o("halls-rental", 10.85, "Versailles Chiavari chair, silver", HA, "Hall's lists $10.85-11.80 by color"),
  ],
  "clear-chiavari": [
    o("playhouse-party-rentals", 8, "Clear Chiavari chair", PH),
    o("halls-rental", 13.05, "Chiavari chair, crystal", HA),
  ],
  "white-chiavari": [
    o("easy-breezy-bash-co", 7.85, "White Chiavari chair", `${EB}table-and-chair-rentals/`),
    o("playhouse-party-rentals", 8, "White Chiavari chair", PH),
    o("halls-rental", 10.85, "Versailles Chiavari chair, white", HA),
    o("house-of-rental", 11, "White resin Chiavari chair (outdoor)", `${HR}chair-chiavari-white-resin-outdoor/44550`),
  ],
  "white-folding": [
    o("arlington-rental", 2.25, "Samsonite folding chair, white", AR),
    o("house-of-rental", 3.5, "Folding chair, white w/ white legs", `${HR}chair-folding-white-w-white-legs/19156`),
    o("halls-rental", 4.05, "White contour plastic chair, chrome frame", HA),
  ],
  "white-resin-folding": [
    o("arlington-rental", 4.5, "White resin padded folding chair", AR),
    o("playhouse-party-rentals", 7, "White resin garden chair", PH),
    o("halls-rental", 6.95, "White resin folding garden chair", HA),
  ],
  "black-padded-folding": [
    o("arlington-rental", 3.25, "Black padded stacking banquet chair", AR, "Stacking banquet style, indoor"),
    o("halls-rental", 8.6, "Black wood folding chair, padded seat", HA),
  ],
  crossback: [o("easy-breezy-bash-co", 8.85, "Farm crossback chair", `${EB}table-and-chair-rentals/`)],
  ghost: [o("halls-rental", 25.25, "Mirage chair (ghost style)", HA)],
  bentwood: [o("halls-rental", 14.5, "Bentwood chair, fruitwood", HA)],
  "louis-medallion": [o("halls-rental", 28.75, "Louis padded chair", HA)],
  "garden-folding": [o("halls-rental", 9.05, "Varnished oak folding chair, padded seat", HA)],
  "kids-chair": [
    o("arlington-rental", 3, "Child's resin chair w/ arms", AR),
    o("easy-breezy-bash-co", 4, "Kid's party chair", `${EB}table-and-chair-rentals/`),
    o("house-of-rental", 5.8, "Kids white resin folding chair", `${HR}kids-white-resin-folding-chair/40774`),
    o("halls-rental", 10, "Child's chair", HA),
  ],
  "throne-chair": [o("easy-breezy-bash-co", 275, "Throne chair", `${EB}table-and-chair-rentals/`)],
  "bar-stool": [o("arlington-rental", 15.75, "Chiavari barstool w/ back", AR, "Plain black padded bar stool is $7.75")],

  // Tables
  "round-48": [o("arlington-rental", 11.5, "48\" round table", AR)],
  "round-60": [
    o("arlington-rental", 13.5, "60\" round table, wood", AR),
    o("house-of-rental", 15, "60\" round table", `${HR}table-60-round/19142`),
  ],
  "round-72": [
    o("arlington-rental", 15.5, "72\" round table, wood", AR),
    o("house-of-rental", 21, "72\" round table", `${HR}table-72-round/19147`),
  ],
  "banquet-6ft": [
    o("arlington-rental", 10.5, "6' banquet table, plastic", AR),
    o("house-of-rental", 14, "6' banquet table", `${HR}table-6-long/19141`),
  ],
  "banquet-8ft": [
    o("arlington-rental", 11.5, "8' banquet table, plastic", AR),
    o("house-of-rental", 15, "8' banquet table", `${HR}table-8-long/19140`),
  ],
  "cocktail-highboy": [
    o("arlington-rental", 14.5, "30\"x42\" pedestal highboy", AR),
    o("easy-breezy-bash-co", 35, "Cocktail table", `${EB}table-and-chair-rentals/`),
  ],
  "cocktail-lowboy": [o("arlington-rental", 14.5, "30\" round table, wood", AR)],
  "farm-table": [
    o("easy-breezy-bash-co", 89, "Rustic farm table", `${EB}table-and-chair-rentals/`),
    o("halls-rental", 265, "Walnut farm table 8' x 40/42\"", HA),
  ],
  "sweetheart-table": [o("easy-breezy-bash-co", 75, "Sweetheart table", `${EB}table-and-chair-rentals/`)],
  "kids-table": [o("easy-breezy-bash-co", 25, "Kid's party table", `${EB}table-and-chair-rentals/`)],

  // Linens
  "round-floor-length": [
    o("arlington-rental", 14.25, "120\" round linen", AR),
    o("house-of-rental", 19.35, "Ivory Elegance 120\" round", `${HR}ivory-elegance-collection/34850`),
  ],
  "round-lap-length": [
    o("arlington-rental", 9.25, "90\" round linen", AR),
    o("house-of-rental", 12.6, "Ivory Elegance 90\" round", `${HR}ivory-elegance-collection/34850`),
  ],
  "banquet-floor-length": [
    o("arlington-rental", 24, "90x156 linen", AR),
    o("house-of-rental", 31.1, "Ivory Elegance 90x156", `${HR}ivory-elegance-collection/34850`),
  ],
  "banquet-lap-length": [
    o("arlington-rental", 21, "90x132 linen", AR),
    o("house-of-rental", 26.75, "Ivory Elegance 90x132", `${HR}ivory-elegance-collection/34850`),
  ],
  "cloth-napkins": [
    o("arlington-rental", 0.75, "Solid napkin 20x20", AR),
    o("house-of-rental", 0.85, "Ivory Elegance napkin 17x17", `${HR}ivory-elegance-collection/34850`),
  ],
  "chair-sash": [
    o("arlington-rental", 2, "Poly satin or organza chair tie", AR),
    o("house-of-rental", 2.3, "Ivory Elegance sash 4x108", `${HR}ivory-elegance-collection/34850`),
  ],
  "chair-cover": [o("house-of-rental", 7.35, "Chair cover, white round top XL", `${HR}chair-cover-white-round-top-xl-/39581`)],

  // Dinnerware
  "charger-plate": [
    o("halls-rental", 8.5, "Glass charger plate 13\"", HA),
    o("halls-rental", 10, "Gold-rim Chateau charger", HA),
  ],
  "dinner-plate": [
    o("arlington-rental", 0.75, "Dinner plate 10 1/2\" (Gold, Platinum or White Elegance)", AR),
    o("halls-rental", 1.1, "White Bavarian dinner plate 9.5\"", HA),
  ],
  "salad-plate": [
    o("arlington-rental", 0.65, "Salad/dessert plate 7 3/4\"", AR),
    o("halls-rental", 1.1, "White rim china salad plate 7.5\"", HA),
  ],
  "bread-plate": [
    o("arlington-rental", 0.65, "Bread & butter plate 6\"", AR),
    o("halls-rental", 1.1, "White Bavarian B&B plate 6.75\"", HA),
  ],
  "soup-bowl": [o("arlington-rental", 0.75, "Rim soup bowl 9\" (White Elegance)", AR)],
  "coffee-cup-saucer": [
    o("arlington-rental", 0.65, "Coffee cup & saucer (Platinum)", AR),
    o("arlington-rental", 1, "Coffee cup & saucer (Gold)", AR),
  ],

  // Flatware
  "dinner-fork": [o("arlington-rental", 0.75, "Dinner fork", AR), o("halls-rental", 0.85, "Marquette dinner fork", HA)],
  "salad-fork": [o("arlington-rental", 0.75, "Salad / dessert fork", AR)],
  "dinner-knife": [o("arlington-rental", 0.75, "Dinner knife", AR), o("halls-rental", 0.85, "Marquette dinner knife", HA)],
  teaspoon: [o("arlington-rental", 0.75, "Teaspoon", AR)],
  "gold-flatware": [
    o("halls-rental", 1.55, "Gold plated Baroque flatware (per piece)", HA),
    o("halls-rental", 2.1, "Brushed gold flatware (per piece)", HA),
  ],

  // Glassware
  "water-goblet": [o("arlington-rental", 0.75, "Embassy water goblet 10.5-11.5 oz", AR), o("halls-rental", 1.3, "Libbey water goblet 11.5 oz", HA)],
  "wine-glass": [o("arlington-rental", 0.75, "Embassy wine glass 6.5 or 8.5 oz", AR), o("halls-rental", 1.3, "Wine goblet (Libbey)", HA)],
  "champagne-flute": [o("arlington-rental", 0.75, "Embassy champagne flute 6 oz", AR), o("halls-rental", 1.52, "Champagne flute (Excalibur)", HA)],
  "rocks-glass": [o("arlington-rental", 0.75, "Double rocks glass 12 oz", AR), o("halls-rental", 1.05, "Single old fashioned 9 oz", HA)],
  "highball-glass": [o("arlington-rental", 0.75, "Highball 8 oz", AR), o("halls-rental", 1.05, "Highball 10 oz", HA)],
  "pilsner-glass": [o("arlington-rental", 0.75, "Beer pilsner 12 oz", AR), o("halls-rental", 1.55, "Pilsner 12 oz", HA)],

  // Catering equipment
  "chafing-dish": [o("halls-rental", 44, "Stainless 8 qt oblong chafing dish w/ Sterno", HA)],
  "beverage-dispenser": [
    o("arlington-rental", 11, "Ice tea dispenser 3 gallon", AR),
    o("arlington-rental", 16, "Beverage Cambro 5 gallon", AR),
    o("halls-rental", 48, "Polycarbonate dispenser 3 gallon", HA),
  ],
  "coffee-urn": [
    o("arlington-rental", 25, "100 cup coffee maker", AR),
    o("halls-rental", 140, "Chrome urn 100 cup", HA),
  ],
  "serving-tray": [o("arlington-rental", 5, "12\" round silver tray", AR), o("arlington-rental", 6, "Oval tray 27\"", AR)],
  "cake-stand": [o("arlington-rental", 5, "Glass cake stand", AR), o("halls-rental", 20.5, "Chrome cake stand 12\"", HA)],
  "champagne-wall": [o("easy-breezy-bash-co", 145, "Champagne wall", `${EB}carts-and-bars/`)],
  "portable-bar": [
    o("arlington-rental", 70, "4' folding white bar", AR),
    o("halls-rental", 319, "Wine barrel bar w/ wood top", HA),
  ],

  // Tents
  "canopy-10x10": [o("arlington-rental", 165, "10x10 frame tent", AR)],
  "frame-tent-20x20": [
    o("arlington-rental", 400, "20x20 frame tent", AR),
    o("house-of-rental", 500, "20x20 white Fiesta frame tent", `${HR}20x20-white-fiesta-frame-tent/34138`),
  ],
  "frame-tent-20x40": [o("arlington-rental", 650, "20x40 frame tent (seats 80)", AR)],
  "frame-tent-30x60": [o("arlington-rental", 1450, "30x60 frame tent", AR)],
  "pole-tent-40x60": [o("arlington-rental", 1475, "40x60 pole tent (seats 240)", AR)],
  "tent-sidewall": [o("arlington-rental", 25, "Tent sidewall, solid, $1.25/linear ft x 20 ft", AR, "Mesh or window walls $1.75/ft")],

  // Dance floors & staging
  "dance-floor": [o("arlington-rental", 20, "Dance floor 3x3 vinyl section w/ edging", AR)],
  "stage-deck": [o("arlington-rental", 65, "Stage section 4x8 Bil-Jax (8/16/24\" high)", AR)],

  // Lighting
  uplight: [o("easy-breezy-bash-co", 35, "Uplighting (per fixture)", `${EB}wedding-lighting-rental/`)],
  chandelier: [o("easy-breezy-bash-co", 75, "Mini chandelier", `${EB}wedding-lighting-rental/`)],
  "pipe-and-drape": [o("arlington-rental", 50, "Exhibit pipe and drape, $5/ft x 10 ft", AR)],

  // Heating & cooling
  "patio-heater": [
    o("arlington-rental", 65, "Patio heater", AR, "Propane extra"),
    o("house-of-rental", 121, "Propane patio heater 40,000 BTU", `${HR}heater-40-prop-patio-knock-down-w-case/18772`),
    o("halls-rental", 250, "Patio heater, propane", HA, "Propane tank $130 extra"),
  ],
  "tent-heater": [o("arlington-rental", 165, "Tent heater 170,000 BTU", AR)],

  // Lounge
  "lounge-sofa": [o("playhouse-party-rentals", 300, "Throne loveseat", PH)],
  "lounge-armchair": [
    o("house-of-rental", 150, "White lounge chair (all-weather)", `${HR}lounge-chair-white/42532`),
    o("halls-rental", 193, "White Metro chair w/ arms", HA),
  ],

  // Decor
  "ceremony-arch": [
    o("playhouse-party-rentals", 55, "Silver wedding arch", PH),
    o("easy-breezy-bash-co", 65, "Round arch with cover", `${EB}arch-rentals/`),
  ],
  "flower-wall": [o("easy-breezy-bash-co", 249, "Flower wall (white, pink, red and more)", `${EB}all-backdrop-rentals/`)],
  "marquee-letters": [o("easy-breezy-bash-co", 55, "Giant 3 ft marquee letter", `${EB}kids-party-rentals/`)],
  "neon-sign": [o("easy-breezy-bash-co", 89, "Neon sign, standard phrase", `${EB}neon-sign-rentals/`)],
  "photo-booth-360": [o("easy-breezy-bash-co", 149, "360 photo booth", `${EB}photo-booth-rentals/`)],
  "mirror-photo-booth": [o("easy-breezy-bash-co", 395, "Magic mirror photo booth", `${EB}photo-booth-rentals/`)],

  // Games & kids
  "bounce-house": [
    o("house-of-rental", 265, "Moon walk 15x15 castle", `${HR}moon-walk-15x15-castle/18984`),
    o("playhouse-party-rentals", 595, "White wedding bounce house", PH),
  ],
  // Added with the full vendor price lists (Nov 2026)
  "popcorn-machine": [
    o("easy-breezy-bash-co", 75, "Popcorn Machine Rental", "https://easybreezybashco.com/product-category/food-and-beverage-related-rentals/"),
    o("playhouse-party-rentals", 85, "Popcorn Machine", "https://www.playhousepartyrentals.com/category/concessions-and-add-ons/"),
    o("house-of-rental", 103, "Popcorn, Table Top", "https://www.houseofrental.com/product/rentals/popcorn-table-top/18974"),
  ],
  "snow-cone-machine": [
    o("easy-breezy-bash-co", 55, "Snow Cone Machine Rental", "https://easybreezybashco.com/product-category/food-and-beverage-related-rentals/"),
    o("playhouse-party-rentals", 85, "Sno Cone Machine", "https://www.playhousepartyrentals.com/category/concessions-and-add-ons/"),
  ],
  "nacho-cheese-warmer": [
    o("house-of-rental", 79, "Nacho Cheese Dispenser", "https://www.houseofrental.com/product/rentals/nacho-cheese-dispenser/36471"),
    o("the-jumper-store", 129, "Nacho Cheese Warmer", "https://www.thejumperstore.com/category/concessions/"),
  ],
  "hot-dog-roller": [
    o("house-of-rental", 97, "Hot Dog Warmer - Steamin Demon", "https://www.houseofrental.com/product/rentals/hot-dog-warmer-steamin-demon/18970"),
    o("the-jumper-store", 129, "Hot Dog Steamer", "https://www.thejumperstore.com/category/concessions/"),
  ],
  "cotton-candy-machine": [
    o("easy-breezy-bash-co", 55, "Cotton Candy Machine Rental", "https://easybreezybashco.com/product-category/food-and-beverage-related-rentals/"),
    o("playhouse-party-rentals", 85, "Cotton Candy Machine", "https://www.playhousepartyrentals.com/category/concessions-and-add-ons/"),
    o("house-of-rental", 103, "Cotton Candy Maker", "https://www.houseofrental.com/product/rentals/cotton-candy-maker/18976"),
  ],
  "hand-wash-station": [
    o("house-of-rental", 208, "Hand Wash Station", "https://www.houseofrental.com/product/rentals/hand-wash-station/21605"),
  ],
  "cable-ramp": [
    o("house-of-rental", 17, "Cable Protector, 40\" Straight Ramp", "https://www.houseofrental.com/product/rentals/cable-protector-40-straight-ramp/40976"),
  ],
  "stanchion": [
    o("house-of-rental", 28, "Stanchion, Chrome Post W/6' Black Belt", "https://www.houseofrental.com/product/rentals/stanchion-chrome-post-w-6-black-belt/42986"),
    o("halls-rental", 28.25, "Stanchion, Chrome", "https://www.hallsrental.com/price-guide-2026/"),
  ],
  "barricade": [
    o("house-of-rental", 29, "Crowd Control Barrier 43\"X8'", "https://www.houseofrental.com/product/rentals/crowd-control-barrier-43-x8-/39928"),
  ],
  "generator-7kw": [
    o("house-of-rental", 233, "Generator, 8000 Watt. 29-58 Amp", "https://www.houseofrental.com/product/rentals/generator-8000-watt-29-58-amp/20155"),
  ],
  "pa-system": [
    o("house-of-rental", 168, "Pa, Fender Pro 150W 2 Spkr W/Microphone", "https://www.houseofrental.com/product/rentals/pa-fender-pro-150w-2-spkr-w-microphone/18616"),
    o("playhouse-party-rentals", 100, "1000 Watt Bluetooth Speakers", "https://www.playhousepartyrentals.com/category/party-extras/"),
  ],
  "wireless-microphone": [
    o("arlington-rental", 35, "Wireless Microphone (lapel)", "https://www.arlingtonrental.com/pricing"),
  ],
  "projector": [
    o("arlington-rental", 100, "Sony LCD Projector 1200 Lumens", "https://www.arlingtonrental.com/pricing"),
  ],
  "projection-screen": [
    o("arlington-rental", 50, "Projection Screen (8\u2019 x 8\u2019 tripod)", "https://www.arlingtonrental.com/pricing"),
    o("house-of-rental", 81, "Proj, Screen 96X96", "https://www.houseofrental.com/product/rentals/proj-screen-96x96/18405"),
  ],
  "podium": [
    o("arlington-rental", 35, "Speaker's Podium", "https://www.arlingtonrental.com/pricing"),
    o("playhouse-party-rentals", 60, "Podium", "https://www.playhousepartyrentals.com/category/party-extras/"),
  ],
  "tv-with-stand": [
    o("playhouse-party-rentals", 225, "60\" TV with Stand", "https://www.playhousepartyrentals.com/category/party-extras/"),
  ],
  "yard-games": [o("arlington-rental", 25, "Ring toss / tic tac toe / limbo", AR)],
  "soft-play": [o("easy-breezy-bash-co", 225, "Mini soft play party", `${EB}kids-party-rentals/`)],
};

/**
 * Who gets the lead for an item with no published price: the specialist for that category.
 * Edit freely as partnerships are signed.
 */
const preferredQuoteVendor: Partial<Record<CategoryId, string>> = {
  chairs: "bowery-and-bash",
  tables: "bowery-and-bash",
  linens: "windy-city-linen",
  dinnerware: "tablescapes",
  flatware: "tablescapes",
  glassware: "tablescapes",
  "catering-equipment": "tablescapes",
  tents: "big-tent-events",
  "dance-floors-staging": "big-tent-events",
  lighting: "big-tent-events",
  "heating-cooling": "big-tent-events",
  lounge: "bowery-and-bash",
  decor: "tablescapes",
  "games-kids": "playhouse-party-rentals",
  concessions: "playhouse-party-rentals",
  "photo-booths": "easy-breezy-bash-co",
  "av-sound": "complete-weddings-events",
  "restrooms-power": "ez-tent-rentals",
  "fencing-crowd-control": "playhouse-party-rentals",
};

const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)!.name;

/** Quote-only partners carrying a category, in a stable order (most complete first). */
function quoteOnlyVendorsFor(category: CategoryId) {
  const pref = preferredQuoteVendor[category];
  const rank = (v: Vendor) => (v.id === pref ? -1 : Number(v.verifiedVia !== "own website"));
  return vendors
    .filter((v) => v.id === pref || (v.priceTransparency !== "public-list" && v.categories.includes(category)))
    .sort((a, b) => rank(a) - rank(b))
    .map((v) => v.id);
}

function build(p: Product): CatalogItem {
  const published = [...(offers[p.id] ?? [])].sort((a, b) => a.vendorPrice - b.vendorPrice);
  const best = published[0];
  const backups = quoteOnlyVendorsFor(p.category).filter((id) => !published.some((x) => x.vendorId === id));
  return {
    id: p.id,
    name: p.name,
    category: categoryName(p.category),
    categoryId: p.category,
    unit: p.unit,
    specs: p.specs,
    description: p.description,
    vendorPrice: best ? best.vendorPrice : p.estimate,
    vendorId: best ? best.vendorId : (backups[0] ?? "unassigned"),
    priceSource: best ? "published" : "estimated",
    altOffers: published.slice(1),
    backupVendorIds: best ? backups : backups.slice(1),
    ...(p.minQty && { minQty: p.minQty }),
    ...(p.perGuest && { perGuest: p.perGuest }),
    ...(p.chairSlug && { chairSlug: p.chairSlug }),
    ...(best && { sourceUrl: best.sourceUrl }),
    priceCheckedAt: PRICES_CHECKED_AT,
    keywords: p.keywords,
    featured: true,
  };
}

/**
 * Full vendor inventories (every published price list row), generated by
 * scripts/build-inventory.py from the vendor research. Rows that duplicate a curated
 * product's offer are already removed there.
 */
type InventoryRow = {
  id: string;
  categoryId: CategoryId;
  name: string;
  specs: string;
  unit: string;
  section: string;
  vendorId: string;
  vendorPrice: number;
  vendorItem: string;
  sourceUrl: string;
  checkedAt: string;
  altOffers?: Offer[];
};

function buildInventory(r: InventoryRow): CatalogItem {
  const cat = categories.find((c) => c.id === r.categoryId)!;
  return {
    id: r.id,
    name: r.name,
    category: cat.name,
    categoryId: r.categoryId,
    unit: r.unit,
    specs: r.specs,
    description: `${r.name}${r.specs ? ` (${r.specs})` : ""}, from our ${cat.name.toLowerCase()} range for events in Chicago and the suburbs. ${cat.blurb}.`,
    vendorPrice: r.vendorPrice,
    vendorId: r.vendorId,
    priceSource: "published",
    altOffers: r.altOffers ?? [],
    backupVendorIds: quoteOnlyVendorsFor(r.categoryId).filter((id) => id !== r.vendorId),
    sourceUrl: r.sourceUrl,
    priceCheckedAt: r.checkedAt,
    keywords: [`${r.name.toLowerCase()} rental chicago`],
    featured: false,
    section: r.section,
  };
}

const curated = products.map(build);
const curatedIds = new Set(curated.map((i) => i.id));

export const catalogItems: CatalogItem[] = [
  ...curated,
  ...(inventory.items as InventoryRow[]).filter((r) => !curatedIds.has(r.id)).map(buildInventory),
];

export const getCatalogItem = (id: string) => catalogItems.find((i) => i.id === id);

/** Group requested item ids by the vendor that should receive the lead. */
export function routeItems(itemIds: string[]) {
  const byVendor = new Map<string, { vendor: Vendor | undefined; items: CatalogItem[] }>();
  for (const id of itemIds) {
    const item = getCatalogItem(id);
    if (!item) continue;
    const entry = byVendor.get(item.vendorId) ?? { vendor: vendors.find((v) => v.id === item.vendorId), items: [] };
    entry.items.push(item);
    byVendor.set(item.vendorId, entry);
  }
  return [...byVendor.values()];
}

export const formatPrice = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0 });
