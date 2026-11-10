import type { LeadActivity } from "@/lib/store";

// Renders one line of a lead's timeline (lib/store.ts LeadActivity). The first line always shows; a call,
// quote edit or email with more behind it (the rest of the text, or the exact HTML that was sent) opens
// in place with <details> — no client JS needed. Shared by /admin/leads/<id> and /admin/communications so
// "exactly what was said" looks and works the same in both places (Angad, 2026-11-10).
export function ActivityEntryBody({ entry }: { entry: LeadActivity }) {
  const lines = entry.text.split("\n");
  const first = lines[0];
  const rest = lines.slice(1).join("\n").trim();
  if (!rest && !entry.html) return <p className="whitespace-pre-line text-sm">{entry.text}</p>;
  return (
    <details className="text-sm">
      <summary className="cursor-pointer marker:text-muted">{first}</summary>
      <div className="mt-2 space-y-2">
        {rest && <p className="whitespace-pre-line rounded-lg bg-surface-2 p-3">{rest}</p>}
        {entry.html && (
          <div>
            <p className="mb-1 text-xs text-muted">Exactly as sent:</p>
            <iframe srcDoc={entry.html} sandbox="" title="Email as sent" className="h-96 w-full rounded-lg border border-line bg-white" />
          </div>
        )}
      </div>
    </details>
  );
}
