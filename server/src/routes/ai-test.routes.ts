import { Router } from "express";

import { createAIProvider } from "../modules/ai/ai.factory.js";

import {
  buildSystemPrompt,
  buildUserPrompt
} from "../modules/ai/prompt/prompt.builder.js";

import { Agent } from "../modules/agents/agent.model.js";
import { Scenario } from "../modules/scenarios/scenario.model.js";

const router = Router();

router.post(
  "/debate",
  async (_request, response) => {
    try {
      const agent =
        await Agent.findOne({
          role: "challenger",
          status: "active"
        }).lean();

      const scenario =
        await Scenario.findOne({
          status: "published"
        }).lean();

      if (!agent) {
        response.status(404).json({
          success: false,
          message:
            "No active challenger agent found"
        });

        return;
      }

      if (!scenario) {
        response.status(404).json({
          success: false,
          message:
            "No published scenario found"
        });

        return;
      }

      const context = {
        agent,
        scenario,
        userDecision:
          "I would continue expanding the company because rapid growth will help us capture the market before competitors do."
      };

      const systemPrompt =
        buildSystemPrompt(context);

      const userPrompt =
        buildUserPrompt(context);

      const provider =
        createAIProvider(
          agent.provider
        );

      const result =
        await provider.generate({
          systemPrompt,
          userPrompt,
          temperature:
            agent.temperature,
          maxTokens: 800
        });

      response.status(200).json({
        success: true,

        data: {
          agent: {
            id: agent._id,
            name: agent.name,
            role: agent.role
          },

          scenario: {
            id: scenario._id,
            title: scenario.title
          },

          response: result
        }
      });
    } catch (error) {
      console.error(
        "AI debate test failed:",
        error
      );

      response.status(500).json({
        success: false,
        message:
          "AI debate generation failed"
      });
    }
  }
);

export default router;