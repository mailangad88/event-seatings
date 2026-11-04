import { Callout, FaqList, Figure, Icon, StatRow, StepFlow, type Faq, type TocItem } from "@/components/ui";
import { iconFor } from "@/lib/icon-for";

// "In this guide" cards: every section as a tappable card, so readers on phones
// (where the side table of contents is hidden) can see the shape of the guide and jump.
function JumpCards({ toc }: { toc: TocItem[] }) {
  const isFaq = (label: string) => /^frequently asked questions$/i.test(label);
  const nums = toc.map((_, i) => toc.slice(0, i + 1).filter((x) => !isFaq(x.label)).length);
  return (
    <nav aria-label="In this guide" className="my-10 rounded-2xl border border-line bg-surface-2/60 p-4 sm:p-5">
      <p className="eyebrow">In this guide</p>
      <ol className="-mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
        {toc.map((t, i) => {
          const faq = isFaq(t.label);
          const n = nums[i];
          return (
            <li key={t.id} className="w-56 shrink-0 snap-start sm:w-auto">
              <a href={`#${t.id}`} className="group card card-hover flex h-full items-center gap-3 p-3 text-sm leading-snug font-medium">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-soft text-gold">
                  {faq ? <Icon name="help" size={18} /> : <Icon name={iconFor(t.label, "book")} size={18} />}
                </span>
                <span className="min-w-0 flex-1 transition-colors group-hover:text-accent">
                  {!faq && <span className="mr-1.5 text-xs text-muted tabular-nums">{String(n).padStart(2, "0")}</span>}
                  {t.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Renders a journal post's Markdown HTML with the UI kit: the quick-answer box becomes a
// Callout, "flow" lists become a StepFlow, "stat-grid" blocks a StatRow, figures with an
// inline SVG diagram a Figure, and the FAQ section a FaqList (which also emits FAQPage schema).
// Everything else stays as prose. Post authors keep writing plain Markdown + those few blocks
// (see docs/journal-writing-guide.md).

type Block =
  | { kind: "html"; html: string }
  | { kind: "answer"; html: string }
  | { kind: "flow"; steps: { title: string; text: string }[] }
  | { kind: "stats"; stats: { value: string; label: string }[] }
  | { kind: "figure"; svg: string; caption: string }
  | { kind: "faq"; heading: string };

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const patterns: { re: RegExp; make: (m: RegExpExecArray) => Block | null }[] = [
  {
    re: /<div class="answer-box">([\s\S]*?)<\/div>/,
    make: (m) => ({ kind: "answer", html: m[1].replace(/<p>\s*<strong>Quick answer<\/strong>\s*<\/p>/i, "").trim() }),
  },
  {
    re: /<ol class="flow">([\s\S]*?)<\/ol>/,
    make: (m) => {
      const steps = [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li) => {
        const strong = li[1].match(/^\s*<strong>([\s\S]*?)<\/strong>([\s\S]*)$/);
        const title = text(strong ? strong[1] : li[1]).replace(/[:.]\s*$/, "");
        const rest = strong ? text(strong[2]).replace(/^[:.–-]\s*/, "") : "";
        return { title, text: rest };
      });
      return steps.length ? { kind: "flow", steps } : null;
    },
  },
  {
    re: /<div class="stat-grid">((?:\s*<div>\s*<strong>[\s\S]*?<\/strong>\s*<span>[\s\S]*?<\/span>\s*<\/div>)+)\s*<\/div>/,
    make: (m) => ({
      kind: "stats",
      stats: [...m[1].matchAll(/<strong>([\s\S]*?)<\/strong>\s*<span>([\s\S]*?)<\/span>/g)].map((s) => ({ value: text(s[1]), label: text(s[2]) })),
    }),
  },
  {
    re: /<figure>\s*(<svg[\s\S]*?<\/svg>)\s*(?:<figcaption>([\s\S]*?)<\/figcaption>)?\s*<\/figure>/,
    make: (m) => ({ kind: "figure", svg: m[1], caption: m[2] ?? "" }),
  },
];

function split(html: string): Block[] {
  const blocks: Block[] = [];
  let rest = html;
  while (rest) {
    let best: { i: number; m: RegExpExecArray; make: (m: RegExpExecArray) => Block | null } | null = null;
    for (const p of patterns) {
      const m = p.re.exec(rest);
      if (m && (!best || m.index < best.i)) best = { i: m.index, m, make: p.make };
    }
    if (!best) {
      blocks.push({ kind: "html", html: rest });
      break;
    }
    if (best.i > 0) blocks.push({ kind: "html", html: rest.slice(0, best.i) });
    blocks.push(best.make(best.m) ?? { kind: "html", html: best.m[0] });
    rest = rest.slice(best.i + best.m[0].length);
  }
  return blocks;
}

/** Cuts the "Frequently asked questions" section out of the HTML, leaving a marker block. */
function withFaqSection(html: string): Block[] {
  const m = html.match(/<h2[^>]*>Frequently asked questions<\/h2>[\s\S]*?(?=<h2|$)/);
  if (!m || m.index === undefined) return split(html);
  const heading = m[0].match(/<h2([^>]*)>/)?.[1] ?? "";
  return [
    ...split(html.slice(0, m.index)),
    { kind: "faq", heading },
    ...split(html.slice(m.index + m[0].length)),
  ];
}

export function PostBody({ html, faqs, toc = [] }: { html: string; faqs: Faq[]; toc?: TocItem[] }) {
  const blocks = withFaqSection(html);
  const jumpAt = toc.length >= 3 ? Math.max(0, blocks.findIndex((b) => b.kind === "answer")) : -1;
  return (
    <div className="max-w-2xl">
      {jumpAt === 0 && blocks[0]?.kind !== "answer" && <JumpCards toc={toc} />}
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "answer":
            return (
              <div key={i}>
                <Callout kind="check" title="Quick answer" className="my-8">
                  <div className="[&_p]:my-0" data-answer dangerouslySetInnerHTML={{ __html: b.html }} />
                </Callout>
                {i === jumpAt && <JumpCards toc={toc} />}
              </div>
            );
          case "flow":
            return <StepFlow key={i} vertical steps={b.steps} className="my-10" caption={b.steps.map((s) => s.title).join(", then ")} />;
          case "stats":
            return <StatRow key={i} stats={b.stats} className="my-10 md:grid-cols-3!" />;
          case "figure":
            return (
              <Figure key={i} className="my-10" caption={<span dangerouslySetInnerHTML={{ __html: b.caption }} />}>
                <div dangerouslySetInnerHTML={{ __html: b.svg }} />
              </Figure>
            );
          case "faq": {
            const id = b.heading.match(/id="([^"]+)"/)?.[1] ?? "frequently-asked-questions";
            return (
              <section key={i} className="my-14">
                <h2 id={id} className="mb-6 scroll-mt-28 font-heading font-semibold text-3xl leading-tight sm:text-4xl">
                  Frequently asked questions
                </h2>
                <FaqList faqs={faqs} />
              </section>
            );
          }
          default:
            return <div key={i} className="prose-post" dangerouslySetInnerHTML={{ __html: b.html }} />;
        }
      })}
    </div>
  );
}
