export type AIProviderName =
  | "gemini"
  | "openai"
  | "groq"
  | "ollama";

export interface GenerateRequest {
  systemPrompt: string;

  userPrompt: string;

  temperature?: number;

  maxTokens?: number;

  responseMimeType?: "application/json";

  responseJsonSchema?: Record<string, unknown>;
}

export interface GenerateResponse {
  text: string;

  model: string;

  provider: AIProviderName;

  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}
