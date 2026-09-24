export interface ProfileScores {
  overall: number;
  reasoning: number;
  evidence: number;
  counterArgument: number;
  consistency: number;
  adaptability: number;
}

export interface Profile {
  totalEvaluations: number;
  averageScores: ProfileScores;
  recentEvaluations: {
    evaluationId: string;
    debateId: string;
    scenarioId: string;
    overallScore: number;
    createdAt: Date;
  }[];
}