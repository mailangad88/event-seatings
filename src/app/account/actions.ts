"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  canEmailLinks,
  endSession,
  getSession,
  loginToken,
  normalEmail,
  readLoginToken,
  signInOpen,
  startSampleSession,
  startSession,
} from "@/lib/account-auth";
import { isDisposableEmail } from "@/lib/disposable-email";
import { sendEmail } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { originFrom } from "@/lib/request-origin";
import { site } from "@/lib/site";
import { addLeadMessage, getAccount, getLead, upsertAccount } from "@/lib/store";

export type LinkState = { status: "idle" | "sent" | "error"; message?: string; devLink?: string };

// 5 sign-in emails per address and 10 per IP each 15 minutes (src/lib/rate-limit.ts; shared through Upstash when set).
async function tooMany(key: string, max: number) {
  return !(await rateLimit("account-link", key, { limit: max, windowMs: 15 * 60_000 })).allowed;
}

async function origin() {
  return originFrom(await headers());
}

// "Email me a sign-in link". Always answers the same way, whether or not we know the address.
export async function requestLink(_prev: LinkState, form: FormData): Promise<LinkState> {
  if (form.get("website")) return { status: "sent" }; // honeypot
  if (!signInOpen()) return { status: "error", message: "Sign-in isn't switched on yet. Please call or email us and we'll help." };
  const email = normalEmail(String(form.get("email") ?? ""));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return { status: "error", message: "Please enter a valid email address." };
  if (isDisposableEmail(email)) return { status: "error", message: "Please use an email address you check, so the link reaches you." };
  const ip = clientIp(await headers());
  if ((await tooMany(`e:${email}`, 5)) || (await tooMany(`i:${ip}`, 10))) return { status: "error", message: "Too many tries. Please wait a few minutes and try again." };

  const link = `${await origin()}/account/verify?t=${encodeURIComponent(loginToken(email))}`;
  if (!canEmailLinks()) return { status: "sent", devLink: link }; // local development only (signInOpen checks)

  const ok = await sendEmail({
    to: email,
    subject: `Your ${site.name} sign-in link`,
    text: [
      "Hi,",
      "",
      `Use this link to sign in to your ${site.name} account. It works once and expires in 30 minutes.`,
      "",
      link,
      "",
      "Your account shows your events, quotes, each rental company's delivery times, payments and messages with us.",
      "",
      "If you didn't ask for this, you can ignore this email.",
    ].join("\n"),
  });
  return ok ? { status: "sent" } : { status: "error", message: "We couldn't send the email just now. Please try again in a minute." };
}

// The "Sign me in" button on /account/verify. A button (not the link itself) so email scanners that open
// links can't use up the one-time link.
export async function confirmLogin(form: FormData) {
  const token = String(form.get("t") ?? "");
  const p = readLoginToken(token);
  if (!p) redirect("/account/sign-in?link=expired");
  const account = await getAccount(p.e).catch(() => undefined);
  if (account?.last_login_at && new Date(account.last_login_at).getTime() >= p.iat) redirect("/account/sign-in?link=used");
  await upsertAccount(p.e, { last_login_at: new Date().toISOString() });
  await startSession(p.e);
  redirect("/account");
}

export async function viewSample() {
  await startSampleSession();
  redirect("/account");
}

export async function signOut() {
  await endSession();
  redirect("/account/sign-in");
}

async function requireSession() {
  const s = await getSession();
  if (!s) redirect("/account/sign-in");
  return s;
}

// A renter's message about one of their events. Alerts the owner by email.
export async function sendMessage(form: FormData) {
  const s = await requireSession();
  const id = String(form.get("lead") ?? "");
  const text = String(form.get("text") ?? "").trim();
  const back = `/account/events/${encodeURIComponent(id)}`;
  if (s.sample) redirect(`${back}?sample=1#messages`);
  if (!text) redirect(`${back}#messages`);
  const lead = await getLead(id).catch(() => undefined);
  if (!lead || normalEmail(lead.email) !== s.email) redirect("/account");
  await addLeadMessage(lead.id, "customer", text);
  if (process.env.NOTIFY_EMAIL) {
    await sendEmail({
      to: process.env.NOTIFY_EMAIL,
      subject: `New message from ${lead.name ?? lead.email}`,
      text: [
        `${lead.name ?? lead.email} wrote from their account about their ${lead.event_type ?? "event"}${lead.event_date ? ` on ${lead.event_date}` : ""}:`,
        "",
        text,
        "",
        `Reply: ${site.url}/admin/messages?lead=${lead.id}`,
      ].join("\n"),
    });
  }
  revalidatePath(back);
  redirect(`${back}?sent=1#messages`);
}

export async function saveProfile(form: FormData) {
  const s = await requireSession();
  if (s.sample) redirect("/account/profile?sample=1");
  const name = String(form.get("name") ?? "").trim().slice(0, 100);
  const phone = String(form.get("phone") ?? "").trim().slice(0, 40);
  await upsertAccount(s.email, { name: name || undefined, phone: phone || undefined });
  revalidatePath("/account", "layout");
  redirect("/account/profile?saved=1");
}

// Keeps My events plans and the idea board the same on every device. The first time a device syncs, its lists
// are merged with what's saved (by id for plans, by image for ideas). After that the device has the full lists,
// so what it sends replaces what's saved, which lets removals stick.
type Saved = { events: unknown[]; ideas: unknown[] };
const keyOf = (x: unknown, k: string) => (x && typeof x === "object" && typeof (x as Record<string, unknown>)[k] === "string" ? String((x as Record<string, unknown>)[k]) : undefined);
function merge(server: unknown[] = [], local: unknown[] = [], k: string, max: number) {
  const out = new Map<string, unknown>();
  for (const x of [...server, ...local]) {
    const key = keyOf(x, k);
    if (key && JSON.stringify(x).length < 20_000) out.set(key, x);
  }
  return [...out.values()].slice(-max);
}

export async function syncSaved(local: Saved, replace = false): Promise<Saved & { ok: boolean }> {
  const s = await getSession();
  if (!s || s.sample) return { ok: false, events: [], ideas: [] };
  const account = await getAccount(s.email).catch(() => undefined);
  const base = (list?: unknown[]) => (replace ? [] : (list ?? []));
  const events = merge(base(account?.saved_events), Array.isArray(local?.events) ? local.events : [], "id", 50);
  const ideas = merge(base(account?.saved_ideas), Array.isArray(local?.ideas) ? local.ideas : [], "src", 200);
  await upsertAccount(s.email, { saved_events: events, saved_ideas: ideas });
  return { ok: true, events, ideas };
}
