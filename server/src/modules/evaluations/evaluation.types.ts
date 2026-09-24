import type { Types } from "mongoose";

export interface IEvaluation {
  debateId: Types.ObjectId;
  userId: Types.ObjectId;
  scenarioId: Types.ObjectId;

  overallScore: number;
  reasoningScore: number;
  evidenceScore: number;
  counterArgumentScore: number;
  consistencyScore: number;
  adaptabilityScore: number;

  strengths: string[];
  weaknesses: string[];
  feedback: string;

  createdAt: Date;
  updatedAt: Date;
}