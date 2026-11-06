// Items a visitor has looked at, kept in this browser only (never sent to us). Shown as a "Recently
// viewed" strip so someone comparing a few chairs or table sizes can jump back without re-searching.

export type ViewedItem = { id: string; name: string; price: number; unit: string; href: string; image?: string };

const KEY = "bc-recently-viewed-v1";
const EVENT = "bc:recently-viewed";
const MAX = 12;

// Cached by raw storage string so useSyncExternalStore's getSnapshot returns the same array
// reference until localStorage actually changes (a fresh array every call causes an infinite
// re-render loop: https://react.dev/reference/react/useSyncExternalStore#im-getting-an-error-the-result-of-getsnapshot-should-be-cached).
let cachedRaw: string | null = null;
let cachedAll: ViewedItem[] = [];
const excludeCache = new Map<string, ViewedItem[]>();

function read(): ViewedItem[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedAll;
  let v: unknown = [];
  try {
    v = raw ? JSON.parse(raw) : [];
  } catch {
    v = [];
  }
  cachedRaw = raw;
  cachedAll = Array.isArray(v) ? (v as ViewedItem[]) : [];
  excludeCache.clear();
  return cachedAll;
}

export function recentlyViewed(excludeId?: string): ViewedItem[] {
  const all = read();
  if (!excludeId) return all;
  const cached = excludeCache.get(excludeId);
  if (cached) return cached;
  const filtered = all.filter((v) => v.id !== excludeId);
  excludeCache.set(excludeId, filtered);
  return filtered;
}

export function addRecentlyViewed(item: ViewedItem) {
  try {
    const next = [item, ...read().filter((v) => v.id !== item.id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function subscribeRecentlyViewed(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}
