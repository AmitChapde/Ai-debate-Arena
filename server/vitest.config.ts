import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      include: [
        "src/modules/debates/debate.validation.ts",
        "src/modules/ai/ai.factory.ts",
        "src/modules/debates/debate.engine.ts",
      ],
      reporter: ["text", "html"],
    },
  },
});
