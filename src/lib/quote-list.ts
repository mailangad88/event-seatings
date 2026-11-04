// The visitor's quote list, kept in this browser until they send it. Item pages, category pages and the
// quote builder all read and write the same list, so adding chairs, then tables, then linens builds one
// list instead of starting over each time. Pure helpers plus a tiny subscribe API (no React here).

export const QUOTE_LIST_KEY = "bc-quote-list-v1";
const EVENT = "bc:quote-list";

/** qty: pieces; auto: quantity follows the guest count until the visitor edits it; ratio: per-guest override. */
export type ListLine = { qty: number; auto: boolean; ratio?: number };
export type QuoteList = { items: Record<string, ListLine>; guests?: number; colours?: Record<string, string>; updated?: string };

const empty: QuoteList = { items: {} };

export function readList(): QuoteList {
  try {
    const raw = localStorage.getItem(QUOTE_LIST_KEY);
    if (!raw) return empty;
    const v = JSON.parse(raw) as QuoteList;
    return v && typeof v.items === "object" && v.items ? v : empty;
  } catch {
    return empty;
  }
}

export function writeList(list: QuoteList) {
  try {
    if (Object.keys(list.items).length === 0 && !list.guests) localStorage.removeItem(QUOTE_LIST_KEY);
    else localStorage.setItem(QUOTE_LIST_KEY, JSON.stringify({ ...list, updated: new Date().toISOString() }));
  } catch {}
  try {
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

/** Adds one item (keeps an existing line as it is). Returns the new number of items on the list. */
export function addToList(id: string, line: ListLine = { qty: 1, auto: true }): number {
  const list = readList();
  const items = { ...list.items, [id]: list.items[id] ?? line };
  writeList({ ...list, items });
  return Object.keys(items).length;
}

export function clearList() {
  writeList(empty);
}

export function listCount(): number {
  return Object.keys(readList().items).length;
}

// For useSyncExternalStore: fires on changes in this tab (our event) and in other tabs (storage event).
export function subscribeList(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === QUOTE_LIST_KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** A link that rebuilds the list on any device (used in "email me this list"). */
export function listLink(list: QuoteList, base: string) {
  const ids = Object.keys(list.items).slice(0, 80);
  const qs = new URLSearchParams({ items: ids.join(","), browse: "1" });
  if (list.guests) qs.set("guests", String(list.guests));
  return `${base}/quote?${qs.toString()}`;
}
