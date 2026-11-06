// Items a visitor has looked at, kept in this browser only (never sent to us). Shown as a "Recently
// viewed" strip so someone comparing a few chairs or table sizes can jump back without re-searching.

export type ViewedItem = { id: string; name: string; price: number; unit: string; href: string; image?: string };

const KEY = "bc-recently-viewed-v1";
const EVENT = "bc:recently-viewed";
const MAX = 12;

function read(): ViewedItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function recentlyViewed(excludeId?: string): ViewedItem[] {
  const all = read();
  return excludeId ? all.filter((v) => v.id !== excludeId) : all;
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
