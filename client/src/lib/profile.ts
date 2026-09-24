import { api } from "./api";

export interface ProfileScores {
  overall: number;
  reasoning: number;
  evidence: number;
  counterArgument: number;
  consistency: number;
  adaptability: number;
}

export interface RecentEvaluationSummary {
  evaluationId: string;
  debateId: string;
  scenarioId: string;
  overallScore: number;
  createdAt: string;
}

export interface UserProfile {
  totalEvaluations: number;
  averageScores: ProfileScores;
  recentEvaluations: RecentEvaluationSummary[];
}

export interface EvaluationDetails {
  _id: string;
  debateId: string;
  scenarioId: string;
  overallScore: number;
  reasoningScore: number;
  evidenceScore: number;
  counterArgumentScore: number;
  consistencyScore: number;
  adaptabilityScore: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  createdAt: string;
}

export function getProfile() {
  return api.get<{ profile: UserProfile }>("/profile");
}

export function getEvaluationDetails(evaluationId: string) {
  return api.get<{ evaluation: EvaluationDetails }>(
    `/evaluations/${encodeURIComponent(evaluationId)}`,
  );
}
