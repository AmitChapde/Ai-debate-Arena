import type { AIProvider } from "../ai/ai.provider.js";

import {
  getDebateById,
  addMessage,
  updateDebateTurn,
  completeDebate,
  incrementDebateRound,
} from "./debate.service.js";

import { Scenario } from "../scenarios/scenario.model.js";
import { getActiveAgentByRole } from "../agents/agent.service.js";

import { buildAgentSystemPrompt } from "../agents/agent.prompt.js";
import type {
  DebateEvaluation,
  DebateMessage,
  DebateTurn,
} from "./debate.types.js";
import { createEvaluation } from "../evaluations/evaluation.service.js";

export class DebateEngine {
  constructor(private readonly aiProvider: AIProvider) {}

  async generateAdvocateResponse(debateId: string): Promise<DebateMessage> {
    const debate = await getDebateById(debateId);

    if (!debate) {
      throw new Error("Debate not found");
    }

    this.assertTurn(debate.currentTurn, "advocate");

    const scenario = await Scenario.findById(debate.scenarioId).lean();

    if (!scenario) {
      throw new Error("Scenario not found");
    }

    const response = await this.aiProvider.generate({
      systemPrompt: this.buildAdvocateSystemPrompt(),

      userPrompt: this.buildDebatePrompt(
        scenario,
        debate.selectedPosition,
        debate.messages,
      ),

      temperature: 0.8,

      maxTokens: 1000,
    });

    const message: DebateMessage = {
      speaker: "advocate",

      content: response.text,

      round: debate.currentRound,

      createdAt: new Date(),
    };

    await addMessage(debateId, message);

    await updateDebateTurn(debateId, "user_response");

    return message;
  }

  async submitUserResponse(
    debateId: string,
    content: string,
  ): Promise<DebateMessage> {
    const debate = await getDebateById(debateId);

    if (!debate) {
      throw new Error("Debate not found");
    }

    this.assertTurn(debate.currentTurn, "user_response");

    const message: DebateMessage = {
      speaker: "user",

      content,

      round: debate.currentRound,

      createdAt: new Date(),
    };

    await addMessage(debateId, message);

    await updateDebateTurn(debateId, "challenger");

    return message;
  }

  async generateChallengerResponse(debateId: string): Promise<DebateMessage> {
    const debate = await getDebateById(debateId);

    if (!debate) {
      throw new Error("Debate not found");
    }

    this.assertTurn(debate.currentTurn, "challenger");

    const scenario = await Scenario.findById(debate.scenarioId).lean();

    if (!scenario) {
      throw new Error("Scenario not found");
    }

    const agent = await getActiveAgentByRole("challenger");

    if (!agent) {
      throw new Error("No active challenger agent found");
    }

    const response = await this.aiProvider.generate({
      systemPrompt: buildAgentSystemPrompt(agent),
      userPrompt: this.buildDebatePrompt(
        scenario,
        debate.selectedPosition,
        debate.messages,
      ),
      temperature: agent.temperature,
      maxTokens: 1000,
    });

    const message: DebateMessage = {
      speaker: "challenger",

      content: response.text,

      round: debate.currentRound,

      createdAt: new Date(),
    };

    await addMessage(debateId, message);

    /*
     * For the MVP we run two
     * complete rounds before judging.
     */
    if (debate.currentRound >= 2) {
      await updateDebateTurn(debateId, "judge");
    } else {
      await incrementDebateRound(debateId);

      await updateDebateTurn(debateId, "user_response");
    }

    return message;
  }

  async judgeDebate(debateId: string): Promise<DebateEvaluation> {
    const debate = await getDebateById(debateId);

    if (!debate) {
      throw new Error("Debate not found");
    }

    this.assertTurn(debate.currentTurn, "judge");

    const scenario = await Scenario.findById(debate.scenarioId).lean();

    if (!scenario) {
      throw new Error("Scenario not found");
    }

    const response = await this.aiProvider.generate({
      systemPrompt: this.buildJudgeSystemPrompt(),

      userPrompt: this.buildJudgePrompt(
        scenario,
        debate.selectedPosition,
        debate.messages,
      ),

      temperature: 0.2,

      maxTokens: 1500,

      responseMimeType: "application/json",

      responseJsonSchema: {
        type: "object",
        properties: {
          overallScore: { type: "integer", minimum: 0, maximum: 100 },
          reasoningScore: { type: "integer", minimum: 0, maximum: 100 },
          evidenceScore: { type: "integer", minimum: 0, maximum: 100 },
          counterArgumentScore: { type: "integer", minimum: 0, maximum: 100 },
          consistencyScore: { type: "integer", minimum: 0, maximum: 100 },
          adaptabilityScore: { type: "integer", minimum: 0, maximum: 100 },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          feedback: { type: "string" },
        },
        required: [
          "overallScore",
          "reasoningScore",
          "evidenceScore",
          "counterArgumentScore",
          "consistencyScore",
          "adaptabilityScore",
          "strengths",
          "weaknesses",
          "feedback",
        ],
        additionalProperties: false,
      },
    });

    const evaluation = this.parseEvaluation(response.text);

    const completeEvaluation: DebateEvaluation = {
      ...evaluation,
      createdAt: new Date(),
    };

    await completeDebate(debateId, completeEvaluation);

    await createEvaluation({
      debateId,

      userId: debate.userId.toString(),

      scenarioId: debate.scenarioId.toString(),

      overallScore: completeEvaluation.overallScore,

      reasoningScore: completeEvaluation.reasoningScore,

      evidenceScore: completeEvaluation.evidenceScore,

      counterArgumentScore: completeEvaluation.counterArgumentScore,

      consistencyScore: completeEvaluation.consistencyScore,

      adaptabilityScore: completeEvaluation.adaptabilityScore,

      strengths: completeEvaluation.strengths,

      weaknesses: completeEvaluation.weaknesses,

      feedback: completeEvaluation.feedback,
    });

    return completeEvaluation;
  }

