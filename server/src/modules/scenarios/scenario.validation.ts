import { z } from "zod";

const positionSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(50),

  label: z
    .string()
    .trim()
    .min(1)
    .max(100),

  description: z
    .string()
    .trim()
    .min(1)
    .max(500)
});

export const createScenarioSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(5)
      .max(150),

    description: z
      .string()
      .trim()
      .min(20)
      .max(1000),

    category: z.enum([
      "business",
      "technology",
      "leadership",
      "ethics",
      "crisis",
      "strategy"
    ]),

    difficulty: z.enum([
      "easy",
      "medium",
      "hard",
      "expert"
    ]),

    context: z
      .string()
      .trim()
      .min(20),

    positions: z
      .array(positionSchema)
      .min(2),

    constraints: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(500)
      )
      .default([]),

    evaluationCriteria: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(200)
      )
      .min(1),

    status: z
      .enum([
        "draft",
        "published",
        "archived"
      ])
      .default("draft")
  });

export const updateScenarioSchema =
  createScenarioSchema.partial();