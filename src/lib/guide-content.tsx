import { BanquetDiagram, BarChart, Flowchart, MonthStrip, TableDiagram, TheaterDiagram } from "@/components/diagrams";
import { ChairArt } from "@/components/ChairArt";
import type { GuideProps } from "@/components/GuideShell";
import { chairs, getChair, type Chair } from "@/data/chairs";
import { getSeatingEvent, seatingEvents, type SeatingEvent } from "@/data/seating-events";
import { banquetLayout, plural, priceRange, roomCapacity, theaterLayout, usd } from "@/lib/planning";
import { site } from "@/lib/site";

export type GuideFamily = {
  key: string;
  base: string; // e.g. /seating-layouts
  hubTitle: string;
  hubDescription: string;
  slugs: () => string[];
  /** Returns page props, or null for an unknown slug. */
  build: (slug: string) => GuideProps | null;
  /** Short label for hub lists. */
  label: (slug: string) => { label: string; note?: string };
  /** Answer-first FAQs shown on the hub page (with FAQPage schema). */
  hubFaqs?: { q: string; a: string }[];
};

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? `{${k}}`));
const titleCase = (t: string) => t.replace(/\b([a-z])(\w*)/g, (m, a, r) => (["or", "of", "and", "a"].includes(m) ? m : a.toUpperCase() + r));
const sizeLabel = (n: number) => (n < 40 ? "an intimate" : n < 120 ? "a mid-size" : n < 250 ? "a large" : "a very large");

/* ---------------------------------------------------------------- fit scoring */
export function fitScore(chair: Chair, ev: SeatingEvent) {
  const styleHits = chair.styles.filter((s) => ev.styles.includes(s));
  const useHits = chair.uses.filter((u) => ev.uses.includes(u));
  let score = styleHits.length * 2 + useHits.length * 2;
  if (ev.outdoorLikely) score += chair.outdoorFriendly ? 1 : -2;
  if (ev.kind === "ceremony") score += chair.stackable ? 1 : 0;
  return { score, styleHits, useHits };
}
export const topChairsFor = (ev: SeatingEvent, n = 3) =>
  [...chairs].filter((c) => !c.estPrice.includes("pair")).sort((a, b) => fitScore(b, ev).score - fitScore(a, ev).score).slice(0, n);

/* ------------------------------------------------------------ seating layouts */
const layoutSlug = (e: SeatingEvent, n: number) => `${e.slug}-${n}-guests`;
function parseLayout(slug: string) {
  const m = slug.match(/^(.+)-(\d+)-guests$/);
  if (!m) return null;
  const ev = getSeatingEvent(m[1]);
  const n = Number(m[2]);
  return ev && ev.counts.includes(n) ? { ev, n } : null;
}

function buildLayout(slug: string): GuideProps | null {
  const p = parseLayout(slug);
  if (!p) return null;
  const { ev, n } = p;
  const spare = Math.max(1, Math.ceil((n * ev.sparePct) / 100));
  const chairsN = n + spare;
  const theater = ev.kind === "ceremony" ? theaterLayout(n) : null;
  const banq = ev.kind === "banquet" ? banquetLayout(n, ev.perTable, ev.dance) : null;
  const extrasSqft = ev.extras.reduce((a, x) => a + x.sqft, 0);
  const baseSqft = (theater ?? banq)!.sqft;
  const totalSqft = baseSqft + extrasSqft;
  const vars = {
    guests: n,
    chairs: chairsN,
    spare,
    tables: banq?.tables ?? 0,
    per: ev.perTable,
    rows: theater?.rows ?? 0,
    drop: Math.round(n * 0.65),
    dance: banq ? Math.round(banq.danceDepth * banq.W) : 0,
    sqft: baseSqft.toLocaleString("en-US"),
  };
  const recs = topChairsFor(ev, 3);
  const title = `${titleCase(ev.name)} Seating Layout for ${n} Guests`;
  const quickA = banq
    ? `For ${n} guests at ${ev.noun}, plan ${chairsN} chairs (${n} plus ${spare} spare) at ${banq.tables} round tables of ${ev.perTable}. You need about ${baseSqft.toLocaleString("en-US")} sq ft of clear floor${ev.dance ? ` including a dance floor of about ${Math.round(banq.danceDepth * banq.W)} sq ft` : ""}, or roughly ${totalSqft.toLocaleString("en-US")} sq ft once you add ${ev.extras.map((e) => e.name.toLowerCase()).slice(0, 2).join(" and ")}.`
    : `For ${n} guests at ${ev.noun}, plan ${chairsN} chairs (${n} plus ${spare} spare) in ${theater!.rows} rows of up to ${theater!.seatsPerRow} with a ${theater!.aisle} ft center aisle. You need about ${baseSqft.toLocaleString("en-US")} sq ft, or roughly ${totalSqft.toLocaleString("en-US")} sq ft with the altar zone and musicians.`;

  const costRows = recs.map((c) => {
    const r = priceRange(c);
    return { c, lo: r.low * chairsN, hi: r.high * chairsN };
  });
  const idx = ev.counts.indexOf(n);
  const prev = ev.counts[idx - 1];
  const next = ev.counts[idx + 1];
  const others = seatingEvents.filter((e) => e.slug !== ev.slug && e.counts.includes(n)).slice(0, 2);

  const bandText =
    n < 40
      ? `${sizeLabel(n)} group like this fits in a house, a private dining room or a small venue. With only ${banq ? banq.tables : theater!.rows} ${banq ? "tables" : "rows"}, one delivery and a two-person crew can usually set the room quickly, and a statement chair style is affordable because the total quantity is small.`
      : n < 120
        ? `${sizeLabel(n)} party is the sweet spot for most restaurants, hotel salons and barn venues. At ${banq ? `${banq.tables} tables` : `${theater!.rows} rows`} the layout is simple, but placement of the head table, bar and entrances still decides whether the room feels open or crowded.`
        : n < 250
          ? `${sizeLabel(n)} event needs a full ballroom or tent. With ${chairsN} chairs, delivery windows, elevator access and setup time stop being details: ask the venue when the room is available and how long load-in is allowed.`
          : `${sizeLabel(n)} event with ${chairsN} chairs is a logistics project. Expect multiple trucks, a larger setup crew, a hard load-in window and a floor plan the venue has approved in writing. Start the conversation with the venue and us several months ahead.`;

  const visual = banq ? (
    <BanquetDiagram
      layout={banq}
      title={`Floor plan: ${ev.name.toLowerCase()} for ${n} guests`}
      desc={`Top-down floor plan of ${banq.tables} round tables of ${ev.perTable} seats${ev.dance ? " with a dance floor" : ""} in a room of about ${banq.W} by ${banq.L} feet.`}
    />
  ) : (
    <TheaterDiagram
      layout={theater!}
      title={`Ceremony seating plan for ${n} guests`}
      desc={`Top-down plan of ${theater!.rows} rows of up to ${theater!.seatsPerRow} chairs with a ${theater!.aisle} foot center aisle facing the altar in a space of about ${theater!.W} by ${theater!.L} feet.`}
    />
  );

  const visualAlt = banq
    ? `Floor plan diagram showing ${banq.tables} round tables of ${ev.perTable} chairs for a ${ev.name.toLowerCase()} of ${n} guests, in a room of about ${banq.W} by ${banq.L} feet.`
    : `Ceremony seating diagram showing ${theater!.rows} rows of chairs with a center aisle for ${n} guests.`;

  return {
    path: `/seating-layouts/${slug}`,
    crumbs: [
      { name: "Seating layouts", href: "/seating-layouts" },
      { name: `${ev.name}, ${n} guests`, href: `/seating-layouts/${slug}` },
    ],
    eyebrow: `${ev.name} · ${n} guests`,
    title,
    description: `How many chairs, tables and square feet for ${ev.noun} with ${n} guests: ${chairsN} chairs${banq ? `, ${banq.tables} tables of ${ev.perTable}` : `, ${theater!.rows} rows`}, a to-scale floor plan and a Chicago-area price estimate.`,
    intro: `${ev.focus} This guide works out the exact chair count, table count and floor space for ${n} guests, then shows the layout to scale.`,
    quick: { q: `How many chairs for ${ev.noun} with ${n} guests?`, a: quickA },
    visual,
    visualCaption: `To-scale plan for ${n} guests. ${banq ? "Gold dots are chairs; circles are 60 inch rounds." : "Gold rectangles are ceremony chairs."} The room shown is the minimum clear space, before ${ev.extras[0].name.toLowerCase()} and other items.`,
    visualAlt,
    visual2: (
      <BarChart
        title={`Estimated chair rental cost for ${chairsN} chairs`}
        desc={`Bar chart comparing the estimated rental cost midpoint of ${chairsN} chairs in three recommended styles.`}
        bars={costRows.map(({ c, lo, hi }, i) => ({ label: c.name.replace(/ (Chair|Vineyard Chair)$/, ""), value: (lo + hi) / 2, display: `${usd(lo)}–${usd(hi)}`, highlight: i === 0 }))}
      />
    ),
    visual2Caption: `Estimated rental for ${chairsN} chairs by style, from our per-chair estimates. Delivery, setup and linens are quoted separately.`,
    sections: [
      {
        h: `Your numbers for ${n} guests`,
        body: (
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Chairs to order:</strong> {chairsN} ({n} guests + {spare} spare)</li>
            {banq && <li><strong>Tables:</strong> {banq.tables} rounds of {ev.perTable} ({banq.cols} across × {banq.rows} deep)</li>}
            {theater && <li><strong>Rows:</strong> {theater.rows} rows of up to {theater.seatsPerRow}, {theater.aisle} ft center aisle</li>}
            <li><strong>Seating floor space:</strong> about {baseSqft.toLocaleString("en-US")} sq ft ({(theater ?? banq)!.W} ft × {(theater ?? banq)!.L} ft)</li>
            {ev.extras.map((x) => (
              <li key={x.name}><strong>{x.name}:</strong> add about {x.sqft} sq ft</li>
            ))}
            <li><strong>Suggested total room:</strong> about {totalSqft.toLocaleString("en-US")} sq ft before aisles and the venue&apos;s own limits</li>
          </ul>
        ),
      },
      { h: `What changes at ${n} guests`, body: <p>{bandText.charAt(0).toUpperCase() + bandText.slice(1)}</p> },
      { h: `Planning ${ev.noun}`, body: <>{ev.notes.map((t) => <p key={t}>{t}</p>)}</> },
      {
        h: "Mistakes to avoid",
        body: (
          <ul className="list-disc space-y-2 pl-5">
            {ev.pitfalls.map((t) => <li key={t}>{t}</li>)}
          </ul>
        ),
      },
      {
        h: `Chairs we would shortlist for ${n} guests`,
        body: (
          <div className="not-prose grid gap-6 sm:grid-cols-3">
            {costRows.map(({ c, lo, hi }) => (
              <a key={c.slug} href={`/chairs/${c.slug}`} className="block">
                <ChairArt chair={c} className="aspect-[4/5] rounded-lg" />
                <p className="mt-3 font-serif text-lg">{c.name}</p>
                <p className="text-sm text-muted">{c.estPrice} per chair · {usd(lo)}–{usd(hi)} for {chairsN}</p>
              </a>
            ))}
          </div>
        ),
      },
    ],
    faqs: [
      ...ev.faqs.map((f) => ({ q: fill(f.q, vars), a: fill(f.a, vars) })),
      { q: "Is this the venue's maximum capacity?", a: "No. This is a planning estimate of clear floor space. The venue's posted capacity, fire code, exits and any permits always take precedence, so check with the venue before you commit." },
      { q: `How much will ${chairsN} chairs cost?`, a: `Based on our current estimates, ${usd(costRows[0].lo)} to ${usd(costRows[0].hi)} for the ${costRows[0].c.name}. Final pricing, delivery and setup are confirmed in your quote, and deliveries begin ${site.launch.firstEventDate}.` },
    ],
    related: [
      ...(prev ? [{ href: `/seating-layouts/${layoutSlug(ev, prev)}`, label: `${ev.name} for ${prev} guests` }] : []),
      ...(next ? [{ href: `/seating-layouts/${layoutSlug(ev, next)}`, label: `${ev.name} for ${next} guests` }] : []),
      ...others.map((o) => ({ href: `/seating-layouts/${layoutSlug(o, n)}`, label: `${o.name} for ${n} guests` })),
      { href: `/chair-fit/${recs[0].slug}-for-${ev.slug}`, label: `${recs[0].name} for ${ev.name.toLowerCase()}` },
      { href: "/seating-layouts", label: "All seating layouts" },
      { href: "/seating-planner", label: "Free seating planner" },
    ],
    source: `layout-${ev.slug}`,
  };
}

