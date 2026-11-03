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
};

export default nextConfig;
