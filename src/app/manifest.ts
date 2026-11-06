import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Lets phones offer "Add to Home Screen" with a branded icon and splash color.
// Served at /manifest.webmanifest (see metadata.manifest in layout.tsx).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6efe4",
    theme_color: "#7a1f2e",
    icons: [
      { src: "/brand/favicon-48.png", sizes: "48x48", type: "image/png" },
      { src: "/brand/mark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/mark-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
