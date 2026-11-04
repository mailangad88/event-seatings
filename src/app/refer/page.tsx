import type { Metadata } from "next";
import Link from "@/components/Link";
import { ReferForm } from "@/components/ReferForm";
import { FaqList, Figure, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { referralReward } from "@/lib/referrals";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refer a Friend Planning an Event",
  description: `Know someone planning a wedding, party or corporate event in Chicago? Share your personal ${site.name} link so they can price every rental on one quote.`,
  alternates: { canonical: "/refer" },
};

export default function ReferPage() {
  // Only an offer Angad has approved, set in REFERRAL_REWARD, is ever shown.
  const reward = referralReward();
  const faqs: Faq[] = [
    {
      q: "How does a referral get credited?",
      a: "Your link adds a short code to our web address. When your friend opens it, their browser remembers the code for 90 days, and it's saved with any quote or question they send us.",
    },
    {
      q: "Is there a reward?",
      a: reward
        ? `Yes: ${reward}. We confirm it by email once your friend's booking is confirmed.`
        : "Not at the moment. Referrals simply help a friend plan with less stress, and help a new Chicago business grow. If we add a reward, this page will say so.",
    },
    {
      q: "What do you do with my email?",
      a: "We use it to recognize your link and to contact you about your referrals. We don't sell it or add you to marketing emails without asking.",
    },
  ];
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Refer a friend", href: "/refer" }]}
        eyebrow="Refer a friend"
        title={<>Know someone planning an event?</>}
        intro={
          reward
            ? `Share your personal link. ${reward}.`
            : `Share your personal link with anyone planning a wedding, party or company event in ${site.marketLong}. They get every rental priced on one quote; you get our thanks.`
        }
        actions={<a href="#link" className="btn-primary">Get my link</a>}
        media={<Figure {...scenes.midnightGold} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />
      <Section eyebrow="How it works" title="Three steps">
        <StepFlow
          steps={[
            { title: "Get your link", text: "Enter your name and email. Your link is ready instantly.", icon: "spark" },
            { title: "Share it", text: "Text, WhatsApp or email it to a friend who's planning.", icon: "chat" },
            { title: "We take care of them", text: "Your friend builds a quote; we confirm with a local rental company.", icon: "check" },
          ]}
          caption="How referrals work: get a personal link, share it, and your friend's quote is credited to you."
        />
      </Section>
      <Section id="link" tone="sand" eyebrow="Your link" title="Make your share link">
        <div className="mx-auto max-w-3xl">
          <ReferForm />
        </div>
      </Section>
      <Section eyebrow="Questions" title="Referral FAQ">
        <FaqList faqs={faqs} />
        <p className="mt-8 text-sm text-muted">
          Planning your own event? <Link href="/quote" className="text-accent">Start a quote</Link>.
        </p>
      </Section>
    </>
  );
}
