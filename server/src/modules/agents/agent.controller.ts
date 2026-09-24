import type {
  Request,
  Response
} from "express";

import {
  createAgentSchema,
  updateAgentSchema
} from "./agent.validation.js";

import {
  createAgent,
  deleteAgent,
  getAgentById,
  getAgents,
  updateAgent
} from "./agent.service.js";  

export async function create(
  request: Request,
  response: Response
): Promise<void> {
  const input =
    createAgentSchema.parse(
      request.body
    );

  const agent =
    await createAgent(input);

  response.status(201).json({
    success: true,
    data: {
      agent
    }
  });
}

export async function list(
  request: Request,
  response: Response
): Promise<void> {
  const agents =
    await getAgents({
      role:
        typeof request.query.role === "string"
          ? request.query.role
          : undefined,

      status:
        typeof request.query.status === "string"
          ? request.query.status
          : undefined
    });

  response.status(200).json({
    success: true,
    data: {
      agents
    }
  });
}

export async function getOne(
  request: Request,
  response: Response
): Promise<void> {
  const agentId =
    request.params.id;

  if (
    typeof agentId !== "string"
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid agent ID"
    });

    return;
  }

  const agent =
    await getAgentById(agentId);

  if (!agent) {
    response.status(404).json({
      success: false,
      message: "Agent not found"
    });

    return;
  }

  response.status(200).json({
    success: true,
    data: {
      agent
    }
  });
}

export async function update(
  request: Request,
  response: Response
): Promise<void> {
  const agentId =
    request.params.id;

  if (
    typeof agentId !== "string"
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid agent ID"
    });

    return;
  }

  const input =
    updateAgentSchema.parse(
      request.body
    );

  const agent =
    await updateAgent(
      agentId,
      input
    );

  if (!agent) {
    response.status(404).json({
      success: false,
      message: "Agent not found"
    });

    return;
  }

  response.status(200).json({
    success: true,
    data: {
      agent
    }
  });
}

export async function remove(
  request: Request,
  response: Response
): Promise<void> {
  const agentId =
    request.params.id;

  if (
    typeof agentId !== "string"
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid agent ID"
    });

    return;
  }

  const deleted =
    await deleteAgent(agentId);

  if (!deleted) {
    response.status(404).json({
      success: false,
      message: "Agent not found"
    });

    return;
  }

  response.status(200).json({
    success: true,
    message:
      "Agent deleted successfully"
  });
}