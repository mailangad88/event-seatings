import type { Lead, LeadActivity } from "./store";

// Every communication logged on every lead's timeline, newest first, for the all-leads view at
// /admin/communications. Pulls straight from lead.activity (lib/store.ts) — manual entries an admin
// logs on a lead page, and automated ones the quote/followup/reminder/event-email senders append.

export type CommunicationKind = "call" | "email" | "text" | "note" | "vendor";
export const communicationKinds: CommunicationKind[] = ["call", "email", "text", "note", "vendor"];

export type CommunicationEntry = {
  lead: Lead;
  entry: LeadActivity;
};

const isCommunication = (a: LeadActivity): a is LeadActivity & { type: CommunicationKind } =>
  (communicationKinds as string[]).includes(a.type);

// `kinds` narrows to one or more of call/email/text/note/vendor; omit it (or pass all of them) for everything.
export function allCommunications(leads: Lead[], kinds: CommunicationKind[] = communicationKinds): CommunicationEntry[] {
  const allow = new Set(kinds);
  const out: CommunicationEntry[] = [];
  for (const lead of leads) {
    for (const entry of lead.activity ?? []) {
      if (isCommunication(entry) && allow.has(entry.type)) out.push({ lead, entry });
    }
  }
  return out.sort((a, b) => b.entry.at.localeCompare(a.entry.at));
}
