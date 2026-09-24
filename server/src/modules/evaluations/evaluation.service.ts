import { Types } from "mongoose";

import { Evaluation } from "./evaluation.model.js";
import { Debate } from "../debates/debate.model.js";

import type { IEvaluation } from "./evaluation.types.js";

export async function createEvaluation(data: {
  debateId: string;
  userId: string;
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
}): Promise<IEvaluation> {
  if (!Types.ObjectId.isValid(data.debateId)) {
    throw new Error("Invalid debate ID");
  }

  if (!Types.ObjectId.isValid(data.userId)) {
    throw new Error("Invalid user ID");
  }

  if (!Types.ObjectId.isValid(data.scenarioId)) {
    throw new Error("Invalid scenario ID");
  }

  const debate = await Debate.findById(data.debateId).lean();

  if (!debate) {
    throw new Error("Debate not found");
  }

  if (debate.userId.toString() !== data.userId) {
    throw new Error("Evaluation user does not match debate owner");
  }

  if (debate.scenarioId.toString() !== data.scenarioId) {
    throw new Error("Evaluation scenario does not match debate");
  }

  if (debate.status !== "completed") {
    throw new Error("Evaluation can only be created for completed debates");
  }

  const existing = await Evaluation.findOne({
    debateId: new Types.ObjectId(data.debateId),
  });

  if (existing) {
    throw new Error("Evaluation already exists for this debate");
  }

  return Evaluation.create({
    debateId: new Types.ObjectId(data.debateId),

    userId: new Types.ObjectId(data.userId),

    scenarioId: new Types.ObjectId(data.scenarioId),

    overallScore: data.overallScore,

    reasoningScore: data.reasoningScore,

    evidenceScore: data.evidenceScore,

    counterArgumentScore: data.counterArgumentScore,

    consistencyScore: data.consistencyScore,

    adaptabilityScore: data.adaptabilityScore,

    strengths: data.strengths,

    weaknesses: data.weaknesses,

    feedback: data.feedback,
  });
}
export async function getEvaluationByDebateId(
  debateId: string,
): Promise<IEvaluation | null> {
  if (!Types.ObjectId.isValid(debateId)) {
    return null;
  }

  return Evaluation.findOne({
    debateId: new Types.ObjectId(debateId),
  }).lean<IEvaluation>();
}

export async function getEvaluationById(
  evaluationId: string,
): Promise<IEvaluation | null> {
  if (!Types.ObjectId.isValid(evaluationId)) {
    return null;
  }

  return Evaluation.findById(evaluationId).lean<IEvaluation>();
}

export async function getUserEvaluations(
  userId: string,
): Promise<IEvaluation[]> {
  if (!Types.ObjectId.isValid(userId)) {
    return [];
  }

  return Evaluation.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({
      createdAt: -1,
    })
    .lean<IEvaluation[]>();
}
