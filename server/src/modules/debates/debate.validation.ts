import { z } from "zod";

export const createDebateSchema =
  z.object({
    scenarioId: z
      .string()
      .min(1, "Scenario ID is required"),

    selectedPosition: z
      .string()
      .trim()
      .min(
        1,
        "Selected position is required"
      )
      .max(
        100,
        "Selected position is too long"
      )
  });

export const submitResponseSchema =
  z.object({
    content: z
      .string()
      .trim()
      .min(
        10,
        "Response must be at least 10 characters"
      )
      .max(
        5000,
        "Response cannot exceed 5000 characters"
      )
  });



