// Shown once at the bottom of every post via ArticleLayout, so AI search and readers see who wrote it.
export function AuthorBio() {
  return (
    <div className="mt-14 flex items-start gap-4 rounded-2xl border border-line bg-surface-2/60 p-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-soft font-heading font-semibold text-gold">
        IK
      </div>
      <div>
        <p className="font-heading font-semibold text-ink">Isha Kaur</p>
        <p className="text-sm text-muted">Founder, Beyond Chiavari</p>
        <p className="mt-2 text-sm text-muted">
          Isha started Beyond Chiavari in St. Charles, IL so hosts could get chairs, tables, linens and more on one
          quote, instead of calling around to separate companies.
        </p>
      </div>
    </div>
  );
}
