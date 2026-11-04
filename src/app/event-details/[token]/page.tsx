import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { EventDetailsForm } from "@/components/EventDetailsForm";
import { PageHero, Section } from "@/components/ui";
import { leadFromDetailsToken } from "@/lib/details-link";
import { eventPhrase, missingForCustomer, prefillIntake } from "@/lib/intake";
import { site } from "@/lib/site";
import { getLead } from "@/lib/store";
import { saveEventDetails } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your event details", robots: { index: false, follow: false } };

export default async function EventDetailsPage(props: PageProps<"/event-details/[token]">) {
  const { token } = await props.params;
  const sp = await props.searchParams;
  const id = leadFromDetailsToken(token);
  const lead = id ? await getLead(id).catch(() => undefined) : undefined;
  if (!lead || lead.kind === "partner") notFound();

  const pre = prefillIntake(lead);
  const { key, more } = missingForCustomer(Object.fromEntries(Object.entries(pre).map(([k, v]) => [k, v.value])));
  const first = lead.name?.trim().split(/\s+/)[0];
  const done = sp.done === "1";
  const error = sp.error === "empty" ? "Answer at least one question, then press Send." : sp.error === "slow" ? "That was a lot of tries. Wait a few minutes and send again." : "";
  // After they send, only must-have questions still open are offered again, so the page doesn't keep asking.
  const nothingLeft = done ? key.length === 0 : key.length + more.length === 0;

  return (
    <>
      <PageHero
        eyebrow="Your event details"
        title={done ? <>Thanks{first ? `, ${first}` : ""}. Got it.</> : <>{first ? `${first}, a` : "A"} few quick questions</>}
        intro={
          done
            ? `We'll check availability and delivery times for ${eventPhrase(lead)} and get back to you soon.`
            : `So we can check prices and dates for ${eventPhrase(lead)}. It takes about 2 minutes, and you can skip anything you don't know yet.`
        }
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          {error && (
            <p role="alert" className="mb-6 rounded-xl bg-rose-soft px-4 py-3 text-sm text-rose">
              {error}
            </p>
          )}
          {done || nothingLeft ? (
            <div className="card p-6">
              <p>{nothingLeft ? "We have everything we need for now." : "Your answers are saved."} If anything changes, just reply to our email{site.phone ? ` or call ${site.phone}` : ""}.</p>
              {!nothingLeft && (
                <p className="mt-3 text-sm text-muted">
                  {key.length === 1 ? "One more question we'd still like to know" : `${key.length} more questions we'd still like to know`}, below, if you have a minute.
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/ideas" className="btn-ghost btn-sm">Get ideas for your event</Link>
                <Link href="/" className="btn-ghost btn-sm">Back to the site</Link>
              </div>
            </div>
          ) : null}
          {!nothingLeft && (
            <div className={done ? "mt-10" : ""}>
              <EventDetailsForm action={saveEventDetails} token={token} keyIds={key.map((f) => f.id)} moreIds={done ? [] : more.map((f) => f.id)} />
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
