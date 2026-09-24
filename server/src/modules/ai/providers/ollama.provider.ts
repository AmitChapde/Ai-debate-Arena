import { env } from "../../../config/env.js";

import type { AIProvider } from "../ai.provider.js";

import type {
  GenerateRequest,
  GenerateResponse,
} from "../ai.types.js";

interface OllamaChatResponse {
  model?: string;

  message?: {
    content?: string;
  };

  prompt_eval_count?: number;

  eval_count?: number;
}

export class OllamaProvider implements AIProvider {
  async generate(
    request: GenerateRequest,
  ): Promise<GenerateResponse> {
    const model =
      request.model ?? env.OLLAMA_MODEL;

    const response = await fetch(
      `${env.OLLAMA_BASE_URL.replace(/\/$/, "")}/api/chat`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model,

          stream: false,

          messages: [
            {
              role: "system",
              content: request.systemPrompt,
            },
            {
              role: "user",
              content: request.userPrompt,
            },
          ],

          ...(request.responseJsonSchema
            ? {
                format:
                  request.responseJsonSchema,
              }
            : request.responseMimeType ===
                "application/json"
              ? {
                  format: "json",
                }
              : {}),

          options: {
            temperature:
              request.temperature ?? 0.7,

            num_predict:
              request.maxTokens ?? 1000,
          },
        }),
      },
    );

    if (!response.ok) {
      const detail =
        await response.text();

      throw new Error(
        `Ollama request failed (${response.status}): ${detail}`,
      );
    }

    const result =
      (await response.json()) as OllamaChatResponse;

    return {
      text:
        result.message?.content ?? "",

      model:
        result.model ?? model,

      provider: "ollama",

      usage: {
        inputTokens:
          result.prompt_eval_count,

        outputTokens:
          result.eval_count,

        totalTokens:
          result.prompt_eval_count !==
            undefined &&
          result.eval_count !==
            undefined
            ? result.prompt_eval_count +
              result.eval_count
            : undefined,
      },
    };
  }
}