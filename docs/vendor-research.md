# Chicago-area event rental vendors

Checked 2026-11-02. 23 vendors are wired into the site catalog (src/data/vendors.ts). Customers never see vendor names; each lead shows them in the CRM.

Pricing rule: customer price = vendor price + 10%, rounded to the cent. 80 of 98 items use a vendor's published price; 18 use a Chicago-market estimate (marked "Est." on the site) until a vendor quotes them.

## Vendors in the catalog

| Vendor | Base | Phone | Prices | Verified via | Items routed to them | Notes |
|---|---|---|---|---|---|---|
| [Arlington Rental (Chicagoland Party & Event Rentals)](https://www.arlingtonrental.com) | Schaumburg | 847-394-8213 | public-list | own website | 51 | Public 1-day price list at /pricing. Multi-day by quote. Delivery fee and minimum not published. Hours Mon-Fri 8-4:30, Sat 8-12. |
| [Hall's Rental Service](https://www.hallsrental.com) | Niles | (847) 929-2222 | public-list | own website | 7 | Public 2026 price guide (web + PDF). Upscale tableware and specialty chairs. No tents. Propane equipment requires a certificate of insurance. |
| [House of Rental](https://www.houseofrental.com) | Skokie | 847-677-2010 | partial | own website | 3 | Prices on individual product pages (daily rate). Delivery priced by time and location; extra for stairs and after-hours. |
| [Playhouse Party Rentals](https://www.playhousepartyrentals.com) | Chicago | 773-900-6262 | partial | own website | 5 | Prices shown on the Luxury Wedding Rentals category page. IDOL-inspected inflatables; Chicago Park District approved. |
| [Easy Breezy Bash Co.](https://easybreezybashco.com) | Oak Creek, WI | 414-559-4266 | public-list | own website | 16 | Wisconsin-based with a public online catalog; lists Chicago in its service area. Chicago delivery fee not published, confirm before quoting. |
| [Bowery & Bash](https://www.boweryandbash.com) | Chicago | 312-882-1891 | quote-only | own website | 8 | Luxury furniture and decor. Earlier research: $3,500 minimum within 50 miles, 10% mandatory damage protection, 50% non-refundable deposit. |
| [Big Tent Events](https://www.bigtentevents.com) | St. Charles | 630-690-8500 | quote-only | own website | 4 | Tent specialist (pole, frame, clear-top, structure). 3.5% card fee. |
| [Joliet Tent Company](https://www.joliettent.com) | Joliet | 815-722-2315 | quote-only | own website | 0 |  |
| [Ultimate Rental Services](https://www.ultimaterentalservices.com) | Romeoville | 630-468-2800 | quote-only | own website | 0 | Full service: delivery, setup, teardown. Free quotes. |
| [Rose Party Rentals & Service](https://www.rrental.com) | Glendale Heights | 847-310-0000 | quote-only | own website | 0 | Family owned. Press release says delivery, setup and takedown included (unverified). |
| [Affordable Party Tent Rentals](https://affordablepartytent.com) | Elburn | 630-587-2955 | quote-only | own website | 0 |  |
| [Satin Chair Event Decor & Rental](http://www.satinchair.com) | Naperville | 630-504-2009 | quote-only | own website | 0 | Decor-focused: backdrops, ceiling draping, centerpieces, South Asian event styling. |
| [Windy City Linen](https://www.windycitylinen.com) | Wheeling | (224) 279-1500 | quote-only | own website | 3 | Linen specialist since 2008. Showroom by appointment. |
| [BBJ La Tavola](https://bbjlatavola.com) | Niles | 847-329-8400 | quote-only | own website | 0 | Premium specialty linens, runners and napkins. |
| [Tablescapes Event Rentals](https://www.tablescapes.com) | Chicago | 312-733-9700 | quote-only | own website | 1 | Prices appear only after choosing a location and starting a quote. |
| [Vintage Place Settings](https://vintageplacesettings.com) | Chicago | 773-876-7674 | quote-only | own website | 0 | Vintage china, glassware and flatware, 100+ patterns. |
| [Curated Rentals](http://www.curatedrentals.co) | Chicago | 312-520-8956 | quote-only | own website | 0 |  |
| [Complete Weddings + Events (Chicago)](https://completewedo.com/chicago/) | Chicago | 331-207-4027 | quote-only | own website | 0 | DJ, uplighting and photo booths. |
| Windy City Event Rentals | Chicago |  | quote-only | directory listing | 0 | Found on The Knot and WeddingWire ("starting" prices: chairs $3, tables $10). Own website not confirmed. |
| Chicago Tent Rental | Hinsdale | (708) 699-7368 | partial | directory listing | 0 | WeddingWire shows starting prices only (tents $300, tables $10, chairs $2.50), delivery and setup included. |
| EZ Tent Rentals | Countryside |  | quote-only | directory listing | 0 | Found on The Knot; own website not confirmed. Also generators, restrooms, climate control. |
| P.S. Event Rentals by Funtime Services | Naperville | 630-922-6100 | quote-only | directory listing | 0 | Chiavari, cross-back, farm tables, clear and hi-peak tents, bistro lighting. Showroom by appointment. |
| Champagne Petal Rentals | Chicago |  | quote-only | directory listing | 0 | Faux-floral arches and aisle decor (The Knot). |

## Leads not yet verified (not in the catalog)

Found only in directory listings. Call before adding them.

- The Rental Place Inc (Naperville), 630-369-0242: UNVERIFIED lead: appears only in Eventective directory (phone listed); category and inventory not confirmed. Check before routing.
- Party To Go (Oswego), 630-267-6047: UNVERIFIED lead: directory listing only.
- Tablescapes by Tiffany (Plainfield), 630-248-6290: UNVERIFIED lead: directory listing only; inventory guessed from name.
- M&M - The Special Events Company (Carol Stream), 630-871-9999: UNVERIFIED lead: directory listing only.
- Reventals (marketplace) (Chicago), 888-857-0071: Marketplace; FAQ gives only ballpark: Chiavari ~$8, folding ~$1-4 (not item-level published prices).
- RentForEvent Chicago (Chicago), no phone: Pipe & drape, uplighting, wedding lighting; site blocked bot fetch, prices not verified.

## Estimated prices (no published vendor price)

| Item | Estimated vendor price | Customer price | Routed to |
|---|---|---|---|
| Rattan garden chair | $12.00 each | $13.20 | Bowery & Bash |
| Wishbone chair | $14.00 each | $15.40 | Bowery & Bash |
| Velvet dining chair | $18.00 each | $19.80 | Bowery & Bash |
| Infinity chair | $9.00 each | $9.90 | Bowery & Bash |
| Cane-back chair | $12.00 each | $13.20 | Bowery & Bash |
| Windsor spindle chair | $9.00 each | $9.90 | Bowery & Bash |
| Mid-century shell chair | $9.00 each | $9.90 | Bowery & Bash |
| Spandex highboy cover | $14.00 each | $15.40 | Windy City Linen |
| Sequin overlay | $30.00 each | $33.00 | Windy City Linen |
| Table runner | $7.00 each | $7.70 | Windy City Linen |
| Sailcloth tent | $4500.00 each | $4950.00 | Big Tent Events |
| Clear-top tent | $1400.00 each | $1540.00 | Big Tent Events |
| LED dance floor | $12.00 per sq ft | $13.20 | Big Tent Events |
| Bistro string lights | $75.00 per 100 ft | $82.50 | Big Tent Events |
| Coffee table | $75.00 each | $82.50 | Bowery & Bash |
| Candle holder | $2.50 each | $2.75 | Tablescapes Event Rentals |
| Popcorn machine | $95.00 each | $104.50 | Playhouse Party Rentals |
| Cotton candy machine | $95.00 each | $104.50 | Playhouse Party Rentals |

## Gaps and caveats

- Only five vendors publish item prices online: Arlington Rental (Schaumburg), Hall's Rental (Niles), House of Rental (Skokie, per product page), Playhouse Party Rentals (Chicago, wedding page) and Easy Breezy Bash Co. (Oak Creek, WI, which delivers to Chicago; its Chicago delivery fee is unpublished).
- No vendor publishes delivery fees or order minimums. Every quote must add delivery, setup, damage waiver (typically 8-12%) and tax.
- No published prices were found for LED dance floors, bistro string lights, sailcloth or clear-top tents, spandex highboy covers, sequin overlays, runners, or specialty chairs (rattan, velvet, wishbone etc.).
- Nothing verified in Orland Park, Tinley Park, Oak Lawn, Crystal Lake/McHenry or NW Indiana; the south suburbs are thin.
- Prices change. Re-check the source URL in price-sheet.csv before sending a customer a final number.
- Before routing real leads, call each vendor to agree a referral or reseller arrangement; none has been contacted.

Files: price-sheet.csv (one row per item with vendor, vendor price, +10% price, source), raw/*.json (full research notes per region).
