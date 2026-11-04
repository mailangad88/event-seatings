// Real photographs of event rentals, licensed under the Unsplash License (https://unsplash.com/license):
// free for commercial use, no permission needed. We credit every photographer anyway (see /photo-credits)
// and hotlink from Unsplash's CDN, as Unsplash asks. Each entry was checked on its Unsplash page
// (image id, photographer and that it is a free photo, not Unsplash+) on 2026-11-02.
//
// These are representative photos of the item type at real events, not the rental partner's exact stock.
// Pages label them "Example photo". When a vendor gives written permission to use their own product
// photos (marketing/vendor-photo-permission-request.md), add those to public/rentals/ and they take over.
//
// No `fs` or server imports: the quote builder imports this on the client.

import type { CategoryId } from "./catalog-products";

export type StockPhoto = {
  /** images.unsplash.com path, e.g. photo-1555244162-803834f70033 */
  id: string;
  /** Unsplash photo page id (unsplash.com/photos/<page>) */
  page: string;
  /** Photographer's name as shown on Unsplash */
  by: string;
  /** Photographer's Unsplash username */
  user: string;
  /** What the photo shows, used as the base of the alt text */
  alt: string;
};

export const stockPhotos = {
  "banquet-room": { id: "photo-1723832348105-2e69f948135a", page: "Rkj0ms67lio", by: "Jennifer Kalenberg", user: "jkalen71", alt: "Banquet room set with rows of tables and chairs" },
  "chair-sheer": { id: "photo-1782026456568-b2aaa170487b", page: "_Z4IaBqixY4", by: "Simply thrilled", user: "simplythrilled_", alt: "Event chair dressed with sheer fabric at a wedding reception" },
  "white-ceremony-chairs": { id: "photo-1559982240-f760db87b822", page: "KWHoxdn1IUE", by: "micheile henderson", user: "micheile", alt: "Rows of white ceremony chairs on a green lawn" },
  "aisle-chairs": { id: "photo-1607861884586-c7cfaed16290", page: "xMDo8y776uE", by: "Junior REIS", user: "juniorreisfoto", alt: "Outdoor wedding aisle lit between rows of white chairs" },
  "wood-chairs-row": { id: "photo-1737131148863-30bdc1f0af49", page: "HyYG_en9Wdw", by: "Hưng Phạm", user: "seoling", alt: "Row of wooden event chairs set on a lawn" },
  "tables-white-cloths": { id: "photo-1707333514312-39cf7658479c", page: "nIW8KdmCDRA", by: "Francesco Liotti", user: "francesco_liotti", alt: "Banquet tables and chairs dressed in white cloths" },
  "tables-formal": { id: "photo-1707333512379-8f70ad28dca4", page: "Uvhj0_-LA_s", by: "Francesco Liotti", user: "francesco_liotti", alt: "Tables and chairs set for a formal function" },
  "reception-table": { id: "photo-1680695779444-24fc71296e66", page: "kbOlsfQ5fPE", by: "Rhamely", user: "rhamely", alt: "Reception table set for a wedding" },
  "white-linens": { id: "photo-1510076857177-7470076d4098", page: "zNsSwsuyP3A", by: "Abby Savage", user: "abbysavagecreative", alt: "Event tables dressed in white tablecloths" },
  "wood-table-set": { id: "photo-1647296020388-787fdae78e3c", page: "_9Lh9_uO34o", by: "Taylor Gray", user: "captured_photography", alt: "Wooden farm table set with plates and glasses" },
  "place-settings": { id: "photo-1649615644622-6d83f48e69c5", page: "MuZ9XVsH8yA", by: "Silvia Mara", user: "labradoodleandfox", alt: "Formal dinner table with china place settings" },
  "fine-dining": { id: "photo-1525441273400-056e9c7517b3", page: "nAvodiKjbTM", by: "Thomas William", user: "thomasw", alt: "Fine dining place setting with plates, flatware and glasses" },
  "white-plate": { id: "photo-1579101403194-24b242aa56e2", page: "rSaWiL0SxSM", by: "Katsia Jazwinska", user: "katsiajazwinska", alt: "Round white china plate" },
  "tablecloth-settings": { id: "photo-1679312124272-48f6a8f4f3f6", page: "0Kgcoad7VOE", by: "Kristina Goncharova", user: "goncharovva_k", alt: "Table with a white tablecloth and place settings" },
  "wine-glass-lot": { id: "photo-1519225421980-715cb0215aed", page: "O38Id_cyV4M", by: "Photos by Lanty", user: "photos_by_lanty", alt: "Clear wine glasses set out on an event table" },
  "long-stem-glasses": { id: "photo-1502635385003-ee1e6a1a742d", page: "hw_sKmjb0ns", by: "Evelina Friman", user: "evelinafriman", alt: "Long-stem wine glasses on a table" },
  "champagne-flutes": { id: "photo-1546567075-d7113bee3c4a", page: "znXmpb53QJU", by: "Deleece Cook", user: "deleece", alt: "Four clear champagne flutes" },
  "champagne-pour": { id: "photo-1580657274234-7339717f4541", page: "xzKtOI1Cnxo", by: "Alexander Naglestad", user: "alexandernaglestad", alt: "Champagne poured into flutes on a tray" },
  "silver-flatware": { id: "photo-1607637508078-17fa89da51b6", page: "qsvQfsSUOgk", by: "Erik Mclean", user: "introspectivedsgn", alt: "Silver spoon and fork" },
  "gold-flatware": { id: "photo-1760594308135-a13ba55dd6b4", page: "sNIO9nTXvNI", by: "Andrey Ilkevich", user: "ilkevich", alt: "Gold flatware set" },
  "chafing-dishes": { id: "photo-1555244162-803834f70033", page: "SiwrpBnxDww", by: "Saile Ilyas", user: "saile_ilyas", alt: "Buffet table with silver chafing dishes" },
  "buffet-line": { id: "photo-1671612451404-f4f8fc5fe25e", page: "eDu0pbME1tc", by: "Annie Spratt", user: "anniespratt", alt: "Buffet line with serving platters of appetizers" },
  "coffee-set": { id: "photo-1769812343266-323d6b508f24", page: "nZDQg_LpFGo", by: "Jonathan Borba", user: "jonathanborba", alt: "Silver coffee service with cups and saucers" },
  "beverage-dispensers": { id: "photo-1766270123124-eb90e0e8fec9", page: "8NmGn09p6EE", by: "Far Chinberdiev", user: "fardevio", alt: "Beverage dispensers and cups on a serving counter" },
  "silver-tray": { id: "photo-1767469852365-7e120172744c", page: "ffS_v__okC4", by: "Abdul Raheem Kannath", user: "raheemblacksnows", alt: "Drinks and snacks served on a silver tray" },
  "bar-bottles": { id: "photo-1688043366405-4a9c03e30f96", page: "EMSlylK0REM", by: "basil f", user: "biancaj22", alt: "Bar table set with bottles and glasses" },
  "bar-drinks": { id: "photo-1695605302696-b82d19ce57cf", page: "wUZbQhehzJQ", by: "Daniel", user: "unsplashbydan", alt: "Cocktails served on a bar" },
  "grill": { id: "photo-1534797258760-1bd2cc95a5bd", page: "D99y38Na5Xo", by: "Evan Wise", user: "evanthewise", alt: "Barbecue grill cooking for a crowd" },
  "tent-wedding": { id: "photo-1675376616537-c8aa9ddc9977", page: "6WzXEYnPcgo", by: "Steven Van Elk", user: "stevenvanelk", alt: "Large white tent set up for a wedding" },
  "tent-field": { id: "photo-1768179123386-a86a85f1c35c", page: "K4CEZqJqq_I", by: "Sara Kozak", user: "sara_kozak", alt: "Large white event tent on a grassy field" },
  "canopy-tent": { id: "photo-1618106494700-4b0049e83ed8", page: "gOCpvLq2OzY", by: "Zane Persaud", user: "zapsizzle", alt: "White canopy tent on a lawn" },
  "tent-reception": { id: "photo-1775476793931-cb484f197760", page: "j1EOu_UnXNs", by: "Jacques Dillies", user: "jacques_dillies", alt: "Wedding reception tent with round tables and chairs" },
  "dance-floor": { id: "photo-1765632814488-52e6d0653ebe", page: "fLovySG_2l0", by: "Preillumination SeTh", user: "7seth", alt: "Couple dancing on a wooden dance floor" },
  "dance-floor-2": { id: "photo-1708569177086-2710ef4b1620", page: "bXoOQpB4MTg", by: "Kari Bjorn Photography", user: "karibjorn", alt: "Couple on the dance floor at a reception" },
  "wedding-stage": { id: "photo-1745573674206-1d4805fcc427", page: "owF2GbJnxlc", by: "Zaraq Iqbal", user: "zaraqiqbal", alt: "Decorated stage for a wedding" },
  "string-lights": { id: "photo-1526092817387-8f07b2904e48", page: "GcW93Uuljgo", by: "Shelly Pence", user: "shellbell130", alt: "String lights hung across a gazebo" },
  "string-lights-trees": { id: "photo-1574482211311-45a2169db57c", page: "Xaz9hnAl7qg", by: "Matthew Buchanan", user: "mthwbchn", alt: "Guests under trees strung with lights" },
  "chandelier": { id: "photo-1592318072094-2694c98adb73", page: "nroMmxBLQK4", by: "Christina Victoria Craft", user: "victoriabcphotographer", alt: "Crystal chandelier lit at night" },
  "patio-heater": { id: "photo-1779249245434-9c4fec8aebed", page: "S4_kGi_yAd0", by: "Aswin", user: "drag88", alt: "Patio heater glowing at night" },
  "patio-heater-2": { id: "photo-1764099362403-16ee561b079a", page: "dTvpNKlOGt4", by: "Karwin Luo", user: "karw1n", alt: "Outdoor patio warmed by a heater and lanterns at dusk" },
  "white-sofa": { id: "photo-1680503397671-caa25818d36f", page: "SihGUmVs2fE", by: "Albero Furniture Bratislava", user: "alberofurniture", alt: "White sofa on a wooden floor" },
  "lounge-set": { id: "photo-1618106564892-b5202ed366f3", page: "Pievx4bH1IE", by: "Zane Persaud", user: "zapsizzle", alt: "Lounge set with a white couch and wooden coffee table" },
  "arch": { id: "photo-1641834919507-b0271fe5186b", page: "kdlfXY9rvZA", by: "David Goldman", user: "davidjessephoto", alt: "Wedding arch decorated with flowers and greenery" },
  "arch-pink": { id: "photo-1738025277281-582526f674c4", page: "4AX70fujoxg", by: "Jen Vazquez", user: "jenvazquezmedia", alt: "Wedding arch decorated with pink and white flowers" },
  "centerpiece": { id: "photo-1676734629381-ecad774073b7", page: "ufpn_xkqlss", by: "Thomas Beaman", user: "paunveiled", alt: "Formal dinner table with white flower centerpieces" },
  "roses-vase": { id: "photo-1620704101768-64c46f842956", page: "r3XxZj-J4uQ", by: "Zane Persaud", user: "zapsizzle", alt: "White roses in a clear glass vase" },
  "candles": { id: "photo-1758373149866-194ab9738d76", page: "t4UqhwHDTi4", by: "光术 山影", user: "mrtiger", alt: "Candles and greenery on a table setting" },
  "neon-party": { id: "photo-1640103856233-833930665307", page: "qnR7o118st8", by: "Aly Ko", user: "kolir_svitla", alt: "Neon sign reading let's party" },
  "neon-birthday": { id: "photo-1765947379029-3ee784b877a7", page: "XHhvEDUFHTI", by: "Samuel Lopez Cruz", user: "fotogugu", alt: "White neon happy birthday sign" },
  "bounce-castle": { id: "photo-1765947389722-2e96d8c0aad9", page: "a_hMEPZUmOM", by: "Samuel Lopez Cruz", user: "fotogugu", alt: "Red inflatable castle bounce house on a lawn" },
  "bounce-two": { id: "photo-1765947384850-d072fd884477", page: "syoXDCzzFzA", by: "Samuel Lopez Cruz", user: "fotogugu", alt: "Two inflatable bounce houses on a lawn" },
  "bounce-park": { id: "photo-1765947389633-461a4af7712b", page: "V7E7VCFLzPo", by: "Samuel Lopez Cruz", user: "fotogugu", alt: "Kids' inflatable bounce house set up in a park" },
  "bounce-jump": { id: "photo-1740033135773-bf7c886ae45a", page: "vi8gZmGtGik", by: "Benjamin Brunner", user: "ben_brunner", alt: "Boy jumping in a bouncy castle" },
  "water-slide": { id: "photo-1786644255320-9eae68cae02a", page: "sO1DC1yA-EU", by: "Esrael Nate", user: "esraell", alt: "Kids on an inflatable water slide in a backyard" },
  "inflatable-slide": { id: "photo-1786114403532-06b35a8c5fe6", page: "HRA9BEd1oPQ", by: "tommao wang", user: "tommaomaoer", alt: "Kids on a large inflatable slide" },
  "cornhole": { id: "photo-1756239508881-d302bfdcc4b7", page: "FPrhvKa7-qU", by: "Salvidor Cade", user: "salvidorcade", alt: "Cornhole boards and bags on turf" },
  "cornhole-play": { id: "photo-1556761175-9c1bafe0f436", page: "KWsKzLGmmzQ", by: "Austin Distel", user: "austindistel", alt: "Guests playing cornhole" },
  "carnival-game": { id: "photo-1765980741462-d03b93d3cb50", page: "ZB7yQ_SlreI", by: "atelierbyvineeth", user: "atelierbyvineeth", alt: "Guest at a carnival game booth" },
  "carnival-balls": { id: "photo-1765980789383-b9f3e2f0a297", page: "FVT_vo_8LVg", by: "atelierbyvineeth", user: "atelierbyvineeth", alt: "Guest playing a carnival ball-toss game" },
  "popcorn-machine": { id: "photo-1695728167331-2dbcd4003602", page: "AkUUtViG6_M", by: "Alex Kalligas", user: "alexkall", alt: "Popcorn machine on a table" },
  "popcorn-night": { id: "photo-1758216535068-02a000758bc2", page: "ihtq0AMCmA4", by: "Maxim Nikiforov", user: "maxniki", alt: "Popcorn machine lit up at night" },
  "cotton-candy": { id: "photo-1741347839098-802b3b49aa52", page: "9J10zgG8jfQ", by: "Jahanzeb Ahsan", user: "jahan_photobox", alt: "Cotton candy machine ready to serve" },
  "frozen-drinks": { id: "photo-1778085406815-a06b4dc48105", page: "MECatZAIqrM", by: "Sergio Santo Pietro", user: "pietrojr", alt: "Frozen drink machines dispensing colourful slush" },
  "photo-booth": { id: "photo-1746587224861-521244472226", page: "xCFUDBrdeA4", by: "Kevin Torres", user: "kevintorres", alt: "Friends posing with props in a photo booth" },
  "booth-backdrop": { id: "photo-1727764894973-28e7283a600c", page: "yhi8bsCX6Rg", by: "iCanvas Booth", user: "icanvasphotobooth", alt: "Guest posing at a photo booth backdrop" },
  "pa-system": { id: "photo-1561314105-e6ac04c2984a", page: "JeMDicKJ8Gc", by: "Dominik Kempf", user: "dominik_kempf", alt: "Black PA speaker system" },
  "speakers-stack": { id: "photo-1724858103797-6d388eb1006a", page: "bv--Xf5Qsy8", by: "Tara-mae Miller", user: "taramaemil", alt: "Stacked event speakers" },
  "dj-controller": { id: "photo-1791983915272-38520e748dc6", page: "ej8BPSBGXPs", by: "Ansaf A", user: "westendlurker", alt: "DJ controller set up on a table" },
  "conference-screen": { id: "photo-1505373877841-8d25f7d46678", page: "bzdhc5b3Bxs", by: "Teemu Paananen", user: "xteemu", alt: "Presenter in front of a projection screen" },
  "portable-toilet": { id: "photo-1502602903514-eca7c59f29dc", page: "qGgUsvwEY70", by: "Julien Maculan", user: "maculan", alt: "Portable restroom on a field" },
  "portable-toilet-2": { id: "photo-1765121690957-c7d090ceaa3d", page: "LKx0zBQRHbc", by: "Turquo Cabbit", user: "turquocabbit", alt: "Blue portable restroom among trees" },
  "barrier": { id: "photo-1789870099729-c3ac12ce3094", page: "ORkwN_bxn9o", by: "Rodrigo Araya", user: "rodrigotypo", alt: "White metal crowd-control barrier" },
  "stanchion": { id: "photo-1764422474446-6831df3b2175", page: "dKeus2G-SGQ", by: "Kouji Tsuru", user: "pafuxu", alt: "Stanchion posts with chains" },
  "barrier-crowd": { id: "photo-1758518772414-b1bd6ac5bc27", page: "v_rMlvNjx5o", by: "Ligio Pereira", user: "ligio_pereira", alt: "Crowd behind barricades at a street event" },} satisfies Record<string, StockPhoto>;

