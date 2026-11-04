import { Icon } from "./Icon";

// Shows the first part of a long text block and folds the rest under "Read more".
// The folded text uses a native <details>, so it stays in the HTML for search engines.
export function ReadMore({
  lead,
  children,
  label = "Read more",
  className = "",
}: {
  lead: React.ReactNode;
  children?: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {lead}
      {children && (
        <details className="group mt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">{label}</span>
            <span className="hidden group-open:inline">Show less</span>
            <Icon name="plus" size={14} className="transition-transform group-open:rotate-45" />
          </summary>
          <div className="mt-4">{children}</div>
        </details>
      )}
    </div>
  );
}
