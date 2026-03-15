import { describe, expect, it } from "vitest";
import {
  classifyTask,
  estimateCostUsd,
  normalizeUsagePayload,
  rankCredentials,
} from "../lib/workspaceRouting";

const credentials = [
  {
    id: "openai-1",
    provider: "openai" as const,
    monthly_token_cap: 1000,
    last_validated_at: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "anthropic-1",
    provider: "anthropic" as const,
    monthly_token_cap: 1000,
    last_validated_at: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "gemini-1",
    provider: "gemini" as const,
    monthly_token_cap: 500,
    last_validated_at: null,
  },
];

describe("workspace routing helpers", () => {
  it("classifies coding prompts", () => {
    expect(classifyTask("Debug this TypeScript stack trace")).toBe("coding");
  });

  it("prioritizes Anthropic for analysis-heavy prompts", () => {
    const ranked = rankCredentials(
      credentials,
      {},
      "Compare the tradeoffs and analyze the decision",
      "auto"
    );

    expect(ranked[0]?.credential.provider).toBe("anthropic");
  });

  it("filters out credentials that have exhausted their monthly cap", () => {
    const ranked = rankCredentials(
      credentials,
      { "anthropic-1": 1200 },
      "Analyze a planning document",
      "auto"
    );

    expect(ranked.some((entry) => entry.credential.provider === "anthropic")).toBe(false);
  });

  it("honors manual provider overrides", () => {
    const ranked = rankCredentials(credentials, {}, "Anything", "manual", "gemini", "gemini-2.5-pro");

    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.credential.provider).toBe("gemini");
    expect(ranked[0]?.model).toBe("gemini-2.5-pro");
  });

  it("normalizes usage payloads across providers", () => {
    expect(
      normalizeUsagePayload("openai", {
        input_tokens: 10,
        output_tokens: 5,
        total_tokens: 15,
      })
    ).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });

    expect(
      normalizeUsagePayload("anthropic", {
        input_tokens: 12,
        output_tokens: 7,
      })
    ).toEqual({
      promptTokens: 12,
      completionTokens: 7,
      totalTokens: 19,
    });

    expect(
      normalizeUsagePayload("gemini", {
        promptTokenCount: 4,
        candidatesTokenCount: 9,
        totalTokenCount: 13,
      })
    ).toEqual({
      promptTokens: 4,
      completionTokens: 9,
      totalTokens: 13,
    });
  });

  it("estimates cost using provider-specific rates", () => {
    expect(estimateCostUsd("openai", 1500)).toBe(0.0045);
    expect(estimateCostUsd("gemini", 2000)).toBe(0.003);
  });
});
