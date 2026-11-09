"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LiveSearchField } from "./LiveSearchField";

// Desktop header search: an icon button that opens a popover with live suggestions. Closes on
// Escape, on an outside click, or when a result is picked.
export function HeaderSearch({ buttonClassName = "" }: { buttonClassName?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Search the site"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={buttonClassName}
      >
        <Icon name={open ? "close" : "search"} size={18} />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 w-80">
          <LiveSearchField autoFocus onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
