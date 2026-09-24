import {
  Schema,
  model,
  type HydratedDocument
} from "mongoose";

import type {
  IAgent
} from "./agent.types.js";

export type AgentDocument =
  HydratedDocument<IAgent>;

const agentSchema =
  new Schema<IAgent>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },

      role: {
        type: String,
        enum: [
          "advocate",
          "challenger",
          "judge"
        ],
        required: true,
        index: true
      },

      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
      },

      personality: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
      },

      objectives: {
        type: [String],
        required: true,
        validate: {
          validator: (
            objectives: string[]
          ) => objectives.length > 0,

          message:
            "At least one objective is required"
        }
      },

      rules: {
        type: [String],
        required: true,
        validate: {
          validator: (
            rules: string[]
          ) => rules.length > 0,

          message:
            "At least one rule is required"
        }
      },

      provider: {
        type: String,
        enum: ["gemini", "ollama", "groq"],
        required: true
      },

      model: {
        type: String,
        required: true,
        trim: true
      },

      temperature: {
        type: Number,
        min: 0,
        max: 2,
        default: 0.7
      },

      status: {
        type: String,
        enum: [
          "active",
          "inactive"
        ],
        default: "active",
        index: true
      }
    },
    {
      timestamps: true
    }
  );

export const Agent =
  model<IAgent>(
    "Agent",
    agentSchema
  );
