import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "happy-dom",
    include: ["packages/*/__tests__/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
  },
});
