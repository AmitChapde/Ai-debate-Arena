export type AIProviderName =
  | "gemini"
  | "ollama";

export interface GenerateRequest {
  systemPrompt: string;
  userPrompt: string;

  /**
   * Model selected by the agent configuration.
   *
   * The selected provider receives this value as its model identifier.
   */
  model?: string;

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
