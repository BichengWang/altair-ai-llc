import type { ProviderName, RoutingMode } from "../types/workspace";

export type TaskCategory = "coding" | "analysis" | "creative" | "general";

export type RankedCredential<TCredential extends { id: string; provider: ProviderName; monthly_token_cap: number | null; last_validated_at: string | null }> = {
  credential: TCredential;
  model: string;
  score: number;
};

export function classifyTask(content: string): TaskCategory {
  const value = content.toLowerCase();

  if (
    /code|debug|typescript|javascript|python|stack trace|function|bug|refactor|sql|query/.test(value)
  ) {
    return "coding";
  }

  if (/summari[sz]e|analy[sz]e|compare|research|plan|evaluate|tradeoff|decision/.test(value)) {
    return "analysis";
  }

  if (/write|draft|creative|story|brainstorm|headline|campaign|copy/.test(value)) {
    return "creative";
  }

  return "general";
}

export function getDefaultModel(provider: ProviderName, category: TaskCategory) {
  if (provider === "openai") {
    return category === "coding" ? "gpt-4.1-mini" : "gpt-4.1-mini";
  }

  if (provider === "anthropic") {
    return category === "analysis" ? "claude-sonnet-4-20250514" : "claude-sonnet-4-20250514";
  }

  return category === "general" ? "gemini-2.5-flash" : "gemini-2.5-flash";
}

export function estimateCostUsd(provider: ProviderName, totalTokens: number) {
  const ratesPerThousand: Record<ProviderName, number> = {
    openai: 0.003,
    anthropic: 0.004,
    gemini: 0.0015,
  };

  return Number(((totalTokens / 1000) * ratesPerThousand[provider]).toFixed(6));
}

export function rankCredentials<TCredential extends { id: string; provider: ProviderName; monthly_token_cap: number | null; last_validated_at: string | null }>(
  credentials: TCredential[],
  usageByCredential: Record<string, number>,
  content: string,
  routingMode: RoutingMode,
  manualProvider?: ProviderName,
  manualModel?: string
): Array<RankedCredential<TCredential>> {
  const category = classifyTask(content);
  const eligibleCredentials = credentials.filter((credential) => {
    const usedTokens = usageByCredential[credential.id] ?? 0;
    return credential.monthly_token_cap == null || usedTokens < credential.monthly_token_cap;
  });

  if (routingMode === "manual") {
    const selected = eligibleCredentials.find((credential) => credential.provider === manualProvider);

    if (!selected) {
      return [];
    }

    return [
      {
        credential: selected,
        model: manualModel?.trim() || getDefaultModel(selected.provider, category),
        score: 100,
      },
    ];
  }

  const providerScores: Record<ProviderName, Record<TaskCategory, number>> = {
    openai: { coding: 8, analysis: 7, creative: 6, general: 7 },
    anthropic: { coding: 7, analysis: 9, creative: 8, general: 7 },
    gemini: { coding: 6, analysis: 7, creative: 7, general: 8 },
  };

  return eligibleCredentials
    .map((credential) => {
      const usedTokens = usageByCredential[credential.id] ?? 0;
      const capRatio =
        credential.monthly_token_cap && credential.monthly_token_cap > 0
          ? Math.min(usedTokens / credential.monthly_token_cap, 1)
          : 0;
      const freshnessBonus = credential.last_validated_at ? 1 : 0;
      const score = providerScores[credential.provider][category] + freshnessBonus - capRatio * 3;

      return {
        credential,
        model: getDefaultModel(credential.provider, category),
        score,
      };
    })
    .sort((left, right) => right.score - left.score);
}

export function normalizeUsagePayload(
  provider: ProviderName,
  payload: Record<string, unknown>
) {
  if (provider === "openai") {
    return {
      promptTokens: Number(payload.input_tokens ?? 0),
      completionTokens: Number(payload.output_tokens ?? 0),
      totalTokens: Number(payload.total_tokens ?? 0),
    };
  }

  if (provider === "anthropic") {
    const promptTokens = Number(payload.input_tokens ?? 0);
    const completionTokens = Number(payload.output_tokens ?? 0);

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }

  return {
    promptTokens: Number(payload.promptTokenCount ?? 0),
    completionTokens: Number(payload.candidatesTokenCount ?? 0),
    totalTokens: Number(payload.totalTokenCount ?? 0),
  };
}
