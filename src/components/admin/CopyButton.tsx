"use client";

import { useState } from "react";

// Copies text (e.g. a vendor order) to the clipboard, for vendors we reach by phone or a website contact form.
export function CopyButton({ text, label = "Copy order" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost btn-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {}
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}
