import { z } from "zod";

const scoreSchema = z
  .number()
  .int()
  .min(0)
  .max(100);

export const createEvaluationSchema = z.object({
  debateId: z
    .string()
    .trim()
    .min(1),

  userId: z
    .string()
    .trim()
    .min(1),

  scenarioId: z
    .string()
    .trim()
    .min(1),

  overallScore: scoreSchema,

  reasoningScore: scoreSchema,

  evidenceScore: scoreSchema,

  counterArgumentScore: scoreSchema,

  consistencyScore: scoreSchema,

  adaptabilityScore: scoreSchema,

  strengths: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(500)
    )
    .default([]),

  weaknesses: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(500)
    )
    .default([]),

  feedback: z
    .string()
    .trim()
    .min(1)
    .max(5000)
});