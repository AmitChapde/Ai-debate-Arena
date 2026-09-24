export type AgentRole =
  | "advocate"
  | "challenger"
  | "judge";

export type AgentStatus =
  | "active"
  | "inactive";

import type { AIProviderName } from "../ai/ai.types.js";

export type AIProvider = AIProviderName;

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
