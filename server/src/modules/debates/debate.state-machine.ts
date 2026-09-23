import type {
  DebateStatus,
  DebateTurn
} from "./debate.types.js";

const transitions: Record<
  DebateTurn,
  DebateTurn[]
> = {
  advocate: [
    "user_response"
  ],

  user_response: [
    "challenger"
  ],

  challenger: [
    "user_response",
    "judge"
  ],

  judge: [
    "completed"
  ],

  completed: []
};

export function canTransition(
  from: DebateTurn,
  to: DebateTurn
): boolean {
  return transitions[from].includes(to);
}

export function getStatusForTurn(
  turn: DebateTurn
): DebateStatus {
  switch (turn) {
    case "advocate":
    case "user_response":
    case "challenger":
      return "active";

    case "judge":
      return "judging";

    case "completed":
      return "completed";

    default:
      return "created";
  }
}

export function getNextTurn(
  current: DebateTurn
): DebateTurn | null {
  const next =
    transitions[current];

  return next?.[0] ?? null;
}