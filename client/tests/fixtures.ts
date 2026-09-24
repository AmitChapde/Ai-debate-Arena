import type { Scenario } from "@/lib/scenarios";
import type { Debate } from "@/lib/debates";

export const scenario: Scenario = {
  _id: "scenario-1",
  title: "Remote work policy",
  description: "Decide whether the company should adopt remote work.",
  category: "business",
  difficulty: "medium",
  context: "The company is reviewing its work policy.",
  positions: [
    { id: "support", label: "Support remote work", description: "Allow employees to work remotely." },
    { id: "oppose", label: "Oppose remote work", description: "Keep the team in the office." },
  ],
  constraints: ["Keep customer coverage in place."],
  evaluationCriteria: ["Reasoning", "Evidence"],
  status: "published",
};

export const debate: Debate = {
  _id: "debate-1",
  userId: "user-1",
  scenarioId: scenario._id,
  selectedPosition: "support",
  status: "active",
  currentTurn: "user_response",
  currentRound: 1,
  messages: [
    { speaker: "advocate", content: "Remote work expands the talent pool.", round: 1, createdAt: "2026-01-01T00:00:00Z" },
    { speaker: "challenger", content: "How will you maintain team coordination?", round: 1, createdAt: "2026-01-01T00:01:00Z" },
  ],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:01:00Z",
};

