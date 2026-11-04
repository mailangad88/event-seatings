import { limitRequest } from "@/lib/rate-limit";
import { optOutEmail } from "@/lib/store";
import { verifyUnsubscribe } from "@/lib/unsubscribe";
import { site } from "@/lib/site";

// One-click unsubscribe from every automated email (follow-ups, download emails, tips).
// GET shows a confirmation page after opting out; POST supports mail apps' one-click List-Unsubscribe.
async function handle(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("e") ?? "";
  const token = url.searchParams.get("t") ?? "";
  if (!verifyUnsubscribe(email, token)) return { ok: false };
  try {
    await optOutEmail(email);
  } catch (error) {
    // Never tell someone they're unsubscribed when we couldn't record it: log it so it can be done by hand.
    console.error("UNSUBSCRIBE_FAILED", email, error);
    return { ok: false };
  }
  return { ok: true };
}

const page = (title: string, body: string) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;line-height:1.6;color:#2b2420"><h1 style="font-size:1.5rem">${title}</h1><p>${body}</p><p><a href="${site.url}" style="color:#8a6a2f">Back to ${site.name}</a></p></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );

const limit = { limit: 20, windowMs: 10 * 60_000 };

export async function GET(request: Request) {
  const blocked = await limitRequest(request, "unsubscribe", limit);
  if (blocked) return blocked;
  const { ok } = await handle(request);
  return ok
    ? page("You're unsubscribed", "You won't get any more automated emails from us. If you sent a quote request, we may still reply to it personally once.")
    : page("We couldn't confirm that link", `Please email <a href="mailto:${site.email}">${site.email}</a> with the word unsubscribe and we'll remove you by hand.`);
}

export async function POST(request: Request) {
  const blocked = await limitRequest(request, "unsubscribe", limit);
  if (blocked) return blocked;
  const { ok } = await handle(request);
  return Response.json({ ok }, { status: ok ? 200 : 400 });
}