export const layoutsFamily: GuideFamily = {
  key: "layouts",
  hubFaqs: [
    { q: "How much space do I need per guest for a seated dinner?", a: "Plan about 10-12 square feet per guest for a seated dinner at round tables, plus extra for a dance floor (about 3-4 square feet per dancing guest), a head table, bars and buffets. Each layout guide works this out for its exact guest count." },
    { q: "Round or long tables: which seats more people?", a: "Long banquet or farm tables seat more people in the same room because there is less dead space between tables. Rounds are easier for conversation and service. A 60-inch round seats 8-10; an 8-foot banquet table seats 8, or 10 with one guest at each end." },
    { q: "How many extra chairs should I rent?", a: "Add 3-5% spare chairs for seated dinners and about 5-10% for ceremonies, so late RSVPs, vendors and the officiant always have a seat." },
  ],
  base: "/seating-layouts",
  hubTitle: "Seating Layouts by Event Type and Guest Count",
  hubDescription: "To-scale floor plans, chair counts, table counts and room sizes for weddings, galas, corporate dinners, parties and more, from 12 to 500 guests.",
  slugs: () => seatingEvents.flatMap((e) => e.counts.map((n) => layoutSlug(e, n))),
  build: buildLayout,
  label: (slug) => {
    const p = parseLayout(slug)!;
    return { label: `${p.ev.name}, ${p.n} guests` };
  },
};

/* ------------------------------------------------------------- room sizes */
const ROOM_W = [15, 20, 24, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100];
const ROOM_L = [20, 24, 30, 36, 40, 50, 60, 70, 80, 100, 120, 150];
const allRooms: [number, number][] = ROOM_W.flatMap((w) =>
  ROOM_L.filter((l) => l >= w && l / w <= 2.5 && w * l >= 450 && w * l <= 9000).map((l) => [w, l] as [number, number]),
).filter(([w, l]) => roomCapacity(w, l).banquetTables >= 2);
// Keep only rooms whose capacity profile is distinct, so every page adds a different answer.
export const roomSizes: [number, number][] = [...allRooms]
  .sort((a, b) => a[0] * a[1] - b[0] * b[1])
  .reduce<{ kept: [number, number][]; seen: Set<string> }>(
    (acc, r) => {
      const c = roomCapacity(r[0], r[1]);
      const sig = `${c.banquetTables}-${c.theaterSeats}-${c.danceTables}`;
      const last = acc.kept[acc.kept.length - 1];
      if (acc.seen.has(sig) || (last && (r[0] * r[1]) / (last[0] * last[1]) < 1.06)) return acc;
      acc.seen.add(sig);
      acc.kept.push(r);
      return acc;
    },
    { kept: [], seen: new Set() },
  ).kept;
const roomSlug = (w: number, l: number) => `${w}x${l}-ft-room`;
function parseRoom(slug: string): [number, number] | null {
  const m = slug.match(/^(\d+)x(\d+)-ft-room$/);
  if (!m) return null;
  const w = Number(m[1]);
  const l = Number(m[2]);
  return roomSizes.some(([a, b]) => a === w && b === l) ? [w, l] : null;
}

