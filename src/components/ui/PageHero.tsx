import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

// Top-of-page hero for inner pages. Pass `media` (an image, Figure or illustration)
// so no page opens text-only.
export function PageHero({
  eyebrow,
  title,
  intro,
  actions,
  media,
  breadcrumbs,
  meta,
  tone = "sand",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  actions?: React.ReactNode;
  media?: React.ReactNode;
  breadcrumbs?: Crumb[];
  meta?: React.ReactNode;
  tone?: "sand" | "default" | "dark";
}) {
  const toneClass = tone === "sand" ? "tone-sand" : tone === "dark" ? "tone-dark bg-espresso" : "";
  return (
    <header className={`${toneClass} border-b border-line`}>
      <div className="container-x pt-6 pb-10 md:pt-10 md:pb-20">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-6 md:mb-12" />}
        <div className={`grid items-center gap-10 ${media ? "lg:grid-cols-[1.1fr_1fr] lg:gap-16" : ""}`}>
          <div className="animate-rise">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="display-1 mt-4">{title}</h1>
            {intro && <div className="lede mt-6 max-w-2xl">{intro}</div>}
            {actions && <div className="cta-row mt-8">{actions}</div>}
            {meta && <div className="mt-8 text-sm text-muted">{meta}</div>}
          </div>
          {media && <div className="animate-rise [animation-delay:150ms]">{media}</div>}
        </div>
      </div>
    </header>
  );
}
