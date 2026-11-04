import type { IconName } from "@/components/ui/Icon";

// Picks a line icon from a link label or heading, so lists of links and long sections
// can be shown as icon cards without anyone choosing an icon by hand.
// First match wins, so put the more specific words first.
const rules: [RegExp, IconName][] = [
  [/\b(faq|question|answer|ask)/i, "help"],
  [/\b(cost|price|pricing|budget|fee|pay|money|cheap|afford)/i, "wallet"],
  [/\b(tent|canop|rain|weather|outdoor|backyard|lawn|garden|park)/i, "tent"],
  [/\b(chair|seat|bench|stool)/i, "chair"],
  [/\b(table|round|banquet|cocktail)/i, "table"],
  [/\b(linen|tablecloth|napkin|runner|drape)/i, "linen"],
  [/\b(dish|plate|dinnerware|charger|china)/i, "plate"],
  [/\b(glass|bar|drink|wine|toast)/i, "glass"],
  [/\b(flatware|cutlery|fork|dinner|meal|food|buffet|thanksgiving|brunch)/i, "flatware"],
  [/\b(cater|chafer|warm)/i, "chafer"],
  [/\b(light|lighting|uplight|string|sunset|dark)/i, "light"],
  [/\b(lounge|sofa|couch)/i, "sofa"],
  [/\b(dance|floor|stage)/i, "floor"],
  [/\b(heater|heat|winter|cold)/i, "heat"],
  [/\b(game|kids|bounce)/i, "games"],
  [/\b(candle|decor|look|style|theme|idea|inspir)/i, "spark"],
  [/\b(arch|ceremony|wedding|altar)/i, "arch"],
  [/\b(deliver|pickup|load|freight|truck|dock|parking|shuttle)/i, "truck"],
  [/\b(map|area|near|suburb|county|neighborhood|venue|where|loft|hall|ballroom|rooftop)/i, "pin"],
  [/\b(date|month|season|when|timeline|countdown|calendar|book now|ahead)/i, "calendar"],
  [/\b(time|hour|last.minute|minute)/i, "clock"],
  [/\b(guest|people|crowd|count|how many|capacity)/i, "users"],
  [/\b(size|measure|square|dimension|layout|floor plan|space|fit)/i, "ruler"],
  [/\b(check|list|ready|readiness|plan)/i, "list"],
  [/\b(download|kit|printable|spreadsheet|workbook)/i, "download"],
  [/\b(guide|read|tip|how to|getting)/i, "book"],
  [/\b(quote|request|order)/i, "quote"],
  [/\b(call|phone|talk)/i, "phone"],
  [/\b(safe|insur|permit|rule|promise|guarantee|backup)/i, "shield"],
  [/\b(photo|picture|gallery|camera)/i, "camera"],
  [/\b(gift|party|birthday|celebrat|holiday|shower|anniversary)/i, "gift"],
  [/\b(review|star|favorite)/i, "star"],
  [/\b(compare|vs\.?|versus|calculator|estimat|score)/i, "chart"],
  [/\b(home|house)/i, "home"],
];

export function iconFor(text: string, fallback: IconName = "arrow"): IconName {
  for (const [re, icon] of rules) if (re.test(text)) return icon;
  return fallback;
}
