import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "happy-dom",
    include: ["packages/*/__tests__/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["packages/schema-form/src/**/*.{ts,tsx}"],
      exclude: ["packages/schema-form/src/index.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