export type StockPhotoKey = keyof typeof stockPhotos;

const UTM = "utm_source=beyond_chiavari&utm_medium=referral";

/** Unsplash's imgix CDN resizes and serves WebP/AVIF, so these skip Next's image optimizer. */
export function stockSrc(p: StockPhoto, w: number, h = w) {
  return `https://images.unsplash.com/${p.id}?auto=format&fit=crop&crop=entropy&w=${w}&h=${h}&q=70`;
}
export function stockSrcSet(p: StockPhoto, w: number, h = w) {
  return [1, 2].map((x) => `${stockSrc(p, w * x, h * x)} ${x}x`).join(", ");
}
export const stockPageUrl = (p: StockPhoto) => `https://unsplash.com/photos/${p.page}?${UTM}`;
export const stockAuthorUrl = (p: StockPhoto) => `https://unsplash.com/@${p.user}?${UTM}`;
export const UNSPLASH_URL = `https://unsplash.com/?${UTM}`;
export const UNSPLASH_LICENSE = "https://unsplash.com/license";

// Item type rules, checked in order against the item name (then its price-list section). The first match wins.
// An empty list means "no honest photo yet" (the item keeps its icon), e.g. generators.
const rules: [RegExp, StockPhotoKey[]][] = [
  [/generator|power distro|extension cord|\bcords?\b|cable ramp|gallon of gas|garbage|trash|recycl|bus (pan|cart|tub)|\bfans?\b|air mover|air conditioner|misting|foosball|air hockey|pool table|craps|blackjack|black ?jack|roulette|poker/, []],
  [/water ?slide|waterslide|slip ?n|slip and slide|dunk|foam party|splash|with pool|\(wet\)/, ["water-slide", "inflatable-slide"]],
  [/bounce|bouncer|jumper|inflatable|bouncy|moon ?walk|combo|obstacle|toddler/, ["bounce-castle", "bounce-two", "bounce-park", "bounce-jump"]],
  [/cornhole|bean ?bag|giant (jenga|connect|chess|checkers)|jenga|yard game|ladder (golf|toss)|horseshoe|bocce|croquet/, ["cornhole", "cornhole-play"]],
  [/popcorn/, ["popcorn-machine", "popcorn-night"]],
  [/cotton candy|candy floss/, ["cotton-candy"]],
  [/sno(w)? ?(cone|kone|bal)|slush|frozen|shaved ice|margarita machine|daiquiri/, ["frozen-drinks"]],
  [/photo ?booth|selfie|360 (booth|camera)|glam booth|mirror booth/, ["photo-booth", "booth-backdrop"]],
  [/neon|marquee (letter|number)|light.?up letter/, ["neon-party", "neon-birthday"]],
  [/\barch(es)?\b|arbor|flower wall|floral wall|greenery wall|backdrop/, ["arch", "arch-pink"]],
  [/speaker|\bpa\b|p\.a\.|sound system|microphone|\bmic\b|\bdj\b|mixer|amplifier|subwoofer|karaoke/, ["pa-system", "speakers-stack", "dj-controller"]],
  [/projector|projection|\bproj\b|\btvs?\b|monitor|podium|lectern|movie screen/, ["conference-screen"]],
  [/toilet|restroom|porta.?(john|potty)|hand ?wash|washing station/, ["portable-toilet", "portable-toilet-2"]],
  [/barricade|barrier|bike rack|stanchion|crowd control|velour rope|velvet rope|fence|fencing/, ["barrier", "stanchion", "barrier-crowd"]],
  [/heat lamp|heating tray|warming|hot box|hot cave|food warmer/, ["chafing-dishes", "silver-tray"]],
  [/grill|bbq|b\.b\.q|bar-?b-?q|barbecue|smoker|griddle|fryer|roaster|burner|stove|charcoal/, ["grill"]],
  [/heater|heating|propane|fire ?(pit|bowl)/, ["patio-heater", "patio-heater-2"]],
  [/\bplates?\b|charger|saucer|\bchina\b|dinnerware|soup (plate|bowl|cup)|bouill?on|ramekin|dessert dish/, ["place-settings", "white-plate", "fine-dining", "tablecloth-settings"]],
  [/chair cover|chair sash|\bsash(es)?\b|spandex/, ["chair-sheer"]],
  [/napkin|tablecloth|table ?cloth|table cover|overlay|runner|table ?skirt|skirting|pipe and drape|\blinens?\b/, ["white-linens", "tablecloth-settings"]],
  [/\btents?\b|canopy|canopies|sidewall|pole tent|frame tent|pop.?up|pavilion|gazebo|awning|tent weights?|concrete weight/, ["tent-wedding", "tent-field", "canopy-tent", "tent-reception"]],
  [/dance ?floor/, ["dance-floor", "dance-floor-2"]],
  [/\bstage|staging|platform/, ["wedding-stage"]],
  [/candle|votive|candelabr|tea ?light/, ["candles", "centerpiece"]],
  [/string light|bistro light|market light|caf[eé] light|edison/, ["string-lights", "string-lights-trees"]],
  [/chandelier/, ["chandelier"]],
  [/\blights?\b|lighting|lamp|lantern|uplight|spotlight|pin ?spot|\bled\b/, ["string-lights", "string-lights-trees", "chandelier"]],
  [/sofa|couch|loveseat|lounge|ottoman|settee|armchair|club chair/, ["white-sofa", "lounge-set"]],
  [/coffee|espresso|\btea\b|\burns?\b|airpot|creamer|sugar/, ["coffee-set", "beverage-dispensers"]],
  [/beverage|dispenser|cooler|water jug|pitcher|punch|fountain|ice tub|ice bin/, ["beverage-dispensers"]],
  [/\bbars?\b|bar stool|barstool|bartend|back ?bar|cocktail (station|shaker|tray)|martini shaker|decanter|champagne bucket|ice scoop/, ["bar-bottles", "bar-drinks"]],
  [/\bforks?\b|knife|knives|spoons?\b|flatware|cutlery|silverware|steak/, ["silver-flatware", "gold-flatware"]],
  [/chafing|chafer|sterno|buffet|tray|platter|bowl|serving|server|ladle|tongs?\b|pedestal|cake stand|food pan|hotel pan|riser|oven|tile|carving board|tureen/, ["chafing-dishes", "buffet-line", "silver-tray"]],
  [/champagne|flute|coupe/, ["champagne-flutes", "champagne-pour"]],
  [/glass|goblet|stemware|tumbler|barware|snifter|martini|highball|\bshot\b|pilsner|drinkware|\bwine\b|cordial|sherry|old fashion|rocks|parfait/, ["wine-glass-lot", "long-stem-glasses"]],
  [/chiavari|chivari/, ["banquet-room", "chair-sheer"]],
  [/(farm|wood|walnut|rustic|reclaimed|harvest).*table|table.*(farm|wood|walnut|rustic|reclaimed)/, ["wood-table-set"]],
  [/\btables?\b|highboy|hi ?boy|high boy|cocktail round/, ["tables-formal", "reception-table", "tables-white-cloths"]],
  [/cross ?back|vineyard|farm chair|wood(en)? chair|bentwood/, ["wood-chairs-row"]],
  [/folding|garden chair|resin|samsonite|ceremony/, ["white-ceremony-chairs", "aisle-chairs"]],
  [/chairs?\b|stool|bench/, ["banquet-room", "white-ceremony-chairs", "aisle-chairs"]],
  [/vase|centerpiece|flower|floral|florals/, ["centerpiece", "roses-vase", "candles"]],
  [/carnival|\btoss\b|games?\b|arcade|basketball|skee|plinko|golf|mechanical bull|rock wall|wheel|challenge|interactive|bowling|soccer|tic.?tac/, ["carnival-game", "carnival-balls", "cornhole-play"]],
];

