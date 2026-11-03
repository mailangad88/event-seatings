"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import type { SavedIdea } from "@/lib/my-events";
import { parseIdeas, readIdeasRaw, subscribeIdeas, writeIdeas } from "./ideas-store";

// Heart button over an image: saves it to the visitor's idea board in My Events.
export function SaveIdea({ idea, className = "" }: { idea: Omit<SavedIdea, "saved">; className?: string }) {
  const raw = useSyncExternalStore(subscribeIdeas, readIdeasRaw, () => "[]");
  const saved = parseIdeas(raw).some((i) => i.src === idea.src);
  const toggle = () => {
    const list = parseIdeas(readIdeasRaw());
    writeIdeas(saved ? list.filter((i) => i.src !== idea.src) : [{ ...idea, saved: new Date().toISOString() }, ...list]);
    if (!saved) track("idea_saved", { src: idea.src });
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove "${idea.caption}" from my ideas` : `Save "${idea.caption}" to my ideas`}
      title={saved ? "Saved to My Events" : "Save to my ideas"}
      className={`grid h-9 w-9 place-items-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur transition hover:bg-black/60 ${saved ? "text-gold" : ""} ${className}`}
    >
      <Icon name="heart" size={18} strokeWidth={saved ? 2.5 : 1.5} className={saved ? "fill-current" : ""} />
    </button>
  );
}
