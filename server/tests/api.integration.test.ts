import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/app.js";
import { env } from "../src/config/env.js";
import { Agent } from "../src/modules/agents/agent.model.js";
import { Debate } from "../src/modules/debates/debate.model.js";
import { Evaluation } from "../src/modules/evaluations/evaluation.model.js";
import { Scenario } from "../src/modules/scenarios/scenario.model.js";
import { User } from "../src/modules/users/user.model.js";
import { OllamaProvider } from "../src/modules/ai/providers/ollama.provider.js";
import type { GenerateRequest, GenerateResponse } from "../src/modules/ai/ai.types.js";

const TEST_DATABASE_URI =
  "mongodb://127.0.0.1:27017/ai_debate_arena_integration_test";

let server: Server;
let baseUrl: string;
let authCookie: string;
let userId: string;
let scenarioId: string;
const generateSpy = vi.spyOn(OllamaProvider.prototype, "generate");

const evaluationResult = {
  overallScore: 82,
  reasoningScore: 80,
  evidenceScore: 78,
  counterArgumentScore: 84,
  consistencyScore: 86,
  adaptabilityScore: 82,
  strengths: ["Clear reasoning"],
  weaknesses: ["Add more evidence"],
  feedback: "A thoughtful and well structured argument.",
};

async function request(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });
}

async function authenticatedRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return request(path, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Cookie: authCookie,
    },
  });
}

async function register(email: string): Promise<{ cookie: string; id: string }> {
  const response = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Integration User",
      email,
      password: "StrongPassword123",
    }),
  });
  const payload = await response.json();
  const setCookie = response.headers.get("set-cookie");

  if (!setCookie) {
    throw new Error("Registration did not return an auth cookie");
  }

  return {
    cookie: setCookie.split(";")[0]!,
    id: payload.data.user._id as string,
  };
}

async function createDebate(): Promise<string> {
  const response = await authenticatedRequest("/api/debates", {
    method: "POST",
    body: JSON.stringify({
      scenarioId,
      selectedPosition: "support",
    }),
  });

  expect(response.status).toBe(201);
  const payload = await response.json();
  return payload.data.debate._id as string;
}

async function clearTestCollections(): Promise<void> {
  await Promise.all([
    User.deleteMany({}),
    Scenario.deleteMany({}),
    Agent.deleteMany({}),
    Debate.deleteMany({}),
    Evaluation.deleteMany({}),
  ]);
}

