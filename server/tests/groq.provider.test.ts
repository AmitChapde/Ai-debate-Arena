import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env.js", () => ({
  env: { GROQ_API_KEY: "unit-test-groq-api-key" },
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    constructor(_options: unknown) {}
  },
}));

import { createAIProvider } from "../src/modules/ai/ai.factory.js";
import type { GenerateRequest } from "../src/modules/ai/ai.types.js";
import { GeminiProvider } from "../src/modules/ai/providers/gemini.provider.js";
import { GroqProvider } from "../src/modules/ai/providers/groq.provider.js";
import { OllamaProvider } from "../src/modules/ai/providers/ollama.provider.js";
import { createAgentSchema } from "../src/modules/agents/agent.validation.js";

const mockFetch = vi.fn();

const baseRequest: GenerateRequest = {
  model: "openai/gpt-oss-120b",
  systemPrompt: "Follow the system rules.",
  userPrompt: "Respond to this debate.",
  temperature: 0.35,
  maxTokens: 512,
};

describe("Groq provider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "openai/gpt-oss-120b",
        choices: [{ message: { content: "A reasoned answer." } }],
        usage: { prompt_tokens: 24, completion_tokens: 18, total_tokens: 42 },
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("selects Groq and keeps the existing Ollama and Gemini factory choices", () => {
    expect(createAIProvider("groq")).toBeInstanceOf(GroqProvider);
    expect(createAIProvider("ollama")).toBeInstanceOf(OllamaProvider);
    expect(createAIProvider("gemini")).toBeInstanceOf(GeminiProvider);
  });

  it("routes the Agent model and constructs the Groq chat request", async () => {
    const result = await new GroqProvider().generate({
      ...baseRequest,
      responseMimeType: "application/json",
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer unit-test-groq-api-key",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "Follow the system rules." },
        { role: "user", content: "Respond to this debate." },
      ],
      temperature: 0.35,
      max_completion_tokens: 512,
      response_format: { type: "json_object" },
    });
    expect(result).toEqual({
      text: "A reasoned answer.",
      model: "openai/gpt-oss-120b",
      provider: "groq",
      usage: { inputTokens: 24, outputTokens: 18, totalTokens: 42 },
    });
  });

  it("forwards a JSON schema when requested", async () => {
    const schema = { type: "object", properties: { score: { type: "number" } } };
    await new GroqProvider().generate({
      ...baseRequest,
      responseJsonSchema: schema,
    });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      response_format: {
        type: "json_schema",
        json_schema: { name: "response", strict: true, schema },
      },
    });
  });

  it("accepts Groq in Agent validation without changing model or temperature", () => {
    const parsed = createAgentSchema.parse({
      name: "Groq Advocate",
      role: "advocate",
      description: "Presents a clear position in a debate.",
      personality: "Calm, evidence-led and respectful.",
      objectives: ["Defend the selected position"],
      rules: ["Use clear reasoning"],
      provider: "groq",
      model: "openai/gpt-oss-120b",
      temperature: 0.25,
    });
    expect(parsed).toMatchObject({
      provider: "groq",
      model: "openai/gpt-oss-120b",
      temperature: 0.25,
    });
  });
});
