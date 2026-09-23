import type { IAgent } from "../../agents/agent.types.js";
import type { IScenario } from "../../scenarios/scenario.types.js";

export interface DebatePromptContext {
  agent: IAgent;

  scenario: IScenario;

  userDecision: string;

  conversationHistory?: DebateMessage[];
}

export interface DebateMessage {
  speaker: "user" | "agent";

  content: string;
}