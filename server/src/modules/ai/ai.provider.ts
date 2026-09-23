import type {
  GenerateRequest,
  GenerateResponse
} from "./ai.types.js";

export interface AIProvider {
  generate(
    request: GenerateRequest
  ): Promise<GenerateResponse>;
}