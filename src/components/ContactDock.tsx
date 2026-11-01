"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { contact, OPEN_CHAT_EVENT, openerFor, quickQuestions } from "@/lib/contact";

// Floating "Questions?" button on every page. Opens a panel with every fast way to reach us:
// live chat (HubSpot, when NEXT_PUBLIC_HUBSPOT_PORTAL_ID is set) or a quick message form
// (saved as a "chat" lead, so it reaches the CRM like any other lead), plus text, WhatsApp,
// call and the free seating call. Channels without a value in .env stay hidden.

type HubSpotWindow = Window & {
  hsConversationsSettings?: Record<string, unknown>;
  hsConversationsOnReady?: Array<() => void>;
  HubSpotConversations?: { widget: { load: () => void; open: () => void; status: () => { loaded: boolean } } };
  gtag?: (...args: unknown[]) => void;
};

const HUBSPOT_SLOT = "bc-hubspot-chat";

function track(event: string, params: Record<string, string> = {}) {
  (window as HubSpotWindow).gtag?.("event", event, params);
}

// Loads HubSpot chat into our own panel (inline embed), only the first time someone opens it,
// so the script never slows down page loads for visitors who don't chat.
function loadHubSpotChat(portalId: string) {
  const w = window as HubSpotWindow;
  if (w.HubSpotConversations?.widget.status().loaded) return;
  const start = () => w.HubSpotConversations?.widget.load();
  if (w.HubSpotConversations) return start();
  w.hsConversationsSettings = { loadImmediately: false, inlineEmbedSelector: `#${HUBSPOT_SLOT}` };
  w.hsConversationsOnReady = [...(w.hsConversationsOnReady ?? []), start];
  if (!document.getElementById("hs-script-loader")) {
    const s = document.createElement("script");
    s.id = "hs-script-loader";
    s.async = true;
    s.defer = true;
    s.src = `https://js.hs-scripts.com/${portalId}.js`;
    document.body.appendChild(s);
  }
}

const hidden = ["/admin", "/render"];

