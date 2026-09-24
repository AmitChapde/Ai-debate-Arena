import { env } from "../../../config/env.js";
import type { AIProvider } from "../ai.provider.js";
import type { GenerateRequest, GenerateResponse } from "../ai.types.js";

const GROQ_CHAT_COMPLETIONS_URL =
  "https://api.groq.com/openai/v1/chat/completions";

interface GroqChatCompletion {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class GroqProvider implements AIProvider {
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const model = request.model?.trim();
    if (!model) {
      throw new Error("Groq model must be supplied in the generation request");
    }

    const apiKey = env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is required to use the Groq provider");
    }

    const responseFormat = request.responseJsonSchema
      ? {
          type: "json_schema",
          json_schema: {
            name: "response",
            strict: true,
            schema: request.responseJsonSchema,
          },
        }
      : request.responseMimeType === "application/json"
        ? { type: "json_object" }
        : undefined;

    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        temperature: request.temperature ?? 0.7,
        max_completion_tokens: request.maxTokens ?? 1000,
        ...(responseFormat ? { response_format: responseFormat } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Groq request failed (${response.status}): ${detail}`);
    }

    const result = (await response.json()) as GroqChatCompletion;
    const usage = result.usage;

    return {
      text: result.choices?.[0]?.message?.content ?? "",
      model: result.model ?? model,
      provider: "groq",
      usage: {
        inputTokens: usage?.prompt_tokens,
        outputTokens: usage?.completion_tokens,
        totalTokens: usage?.total_tokens,
      },
    };
  }
}
