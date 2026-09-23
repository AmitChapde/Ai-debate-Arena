import { Schema, model, type HydratedDocument } from "mongoose";

import type {
  IScenario,
  ScenarioPosition
} from "./scenario.types.js";

export type ScenarioDocument =
  HydratedDocument<IScenario>;

const positionSchema =
  new Schema<ScenarioPosition>(
    {
      id: {
        type: String,
        required: true,
        trim: true
      },

      label: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },

      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
      }
    },
    {
      _id: false
    }
  );

const scenarioSchema =
  new Schema<IScenario>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
      },

      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
      },

      category: {
        type: String,
        enum: [
          "business",
          "technology",
          "leadership",
          "ethics",
          "crisis",
          "strategy"
        ],
        required: true,
        index: true
      },

      difficulty: {
        type: String,
        enum: [
          "easy",
          "medium",
          "hard",
          "expert"
        ],
        required: true,
        index: true
      },

      context: {
        type: String,
        required: true,
        trim: true
      },

      positions: {
        type: [positionSchema],
        required: true,
        validate: {
          validator: (positions: ScenarioPosition[]) =>
            positions.length >= 2,
          message:
            "A scenario must have at least two positions"
        }
      },

      constraints: {
        type: [String],
        default: []
      },

      evaluationCriteria: {
        type: [String],
        required: true,
        validate: {
          validator: (criteria: string[]) =>
            criteria.length >= 1,
          message:
            "At least one evaluation criterion is required"
        }
      },

      status: {
        type: String,
        enum: [
          "draft",
          "published",
          "archived"
        ],
        default: "draft",
        index: true
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      }
    },
    {
      timestamps: true
    }
  );

export const Scenario =
  model<IScenario>(
    "Scenario",
    scenarioSchema
  );