export function ContactDock() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [question, setQuestion] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hubspot = Boolean(contact.hubspotPortalId);

  const show = useCallback((q?: string) => {
    setOpen(true);
    setEverOpened(true);
    if (q) setQuestion(q);
    track("contact_open", { page: window.location.pathname });
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => show((e as CustomEvent<string | undefined>).detail);
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    // Links like beyondchiavari.com/?chat=1 (emails, Instagram bio) open the dock on arrival.
    const auto = new URLSearchParams(window.location.search).has("chat") ? setTimeout(() => show(), 400) : undefined;
    return () => {
      window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
      clearTimeout(auto);
    };
  }, [show]);

  useEffect(() => {
    if (open && hubspot) loadHubSpotChat(contact.hubspotPortalId);
    if (open) panelRef.current?.focus();
  }, [open, hubspot]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (hidden.some((p) => pathname.startsWith(p))) return null;

  const opener = encodeURIComponent(openerFor(pathname));
  const channels = [
    contact.smsPhone && { label: "Text us", href: `sms:${contact.smsPhone}?&body=${opener}`, method: "sms", icon: TextIcon },
    contact.whatsapp && { label: "WhatsApp", href: `https://wa.me/${contact.whatsapp}?text=${opener}`, method: "whatsapp", icon: WhatsAppIcon },
    contact.phone && { label: "Call", href: `tel:${contact.phone}`, method: "call", icon: PhoneIcon },
  ].filter(Boolean) as { label: string; href: string; method: string; icon: () => React.ReactElement }[];

  return (
    <>
      {everOpened && (
        <div
          ref={panelRef}
          id="contact-dock"
          role="dialog"
          aria-modal="false"
          aria-label="Contact us"
          tabIndex={-1}
          hidden={!open}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col border-t border-line bg-surface text-ink shadow-[0_-20px_60px_rgba(0,0,0,0.5)] outline-none sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[380px] sm:border"
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 pt-5 pb-4">
            <div>
              <p className="font-serif text-2xl font-light">How can we help?</p>
              <p className="mt-1 text-xs leading-5 text-muted">{contact.replyPromise}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className="-mr-2 p-2 text-muted transition-colors hover:text-ink"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {hubspot ? (
              <div id={HUBSPOT_SLOT} className="h-[440px] w-full" />
            ) : (
              <QuickMessage page={pathname} question={question} setQuestion={setQuestion} />
            )}
          </div>

          <div className="border-t border-line px-6 py-4">
            {channels.length > 0 && (
              <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${channels.length}, minmax(0, 1fr))` }}>
                {channels.map((c) => (
                  <a
                    key={c.method}
                    href={c.href}
                    target={c.method === "whatsapp" ? "_blank" : undefined}
                    rel={c.method === "whatsapp" ? "noopener" : undefined}
                    onClick={() => track("contact_click", { method: c.method, page: pathname })}
                    className="flex items-center justify-center gap-2 border border-line py-2.5 text-[11px] tracking-[0.18em] uppercase transition-colors hover:border-gold hover:text-gold"
                  >
                    <c.icon />
                    {c.label}
                  </a>
                ))}
              </div>
            )}
            {contact.bookingUrl ? (
              <a
                href={contact.bookingUrl}
                target="_blank"
                rel="noopener"
                onClick={() => track("contact_click", { method: "booking", page: pathname })}
                className="block bg-gold py-3 text-center text-[11px] font-medium tracking-[0.22em] text-accent-ink uppercase transition-opacity hover:opacity-90"
              >
                Book a free 15-minute seating call
              </a>
            ) : (
              <Link
                href="/quote"
                onClick={() => setOpen(false)}
                className="block bg-gold py-3 text-center text-[11px] font-medium tracking-[0.22em] text-accent-ink uppercase transition-opacity hover:opacity-90"
              >
                Request a free quote
              </Link>
            )}
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        aria-expanded={open}
        aria-controls="contact-dock"
        className={`fixed right-4 bottom-4 z-50 flex items-center gap-2.5 rounded-full border border-gold/60 bg-espresso/95 py-3 pr-5 pl-4 text-ink shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur transition-all hover:border-gold hover:text-gold sm:right-6 sm:bottom-6 ${
          open ? "max-sm:hidden" : ""
        }`}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
        <span className="text-[11px] tracking-[0.22em] uppercase">{open ? "Close" : "Questions? Chat"}</span>
      </button>
    </>
  );
}

function QuickMessage({
  page,
  question,
  setQuestion,
}: {
  page: string;
  question: string;
  setQuestion: (q: string) => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, kind: "chat", source: `chat:${page}`.slice(0, 100) }),
    }).catch(() => null);
    if (res?.ok) {
      track("generate_lead", { method: "chat", page });
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="px-6 py-8">
        <p className="font-serif text-2xl font-light italic">Got it, thank you.</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your message is with our team. We&apos;ll reply by text or email, whichever you left us.
        </p>
      </div>
    );
  }

  const field =
    "w-full border-0 border-b border-line bg-transparent px-0 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-gold focus:ring-0 focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-3 px-6 py-5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuestion(q)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              question === q ? "border-gold text-gold" : "border-line text-muted hover:border-gold/60 hover:text-ink"
            }`}
          >
            {q}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor="chat-message">Your question</label>
      <textarea
        id="chat-message"
        name="message"
        required
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask us anything: dates, styles, pricing, delivery…"
        className={`${field} resize-none`}
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sr-only" htmlFor="chat-name">Name</label>
          <input id="chat-name" name="name" autoComplete="name" placeholder="Name" className={field} />
        </div>
        <div>
          <label className="sr-only" htmlFor="chat-date">Event date</label>
          <input id="chat-date" name="event_date" type="date" aria-label="Event date" className={field} />
        </div>
      </div>
      <label className="sr-only" htmlFor="chat-email">Email</label>
      <input id="chat-email" name="email" type="email" required autoComplete="email" placeholder="Email (so we can reply)" className={field} />
      <label className="sr-only" htmlFor="chat-phone">Mobile (optional)</label>
      <input id="chat-phone" name="phone" type="tel" autoComplete="tel" placeholder="Mobile, if you'd prefer a text back" className={field} />
      <button
        disabled={status === "sending"}
        className="mt-1 w-full border border-gold py-3 text-[11px] font-medium tracking-[0.22em] text-gold uppercase transition-colors hover:bg-gold hover:text-accent-ink disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}

const svg = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, "aria-hidden": true } as const;

function ChatIcon() {
  return (
    <svg {...svg} width={18} height={18}>
      <path d="M4 5h16v11H9l-5 4V5z" strokeLinejoin="round" />
      <path d="M8 10h8M8 13h5" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg {...svg}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
function TextIcon() {
  return (
    <svg {...svg}>
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <path d="M10 18.5h4" strokeLinecap="round" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg {...svg}>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19l-4 1z" strokeLinejoin="round" />
      <path d="M9.5 8.5c0 3 2.5 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2-1.5 1z" strokeLinejoin="round" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg {...svg}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
    </svg>
  );
}
