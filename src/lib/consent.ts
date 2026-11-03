// The visitor's choice from the tracking notice (components/ConsentNotice.tsx).
// "ok" = remember pages and load Google Analytics. "no" = neither. Unset = not chosen yet: we remember pages in the
// browser and load analytics, unless the browser sends Global Privacy Control, which counts as "no".
export type TrackingChoice = "ok" | "no";

const key = "es_tracking";
export const consentEvent = "es-tracking-choice";

export function trackingChoice(): TrackingChoice | undefined {
  try {
    const v = localStorage.getItem(key);
    return v === "ok" || v === "no" ? v : undefined;
  } catch {
    return undefined;
  }
}

export function trackingAllowed(): boolean {
  if (typeof window === "undefined") return false;
  const choice = trackingChoice();
  if (choice) return choice === "ok";
  return !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
}

export function setTrackingChoice(choice: TrackingChoice) {
  try {
    localStorage.setItem(key, choice);
    if (choice === "no") {
      localStorage.removeItem("lead-journey");
      localStorage.removeItem("lead-trail");
    }
  } catch {}
  window.dispatchEvent(new Event(consentEvent));
}
