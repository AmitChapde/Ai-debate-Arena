import { api } from "./api";

export type ScenarioCategory =
  | "business"
  | "technology"
  | "leadership"
  | "ethics"
  | "crisis"
  | "strategy";

export type ScenarioDifficulty =
  | "easy"
  | "medium"
  | "hard"
  | "expert";

export interface ScenarioPosition {
  id: string;
  label: string;
  description: string;
}

export interface Scenario {
  _id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  difficulty: ScenarioDifficulty;
  context: string;
  positions: ScenarioPosition[];
  constraints: string[];
  evaluationCriteria: string[];
  status: "draft" | "published";
}

interface ScenariosResponse {
  scenarios: Scenario[];
}

interface ScenarioResponse {
  scenario: Scenario;
}

export async function getScenarios(params?: {
  category?: string;
  difficulty?: string;
  status?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.category) {
    searchParams.set("category", params.category);
  }

  if (params?.difficulty) {
    searchParams.set("difficulty", params.difficulty);
  }

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();

  return api.get<ScenariosResponse>(
    `/scenarios${query ? `?${query}` : ""}`,
  );
}

export async function getScenario(id: string) {
  return api.get<ScenarioResponse>(
    `/scenarios/${id}`,
  );
}