import { Icon, type IconName } from "./Icon";

export type Step = { title: string; text: string; icon?: IconName };

// Visual flowchart as an ordered list (crawlable). Horizontal on desktop, vertical on phones.
export function StepFlow({ steps, caption, className = "" }: { steps: Step[]; caption?: string; className?: string }) {
  const cols = { 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" }[steps.length] ?? "md:grid-cols-4";
  return (
    <figure className={className}>
      <ol className={`grid gap-0 md:gap-6 ${cols}`}>
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-4 pb-8 md:flex-col md:pb-0">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute top-12 bottom-0 left-6 w-px bg-gradient-to-b from-gold/50 to-gold/10 md:top-6 md:right-[-1.5rem] md:bottom-auto md:left-14 md:h-px md:w-auto md:bg-gradient-to-r"
              />
            )}
            <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/40 bg-surface text-gold shadow-soft">
              {s.icon ? <Icon name={s.icon} size={22} /> : <span className="font-serif text-xl">{i + 1}</span>}
            </span>
            <span className="md:mt-2">
              <span className="text-xs font-semibold tracking-wide text-gold uppercase">Step {i + 1}</span>
              <span className="mt-1 block text-lg font-medium">{s.title}</span>
              <span className="mt-1 block leading-7 text-muted">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
      {caption && <figcaption className="sr-only">{caption}</figcaption>}
    </figure>
  );
}