function buildRoom(slug: string): GuideProps | null {
  const r = parseRoom(slug);
  if (!r) return null;
  const [W, L] = r;
  const c = roomCapacity(W, L);
  const fitsEvents = seatingEvents
    .map((e) => {
      const ns = e.counts.filter((n) => (e.kind === "banquet" ? banquetLayout(n, e.perTable, e.dance).sqft : theaterLayout(n).sqft) <= c.sqft * 0.95);
      return ns.length ? { e, n: ns[ns.length - 1] } : null;
    })
    .filter((x): x is { e: SeatingEvent; n: number } => !!x);
  const layout = {
    guests: c.banquetSeats, perTable: 8, tables: c.banquetTables, cols: c.banquetCols, rows: c.banquetRows,
    W, L, tableBlockL: L, danceDepth: 0, sqft: W * L,
  };
  const acres = c.sqft;
  const near = roomSizes.filter(([w, l]) => (w !== W || l !== L)).sort((a, b) => Math.abs(a[0] * a[1] - acres) - Math.abs(b[0] * b[1] - acres)).slice(0, 3);
  const title = `How Many Chairs Fit in a ${W} x ${L} ft Room?`;
  return {
    path: `/room-size-guides/${slug}`,
    crumbs: [{ name: "Room size guides", href: "/room-size-guides" }, { name: `${W} × ${L} ft`, href: `/room-size-guides/${slug}` }],
    eyebrow: `${W} × ${L} ft room · ${c.sqft.toLocaleString("en-US")} sq ft`,
    title,
    description: `A ${W} by ${L} ft room (${c.sqft.toLocaleString("en-US")} sq ft) seats about ${c.banquetSeats} at round tables, ${c.theaterSeats} ceremony-style and ${c.cocktail} for cocktails. See the to-scale layout and which events fit.`,
    intro: `Rooms are measured in feet, but events are planned in chairs. Here is what a ${W} by ${L} ft room really holds in each setup, using standard 60 inch rounds, 18 inch ceremony chairs and 4 ft wall margins.`,
    quick: {
      q: `How many people fit in a ${W} x ${L} ft room?`,
      a: `About ${c.banquetSeats} seated at ${c.banquetTables} round tables of 8 (${c.danceSeats} if you also want a dance floor), ${c.theaterSeats} in ceremony-style rows, ${c.classroomSeats} classroom-style and ${c.cocktail} standing for a cocktail reception. The venue's posted capacity may be lower.`,
    },
    visual: (
      <BanquetDiagram
        layout={layout}
        title={`${W} by ${L} foot room with ${c.banquetTables} round tables`}
        desc={`To-scale plan showing ${c.banquetTables} round tables of 8 seats (${c.banquetSeats} seats) in a ${W} by ${L} foot room.`}
      />
    ),
    visualCaption: `${c.banquetTables} rounds of 8 in a ${W} × ${L} ft room, to scale, no dance floor.`,
    visualAlt: `Floor plan diagram of ${c.banquetTables} round tables seating ${c.banquetSeats} in a ${W} by ${L} foot room.`,
    visual2: (
      <BarChart
        title={`Capacity of a ${W} x ${L} ft room by setup`}
        desc={`Bar chart: banquet ${c.banquetSeats}, banquet with dance floor ${c.danceSeats}, ceremony ${c.theaterSeats}, classroom ${c.classroomSeats}, cocktail ${c.cocktail}.`}
        bars={[
          { label: "Cocktail (standing)", value: c.cocktail },
          { label: "Ceremony rows", value: c.theaterSeats },
          { label: "Banquet rounds of 8", value: c.banquetSeats, highlight: true },
          { label: "Banquet + dance floor", value: c.danceSeats },
          { label: "Classroom", value: c.classroomSeats },
        ]}
      />
    ),
    visual2Caption: "People who fit by setup. These are planning figures, not posted capacities.",
    sections: [
      {
        h: "Capacity by setup",
        body: (
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Banquet rounds:</strong> {c.banquetCols} across × {c.banquetRows} deep = {c.banquetTables} tables, {c.banquetSeats} seats</li>
            <li><strong>Banquet with a dance floor</strong> (about {c.danceFloorSqft} sq ft): {c.danceTables} tables, {c.danceSeats} seats</li>
            <li><strong>Ceremony rows:</strong> {c.theaterRows} rows of {c.theaterPerRow}, {c.theaterSeats} seats, with an 8 ft front zone</li>
            <li><strong>Classroom tables:</strong> {c.classroomSeats} seats at 6 ft tables</li>
            <li><strong>Standing cocktail:</strong> about {c.cocktail} guests at roughly 8 sq ft each</li>
          </ul>
        ),
      },
      {
        h: "Which events fit in this room",
        body: (
          <>
            <p>These are the largest guest counts from our layout guides whose seating floor space fits in {c.sqft.toLocaleString("en-US")} sq ft, before bars, buffets and stages:</p>
            <ul className="list-disc space-y-1 pl-5">
              {fitsEvents.map(({ e, n }) => (
                <li key={e.slug}>
                  <a className="underline" href={`/seating-layouts/${layoutSlug(e, n)}`}>{e.name}: up to {n} guests</a>
                </li>
              ))}
            </ul>
          </>
        ),
      },
      {
        h: "How to use these numbers",
        body: (
          <>
            <p>Measure usable floor, not wall to wall. Columns, built-in bars, stage areas and exits shrink the clear space, and many venues set a maximum guest count below the geometric limit.</p>
            <p>If your guest count is near the capacity of one setup, step down a size. A banquet room that technically seats {c.banquetSeats} feels tight to servers and guests; most planners leave breathing room by planning below the maximum.</p>
            <p>Ceremony rows fit more people than tables, which is why many venues hold the ceremony and dinner in different spaces or flip one room. A flip needs a cocktail-hour window.</p>
          </>
        ),
      },
    ],
    faqs: [
      { q: `How many round tables fit in ${W} x ${L} ft?`, a: `About ${c.banquetTables} sixty-inch rounds with chairs and service aisles (${c.banquetCols} across by ${c.banquetRows} deep), using an 11 ft grid and 4 ft wall margins.` },
      { q: "Does this include a dance floor, bar or stage?", a: `Not in the main banquet number. With a dance floor taking about 30 percent of the length, capacity drops to ${c.danceTables} tables (${c.danceSeats} seats). Bars, buffets and stages need extra square footage on top.` },
      { q: "Is this the legal capacity?", a: "No. Legal occupancy is set by the building and fire marshal, and many venues set a lower contractual maximum. Always use their number as the cap." },
    ],
    related: [
      ...near.map(([w, l]) => ({ href: `/room-size-guides/${roomSlug(w, l)}`, label: `${w} × ${l} ft room` })),
      ...fitsEvents.slice(0, 2).map(({ e, n }) => ({ href: `/seating-layouts/${layoutSlug(e, n)}`, label: `${e.name}, ${n} guests` })),
      { href: "/room-size-guides", label: "All room size guides" },
    ],
    source: `room-${W}x${L}`,
  };
}

export const roomsFamily: GuideFamily = {
  key: "rooms",
  hubFaqs: [
    { q: "How many people fit in a room at round tables?", a: "Divide the usable floor area by 10-12 square feet per guest. For example, a 40 x 60 foot room (2,400 sq ft) seats about 200-240 at rounds before you take out space for a dance floor, bars and a stage." },
    { q: "How much space does ceremony or theater seating need?", a: "Theater rows need about 6-8 square feet per guest, including a center aisle at least 4-6 feet wide. That is why the same room holds roughly twice as many guests for a ceremony as for dinner." },
    { q: "How much space does a standing cocktail reception need?", a: "Plan about 6-8 square feet per guest for a standing reception, with highboy tables for about a third of guests and some lounge or perch seating for older guests." },
  ],
  base: "/room-size-guides",
  hubTitle: "How Many Chairs Fit in My Room? Room Size Guides",
  hubDescription: "Look up your room's dimensions to see how many people fit at round tables, in ceremony rows, classroom style and at a standing cocktail reception.",
  slugs: () => roomSizes.map(([w, l]) => roomSlug(w, l)),
  build: buildRoom,
  label: (s) => {
    const [w, l] = parseRoom(s)!;
    const c = roomCapacity(w, l);
    return { label: `${w} × ${l} ft`, note: `${c.banquetSeats} at tables · ${c.theaterSeats} ceremony` };
  },
};

/* ------------------------------------------------------------ comparisons */
const comparable = chairs.filter((c) => !c.estPrice.includes("pair"));
const pairs = comparable.flatMap((a, i) => comparable.slice(i + 1).map((b) => [a, b] as const));
const pairSlug = (a: Chair, b: Chair) => `${a.slug}-vs-${b.slug}`;
const midOf = (c: Chair) => {
  const r = priceRange(c);
  return (r.low + r.high) / 2;
};
const short = (c: Chair) => c.name.replace(/ Chair$/, "").replace(/ Vineyard$/, "");

