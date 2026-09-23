import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),

  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required"),

  CLIENT_URL: z
    .string()
    .url("CLIENT_URL must be a valid URL"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z
    .string()
    .default("7d")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment configuration:");

  console.error(z.prettifyError(parsedEnv.error));

  process.exit(1);
}

export const env = parsedEnv.data;