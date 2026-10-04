"use client";

import { Player } from "@remotion/player";
import { useSyncExternalStore } from "react";
import { getChair } from "@/data/chairs";
import { ChairShowcase, SHOWCASE_FRAMES } from "@/remotion/ChairShowcase";
import { ChairArt } from "./ChairArt";

const noop = () => () => {};
const query = "(prefers-reduced-motion: reduce)";

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => true, // server render: show the still image
  );
}

function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

// Animated chair showcase made with Remotion. Falls back to a still image for
// visitors who prefer reduced motion, and before the page has hydrated.
export function HeroPlayer() {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();

  if (!hydrated || reduced) {
    return <ChairArt chair={getChair("velvet-dining")!} className="aspect-[4/5] w-full" priority />;
  }

  return (
    <Player
      component={ChairShowcase}
      durationInFrames={SHOWCASE_FRAMES}
      compositionWidth={1080}
      compositionHeight={1350}
      fps={30}
      autoPlay
      loop
      controls={false}
      clickToPlay={false}
      acknowledgeRemotionLicense
      style={{ width: "100%", aspectRatio: "4 / 5" }}
    />
  );
}