function buildCompare(slug: string): GuideProps | null {
  const pr = pairs.find(([a, b]) => pairSlug(a, b) === slug);
  if (!pr) return null;
  const [a, b] = pr;
  const ra = priceRange(a);
  const rb = priceRange(b);
  const cheaper = midOf(a) <= midOf(b) ? a : b;
  const dearer = cheaper === a ? b : a;
  const diff100 = Math.abs(midOf(a) - midOf(b)) * 100;
  const sharedStyles = a.styles.filter((s) => b.styles.includes(s));
  const rows: [string, string, string][] = [
    ["Estimated price", `${a.estPrice} per chair`, `${b.estPrice} per chair`],
    ["Styles", a.styles.join(", "), b.styles.join(", ")],
    ["Best for", a.uses.join(", "), b.uses.join(", ")],
    ["Cushion", a.cushion, b.cushion],
    ["Stackable", a.stackable ? "Yes" : "No", b.stackable ? "Yes" : "No"],
    ["Outdoor friendly", a.outdoorFriendly ? "Yes" : "Indoor or tented", b.outdoorFriendly ? "Yes" : "Indoor or tented"],
  ];
  const reasons = (c: Chair, o: Chair) => {
    const r: string[] = [];
    if (midOf(c) < midOf(o)) r.push(`your budget matters: about ${usd(Math.abs(midOf(c) - midOf(o)) * 100)} less per 100 chairs`);
    if (c.outdoorFriendly && !o.outdoorFriendly) r.push("you are outdoors or under a tent");
    if (c.stackable && !o.stackable) r.push("fast setup and teardown matters, because it stacks");
    if (c.cushion !== "None" && o.cushion === "None") r.push(c.cushion === "Included" ? "guests will sit for a long program, since a cushion is included" : "comfort matters (a cushion is available)");
    const onlyStyles = c.styles.filter((s) => !o.styles.includes(s));
    if (onlyStyles.length) r.push(`you want a ${onlyStyles.join(" or ").toLowerCase()} look`);
    const onlyUses = c.uses.filter((u) => !o.uses.includes(u));
    if (onlyUses.length) r.push(`it is for the ${onlyUses.join(" or ").toLowerCase()}`);
    if (!r.length) r.push(`you prefer its look: ${c.tagline.toLowerCase()}`);
    return r;
  };
  const verdictOutdoor = a.outdoorFriendly === b.outdoorFriendly ? (a.outdoorFriendly ? "Both handle outdoor events." : "Neither is ideal outdoors; plan a tent or indoor space.") : `${(a.outdoorFriendly ? a : b).name} is the outdoor-friendly one.`;
  const title = `${short(a)} vs ${short(b)}: Which Chair to Rent?`;
  return {
    path: `/chair-comparisons/${slug}`,
    crumbs: [{ name: "Chair comparisons", href: "/chair-comparisons" }, { name: `${short(a)} vs ${short(b)}`, href: `/chair-comparisons/${slug}` }],
    eyebrow: "Chair comparison",
    title,
    description: `${a.name} (${a.estPrice}) vs ${b.name} (${b.estPrice}): price, comfort, outdoor use and best events side by side, with a cost example for 100 chairs.`,
    intro: `${a.name} is ${a.tagline.toLowerCase()}. ${b.name} is ${b.tagline.toLowerCase()}. Here is how they compare on cost, comfort, weather and where each looks best.`,
    quick: {
      q: `${short(a)} or ${short(b)}: which should I rent?`,
      a: `${cheaper.name} costs less (about ${usd(diff100)} less per 100 chairs than the ${dearer.name}). ${verdictOutdoor} ${sharedStyles.length ? `Both suit ${sharedStyles.join(" and ").toLowerCase()} looks, so the choice comes down to budget, comfort and logistics.` : "They suit different looks, so decide the look first and the price second."}`,
    },
    visual: (
      <div className="grid grid-cols-2 gap-4">
        <figure>
          <ChairArt chair={a} className="aspect-[4/5] rounded-lg" />
          <figcaption className="mt-2 text-center text-sm">{a.name}</figcaption>
        </figure>
        <figure>
          <ChairArt chair={b} className="aspect-[4/5] rounded-lg" />
          <figcaption className="mt-2 text-center text-sm">{b.name}</figcaption>
        </figure>
      </div>
    ),
    visualCaption: `Side by side: the ${a.name} (left) and the ${b.name} (right).`,
    visualAlt: `Side-by-side images of the ${a.name} and the ${b.name} event chairs.`,
    visual2: (
      <BarChart
        title={`Estimated rental cost for 100 chairs: ${short(a)} vs ${short(b)}`}
        desc={`Bar chart: ${a.name} ${usd(ra.low * 100)} to ${usd(ra.high * 100)}; ${b.name} ${usd(rb.low * 100)} to ${usd(rb.high * 100)} for 100 chairs.`}
        bars={[
          { label: short(a), value: midOf(a) * 100, display: `${usd(ra.low * 100)}–${usd(ra.high * 100)}`, highlight: cheaper === a },
          { label: short(b), value: midOf(b) * 100, display: `${usd(rb.low * 100)}–${usd(rb.high * 100)}`, highlight: cheaper === b },
        ]}
      />
    ),
    visual2Caption: "Estimated rental for 100 chairs, from our per-chair estimates. Delivery and setup are quoted separately.",
    sections: [
      {
        h: "Side by side",
        body: (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-2 pr-3 font-normal text-muted" scope="col">Feature</th>
                  <th className="py-2 pr-3" scope="col">{short(a)}</th>
                  <th className="py-2" scope="col">{short(b)}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, x, y]) => (
                  <tr key={k} className="border-b border-line align-top">
                    <th className="py-2 pr-3 text-left font-normal text-muted" scope="row">{k}</th>
                    <td className="py-2 pr-3">{x}</td>
                    <td className="py-2">{y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      },
      {
        h: `Choose the ${short(a)} if…`,
        body: <ul className="list-disc space-y-1 pl-5">{reasons(a, b).map((t) => <li key={t}>{t}</li>)}</ul>,
      },
      {
        h: `Choose the ${short(b)} if…`,
        body: <ul className="list-disc space-y-1 pl-5">{reasons(b, a).map((t) => <li key={t}>{t}</li>)}</ul>,
      },
      {
        h: "What each looks like with the table",
        body: (
          <>
            <p><strong>{a.name}:</strong> pairs with {a.pairsWith.toLowerCase()}.</p>
            <p><strong>{b.name}:</strong> pairs with {b.pairsWith.toLowerCase()}.</p>
            <p>You can also mix them: use the more decorative chair at the head table and the lower-cost one for guests. That keeps the room photo-ready without paying premium rates on every seat.</p>
          </>
        ),
      },
    ],
    faqs: [
      { q: `Which is cheaper, the ${short(a)} or the ${short(b)}?`, a: `The ${cheaper.name} (${cheaper.estPrice} per chair, estimated) costs less than the ${dearer.name} (${dearer.estPrice}). For 100 chairs the midpoint difference is about ${usd(diff100)}.` },
      { q: "Which is better outdoors?", a: verdictOutdoor + " Ask about ground protection on soft lawn." },
      { q: "Can I use both in the same room?", a: "Yes. Mixed sets are common, for example one style at the head table and another at guest tables. We will help you balance the look and budget on a free call." },
    ],
    related: [
      { href: `/chairs/${a.slug}`, label: `${a.name}` },
      { href: `/chairs/${b.slug}`, label: `${b.name}` },
      { href: `/chair-rental-cost/${a.slug}-100-chairs`, label: `${short(a)} cost for 100 chairs` },
      { href: `/chair-rental-cost/${b.slug}-100-chairs`, label: `${short(b)} cost for 100 chairs` },
      { href: "/chair-comparisons", label: "All chair comparisons" },
    ],
    source: `compare-${a.slug}-${b.slug}`,
  };
}

export const compareFamily: GuideFamily = {
  key: "compare",
  hubFaqs: [
    { q: "What is the most popular wedding chair to rent in Chicago?", a: "Chiavari chairs are still the most requested for ballrooms, while cross-back and other wood chairs are the favorite for barns, vineyards and lofts. Ghost chairs suit modern venues where you want the decor to stand out." },
    { q: "Which rental chairs are the most comfortable?", a: "Padded and upholstered chairs (velvet dining, padded folding and chairs with seat cushions) are the most comfortable for long dinners. Chiavari and cross-back chairs are comfortable for 2-3 hours with a seat pad." },
    { q: "Which chairs are best for outdoor events?", a: "Resin, metal and wood folding chairs handle grass and weather best. Avoid upholstered chairs outdoors unless you have a tent, and add floor or plywood under thin legs on soft lawns." },
  ],
  base: "/chair-comparisons",
  hubTitle: "Event Chair Comparisons: Which Chair Should You Rent?",
  hubDescription: "Side-by-side comparisons of every chair in our collection: price, comfort, outdoor use, stacking and the events each suits best.",
  slugs: () => pairs.map(([a, b]) => pairSlug(a, b)),
  build: buildCompare,
  label: (s) => {
    const [a, b] = pairs.find(([x, y]) => pairSlug(x, y) === s)!;
    return { label: `${short(a)} vs ${short(b)}` };
  },
};

/* ------------------------------------------------------------------- cost */
const QTYS = [50, 100, 200];
const costSlug = (c: Chair, n: number) => `${c.slug}-${n}-chairs`;
function parseCost(slug: string) {
  const m = slug.match(/^(.+)-(\d+)-chairs$/);
  if (!m) return null;
  const c = comparable.find((x) => x.slug === m[1]);
  const n = Number(m[2]);
  return c && QTYS.includes(n) ? { c, n } : null;
}
function buildCost(slug: string): GuideProps | null {
  const p = parseCost(slug);
  if (!p) return null;
  const { c, n } = p;
  const r = priceRange(c);
  const lo = r.low * n;
  const hi = r.high * n;
  const base = getChair("garden-folding")!;
  const rb = priceRange(base);
  const saveVsFancy = (r.low + r.high) / 2 - (rb.low + rb.high) / 2;
  const guestsText = n <= 50 ? "a small wedding, shower or dinner" : n <= 100 ? "a mid-size wedding or party" : "a large wedding, gala or corporate event";
  return {
    path: `/chair-rental-cost/${slug}`,
    crumbs: [{ name: "Chair rental cost", href: "/chair-rental-cost" }, { name: `${short(c)} × ${n}`, href: `/chair-rental-cost/${slug}` }],
    eyebrow: `${short(c)} · ${n} chairs`,
    title: `${short(c)} Chair Rental Cost: ${n} Chairs in Chicago`,
    description: `Estimated cost to rent ${n} ${c.name}s: ${usd(lo)} to ${usd(hi)} (${c.estPrice} each), plus what affects the final quote, with a price ladder from 50 to 200 chairs.`,
    intro: `Renting ${n} ${c.name.toLowerCase()}s suits ${guestsText}. Here is the estimated cost, how it scales with quantity and what is quoted separately.`,
    quick: {
      q: `How much does it cost to rent ${n} ${short(c).toLowerCase()} chairs?`,
      a: `Our current estimate is ${usd(lo)} to ${usd(hi)} for ${n} chairs (${c.estPrice} each, about ${usd((lo + hi) / 2 / n)} per chair at the midpoint). Delivery, setup, pickup and any linens or cushions are quoted separately, and we confirm final pricing in your personal quote.`,
    },
    visual: (
      <div className="grid items-center gap-6 sm:grid-cols-[1fr_1.2fr]">
        <ChairArt chair={c} className="aspect-[4/5] rounded-lg" />
        <BarChart
          title={`Estimated cost of the ${c.name} by quantity`}
          desc={`Bar chart of estimated rental cost midpoint for ${QTYS.join(", ")} ${c.name}s.`}
          bars={QTYS.map((q) => ({ label: `${q} chairs`, value: q * (r.low + r.high) / 2, display: `${usd(q * r.low)}–${usd(q * r.high)}`, highlight: q === n }))}
        />
      </div>
    ),
    visualCaption: `The ${c.name} and its estimated price ladder. The highlighted bar is ${n} chairs.`,
    visualAlt: `Image of the ${c.name} next to a bar chart of its estimated rental cost for 50 to 200 chairs.`,
    sections: [
      {
        h: "What drives the final number",
        body: (
          <>
            <p>The chair itself is only part of the bill. A quote also depends on delivery distance in the Chicago area, whether setup and pickup are included, the day of the week, how many floors the crew carries chairs up, and any cushions, covers or sashes you add.</p>
            <p>Our figure uses a per-chair estimate of {c.estPrice}. It is an estimate until pricing is final, not an offer.</p>
          </>
        ),
      },
      {
        h: "How to lower the total",
        body: (
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Use the {c.name} where guests see it most (reception or head table) and our {base.name.toLowerCase()} ({base.estPrice}) for a ceremony. For {n} chairs the midpoint swing is about {usd(Math.max(0, saveVsFancy) * n)}.
            </li>
            <li>Order to a confirmed count plus a small spare, not the full invite list.</li>
            <li>{c.stackable ? "It stacks, which can speed setup and teardown." : "It does not stack, so allow extra setup time."} {c.outdoorFriendly ? "It is outdoor friendly." : "Plan indoor or tented use."}</li>
          </ul>
        ),
      },
      {
        h: `Events that need about ${n} chairs`,
        body: (
          <>
            <p>These guest counts from our layout guides land close to {n} chairs once a spare allowance is added, so the figure above is a realistic budget for them:</p>
            <ul className="list-disc space-y-1 pl-5">
              {seatingEvents.flatMap((e) => e.counts.map((g) => ({ e, g, ch: Math.ceil(g * (1 + e.sparePct / 100)) })))
                .filter((x) => Math.abs(x.ch - n) <= n * 0.12)
                .slice(0, 8)
                .map((x) => (
                  <li key={x.e.slug + x.g}>
                    <a className="underline" href={`/seating-layouts/${x.e.slug}-${x.g}-guests`}>{x.e.name}, {x.g} guests</a>: {x.ch} chairs, {usd(x.ch * r.low)} to {usd(x.ch * r.high)}
                  </li>
                ))}
            </ul>
            <p>{n <= 50 ? "At this size a single van or small truck and a two-person crew is typical, and a statement style costs little in total." : n <= 100 ? "At this size expect a truck delivery, a short setup crew and a need to agree load-in times with the venue." : "At this size treat delivery as a project: multiple crew members, a firm load-in window and a venue-approved floor plan."}</p>
          </>
        ),
      },
      { h: `About the ${c.name}`, body: <p>{c.description}</p> },
    ],
    faqs: [
      { q: `Is ${usd(lo)}–${usd(hi)} the full price for ${n} chairs?`, a: "It is our estimate for the chairs only. Delivery, setup, pickup, cushions and linens are quoted separately in your personal quote." },
      { q: "Is there a discount for larger orders?", a: "We have not published volume pricing yet. Ask on a free call and we will include any available discount in your quote." },
      { q: "When do deliveries start?", a: `Our first deliveries begin ${site.launch.firstEventDate}. You can request a quote now for events after that date.` },
    ],
    related: [
      ...QTYS.filter((q) => q !== n).slice(0, 3).map((q) => ({ href: `/chair-rental-cost/${costSlug(c, q)}`, label: `${short(c)} × ${q} chairs` })),
      { href: `/chairs/${c.slug}`, label: c.name },
      { href: "/chair-rental-cost", label: "All chair rental cost guides" },
    ],
    source: `cost-${c.slug}`,
  };
}
export const costFamily: GuideFamily = {
  key: "cost",
  hubFaqs: [
    { q: "How much does it cost to rent chairs in Chicago?", a: "Basic folding chairs rent for about $2-4 each, Chiavari and cross-back chairs for about $7-11, and ghost or upholstered chairs for about $10-30 per event day. Delivery, setup and pickup are quoted separately for your venue." },
    { q: "Is delivery included in the chair price?", a: "No. The per-chair price covers one event day. Delivery, setup, pickup, any stairs or long carries, a damage waiver and sales tax are itemized in your proposal before you approve anything." },
    { q: "How can I lower my chair rental cost?", a: "Use premium chairs only where guests see them most (ceremony aisle, head table) and simpler chairs elsewhere, book early for May-October weekends, and bundle chairs with tables and linens in one quote so delivery is shared." },
  ],
  base: "/chair-rental-cost",
  hubTitle: "Event Chair Rental Cost in Chicago: Price by Chair and Quantity",
  hubDescription: "Estimated rental cost for every chair style at 50, 100 and 200 chairs, with what is included and how to lower the total.",
  slugs: () => comparable.flatMap((c) => QTYS.map((q) => costSlug(c, q))),
  build: buildCost,
  label: (s) => {
    const p = parseCost(s)!;
    return { label: `${short(p.c)} × ${p.n}`, note: `${usd(priceRange(p.c).low * p.n)}–${usd(priceRange(p.c).high * p.n)}` };
  },
};

/* -------------------------------------------------------------------- fit */
const FIT_MIN = 5;
const fitPairs = comparable.flatMap((c) => seatingEvents.filter((e) => fitScore(c, e).score >= FIT_MIN).map((e) => [c, e] as const));
const fitSlug = (c: Chair, e: SeatingEvent) => `${c.slug}-for-${e.slug}`;
function buildFit(slug: string): GuideProps | null {
  const pr = fitPairs.find(([c, e]) => fitSlug(c, e) === slug);
  if (!pr) return null;
  const [c, e] = pr;
  const f = fitScore(c, e);
  const outcome = f.score >= 6 ? "Strong fit" : "Good fit";
  const rep = e.counts[Math.floor(e.counts.length / 2)];
  const reps = [e.counts[0], rep, e.counts[e.counts.length - 1]];
  const r = priceRange(c);
  const steps = [
    { label: `Does the style suit ${e.noun}?`, result: f.styleHits.length ? `Yes: ${f.styleHits.join(", ")}` : "Not a core match for this event's usual styles", pass: f.styleHits.length > 0 },
    { label: "Is it made for this part of the event?", result: f.useHits.length ? `Yes: good for ${f.useHits.join(", ").toLowerCase()}` : `Not listed for ${e.uses.join(" or ").toLowerCase()}`, pass: f.useHits.length > 0 },
    { label: e.outdoorLikely ? "Can it handle an outdoor or tented setting?" : "Is weather a factor?", result: e.outdoorLikely ? (c.outdoorFriendly ? "Yes, outdoor friendly" : "Indoor or tented only") : "Usually indoors, so weather is not the deciding factor", pass: e.outdoorLikely ? c.outdoorFriendly : null },
    { label: "Is it easy to set up and move?", result: c.stackable ? "Stackable: faster delivery, setup and flips" : "Does not stack: allow more setup time", pass: c.stackable },
    { label: "Is it comfortable for the length of the event?", result: c.cushion === "Included" ? "Cushion included" : c.cushion === "Optional" ? "Cushion available as an option" : "No cushion: best for shorter sittings", pass: c.cushion !== "None" },
  ];
  const title = `${short(c)} Chairs for a ${titleCase(e.name)}: Good Fit?`;
  return {
    path: `/chair-fit/${slug}`,
    crumbs: [{ name: "Chair fit guides", href: "/chair-fit" }, { name: `${short(c)} for ${e.name.toLowerCase()}`, href: `/chair-fit/${slug}` }],
    eyebrow: `${e.name} · ${short(c)}`,
    title,
    description: `Is the ${c.name} right for ${e.noun}? A 5-step fit check on style, use, weather, setup and comfort, plus estimated cost at ${reps.join(", ")} guests.`,
    intro: `${c.tagline}. Here is how the ${c.name} holds up for ${e.noun}, checked against what that event actually needs.`,
    quick: {
      q: `Is the ${short(c)} chair good for ${e.noun}?`,
      a: `${outcome}. It matches ${f.styleHits.length ? `the ${f.styleHits.join(" and ").toLowerCase()} styles` : "the event"} and ${f.useHits.length ? `works for the ${f.useHits.join(" and ").toLowerCase()}` : "is flexible"}. ${e.outdoorLikely ? (c.outdoorFriendly ? "It is outdoor friendly, which matters for this event." : "It is better indoors or in a tent.") : ""} At ${rep} guests, expect roughly ${usd(r.low * rep)} to ${usd(r.high * rep)} for the chairs.`,
    },
    visual: (
      <div className="grid items-start gap-6 sm:grid-cols-[0.45fr_1.6fr]">
        <ChairArt chair={c} className="aspect-[4/5] rounded-lg" />
        <Flowchart
          steps={steps}
          outcome={`${outcome} for ${e.name.toLowerCase()}`}
          title={`Fit check: ${c.name} for ${e.name.toLowerCase()}`}
          desc={`Flowchart with five checks (${steps.map((s) => s.label).join("; ")}) leading to the result: ${outcome}.`}
        />
      </div>
    ),
    visualCaption: `Five-step fit check for the ${c.name} at ${e.noun}.`,
    visualAlt: `Image of the ${c.name} beside a flowchart rating it a ${outcome.toLowerCase()} for ${e.noun}.`,
    sections: [
      {
        h: `Why it works for ${e.noun}`,
        body: (
          <>
            <p>{e.focus} {c.description}</p>
            <p>{e.notes[0]}</p>
          </>
        ),
      },
      {
        h: "What it costs at common guest counts",
        body: (
          <ul className="list-disc space-y-2 pl-5">
            {reps.map((n) => (
              <li key={n}>
                <a className="underline" href={`/seating-layouts/${e.slug}-${n}-guests`}>{n} guests</a>: about {Math.ceil(n * (1 + e.sparePct / 100))} chairs, {usd(r.low * Math.ceil(n * (1 + e.sparePct / 100)))} to {usd(r.high * Math.ceil(n * (1 + e.sparePct / 100)))}
              </li>
            ))}
          </ul>
        ),
      },
      {
        h: "What to watch for",
        body: (
          <>
            <ul className="list-disc space-y-2 pl-5">
              {steps.filter((s) => s.pass === false).map((s) => <li key={s.label}>{s.result}.</li>)}
              {steps.every((s) => s.pass !== false) && <li>No red flags in our five checks. Still confirm the finish and cushion options for your room.</li>}
              <li>{e.pitfalls[0]}</li>
            </ul>
          </>
        ),
      },
    ],
    faqs: [
      { q: `Can I mix the ${short(c)} with another chair at ${e.noun}?`, a: `Yes. Many hosts use it in the most visible spot and a lower-cost chair elsewhere. Pairs well with ${c.pairsWith.toLowerCase()}.` },
      { q: "Does it come in different finishes?", a: `Finishes: ${c.finishes.map((x) => x.name).join(", ")}.` },
      { q: "What if my venue has rules about chairs?", a: "Share the venue's rules with us on a free call. We will check the chair against them before you book." },
    ],
    related: [
      { href: `/chairs/${c.slug}`, label: c.name },
      { href: `/seating-layouts/${e.slug}-${rep}-guests`, label: `${e.name} seating for ${rep} guests` },
      { href: `/chair-rental-cost/${c.slug}-100-chairs`, label: `${short(c)} cost for 100 chairs` },
      ...fitPairs.filter(([x, y]) => y === e && x !== c).slice(0, 2).map(([x]) => ({ href: `/chair-fit/${fitSlug(x, e)}`, label: `${short(x)} for ${e.name.toLowerCase()}` })),
      { href: "/chair-fit", label: "All chair fit guides" },
    ],
    source: `fit-${c.slug}-${e.slug}`,
  };
}
export const fitFamily: GuideFamily = {
  key: "fit",
  hubFaqs: [
    { q: "How do I choose the right chair for my event?", a: "Start with the venue style, then check comfort for the length of the event, whether the chairs will be outside, how many fit around your tables and your budget. Each fit guide runs this 5-step check for one event and chair." },
    { q: "Can I mix chair styles at one event?", a: "Yes. A common approach is one style for guest tables and a statement chair for the head or sweetheart table. Keep the finishes in the same family (all gold, or all natural wood) so the room still looks planned." },
    { q: "Do I need different chairs for the ceremony and the reception?", a: "Not always. If both happen in the same space, one style flipped between them saves money. Use a second set only when the ceremony and reception run at the same time in different rooms." },
  ],
  base: "/chair-fit",
  hubTitle: "Which Chair Fits Your Event? Chair Fit Guides",
  hubDescription: "Find the right rental chair for weddings, galas, corporate dinners, parties and more, with a 5-step fit check for every pairing.",
  slugs: () => fitPairs.map(([c, e]) => fitSlug(c, e)),
  build: buildFit,
  label: (s) => {
    const [c, e] = fitPairs.find(([x, y]) => fitSlug(x, y) === s)!;
    return { label: `${short(c)} for ${e.name.toLowerCase()}` };
  },
};

/* ----------------------------------------------------------------- tables */
type TableDef = { slug: string; name: string; shape: "round" | "rect"; seatsMin: number; seatsMax: number; size: string; footprint: string; note: string; use: string };
const tableDefs: TableDef[] = [
  { slug: "48-inch-round", name: "48 inch round table", shape: "round", seatsMin: 4, seatsMax: 6, size: "4 ft across", footprint: "about 8 to 9 ft square with chairs", note: "Small rounds suit cocktail-style dining, kids' tables and tight rooms.", use: "intimate dinners, kids' tables and small rooms" },
  { slug: "60-inch-round", name: "60 inch round table", shape: "round", seatsMin: 8, seatsMax: 10, size: "5 ft across", footprint: "about 10 to 11 ft square with chairs", note: "The standard banquet table. Rounds of 8 are comfortable; 10 is the tight maximum.", use: "weddings, galas and most banquets" },
  { slug: "66-inch-round", name: "66 inch round table", shape: "round", seatsMin: 8, seatsMax: 10, size: "5.5 ft across", footprint: "about 11 to 12 ft square with chairs", note: "Gives a rounds-of-10 table a little more elbow room than the 60 inch.", use: "formal dinners with 10 per table" },
  { slug: "72-inch-round", name: "72 inch round table", shape: "round", seatsMin: 10, seatsMax: 12, size: "6 ft across", footprint: "about 12 to 13 ft square with chairs", note: "Seats 10 to 12 but can feel too wide for conversation across the center.", use: "large family tables and sponsor tables" },
  { slug: "6-foot-rectangular", name: "6 ft rectangular table", shape: "rect", seatsMin: 6, seatsMax: 8, size: "6 ft × 30 in", footprint: "about 10 ft × 8 ft with chairs", note: "Common for buffets, kids' tables and smaller family-style dinners.", use: "buffets, parties and family-style meals" },
  { slug: "8-foot-rectangular", name: "8 ft rectangular table", shape: "rect", seatsMin: 8, seatsMax: 10, size: "8 ft × 30 in", footprint: "about 12 ft × 8 ft with chairs", note: "The workhorse of long-table dinners, head tables and buffets.", use: "head tables, farm-style and long tables" },
  { slug: "8-foot-rectangular-banquet-18-inch", name: "8 ft × 18 in seminar table", shape: "rect", seatsMin: 3, seatsMax: 4, size: "8 ft × 18 in", footprint: "about 10 ft × 4 ft with chairs", note: "Narrow tables for classroom and conference seating, not for dinner.", use: "classroom or seminar seating" },
  { slug: "30-inch-cocktail", name: "30 inch cocktail table", shape: "round", seatsMin: 3, seatsMax: 4, size: "30 in across", footprint: "about 4 ft circle for standing guests", note: "Standing height tables for cocktail hours. Guests stand, so no chairs are needed unless you add a few bar stools.", use: "cocktail hours and mingling" },
  { slug: "36-inch-round", name: "36 inch round table", shape: "round", seatsMin: 3, seatsMax: 4, size: "3 ft across", footprint: "about 6 to 7 ft square with chairs", note: "Cafe-style tables for two to four, sweetheart tables and lounge areas.", use: "bistro seating and lounge areas" },
  { slug: "farm-table-10-foot", name: "10 ft farm table", shape: "rect", seatsMin: 10, seatsMax: 12, size: "10 ft × 36 in", footprint: "about 14 ft × 9 ft with chairs", note: "Wide tables seat more per side and suit family-style service and rustic looks.", use: "rustic and family-style dinners" },
  { slug: "sweetheart-table", name: "sweetheart table (2 seats)", shape: "rect", seatsMin: 2, seatsMax: 2, size: "about 4 to 5 ft", footprint: "about 6 ft × 5 ft with chairs", note: "A small table for the couple, usually with statement chairs and a floral backdrop.", use: "couples and honorees at the reception" },
  { slug: "head-table-12-guests", name: "long head table (10 to 12)", shape: "rect", seatsMin: 10, seatsMax: 12, size: "two 8 ft tables joined", footprint: "about 16 ft × 8 ft with chairs", note: "Seats the wedding party on one side so everyone faces the room.", use: "wedding party and speakers" },
];
function buildTable(slug: string): GuideProps | null {
  const t = tableDefs.find((x) => x.slug === slug);
  if (!t) return null;
  const seatsShow = t.seatsMax;
  const rep = t.seatsMin === t.seatsMax ? [2, 4, 8] : [20, 50, 100, 150].map((g) => g);
  const rows = rep.map((g) => ({ g, n: Math.ceil(g / t.seatsMin), nmax: Math.ceil(g / t.seatsMax) }));
  const rec = chairs.filter((c) => !c.estPrice.includes("pair")).slice(0, 3);
  return {
    path: `/table-seating-guides/${slug}`,
    crumbs: [{ name: "Table seating guides", href: "/table-seating-guides" }, { name: t.name, href: `/table-seating-guides/${slug}` }],
    eyebrow: `Table guide · ${t.size}`,
    title: `${t.name.charAt(0).toUpperCase() + t.name.slice(1)}: Seating & Floor Space`,
    description: `A ${t.name} (${t.size}) seats ${t.seatsMin === t.seatsMax ? t.seatsMin : `${t.seatsMin} to ${t.seatsMax}`}. See the diagram, floor footprint, and how many tables you need for 20 to 150 guests.`,
    intro: `${t.note} Here is what it seats, how much floor it takes and how many you need for your guest count.`,
    quick: {
      q: `How many chairs at a ${t.name}?`,
      a: `${t.seatsMin === t.seatsMax ? `${t.seatsMin} chairs.` : `${t.seatsMin} to ${t.seatsMax} chairs: ${t.seatsMin} is comfortable, ${t.seatsMax} is the tight maximum.`} Allow ${t.footprint}. Best for ${t.use}.`,
    },
    visual: (
      <div className="mx-auto max-w-md">
        <TableDiagram shape={t.shape} seats={seatsShow} label={t.size} title={`${t.name} with ${seatsShow} chairs`} desc={`Top-down diagram of a ${t.name} (${t.size}) with ${seatsShow} chairs around it.`} />
      </div>
    ),
    visualCaption: `A ${t.name} with ${seatsShow} chairs, the maximum.`,
    visualAlt: `Top-down diagram of a ${t.name} with ${seatsShow} chairs.`,
    visual2: (
      <div className="grid grid-cols-3 gap-3">
        {rec.map((c) => (
          <div key={c.slug}>
            <ChairArt chair={c} className="aspect-[4/5] rounded-lg" />
            <p className="mt-2 text-center text-xs">{short(c)}</p>
          </div>
        ))}
      </div>
    ),
    visual2Caption: "Chairs that pair with this table, from our collection.",
    sections: [
      {
        h: "How many tables do you need?",
        body: (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-2 pr-3 font-normal text-muted" scope="col">Guests</th>
                  <th className="py-2 pr-3" scope="col">Tables at {t.seatsMin} each</th>
                  <th className="py-2" scope="col">Tables at {t.seatsMax} each</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.g} className="border-b border-line">
                    <th className="py-2 pr-3 text-left font-normal" scope="row">{r.g}</th>
                    <td className="py-2 pr-3">{r.n}</td>
                    <td className="py-2">{r.nmax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      },
      { h: "Space and layout tips", body: <><p>Plan {t.footprint}. Leave service aisles of about 4 to 5 feet between tables so servers and guests can pass behind seated chairs.</p><p>The comfortable number is better than the maximum for plated service. Squeezing {t.seatsMax} guests around a table limits elbow room and slows service.</p></> },
    ],
    faqs: [
      { q: `How many people sit at a ${t.name}?`, a: `${t.seatsMin === t.seatsMax ? t.seatsMin : `${t.seatsMin} to ${t.seatsMax}`}. These are planning figures and depend on chair width and the style of service.` },
      { q: "Do you rent tables as well as chairs?", a: "Our focus is chairs. Ask on a free call about tables and linens; we will tell you what we offer or what to pair it with." },
      { q: "How much floor space does it need?", a: `Allow ${t.footprint}.` },
    ],
    related: [
      ...tableDefs.filter((x) => x.slug !== slug).slice(0, 3).map((x) => ({ href: `/table-seating-guides/${x.slug}`, label: x.name })),
      { href: "/seating-layouts/wedding-reception-100-guests", label: "Wedding reception layout for 100 guests" },
      { href: "/table-seating-guides", label: "All table guides" },
    ],
    source: `table-${t.slug}`,
  };
}
export const tablesFamily: GuideFamily = {
  key: "tables",
  hubFaqs: [
    { q: "How many people sit at a 60-inch round table?", a: "A 60-inch round seats 8 comfortably and 10 snugly. A 72-inch round seats 10-12. Use 120-inch round linens for 60-inch tables and 132-inch for 72-inch tables if you want them floor length." },
    { q: "How many people sit at an 8-foot banquet table?", a: "An 8-foot (96-inch) banquet table seats 8, four on each side, or 10 with one guest at each end. A 6-foot table seats 6, or 8 with the ends." },
    { q: "How many chairs fit at a cocktail table?", a: "Highboy cocktail tables are for standing and usually have no chairs. Low 30-inch cocktail tables seat 2-4. Plan one highboy per 8-10 standing guests." },
  ],
  base: "/table-seating-guides",
  hubTitle: "Table Seating Guides: How Many Chairs Per Table",
  hubDescription: "Seating capacity, floor footprint and table counts for round, rectangular, cocktail, farm and head tables.",
  slugs: () => tableDefs.map((t) => t.slug),
  build: buildTable,
  label: (s) => ({ label: tableDefs.find((t) => t.slug === s)!.name }),
};

/* ---------------------------------------------------------------- seasons */
const months = [
  { slug: "january", name: "January", lvl: 0, wx: "Deep winter. Cold, snow and ice are likely, and lake wind makes outdoor events impractical.", ev: "Indoor winter events: galas, corporate kickoffs and milestone birthdays.", tip: "Plan for delivery time around snow and salted entrances, and ask the venue about a coat check." },
  { slug: "february", name: "February", lvl: 0, wx: "Still winter, with cold snaps. Indoor venues only.", ev: "Engagement parties, fundraisers and Valentine's dinners.", tip: "Snow days can move deliveries, so avoid tight load-in windows." },
  { slug: "march", name: "March", lvl: 1, wx: "Unsettled: thaw, rain and the occasional late snow. Outdoor events remain risky.", ev: "Showers, graduations planning, corporate events and early spring parties.", tip: "Lawn and parking areas are often wet and soft, so ask about ground protection." },
  { slug: "april", name: "April", lvl: 2, wx: "Spring warms up, but rain and cool days are common. Tents or indoor backups are wise.", ev: "Early outdoor ceremonies, showers and rehearsal dinners.", tip: `Our first deliveries are planned for ${site.launch.firstEventDate}, which makes April the start of our founding season.` },
  { slug: "may", name: "May", lvl: 3, wx: "Mild and green, with the occasional storm. A popular month for outdoor events.", ev: "Graduation parties, weddings and corporate spring events.", tip: "Weekend dates book up fast. Confirm weather backup space before ordering chairs." },
  { slug: "june", name: "June", lvl: 3, wx: "Warm and long days, with a chance of summer thunderstorms.", ev: "Peak wedding season, graduations and outdoor parties.", tip: "Choose outdoor-friendly chairs and consider shade, since sun can be hot for ceremony guests." },
  { slug: "july", name: "July", lvl: 3, wx: "Hot and humid, with pop-up storms. Shade and water matter.", ev: "Outdoor weddings, family reunions and festivals.", tip: "Light chairs that do not trap heat are more comfortable than dark upholstery." },
  { slug: "august", name: "August", lvl: 3, wx: "Hot and humid early, easing late in the month.", ev: "Weddings, backyard parties and company picnics.", tip: "Book tents and chairs together so setup is coordinated." },
  { slug: "september", name: "September", lvl: 3, wx: "Comfortable days and cooler evenings, one of the most pleasant months for outdoor events.", ev: "Weddings, fall fundraisers and homecoming events.", tip: "Evenings cool quickly, so plan lighting and warmth after sunset." },
  { slug: "october", name: "October", lvl: 2, wx: "Crisp and colorful, with cold snaps and early frost possible.", ev: "Fall weddings, harvest parties and corporate galas.", tip: "Ask about a tent or indoor backup. Leaves and damp ground affect ceremony setup." },
  { slug: "november", name: "November", lvl: 1, wx: "Cold and often gray, with early dark and the first snow. Indoor events.", ev: "Thanksgiving gatherings, fundraisers and early holiday parties.", tip: "Book holiday party chairs early because December demand is high." },
  { slug: "december", name: "December", lvl: 0, wx: "Winter, with snow and cold. Holiday parties dominate and indoor venues are in demand.", ev: "Holiday parties, galas and New Year's events.", tip: "Peak month for rentals: confirm delivery windows and have a weather backup day." },
];
function buildMonth(slug: string): GuideProps | null {
  const i = months.findIndex((m) => m.slug === slug);
  if (i < 0) return null;
  const m = months[i];
  const outdoorOk = chairs.filter((c) => c.outdoorFriendly && !c.estPrice.includes("pair")).slice(0, 3);
  const indoor = chairs.filter((c) => !c.estPrice.includes("pair")).slice(0, 3);
  const rec = m.lvl >= 2 ? outdoorOk : indoor;
  const post = i >= 3 && i <= 9;
  return {
    path: `/chicago-event-seasons/${slug}`,
    crumbs: [{ name: "Chicago event seasons", href: "/chicago-event-seasons" }, { name: m.name, href: `/chicago-event-seasons/${slug}` }],
    eyebrow: `Chicago · ${m.name}`,
    title: `Chicago Event Chairs in ${m.name}: Weather & Booking Tips`,
    description: `Planning an event in Chicago in ${m.name}? What the weather means for chairs, which events are common, which chairs to pick and when to book.`,
    intro: `${m.wx} That shapes which chairs make sense, how early to book and how to plan delivery for a ${m.name} event in Chicago and the suburbs.`,
    quick: {
      q: `What chairs should I rent for a ${m.name} event in Chicago?`,
      a: `${m.lvl >= 2 ? `Choose outdoor-friendly, stackable chairs such as the ${outdoorOk.map(short).join(", ")}.` : `Most ${m.name} events are indoors, so you can choose on style: the ${indoor.map(short).join(", ")} are popular starting points.`} ${m.tip}`,
    },
    visual: (
      <MonthStrip
        levels={months.map((x) => x.lvl)}
        current={i}
        title={`Outdoor event suitability by month, ${m.name} highlighted`}
        desc={`Twelve-month strip showing how workable outdoor events are in Chicago each month; ${m.name} is outlined.`}
      />
    ),
    visualCaption: `How workable outdoor events are in Chicago by month. ${m.name} is outlined.`,
    visualAlt: `Twelve-month chart of outdoor event suitability in Chicago with ${m.name} highlighted.`,
    visual2: (
      <div className="grid grid-cols-3 gap-3">
        {rec.map((c) => (
          <div key={c.slug}>
            <ChairArt chair={c} className="aspect-[4/5] rounded-lg" />
            <p className="mt-2 text-center text-xs">{short(c)}</p>
          </div>
        ))}
      </div>
    ),
    visual2Caption: `Chairs we would shortlist for ${m.name}.`,
    sections: [
      { h: `What ${m.name} is like for events`, body: <><p>{m.wx}</p><p>Typical events: {m.ev}</p></> },
      { h: "Chair and logistics tips", body: <><p>{m.tip}</p><p>{m.lvl >= 2 ? "Outdoor ceremonies need chairs that handle damp ground and a plan for rain. Stackable styles also make it easy to move indoors." : "Indoor events let you choose on style and comfort rather than weather resistance."}</p></> },
      { h: "When to book", body: <p>{post ? "Weekend dates in this season book earlier, so start a quote as soon as your date and venue are fixed." : "Booking a few months ahead is usually enough, but December and holiday weekends fill early."} {i < 3 || i > 9 ? `Note that our first deliveries begin ${site.launch.firstEventDate}, so events before then cannot be served yet.` : ""}</p> },
    ],
    faqs: [
      { q: `Can I hold an outdoor event in Chicago in ${m.name}?`, a: m.lvl >= 2 ? "Yes, with a backup plan for weather. Tents, indoor alternatives and outdoor-friendly chairs reduce the risk." : "It is risky. Most events this month are indoors, so look at indoor venues first." },
      { q: "Do you deliver in bad weather?", a: "We plan deliveries around conditions and confirm timing with your venue. Tell us about outdoor setups so we can protect the chairs and the ground." },
      { q: `Should I book chairs early for ${m.name}?`, a: "Earlier is safer for popular weekends, because the most requested styles go first." },
    ],
    related: [
      ...[months[(i + 11) % 12], months[(i + 1) % 12]].map((x) => ({ href: `/chicago-event-seasons/${x.slug}`, label: `${x.name} events in Chicago` })),
      { href: "/answers", label: "Chicago chair answers" },
      { href: "/chicago-event-seasons", label: "All months" },
    ],
    source: `season-${m.slug}`,
  };
}
export const seasonsFamily: GuideFamily = {
  key: "seasons",
  hubFaqs: [
    { q: "When is peak event season in Chicago?", a: "May through October, with June, September and October Saturdays booking first. Reserve tents, specialty chairs and dance floors 2-4 months ahead for those dates." },
    { q: "What should I rent for a winter event in Chicago?", a: "Plan for indoor venues or tents with sidewalls and heaters, floor protection for wet or salted boots, and padded or upholstered chairs that feel warmer. Allow extra delivery time when snow is in the forecast." },
    { q: "What happens if it rains on my outdoor event?", a: "Book a tent or an indoor backup at the same time as your chairs. Resin and metal chairs handle rain; wood and upholstered chairs need cover. Your quote can include a tent so the plan B is already priced." },
  ],
  base: "/chicago-event-seasons",
  hubTitle: "Chicago Event Seasons: Month-by-Month Chair Rental Planning",
  hubDescription: "How Chicago weather and demand shape chair choices, delivery and booking, for every month of the year.",
  slugs: () => months.map((m) => m.slug),
  build: buildMonth,
  label: (s) => ({ label: months.find((m) => m.slug === s)!.name }),
};

export const families: GuideFamily[] = [layoutsFamily, roomsFamily, compareFamily, costFamily, fitFamily, tablesFamily, seasonsFamily];
export { plural };
