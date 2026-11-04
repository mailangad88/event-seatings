import type { NextConfig } from "next";
import moved from "./src/data/moved-items.json";

const nextConfig: NextConfig = {
  // Items that moved category keep their old URLs working (e.g. inflatables once listed under tables).
  async redirects() {
    return moved.moved.map((m) => ({
      source: `/rentals/${m.from}/${m.id}`,
      destination: `/rentals/${m.to}/${m.id}`,
      permanent: true,
    }));
  },
  // Security headers. The CSP is deliberately minimal (no script-src) so analytics, experiments and Stripe keep
  // working; it only blocks plugins, <base> hijacking and framing by other sites.
  async headers() {
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
    ];
    const noStore = [{ key: "Cache-Control", value: "no-store" }];
    return [
      {
        // Everything except /embed/*, which other sites are meant to show in an iframe.
        source: "/((?!embed/).*)",
        headers: [
          ...common,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
        ],
      },
      {
        source: "/embed/:path*",
        headers: [...common, { key: "Content-Security-Policy", value: "frame-ancestors *; object-src 'none'; base-uri 'self'" }],
      },
      {
        // Images and fonts in public/ (not /_next/*, which is already cached for good). Browsers keep them a day and
        // refresh in the background for a week, so repeat visits don't re-download them. Only file URLs match, so
        // pages like /rentals/chairs are untouched.
        source: "/:dir(rentals|chairs|images|brand|social|blog|looks|answers|fonts)/:file*(webp|png|jpg|jpeg|avif|svg|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      { source: "/admin", headers: noStore },
      { source: "/admin/:path*", headers: noStore },
      { source: "/api/cron/:path*", headers: noStore },
      { source: "/api/unsubscribe", headers: noStore },
    ];
  },
  // AVIF first (smaller files for browsers that support it), WebP as the fallback.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The planning assistant searches the guides at request time, so ship the Markdown with its function.
  outputFileTracingIncludes: {
    "/api/assistant": ["./content/blog/**/*.md"],
  },
};

export default nextConfig;
