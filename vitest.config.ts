import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/types.ts"],
      reporter: [
        ["text", { skipEmpty: true }],
        ["html", { skipEmpty: true }],
        ["clover"],
        ["json"],
      ],
    },
  },
});
