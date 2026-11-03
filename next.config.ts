import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The planning assistant searches the guides at request time, so ship the Markdown with its function.
  outputFileTracingIncludes: {
    "/api/assistant": ["./content/blog/**/*.md"],
  },
};

export default nextConfig;
