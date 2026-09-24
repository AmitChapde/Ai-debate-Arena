import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/modules/debates/debate.service.js", () => ({
  getDebateById: vi.fn(),
  addMessage: vi.fn(),
  updateDebateTurn: vi.fn(),
  incrementDebateRound: vi.fn(),
  completeDebate: vi.fn(),
}));

vi.mock("../src/modules/scenarios/scenario.model.js", () => ({
  Scenario: { findById: vi.fn() },
}));

vi.mock("../src/modules/agents/agent.service.js", () => ({
  getActiveAgentByRole: vi.fn(),
}));

vi.mock("../src/modules/agents/agent.prompt.js", () => ({
  buildAgentSystemPrompt: vi.fn(() => "system prompt"),
}));

vi.mock("../src/modules/evaluations/evaluation.service.js", () => ({
  createEvaluation: vi.fn(),
}));

import {
  addMessage,
  getDebateById,
  incrementDebateRound,
  updateDebateTurn,
} from "../src/modules/debates/debate.service.js";
import { Scenario } from "../src/modules/scenarios/scenario.model.js";
import { getActiveAgentByRole } from "../src/modules/agents/agent.service.js";
import { DebateEngine } from "../src/modules/debates/debate.engine.js";
import { createAIProvider } from "../src/modules/ai/ai.factory.js";

const mockedGetDebate = vi.mocked(getDebateById);
const mockedAddMessage = vi.mocked(addMessage);
const mockedUpdateTurn = vi.mocked(updateDebateTurn);
const mockedIncrementRound = vi.mocked(incrementDebateRound);
const mockedScenarioFindById = vi.mocked(Scenario.findById);
const mockedGetAgent = vi.mocked(getActiveAgentByRole);

describe("debate round progression", () => {
  const generate = vi.fn().mockResolvedValue({ text: "challenger response" });
  const providerFactory = vi.fn(() => ({ generate })) as unknown as typeof createAIProvider;
  const engine = new DebateEngine(providerFactory);

  beforeEach(() => {
    vi.clearAllMocks();
    generate.mockResolvedValue({ text: "challenger response" });
    mockedScenarioFindById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ title: "Scenario" }),
    } as never);
    mockedGetAgent.mockResolvedValue({
      provider: "ollama",
      model: "llama3.2:3b",
      temperature: 0.2,
    } as never);
    mockedAddMessage.mockResolvedValue(null);
    mockedUpdateTurn.mockResolvedValue(null);
    mockedIncrementRound.mockResolvedValue(null);
  });

  async function runChallengerAtRound(currentRound: number) {
    mockedGetDebate.mockResolvedValue({
      currentTurn: "challenger",
      currentRound,
      scenarioId: "scenario-id",
      selectedPosition: "support",
      messages: [],
    } as never);

    await engine.generateChallengerResponse("debate-id");
  }

  it("advances from round 1 to round 2", async () => {
    await runChallengerAtRound(1);

    expect(mockedIncrementRound).toHaveBeenCalledWith("debate-id");
    expect(mockedUpdateTurn).toHaveBeenCalledWith("debate-id", "user_response");
  });

  it("advances from round 2 to round 3", async () => {
    await runChallengerAtRound(2);

    expect(mockedIncrementRound).toHaveBeenCalledWith("debate-id");
    expect(mockedUpdateTurn).toHaveBeenCalledWith("debate-id", "user_response");
  });

  it("moves round 3 to judging without starting round 4", async () => {
    await runChallengerAtRound(3);

    expect(mockedIncrementRound).not.toHaveBeenCalled();
    expect(mockedUpdateTurn).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTurn).toHaveBeenCalledWith("debate-id", "judge");
  });
});
