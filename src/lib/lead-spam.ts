// Spam checks for form submissions. A lead that fails is still saved (marked Lost, reason "Spam check: ..."),
// so a real person caught by mistake can be found in /admin, but it gets no alert, CRM sync or email.
// Kept simple on purpose: the honeypot field and the rate limit in /api/leads catch most bots first.

export type SpamInput = {
  name?: string;
  email?: string;
  message?: string;
  venue?: string;
  event_type?: string;
  // Milliseconds between the page loading and the form being sent (lib/lead-client.ts). Missing on old pages.
  form_ms?: number;
};

const urlPattern = /(https?:\/\/|www\.)\S+/gi;

// Phrases that show up in SEO, crypto and marketing spam, never in a rental question.
const spamPhrases = [
  /\bseo (services?|expert|agency|package)\b/i,
  /\bbacklinks?\b/i,
  /\b(first|top) page (of|on) google\b/i,
  /\bcrypto(currency)?\b|\bbitcoin\b|\bforex\b/i,
  /\bcasino\b|\bviagra\b|\bcialis\b|\bloan offer\b/i,
  /\bguest post(ing)?\b/i,
  /\b(web ?site|app) (design|development) (services?|agency)\b/i,
  /\blead generation services?\b/i,
];

/** Returns why this looks like spam, or undefined when it looks like a person. */
export function spamReason(input: SpamInput): string | undefined {
  // Faster than a person can read and type: a script filled the form.
  if (typeof input.form_ms === "number" && Number.isFinite(input.form_ms) && input.form_ms >= 0 && input.form_ms < 1500) {
    return "sent less than 2 seconds after the page opened";
  }
  if (input.name && /(https?:\/\/|www\.|\.com\b|\.ru\b)/i.test(input.name)) return "a web link in the name";
  if (input.name && input.name.length > 3 && !/[\p{L}]/u.test(input.name)) return "no letters in the name";
  const text = [input.message, input.venue, input.event_type].filter(Boolean).join("\n");
  const links = text.match(urlPattern)?.length ?? 0;
  if (links >= 3) return `${links} web links in the message`;
  const phrase = spamPhrases.find((p) => p.test(text));
  if (phrase) return `sales or spam wording ("${text.match(phrase)?.[0]}")`;
  return undefined;
}
