import { GeminiProvider } from "./providers/gemini.provider.js";
import { GroqProvider } from "./providers/groq.provider.js";
import { OllamaProvider } from "./providers/ollama.provider.js";

import type {
  AIProvider
} from "./ai.provider.js";

import type {
  AIProviderName
} from "./ai.types.js";

export function createAIProvider(
  provider: AIProviderName
): AIProvider {
  switch (provider) {
    case "gemini":
      return new GeminiProvider();

    case "ollama":
      return new OllamaProvider();

    case "groq":
      return new GroqProvider();

    default:
      throw new Error(
        `Unsupported AI provider: ${provider}`
      );
  }
}
