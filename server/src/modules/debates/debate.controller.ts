import type {
  Request,
  Response
} from "express";

import {
  createDebateSchema,
  submitResponseSchema
} from "./debate.validation.js";

import {
  createDebate,
  getDebateById,
  getUserDebates,
  startDebate
} from "./debate.service.js";

import { DebateEngine } from "./debate.engine.js";

import { createAIProvider } from "../ai/ai.factory.js";

const aiProvider =
  createAIProvider("gemini");

const debateEngine =
  new DebateEngine(aiProvider);

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

  await startDebate(
    debateId
  );

  const message =
    await debateEngine
      .generateAdvocateResponse(
        debateId
      );

  const debate =
    await getDebateById(
      debateId
    );

  response.status(200).json({
    success: true,
    data: {
      debate,
      message
    }
  });
}

export async function respond(
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

  const input =
    submitResponseSchema.parse(
      request.body
    );

  const message =
    await debateEngine
      .submitUserResponse(
        debateId,
        input.content
      );

  response.status(201).json({
    success: true,
    data: {
      message
    }
  });
}

export async function challenge(
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

  const message =
    await debateEngine
      .generateChallengerResponse(
        debateId
      );

  const debate =
    await getDebateById(
      debateId
    );

  response.status(200).json({
    success: true,
    data: {
      debate,
      message
    }
  });
}

export async function judge(
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

  const evaluation =
    await debateEngine
      .judgeDebate(
        debateId
      );

  const debate =
    await getDebateById(
      debateId
    );

  response.status(200).json({
    success: true,
    data: {
      debate,
      evaluation
    }
  });
}