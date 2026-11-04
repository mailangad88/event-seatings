"use server";

import { headers } from "next/headers";
import { originFrom } from "@/lib/request-origin";
import { redirect } from "next/navigation";
import { amountDue, createCheckout, stripeEnabled } from "@/lib/payments";
import { getLeadByProposalToken, updateLead, type Lead } from "@/lib/store";
import { TERMS_VERSION } from "@/lib/terms";

// Saves that the customer ticked "I agree to the Terms and Conditions" on their proposal. If the database
// doesn't have the terms columns yet (schema.sql not re-run), the agreement is still kept as a note.
async function recordTerms(lead: Lead, where: string) {
  const at = new Date().toISOString();
  const note = { type: "note" as const, text: `Customer agreed to the Terms and Conditions (version ${TERMS_VERSION}) ${where}.` };
  try {
    await updateLead(lead.id, { terms_accepted_at: at, terms_version: TERMS_VERSION }, [note]);
  } catch (err) {
    console.error("recordTerms: saving columns failed, keeping a note instead", err);
    await updateLead(lead.id, {}, [note]);
  }
}

const agreed = (formData: FormData) => formData.get("terms_agree") === "yes";

// "Accept this quote" when online payment is off: records the terms agreement and tells our team.
export async function acceptProposal(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const lead = await getLeadByProposalToken(token);
  if (!lead) redirect("/");
  if (!agreed(formData)) redirect(`/proposal/${token}?terms=missing`);
  await recordTerms(lead, "on the proposal page and asked for a payment link");
  redirect(`/proposal/${token}?accepted=1`);
}

// "Secure my booking" on a proposal: opens a Stripe Checkout page for the booking fee (or hold).
export async function startCheckout(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const lead = await getLeadByProposalToken(token);
  if (!lead) redirect("/");
  if (lead.fee_status === "paid" || !stripeEnabled()) redirect(`/proposal/${token}`);
  if (!agreed(formData)) redirect(`/proposal/${token}?terms=missing`);
  await recordTerms(lead, "before paying online");

  // Send the customer back to the host they're on (preview, vercel.app or the real domain), never a forged one.
  const origin = originFrom(await headers());

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
