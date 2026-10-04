"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Chair } from "@/data/chairs";
import { useReducedMotion, useWebGL } from "@/lib/hooks";
import { ChairArt } from "./ChairArt";
import { StudioBackdrop, chairTint } from "./studio";

const ChairScene = dynamic(() => import("./three/ChairScene").then((m) => m.ChairScene), { ssr: false });

// The still render shows instantly; once WebGL is ready, a live 3D scene fades in over it.
// Falls back to the still when WebGL is unavailable.
export function ChairCanvas({
  chair,
  color,
  className = "",
  priority = false,
}: {
  chair: Chair;
  color: string;
  className?: string;
  priority?: boolean;
}) {
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const [readySlug, setReadySlug] = useState<string | null>(null);
  const ready = readySlug === chair.slug;
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className={`relative overflow-hidden ${className}`}>
      <ChairArt chair={chair} className="absolute inset-0" priority={priority} />
      {webgl && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <StudioBackdrop tint={chairTint(chair.slug)} floor={null} style={{ position: "absolute", inset: 0 }}>
            <div style={{ width: "100%", height: "100%", cursor: "grab" }}>
              <ChairScene
                key={chair.slug}
                silhouette={chair.silhouette}
                color={color}
                autoRotate={!reduced}
                paused={!visible}
                onReady={() => setReadySlug(chair.slug)}
              />
            </div>
          </StudioBackdrop>
        </div>
      )}
    </div>
  );
}

// Chair page viewer: drag to rotate, plus finish swatches that recolor the model.
export function ChairViewer({ chair }: { chair: Chair }) {
  const [finish, setFinish] = useState(0);
  const color = chair.finishes[finish]?.hex ?? chair.finishes[0].hex;
  return (
    <div>
      <ChairCanvas chair={chair} color={color} className="aspect-[4/5]" priority />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4" role="radiogroup" aria-label="Finish">
          {chair.finishes.map((f, i) => (
            <button
              key={f.name}
              type="button"
              role="radio"
              aria-checked={i === finish}
              onClick={() => setFinish(i)}
              className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-muted uppercase"
            >
              <span
                className={`h-6 w-6 rounded-full ring-1 ring-offset-2 ring-offset-bg transition ${i === finish ? "ring-ink" : "ring-ink/15"}`}
                style={{ background: f.hex }}
              />
              <span className={i === finish ? "text-ink" : ""}>{f.name}</span>
            </button>
          ))}
        </div>
        <span className="hidden text-[10px] tracking-[0.3em] text-gold uppercase sm:block">Drag to rotate</span>
      </div>
    </div>
  );
}
