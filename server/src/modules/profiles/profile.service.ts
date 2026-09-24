import { Types } from "mongoose";

import { Evaluation } from "../evaluations/evaluation.model.js";

import type {
  Profile,
} from "./profile.types.js";

export async function getUserProfile(
  userId: string,
): Promise<Profile> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const evaluations = await Evaluation.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  if (evaluations.length === 0) {
    return {
      totalEvaluations: 0,
      averageScores: {
        overall: 0,
        reasoning: 0,
        evidence: 0,
        counterArgument: 0,
        consistency: 0,
        adaptability: 0,
      },
      recentEvaluations: [],
    };
  }

  const totals = evaluations.reduce(
    (accumulator, evaluation) => {
      accumulator.overall += evaluation.overallScore;
      accumulator.reasoning += evaluation.reasoningScore;
      accumulator.evidence += evaluation.evidenceScore;
      accumulator.counterArgument +=
        evaluation.counterArgumentScore;
      accumulator.consistency += evaluation.consistencyScore;
      accumulator.adaptability += evaluation.adaptabilityScore;

      return accumulator;
    },
    {
      overall: 0,
      reasoning: 0,
      evidence: 0,
      counterArgument: 0,
      consistency: 0,
      adaptability: 0,
    },
  );

  const count = evaluations.length;

  const average = (value: number): number =>
    Math.round(value / count);

  return {
    totalEvaluations: count,

    averageScores: {
      overall: average(totals.overall),
      reasoning: average(totals.reasoning),
      evidence: average(totals.evidence),
      counterArgument: average(
        totals.counterArgument,
      ),
      consistency: average(
        totals.consistency,
      ),
      adaptability: average(
        totals.adaptability,
      ),
    },

    recentEvaluations: evaluations
      .slice(0, 5)
      .map((evaluation) => ({
        evaluationId:
          evaluation._id.toString(),

        debateId:
          evaluation.debateId.toString(),

        scenarioId:
          evaluation.scenarioId.toString(),

        overallScore:
          evaluation.overallScore,

        createdAt:
          evaluation.createdAt,
      })),
  };
}