import type { ReviewChatRequest } from "./types";

const HISTORY_LIMIT = 8;

interface OpenAiCompatibleResponse {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

export async function requestReviewResponse({
  apiKey,
  baseUrl,
  documentName,
  model,
  selectedExcerpt,
  question,
  history,
}: ReviewChatRequest): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "Enter a compatible API key or set VITE_ANTHROPIC_API_KEY."
    );
  }

  if (!model) {
    throw new Error("Choose a model or set VITE_ANTHROPIC_MODEL.");
  }

  const messages = [
    {
      role: "system" as const,
      content:
        "You are a contract review assistant. Answer only from the selected excerpt. If the excerpt is insufficient, say so plainly and suggest what the user should select next.",
    },
    ...history.slice(-HISTORY_LIMIT).map((message) => ({
      role: message.role,
      content: message.content,
    })),
    {
      role: "user" as const,
      content: [
        `Document: ${documentName}`,
        "Selected excerpt:",
        selectedExcerpt.text,
        "",
        `Question: ${question}`,
      ].join("\n"),
    },
  ];

  let response: Response;
  const endpoint = `${normalizeBaseUrl(baseUrl)}/chat/completions`;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_completion_tokens: 700,
        messages,
      }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Compatible API request failed from the browser. Check the base URL and whether that provider allows your current origin."
      );
    }

    throw error;
  }

  const body = (await response.json()) as OpenAiCompatibleResponse;

  if (!response.ok) {
    throw new Error(
      body.error?.message ??
        "Compatible API request failed. Check the API key, base URL, model, and allowed origin."
    );
  }

  const content = body.choices?.[0]?.message?.content;
  const text =
    typeof content === "string"
      ? content.trim()
      : (content ?? [])
          .filter((item) => item.type === "text" && item.text)
          .map((item) => item.text?.trim())
          .filter(Boolean)
          .join("\n\n");

  if (!text) {
    throw new Error("The compatible API returned an empty reply.");
  }

  return text;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}
