import type { Types } from "mongoose";

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

export type ScenarioStatus =
  | "draft"
  | "published"
  | "archived";

export interface ScenarioPosition {
  id: string;
  label: string;
  description: string;
}

export interface IScenario {
  title: string;
  description: string;

  category: ScenarioCategory;

  difficulty: ScenarioDifficulty;

  context: string;

  positions: ScenarioPosition[];

  constraints: string[];

  evaluationCriteria: string[];

  status: ScenarioStatus;

  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}