import { AuthorBio } from "./AuthorBio";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { Figure } from "./Figure";

export type TocItem = { id: string; label: string };

// Shell for guides, blog posts and SEO content pages: breadcrumb, title, hero visual,
// sticky table of contents and a sidebar slot (e.g. a quote card). Body goes in children
// (wrap markdown HTML in <div className="prose-post">).
export function ArticleLayout({
  breadcrumbs,
  eyebrow,
  title,
  intro,
  meta,
  hero,
  toc,
  aside,
  children,
}: {
  breadcrumbs: Crumb[];
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  meta?: React.ReactNode;
  hero?: { src: string; alt: string; caption?: string; width?: number; height?: number };
  toc?: TocItem[];
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article>
      <header className="tone-sand border-b border-line">
        <div className="container-x pt-8 pb-12 md:pb-16">
          <Breadcrumbs items={breadcrumbs} className="mb-10" />
          <div className="mx-auto max-w-3xl text-center">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="display-1 mt-4">{title}</h1>
            {intro && <p className="lede mx-auto mt-6 max-w-2xl">{intro}</p>}
            {meta && <div className="mt-6 text-sm text-muted">{meta}</div>}
          </div>
        </div>
      </header>
      {hero && (
        <div className="container-x -mt-px pt-10">
          <Figure
            src={hero.src}
            alt={hero.alt}
            caption={hero.caption}
            ratio="16/9"
            priority
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="mx-auto max-w-5xl"
          />
        </div>
      )}
      <div className="container-x grid gap-12 py-12 md:py-16 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        <aside className="hidden lg:block">
          {toc && toc.length > 0 && (
            <nav aria-label="On this page" className="sticky top-28">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">On this page</p>
              <ol className="mt-4 space-y-2 border-l border-line text-sm">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="-ml-px block border-l border-transparent pl-4 text-muted transition-colors hover:border-gold hover:text-ink">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </aside>
        <div className="min-w-0">
          {children}
          <AuthorBio />
        </div>
        <aside className="min-w-0">{aside && <div className="sticky top-28 space-y-6">{aside}</div>}</aside>
      </div>
    </article>
  );
}