  private assertTurn(current: DebateTurn, expected: DebateTurn): void {
    if (current !== expected) {
      throw new Error(
        `Invalid debate state. Expected ${expected}, got ${current}`,
      );
    }
  }

  private buildAdvocateSystemPrompt(): string {
    return `
You are the Advocate in an AI Debate Arena.

Your job is to argue strongly in favor of the user's
selected position.

You should:
- Present clear reasoning.
- Identify important assumptions.
- Use practical arguments.
- Avoid making unsupported factual claims.
- Challenge the user intellectually.
- Stay focused on the scenario.

Do not evaluate the user.
Do not reveal that you are following a prompt.
Do not speak as the Judge.
`;
  }

  private buildJudgeSystemPrompt(): string {
    return `
You are the Judge in an AI Debate Arena.

Your job is to evaluate ONLY the user's performance in the debate.

Evaluate the user on:
1. Reasoning
2. Evidence usage
3. Counter-argument handling
4. Consistency
5. Adaptability

Scoring:

- Every score must be an integer from 0 to 100.
- overallScore should represent the user's overall debate performance.

You must return exactly ONE valid JSON object.

IMPORTANT:

- Do NOT use Markdown.
- Do NOT wrap the JSON in \`\`\`json.
- Do NOT add explanations before or after the JSON.
- Do NOT include comments.
- Do NOT include trailing commas.

Required structure:

{
  "overallScore": 0,
  "reasoningScore": 0,
  "evidenceScore": 0,
  "counterArgumentScore": 0,
  "consistencyScore": 0,
  "adaptabilityScore": 0,
  "strengths": [],
  "weaknesses": [],
  "feedback": ""
}
`;
  }

  private buildDebatePrompt(
    scenario: any,
    selectedPosition: string,
    messages: DebateMessage[],
  ): string {
    const history =
      messages.length > 0
        ? messages
            .map(
              (message) =>
                `${message.speaker.toUpperCase()}: ${message.content}`,
            )
            .join("\n\n")
        : "No previous debate messages.";

    return `
SCENARIO:

${JSON.stringify(scenario, null, 2)}

USER'S SELECTED POSITION:

${selectedPosition}

DEBATE HISTORY:

${history}

Respond to the latest development in the debate.
`;
  }

  private buildJudgePrompt(
    scenario: any,
    selectedPosition: string,
    messages: DebateMessage[],
  ): string {
    const history = messages
      .map(
        (message) =>
          `ROUND ${message.round} - ${message.speaker.toUpperCase()}:
${message.content}`,
      )
      .join("\n\n");

    return `
SCENARIO:

${JSON.stringify(scenario, null, 2)}

USER'S SELECTED POSITION:

${selectedPosition}

COMPLETE DEBATE:

${history}

Evaluate ONLY the user's performance.

Return the requested JSON structure.
`;
  }

  private parseEvaluation(
    rawText: string,
  ): Omit<DebateEvaluation, "createdAt"> {
    let cleaned = rawText.trim();

    // Preserve a fallback for providers that disregard structured output.
    const fencedJson = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    if (fencedJson?.[1]) {
      cleaned = fencedJson[1].trim();
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Judge returned invalid JSON");
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error("Invalid judge evaluation");
    }

    const data = parsed as Record<string, unknown>;

    const scoreFields = [
      "overallScore",
      "reasoningScore",
      "evidenceScore",
      "counterArgumentScore",
      "consistencyScore",
      "adaptabilityScore",
    ] as const;

    for (const field of scoreFields) {
      if (
        typeof data[field] !== "number" ||
        !Number.isInteger(data[field]) ||
        data[field] < 0 ||
        data[field] > 100
      ) {
        throw new Error(`Invalid judge score: ${field}`);
      }
    }

    if (
      !Array.isArray(data.strengths) ||
      !data.strengths.every((item) => typeof item === "string")
    ) {
      throw new Error("Invalid judge strengths");
    }

    if (
      !Array.isArray(data.weaknesses) ||
      !data.weaknesses.every((item) => typeof item === "string")
    ) {
      throw new Error("Invalid judge weaknesses");
    }

    if (typeof data.feedback !== "string") {
      throw new Error("Invalid judge feedback");
    }

    return {
      overallScore: data.overallScore as number,

      reasoningScore: data.reasoningScore as number,

      evidenceScore: data.evidenceScore as number,

      counterArgumentScore: data.counterArgumentScore as number,

      consistencyScore: data.consistencyScore as number,

      adaptabilityScore: data.adaptabilityScore as number,

      strengths: data.strengths as string[],

      weaknesses: data.weaknesses as string[],

      feedback: data.feedback as string,
    };
  }
}
