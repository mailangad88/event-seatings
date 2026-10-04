import path from "path";
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/remotion/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Let Remotion understand the "@/..." imports used across the site.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...(config.resolve?.alias ?? {}), "@": path.resolve(process.cwd(), "src") },
  },
}));