// Featured items whose real photo shows the item accurately: the photo becomes the main image and
// the 3D render steps back to a fallback (Angad asked for real photos over renders, 2026-11-02).
// Chairs, tables, linens and most tableware stay on renders until vendor photos arrive, because
// no free photo shows a Chiavari, ghost or cross-back chair cleanly.
export const photoFirst: Record<string, StockPhotoKey[]> = {
  "canopy-10x10": ["canopy-tent", "tent-field"],
  "frame-tent-20x20": ["tent-field", "canopy-tent"],
  "frame-tent-20x40": ["tent-field", "tent-wedding"],
  "frame-tent-30x60": ["tent-wedding", "tent-field"],
  "pole-tent-40x60": ["tent-wedding", "tent-reception"],
  "dance-floor": ["dance-floor", "dance-floor-2"],
  "stage-deck": ["wedding-stage"],
  "string-lights": ["string-lights", "string-lights-trees"],
  chandelier: ["chandelier"],
  "patio-heater": ["patio-heater", "patio-heater-2"],
  "lounge-sofa": ["white-sofa", "lounge-set"],
  "ceremony-arch": ["arch", "arch-pink"],
  "neon-sign": ["neon-party", "neon-birthday"],
  "bounce-house": ["bounce-castle", "bounce-two", "bounce-park"],
  "yard-games": ["cornhole", "cornhole-play"],
  "popcorn-machine": ["popcorn-machine", "popcorn-night"],
  "cotton-candy-machine": ["cotton-candy"],
  "portable-restroom": ["portable-toilet", "portable-toilet-2"],
  "pa-system": ["pa-system", "speakers-stack"],
  "projection-screen": ["conference-screen"],
  stanchion: ["stanchion", "barrier"],
  barricade: ["barrier", "barrier-crowd"],
  "chafing-dish": ["chafing-dishes", "buffet-line"],
  "beverage-dispenser": ["beverage-dispensers"],
  "serving-tray": ["silver-tray", "buffet-line"],
  "coffee-cup-saucer": ["coffee-set"],
  "dinner-plate": ["white-plate", "place-settings"],
  "wine-glass": ["wine-glass-lot", "long-stem-glasses"],
  "water-goblet": ["long-stem-glasses", "wine-glass-lot"],
  "champagne-flute": ["champagne-flutes", "champagne-pour"],
  "gold-flatware": ["gold-flatware"],
  "dinner-fork": ["silver-flatware"],
  teaspoon: ["silver-flatware"],
  "cloth-napkins": ["white-linens", "tablecloth-settings"],
  "round-floor-length": ["white-linens", "tables-white-cloths"],
  "banquet-floor-length": ["white-linens", "tablecloth-settings"],
  "chair-cover": ["chair-sheer"],
  "farm-table": ["wood-table-set"],
};

