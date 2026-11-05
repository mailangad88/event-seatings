import type { PortableTextBlock } from "sanity";
import { urlForImage } from "./image";

type Span = { _type: "span"; text: string; marks?: string[] };

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderSpan(span: Span, markDefs: { _key: string; href?: string }[]) {
  let text = escapeHtml(span.text);
  for (const mark of span.marks ?? []) {
    if (mark === "strong") text = `<strong>${text}</strong>`;
    else if (mark === "em") text = `<em>${text}</em>`;
    else {
      const def = markDefs.find((d) => d._key === mark);
      if (def?.href) text = `<a href="${escapeHtml(def.href)}">${text}</a>`;
    }
  }
  return text;
}

const tagFor: Record<string, string> = { normal: "p", h2: "h2", h3: "h3", blockquote: "blockquote" };

/**
 * Minimal Portable Text → HTML serializer matching the subset of tags the Markdown pipeline
 * produces (p/h2/h3/blockquote/figure), so the rest of the blog rendering (table of contents,
 * FAQPage extraction, PostBody) works unchanged for Sanity-authored posts.
 */
export function portableTextToHtml(blocks: PortableTextBlock[] = []): string {
  return blocks
    .map((block) => {
      if (block._type === "image") {
        const img = block as unknown as { asset?: { _ref: string }; alt?: string };
        const url = urlForImage(img as never)?.width(1200).url();
        if (!url) return "";
        return `<figure><img src="${url}" alt="${escapeHtml(img.alt ?? "")}" loading="lazy" /></figure>`;
      }
      if (block._type !== "block") return "";
      const tag = tagFor[(block.style as string) ?? "normal"] ?? "p";
      const html = ((block.children as Span[]) ?? []).map((s) => renderSpan(s, (block.markDefs as never) ?? [])).join("");
      return `<${tag}>${html}</${tag}>`;
    })
    .join("\n");
}
