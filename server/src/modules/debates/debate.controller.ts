import type {
  Request,
  Response
} from "express";

import {
  createDebateSchema
} from "./debate.validation.js";

import {
  createDebate,
  getDebateById,
  getUserDebates,
  startDebate
} from "./debate.service.js";

export async function create(
  request: Request,
  response: Response
): Promise<void> {
  const input =
    createDebateSchema.parse(
      request.body
    );

  const debate =
    await createDebate({
      userId: request.userId,
      scenarioId: input.scenarioId,
      selectedPosition:
        input.selectedPosition
    });

  response.status(201).json({
    success: true,
    data: {
      debate
    }
  });
}

export async function list(
  request: Request,
  response: Response
): Promise<void> {
  const debates =
    await getUserDebates(
      request.userId
    );

  response.status(200).json({
    success: true,
    data: {
      debates
    }
  });
}

export async function getOne(
  request: Request,
  response: Response
): Promise<void> {
  const debateId =
    request.params.id;

  if (
    typeof debateId !== "string"
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid debate ID"
    });

    return;
  }

  const debate =
    await getDebateById(
      debateId
    );

  if (!debate) {
    response.status(404).json({
      success: false,
      message: "Debate not found"
    });

    return;
  }

  if (
    debate.userId.toString() !==
    request.userId
  ) {
    response.status(403).json({
      success: false,
      message: "Access denied"
    });

    return;
  }

  response.status(200).json({
    success: true,
    data: {
      debate
    }
  });
}

export async function start(
  request: Request,
  response: Response
): Promise<void> {
  const debateId =
    request.params.id;

  if (
    typeof debateId !== "string"
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid debate ID"
    });

    return;
  }

  const existing =
    await getDebateById(
      debateId
    );

  if (!existing) {
    response.status(404).json({
      success: false,
      message: "Debate not found"
    });

    return;
  }

  if (
    existing.userId.toString() !==
    request.userId
  ) {
    response.status(403).json({
      success: false,
      message: "Access denied"
    });

    return;
  }

  if (
    existing.status !== "created"
  ) {
    response.status(409).json({
      success: false,
      message:
        "Debate has already been started"
    });

    return;
  }

  const debate =
    await startDebate(
      debateId
    );

  response.status(200).json({
    success: true,
    data: {
      debate
    }
  });
}