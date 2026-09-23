import { Types } from "mongoose";

import { Scenario } from "./scenario.model.js";

import type {
  IScenario
} from "./scenario.types.js";

export async function createScenario(
  data: Omit<
    IScenario,
    "createdAt" | "updatedAt" | "createdBy"
  > & {
    createdBy: string;
  }
): Promise<IScenario> {
  const scenario =
    await Scenario.create({
      ...data,
      createdBy: new Types.ObjectId(
        data.createdBy
      )
    });

  return scenario;
}

export async function getScenarios(
  filters: {
    category?: string;
    difficulty?: string;
    status?: string;
  }
): Promise<IScenario[]> {
  const query: Record<string, unknown> = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return Scenario.find(query)
    .sort({ createdAt: -1 })
    .lean<IScenario[]>();
}

export async function getScenarioById(
  scenarioId: string
): Promise<IScenario | null> {
  if (!Types.ObjectId.isValid(scenarioId)) {
    return null;
  }

  return Scenario.findById(
    scenarioId
  ).lean<IScenario>();
}

export async function updateScenario(
  scenarioId: string,
  data: Partial<IScenario>
): Promise<IScenario | null> {
  if (!Types.ObjectId.isValid(scenarioId)) {
    return null;
  }

  return Scenario.findByIdAndUpdate(
    scenarioId,
    {
      $set: data
    },
    {
      new: true,
      runValidators: true
    }
  ).lean<IScenario>();
}

export async function deleteScenario(
  scenarioId: string
): Promise<boolean> {
  if (!Types.ObjectId.isValid(scenarioId)) {
    return false;
  }

  const result =
    await Scenario.findByIdAndDelete(
      scenarioId
    );

  return result !== null;
}