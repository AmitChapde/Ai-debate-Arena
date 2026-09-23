import {
  GoogleGenAI
} from "@google/genai";

import { env } from "../../../config/env.js";

import type {
  AIProvider
} from "../ai.provider.js";

import type {
  GenerateRequest,
  GenerateResponse
} from "../ai.types.js";

export class GeminiProvider
  implements AIProvider
{
  private readonly client: GoogleGenAI;

  constructor() {
    this.client =
      new GoogleGenAI({
        apiKey: env.GEMINI_API_KEY
      });
  }

  async generate(
    request: GenerateRequest
  ): Promise<GenerateResponse> {
    const response =
      await this.client.models.generateContent({
        model: "gemini-2.5-flash",

        contents: request.userPrompt,

        config: {
          systemInstruction:
            request.systemPrompt,

          temperature:
            request.temperature ?? 0.7,

          maxOutputTokens:
            request.maxTokens ?? 1000
        }
      });

    return {
      text: response.text ?? "",

      model: "gemini-2.5-flash",

      provider: "gemini",

      usage: {
        inputTokens:
          response.usageMetadata
            ?.promptTokenCount,

        outputTokens:
          response.usageMetadata
            ?.candidatesTokenCount,

        totalTokens:
          response.usageMetadata
            ?.totalTokenCount
      }
    };
  }
}   