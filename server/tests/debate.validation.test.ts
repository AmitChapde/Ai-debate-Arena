import { describe, expect, it } from "vitest";
import {
  createDebateSchema,
  submitResponseSchema,
} from "../src/modules/debates/debate.validation.js";

describe("debate validation schemas", () => {
  it("accepts valid debate input", () => {
    expect(
      createDebateSchema.safeParse({
        scenarioId: "scenario-1",
        selectedPosition: "support",
      }).success,
    ).toBe(true);
  });

  it("rejects a missing scenarioId", () => {
    expect(
      createDebateSchema.safeParse({
        selectedPosition: "support",
      }).success,
    ).toBe(false);
  });

  it("rejects a missing selectedPosition", () => {
    expect(
      createDebateSchema.safeParse({
        scenarioId: "scenario-1",
      }).success,
    ).toBe(false);
  });

  it("accepts a valid user response", () => {
    expect(
      submitResponseSchema.safeParse({
        content: "This is a valid response.",
      }).success,
    ).toBe(true);
  });

  it("rejects content shorter than 10 characters", () => {
    expect(
      submitResponseSchema.safeParse({ content: "short" }).success,
    ).toBe(false);
  });

  it("rejects content longer than 5000 characters", () => {
    expect(
      submitResponseSchema.safeParse({ content: "x".repeat(5001) }).success,
    ).toBe(false);
  });
});
