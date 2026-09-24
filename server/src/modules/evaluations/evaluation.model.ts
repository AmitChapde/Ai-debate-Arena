import {
  Schema,
  model,
  type HydratedDocument
} from "mongoose";

import type {
  IEvaluation
} from "./evaluation.types.js";

export type EvaluationDocument =
  HydratedDocument<IEvaluation>;

const evaluationSchema =
  new Schema<IEvaluation>(
    {
      debateId: {
        type: Schema.Types.ObjectId,
        ref: "Debate",
        required: true,
        unique: true,
        index: true
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      },

      scenarioId: {
        type: Schema.Types.ObjectId,
        ref: "Scenario",
        required: true,
        index: true
      },

      overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },

      reasoningScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },

      evidenceScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },

      counterArgumentScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },

      consistencyScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },

      adaptabilityScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },

      strengths: {
        type: [String],
        required: true,
        default: []
      },

      weaknesses: {
        type: [String],
        required: true,
        default: []
      },

      feedback: {
        type: String,
        required: true,
        trim: true
      }
    },
    {
      timestamps: true
    }
  );

export const Evaluation =
  model<IEvaluation>(
    "Evaluation",
    evaluationSchema
  );