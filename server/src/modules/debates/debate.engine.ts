import type { AIProvider } from "../ai/ai.provider.js";

import {
  getDebateById,
  addMessage,
  updateDebateTurn,
  completeDebate,
  incrementDebateRound,
} from "./debate.service.js";

import { Scenario } from "../scenarios/scenario.model.js";

import type {
  DebateEvaluation,
  DebateMessage,
  DebateTurn,
} from "./debate.types.js";

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

    const response = await this.aiProvider.generate({
      systemPrompt: this.buildChallengerSystemPrompt(),

      userPrompt: this.buildDebatePrompt(
        scenario,
        debate.selectedPosition,
        debate.messages,
      ),

      temperature: 0.85,

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
    });

    const evaluation = this.parseEvaluation(response.text);

    const completeEvaluation: DebateEvaluation = {
      ...evaluation,
      createdAt: new Date(),
    };

    await completeDebate(debateId, completeEvaluation);

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

  private buildChallengerSystemPrompt(): string {
    return `
You are the Challenger in an AI Debate Arena.

Your job is to critically challenge the user's reasoning.

You should:
- Identify weaknesses.
- Question assumptions.
- Present counterarguments.
- Highlight trade-offs.
- Look for missing evidence.
- Introduce alternative perspectives.

Do not evaluate the user's final performance.
Do not act as the Judge.
Do not simply disagree for the sake of disagreement.
`;
  }

  private buildJudgeSystemPrompt(): string {
    return `
You are the Judge of an AI Debate Arena.

Evaluate the USER'S performance in the debate.

Evaluate:
1. Reasoning
2. Evidence usage
3. Counter-argument handling
4. Consistency
5. Adaptability

Return ONLY valid JSON using this structure:

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

Every score must be an integer from 0 to 100.
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
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error("Judge returned invalid JSON");
    }

    if (typeof parsed !== "object" || parsed === null) {
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
        data[field] < 0 ||
        data[field] > 100
      ) {
        throw new Error(`Invalid judge score: ${field}`);
      }
    }

    if (
      !Array.isArray(data.strengths) ||
      !Array.isArray(data.weaknesses) ||
      typeof data.feedback !== "string"
    ) {
      throw new Error("Invalid judge evaluation structure");
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


