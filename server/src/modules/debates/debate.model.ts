import {
  Schema,
  model,
  type HydratedDocument
} from "mongoose";

import type {
  IDebate,
  DebateMessage,
  DebateEvaluation
} from "./debate.types.js";

export type DebateDocument =
  HydratedDocument<IDebate>;

const messageSchema =
  new Schema<DebateMessage>(
    {
      speaker: {
        type: String,
        enum: [
          "user",
          "advocate",
          "challenger",
          "judge"
        ],
        required: true
      },

      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
      },

      round: {
        type: Number,
        required: true,
        min: 1
      },

      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      _id: false
    }
  );

const evaluationSchema =
  new Schema<DebateEvaluation>(
    {
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
        default: []
      },

      weaknesses: {
        type: [String],
        default: []
      },

      feedback: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
      },

      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      _id: false
    }
  );

const debateSchema =
  new Schema<IDebate>(
    {
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

      status: {
        type: String,
        enum: [
          "created",
          "active",
          "judging",
          "completed",
          "abandoned"
        ],
        default: "created",
        index: true
      },

      currentTurn: {
        type: String,
        enum: [
          "advocate",
          "user_response",
          "challenger",
          "judge",
          "completed"
        ],
        default: "advocate"
      },

      currentRound: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      },

      selectedPosition: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },

      messages: {
        type: [messageSchema],
        default: []
      },

      evaluation: {
        type: evaluationSchema
      },

      startedAt: {
        type: Date
      },

      completedAt: {
        type: Date
      }
    },
    {
      timestamps: true
    }
  );

debateSchema.index({
  userId: 1,
  createdAt: -1
});

debateSchema.index({
  scenarioId: 1,
  status: 1
});

export const Debate =
  model<IDebate>(
    "Debate",
    debateSchema
  );