import { Types } from "mongoose";

import { Debate } from "./debate.model.js";
import { Scenario } from "../scenarios/scenario.model.js";

import type {
  IDebate,
  DebateMessage,
  DebateTurn
} from "./debate.types.js";

export async function createDebate(
  data: {
    userId: string;
    scenarioId: string;
    selectedPosition: string;
  }
): Promise<IDebate> {
  if (
    !Types.ObjectId.isValid(
      data.userId
    )
  ) {
    throw new Error(
      "Invalid user ID"
    );
  }

  if (
    !Types.ObjectId.isValid(
      data.scenarioId
    )
  ) {
    throw new Error(
      "Invalid scenario ID"
    );
  }

  const scenario =
    await Scenario.findOne({
      _id: data.scenarioId,
      status: "published"
    });

  if (!scenario) {
    throw new Error(
      "Scenario not found or unavailable"
    );
  }

  const positionExists =
    scenario.positions.some(
      (position) =>
        position.id ===
        data.selectedPosition
    );

  if (!positionExists) {
    throw new Error(
      "Selected position is not valid"
    );
  }

  const debate =
    await Debate.create({
      userId:
        new Types.ObjectId(
          data.userId
        ),

      scenarioId:
        new Types.ObjectId(
          data.scenarioId
        ),

      status: "created",

      currentTurn: "advocate",

      currentRound: 1,

      selectedPosition:
        data.selectedPosition,

      messages: []
    });

  return debate;
}

export async function getDebateById(
  debateId: string
): Promise<IDebate | null> {
  if (
    !Types.ObjectId.isValid(
      debateId
    )
  ) {
    return null;
  }

  return Debate.findById(
    debateId
  ).lean<IDebate>();
}

export async function getUserDebates(
  userId: string
): Promise<IDebate[]> {
  if (
    !Types.ObjectId.isValid(
      userId
    )
  ) {
    return [];
  }

  return Debate.find({
    userId:
      new Types.ObjectId(userId)
  })
    .sort({
      createdAt: -1
    })
    .lean<IDebate[]>();
}

export async function startDebate(
  debateId: string
): Promise<IDebate | null> {
  return Debate.findOneAndUpdate(
    {
      _id: debateId,
      status: "created"
    },
    {
      $set: {
        status: "active",
        currentTurn: "advocate",
        startedAt: new Date()
      }
    },
    {
      new: true
    }
  ).lean<IDebate>();
}

export async function updateDebateTurn(
  debateId: string,
  turn: DebateTurn
): Promise<IDebate | null> {
  return Debate.findByIdAndUpdate(
    debateId,
    {
      $set: {
        currentTurn: turn
      }
    },
    {
      new: true
    }
  ).lean<IDebate>();
}

export async function addMessage(
  debateId: string,
  message: DebateMessage
): Promise<IDebate | null> {
  return Debate.findByIdAndUpdate(
    debateId,
    {
      $push: {
        messages: message
      }
    },
    {
      new: true
    }
  ).lean<IDebate>();
}

export async function completeDebate(
  debateId: string,
  evaluation: IDebate["evaluation"]
): Promise<IDebate | null> {
  return Debate.findByIdAndUpdate(
    debateId,
    {
      $set: {
        status: "completed",
        currentTurn: "completed",
        evaluation,
        completedAt: new Date()
      }
    },
    {
      new: true
    }
  ).lean<IDebate>();
}


export async function incrementDebateRound(
  debateId: string
): Promise<IDebate | null> {
  return Debate.findByIdAndUpdate(
    debateId,
    {
      $inc: {
        currentRound: 1
      }
    },
    {
      new: true
    }
  ).lean<IDebate>();
}