"use client";

import { useEffect, useRef } from "react";

// Wrapper for /embed/* pages shown inside other sites' iframes. It covers the site chrome,
// opens every link in a new tab (tagged with the embedding site), and reports its height
// so the snippet can resize the iframe.
export function EmbedFrame({ children, tool }: { children: React.ReactNode; tool: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ref_ = new URLSearchParams(window.location.search).get("ref")?.replace(/[^\w.-]/g, "").slice(0, 60) || "embed";
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || !a.href || a.href.startsWith("javascript:")) return;
      e.preventDefault();
      const url = new URL(a.href, window.location.href);
      if (url.origin === window.location.origin) {
        url.searchParams.set("utm_source", ref_);
        url.searchParams.set("utm_medium", "embed");
        url.searchParams.set("utm_campaign", tool);
      }
      window.open(url.toString(), "_blank", "noopener");
    };
    el.addEventListener("click", onClick);
    const post = () => window.parent?.postMessage({ bcEmbedHeight: el.scrollHeight + 8, tool }, "*");
    const ro = new ResizeObserver(post);
    ro.observe(el);
    post();
    return () => {
      el.removeEventListener("click", onClick);
      ro.disconnect();
    };
  }, [tool]);
  return (
    <div className="fixed inset-0 z-[200] overflow-auto bg-bg">
      <div ref={ref}>{children}</div>
    </div>
  );
}
