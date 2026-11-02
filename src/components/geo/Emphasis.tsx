// Renders "Event chairs for *Lincoln Park* celebrations" with the starred phrase in gold italics.
export function Emphasis({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <em key={i} className="text-gold">
            {p}
          </em>
        ) : (
          p
        ),
      )}
    </>
  );
}

export const plain = (text: string) => text.replace(/\*/g, "");
