import { site } from "@/lib/site";

// How booking works, as a visual flowchart. Plain HTML (an ordered list) so search engines and AI can read every step.
const steps: { title: string; text: string; icon: React.ReactNode }[] = [
  {
    title: "Choose",
    text: "Browse chairs or take the style quiz",
    icon: <path d="M7 4h10v7H7zM7 11v9M17 11v9M7 15h10" />,
  },
  {
    title: "Talk",
    text: `Free ${site.callLength} seating call`,
    icon: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />,
  },
  {
    title: "Proposal",
    text: "Itemized quote for your date and venue",
    icon: <path d="M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4" />,
  },
  {
    title: "Delivered & set",
    text: "We deliver and place every chair",
    icon: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-.1M17 19a2 2 0 1 0 0-.1" />,
  },
  {
    title: "Collected",
    text: "We pick up after the last dance",
    icon: <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />,
  },
];

export function ProcessFlow({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <figure className={className}>
      <ol
        className={`grid gap-4 ${compact ? "sm:grid-cols-5" : "md:grid-cols-5"}`}
        aria-label={`How renting chairs from ${site.name} works, step by step`}
      >
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center">
            <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/60 bg-surface text-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {s.icon}
              </svg>
            </span>
            {i < steps.length - 1 && (
              <span
                className="absolute top-14 left-7 h-[calc(100%-2.5rem)] w-px bg-gold/40 md:top-7 md:left-[calc(50%+1.75rem)] md:h-px md:w-[calc(100%-3.5rem+1rem)]"
                aria-hidden
              />
            )}
            <span className="pb-4 md:pb-0">
              <span className="block text-[11px] font-medium tracking-[0.22em] uppercase md:mt-4">
                {String(i + 1).padStart(2, "0")} · {s.title}
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="sr-only">
        Booking flow: choose your chairs, book a free call, receive an itemized proposal, we deliver and set up, then we collect.
      </figcaption>
    </figure>
  );
}
