"use client";

import { useEffect, useRef, useState } from "react";

const LONG_PRESS_MS = 400;
const MARGIN = 12;

// Wraps a small item thumbnail so it enlarges on hover, keyboard focus, or
// (on touch) a long press — without shifting any surrounding layout, since
// the enlarged preview is a fixed-position overlay, not part of the flow.
export function ThumbZoom({
  src,
  alt,
  children,
  previewSize = 240,
  className = "",
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
  previewSize?: number;
  className?: string;
}) {
  const [box, setBox] = useState<{ top: number; left: number; size: number } | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const open = () => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const size = Math.max(96, Math.min(previewSize, window.innerWidth - MARGIN * 2, window.innerHeight - MARGIN * 2));
    let left = r.left + r.width / 2 - size / 2;
    left = Math.min(Math.max(left, MARGIN), window.innerWidth - size - MARGIN);
    let top = r.top - size - MARGIN;
    if (top < MARGIN) top = Math.min(r.bottom + MARGIN, window.innerHeight - size - MARGIN);
    setBox({ top, left, size });
  };

  const close = () => {
    setBox(null);
    clearPress();
  };

  useEffect(() => {
    if (!box) return;
    const onScrollOrResize = () => close();
    window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  return (
    <span
      ref={wrapRef}
      tabIndex={0}
      role="button"
      aria-label={`Enlarge picture: ${alt}`}
      className={`relative inline-block cursor-zoom-in align-top outline-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-gold ${className}`}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
      onTouchStart={() => {
        clearPress();
        pressTimer.current = setTimeout(open, LONG_PRESS_MS);
      }}
      onTouchEnd={close}
      onTouchCancel={close}
      onTouchMove={clearPress}
      onContextMenu={(e) => {
        if (box) e.preventDefault();
      }}
    >
      {children}
      {box && (
        <span
          role="img"
          aria-label={alt}
          className="pointer-events-none fixed z-50 overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
          style={{ top: box.top, left: box.left, width: box.size, height: box.size }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" />
        </span>
      )}
    </span>
  );
}
