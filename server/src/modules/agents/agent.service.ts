import { Types } from "mongoose";

import { Agent } from "./agent.model.js";

import type {
  IAgent
} from "./agent.types.js";

export async function createAgent(
  data: Omit<
    IAgent,
    "createdAt" | "updatedAt"
  >
): Promise<IAgent> {
  return Agent.create(data);
}

export async function getAgents(
  filters: {
    role?: string;
    status?: string;
  }
): Promise<IAgent[]> {
  const query: Record<
    string,
    unknown
  > = {};

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return Agent.find(query)
    .sort({
      createdAt: -1
    })
    .lean<IAgent[]>();
}

export async function getAgentById(
  agentId: string
): Promise<IAgent | null> {
  if (!Types.ObjectId.isValid(agentId)) {
    return null;
  }

  return Agent.findById(
    agentId
  ).lean<IAgent>();
}

export async function updateAgent(
  agentId: string,
  data: Partial<IAgent>
): Promise<IAgent | null> {
  if (!Types.ObjectId.isValid(agentId)) {
    return null;
  }

  return Agent.findByIdAndUpdate(
    agentId,
    {
      $set: data
    },
    {
      new: true,
      runValidators: true
    }
  ).lean<IAgent>();
}

export async function deleteAgent(
  agentId: string
): Promise<boolean> {
  if (!Types.ObjectId.isValid(agentId)) {
    return false;
  }

  const result =
    await Agent.findByIdAndDelete(
      agentId
    );

  return result !== null;
}