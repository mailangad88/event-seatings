"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { amountDue, createCheckout, stripeEnabled } from "@/lib/payments";
import { getLeadByProposalToken, updateLead } from "@/lib/store";

// "Secure my booking" on a proposal: opens a Stripe Checkout page for the booking fee (or hold).
export async function startCheckout(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const lead = await getLeadByProposalToken(token);
  if (!lead) redirect("/");
  if (lead.fee_status === "paid" || !stripeEnabled()) redirect(`/proposal/${token}`);

  // Send the customer back to the host they're on (preview, vercel.app or the real domain).
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "https://beyondchiavari.com");

  if (amountDue(lead) < 0.5) redirect(`/proposal/${token}`);
  let session: Awaited<ReturnType<typeof createCheckout>>;
  try {
    session = await createCheckout(lead, origin);
  } catch (err) {
    console.error("startCheckout failed", err);
    redirect(`/proposal/${token}?checkout=error`);
  }
  await updateLead(lead.id, { stripe_session_id: session.id, fee_amount: session.amount }, [
    { type: "note", text: "Customer opened the booking-fee checkout." },
  ]);
  redirect(session.url);
}
