import type {
  Request,
  Response
} from "express";

import {
  createScenarioSchema,
  updateScenarioSchema
} from "./scenario.validation.js";

import {
  createScenario,
  deleteScenario,
  getScenarioById,
  getScenarios,
  updateScenario
} from "./scenario.service.js";

export async function create(
  request: Request,
  response: Response
): Promise<void> {
  const input =
    createScenarioSchema.parse(
      request.body
    );

  const scenario =
    await createScenario({
      ...input,
      createdBy: request.userId
    });

  response.status(201).json({
    success: true,
    data: {
      scenario
    }
  });
}

export async function list(
  request: Request,
  response: Response
): Promise<void> {
  const scenarios =
    await getScenarios({
      category:
        typeof request.query.category === "string"
          ? request.query.category
          : undefined,

      difficulty:
        typeof request.query.difficulty === "string"
          ? request.query.difficulty
          : undefined,

      status:
        typeof request.query.status === "string"
          ? request.query.status
          : undefined
    });

  response.status(200).json({
    success: true,
    data: {
      scenarios
    }
  });
}

export async function getOne(
  request: Request,
  response: Response
): Promise<void> {
  const scenarioId = request.params.id;

  if (typeof scenarioId !== "string") {
    response.status(400).json({
      success: false,
      message: "Invalid scenario ID"
    });

    return;
  }

  const scenario =
    await getScenarioById(scenarioId);

  if (!scenario) {
    response.status(404).json({
      success: false,
      message: "Scenario not found"
    });

    return;
  }

  response.status(200).json({
    success: true,
    data: {
      scenario
    }
  });
}

export async function update(
  request: Request,
  response: Response
): Promise<void> {
  const scenarioId = request.params.id;

  if (typeof scenarioId !== "string") {
    response.status(400).json({
      success: false,
      message: "Invalid scenario ID"
    });

    return;
  }

  const input =
    updateScenarioSchema.parse(
      request.body
    );

  const scenario =
    await updateScenario(
      scenarioId,
      input
    );

  if (!scenario) {
    response.status(404).json({
      success: false,
      message: "Scenario not found"
    });

    return;
  }

  response.status(200).json({
    success: true,
    data: {
      scenario
    }
  });
}

export async function remove(
  request: Request,
  response: Response
): Promise<void> {
  const scenarioId = request.params.id;

  if (typeof scenarioId !== "string") {
    response.status(400).json({
      success: false,
      message: "Invalid scenario ID"
    });

    return;
  }

  const deleted =
    await deleteScenario(scenarioId);

  if (!deleted) {
    response.status(404).json({
      success: false,
      message: "Scenario not found"
    });

    return;
  }

  response.status(200).json({
    success: true,
    message: "Scenario deleted successfully"
  });
}