describe("API integration", () => {
  beforeAll(async () => {
    const uri = new URL(env.MONGODB_URI);
    if (
      env.MONGODB_URI !== TEST_DATABASE_URI ||
      uri.hostname !== "127.0.0.1" ||
      uri.pathname !== "/ai_debate_arena_integration_test"
    ) {
      throw new Error("Refusing to run API tests against a non-test MongoDB database");
    }

    await mongoose.connect(TEST_DATABASE_URI);
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(async () => {
    await clearTestCollections();

    const registered = await register(`user-${randomUUID()}@example.test`);
    authCookie = registered.cookie;
    userId = registered.id;

    const scenario = await Scenario.create({
      title: "Remote work policy",
      description: "Consider whether companies should adopt remote-first work.",
      category: "business",
      difficulty: "medium",
      context: "A company is reviewing its long-term work policy.",
      positions: [
        { id: "support", label: "Support", description: "Support remote-first work." },
        { id: "oppose", label: "Oppose", description: "Keep office-first work." },
      ],
      constraints: [],
      evaluationCriteria: ["Reasoning", "Evidence"],
      status: "published",
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    scenarioId = scenario.id;

    await Agent.create(
      (["advocate", "challenger", "judge"] as const).map((role) => ({
        name: `Test ${role}`,
        role,
        description: "Integration test agent",
        personality: "Clear and concise",
        objectives: ["Respond to the debate"],
        rules: ["Use the scenario facts"],
        provider: "ollama",
        model: "llama3.2:3b",
        temperature: 0.2,
        status: "active",
      })),
    );

    generateSpy.mockImplementation(
      async (generationRequest: GenerateRequest): Promise<GenerateResponse> => ({
        text:
          generationRequest.responseMimeType === "application/json"
            ? JSON.stringify(evaluationResult)
            : "A mocked AI response for integration testing.",
        model: "llama3.2:3b",
        provider: "ollama",
      }),
    );
  });

  afterEach(async () => {
    await clearTestCollections();
  });

  afterAll(async () => {
    generateSpy.mockRestore();
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await mongoose.disconnect();
  });

  it("registers a user", async () => {
    const response = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Another User",
        email: `register-${randomUUID()}@example.test`,
        password: "StrongPassword123",
      }),
    });

    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toContain("access_token=");
    expect((await response.json()).data.user.name).toBe("Another User");
  });

  it("logs in and allows authenticated access to /auth/me", async () => {
    const response = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: (await User.findById(userId))!.email,
        password: "StrongPassword123",
      }),
    });
    const loginCookie = response.headers.get("set-cookie")?.split(";")[0];

    expect(response.status).toBe(200);
    expect(loginCookie).toContain("access_token=");

    const meResponse = await request("/api/auth/me", {
      headers: { Cookie: loginCookie! },
    });
    expect(meResponse.status).toBe(200);
    expect((await meResponse.json()).data.user._id).toBe(userId);
  });

  it("returns published scenarios to an authenticated user", async () => {
    const response = await authenticatedRequest("/api/scenarios");

    expect(response.status).toBe(200);
    expect((await response.json()).data.scenarios.map((item: { _id: string }) => item._id))
      .toContain(scenarioId);
  });

  it("creates a debate for a valid published scenario position", async () => {
    const response = await authenticatedRequest("/api/debates", {
      method: "POST",
      body: JSON.stringify({ scenarioId, selectedPosition: "support" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.debate.scenarioId).toBe(scenarioId);
    expect(payload.data.debate.selectedPosition).toBe("support");
    expect(payload.data.debate.currentRound).toBe(1);
  });

  it("starts a debate and stores the mocked advocate response", async () => {
    const debateId = await createDebate();
    const response = await authenticatedRequest(`/api/debates/${debateId}/start`, {
      method: "POST",
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.debate.status).toBe("active");
    expect(payload.data.message.content).toContain("mocked AI response");
    expect(generateSpy).toHaveBeenCalledTimes(1);
  });

  it("accepts and stores an authenticated user's response", async () => {
    const debateId = await createDebate();
    await authenticatedRequest(`/api/debates/${debateId}/start`, { method: "POST" });

    const response = await authenticatedRequest(`/api/debates/${debateId}/respond`, {
      method: "POST",
      body: JSON.stringify({ content: "I support this policy because it improves access." }),
    });
    const payload = await response.json();
    const savedDebate = await Debate.findById(debateId).lean();

    expect(response.status).toBe(201);
    expect(payload.data.message.speaker).toBe("user");
    expect(savedDebate?.messages.some((message) => message.speaker === "user")).toBe(true);
  });

  it("stores a completed debate evaluation and exposes it in evaluation and profile APIs", async () => {
    const debateId = await createDebate();
    await authenticatedRequest(`/api/debates/${debateId}/start`, { method: "POST" });

    // Advance the fixture to the final judge turn; the judge route, engine,
    // evaluation service, and profile/evaluation routes remain real.
    await Debate.findByIdAndUpdate(debateId, {
      $set: { currentRound: 3, currentTurn: "judge" },
    });

    const judgeResponse = await authenticatedRequest(`/api/debates/${debateId}/judge`, {
      method: "POST",
    });
    const judged = await judgeResponse.json();
    expect(judgeResponse.status).toBe(200);
    expect(judged.data.debate.status).toBe("completed");
    expect(judged.data.evaluation.overallScore).toBe(evaluationResult.overallScore);

    const evaluationResponse = await authenticatedRequest(
      `/api/evaluations/debate/${debateId}`,
    );
    expect(evaluationResponse.status).toBe(200);
    expect((await evaluationResponse.json()).data.evaluation.overallScore)
      .toBe(evaluationResult.overallScore);

    const profileResponse = await authenticatedRequest("/api/profile");
    const profile = (await profileResponse.json()).data.profile;
    expect(profileResponse.status).toBe(200);
    expect(profile.totalEvaluations).toBe(1);
    expect(profile.averageScores.overall).toBe(evaluationResult.overallScore);
    expect(profile.recentEvaluations).toHaveLength(1);
  });
});
