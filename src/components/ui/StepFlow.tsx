import { Icon, type IconName } from "./Icon";

export type Step = { title: string; text: string; icon?: IconName };

// Visual flowchart as an ordered list (crawlable). Horizontal on desktop, vertical on phones.
// `vertical` keeps it stacked at every width (use it inside article columns or for 6+ steps).
export function StepFlow({
  steps,
  caption,
  vertical = false,
  className = "",
}: {
  steps: Step[];
  caption?: string;
  vertical?: boolean;
  className?: string;
}) {
  const cols = vertical ? "" : ({ 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" }[steps.length] ?? "md:grid-cols-4");
  const h = (cls: string) => (vertical ? "" : cls);
  return (
    <figure className={className}>
      <ol className={`grid gap-0 ${vertical ? "" : "md:gap-6"} ${cols}`}>
        {steps.map((s, i) => (
          <li key={s.title} className={`relative flex gap-4 pb-8 ${h("md:flex-col md:pb-0")}`}>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={`absolute top-12 bottom-0 left-6 w-px bg-gradient-to-b from-accent/60 to-accent/10 ${h("md:top-6 md:right-[-1.5rem] md:bottom-auto md:left-14 md:h-px md:w-auto md:bg-gradient-to-r")}`}
              />
            )}
            <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-accent-ink shadow-soft ring-4 ring-accent-soft">
              {s.icon ? <Icon name={s.icon} size={22} /> : <span className="font-heading font-semibold text-xl">{i + 1}</span>}
            </span>
            <span className={h("md:mt-2")}>
              <span className="text-xs font-semibold tracking-wide text-accent uppercase">Step {i + 1}</span>
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
