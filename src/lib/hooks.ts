"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};
const query = "(prefers-reduced-motion: reduce)";

export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => true, // server render: assume reduced so nothing animates before hydration
  );
}

export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

let webglCache: boolean | undefined;
function detectWebGL() {
  if (webglCache === undefined) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}

export function useWebGL() {
  return useSyncExternalStore(noop, detectWebGL, () => false);
}
