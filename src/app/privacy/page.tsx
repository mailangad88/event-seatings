import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects and uses your information.`,
};

export default function PrivacyPage() {
  return (
    <div className="container-x max-w-3xl py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="headline mt-6 text-5xl sm:text-6xl">Privacy policy</h1>
      <p className="mt-4 text-sm text-muted">Last updated October 2026</p>
      <div className="prose-post mt-10">
        <p>
          {site.name} (&ldquo;we&rdquo;) is based in {site.city}. This page explains what we collect through this
          website and how we use it.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Quote requests:</strong> your name, email, phone (optional), event date, event type, guest count,
            city, venue, the chairs you selected and any message you write.
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
          We use this information to respond to your quote request, send launch news you signed up for, and decide
          which chairs to stock and in what quantities. We do not sell your personal information.
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
        <h2>Chat</h2>
        <p>
          If you message us through the chat button, what you type and the contact details you share are stored in our
          customer system so we can reply. When live chat is on, it is provided by HubSpot, which loads only after you
          open the chat and may set its own cookies to keep your conversation going.
        </p>
        <ChatDataFlow />
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
              <span className="block font-serif text-lg leading-tight text-ink">{f.title}</span>
              <span className="mt-1 block text-[11px] tracking-wide text-muted">{f.note}</span>
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
