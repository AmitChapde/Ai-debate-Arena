import { GeminiProvider } from "./providers/gemini.provider.js";
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

    case "openai":
      throw new Error(
        "OpenAI provider is not implemented yet"
      );

    case "groq":
      throw new Error(
        "Groq provider is not implemented yet"
      );

    case "ollama":
      return new OllamaProvider();

    default:
      throw new Error(
        `Unsupported AI provider: ${provider}`
      );
  }
}
