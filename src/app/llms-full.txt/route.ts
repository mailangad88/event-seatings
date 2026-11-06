import { buildLlmsFullLines } from "@/lib/llms-content";

// llms-full.txt: the exhaustive plain-text map of the site for AI answer engines
// (ChatGPT, Perplexity, Gemini, Claude) that want every page, not just the overview
// in llms.txt.
export const revalidate = 3600;

export async function GET() {
  const lines = await buildLlmsFullLines();
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
