import { site } from "./site";

// Instant-contact settings for the chat dock. All optional: each channel only shows once its
// value is set in Vercel → Project → Settings → Environment Variables (then redeploy).
// These are NEXT_PUBLIC_ values, so they are safe to read in the browser.

const digits = (v: string | undefined) => (v ?? "").replace(/[^\d+]/g, "");

export const contact = {
  // HubSpot account ID (the number in your HubSpot URL). Turns on HubSpot live chat + chatbot.
  hubspotPortalId: (process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID ?? "").replace(/\D/g, ""),
  // Business phone in +1XXXXXXXXXX form. Powers "Call us".
  phone: digits(process.env.NEXT_PUBLIC_PHONE),
  // Number that receives texts, if different from the call line (e.g. an OpenPhone/Quo number).
  smsPhone: digits(process.env.NEXT_PUBLIC_SMS_PHONE ?? process.env.NEXT_PUBLIC_PHONE),
  // WhatsApp number, digits with country code (e.g. 16305550123).
  whatsapp: digits(process.env.NEXT_PUBLIC_WHATSAPP).replace("+", ""),
  // Calendly / Cal.com / HubSpot Meetings link for the free seating call.
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
  // Shown under the panel heading. Keep it true: change it if you can't answer this fast.
  replyPromise: process.env.NEXT_PUBLIC_REPLY_PROMISE ?? "A real person replies, usually the same day.",
};

// Pre-filled first message for texts and WhatsApp, so the visitor only has to press send.
export function openerFor(page: string) {
  return `Hi ${site.name}! I'm planning an event and have a question about rentals (saw ${page}).`;
}

export const quickQuestions = [
  "Is my date still open?",
  "What would rentals cost for my guest count?",
  "Which chairs and tables suit my venue?",
  "Do you deliver and set up?",
];

// Lets any button on the site open the dock: <button onClick={openChat}>.
export const OPEN_CHAT_EVENT = "bc:open-chat";
export function openChat(question?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: question }));
}
