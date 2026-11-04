"use client";

import { useActionState } from "react";
import { Icon } from "@/components/ui/Icon";
import { requestLink, type LinkState } from "@/app/account/actions";

export function SignInForm() {
  const [state, action, pending] = useActionState<LinkState, FormData>(requestLink, { status: "idle" });
  if (state.status === "sent")
    return (
      <div role="status" className="rounded-xl bg-green-soft p-5 text-sm">
        <p className="flex items-center gap-2 font-semibold text-green"><Icon name="mail" size={18} /> Check your email</p>
        <p className="mt-2 text-ink">We sent you a sign-in link. It works once and expires in 30 minutes. Don&apos;t see it? Check spam or promotions.</p>
        {state.devLink && (
          <p className="mt-3 break-all text-xs text-muted">
            Local development, no email set up: <a href={state.devLink} className="link">open the sign-in link</a>
          </p>
        )}
      </div>
    );
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" className="field" placeholder="you@example.com" />
        <p className="hint">Use the email you sent your quote from.</p>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.status === "error" && <p role="alert" className="text-sm text-rose">{state.message}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button>
    </form>
  );
}
