// Planning math shared by every programmatic guide page.
// All figures are planner rules of thumb, not fire-code limits. The venue's posted
// capacity and the fire marshal always win; pages say so.
import type { Chair } from "@/data/chairs";

/** Floor footprint of one 60" round with 8-10 chairs pulled out and service aisle (ft). */
export const CELL = 11;
/** Planning allowance when about half the guests dance at once (sq ft per guest, whole party). */
export const DANCE_SQFT_PER_GUEST = 2.5;

export function priceRange(c: Chair) {
  const n = (c.estPrice.match(/\d+/g) ?? []).map(Number);
  return { low: n[0] ?? 0, high: n[1] ?? n[0] ?? 0, perPair: c.estPrice.includes("pair") };
}

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export type BanquetLayout = {
  guests: number;
  perTable: number;
  tables: number;
  cols: number;
  rows: number;
  /** Room width and length in feet (clear floor space needed for tables + dance floor). */
  W: number;
  L: number;
  tableBlockL: number;
  danceDepth: number;
  sqft: number;
};

export function banquetLayout(guests: number, perTable: number, dance: boolean): BanquetLayout {
  const tables = Math.ceil(guests / perTable);
  const cols = Math.max(2, Math.round(Math.sqrt(tables * 1.4)));
  const rows = Math.ceil(tables / cols);
  const W = cols * CELL + 8;
  const tableBlockL = rows * CELL + 6;
  const danceDepth = dance ? Math.ceil((guests * DANCE_SQFT_PER_GUEST) / W) : 0;
  const L = tableBlockL + danceDepth;
  return { guests, perTable, tables, cols, rows, W, L, tableBlockL, danceDepth, sqft: W * L };
}

export type TheaterLayout = {
  guests: number;
  seatsPerRow: number;
  rows: number;
  W: number;
  L: number;
  aisle: number;
  sqft: number;
};

/** Ceremony / theater rows: 18" chairs, 30" row pitch, center aisle 4 ft, 8 ft altar zone. */
export function theaterLayout(guests: number): TheaterLayout {
  const maxPerRow = guests <= 60 ? 10 : guests <= 150 ? 16 : 22;
  const seatsPerRow = Math.min(guests, maxPerRow);
  const rows = Math.ceil(guests / seatsPerRow);
  const aisle = 4;
  const W = Math.ceil(seatsPerRow * 1.5 + aisle + 6);
  const L = Math.ceil(rows * 2.5 + 8 + 4);
  return { guests, seatsPerRow, rows, W, L, aisle, sqft: W * L };
}

export type RoomCapacity = {
  W: number;
  L: number;
  sqft: number;
  banquetCols: number;
  banquetRows: number;
  banquetTables: number;
  banquetSeats: number;
  danceTables: number;
  danceSeats: number;
  danceFloorSqft: number;
  theaterSeats: number;
  theaterPerRow: number;
  theaterRows: number;
  classroomSeats: number;
  cocktail: number;
};

/** Real packing math for a W x L ft room (4 ft wall margin, 8 ft theater front zone). */
export function roomCapacity(W: number, L: number): RoomCapacity {
  const cols = Math.max(0, Math.floor((W - 4) / CELL));
  const rows = Math.max(0, Math.floor((L - 4) / CELL));
  const banquetTables = cols * rows;
  // Reserve ~30% of the room length for a dance floor.
  const danceDepth = Math.ceil(L * 0.3);
  const rowsD = Math.max(0, Math.floor((L - 4 - danceDepth) / CELL));
  const danceTables = cols * rowsD;
  const perRow = Math.max(0, Math.floor((W - 4 - 4) / 1.5));
  const tRows = Math.max(0, Math.floor((L - 8 - 4) / 2.5));
  // Classroom: 6 ft x 18 in tables seat 2, 7 ft pitch across, 5 ft pitch deep.
  const cTables = Math.max(0, Math.floor((W - 4 + 1) / 7)) * Math.max(0, Math.floor((L - 8) / 5));
  return {
    W,
    L,
    sqft: W * L,
    banquetCols: cols,
    banquetRows: rows,
    banquetTables,
    banquetSeats: banquetTables * 8,
    danceTables,
    danceSeats: danceTables * 8,
    danceFloorSqft: Math.round(W * danceDepth),
    theaterSeats: perRow * tRows,
    theaterPerRow: perRow,
    theaterRows: tRows,
    classroomSeats: cTables * 2,
    cocktail: Math.floor((W * L * 0.85) / 8),
  };
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Today's date used as dateModified on generated pages. */
export const GUIDES_UPDATED = "2026-11-01";
