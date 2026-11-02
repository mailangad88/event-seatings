import { Reveal } from "../Reveal";

export type Tone = "default" | "sand" | "dark" | "white";

const tones: Record<Tone, string> = {
  default: "",
  white: "bg-surface",
  sand: "tone-sand",
  dark: "tone-dark bg-espresso",
};

// Standard page section: optional eyebrow, title, intro and a right-aligned action.
export function Section({
  id,
  eyebrow,
  title,
  intro,
  action,
  tone = "default",
  center = false,
  className = "",
  children,
}: {
  id?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  tone?: Tone;
  center?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const hasHead = eyebrow || title || intro || action;
  return (
    <section id={id} className={`${tones[tone]} ${className}`}>
      <div className="container-x section-y">
        {hasHead && (
          <Reveal
            className={`flex flex-wrap gap-6 ${center ? "flex-col items-center text-center" : "items-end justify-between"}`}
          >
            <div className={center ? "max-w-3xl" : "max-w-2xl"}>
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              {title && <h2 className="display-2 mt-3">{title}</h2>}
              {intro && <p className="lede mt-4">{intro}</p>}
            </div>
            {action}
          </Reveal>
        )}
        {children && <div className={hasHead ? "mt-10 md:mt-12" : ""}>{children}</div>}
      </div>
    </section>
  );
}
