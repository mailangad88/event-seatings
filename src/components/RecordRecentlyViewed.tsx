"use client";

import { useEffect } from "react";
import { addRecentlyViewed, type ViewedItem } from "@/lib/recently-viewed";

// Drops the current item into this browser's "recently viewed" list. Renders nothing; sits on the item
// page so the strip elsewhere on the site can read it back.
export function RecordRecentlyViewed({ item }: { item: ViewedItem }) {
  useEffect(() => {
    addRecentlyViewed(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-record only when the item itself changes
  }, [item.id, item.name, item.price, item.unit, item.href, item.image]);
  return null;
}
