import type { Types } from "mongoose";

export type DebateStatus =
  | "created"
  | "active"
  | "judging"
  | "completed"
  | "abandoned";

export type DebateTurn =
  | "advocate"
  | "user_response"
  | "challenger"
  | "judge"
  | "completed";

export type DebateSpeaker =
  | "user"
  | "advocate"
  | "challenger"
  | "judge";

export interface DebateMessage {
  speaker: DebateSpeaker;

  content: string;

  round: number;

  createdAt: Date;
}

export interface DebateEvaluation {
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
}

export interface IDebate {
  userId: Types.ObjectId;

  scenarioId: Types.ObjectId;

  status: DebateStatus;

  currentTurn: DebateTurn;

  currentRound: number;

  selectedPosition: string;

  messages: DebateMessage[];

  evaluation?: DebateEvaluation;

  startedAt?: Date;

  completedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}