/** True when a featured item should show its real photo before its 3D render. */
export const isPhotoFirst = (id: string) => id in photoFirst;

// When no rule matches, the category's general photo (shown as an example of the category, not the item).
const categoryDefaults: Record<CategoryId, StockPhotoKey[]> = {
  chairs: ["banquet-room", "white-ceremony-chairs", "wood-chairs-row"],
  tables: ["tables-formal", "reception-table", "tables-white-cloths"],
  linens: ["white-linens", "tablecloth-settings"],
  dinnerware: ["place-settings", "white-plate", "fine-dining"],
  flatware: ["silver-flatware", "gold-flatware", "fine-dining"],
  glassware: ["wine-glass-lot", "long-stem-glasses", "champagne-flutes"],
  "catering-equipment": ["chafing-dishes", "buffet-line", "silver-tray"],
  tents: ["tent-wedding", "tent-field", "canopy-tent", "tent-reception"],
  "dance-floors-staging": ["dance-floor", "dance-floor-2", "wedding-stage"],
  lighting: ["string-lights", "string-lights-trees", "chandelier"],
  "heating-cooling": ["patio-heater", "patio-heater-2"],
  lounge: ["white-sofa", "lounge-set"],
  decor: ["centerpiece", "candles", "roses-vase", "arch"],
  "games-kids": ["carnival-game", "bounce-castle", "cornhole-play"],
  concessions: ["popcorn-machine", "cotton-candy", "frozen-drinks"],
  "photo-booths": ["photo-booth", "booth-backdrop"],
  "av-sound": ["pa-system", "speakers-stack", "dj-controller"],
  "restrooms-power": ["portable-toilet", "portable-toilet-2"],
  "fencing-crowd-control": ["barrier", "stanchion", "barrier-crowd"],
};

