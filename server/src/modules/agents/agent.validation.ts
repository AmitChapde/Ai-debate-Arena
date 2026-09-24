import { z } from "zod";

export const createAgentSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100),

    role: z.enum([
      "advocate",
      "challenger",
      "judge"
    ]),

    description: z
      .string()
      .trim()
      .min(10)
      .max(500),

    personality: z
      .string()
      .trim()
      .min(10)
      .max(1000),

    objectives: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(500)
      )
      .min(1),

    rules: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(500)
      )
      .min(1),

    provider: z.enum(["gemini", "ollama", "groq"]),

    model: z
      .string()
      .trim()
      .min(1)
      .max(100),

    temperature: z
      .number()
      .min(0)
      .max(2)
      .default(0.7),

    status: z
      .enum([
        "active",
        "inactive"
      ])
      .default("active")
  });

export const updateAgentSchema =
  createAgentSchema.partial();
