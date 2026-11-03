"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

export function EmbedBuilder({ tools, siteUrl, siteName }: { tools: { slug: string; name: string }[]; siteUrl: string; siteName: string }) {
  const [slug, setSlug] = useState(tools[0]?.slug ?? "");
  const [ref, setRef] = useState("");
  const [copied, setCopied] = useState(false);
  const t = tools.find((x) => x.slug === slug) ?? tools[0];
  const clean = ref.replace(/^https?:\/\//, "").replace(/[^\w.-]/g, "").slice(0, 60);
  const id = `bc-${slug}`;
  const code = `<iframe id="${id}" src="${siteUrl}/embed/${slug}${clean ? `?ref=${clean}` : ""}" title="${t.name} by ${siteName}" width="100%" height="900" style="border:0;max-width:100%" loading="lazy"></iframe>
<p style="font-size:13px"><a href="${siteUrl}/tools/${slug}">${t.name}</a> by ${siteName}</p>
<script>addEventListener("message",function(e){if(e.origin==="${siteUrl}"&&e.data&&e.data.bcEmbedHeight&&e.data.tool==="${slug}"){document.getElementById("${id}").style.height=e.data.bcEmbedHeight+"px"}})</script>`;

  return (
    <div className="card grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-5">
        <div>
          <label htmlFor="eb-tool" className="label">Calculator</label>
          <select id="eb-tool" className="field" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {tools.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="eb-ref" className="label">Your website (optional)</label>
          <input id="eb-ref" className="field" placeholder="yourvenue.com" value={ref} onChange={(e) => setRef(e.target.value)} />
          <p className="hint">So we can see which partner sites send visitors. Nothing else is tracked.</p>
        </div>
        <a href={`/embed/${slug}`} target="_blank" rel="noopener" className="link text-sm">Preview it full screen</a>
      </div>
      <div>
        <label htmlFor="eb-code" className="label">Paste this into your page&apos;s HTML</label>
        <textarea id="eb-code" readOnly rows={9} value={code} className="field font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
        <button
          type="button"
          className="btn-primary mt-3"
          onClick={async () => {
            await navigator.clipboard?.writeText(code).catch(() => {});
            setCopied(true);
            track("embed_code_copy", { tool: slug });
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "Copied" : "Copy the code"}
        </button>
      </div>
    </div>
  );
}