/** Category photos for page headers and strips. */
export function categoryPhotos(categoryId: CategoryId) {
  return categoryDefaults[categoryId].map((k) => ({ key: k, ...stockPhotos[k] }));
}

// Small stable hash so neighbouring items in a list get different photos of the same type.
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export type ItemPhotos = {
  /** Photos in display order, rotated per item. Empty when we have no honest photo for the type. */
  photos: (StockPhoto & { key: StockPhotoKey })[];
  /** True when the photos show this item type; false when they are general category photos. */
  matched: boolean;
};

/** Real photos for one catalog item, matched by item type from its name and price-list section. */
export function photosForItem(item: { id: string; name: string; section?: string; categoryId: CategoryId }): ItemPhotos {
  // The item name decides first; our section heading only when the name says nothing
  // (sections like "Tents, Tables & Chairs" would otherwise send a folding chair to the tent photos).
  const first = photoFirst[item.id];
  if (first) return { photos: first.map((k) => ({ key: k, ...stockPhotos[k] })), matched: true };
  const name = item.name.toLowerCase();
  const section = (item.section ?? "").toLowerCase();
  const rule = rules.find(([re]) => re.test(name)) ?? (section ? rules.find(([re]) => re.test(section)) : undefined);
  const keys = rule ? rule[1] : categoryDefaults[item.categoryId] ?? [];
  const start = keys.length ? hash(item.id) % keys.length : 0;
  const ordered = [...keys.slice(start), ...keys.slice(0, start)];
  return { photos: ordered.map((k) => ({ key: k, ...stockPhotos[k] })), matched: !!rule && keys.length > 0 };
}

/** Alt text for a stock photo shown for an item. */
export function stockAlt(p: StockPhoto, itemName: string, matched: boolean, market = "Chicago") {
  return matched
    ? `${p.alt}: example photo of ${itemName} style rentals in ${market} (photo by ${p.by} on Unsplash)`
    : `${p.alt}: example event photo for ${itemName} rentals in ${market} (photo by ${p.by} on Unsplash)`;
}

/** schema.org ImageObject with licence and credit, for item and category pages. */
export function stockImageJsonLd(p: StockPhoto, caption: string) {
  return {
    "@type": "ImageObject",
    contentUrl: stockSrc(p, 1200, 1200),
    thumbnailUrl: stockSrc(p, 400, 400),
    caption,
    description: p.alt,
    creator: { "@type": "Person", name: p.by, url: `https://unsplash.com/@${p.user}` },
    creditText: `${p.by} / Unsplash`,
    copyrightNotice: `Photo by ${p.by} on Unsplash`,
    license: UNSPLASH_LICENSE,
    acquireLicensePage: `https://unsplash.com/photos/${p.page}`,
  };
}
