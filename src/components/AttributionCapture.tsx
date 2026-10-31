"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

// Remembers which post, reel or ad brought the visitor here (see src/lib/attribution.ts).
export function AttributionCapture() {
  useEffect(() => captureAttribution(), []);
  return null;
}
