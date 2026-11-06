import type { Metadata } from "next";
import Link from "@/components/Link";
import { site } from "@/lib/site";
import { ChairStrip } from "@/components/ChairStrip";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects the information you share when you request a quote, book a call or download a planning kit.`,
  alternates: { canonical: "/privacy" },
});

export default function PrivacyPage() {
  return (
    <div className="container-x max-w-3xl py-20">
      <Breadcrumbs items={[{ name: "Privacy policy", href: "/privacy" }]} className="mb-6" />
      <p className="eyebrow">Legal</p>
      <h1 className="display-1 mt-6">Privacy policy</h1>
      <p className="mt-4 text-sm text-muted">Last updated November 4, 2026</p>
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
          <li>
            <strong>How you found us:</strong> when you send a form, we include the website, search engine, ad or email
            link that brought you here and the first page you visited, so we know which of our content is helpful.
          </li>
          <li>
            <strong>Bookings and payments:</strong> your delivery address, venue details, the items you book, and a record of
            when you agreed to our <Link href="/terms">Terms and Conditions</Link> and which version. Card and bank payments
            are handled by Stripe. We see the amount and the last four digits, never your full card number.
          </li>
          <li>
            <strong>Text messages:</strong> we only text you if you tick &ldquo;Text me about my quote.&rdquo; Reply STOP
            to any message to opt out.
          </li>
        </ul>
        <h2>How we use it</h2>
        <p>
          We use this information to respond to your quote request, send the planning tips you signed up for, and understand
          which styles people want. We do not sell your personal information.
        </p>
        <h2>Who sees it</h2>
        <p>
          Our team, plus the service providers that host the site, store data, take payments, manage customer
          relationships (our CRM), schedule calls or send email and texts on our behalf. When you book, we share what is
          needed to fill your order (your name, phone, delivery address, venue, date, times and items) with the delivery,
          setup and supply partners who work on it. Everyone we share with may only use it to provide those services.
        </p>
        <p>
          We may also share information when the law requires it, to protect our rights or someone&apos;s safety, or if the
          business is sold or merged, in which case this policy still applies to it.
        </p>
        <h2>How long we keep it</h2>
        <p>
          We keep quote requests and messages for up to three years so we can help with your next event, and booking and
          payment records for as long as tax and accounting rules require (usually seven years). Ask us and we&apos;ll
          delete anything we don&apos;t have to keep.
        </p>
        <h2>Keeping it safe</h2>
        <p>
          We use secure connections, password-protected systems and well-known service providers. No system is perfectly
          safe, so please don&apos;t send card numbers or passwords by email or chat. If there is ever a breach that
          affects you, we&apos;ll tell you as the law requires.
        </p>
        <h2>Children</h2>
        <p>
          This site is for adults planning events. We don&apos;t knowingly collect information from children under 13.
        </p>
        <h2>Your choices</h2>
        <p>
          You can ask us to access, correct or delete your information, or unsubscribe from emails at any time by
          writing to <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <h2 id="cookies">Cookies and local storage</h2>
        <p>
          We store a random visitor identifier in your browser&apos;s local storage so your saved chairs persist, and a
          note of how you arrived (for example &ldquo;google / organic&rdquo; and your first page), which is only sent
          to us if you submit a form. We use Google Analytics to understand, in aggregate, how visitors use the site; it
          sets first-party cookies, and you can opt out with Google&apos;s{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer">browser add-on</a>. We don&apos;t
          use advertising cookies.
        </p>
        <p>
          We also keep a short list of the pages you open on this site, when you opened them, and the links and buttons
          you click (never what you type). It stays in your browser. If you send us a form, it comes along so we can
          answer with what you were looking at, along with your rough location from your internet address and the
          kind of device you used. You can say no in the notice at the bottom of the page, which clears the list and
          turns off Google Analytics. If your browser sends a Global Privacy Control signal, we treat that as a no.
        </p>
        <p>
          After you send us a form with your email, we keep noting the pages you open, the buttons you click and the
          items on your quote list when you come back on the same device, and store them with your enquiry. We use this
          to answer you better and, at most once for each kind, to email a short reminder: a quote list you didn&apos;t
          send, an item you kept looking at, or an event date that is getting close. Saying no in the notice stops
          this, and the unsubscribe link in any email stops every reminder.
        </p>
        <h2>Chat</h2>
        <p>
          If you message us through the chat button, what you type and the contact details you share are stored in our
          customer system so we can reply. When live chat is on, it is provided by HubSpot, which loads only after you
          open the chat and may set its own cookies to keep your conversation going.
        </p>
        <ChatDataFlow />
        <h2>Changes and questions</h2>
        <p>
          If we change this policy, we&apos;ll update the date at the top. Questions? Email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </div>
  );
}

// Flowchart of where a chat message goes, so the policy is visual and not text only.
const flow = [
  { title: "You", note: "send a chat or message" },
  { title: "Chat panel", note: "HubSpot or our form" },
  { title: "Our customer system", note: "stored securely" },
  { title: "Our team", note: "replies to you" },
];

function ChatDataFlow() {
  return (
    <figure className="my-10" aria-labelledby="chat-flow-caption">
      <ol className="m-0 flex list-none flex-col items-stretch gap-2 p-0 sm:flex-row sm:items-center">
        {flow.map((f, i) => (
          <li key={f.title} className="m-0 flex flex-col items-center gap-2 sm:flex-1 sm:flex-row">
            <div className="w-full rounded-md border border-gold/60 bg-surface px-3 py-3 text-center">
              <span className="block font-heading font-semibold text-lg leading-tight text-ink">{f.title}</span>
              <span className="mt-1 block text-xs tracking-wide text-muted">{f.note}</span>
            </div>
            {i < flow.length - 1 && (
              <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0 rotate-90 text-gold sm:rotate-0" aria-hidden>
                <path d="M1 7h11M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            )}
          </li>
        ))}
      </ol>
      <figcaption id="chat-flow-caption" className="mt-3 text-center text-xs text-muted">
        How a chat message reaches us. We never sell it or use it for advertising.
      </figcaption>
    </figure>
  );
}
