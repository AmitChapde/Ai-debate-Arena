import { api } from "./api";

export type DebateTurn =
  | "advocate"
  | "user_response"
  | "challenger"
  | "judge"
  | "completed";

export type DebateStatus =
  | "created"
  | "active"
  | "judging"
  | "completed"
  | "abandoned";

export type DebateSpeaker = "advocate" | "user" | "challenger" | "judge";

export interface DebateMessage {
  speaker: DebateSpeaker;
  content: string;
  round: number;
  createdAt: string;
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
  createdAt?: string;
}

export interface Debate {
  _id: string;
  userId: string;
  scenarioId: string;
  selectedPosition: string;
  status: DebateStatus;
  currentTurn: DebateTurn;
  currentRound: number;
  messages: DebateMessage[];
  evaluation?: DebateEvaluation;
  createdAt: string;
  updatedAt: string;
}

interface DebateResponse {
  debate: Debate;
}

interface DebateMessageResponse {
  message: DebateMessage;
}

interface DebateJudgeResponse {
  debate: Debate;
  evaluation: DebateEvaluation;
}

export function createDebate(data: {
  scenarioId: string;
  selectedPosition: string;
}) {
  return api.post<DebateResponse>("/debates", data);
}

export function getDebates() {
  return api.get<{ debates: Debate[] }>("/debates");
}

export function getDebate(id: string) {
  return api.get<DebateResponse>(`/debates/${id}`);
}

export function startDebate(id: string) {
  return api.post<{ debate: Debate; message: DebateMessage }>(
    `/debates/${id}/start`,
  );
}

export function submitDebateResponse(id: string, content: string) {
  return api.post<DebateMessageResponse>(`/debates/${id}/respond`, { content });
}

export function generateChallenge(id: string) {
  return api.post<{ debate: Debate; message: DebateMessage }>(
    `/debates/${id}/challenge`,
  );
}

export function judgeDebate(id: string) {
  return api.post<DebateJudgeResponse>(`/debates/${id}/judge`);
}
