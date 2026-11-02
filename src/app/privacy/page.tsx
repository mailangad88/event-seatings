import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ChairStrip } from "@/components/ChairStrip";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects and uses your information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container-x max-w-3xl py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="headline mt-6 text-5xl sm:text-6xl">Privacy policy</h1>
      <p className="mt-4 text-sm text-muted">Last updated October 2026</p>
      <ChairStrip className="mt-10" slugs={["ghost", "bentwood", "cane-back"]} caption="We collect only what we need to plan your event." />
      <div className="prose-post mt-10">
        <p>
          {site.name} (&ldquo;we&rdquo;) is based in {site.city}. This page explains what we collect through this
          website and how we use it.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Quote requests:</strong> your name, email, phone (optional), event date, event type, guest count,
            city, venue, the rentals you selected and any message you write.
          </li>
          <li>
            <strong>Call requests:</strong> your name, email, phone, preferred call time and anything you tell us about
            your event.
          </li>
          <li>
            <strong>Email signups and the style quiz:</strong> your email address and, for the quiz, your style
            results.
          </li>
          <li>
            <strong>Chair votes:</strong> which chairs you save. Votes are tied to a random identifier stored in your
            browser, not to your name or email.
          </li>
        </ul>
        <h2>How we use it</h2>
        <p>
          We use this information to respond to your quote request, send the planning tips you signed up for, and understand
          which styles people want. We do not sell your personal information.
        </p>
        <h2>Who sees it</h2>
        <p>
          Our team, plus the service providers that host the site and store data or send email on our behalf. They may
          only use it to provide those services.
        </p>
        <h2>Your choices</h2>
        <p>
          You can ask us to access, correct or delete your information, or unsubscribe from emails at any time by
          writing to <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <h2>Cookies and local storage</h2>
        <p>
          We store a random visitor identifier in your browser&apos;s local storage so your saved chairs persist. We
          don&apos;t use advertising cookies.
        </p>
      </div>
    </div>
  );
}
