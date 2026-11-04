import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for pure logic in src/lib and smoke tests for API routes. No browser, no network.
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL("./src/", import.meta.url)) },
      // "server-only" throws outside a React Server Components bundle; tests import server libs directly.
      { find: /^server-only$/, replacement: fileURLToPath(new URL("./tests/stubs/empty.ts", import.meta.url)) },
    ],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 10_000,
    // Keep env changes from one file out of the others.
    unstubEnvs: true,
    restoreMocks: true,
  },
});
