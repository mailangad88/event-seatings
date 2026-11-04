import Link from "@/components/Link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { plannerEvents } from "@/lib/event-plan";

// "Come back" strip for guides and rental pages: save the date, this month's ideas, the vendor guide
// and the weather planner. Guesses the occasion from the page text so My Events opens pre-filled.
const guesses: [RegExp, string][] = [
  [/sangeet|mehndi|indian|desi|south asian/i, "indian-wedding"],
  [/quince|quinceañera|sweet 16|sweet-16/i, "quinceanera"],
  [/shower/i, "shower"],
  [/graduat|open house/i, "graduation"],
  [/kids|children|bounce/i, "kids"],
  [/corporate|gala|company|office|conference|fundrais/i, "corporate"],
  [/wedding|reception|ceremony|bridal|rehearsal/i, "wedding"],
  [/birthday|anniversary|party/i, "birthday"],
];

export function guessEvent(text: string) {
  return guesses.find(([re]) => re.test(text))?.[1];
}

export function PlanningLoop({ text = "", className = "" }: { text?: string; className?: string }) {
  const type = guessEvent(text);
  const ev = plannerEvents.find((e) => e.id === type);
  const items: { href: string; icon: IconName; title: string; text: string }[] = [
    { href: type ? `/my-events?new=${type}` : "/my-events", icon: "calendar", title: ev ? `Save your ${ev.name.toLowerCase()} date` : "Save your event date", text: "Countdown, dated checklist and calendar reminders. No account." },
    { href: "/ideas", icon: "spark", title: "Ideas for this month", text: "What Chicago hosts are planning and booking now." },
    { href: "/vendor-guide", icon: "users", title: "Who to hire, and when", text: "Your vendor list in booking order." },
    { href: "/tools/event-weather", icon: "light", title: "Sunset and weather", text: "When it gets dark on your date, and what to plan." },
  ];
  return (
    <section aria-labelledby="plan-loop" className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>
      <p id="plan-loop" className="eyebrow">Keep planning</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2">
              <Icon name={i.icon} size={22} className="mt-0.5 shrink-0 text-gold" />
              <span>
                <span className="block font-medium group-hover:text-gold">{i.title}</span>
                <span className="block text-sm text-muted">{i.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
