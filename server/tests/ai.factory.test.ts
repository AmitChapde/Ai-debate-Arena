import { describe, expect, it, vi } from "vitest";

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    constructor(_options: unknown) {}
  },
}));

import { createAIProvider } from "../src/modules/ai/ai.factory.js";
import { GeminiProvider } from "../src/modules/ai/providers/gemini.provider.js";
import { OllamaProvider } from "../src/modules/ai/providers/ollama.provider.js";

describe("AI provider factory", () => {
  it('returns OllamaProvider for "ollama"', () => {
    expect(createAIProvider("ollama")).toBeInstanceOf(OllamaProvider);
  });

  it('returns GeminiProvider for "gemini"', () => {
    expect(createAIProvider("gemini")).toBeInstanceOf(GeminiProvider);
  });

  it("rejects an unsupported provider", () => {
    expect(() => createAIProvider("openai" as never)).toThrow(
      "Unsupported AI provider: openai",
    );
  });
});
