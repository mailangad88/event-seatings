import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Links prefetch on hover/touch via our wrapper (see src/components/Link.tsx), not on scroll.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/Link.tsx"],
    rules: {
      "no-restricted-imports": ["error", { paths: [{ name: "next/link", importNames: ["default"], message: 'Use "@/components/Link" so links prefetch on hover, not on scroll.' }] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
