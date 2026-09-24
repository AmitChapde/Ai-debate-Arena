import type {
  Request,
  Response
} from "express";

import {
  getEvaluationById,
  getEvaluationByDebateId,
  getUserEvaluations
} from "./evaluation.service.js";

export async function list(
  request: Request,
  response: Response
): Promise<void> {

  const evaluations =
    await getUserEvaluations(
      request.userId
    );

  response.status(200).json({
    success: true,
    data: {
      evaluations
    }
  });
}

export async function getOne(
  request: Request,
  response: Response
): Promise<void> {

  const evaluationId =
    request.params.id;

  if (
    typeof evaluationId !== "string"
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid evaluation ID"
    });

    return;
  }

  const evaluation =
    await getEvaluationById(
      evaluationId
    );

  if (!evaluation) {
    response.status(404).json({
      success: false,
      message: "Evaluation not found"
    });

    return;
  }

  if (
    evaluation.userId.toString() !==
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
      evaluation
    }
  });
}

export async function getByDebate(
  request: Request,
  response: Response
): Promise<void> {

  const debateId =
    request.params.debateId;

  if (
    typeof debateId !== "string"
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid debate ID"
    });

    return;
  }

  const evaluation =
    await getEvaluationByDebateId(
      debateId
    );

  if (!evaluation) {
    response.status(404).json({
      success: false,
      message: "Evaluation not found"
    });

    return;
  }

  if (
    evaluation.userId.toString() !==
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
      evaluation
    }
  });
}