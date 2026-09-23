export type AgentRole =
  | "advocate"
  | "challenger"
  | "judge";

export type AgentStatus =
  | "active"
  | "inactive";

export type AIProvider =
  | "gemini"
  | "openai"
  | "groq"
  | "ollama";

export interface IAgent {
  name: string;

  role: AgentRole;

  description: string;

  personality: string;

  objectives: string[];

  rules: string[];

  provider: AIProvider;

  model: string;

  temperature: number;

  status: AgentStatus;

  createdAt: Date;
  updatedAt: Date;
}